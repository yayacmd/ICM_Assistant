/**
 * Citation key handling.
 *
 * Record keys look like 2018-Trauma-T12 / 2025-HipKnee-HK31. The answer model and
 * the translation pass sometimes emit Unicode dashes (U+2011 non-breaking hyphen,
 * en/em dashes) inside these keys, which silently breaks matching. Normalize
 * dashes to ASCII inside keys only -- never touch dashes in prose.
 */

// 4-digit year, then one or more dash-separated alphanumeric segments.
export const CITE_RE = /\[\s*([0-9]{4}(?:[-\u2010-\u2015\u2212][A-Za-z0-9]+)+)\s*\]/g;

export const normalizeKey = (key) => String(key || '').replace(/[\u2010-\u2015\u2212]/g, '-');

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
  const re = new RegExp(CITE_RE.source, 'g');
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
