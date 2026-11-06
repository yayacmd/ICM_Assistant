import { useCallback, useRef, useState } from 'react';
import { consumeSSE, interpretEvent } from '../lib/sse.js';
import { assignCiteNumbers, isLiteratureKey } from '../lib/citations.js';

/**
 * Owns the whole search lifecycle: abortable request, SSE consumption,
 * streaming answer text, and the sources ledger.
 *
 * Sources arrive BEFORE generation (a perceived-latency win), so `docs`
 * populates while `answer` is still empty -- render the ledger as soon as it
 * exists rather than waiting for the answer.
 *
 * search(query, { previous }) -- `previous` (optional) is the prior question(s)
 * in a follow-up thread; the backend folds it into a standalone question.
 * sendFeedback('up'|'down') posts the ICM record keys shown + the rating
 * (never the question text) to /feedback.
 * `strings` (optional) localizes the rate-limit message.
 */
export function useIcmSearch({ apiBase, lang, strings }) {
  const [status, setStatus] = useState('idle'); // idle | thinking | streaming | done | error
  const [answer, setAnswer] = useState('');
  const [docs, setDocs] = useState([]);
  const [keyToCite, setKeyToCite] = useState(() => new Map());
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    setAnswer('');
    setDocs([]);
    setKeyToCite(new Map());
    setError(null);
    setStatus('idle');
  }, []);

  const search = useCallback(async (queryText, { previous } = {}) => {
    const q = String(queryText || '').trim();
    if (!q) return false;

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setAnswer('');
    setDocs([]);
    setKeyToCite(new Map());
    setError(null);
    setStatus('thinking');

    let streamed = '';
    let gotToken = false;

    try {
      const resp = await fetch(`${apiBase}/search?ts=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'X-User-Lang': lang,
        },
        body: JSON.stringify(previous ? { query: q, previous: String(previous).slice(-500) } : { query: q }),
        signal: ac.signal,
        cache: 'no-store',
        redirect: 'follow',
      });
      if (resp.status === 429) {
        const wait = parseInt(resp.headers.get('Retry-After') || '30', 10) || 30;
        const tpl = strings?.busy || 'Too many requests. Please try again in {s} s.';
        setError(tpl.replace('{s}', String(wait)));
        setStatus('error');
        return false;
      }
      if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

      await consumeSSE(resp.body, (eventType, data) => {
        const action = interpretEvent(eventType, data);
        if (!action) return;
        if (action.kind === 'documents') {
          const { docs: withCites, keyToCite: map } = assignCiteNumbers(action.value);
          setDocs(withCites);
          setKeyToCite(map);
        } else if (action.kind === 'token') {
          if (!gotToken) { gotToken = true; setStatus('streaming'); }
          streamed += action.value;
          setAnswer(streamed);
        } else if (action.kind === 'error') {
          setError(action.value);
        }
      });

      setStatus(ac.signal.aborted ? 'idle' : 'done');
      return true;
    } catch (e) {
      if (e.name === 'AbortError') return false; // superseded by a newer query
      setError(e.message || 'Request failed');
      setStatus('error');
      return false;
    }
  }, [apiBase, lang, strings]);

  const sendFeedback = useCallback(async (rating) => {
    const keys = docs.map((d) => d.key).filter((k) => k && !isLiteratureKey(k));
    try {
      await fetch(`${apiBase}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys, rating }),
      });
    } catch { /* feedback is best-effort */ }
  }, [apiBase, docs]);

  return { status, answer, docs, keyToCite, error, search, reset, sendFeedback };
}
