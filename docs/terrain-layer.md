# Terrain Layer

This document explains how the terrain system works, what each slider controls, and what directions the system could grow.

---

## 1. The big picture

When terrain is enabled, every vertex on the sphere is displaced radially — pushed outward or inward along the line connecting it to the planet center. The amount of displacement at each vertex is determined by sampling one or two **noise layers** using that vertex's position on the sphere. The result is an irregular, planet-like surface that responds in real time to the sliders.

The full formula for the displacement of one vertex:

```
displacement = (macro.strength × macroNoise + micro.strength × microNoise) × elevationScale
new position = old position + unitNormal × displacement
```

Where `macroNoise` and `microNoise` are noise values in **[−1, 1]**, and `unitNormal` is the direction from the planet center to the vertex (its normalized position).

See `docs/sphere-geometry.md` §4 for the exact code and a step-by-step walkthrough of the displacement math.

---

## 2. The two layers: Macro and Micro

The terrain is split into two independent `NoiseLayer` objects that run in parallel and are summed:

| Layer | Role | Default noise type | Default scale | Default strength |
|---|---|---|---|---|
| **Macro** | Large-scale continent shapes, ocean basins, mountain ranges | Perlin | 1.2 | 1.0 |
| **Micro** | Small surface roughness, ridgelines, local texture | Ridged | 5.0 | 0.25 |

This separation exists because real planetary topography operates at multiple scales simultaneously. A macro layer alone produces smooth, geologically-broad shapes. A micro layer alone produces fine detail that looks noisy and homogeneous. Combined, they produce surfaces where large regions have distinct character (continent vs ocean basin) while still showing local variation within those regions.

Both layers share the same set of five sliders plus a noise type selector.

---

## 3. Noise types

Each layer independently chooses a noise algorithm. All three are built on the same underlying **3D value noise** primitive (`valueNoise3D` in `src/utils/noise.ts`), which hashes integer grid cell coordinates to a random value in [0, 1] and trilinearly interpolates between the eight surrounding corners of a unit cube using a cubic (smoothstep) fade function.

### Perlin (fBm)

Standard **fractional Brownian motion**: sums `octaves` layers of value noise at increasing frequencies, each with decreasing amplitude. The output is symmetric around zero — peaks and valleys are statistically equal.

```
output = Σ (amplitude_i × noise(pos × frequency_i)) / sum(amplitudes)
```

Produces: rolling hills, smooth continents, gradual basins. Peaks and troughs are gentle. Good for macro large-scale continent/ocean separation.

### Ridged

Takes the absolute value of the raw noise at each octave, then inverts it (`1 − |n|`). This collapses the smooth valleys into sharp ridges while keeping broad flat areas between them:

```
contribution_i = amplitude_i × (1 − |noise(pos × frequency_i)|)
```

Produces: mountain ridges, canyon networks, cracked terrain. The highest values appear where standard noise would cross zero, meaning ridges form at the boundary between noise "cells". Good for micro detail on rocky or tectonically active planets.

### Warp (domain warping)

Evaluates fBm three times — once for each axis offset — to displace the input coordinates before the final fBm sample:

```
wx = fbm(pos + (1.7, 9.2, 3.4))
wy = fbm(pos + (8.3, 2.8, 5.1))
wz = fbm(pos + (4.5, 7.1, 1.9))
output = fbm(pos + 0.8 × (wx, wy, wz))
```

The three different seed offsets ensure the X, Y, Z warp functions are statistically independent. The warp strength constant (0.8) controls how aggressively the input is displaced.

Produces: swirling, organic flow patterns — continent coastlines that curl and interlock, lava-flow shapes, gas-giant band structures. Computationally the most expensive (4× the fBm evaluations of standard Perlin).

---

## 4. Slider reference

All sliders live inside each layer (Macro and Micro). The global **Elevation scale** sits above both.

---

### Elevation scale

**Range:** 0.00 – 0.80 | **Default:** 0.25

The master amplitude of the whole terrain system. Multiplies the combined noise output of both layers. Expressed in the same world units as the planet radius, so `0.25` on a radius-1 planet means vertices can move at most ±25% of the planet's radius.

At `0.0` the planet is a perfect sphere regardless of other settings.  
At `0.80` the terrain is very dramatic — peaks nearly reach 80% of the base radius above sea level.

This slider is best adjusted last, after the shape of the terrain has been dialled in with Scale and the layer settings.

---

### Noise type (per layer)

**Options:** `perlin` | `ridged` | `warp`

Selects the noise algorithm described in §3. Changes the character of the terrain produced by that layer rather than its intensity or frequency. See §3 for the visual description of each.

A common pairing: Macro = `perlin` (smooth continent shapes) + Micro = `ridged` (sharp surface detail). Swapping Macro to `warp` creates stranger, more alien topographies.

---

### Scale (per layer)

**Range:** 0.2 – 10.0 | **Default:** Macro 1.2, Micro 5.0

Controls the **spatial frequency** of the noise — how many features fit on the sphere. Scale is applied by multiplying the unit-normal input coordinates before sampling:

```ts
sampleNoise(nx × scale, ny × scale, nz × scale, ...)
```

Because the unit normal lies on a sphere of radius 1, a scale of 1.0 means the noise lattice spacing equals the sphere's diameter — roughly one major feature across the whole planet. A scale of 5.0 means features repeat approximately every 1/5th of the circumference.

| Scale | Character |
|---|---|
| 0.2 – 0.8 | One or two giant hemispheric blobs; very alien |
| 1.0 – 2.0 | Continental scale — 3–5 large regions per planet |
| 3.0 – 5.0 | Regional scale — many distinct areas, good for micro detail |
| 6.0 – 10.0 | Fine surface texture; best used in the Micro layer |

Micro scale should generally be 3–8× larger than Macro scale so the layers operate at visually distinct frequencies.

---

### Octaves (per layer)

**Range:** 1 – 8 | **Default:** Macro 4, Micro 3

How many successive layers of noise are summed together. Each additional octave doubles the frequency and halves the amplitude (modified by persistence and lacunarity). This is the mechanism that gives fBm its "natural" multi-scale texture — coastlines that have structure at every zoom level.

```
Octave 1: base shape at scale × 1
Octave 2: detail at scale × lacunarity
Octave 3: finer detail at scale × lacunarity²
...
```

At `1`: single smooth wave, no fractal structure.  
At `4–5`: good balance of structure and detail.  
At `8`: maximum detail; also the most expensive to compute.

Higher octaves only add visible detail if the sphere resolution (triangle count) is fine enough to represent them. At resolution 32, octaves beyond 4–5 produce noise features smaller than a single triangle — invisible but still computed. Match octave count to resolution for efficiency.

---

### Persistence (per layer)

**Range:** 0.10 – 1.00 | **Default:** Macro 0.50, Micro 0.45

Controls how much **amplitude** each successive octave contributes relative to the previous one. It is the amplitude multiplier per octave.

```
amplitude of octave n = persistence^n
```

At `0.5` (standard): each octave is half as strong as the previous. The first octave dominates; detail layers are subtle.  
At `0.8`: higher octaves contribute more; the result looks rougher and more chaotic.  
At `0.1`: only the first octave matters; the result is similar to using 1 octave regardless of the octaves count.

The effective amplitude ratio between the coarsest and finest octave is `persistence^(octaves−1)`. For octaves=4, persistence=0.5: the 4th octave is `0.5³ = 0.125` as strong as the first.

---

### Lacunarity (per layer)

**Range:** 1.0 – 4.0 | **Default:** Macro 2.0, Micro 2.2

Controls how much the **frequency** multiplies from one octave to the next. It is the frequency multiplier per octave.

```
frequency of octave n = lacunarity^n
```

At `2.0` (standard): each octave has twice the frequency of the previous — the classic doubling used in most fBm implementations.  
At `1.5`: gentler progression; adjacent octaves look more similar, less fractal self-similarity.  
At `4.0`: very rapid frequency growth; the finest octave is `4^(octaves−1)` times the base frequency. With octaves=4 that is 64× — extremely fine features in the high octaves.

Lacunarity and persistence interact: high lacunarity + high persistence produces chaotic, noisy surfaces; low lacunarity + low persistence produces very smooth surfaces even with many octaves.

---

### Strength (per layer)

**Range:** 0.00 – 2.00 | **Default:** Macro 1.00, Micro 0.25

The relative weight of this layer in the final sum. Acts as a per-layer amplitude multiplier applied before `elevationScale`.

Setting Macro strength to `0.0` effectively disables the layer — useful for auditing the Micro layer in isolation.  
Setting Micro strength to `0.0` gives the smooth Macro shape without any fine detail.

Values above `1.0` allow a layer to dominate even when combined with a strong counterpart. The total displacement is bounded by:

```
max |displacement| = (macro.strength + micro.strength) × elevationScale × radius
```

For the defaults (1.0 + 0.25) × 0.25 = 0.3125 × radius maximum displacement.

---

## 5. How the sliders interact

The sliders are not fully independent. The most important relationships:

**Scale × Octaves define the frequency range of a layer.** Scale sets the lowest frequency; `scale × lacunarity^(octaves−1)` sets the highest. Increasing octaves extends the high-frequency end only.

**Persistence controls the frequency balance.** Low persistence (0.1–0.3) makes the layer look like a single smooth wave regardless of octave count. High persistence (0.7–0.9) makes it look like pure high-frequency noise.

**Strength × Elevation scale controls total amplitude.** They multiply together. Halving elevation scale and doubling both strengths produces the same displacement. Elevation scale is the global "master fader"; strengths let you balance the two layers against each other.

**Macro vs Micro are additive.** There is no masking, blending, or conditional logic between them. The micro layer adds its displacement on top of the macro everywhere, with equal weight regardless of whether a vertex is on a peak or in a valley.

---

## 6. Suggested expansions

The current system is a solid starting point. Below are prioritised directions for making it more expressive.

### 6a. Layer masking (high value, moderate complexity)

Currently Micro adds roughness uniformly everywhere. Real terrain has rougher surfaces at higher elevations (mountains are jagged, lowlands are flat). A **mask** computed from the Macro layer's output could control how much Micro contributes per vertex:

```
mask = saturate((macroNoise − seaLevel) / maskFalloff)
displacement = macroNoise × macro.strength + microNoise × micro.strength × mask
```

This would give calm ocean floors and rough mountain surfaces automatically, with a single `seaLevel` or `maskFalloff` parameter.

### 6b. More than two layers

Extend `TerrainSettings.layers` to an arbitrary array (or a fixed set of three: Tectonic, Regional, Surface). The current two-layer design was deliberately kept minimal — the architecture already supports more: `NoiseLayer[]` with a `layers.reduce(sum)` in `buildPlanetGeometry`.

### 6c. Noise seeds / randomise button

The value noise hash function (`hash3`) is deterministic and has no seed. Adding a `seed: number` to `NoiseLayer` and offsetting the input coordinates by a seed-derived constant would let users generate different planet shapes without changing any other parameters:

```ts
sampleNoise(nx * scale + seed.x, ny * scale + seed.y, nz * scale + seed.z, ...)
```

A "Randomise" button in the UI could pick a new seed and trigger a rebuild.

### 6d. Gradient noise (true Perlin / Simplex)

The current "Perlin" mode is technically **value noise** — it hashes lattice corners to scalar values and interpolates. True Perlin noise hashes corners to **gradient vectors** and computes dot products, giving higher isotropy and less grid-axis bias. Simplex noise further improves isotropy and has O(n²) rather than O(2^n) complexity. Either would give smoother, more natural-looking terrain at no extra slider cost.

### 6e. Erosion post-process

A thermal or hydraulic erosion pass run on the displaced vertices after noise generation would produce naturally worn-down peaks and sediment accumulation in valleys. This is CPU-intensive but produces the most geologically plausible results. It would be implemented as an additional step in `buildPlanetGeometry` after displacement, operating on the `position` buffer.

### 6f. Warp strength slider

The domain warp amount is currently hardcoded to `0.8` in `warpedFbm`. Exposing it as a per-layer slider (range 0.0–2.0) would allow fine control from "slightly organic" to "violently warped". At warp = 0.0 it degrades to standard Perlin, providing a useful transition path.

### 6g. Ridged exponent slider

The ridged mode computes `1 − |n|`. Replacing the exponent with a slider (`1 − |n|^sharpness`, range 0.5–4.0) would allow control over how sharp or rounded the ridges are. At `sharpness = 1.0` it is the current behaviour. Higher values sharpen the ridges into knife edges; lower values round them toward flat plateaus.

### 6h. GPU displacement (vertex shader)

The current displacement runs on the CPU in JavaScript every time any terrain slider changes. For high resolutions (128+) with expensive noise types (warp), this can cause a noticeable stall. Moving the noise computation into a **vertex shader** would run it in parallel on the GPU, making slider interaction smooth at any resolution. The three noise functions are straightforward GLSL ports; the main cost is threading the layer uniforms through a custom `ShaderMaterial`.
