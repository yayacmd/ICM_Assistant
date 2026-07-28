# ICM Assistant — React frontend

Multilingual clinical Q&A over the International Consensus Meeting proceedings.
The backend (hybrid retrieval, citation validation, translation) does the real
work; this is a thin, replaceable client.

One codebase, two targets: the standalone web build (GitHub Pages) and the
in-app component (Next.js static export + Capacitor). Don't fork it — build it
twice.

## Use as a component

```jsx
import { IcmAssistant } from 'icm-assistant';

<IcmAssistant
  apiBase="https://chatbot-production-3924.up.railway.app"
  lang="es"                       // omit to follow the device locale
  theme={{ accent: '#0F172A' }}   // maps to --icm-accent
/>
```

### Props

| prop | default | notes |
|---|---|---|
| `apiBase` | `VITE_API_BASE` or Railway | FastAPI backend origin; prop overrides env |
| `lang` | device locale | `en es fr de pt it ar zh`; sets `dir="rtl"` for Arabic |
| `theme` | ICM blue | object of token overrides, `{accent}` -> `--icm-accent` |
| `className` | `''` | extra class on the root |

### Backend URL

Resolved in priority order: the `apiBase` prop, then the `VITE_API_BASE` build-time
env var (copy `.env.example` to `.env`), then the built-in Railway default. Set the
env var when the backend moves (custom domain, staging, self-hosted) so nobody has
to edit source.

## Theming

**Drops into this app and auto-matches -- no config needed.** Each `--icm-*`
token consumes the host app's CSS variable when present and falls back to the ICM
palette when it isn't. So inside the app it inherits the app's colors, radius,
fonts, and **light/dark mode automatically**; served standalone (GitHub Pages),
the app variables don't exist, so it renders in ICM blue.

| ICM token | consumes | ICM fallback |
|---|---|---|
| `--icm-accent` | `--primary` | `#1B4FA0` |
| `--icm-on-accent` | `--primary-foreground` | `#FFFFFF` |
| `--icm-accent-dark` | `--primary` | `#0E2F63` |
| `--icm-wash` | `--muted` | `#EEF3FB` |
| `--icm-ink` | `--foreground` | `#16202B` |
| `--icm-muted` | `--muted-foreground` | `#6B7785` |
| `--icm-surface` | `--card` | `#FFFFFF` |
| `--icm-page` | `--background` | `#FAFBFC` |
| `--icm-line` | `--border` | `#E1E8F0` |
| `--icm-danger` | `--destructive` | `#B3261E` |
| `--icm-radius` | `--radius` | `10px` |
| `--icm-font` | `--font-geist-sans` | IBM Plex Sans stack |
| `--icm-font-serif` | `--font-serif` | Source Serif 4 stack |

`--icm-on-accent` is the text color used on accent-colored surfaces (the Ask
button, citation chips, active tabs). It's paired with `--primary-foreground` so
text stays legible when the app's `--primary` flips to a light color in dark mode.

The token names above are this app's (shadcn-style) variables. A host using
different names simply gets the ICM fallbacks; override any token with the
`theme` prop to force a value. Global styles otherwise do **not** bleed in --
only the specifically-named variables above are consumed.

### Theming for app integration

**Match the app by passing your design tokens through the `theme` prop -- do not
edit the `.icm-*` classes.**

```jsx
<IcmAssistant
  theme={{
    accent: '#0F172A',        // -> --icm-accent
    'accent-dark': '#0B1220', // -> --icm-accent-dark  (quote hyphenated keys)
    wash: '#F1F5F9',
    ink: '#0F172A',
    radius: '12px',
    font: 'Inter, system-ui, sans-serif',
  }}
/>
```

Each key maps to `--icm-{key}` and is applied inline on the root, so it wins over
the stylesheet. This is the intended integration point, and it matters for
maintenance: the `theme` prop **survives component updates**, whereas edits to the
`.icm-*` classes get overwritten the next time this package is updated. Same
single-codebase discipline as the rest of the project -- configure it from the
outside, don't fork it.

One thing that *does* inherit: `--icm-font` is only a default, so if your app sets
a font high up, the component picks it up unless you pass `theme.font`. Usually
what you want (the assistant matches the app's typeface).

## Build

```bash
npm install
npm run dev      # local dev server
npm run build    # -> dist/
```

`base: './'` keeps asset paths relative, so one build works at a domain root,
under a Pages subpath (`/ICM_Assistant/`), and inside the Capacitor webview.

## Notes for app integration

**PDF rendering uses self-hosted pdf.js, not Adobe.** Adobe PDF Embed's client
ID is locked to the serving origin, which forces re-registration on every host
change (Pages -> `capacitor://localhost` -> a future custom domain). pdf.js has
no domain restriction and renders identically in web and app. No credential to
manage.

**The viewer is code-split.** pdf.js is ~1.4 MB of worker plus render layer;
it's fetched on first citation open, so question-only sessions never pay for it.
Initial bundle is ~53 kB gzipped.

**Backend CORS must allow the app origin.** `/search`, the SSE stream, and the
`/pdf` proxy are all called cross-origin from the webview. Send me the final
origin and I'll allow it.

**Next.js:** render inside a client component (`'use client'`) — the streaming
and pdf.js both need the browser.

## Architecture

```
src/
  lib/sse.js          SSE parsing — framework-agnostic, mirrors the backend contract
  lib/citations.js    key normalization + answer segmentation
  lib/i18n.js         8-language UI strings
  lib/format.js       grouping, safe names, page targeting
  hooks/useIcmSearch  request lifecycle, abort, streaming state
  components/         SearchBar, AnswerCard, SourcesLedger, PdfViewer, IcmAssistant
```

The backend's SSE contract is stable and must be preserved:
`documents` (emitted **before** generation), `token`, `error`.

`npm run smoke` equivalent: `node smoke.mjs` — covers SSE chunk splitting,
citation numbering, Unicode-dash keys, and unknown-key handling.
