import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULTS } from '../config.js';
import { detectLang, stringsFor, mtNoteFor, examplesFor, RTL_LANGS } from '../lib/i18n.js';
import { normalizeKey } from '../lib/citations.js';
import { useIcmSearch } from '../hooks/useIcmSearch.js';
import SearchBar from './SearchBar.jsx';
import AnswerCard from './AnswerCard.jsx';
import SourcesLedger from './SourcesLedger.jsx';
import '../styles.css';

// pdf.js is ~1.4 MB of worker plus the render layer. Question-only sessions --
// the common case -- should never pay for it, so the viewer is code-split and
// fetched on first citation open. (Mirrors the lazy Adobe SDK load it replaces.)
const PdfViewer = lazy(() => import('./PdfViewer.jsx'));

/**
 * The whole assistant as a single embeddable component.
 *
 * Every environment-specific value is a prop with a sensible default, so the
 * same source builds for the web and drops into the app unchanged:
 *
 *   <IcmAssistant apiBase="https://..." lang="es" theme={{ accent: '#0F172A' }} />
 *
 * Theming is via CSS custom properties -- override tokens rather than forking
 * styles, so a restyle never touches logic.
 */
export default function IcmAssistant({
  apiBase = DEFAULTS.apiBase,
  lang: langProp,
  theme,
  className = '',
}) {
  const lang = useMemo(() => detectLang(langProp), [langProp]);
  const strings = useMemo(() => stringsFor(lang), [lang]);
  const examples = useMemo(() => examplesFor(lang), [lang]);
  const isRtl = RTL_LANGS.has(lang);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const answerRef = useRef(null);

  const { status, answer, docs, keyToCite, error, search, sendFeedback } =
    useIcmSearch({ apiBase, lang, strings });

  // Follow-up thread: questions asked so far. In follow-up mode the next query
  // sends them as `previous` so "what about revision cases?" resolves against
  // the earlier question. Normal questions send nothing extra (no extra LLM call).
  const [thread, setThread] = useState([]);
  const [followMode, setFollowMode] = useState(false);

  const ask = useCallback(async (text, { fresh = false } = {}) => {
    const q = String(text || '').trim();
    if (!q) return;
    const inThread = followMode && !fresh && thread.length > 0;
    setFollowMode(false);
    const ok = await search(q, inThread ? { previous: thread.join(' \u2192 ') } : {});
    if (ok) setThread((t) => (inThread ? t : []).concat(q).slice(-4));
  }, [followMode, thread, search]);

  const startFollowUp = useCallback(() => {
    setFollowMode(true);
    setQuery('');
  }, []);

  const endThread = useCallback(() => {
    setFollowMode(false);
    setThread([]);
  }, []);

  // Auto-open the first source once results land, so the viewer is never blank.
  useEffect(() => {
    if (docs.length) setSelected(docs[0]);
    else setSelected(null);
  }, [docs]);

  const handleCite = useCallback((key) => {
    const target = docs.find((d) => normalizeKey(d.key || '') === key);
    if (target) setSelected(target);
  }, [docs]);

  const handleCopy = useCallback(() => {
    if (!answer) return;
    navigator.clipboard?.writeText(answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [answer]);

  const style = theme
    ? Object.fromEntries(Object.entries(theme).map(([k, v]) => [`--icm-${k}`, v]))
    : undefined;

  return (
    <div
      className={`icm-root ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      lang={lang}
      style={style}
    >
      <header className="icm-header">
        <h1 className="icm-title">ICM Assistant</h1>
        <p className="icm-tagline">{strings.tag}</p>
      </header>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => ask(query)}
        disabled={status === 'thinking' || status === 'streaming'}
        strings={strings}
        autoFocusKey={followMode ? 'follow' : 'base'}
      />

      {followMode && thread.length ? (
        <div className="icm-thread">
          <span>{strings.followingUp}</span>
          <span className="icm-thread-q" dir="auto">{thread[thread.length - 1]}</span>
          <button
            type="button"
            className="icm-thread-end"
            onClick={endThread}
            title={strings.endThread}
            aria-label={strings.endThread}
          >
            &times;
          </button>
        </div>
      ) : null}

      {status === 'idle' && !answer && !docs.length ? (
        <div className="icm-examples">
          <span className="icm-examples-label">{strings.tryLabel}</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="icm-example"
              onClick={() => { setQuery(ex); ask(ex, { fresh: true }); }}
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}

      <div ref={answerRef}>
        <AnswerCard
          answer={answer}
          keyToCite={keyToCite}
          status={status}
          error={error}
          strings={strings}
          mtNote={mtNoteFor(lang)}
          showMtNote={lang !== 'en'}
          onCite={handleCite}
          onCopy={handleCopy}
          copied={copied}
          onFeedback={sendFeedback}
          onFollowUp={startFollowUp}
        />
      </div>

      {docs.length || status === 'done' ? (
        <SourcesLedger
          docs={docs}
          strings={strings}
          activeKey={selected?.key}
          onSelect={setSelected}
        />
      ) : null}

      {selected ? (
        <section className="icm-card icm-viewer">
          <div className="icm-viewer-head">
            <span className="icm-viewer-name">{selected.name || ''}</span>
            <span className="icm-viewer-meeting">{selected.meeting || ''}</span>
          </div>
          <Suspense fallback={<div className="icm-pdf-loading" />}>
            <PdfViewer doc={selected} />
          </Suspense>
        </section>
      ) : null}
    </div>
  );
}
