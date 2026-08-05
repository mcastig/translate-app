# translated.io — Translate App

A responsive translation web app built with **React + TypeScript + Vite** and
plain CSS. Translate text between languages, switch translation direction,
listen to the text, and copy it — with real-time, debounced results.

This is an implementation of the [devChallenges.io Translate app](https://devchallenges.io/)
challenge.

![Desktop layout: two translation panels on a space backdrop](./design/Desktop_1350px.jpg)

## Features

- **Default translation** — loads with `Hello, how are you?` translated to French.
- **Real-time translation** — results update as you type, throttled by a 500 ms
  debounce so the API isn't hit on every keystroke. A **Translate** button also
  forces an immediate translation.
- **Character limit** — up to 500 characters, with a live `n/500` counter.
- **Language selection** — Detect Language, English, French, and Spanish.
  The first options show as tabs; the rest live in a dropdown (matching the design).
- **Swap** — exchange the source/target languages _and_ their text in one click.
- **Listen** — read the source and translated text aloud (Web Speech API).
- **Copy** — copy either side to the clipboard with confirmation feedback.
- **Responsive** — two columns on desktop, stacked panels on tablet and mobile.
- **Accessible** — semantic landmarks, labelled controls, visible keyboard focus,
  `aria-live` output, and reduced-motion support.

## Getting started

```bash
npm install
npm run dev          # start the dev server
```

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Vite dev server with HMR                      |
| `npm run build`         | Type-check (`tsc -b`) then production build   |
| `npm run preview`       | Serve the production build                    |
| `npm run lint`          | ESLint                                        |
| `npm run format`        | Format with Prettier                          |
| `npm run format:check`  | Verify formatting                             |
| `npm run test`          | Run the unit tests once                       |
| `npm run test:watch`    | Run tests in watch mode                       |
| `npm run test:coverage` | Run tests with a coverage report (100% gated) |

## Architecture

The UI is composed of small, single-responsibility components. Each lives in its
own folder alongside its test and styles (`Component/Component.tsx`,
`Component.test.tsx`, `Component.css`):

```
src/
├── components/
│   ├── TranslateApp/     # page shell: backdrop, header, translator
│   ├── Header/           # logo + "translated.io" wordmark
│   ├── TranslateForm/    # owns all state; orchestrates translation
│   ├── TextPanel/        # one side of the translator (source or target)
│   ├── LanguageTabs/     # inline language tabs + overflow dropdown
│   └── IconButton/       # reusable accessible icon button
├── hooks/
│   ├── useDebounce.ts    # debounces a value (real-time throttling)
│   ├── useSpeech.ts      # Web Speech API wrapper (text-to-speech)
│   └── useClipboard.ts   # Clipboard API wrapper with "copied" feedback
├── services/
│   └── translate.ts      # the single network boundary (MyMemory API)
├── constants/
│   └── languages.ts      # language list, codes, defaults, limits
├── assets/icons/         # SVG icons + logo (files, never inline SVG)
└── styles/
    └── variables.css     # color + typography design tokens
```

### State & data flow

`TranslateForm` is the only stateful component. It holds the source/target text
and languages, and runs translation through one function (`runTranslation`):

- **Debounced real-time updates** — each input (text, source, target) is passed
  through `useDebounce`. An effect re-translates whenever the debounced values
  settle. Debouncing each input independently means a swap (which changes several
  at once) resolves to a single consistent request rather than firing on stale text.
- **Out-of-order protection** — a request-id ref guards every call, so a slow
  earlier response can never overwrite a newer one.
- **Presentational children** — `TextPanel`, `LanguageTabs`, `IconButton`, and
  `Header` are stateless and driven entirely by props.

### Styling

- **Plain CSS with [BEM](http://getbem.com/)** naming
  (`block__element--modifier`), one stylesheet per component.
- **Design tokens** for every color and type value live as CSS custom properties
  in `styles/variables.css`, derived from the brief's palette and the **DM Sans**
  type scale (16/14 px Bold, 12 px Medium).
- **Responsive** via a single breakpoint at 1024 px (desktop → stacked) and a
  600 px tweak for the mobile hero image.

## Translation API

Translations come from the free, key-less **MyMemory** API:

```
GET https://api.mymemory.translated.net/get?q=<text>&langpair=<source>|<target>
```

> **Note on the brief.** The challenge text references
> `https://mymemory.translated.net/doc/spec.php`. That URL is MyMemory's API
> _documentation_ page, not a translation endpoint — a request to it returns HTML,
> not translations. This app therefore calls the real `api.mymemory.translated.net`
> endpoint above. All network code is isolated in `services/translate.ts`, so
> swapping providers touches one file.

**"Detect Language":** MyMemory's `langpair` has no auto-detect option, so the
auto sentinel resolves to the default source (English) for the request. This is a
documented simplification, not true language detection.

## Testing

- **Vitest + React Testing Library** in a jsdom environment.
- `fetch`, the Web Speech API, and the Clipboard API are mocked.
- Coverage is gated at **100%** (statements, branches, functions, lines) in
  `vite.config.ts`; the suite covers happy paths, API/network errors, the
  non-Error fallback, empty and character-limit boundaries, swapping,
  auto-detect resolution, debounce timing, and stale-response races.

```bash
npm run test:coverage
```

## Tech stack

React 19 · TypeScript · Vite · Plain CSS (BEM) · Vitest · React Testing Library ·
ESLint · Prettier · MyMemory translation API · Web Speech & Clipboard APIs.
