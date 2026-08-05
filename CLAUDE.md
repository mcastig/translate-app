# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`translate-app` ("translated.io") is a React 19 + TypeScript + Vite translation app
(the devChallenges.io Translate challenge). It translates text between languages
with real-time debounced results, language swap, text-to-speech, and copy-to-clipboard.
See `README.md` for the full feature and architecture write-up.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build; fails on any type error
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier write / verify
- `npm run test` — run the Vitest suite once
- `npm run test:watch` — Vitest watch mode
- `npm run test:coverage` — tests + coverage (gated at 100% in `vite.config.ts`)

Run a single test file: `npx vitest run src/components/TranslateForm/TranslateForm.test.tsx`

## Architecture notes

- **State lives in one place.** `TranslateForm` owns all translator state and runs
  translation through a single `runTranslation` function. Every other component
  (`TextPanel`, `LanguageTabs`, `IconButton`, `Header`) is stateless and prop-driven.
- **Real-time translation** uses `useDebounce` on each input (text/source/target)
  feeding an effect. A request-id ref guards against out-of-order responses. The
  effect intentionally relaxes `react-hooks/set-state-in-effect` (it synchronizes
  with the translation API on dependency change) — see the inline comment.
- **Single network boundary.** All translation HTTP lives in `services/translate.ts`.
  It calls the real MyMemory endpoint (`api.mymemory.translated.net/get`), not the
  `doc/spec.php` docs URL the challenge brief names. "Detect Language" resolves to
  the default source since MyMemory has no auto-detect.
- **Component layout:** each component is a folder with `Component.tsx`,
  `Component.test.tsx`, and `Component.css` (BEM naming).
- **Design tokens** (colors, DM Sans type scale) are CSS custom properties in
  `src/styles/variables.css`. Icons are SVG files in `src/assets/icons/` — never
  inline SVG in components.
- **Browser APIs** (`speechSynthesis`, `navigator.clipboard`) are wrapped in
  `useSpeech` / `useClipboard` and mocked in tests.
- **TypeScript project references:** `tsconfig.json` delegates to `tsconfig.app.json`
  (`src`) and `tsconfig.node.json` (Vite config). `erasableSyntaxOnly` is on, so
  no enum/parameter-property/namespace syntax. Add new source paths to the right sub-config.
- **Testing:** Vitest + React Testing Library (jsdom), setup in `src/test/setup.ts`.
  Coverage threshold is 100% — new code needs matching tests to keep `build`/CI green.
