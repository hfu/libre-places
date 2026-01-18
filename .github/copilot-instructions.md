# Copilot Instructions for libre-places

This document provides guidance for Copilot-assisted development of the libre-places project.

## Project Overview

**libre-places** is a lightweight, offline-first web app for marking, labeling, and revisiting meaningful places on a MapLibre GL JS map using emoji-based markers. The project is designed for rapid field capture, privacy, and portability.

- **Repository**: [hfu/libre-places](https://github.com/hfu/libre-places)
- **License**: CC0 1.0 (Public Domain Dedication)
- **Target Environment**: macOS with zsh (and Node.js LTS)

---

## Technology Stack

### Core
- **Map Engine**: MapLibre GL JS (latest stable via npm)
- **Basemap**: Protomaps Basemap (`https://tunnel.optgeo.org/martin/protomaps-basemap`)
- **Terrain**: Mapterhorn Terrarium Tiles (512×512 WebP, `https://tunnel.optgeo.org/martin/mapterhorn`)
- **Build Tool**: Vite (root: `src/`, output: `docs/`)
- **Package Manager**: npm
- **Commands**: Justfile wraps npm scripts
- **Hosting**: GitHub Pages (main / docs/)

### UI Controls
- `NavigationControl` (zoom, compass)
- `ScaleControl` (distance reference)
- [`maplibre-gl-layer-control`](https://github.com/opengeos/maplibre-gl-layer-control) for layer toggling
- Controls positioned per MapLibre GL JS defaults (primarily top-right)
- URL fragment state management: `hash: 'map'` (auto-syncs center, zoom, bearing, pitch)

### Data & Storage
- **Format**: GeoJSON FeatureCollection (Point features)
- **MVP Storage**: `localStorage` with versioned key `mlgl:places:v1`
- **Optional**: IndexedDB via localForage
- **Properties**: `id`, `label`, `emoji`, `category?`, `timestamp?`

### Rendering
- DOM Markers with emoji + label (no sprite atlas)
- Emoji rendering via browser text rendering for better cross-platform support

### Build & Assets
- Vite configuration:
  - Root: `src/`
  - Output: `docs/` (committed for GitHub Pages)
  - Base: `./` (relative, for GitHub Pages base path)
  - Asset filenames: no hashes (stable `./assets/...` references)
  - Build output: entry, chunk, and asset filenames without content hashes
- Static assets placed in `src/assets/`, emitted to `docs/assets/`

---

## Architecture

### High-Level Flow
1. User right-clicks map → add place (emoji + label)
2. Context menu or click handler → edit/delete place
3. DataModel validates and assigns unique `id`
4. Store persists FeatureCollection to `localStorage`
5. MapController re-renders DOM Markers

### Core Modules
- **MapController**: Initialize MapLibre, manage DOM markers, attach event listeners
- **Store**: Persist/retrieve FeatureCollection from localStorage (or IndexedDB)
- **DataModel**: Schema validation, normalization, id generation
- **UIController**: Toolbar (Export/Import/Clear), modals for add/edit/delete
- **Connectors** (optional, v0.3+): Gist/WebDAV/API plugins for sync

---

## File Structure

```
/
├─ src/                      # Vite root
│  ├─ index.html             # App entry point
│  ├─ main.ts                # Bootstrap (initialize MapController, etc.)
│  ├─ css/
│  │  └─ style.css           # Styling (controls, markers, modals)
│  ├─ assets/                # Static assets (favicons, images, etc.)
│  │  └─ favicon.ico
│  └─ js/
│     ├─ map.ts              # MapLibre setup, DOM markers, event handlers
│     ├─ store.ts            # localStorage persistence
│     ├─ dataModel.ts        # GeoJSON validation, id generation
│     ├─ ui.ts               # Toolbar, modal dialogs, UI interactions
│     └─ connectors/         # (Optional) Sync plugins
├─ docs/                     # Build output (committed for GitHub Pages)
├─ scripts/                  # Shell scripts (called from Justfile)
│  ├─ dev.sh                 # npm run dev wrapper
│  ├─ build.sh               # npm run build wrapper
│  └─ preview.sh             # budo -d docs wrapper
├─ Justfile                  # Command wrapper (dev, build, preview, lint, format, etc.)
├─ vite.config.ts            # Vite configuration
├─ package.json              # Dependencies and npm scripts
├─ .gitignore                # Git ignore rules
├─ .github/
│  └─ copilot-instructions.md # This file
├─ README.md                 # Project documentation
├─ LICENSE                   # CC0 1.0
└─ manifest.json             # PWA manifest (in src/assets/ or src/)
```

---

## Development Workflow

### Setup
```bash
npm ci
```

### Commands (via Justfile)
```bash
just dev         # npm run dev (Vite dev server, default: http://localhost:5173)
just build       # npm run build (build to docs/)
just preview     # budo -d docs (preview static /docs/)
just lint        # npm run lint (ESLint)
just format      # npm run format (Prettier)
```

### Static Preview
- Use `budo -d docs` to serve `/docs/` statically (no Python HTTP server)
- Configured in `package.json` scripts and called from Justfile

---

## Key Implementation Decisions

### 1. Basemap & Terrain
- **Basemap**: Protomaps Basemap with standard vector tiles from `https://tunnel.optgeo.org/martin/protomaps-basemap`
- **Terrain**: Optional Mapterhorn Terrarium Tiles from `https://tunnel.optgeo.org/martin/mapterhorn` (512×512 WebP)
- Rationale: Lightweight, efficient, suitable for offline and mobile use

### 2. DOM Markers (No Sprites)
- Use DOM-based markers (`maplibregl.Marker({ element })`) for emoji rendering
- Avoid sprite atlases; rely on browser text rendering for better cross-platform emoji support
- Performance limit: documented practical limit for DOM markers; future fallback modes optional

### 3. Storage Strategy
- **MVP**: `localStorage` with versioned key (`mlgl:places:v1`) for simplicity
- **Optional (v0.2+)**: IndexedDB via localForage for larger datasets
- Export/Import: strict GeoJSON validation, pretty-printed JSON for portability

### 4. PWA & Offline
- PWA manifest in `src/` (or `src/assets/`)
- Service Worker source in `sw.ts` (bundled by Vite)
- Enables offline use; encourages data export for backup

### 5. URL Fragment State
- MapLibre GL JS `hash: 'map'` auto-syncs map state (center, zoom, bearing, pitch)
- Future document fragment design deferred; implement after core features stabilize
- State parameters (other than map position) added incrementally as features are implemented

---

## Git & GitHub Workflow

### Commit Strategy
- **Commit frequently** by feature/task (granular commits)
- **Push to GitHub** only when:
  - Phase milestones complete
  - `docs/` is fully built and verified
  - README or documentation is updated
  - Ready for GitHub Pages deployment

### Commit Message Format
```
feat: add feature X
fix: resolve issue Y
refactor: restructure module Z
chore: update dependencies
docs: update README or documentation
```

### Branches
- `main`: production branch (with committed `docs/`)
- Feature branches: optional (for larger changes)

---

## Testing & Validation

### Before Each Commit
- [ ] Code passes `npm run lint`
- [ ] Code formatted per `npm run format`
- [ ] No console errors in dev server

### Before Each Push to GitHub
- [ ] `just build` succeeds
- [ ] `just preview` displays site correctly
- [ ] `docs/` is committed
- [ ] README and/or documentation reflects changes
- [ ] Manual QA: test key workflows (add/edit/delete, export/import)

---

## Roadmap Milestones

### v0.1 (MVP)
- [ ] MapLibre GL JS + Protomaps Basemap integration
- [ ] DOM Markers (emoji + label)
- [ ] Add/Edit/Delete interactions
- [ ] localStorage persistence
- [ ] Export/Import JSON
- [ ] PWA baseline (manifest + service worker)
- [ ] Vite build to `docs/` (no hashes)
- [ ] Justfile commands working
- [ ] ESLint & Prettier configured

### v0.2
- [ ] Optional IndexedDB/localForage
- [ ] Modal UI (replacing prompts)
- [ ] Categories with CSS styling
- [ ] Auto-backup prompts
- [ ] Undo/Redo

### v0.3
- [ ] Gist/WebDAV connectors
- [ ] "Elevate to uMap/geoBingAn" helpers
- [ ] Search, tag filters, timestamps
- [ ] LineString support (basic tracing)

### v0.4+
- [ ] Optional export encryption
- [ ] Reverse geocoding hints
- [ ] Advanced theming
- [ ] Connector SDK

---

## Common Patterns & Code Style

### TypeScript
- Use modern ES2020+ syntax
- Strict type checking enabled in TypeScript config
- Avoid `any` unless justified

### CSS
- Mobile-first responsive design
- Use CSS custom properties for theming
- Halo/shadow effects for marker label legibility

### Module Imports
```ts
import maplibregl from 'maplibre-gl';
import { Store } from './js/store';
import { MapController } from './js/map';
```

### Vite Asset References
```ts
// In HTML or JS, use relative paths:
<link rel="stylesheet" href="./css/style.css">
<script src="./js/main.js"></script>
// In CSS:
background-image: url('./assets/icon.png');
```

---

## Troubleshooting & Notes

### macOS/zsh Issues
- Justfile uses `set shell := ["zsh", "-cu"]` or explicit bash invocation
- Scripts in `/scripts/*.sh` are executable and use bash or zsh-compatible syntax

### Python HTTP Server Avoided
- Use `budo` for static preview (configured in package.json)
- Avoids environment complexity

### Asset Hashing Disabled
- Vite configured with `assetFileNames`, `chunkFileNames`, `entryFileNames` without `[hash]`
- Ensures stable `./assets/...` references in HTML

### Emoji Rendering
- Test across browsers/platforms (Chrome, Firefox, Safari)
- Document recommended system fonts
- Provide CSS fallback stacks

---

## Additional Resources

- [MapLibre GL JS Documentation](https://maplibre.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Protomaps Documentation](https://protomaps.com/)
- [Just Command Language](https://github.com/casey/just)
- [libre-places README](../README.md)

---

**Last Updated**: January 19, 2026
