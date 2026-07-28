import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative so the same build works at a domain
// root, under a GitHub Pages subpath (/ICM_Assistant/), and inside the
// Capacitor webview -- no rebuild needed per target.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', sourcemap: false },
});
