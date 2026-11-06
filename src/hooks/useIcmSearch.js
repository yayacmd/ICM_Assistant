import { useCallback, useMemo, useRef, useState } from 'react';
import { consumeSSE, interpretEvent } from '../lib/sse.js';
import { assignCiteNumbers, isLiteratureKey, normalizeKey, numberCitations } from '../lib/citations.js';

const docKey = (d) => normalizeKey(d?.key || d?.url || '');
const isLitMeeting = (m) => /^recent literature/i.test(String(m || ''));

/**
 * Owns the whole search lifecycle: abortable request, SSE consumption,
 * streaming answer text, and the sources ledger.
 *
 * Sources arrive BEFORE generation (a perceived-latency win), so `docs`
 * populates while `answer` is still empty -- render the ledger as soon as it
 * exists rather than waiting for the answer.
 *
 * search(query, { previous }) -- `previous` (optional) is the prior question(s)
 * for a one-off follow-up. sendFeedback('up'|'down') posts the ICM record keys
 * shown + the rating (never the question text) to /feedback. `strings`
 * (optional) localizes the rate-limit message.
 *
 * Conversation mode (`conversation: true`): every search after the first
 * continues the conversation. The backend stays stateless -- each answer ends
 * with a `turn` event {q, cited} that is echoed back as `history`; answer text is
 * never re-sent. Citations are numbered once per conversation (first citation
 * wins), and `ledger` holds this answer's records plus everything cited earlier.
 * Off by default so existing callers keep single-question behaviour.
 */
export function useIcmSearch({ apiBase, lang, strings, conversation = false }) {
  const [status, setStatus] = useState('idle'); // idle | thinking | streaming | done | error
  const [answer, setAnswer] = useState('');
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);
  // Conversation state.
  const [turns, setTurns] = useState([]);            // committed: { q, answer, meta }
  const [allDocs, setAllDocs] = useState(() => new Map()); // key -> latest record
  const [currentQ, setCurrentQ] = useState('');
  const [committed, setCommitted] = useState(false); // current answer is turns[last]
  const abortRef = useRef(null);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setAnswer('');
    setDocs([]);
    setError(null);
    setStatus('idle');
    setTurns([]);
    setAllDocs(new Map());
    setCurrentQ('');
    setCommitted(false);
  }, []);

  const search = useCallback(async (queryText, { previous } = {}) => {
    const q = String(queryText || '').trim();
    if (!q) return false;

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setAnswer('');
    setDocs([]);
    setError(null);
    setStatus('thinking');
    setCurrentQ(q);
    setCommitted(false);

    const prior = conversation ? turnsRef.current : [];
    const body = { query: q };
    if (prior.length) {
      body.history = prior.slice(-4).map((t) => t.meta);
      // Legacy field for backends that predate `history`.
      body.previous = prior.slice(-4).map((t) => t.q).join(' → ').slice(-500);
    } else if (previous) {
      body.previous = String(previous).slice(-500);
    }

    let streamed = '';
    let gotToken = false;
    let failed = false;
    let meta = null;

    try {
      const resp = await fetch(`${apiBase}/search?ts=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'X-User-Lang': lang,
        },
        body: JSON.stringify(body),
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
          const list = Array.isArray(action.value) ? action.value : [];
          setDocs(list);
          setAllDocs((prev) => {
            const next = new Map(prev);
            for (const d of list) next.set(docKey(d), d);
            return next;
          });
        } else if (action.kind === 'token') {
          if (!gotToken) { gotToken = true; setStatus('streaming'); }
          streamed += action.value;
          setAnswer(streamed);
        } else if (action.kind === 'turn') {
          meta = action.value;
        } else if (action.kind === 'error') {
          failed = true;
          setError(action.value);
        }
      });

      if (ac.signal.aborted) { setStatus('idle'); return false; }
      setStatus('done');
      if (conversation && gotToken && !failed) {
        setTurns((t) => t.concat({ q, answer: streamed, meta: meta || { q, cited: [] } }));
        setCommitted(true);
      }
      return gotToken && !failed;
    } catch (e) {
      if (e.name === 'AbortError') return false; // superseded by a newer query
      setError(e.message || 'Request failed');
      setStatus('error');
      return false;
    }
  }, [apiBase, lang, strings, conversation]);

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

  // Earlier turns shown above the current answer.
  const thread = useMemo(
    () => (conversation ? (committed ? turns.slice(0, -1) : turns) : []),
    [conversation, committed, turns]
  );

  // Citation numbers: per conversation in conversation mode, per answer otherwise.
  const keyToCite = useMemo(() => {
    if (!conversation) return assignCiteNumbers(docs).keyToCite;
    const texts = thread.map((t) => t.answer).concat(answer);
    return numberCitations(texts, allDocs);
  }, [conversation, thread, answer, allDocs, docs]);

  // Ledger: this answer's records, plus (in conversation mode) everything cited
  // earlier. Cited records carry their number and sort first; literature last.
  const ledger = useMemo(() => {
    let list;
    if (!conversation) {
      list = assignCiteNumbers(docs).docs;
    } else {
      const here = new Set(docs.map(docKey));
      const earlier = [...keyToCite.keys()]
        .filter((k) => !here.has(k) && allDocs.has(k))
        .map((k) => allDocs.get(k));
      list = docs.concat(earlier).map((d) => ({ ...d, _cite: keyToCite.get(docKey(d)) ?? null }));
    }
    const rank = (d) => (d._cite == null ? Infinity : d._cite);
    return list
      .map((d, i) => ({ d, i }))
      .sort((a, b) => (isLitMeeting(a.d.meeting) - isLitMeeting(b.d.meeting))
        || (rank(a.d) - rank(b.d)) || (a.i - b.i))
      .map(({ d }) => d);
  }, [conversation, docs, allDocs, keyToCite]);

  return {
    // `docs` keeps its old shape (numbered records) outside conversation mode.
    status, answer, docs: conversation ? docs : ledger, keyToCite, error, search, reset, sendFeedback,
    // conversation mode
    ledger, thread, turns, currentQ, newConversation: reset,
  };
}
