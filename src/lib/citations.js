/**
 * Citation key handling.
 *
 * Record keys look like 2018-Trauma-T12 / 2025-HipKnee-HK31. The answer model and
 * the translation pass sometimes emit Unicode dashes (U+2011 non-breaking hyphen,
 * en/em dashes) inside these keys, which silently breaks matching. Normalize
 * dashes to ASCII inside keys only -- never touch dashes in prose.
 */

// ICM record keys: 4-digit year, then dash-separated alphanumeric segments.
// Literature keys (recent-literature summary): PMID:<digits>.
export const CITE_RE = /\[\s*([0-9]{4}(?:[-\u2010-\u2015\u2212][A-Za-z0-9]+)+|PMID\s*:\s*\d{4,9})\s*\]/gi;

export const normalizeKey = (key) => {
  const k = String(key || '');
  return /^\s*pmid/i.test(k)
    ? 'PMID:' + k.replace(/\D/g, '')
    : k.replace(/[\u2010-\u2015\u2212]/g, '-');
};

/** Literature (PubMed) entries live in their own ledger tab and aren't ICM records. */
export const isLiteratureKey = (key) => /^PMID:/i.test(String(key || ''));

/**
 * Split answer text into renderable segments so React can render citations as
 * real elements instead of mutating innerHTML after the fact.
 *
 * @param {string} text
 * @param {Map<string, number>} keyToCite
 * @returns {Array<{type:'text',value:string}|{type:'cite',key:string,n:number}>}
 */
export function segmentAnswer(text, keyToCite) {
  const src = String(text || '');
  if (!keyToCite || keyToCite.size === 0) return [{ type: 'text', value: src }];

  const out = [];
  let last = 0;
  const re = new RegExp(CITE_RE.source, CITE_RE.flags);
  let m;
  while ((m = re.exec(src)) !== null) {
    const key = normalizeKey(m[1]);
    const n = keyToCite.get(key);
    if (n == null) continue; // unknown key: leave the literal text in place
    if (m.index > last) out.push({ type: 'text', value: src.slice(last, m.index) });
    out.push({ type: 'cite', key, n });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
  return out.length ? out : [{ type: 'text', value: src }];
}

/**
 * Assign display numbers to sources. Honors the backend's cite_number when
 * present (first-appearance order), otherwise falls back to ledger order.
 */
export function assignCiteNumbers(documents) {
  const docs = Array.isArray(documents) ? documents.slice() : [];
  const keyToCite = new Map();
  let auto = 1;
  for (const d of docs) {
    const n = Number(d?.cite_number);
    const cite = Number.isFinite(n) && n > 0 ? n : auto;
    d._cite = cite;
    auto = Math.max(auto, cite) + 1;
    if (d.key) keyToCite.set(normalizeKey(d.key), cite);
  }
  return { docs, keyToCite };
}

/**
 * Conversation-wide citation numbers: walk the answers in order and number each
 * known key on its first citation. Earlier answers never change, so numbers are
 * stable as the conversation grows; a record cited in answers 1 and 3 keeps one
 * number. Keys not in `known` (no source record) stay unnumbered.
 *
 * @param {string[]} texts  answers, oldest first (the in-flight one last)
 * @param {Set<string>|Map<string,*>} known  keys that have a source record
 * @returns {Map<string, number>}
 */
export function numberCitations(texts, known) {
  const map = new Map();
  const re = new RegExp(CITE_RE.source, CITE_RE.flags);
  for (const text of texts) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(String(text || ''))) !== null) {
      const key = normalizeKey(m[1]);
      if (known.has(key) && !map.has(key)) map.set(key, map.size + 1);
    }
  }
  return map;
}
