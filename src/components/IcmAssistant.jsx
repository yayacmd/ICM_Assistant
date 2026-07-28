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

  const { status, answer, docs, keyToCite, error, search } = useIcmSearch({ apiBase, lang });

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
        onSubmit={() => search(query)}
        disabled={status === 'thinking' || status === 'streaming'}
        strings={strings}
      />

      {status === 'idle' && !answer && !docs.length ? (
        <div className="icm-examples">
          <span className="icm-examples-label">{strings.tryLabel}</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="icm-example"
              onClick={() => { setQuery(ex); search(ex); }}
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
