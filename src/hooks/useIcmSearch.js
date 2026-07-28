import { useCallback, useRef, useState } from 'react';
import { consumeSSE, interpretEvent } from '../lib/sse.js';
import { assignCiteNumbers } from '../lib/citations.js';

/**
 * Owns the whole search lifecycle: abortable request, SSE consumption,
 * streaming answer text, and the sources ledger.
 *
 * Sources arrive BEFORE generation (a perceived-latency win), so `docs`
 * populates while `answer` is still empty -- render the ledger as soon as it
 * exists rather than waiting for the answer.
 */
export function useIcmSearch({ apiBase, lang }) {
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

  const search = useCallback(async (queryText) => {
    const q = String(queryText || '').trim();
    if (!q) return;

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
        body: JSON.stringify({ query: q }),
        signal: ac.signal,
        cache: 'no-store',
        redirect: 'follow',
      });
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
    } catch (e) {
      if (e.name === 'AbortError') return; // superseded by a newer query
      setError(e.message || 'Request failed');
      setStatus('error');
    }
  }, [apiBase, lang]);

  return { status, answer, docs, keyToCite, error, search, reset };
}
