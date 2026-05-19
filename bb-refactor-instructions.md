## BitBrush-2022 — Modernisation Briefing for Sonnet 4.6

### What This Project Is

BitBrush is a client-side pixel art / sprite editor that runs entirely in the browser using the Canvas API. It has no backend requirements — all drawing, layer management, frame animation, colour picking, and file export happens in-browser. It currently serves via GitHub Pages (confirmed: has\_pages: true), which must remain working throughout.

---

### Current Architecture (as-found)

| File/Dir | Size | Purpose |
| ----- | ----- | ----- |
| index.html | 4.4 KB | Entry point — all scripts loaded as plain \<script\> tags in \<head\> |
| js/main.js | 76 KB | Monolithic core — the single biggest refactor target |
| js/panels/components.js | 49 KB | Custom hand-rolled component/UI framework |
| js/panels/color-panel.js | 27 KB | Colour picker UI panel |
| js/panels/export-menu.js | 19 KB | GIF/PNG/ZIP export logic |
| js/sprite.js | 14 KB | Sprite/layer/frame data model |
| js/tools.js | 16 KB | Drawing tool implementations |
| js/panels/new-menu-panel.js | 10 KB | New document dialog |
| js/panels/layers-panel.js | 10 KB | Layers UI |
| js/panels/frames-panel.js | 14 KB | Frame/animation UI |
| js/panels/tools-panel.js | 7 KB | Tools UI |
| js/panels/history-panel.js | 2.6 KB | Undo/redo panel |
| js/colors.js | 6 KB | Colour utility functions |
| js/header.js | 1 KB | App header/menu rendering |
| js/floodfill.js | 5.2 KB | Flood fill algorithm |
| assets/presets/render-ui.js | — | UI rendering presets (loaded with cache-busting param) |
| assets/presets/tooltips.js | — | Tooltip data |
| assets/presets/swatches.js | — | Colour swatch presets |
| js/animation/, js/filesaver/, js/gif\_encoder/ | — | Vendored third-party libs (rAF polyfill, FileSaver, JSZip, GIFEncoder) |

Key observations:

* No module system — everything is global scope, loaded sequentially via \<script\> tags  
* No build tool, no package.json, no bundler  
* components.js is a custom imperative DOM-construction framework (\~49 KB)  
* main.js at 76 KB is almost certainly doing state management, event binding, canvas rendering, and business logic all mixed together  
* Vendored libraries are raw .js files committed directly  
* Google Tag Manager \+ UA Google Analytics embedded directly in index.html (UA is deprecated)  
* No TypeScript, no linting, no tests  
* Cache-busting done manually via ?v=0.1.5.1 query strings

---

### Goals

1. Migrate to TypeScript with a lightweight framework  
2. Introduce a module/build system (Vite recommended — see below)  
3. Preserve GitHub Pages deployment (static output only — no server required)  
4. Replace the custom component framework (components.js) with typed React or Preact components  
5. Refactor main.js by splitting state, canvas logic, tools, and UI concerns  
6. Replace vendored libs with npm packages where possible  
7. Modernise CSS (currently two flat .css files; migrate to CSS Modules or Tailwind)  
8. Fix deprecated items: UA → GA4, remove obsolete cache-control meta tags

---

### Recommended Stack

| Concern | Choice | Rationale |
| ----- | ----- | ----- |
| Framework | Preact (or React) | Replaces the custom components.js framework; tiny bundle size suits GitHub Pages |
| Language | TypeScript | Catches the class of bugs noted in notes.txt (e.g. ImageData compatibility) |
| Build tool | Vite | Zero-config, fast HMR, outputs static files — perfect for GitHub Pages; vite build → dist/ |
| Hosting | GitHub Pages via gh-pages branch | vite build outputs to dist/; a deploy workflow pushes it — no cost, no server |
| State | Zustand or plain TypeScript stores | Lightweight, no Redux boilerplate; canvas state maps well to a store |
| CSS | CSS Modules (scoped to components) | Drop-in replacement for current flat CSS; no new tooling needed |
| Testing | Vitest | Same config as Vite; unit test canvas utilities and colour math |
| Linting | ESLint \+ Prettier | Enforces consistency |

Cost: £0. Vite builds static files; GitHub Pages hosts them free. No server, no Node runtime in production.

---

### Phased Execution Plan for the Agent

#### Phase 0 — Scaffolding (start here)

1. Initialise package.json, install Vite \+ Preact \+ TypeScript  
2. Create vite.config.ts configured for base: './' (important for GitHub Pages relative paths)  
3. Create tsconfig.json  
4. Create .github/workflows/deploy.yml — on push to main, run vite build and deploy dist/ to gh-pages branch  
5. Add .eslintrc and .prettierrc  
6. Keep the original index.html and js/ intact on main until the new build is verified

#### Phase 1 — Type the data model first (lowest risk, highest value)

1. js/sprite.js → src/model/Sprite.ts — define typed interfaces for Layer, Frame, Sprite  
2. js/colors.js → src/utils/colors.ts — pure functions, easy to unit test  
3. js/floodfill.js → src/utils/floodFill.ts  
4. Write Vitest unit tests for the colour utilities and flood fill

#### Phase 2 — Canvas engine

1. Extract canvas drawing logic from main.js → src/canvas/CanvasEngine.ts  
2. js/tools.js → src/tools/ — one file per tool, implementing a Tool interface  
3. Keep all logic framework-agnostic (no Preact imports in canvas code)

#### Phase 3 — State management

1. Create a Zustand store (or a plain typed event-emitter store): src/store/appStore.ts  
2. Model: current tool, active layer, active frame, colour, history stack, zoom level  
3. Wire the canvas engine to consume from the store

#### Phase 4 — Replace components.js with Preact components

Map the existing panel structure 1:1 initially:

* src/components/panels/ColorPanel.tsx  
* src/components/panels/LayersPanel.tsx  
* src/components/panels/FramesPanel.tsx  
* src/components/panels/ToolsPanel.tsx  
* src/components/panels/HistoryPanel.tsx  
* src/components/panels/ExportMenu.tsx  
* src/components/panels/NewMenuPanel.tsx  
* src/components/AppHeader.tsx  
* src/components/Workspace.tsx (the canvas container)

#### Phase 5 — Replace vendored libraries

| Vendored | npm replacement |
| ----- | ----- |
| filesaver/filesaver.js | file-saver |
| filesaver/jszip.min.js | jszip |
| gif\_encoder/ (GIFEncoder) | gif.js or gifenc |
| animation/requestAnimationFrame.js | Remove — native in all modern browsers |

#### Phase 6 — CSS migration

* Port css/main.css and css/panels.css to CSS Modules per component  
* Keep bitbrushicons.css and materialdesignicons.min.css as-is (global imports in main.tsx)

#### Phase 7 — Cleanup & analytics

* Replace UA (UA-123748040-1) with GA4 tag  
* Remove obsolete \<meta http-equiv="cache-control"\> tags (these do nothing useful for a static SPA; cache-control belongs in server headers)  
* Update \<title\> to use a proper app name; version can come from package.json  
* Fix the OG image URL (http://bitbrush.retrobyte.io/...) to use a relative path or GitHub Pages URL

---

### GitHub Pages Continuity

* Configure Vite: base: './' in vite.config.ts ensures all asset paths are relative (critical for Pages subdirectory hosting like derrideanauthor.github.io/BitBrush-2022/)  
* The deploy.yml workflow pushes the dist/ folder to the gh-pages branch  
* The repo already has Pages enabled — just point it at the gh-pages branch root in Settings → Pages  
* The existing index.html on main continues to work until the workflow is live

---

### Agent Starting Instructions

"Read this entire briefing first. Begin with Phase 0: initialise Vite \+ Preact \+ TypeScript scaffolding in derrideanauthor/BitBrush-2022. Do not delete or modify any existing files in js/, css/, or assets/ yet — all new code goes into a new src/ directory. Create the GitHub Actions deploy workflow so Pages deployment is verified before any refactoring begins. Then proceed to Phase 1."

The critical constraint to reinforce to the agent: the app must remain 100% client-side static output. No API routes, no SSR, no serverless functions. Everything builds to flat HTML/JS/CSS files.  
