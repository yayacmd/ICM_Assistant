// Public API. Ali imports from here:
//   import { IcmAssistant } from 'icm-assistant';
export { default as IcmAssistant } from './components/IcmAssistant.jsx';
export { useIcmSearch } from './hooks/useIcmSearch.js';
export { consumeSSE, interpretEvent } from './lib/sse.js';
export { segmentAnswer, assignCiteNumbers, normalizeKey } from './lib/citations.js';
export { detectLang, stringsFor, mtNoteFor, STRINGS } from './lib/i18n.js';
export { DEFAULTS } from './config.js';
