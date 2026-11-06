import { useEffect, useState } from 'react';
import AnswerText from './AnswerText.jsx';

/**
 * Renders the streamed answer with inline [key] markers replaced by numbered
 * superscript citation links. Done as React segments rather than post-stream
 * innerHTML surgery, so citations stay live while text is still streaming.
 */
export default function AnswerCard({
  answer,
  keyToCite,
  status,
  error,
  strings,
  mtNote,
  showMtNote,
  onCite,
  onCopy,
  copied,
  onFeedback,
}) {
  const thinking = status === 'thinking';
  // One rating per answer; a new answer (thinking) re-arms the buttons.
  const [rated, setRated] = useState(false);
  useEffect(() => { if (thinking) setRated(false); }, [thinking]);
  if (!thinking && !answer && !error) return null;

  return (
    <section className="icm-card icm-answer" aria-live="polite">
      <div className="icm-eyebrow">{strings.eyebrow}</div>

      {thinking && !answer ? (
        <div className="icm-thinking">
          <span className="icm-dots"><i /><i /><i /></span>
          <span>{strings.thinking}</span>
        </div>
      ) : null}

      {error ? <p className="icm-err">{error}</p> : null}

      {answer ? (
        <AnswerText text={answer} keyToCite={keyToCite} onCite={onCite} label={strings.sources} />
      ) : null}

      {showMtNote && answer ? <p className="icm-mt-note">{mtNote}</p> : null}

      {answer && status === 'done' ? (
        <div className="icm-answer-foot">
          <p className="icm-hint">{strings.hint}</p>
          <div className="icm-foot-actions">
            {onFeedback ? (
              <span className="icm-fb">
                {rated ? (
                  <span className="icm-fb-thanks" role="status">{strings.thanks}</span>
                ) : (
                  <>
                    <span className="icm-fb-q">{strings.rateQ}</span>
                    {[['up', '\u{1F44D}', strings.helpful], ['down', '\u{1F44E}', strings.notHelpful]].map(([r, icon, label]) => (
                      <button
                        key={r}
                        type="button"
                        className="icm-ghost-btn icm-fb-btn"
                        title={label}
                        aria-label={label}
                        onClick={() => { setRated(true); onFeedback(r); }}
                      >
                        {icon}
                      </button>
                    ))}
                  </>
                )}
              </span>
            ) : null}
            <button type="button" className="icm-ghost-btn" onClick={onCopy}>
              {copied ? strings.copied : strings.copy}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
