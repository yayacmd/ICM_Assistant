import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULTS } from '../config.js';
import { detectLang, stringsFor, mtNoteFor, examplesFor, RTL_LANGS } from '../lib/i18n.js';
import { normalizeKey } from '../lib/citations.js';
import { useIcmSearch } from '../hooks/useIcmSearch.js';
import SearchBar from './SearchBar.jsx';
import AnswerCard from './AnswerCard.jsx';
import AnswerText from './AnswerText.jsx';
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
 *
 * Conversational: every question after the first continues the conversation
 * (the backend resolves "what about revision cases?" from compact history), and
 * references are numbered once per conversation. "New conversation" resets it.
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
  const curQRef = useRef(null);

  const {
    status, answer, docs, ledger, keyToCite, error, search, sendFeedback,
    thread, turns, currentQ, newConversation,
  } = useIcmSearch({ apiBase, lang, strings, conversation: true });

  const inConversation = turns.length > 0 || status !== 'idle';

  const ask = useCallback((text) => {
    const q = String(text || '').trim();
    if (!q) return;
    setQuery('');
    search(q);
  }, [search]);

  const startNewConversation = useCallback(() => {
    newConversation();
    setSelected(null);
    setQuery('');
  }, [newConversation]);

  // Each new answer's records arrive with `docs`: open the first one so the
  // viewer is never blank. (Ledger re-numbering alone doesn't move the viewer.)
  useEffect(() => {
    const first = ledger.find((d) => docs.includes(d) || docs.some((x) => x.key === d.key));
    setSelected(first || null);
  }, [docs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the open record's object current (its number can change mid-stream).
  useEffect(() => {
    if (!selected) return;
    const fresh = ledger.find((d) => d.key === selected.key);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [ledger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bring the new question into view when it is asked.
  useEffect(() => {
    if (status === 'thinking') curQRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [status, currentQ]);

  const handleCite = useCallback((key) => {
    const target = ledger.find((d) => normalizeKey(d.key || '') === key);
    if (target) setSelected(target);
  }, [ledger]);

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

  const searchBar = (
    <SearchBar
      value={query}
      onChange={setQuery}
      onSubmit={() => ask(query)}
      disabled={status === 'thinking' || status === 'streaming'}
      strings={strings}
      placeholder={turns.length ? strings.followPh : strings.ph}
      autoFocusKey={turns.length}
    />
  );

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

      {!inConversation ? searchBar : null}

      {status === 'idle' && !turns.length ? (
        <div className="icm-examples">
          <span className="icm-examples-label">{strings.tryLabel}</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="icm-example"
              onClick={() => ask(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}

      {thread.map((t, i) => (
        <div className="icm-turn" key={i}>
          <div className="icm-qbubble" dir="auto">{t.q}</div>
          <AnswerText
            text={t.answer}
            keyToCite={keyToCite}
            onCite={handleCite}
            label={strings.sources}
            className="icm-card icm-turn-answer icm-answer-text"
          />
        </div>
      ))}

      {currentQ ? <div className="icm-qbubble" dir="auto" ref={curQRef}>{currentQ}</div> : null}

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
      />

      {inConversation ? (
        <>
          <div className="icm-conv-ask">{searchBar}</div>
          {turns.length ? (
            <div className="icm-conv-bar">
              <button type="button" className="icm-link-btn" onClick={startNewConversation}>
                {strings.newConv}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {ledger.length || status === 'done' ? (
        <SourcesLedger
          docs={ledger}
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
