import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { targetPage } from '../lib/format.js';

// Bundled worker (no CDN, works offline). The worker and react-pdf's internal
// API MUST be the same pdfjs-dist version, so pdfjs-dist is pinned to the exact
// version react-pdf depends on -- a floating pin resolves to a newer worker and
// pdf.js hard-fails on the version mismatch.
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Self-hosted pdf.js viewer.
 *
 * Chosen over Adobe PDF Embed because Adobe's client ID is locked to the
 * serving origin, which forces re-registration on every host change (Pages,
 * Capacitor's capacitor://localhost, a future custom domain). pdf.js has no
 * such constraint and renders the same in web and app.
 *
 * The backend slices PDFs to just the cited pages, so this usually renders
 * 1-4 pages rather than a full proceedings volume.
 */
export default function PdfViewer({ doc, width }) {
  const [numPages, setNumPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const hostRef = useRef(null);
  const [measured, setMeasured] = useState(0);

  const file = useMemo(() => (doc?.url ? { url: doc.url } : null), [doc?.url]);
  const startPage = targetPage(doc);

  useEffect(() => { setNumPages(0); setFailed(false); }, [doc?.url]);

  // Fit page width to the container (mobile-first: the app shell is narrow).
  useEffect(() => {
    if (!hostRef.current || typeof ResizeObserver === 'undefined') return;
    const el = hostRef.current;
    const ro = new ResizeObserver(() => setMeasured(el.clientWidth));
    ro.observe(el);
    setMeasured(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  if (!doc) return null;
  const pageWidth = width || measured || undefined;

  return (
    <div className="icm-pdf" ref={hostRef}>
      {failed ? (
        <p className="icm-pdf-fallback">
          Unable to display this PDF inline.{' '}
          <a href={doc.url} target="_blank" rel="noreferrer">Open the source document</a>
        </p>
      ) : (
        <Document
          file={file}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => setFailed(true)}
          loading={<div className="icm-pdf-loading" />}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1)
            // Full (unsliced) PDFs deep-link to the cited page; sliced ones start at 1.
            .filter((p) => (numPages > 8 ? p >= startPage && p < startPage + 4 : true))
            .map((p) => (
              <Page
                key={p}
                pageNumber={p}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer
              />
            ))}
        </Document>
      )}
    </div>
  );
}
