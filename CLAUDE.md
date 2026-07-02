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
  App.tsx                    # root layout — holds PlanetSettings state + 3D/2D view tabs, renders ControlPanel + both canvases
  types/planet.ts            # PlanetSettings interface + defaultPlanetSettings
  utils/
    noise.ts                  # 3D value noise (fbm / ridged / warp) shared by 3D sphere and 2D map
    erosion.ts                # droplet hydraulic erosion + equirect sampling + seeded PRNG
    terrain.ts                # stackElevation — sums the additive terrain layer stack (noise + map layers)
  components/
    ControlPanel.tsx          # left sidebar — foldable sections per layer, reads/writes PlanetSettings
    PlanetCanvas.tsx          # Three.js scene — SphereGeometry, OrbitControls, star field
    MapCanvas2D.tsx           # 2D equirectangular map view — loads planet topography, runs erosion
```

**Data flow:** `App` owns `PlanetSettings` state → passes to `ControlPanel` (for editing) and `PlanetCanvas` (for rendering). The canvas has two effects: a one-time scene setup (`[]` deps) and a geometry-rebuild effect keyed to `settings.shape.*`.

**2D map view:** toolbar tabs switch between the 3D viewport and `MapCanvas2D`; both stay mounted (CSS `display`) so state survives switching. The map is an equirectangular projection — each pixel's lat/lon maps to a unit-sphere direction sampled with the same terrain noise, so the 2D map and the 3D planet always agree. `ControlPanel` triggers map actions (load topo / erode / reset / apply to 3D / clear 3D) through an `onMapAction` callback that App forwards to the map's imperative handle. "Apply to 3D" snapshots the map (`AppliedTopography`) and inserts it as a `map` layer in the terrain stack (muting the layers it baked in); "clear 3D" removes map layers. Terrain elevation everywhere is `stackElevation(layers) × elevationScale`.

**Current layers (in ControlPanel):**

| Layer | Status |
|---|---|
| Shape — radius, resolution, wireframe overlay | Live (rebuilds sphere geometry) |
| Terrain — additive layer stack (noise + applied 2D maps), per-layer intensity, global height | Live (displaces the sphere mesh) |
| Ocean — sea level | Stub |
| Erosion (2D) — droplet hydraulic erosion params + load/erode/reset/apply | Live (erode in 2D, apply back onto the 3D planet) |
| Atmosphere | Stub |
| Biomes | Stub |

## Key conventions

- Three.js scene objects are kept in a `sceneRef` (never in React state) to avoid re-renders driving the animation loop.
- Geometry updates dispose the old geometry before replacing it to avoid GPU memory leaks.
- The `ResizeObserver` on the canvas mount div handles responsive resizing without window event listeners.
- Dark color palette throughout: background `#080810`, panel `#10101a`, accent `#6666cc`.
