# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # ng serve — dev server on http://localhost:4200 (default port)
npm run build        # ng build — production build to dist/hanoi-maps-leaflet-app
npm run watch        # ng build --watch --configuration development
npm test             # ng test — runs vitest via @angular/build:unit-test
```

There is no lint script configured. Run a single test with vitest's own filtering, e.g. `npx vitest run -t "<test name>"`.

## npm install-scripts policy

This machine's global `.npmrc` restricts lifecycle scripts to an allowlist (`allow-scripts`). A fresh
`npm install` will print `npm warn install-scripts ... blocked` for native deps (currently `esbuild`,
`lmdb`, `msgpackr-extract`, `@parcel/watcher` — transitive deps of `@angular/build`/vitest). This is
expected and harmless: these packages resolve their platform binary via `optionalDependencies`, so
`ng build`/`ng serve` work without running the blocked scripts. Do not run
`npm install-scripts approve` or otherwise relax this policy to silence the warning.

## Architecture

Angular 22, zoneless, standalone components only — no `NgModule` anywhere. This project uses the
newest Angular CLI file/class-naming convention: generated files and classes drop the `Component`/
`Service` suffix (e.g. `map-page.ts` exports `class MapPage`, `landmark-data.ts` exports `class
LandmarkData` decorated with `@Service()`, not `@Injectable()`). Follow this convention for any new
file (`ng generate component`/`ng generate service` will do it automatically).

Static assets live in `public/` (not `src/assets/`) and are served from the app root — e.g.
`public/data/landmarks.json` is fetched as `data/landmarks.json`.

### State flow

`MapState` (`src/app/core/services/map-state.ts`) is the single reactive store for the whole feature,
injected directly by any component that needs it (no prop-drilling via `@Input`/`@Output`). It composes
`LandmarkData`'s raw async list with UI state (search query, active category filters, selected landmark,
active tile layer, traffic visibility, mobile sidebar open) into computed signals — `filteredLandmarks`,
`selectedLandmark` — that are the source of truth for both the sidebar list and the map markers.

`LandmarkData` (`core/services/landmark-data.ts`) wraps the one-time HTTP fetch of
`public/data/landmarks.json` using Angular's `resource()` API (not RxJS/`HttpClient` subscriptions
directly in components).

`LeafletMap` (`core/services/leaflet-map.ts`) is the only place that touches the Leaflet API (`import *
as L from 'leaflet'`). Components never call Leaflet directly — they inject this service. It owns the
map instance, marker layer group, street/satellite tile layers, and the mock traffic GeoJSON layer, and
exposes an imperative API (`renderMarkers`, `setLayer`, `setTrafficVisible`, `flyTo`, `recenter`,
`onSelect` callback for marker clicks). This split exists because Leaflet is DOM-imperative and
CommonJS, and keeping it out of components avoids fighting Angular's change detection.

`MapView` (`features/map/map-view/`) is the bridge: it calls `LeafletMap.initMap()` once via
`afterNextRender` (Leaflet needs a real DOM node), then uses `effect()` to re-run
`renderMarkers`/`setLayer`/`setTrafficVisible`/`flyTo` whenever the corresponding `MapState` signal
changes. There's no SSR (`ng new` was run without `--ssr`), so DOM access here is always safe.

`Theme` (`core/services/theme.ts`) is a separate signal-based store (not part of `MapState`) that owns
dark/light mode: `isDark` signal, `toggle()` method. It initializes from `localStorage`
(`theme-preference` key), falling back to `window.matchMedia('(prefers-color-scheme: dark)')` when the
user has never toggled, and keeps listening to OS scheme changes until the first explicit `toggle()`
call. A constructor `effect()` syncs `isDark` to a `dark` class on `document.documentElement`, which
Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *));` (declared in `src/styles.css`) uses to
scope every `dark:` utility in the templates. An inline script in `src/index.html`'s `<head>` duplicates
the same init logic synchronously before Angular bootstraps, to avoid a flash of the wrong theme on
load. Leaflet's popup/marker DOM is injected outside Angular's template compiler, so its dark-mode
colors are plain `.dark .landmark-popup__*` CSS rules in `src/styles.css`, not `dark:` classes.

### Component tree

```
App
└─ MapPage (layout shell: desktop sidebar column + mobile drawer + map area)
   ├─ Sidebar               (header also has the dark-mode toggle button → Theme.toggle())
   │  ├─ SearchBar          (writes MapState.searchQuery)
   │  ├─ CategoryFilter     (toggles MapState.activeCategories)
   │  └─ LandmarkList
   │     └─ LandmarkListItem (emits select → MapState.selectLandmark)
   ├─ MapView               (owns the Leaflet map instance via LeafletMap service)
   └─ MapControls           (street/satellite toggle, traffic toggle, recenter — talks to
                              MapState + LeafletMap directly)
```

### Known limitations baked into the design (not bugs)

- **Traffic layer is mock data**, not live traffic: `public/geo/traffic-mock.geojson` has a handful of
  hand-placed `LineString`s with a `congestion: low|medium|high` property. There is no free real-time
  traffic tile source compatible with Leaflet/OSM; swapping in a real provider (e.g. TomTom Traffic API)
  means replacing `LeafletMap.setTrafficVisible()`'s fetch, not the calling code.
- **Satellite layer** uses Esri World Imagery (no API key required). Do not switch this to Google
  satellite tiles pulled via a raw tile URL — that violates Google's ToS outside the Maps Platform SDK.
- **Search** is a client-side substring filter over the ~18 curated landmarks in `landmarks.json`, not a
  geocoder. There is no Nominatim/geocoding integration.
- Marker icons are `L.divIcon` with an emoji per category (see `CATEGORY_OPTIONS` in
  `core/models/landmark.model.ts`) — there's no dependency on Leaflet's default marker images, so the
  classic "broken marker icon" bundler issue doesn't apply here and shouldn't be "fixed" if seen.
