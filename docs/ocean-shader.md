# Ocean Shader

This document explains how the ocean is rendered: the custom `ShaderMaterial`, the two-pass depth technique that lets the water "see" the land behind it, the coastline foam and animated contour ripples, and the toon lighting model. Implementation lives in `src/components/PlanetCanvas.tsx` (`OCEAN_VERT`, `OCEAN_FRAG`, `createOceanMaterial`, and the `animate()` loop).

---

## 1. The big picture

The ocean is a second sphere, slightly larger or smaller than the planet, drawn with a custom GLSL `ShaderMaterial`:

```
ocean radius = max(0.01, shape.radius + ocean.seaLevel)
```

Where the land pokes above this radius you get coastline; where the land sits below it you get open water. Everything interesting in the shader is about answering one question per pixel: **how far is the land behind this water?** That single distance drives the shallow-water color gradient, the foam line, and the animated ripples.

The ocean mesh is rendered with:

- `transparent: true`, `depthWrite: false` — so it composites over the terrain instead of replacing it.
- `renderOrder = 1` — terrain (order 0) draws first, ocean second.
- `side: THREE.FrontSide` — only the camera-facing hemisphere.

---

## 2. Two-pass depth rendering

A normal single render gives the ocean shader no information about the terrain underneath it. To detect coastlines we render the scene **twice per frame** (in `animate()`):

```ts
if (refs.ocean.visible) {
  // Pass 1 — depth pre-pass: hide the ocean, render terrain to an
  // offscreen target whose DepthTexture captures how far each pixel is.
  refs.ocean.visible = false;
  renderer.setRenderTarget(refs.depthTarget);
  renderer.render(scene, camera);
  refs.ocean.visible = true;
  renderer.setRenderTarget(null);
}

// Pass 2 — full scene to the screen. The ocean shader now samples the
// depth texture from pass 1 to know where the land is.
renderer.render(scene, camera);
```

The offscreen target is created by `createDepthTarget()`:

```ts
const t = new THREE.WebGLRenderTarget(w, h, { minFilter: NearestFilter, magFilter: NearestFilter });
t.depthTexture = new THREE.DepthTexture(w, h);
```

Three.js 0.184 runs on WebGL 2 by default, where `DepthTexture` is natively supported — no extensions or workarounds needed.

### Why the depth texture must be sized in *physical* pixels

`renderer.setPixelRatio(window.devicePixelRatio)` means the on-screen framebuffer is `width × dpr` by `height × dpr`. The shader reads its position with `gl_FragCoord.xy`, which runs in those **physical** pixels. So the depth target and the `uResolution` uniform must be sized to match:

```ts
const PW = renderer.domElement.width;   // physical, post-pixel-ratio
const PH = renderer.domElement.height;
depthTarget = createDepthTarget(PW, PH);
oceanMat.uniforms.uResolution.value.set(PW, PH);
```

If they were sized in CSS pixels instead, `uv = gl_FragCoord.xy / uResolution` would exceed 1.0 on a HiDPI display, the depth lookup would clamp to the texture edge, and the foam would lock to one region of the planet regardless of where the coastline actually is. The `ResizeObserver` re-applies the same physical-pixel sizing on every resize.

---

## 3. Reading the depth: linearization and `depthDiff`

The depth buffer is non-linear (it has far more precision near the camera). To compare distances meaningfully we convert raw depth back to view-space distance:

```glsl
float linearizeDepth(float raw) {
  float ndc = 2.0 * raw - 1.0;
  return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
}
```

`uNear` / `uFar` are the camera's clip planes (0.1 / 1000). The key quantity is then:

```glsl
float depthDiff = linearizeDepth(sceneDepth) - linearizeDepth(gl_FragCoord.z);
```

`depthDiff` is the view-space gap between this ocean pixel and the land behind it:

| `depthDiff` | Meaning |
|---|---|
| ≈ 0 | Land is right behind the water — **the shoreline** |
| small | Shallow water near the coast |
| large | Deep open ocean, land far below |

It is only computed when foam or ripples are enabled (otherwise it defaults to a large "open ocean" value), since the texture fetch isn't free.

> **Caveat — view dependence.** `depthDiff` is a *view-space* depth gap, so a coast seen edge-on reads a slightly different value than one seen face-on. This is the standard toon-water approximation and looks correct in practice. The upgrade path (see roadmap) is a precomputed world-space coastline distance field.

---

## 4. Coastline foam (`uFoam*`)

Two effects keyed on `depthDiff`:

**Shallow-water gradient** — blend deep → shallow color over a band four times the foam depth:

```glsl
float shallowT = 1.0 - smoothstep(0.0, uFoamDepth * 4.0, depthDiff);
color = mix(uDeepColor, uShallowColor, shallowT);
```

**Foam line** — a brighter band right at the intersection. `uFoamSoftness` interpolates the edge width from a near-hard step to a wide soft fade:

```glsl
float edgeWidth = mix(uFoamDepth * 0.04, uFoamDepth, uFoamSoftness);
float foamBase  = 1.0 - smoothstep(0.0, max(edgeWidth, 0.001), depthDiff);
float foamAnim  = foamBase + (waveN * 0.5) * foamBase;   // surface wave nudges the edge
color = mix(color, uFoamColor, clamp(foamAnim, 0.0, 1.0));
```

`waveN` is the surface ripple value (§6) remapped to [0, 1]; it gives the foam edge a subtle living wobble.

---

## 5. Animated contour ripples (`uRipple*`)

The ripples are **contour lines parallel to the shore** that scroll over time — like rings emanating from the coast. They band on `depthDiff` (distance from shore), *not* on the surface wave pattern, which is what keeps them locked to the coastline:

```glsl
if (uRippleEnabled > 0.5) {
  float shore    = max(depthDiff, 0.0);
  float bandMask = 1.0 - smoothstep(0.0, uRippleDistance, shore);   // fade out away from coast
  float phase    = shore / max(uRippleWidth, 0.001) - uTime * uRippleSpeed;
  float tri      = abs(fract(phase) - 0.5) * 2.0;   // triangle wave, 1 at a line centre
  float line     = smoothstep(0.55, 1.0, tri);       // thin bright contour
  color = mix(color, uFoamColor, line * bandMask * 0.6);
}
```

- **`uRippleWidth`** sets the spacing/thickness of each contour line.
- **`uRippleDistance`** sets how far from the shore the rings reach before `bandMask` fades them to nothing.
- **`uRippleSpeed`** (shared with the surface motion) scrolls the `phase` so the rings animate inward.

This replaced an earlier "wave bands" effect that banded on the 3D surface noise — that version was fixed to the sphere and pooled in one region instead of tracking the coast.

---

## 6. Surface motion (vertex displacement)

Independent of the coastline effects, the vertex shader gives the water surface a gentle bob by summing three sine waves driven by the vertex normal, then displacing radially:

```glsl
float w1 = sin(dot(n, dir1) * uRippleScale * 8.0  + uTime * uRippleSpeed);
float w2 = sin(dot(n, dir2) * uRippleScale * 11.0 + uTime * uRippleSpeed * 0.7);
float w3 = sin(dot(n, dir3) * uRippleScale * 6.5  + uTime * uRippleSpeed * 1.3);
vWave = w1 * 0.5 + w2 * 0.3 + w3 * 0.2;            // [-1, 1]
vec3 displaced = position + n * vWave * uRippleHeight;
```

The three independent directions and slightly detuned speeds prevent an obvious repeating pattern. `vWave` is passed to the fragment shader (as `waveN`) to animate the foam edge.

---

## 7. Toon lighting (`uLit`)

When the shader style is `standard-lit`, a stylized lighting pass runs; under `unlit` it is skipped and the water shows flat color.

```glsl
float d    = max(dot(N, sun), 0.0);
float toon = 0.1 + step(0.3, d) * 0.4 + step(0.7, d) * 0.45;   // 3 quantized bands
color = color * toon;

vec3  H    = normalize(sun + viewDir);
float spec = pow(max(dot(N, H), 0.0), 64.0);
color += step(0.78, spec) * vec3(0.85, 0.95, 1.0) * 0.65;       // hard specular blob
```

The `step()` functions quantize both diffuse and specular into hard bands, giving the cel-shaded "game water" look rather than smooth Phong falloff. The final alpha is fixed at `0.88` for slight translucency.

---

## 8. Uniform update strategy

The ocean `ShaderMaterial` is **created once** and never rebuilt — only its uniform `.value`s are updated when settings change (across a few `useEffect` hooks keyed to the relevant settings). This is safe because every parameter is a uniform; nothing affects the shader source. Contrast this with the terrain material, which *is* rebuilt on structural changes (see `terrain-shader.md` §6). `uTime` is advanced every frame inside `animate()`.

---

## 9. Roadmap

Prioritised directions for the ocean shader.

### 9a. World-space coastline distance (removes view dependence)
Replace the view-space `depthDiff` with a precomputed distance-to-coast stored per vertex (or a small SDF texture). Foam and ripple spacing would then be perfectly stable as the camera orbits, and would no longer compress at grazing angles.

### 9b. Normal-mapped / refracted surface
Sample an animated normal map (or derive normals from the sine-wave field analytically) so the specular highlight breaks into moving glints. A screen-space refraction offset on the terrain behind the water would add depth.

### 9c. Foam from terrain slope, not just proximity
Currently foam appears wherever water meets land. Sampling terrain steepness would let foam concentrate on cliffs and wave-exposed shores while calm bays stay smooth.

### 9d. Depth-tinted absorption
Blend deep→shallow using an exponential `exp(-depth * absorption)` per RGB channel so red is absorbed faster than blue, reproducing real water's color falloff instead of a single linear `mix`.

### 9e. Sun glitter / Fresnel rim
Add a Fresnel term (`pow(1 - dot(N, view), 5)`) to brighten grazing angles and a sparkle layer on the sun reflection for a more cinematic horizon.

### 9f. Configurable clip planes
`uNear` / `uFar` are currently hardcoded to match the camera. Wiring them from `camera.near/far` would keep the linearization correct if the camera setup ever changes.

### 9g. Single-pass depth (performance)
The two-pass render doubles draw calls. On capable hardware the terrain depth could be captured in a multi-render-target pass alongside the main color, halving the geometry cost — relevant at resolution 256/512.
