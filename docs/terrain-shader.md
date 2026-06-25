# Terrain Shader

This document explains how the terrain is **colored by elevation**. It covers the elevation-ramp shader, why coloring is computed radially (so it respects the sphere), the gradient vs stepped modes, and the material strategy that keeps Three.js's built-in lighting intact.

For how the terrain mesh is *displaced* (the noise system), see `terrain-layer.md`. For how the sphere is built, see `sphere-geometry.md`. Implementation here lives in `src/components/PlanetCanvas.tsx` (`TERRAIN_RAMP_GLSL`, `rampToUniforms`, `createTerrainMaterial`).

---

## 1. The three color modes

The Shaders panel offers a terrain **color mode**:

| Mode | Behaviour |
|---|---|
| **Solid** | One flat color (`shaders.terrainColor`). No shader injection — a plain material. |
| **Gradient** | Smooth blend between elevation color stops. |
| **Stepped** | Hard color bands at each stop — discrete elevation zones. |

Gradient and stepped share the same data (`shaders.ramp`, an array of `{ color, position }` stops) and the same injected shader; only a single uniform (`uRampMode`) differs between them.

---

## 2. Coloring respects the sphere

The defining requirement: a mountain at the pole and a mountain at the equator must color the same. Using a vertex's `y` height would be wrong on a globe. Instead, the injected **vertex shader** computes elevation as radial distance above the base sphere:

```glsl
varying float vElev;
uniform float uRadius;
// ...
vElev = length(position) - uRadius;
```

Because terrain displacement is purely radial (`pos + normal * elev`), a displaced vertex sits at `radius + elev` from the centre, so `length(position) - uRadius` recovers exactly the elevation that the CPU noise pass produced — direction-independent, valid everywhere on the globe.

---

## 3. Normalizing elevation to the ramp

Raw elevation is in world units and varies with the elevation-scale slider. To map it onto the ramp's 0→1 axis, the CPU mesh pass records the **actual** min and max displacement while it builds the geometry:

```ts
// buildPlanetGeometry()
if (elev < elevMin) elevMin = elev;
if (elev > elevMax) elevMax = elev;
// ...returns { geometry, elevMin, elevMax }
```

These are fed to the shader as `uElevMin` / `uElevMax`, and the fragment shader normalizes:

```glsl
float range = max(uElevMax - uElevMin, 1e-4);
float t = clamp((vElev - uElevMin) / range, 0.0, 1.0);
```

Using the *actual* range (not the theoretical maximum) means the full color ramp is always used — the lowest stop lands on the deepest trough and the highest stop on the tallest peak, regardless of how dramatic the terrain is. When terrain is disabled, `elevMin == elevMax == 0`, the guard keeps `range` non-zero, `t` collapses to 0, and the planet shows the lowest ramp color.

---

## 4. Evaluating the ramp

A single function handles both gradient and stepped via the `uRampMode` branch:

```glsl
vec3 terrainRamp() {
  float range = max(uElevMax - uElevMin, 1e-4);
  float t = clamp((vElev - uElevMin) / range, 0.0, 1.0);
  vec3 col = uRampColors[0];
  for (int i = 1; i < 5; i++) {
    if (i >= uRampCount) break;
    float seg;
    if (uRampMode == 2) {                 // stepped
      seg = step(uRampPositions[i], t);   // 0 until t crosses this stop, then 1
    } else {                              // gradient
      float d = max(uRampPositions[i] - uRampPositions[i - 1], 1e-4);
      seg = clamp((t - uRampPositions[i - 1]) / d, 0.0, 1.0);
    }
    col = mix(col, uRampColors[i], seg);
  }
  return col;
}
```

**Why the successive-mix loop works.** For gradient, within the one segment that contains `t`, `seg` is a partial blend; every earlier segment has `seg == 1` (fully replaced) and every later one `seg == 0` (no effect). So the visible color is exactly the linear interpolation between the two bracketing stops. For stepped, `step()` makes each transition instantaneous, producing N hard bands. Loop bounds are a compile-time constant (`MAX_STOPS = 5`) as WebGL requires, with a runtime `break` at `uRampCount`.

The stops are sorted by position and padded to 5 in `rampToUniforms()` before upload, so the GLSL array is always fully defined and the shader never needs to handle out-of-order stops.

---

## 5. Injection via `onBeforeCompile`

Rather than writing a full lit shader from scratch (and re-deriving Phong lighting), the ramp is **injected into the standard material**. `createTerrainMaterial()` builds a `MeshPhongMaterial` (lit) or `MeshBasicMaterial` (unlit) and patches two chunk includes:

```ts
mat.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, elevUniforms);

  shader.vertexShader =
    'varying float vElev;\nuniform float uRadius;\n' +
    shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n  vElev = length(position) - uRadius;'
    );

  shader.fragmentShader =
    TERRAIN_RAMP_GLSL +
    shader.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\n  diffuseColor.rgb = terrainRamp();'
    );
};
```

The injected line overwrites `diffuseColor.rgb` *after* the standard color stage, so:

- **standard-lit** keeps all of `MeshPhongMaterial`'s diffuse + specular lighting — the ramp just supplies the base color the lighting acts on.
- **unlit** keeps `MeshBasicMaterial`'s flat output — the ramp colors show directly, giving a clean toon-map look.

The base material color is set to white (`0xffffff`) so it doesn't tint the ramp.

> Three.js includes `onBeforeCompile.toString()` in its program cache key by default, so ramp materials (which share identical injected source) safely share one compiled program, while the solid material — whose `onBeforeCompile` is the empty default — gets its own. No manual `customProgramCacheKey` needed.

---

## 6. Material rebuild strategy

Recompiling GLSL on every slider drag would stutter. The effects are split so that recompiles only happen on **structural** changes:

| Change | What happens |
|---|---|
| style (lit/unlit) **or** solid ↔ ramp boundary | Material **recreated** (recompile). Keyed on `[style, isRampMode]`. |
| gradient ↔ stepped | `uRampMode` uniform flips — **no recompile** (runtime branch). |
| edit a stop color/position | Ramp uniforms updated — **no recompile**. |
| solid color picker | `material.color` set — **no recompile**. |
| terrain displacement changes | `uElevMin`/`uElevMax`/`uRadius` updated from the new geometry — **no recompile**. |

Because a freshly recreated material is initialized straight from `settings` (and the current `elevMin`/`elevMax` stored on `sceneRef`), it is correct immediately without waiting for the uniform effects to re-run.

---

## 7. Color space

Colors are created with `new THREE.Color('#hex')`, which — with Three's default color management — stores them in **linear** working space. The ramp therefore feeds linear color into `diffuseColor`, lighting is computed in linear, and the standard `colorspace_fragment` chunk converts the final result to sRGB for display. This is exactly how the built-in `diffuse` uniform behaves, so ramp colors match their solid-mode equivalents.

---

## 8. Roadmap

### 8a. Latitude / temperature blending
Mix a second axis into the ramp lookup using latitude (`abs(normalize(position).y)`) so poles trend toward white/ice and the equator toward warm tones — biomes that follow climate, not just height.

### 8b. Slope-aware coloring
Sample the surface normal vs the radial direction to detect steepness, then override color on cliffs (exposed rock) vs flats (grass/sediment). A classic "rock on slopes, grass on plains" rule.

### 8c. Moisture / second noise channel
Add a low-frequency noise field as a wetness mask to vary color within a single elevation band — deserts vs forests at the same height.

### 8d. Editable ramp easing
The gradient is linear between stops; exposing a per-segment ease (smoothstep / gamma) would let users soften or sharpen individual transitions without adding stops.

### 8e. Texture-LUT ramp
Bake the ramp to a 1D texture and sample it with `t`. Removes the 5-stop cap, makes arbitrarily complex ramps cheap, and enables importing gradient presets.

### 8f. Sea-level-aware ramp
Anchor a ramp position to `ocean.seaLevel` so the shoreline color band automatically tracks the water line as sea level changes, keeping beaches at the coast.

### 8g. Triplanar detail textures
Blend in a tiling rock/grass texture using triplanar mapping (no UV seams on the sphere) modulated by the ramp, for surface detail beyond flat color.
