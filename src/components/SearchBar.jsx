import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, onSubmit, disabled, strings }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="icm-searchbar">
      <textarea
        ref={ref}
        className="icm-input"
        rows={2}
        value={value}
        placeholder={strings.ph}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); }
        }}
      />
      <div className="icm-search-actions">
        {value ? (
          <button type="button" className="icm-ghost-btn" onClick={() => onChange('')}>
            {strings.clear}
          </button>
        ) : null}
        <button
          type="button"
          className="icm-primary-btn"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
        >
          {strings.ask}
        </button>
      </div>
    </div>
  );
}
