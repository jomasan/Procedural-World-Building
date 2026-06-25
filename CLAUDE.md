# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Procedural World Builder** — a React + TypeScript + Three.js app for generating planets procedurally. The app has a dark-themed left sidebar with foldable layer panels that drive a live Three.js viewport.

## Commands

All commands run from inside `React TS Site/my-react-ts-app/`:

```bash
npm start        # dev server at localhost:3000
npm run build    # production build (CI=false to suppress warnings-as-errors)
npm test         # jest / react-testing-library
```

## Architecture

```
src/
  App.tsx                    # root layout — holds PlanetSettings state, renders ControlPanel + PlanetCanvas
  types/planet.ts            # PlanetSettings interface + defaultPlanetSettings
  components/
    ControlPanel.tsx          # left sidebar — foldable sections per layer, reads/writes PlanetSettings
    PlanetCanvas.tsx          # Three.js scene — SphereGeometry, OrbitControls, star field
```

**Data flow:** `App` owns `PlanetSettings` state → passes to `ControlPanel` (for editing) and `PlanetCanvas` (for rendering). The canvas has two effects: a one-time scene setup (`[]` deps) and a geometry-rebuild effect keyed to `settings.shape.*`.

**Current layers (in ControlPanel):**

| Layer | Status |
|---|---|
| Shape — radius, resolution | Live (rebuilds sphere geometry) |
| Terrain — noise scale, octaves, persistence, lacunarity, elevation | Stub (controls wired, no mesh displacement yet) |
| Ocean — sea level | Stub |
| Atmosphere | Stub |
| Biomes | Stub |

## Key conventions

- Three.js scene objects are kept in a `sceneRef` (never in React state) to avoid re-renders driving the animation loop.
- Geometry updates dispose the old geometry before replacing it to avoid GPU memory leaks.
- The `ResizeObserver` on the canvas mount div handles responsive resizing without window event listeners.
- Dark color palette throughout: background `#080810`, panel `#10101a`, accent `#6666cc`.
