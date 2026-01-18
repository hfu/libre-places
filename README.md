# libre-places — Lightweight Offline Place Logger (MapLibre GL JS + Emoji)

A lightweight, zero-backend web app for marking, labeling, and revisiting meaningful places on a MapLibre GL JS map. This project deliberately renders markers using emoji (no sprite atlas), prioritizing portability and simplicity. It is designed for rapid field capture, privacy, and offline operation—complementing large platforms (uMap, geoBingAn) by serving as a frontline tool that can later elevate datasets to those ecosystems.

- Repository: start at [hfu/libre-places](https://github.com/hfu/libre-places) (may transfer when mature)
- Rendering: Emoji-based markers via DOM (no sprite atlas)
- Data: GeoJSON FeatureCollection (Point features with properties)
- Storage: localStorage (MVP), optional IndexedDB/localForage
- Map engine: MapLibre GL JS (latest stable via Vite + npm)
- Build: Vite (root=src, output=docs), relative assets references (`./assets`), no hashed filenames
- Hosting: GitHub Pages (docs/ on main)
- Commands: Justfile wraps npm dev/build/preview flows
- License: CC0 1.0 (Public Domain Dedication)
- Language policy: English-only in the initial phase (i18n deferred; potential Japanese localization later)

---

## 1) Significance, Respect, and Positioning

This project exists to address frontline, rapid-capture needs:

- Zero setup: instant use, no backend, no auth
- Private local data: device-only storage by default
- Offline-first: PWA enables use without connectivity
- Small, hackable codebase: rapid iteration, education

Respect and Complementarity
- We explicitly respect and acknowledge [uMap](https://umap.openstreetmap.fr/) and [geoBingAn](https://github.com/ndarbas/geoBingAn). They are feature-rich platforms for collaboration, analysis, and publication.
- This project does not compete with them; it complements them as a lightweight “frontline” capture tool. Data can later be elevated/migrated to those ecosystems.

Inspiration
- This initiative is inspired by fieldwork reflections shared here: [OSM Diary by rphyrin](https://www.openstreetmap.org/user/rphyrin/diary/408086). We extend sincere respect and appreciation to the author and the broader OSM community.

---

## 2) Goals and Non-Goals

Goals
- Lightweight SPA with minimal dependencies
- Offline-first via PWA
- Privacy by local storage
- Data portability via standard GeoJSON
- Extensible via optional connectors (Gist/WebDAV/API)
- Clear, documented tech choices and behavior
- Consistent emoji rendering without sprite atlases
- GitHub Releases aligned to roadmap milestones

Non-Goals (core)
- Multi-user permissions or server-side accounts
- Heavy analytics or multi-layer compositions
- Sprite atlas icon management
- Replacing uMap/geoBingAn (we integrate)

---

## 3) Emoji-Only Rendering (No Sprite)

Decision: Use emoji for marker icons consistently, without sprite atlases.

Rationale
- Simplicity: Avoids sprite build pipelines and asset management
- Portability: Emoji is widely available on modern platforms
- Offline: No need to fetch or manage sprite assets

Compatibility Notes
- Emoji rendering varies by OS/Browser/font; color emoji support is not uniform
- We use DOM-based markers (`new maplibregl.Marker({ element })`) to leverage browser text rendering, which better supports color emoji than SDF glyphs
- Performance: DOM markers are less performant than symbol layers for very large datasets; we document practical limits and may provide optional fallback modes later

---

## 4) Technical Choices

- Map engine: [MapLibre GL JS](https://maplibre.org/)
- Rendering: DOM Markers with emoji + label (no sprite atlas)
- Data model: GeoJSON FeatureCollection
  - Properties: `id`, `label`, `emoji`, `category?`, `timestamp?`
- Basemap: [Protomaps Basemap](https://protomaps.com/)
  - Tile URL: `https://tunnel.optgeo.org/martin/protomaps-basemap` (tile.json)
  - Style: Standard Protomaps style (optimized for web)
  - Lightweight, efficient vector tiles suitable for offline and mobile use
- Terrain (optional layer):
  - [Mapterhorn Terrarium Tiles](https://mapterhorn.org/)
  - URL: `https://tunnel.optgeo.org/martin/mapterhorn`
  - Format: 512×512 WebP Terrarium tiles for elevation representation
- UI Controls:
  - `NavigationControl` (zoom, compass)
  - `ScaleControl` (distance reference)
  - [maplibre-gl-layer-control](https://github.com/opengeos/maplibre-gl-layer-control) for layer toggling
  - Controls positioned per MapLibre GL JS defaults (primarily top-right)
  - Map state via URL fragment: `hash: 'map'` (center, zoom, bearing, pitch)
- Storage:
  - MVP: `localStorage` with versioned key `mlgl:places:v1`
  - Optional: IndexedDB via localForage
- Offline: PWA (manifest + service worker)
- Build/Dev: Vite
  - Root: `src/`
  - Output: `docs/` (static site for GitHub Pages)
  - Base: `./` (relative paths)
  - Asset filenames: no hashes (stable `./assets/...` references)
- Static preview: `budo -d docs` (no Python HTTP server)
- Commands: Justfile wraps `npm run dev`, `npm run build`, `npm run preview`, etc.
- Hosting: GitHub Pages (Source: main branch / docs folder)
- Language: English-only in the initial phase; i18n deferred (Japanese priority later)

---

## 5) Using the Latest MapLibre GL JS via Vite

Version Policy
- Use the latest stable MapLibre GL JS via npm and bundle it with Vite.
- Install: `npm i maplibre-gl@latest` (pinned appropriately in `package.json`).
- Upgrades:
  - Periodically run `npm outdated` and `npm update` to adopt new stable releases.
  - Verify changes against MapLibre release notes before tagging a new project release.

Import Pattern (ESM)
```ts
// src/main.ts
import maplibregl from 'maplibre-gl';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [106.816666, -6.200000],
  zoom: 12
});
```

Build Integration
- Vite consumes ESM from `node_modules`, producing a static site in `docs/` with `./assets` references and no hashed filenames.

---

## 6) Architecture Overview

Core
- MapController
  - Initialize MapLibre, manage DOM markers
  - Context menu → Add place; Click marker → Edit/Delete
- Store
  - Persist FeatureCollection to localStorage (MVP)
  - Optional adapter for localForage (IndexedDB)
- DataModel
  - Schema validation and normalization; id generation
- UIController
  - Toolbar (Export/Import/Clear), modals for edit/add
- Connectors (optional plugins)
  - Gist/WebDAV/Custom API for push/pull

Flow
1. User adds/edits/deletes place (emoji + label).
2. DataModel validates and assigns `id`.
3. Store writes FeatureCollection.
4. MapController re-renders markers.
5. Export/Import interacts with Store.

---

## 7) Data Model (GeoJSON)

Example FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "1768198403858",
        "label": "My Favorite Cafe",
        "emoji": "📍",
        "category": "default",
        "timestamp": "2026-01-18T10:41:00Z"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [106.816666, -6.200000]
      }
    }
  ]
}
```

Properties
- `id`: string (unique, e.g., `Date.now()` as base)
- `label`: string (required)
- `emoji`: string (optional, default "📍")
- `category`: string (optional)
- `timestamp`: ISO 8601 (optional)

Versioning
- Storage key: `mlgl:places:v1`
- Migrations provided if schema changes (e.g., v2)

---

## 8) Vite Build and Assets Policy

Requirements
- Root is `src/`; output is `docs/`
- Relative base (`./`) to support GitHub Pages “docs” hosting
- No hashed filenames in output
- References to assets use `./assets/...` (not `/assets`)

Guideline `vite.config.ts`:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  server: { open: true }
});
```

Asset Placement and Referencing
- Place static files under `src/assets/`
- Vite emits to `docs/assets/`
- In HTML/JS/CSS, reference assets using `./assets/...` so pages work under GitHub Pages with base `./`

---

## 9) Repository Layout (with Vite)

```
/
├─ src/                      # Project root for Vite
│  ├─ index.html             # App entry
│  ├─ main.ts                # App bootstrap
│  ├─ css/
│  │  └─ style.css
│  ├─ assets/                # Static assets (refer via ./assets)
│  └─ js/
│     ├─ map.ts              # MapLibre setup + DOM markers
│     ├─ store.ts            # localStorage (+ optional localForage)
│     ├─ dataModel.ts        # Schema validation/normalization
│     ├─ ui.ts               # Toolbar + modals
│     └─ connectors/         # Optional sync plugins
├─ docs/                     # Build output for GitHub Pages (committed)
├─ Justfile                  # Wrap npm dev/build/preview commands
├─ vite.config.ts            # As above (root=src, outDir=../docs)
├─ manifest.json             # PWA manifest
├─ sw.ts                     # Service worker source (bundled via Vite)
├─ .gitignore                # Ignore node_modules, intermediates; keep docs/
├─ .github/
│  ├─ workflows/             # CI (lint/tests, release builds)
│  └─ copilot-instructions.md# Guidance for Copilot assistants
├─ README.md                 # This document
├─ LICENSE                   # CC0 1.0 (Public Domain Dedication)
└─ package.json              # Scripts used by Justfile
```

Notes
- `docs/` is committed for GitHub Pages (Source: main / docs)
- Avoid other build artifacts in repository
- Ensure all emitted asset paths are `./assets/...`

---

## 10) Justfile (Command Wrapper)

Intent
- Provide stable, discoverable developer commands
- Wrap npm scripts and guard environment assumptions

Guideline Justfile:
```make
# Justfile

set shell := ["bash", "-cu"]

default: deps

deps:
    npm ci

dev:
    npm run dev

build:
    npm run build

preview:
    npm run preview

lint:
    npm run lint

format:
    npm run format

release VERSION:
    # Tag, build, and create a GitHub release
    git tag {{VERSION}}
    git push origin {{VERSION}}
    npm run build
    # Release notes are managed via GitHub UI or CHANGELOG
```

Guideline package scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "lint": "eslint --ext .ts,.js src",
    "format": "prettier --write ."
  }
}
```

---

## 11) .gitignore Policy

Keep `docs/` tracked; avoid extra artifacts:

```gitignore
# Node / tooling
node_modules/
npm-debug.log*
yarn.lock
pnpm-lock.yaml

# Vite intermediates
dist/
.vite/

# OS junk
.DS_Store
Thumbs.db

# Build output is docs/ — keep it tracked for GitHub Pages
tmp/
```

---

## 12) UI/UX Behavior

Interactions
- Right-click (contextmenu) to add place (emoji + label)
- Click marker (DOM) to edit/delete
- Toolbar:
  - Export JSON (download `places.json`)
  - Import JSON (validate FeatureCollection)
  - Clear All (confirm, then remove storage)

Rendering
- DOM Markers: emoji element + label element stacked
- CSS: text halo/shadow for legibility

Accessibility
- Keyboard access for toolbar and modals
- Clear prompts and confirmations

---

## 13) Storage Specification

- Key: `mlgl:places:v1` (localStorage)
- Value: FeatureCollection JSON
- Import/Export: Strict validation (type/features), normalization of properties, default emoji

Optional: IndexedDB
- localForage for larger datasets and reliability
- Compatible schema

Backup/Export
- Pretty-printed JSON file
- Optional scheduled backup prompts

---

## 14) Integration Strategy (Elevate Flow)

- Export GeoJSON compatible with uMap/geoBingAn imports
- Optional connectors (future):
  - GitHub Gist: OAuth flow, push/pull `places.json`
  - WebDAV/S3: PUT/GET with auth
- Preserve properties; document compatibility notes

---

## 15) Roadmap and GitHub Releases

Release Strategy
- Each roadmap milestone is published as a GitHub Release (tags: `v0.1.0`, `v0.2.0`, etc.).
- Release notes summarize changes, compatibility, and upgrade guidance.
- CI can build the site to `docs/` on `main`; releases are tagged from `main` after verification.

Roadmap

v0.1 (MVP, GitHub Release: v0.1.0)
- MapLibre GL (latest stable via npm) + DOM Markers (emoji + label)
- Add/Edit/Delete interactions
- localStorage persistence
- Export/Import JSON
- PWA baseline (manifest + service worker)
- Vite build to `docs/` with `./assets` (no hashed filenames)
- Justfile wraps dev/build/preview
- CC0 License, lint/format

v0.2 (GitHub Release: v0.2.0)
- Optional IndexedDB/localForage storage
- Modal UI (replacing prompt), validation improvements
- Categories with CSS styling
- Auto-backup prompts after N edits
- Undo/Redo (local history)

v0.3 (GitHub Release: v0.3.0)
- Gist/WebDAV connector plugins
- “Elevate to uMap/geoBingAn” helpers
- Search, tag filters, timestamps
- LineString support (basic tracing)

v0.4+ (Subsequent Releases)
- Optional encryption for export
- Reverse geocoding hints
- Advanced theming
- Connector SDK and documentation

Versioning
- Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
- Dependency updates (MapLibre GL JS): adopt latest stable; bump MINOR or PATCH as appropriate

---

## 16) Risks and Mitigations

- Emoji compatibility varies:
  - Use DOM Markers for better emoji rendering across platforms
  - Document recommended system fonts; provide CSS fallbacks
- localStorage capacity and reliability:
  - Offer IndexedDB option; encourage frequent exports
- Offline tiles/cache constraints:
  - Document usage limits; consider tile cache heuristics
- Performance with many points:
  - DOM Markers are less performant than symbol layers; document practical limits and offer future fallback modes

---

## 17) License (CC0 1.0)

This project is dedicated to the public domain under [Creative Commons Zero v1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

- You can copy, modify, distribute, and perform the work, even for commercial purposes, without asking permission.
- Please respect third-party licenses of dependencies:
  - MapLibre GL JS (BSD-3-Clause) — see the MapLibre project’s license notices
  - Vite (MIT) and other tooling — follow their respective licenses

We also encourage ethical attribution and community respect even when not legally required under CC0.

---

## 18) Open Source Conduct and Acknowledgments

- Respect and gratitude to [uMap](https://umap.openstreetmap.fr/) and [geoBingAn](https://github.com/ndarbas/geoBingAn) — this project complements their ecosystems.
- Inspiration acknowledged: [OSM Diary by rphyrin](https://www.openstreetmap.org/user/rphyrin/diary/408086).
- Good OSS practices:
  - Clear licensing (CC0 1.0)
  - Contribution guidelines (PRs with tests/lint, small focus)
  - Proper attribution to dependencies and inspirations
  - Avoid committing unnecessary artifacts (keep only `docs/` build for Pages)

Community Notes
- We are not affiliated with uMap or geoBingAn; we admire their work.
- Contributions should be respectful, constructive, and consistent with the goals and non-goals defined above.

---

## 19) Getting Started (Dev)

Prerequisites
- Node.js LTS
- `just` command (optional for convenience)

Setup
- `npm ci`
- `just dev` (or `npm run dev`)
- Open `http://localhost:5173` (default Vite dev port)

Build
- `just build` (or `npm run build`)
- Commit `docs/` and push to `main`
- Enable GitHub Pages (main/docs)

---

## 20) DWG-7 Strategy Summary

- Repository name: libre-places (initially at hfu/libre-places; may transfer when mature)
- Emoji-only, sprite-free markers via DOM for simplicity and portability
- Offline-first with local storage and PWA
- Data portability via GeoJSON
- Modular build with Vite, predictable asset paths (`./assets`) for GitHub Pages
- Clear elevation path to larger platforms, keeping the core lightweight
- GitHub Releases aligned to roadmap milestones, using latest stable MapLibre GL JS via Vite

This README encodes the implementation decisions for Copilot-driven development. Begin with the repository layout, Vite configuration, DOM marker rendering, and storage logic. Iterate on UI and integrations per the roadmap, and publish milestone releases on GitHub.
