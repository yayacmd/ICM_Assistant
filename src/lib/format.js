export const groupBy = (arr, key) =>
  (arr || []).reduce((acc, item) => {
    const k = (item?.[key] ?? 'Uncategorized').toString();
    (acc[k] ||= []).push(item);
    return acc;
  }, {});

/** Prefer the record's name; fall back to the PDF filename; never render "undefined". */
export const safeName = (doc) => {
  if (doc?.name && String(doc.name).trim()) return String(doc.name);
  try {
    const u = new URL(doc.url);
    const leaf = decodeURIComponent(u.pathname.split('/').pop() || '').replace(/\+/g, ' ');
    return leaf || 'Document';
  } catch {
    return 'Document';
  }
};

/** Sliced PDFs open at page 1; full PDFs deep-link to the record's page. */
export const targetPage = (doc) => {
  const want = doc?.view_page ?? doc?.page;
  const n = Number(want);
  return Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
};
