// Standalone web entry (GitHub Pages build). The app build imports
// <IcmAssistant /> directly instead of using this file.
import React from 'react';
import { createRoot } from 'react-dom/client';
import IcmAssistant from './components/IcmAssistant.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IcmAssistant />
  </React.StrictMode>
);
