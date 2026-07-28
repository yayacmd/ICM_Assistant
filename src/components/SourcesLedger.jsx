import { useEffect, useMemo, useState } from 'react';
import { groupBy, safeName } from '../lib/format.js';

/**
 * Sources ledger: meeting tabs -> section chips -> numbered records.
 * Evidence level and delegate agreement render on their own line so long
 * vote strings can never collide with the record title.
 */
export default function SourcesLedger({ docs, strings, activeKey, onSelect }) {
  const byMeeting = useMemo(() => groupBy(docs, 'meeting'), [docs]);
  const meetings = useMemo(() => Object.keys(byMeeting), [byMeeting]);
  const [meeting, setMeeting] = useState(meetings[0] || null);

  const sections = useMemo(
    () => groupBy(byMeeting[meeting] || [], 'meeting_section'),
    [byMeeting, meeting]
  );
  const sectionKeys = useMemo(() => Object.keys(sections), [sections]);
  const [section, setSection] = useState(sectionKeys[0] || null);

  // Reset drill-down whenever a new result set arrives.
  useEffect(() => { setMeeting(meetings[0] || null); }, [meetings.join('|')]);
  useEffect(() => { setSection(sectionKeys[0] || null); }, [sectionKeys.join('|')]);

  if (!docs.length) {
    return (
      <section className="icm-card">
        <h2 className="icm-sources-title">{strings.sources}</h2>
        <p className="icm-empty">{strings.none}</p>
      </section>
    );
  }

  const rows = sections[section] || [];

  return (
    <section className="icm-card">
      <h2 className="icm-sources-title">{strings.sources}</h2>

      {meetings.length > 1 ? (
        <div className="icm-tabs" role="tablist">
          {meetings.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={m === meeting}
              className={`icm-tab${m === meeting ? ' is-active' : ''}`}
              onClick={() => setMeeting(m)}
            >
              {m || 'Uncategorized'}
            </button>
          ))}
        </div>
      ) : null}

      {sectionKeys.length > 1 ? (
        <div className="icm-chips">
          {sectionKeys.map((s) => (
            <button
              key={s}
              className={`icm-chip${s === section ? ' is-active' : ''}`}
              onClick={() => setSection(s)}
            >
              {s || 'General'}
            </button>
          ))}
        </div>
      ) : null}

      <div className="icm-ledger">
        {rows.map((doc) => {
          const loe = (doc.loe || '').trim();
          const vote = (doc.vote || '').trim();
          const isActive = doc.key && doc.key === activeKey;
          return (
            <button
              key={doc.key || `${doc.url}-${doc._cite}`}
              className={`icm-row${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(doc)}
            >
              <span className="icm-cite-no">{doc._cite}</span>
              <span className="icm-row-main">
                <span className="icm-row-name">{safeName(doc)}</span>
                {loe || vote ? (
                  <span className="icm-row-meta">
                    {loe ? <span className="icm-loe" title={strings.loeLabel}>{loe}</span> : null}
                    {loe && vote ? <span className="icm-sep">&middot;</span> : null}
                    {vote ? <span className="icm-vote" title={strings.voteLabel}>{vote}</span> : null}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
