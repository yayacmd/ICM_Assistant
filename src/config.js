/**
 * Defaults only. Resolution order for the backend URL:
 *   1. `apiBase` prop on <IcmAssistant />        (highest priority)
 *   2. VITE_API_BASE env var (.env at build time) (deployment config)
 *   3. the Railway fallback below                 (last resort)
 *
 * So the backend can move -- custom domain, staging, a self-hosted instance --
 * by setting an env var or passing a prop, without editing source.
 */

// import.meta.env is populated by Vite at build time. Guard it so the module
// is still importable in plain Node (tests) where import.meta.env is undefined.
const ENV =
  (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const DEFAULTS = {
  // FastAPI service (hybrid retrieval + answer generation + citation validation)
  apiBase: ENV.VITE_API_BASE || 'https://chatbot-production-3924.up.railway.app',
};
