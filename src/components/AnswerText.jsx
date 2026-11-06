import { segmentAnswer } from '../lib/citations.js';

/** Answer text with inline [key] markers rendered as numbered citation buttons. */
export default function AnswerText({ text, keyToCite, onCite, label = 'Source', className = 'icm-answer-text' }) {
  const segments = segmentAnswer(text, keyToCite);
  return (
    <div className={className} dir="auto">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <button
            key={i}
            type="button"
            className="icm-cite"
            onClick={() => onCite(seg.key)}
            aria-label={`${label} ${seg.n}`}
          >
            {seg.n}
          </button>
        )
      )}
    </div>
  );
}
