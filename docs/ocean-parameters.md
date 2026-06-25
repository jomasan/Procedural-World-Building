# Ocean Parameters

A reference for every control in the Ocean panel — what each one does, its range, and how it maps to the shader. For *how* the shader uses these, see `ocean-shader.md`. The settings shape lives in `OceanSettings` in `src/types/planet.ts`; the controls are in `src/components/ControlPanel.tsx`.

---

## 1. Quick reference

| Control | Field | Range | Default | Drives |
|---|---|---|---|---|
| Enabled | `enabled` | on/off | off | Ocean mesh visibility |
| Sea level | `seaLevel` | −0.50 – 0.50 | 0.02 | Ocean sphere radius |
| Resolution | `resolution` | 8 – 512 | 64 | Ocean mesh tessellation |
| **Colors** | | | | |
| Deep | `deepColor` | hex | `#1a4a8c` | `uDeepColor` |
| Shallow | `shallowColor` | hex | `#3a9ad9` | `uShallowColor` |
| Foam | `foamColor` | hex | `#cce8ff` | `uFoamColor` |
| **Surface** | | | | |
| Speed | `rippleSpeed` | 0.0 – 5.0 | 0.8 | `uRippleSpeed` (surface + ripple scroll) |
| Scale | `rippleScale` | 0.1 – 3.0 | 1.0 | `uRippleScale` |
| Height | `rippleHeight` | 0.0 – 0.05 | 0.003 | `uRippleHeight` |
| **Coastline** | | | | |
| Foam enabled | `foamEnabled` | on/off | on | `uFoamEnabled` |
| Depth | `foamDepth` | 0.01 – 0.50 | 0.15 | `uFoamDepth` |
| Softness | `foamSoftness` | 0.0 – 1.0 | 0.5 | `uFoamSoftness` |
| **Ripples** | | | | |
| Enabled | `rippleEnabled` | on/off | on | `uRippleEnabled` |
| Width | `rippleWidth` | 0.01 – 0.30 | 0.05 | `uRippleWidth` |
| Distance | `rippleDistance` | 0.02 – 0.50 | 0.12 | `uRippleDistance` |

---

## 2. Base

### Enabled
Shows or hides the ocean mesh. When off, the depth pre-pass is skipped entirely (no per-frame cost).

### Sea level
The ocean is a sphere of radius `max(0.01, shape.radius + seaLevel)`. Negative values sink the water below the base sphere (more land exposed, archipelagos and peaks); positive values raise it (flooded world, scattered islands). Because terrain displacement is centered on the base radius, sea level `0.0` sits at the planet's "average" surface.

### Resolution
Width and height segments of the ocean sphere (shares the same options as Shape: 8–512). The ocean surface is smooth, so it rarely needs to match the terrain resolution — the displacement is small. Higher values mainly matter when `rippleHeight` is large enough to show faceting. Match terrain resolution only if you see polygonal coastline edges.

---

## 3. Colors

The ocean uses **three** colors blended by distance-from-shore (`depthDiff`):

- **Deep** — open water, far from land.
- **Shallow** — the band approaching the coast (`uFoamDepth × 4` wide).
- **Foam** — the bright line at the waterline, and the color of the animated ripple contours.

Setting Shallow close to Deep gives a uniform sea; a strong contrast gives a tropical-lagoon look. Foam doubles as the ripple/coastline highlight color, so it reads best as a near-white tint.

---

## 4. Surface (vertex motion)

These animate the *geometry* of the water surface — a gentle radial bob — independent of the coastline effects.

### Speed
Animation rate. **Shared**: it also scrolls the coastline ripple contours (§6), so at `0.0` both the surface and the ripples freeze.

### Scale
Spatial frequency of the surface waves — higher means more, tighter swells across the sphere.

### Height
Radial amplitude of the bob, in world units. Kept small by default (0.003) so the surface shimmers rather than churns. Large values need higher Resolution to avoid visible facets.

---

## 5. Coastline (foam)

### Foam enabled
Toggles both the shallow-water gradient and the foam line. When off (and ripples off), the depth pre-pass and texture fetch are skipped.

### Depth
The view-space distance that counts as "near the coast." It sets the foam-line edge width and, scaled up, the width of the shallow-water gradient (`×4`) — so raising it pushes the whole shallow/foam zone further out to sea.

### Softness
Shapes the foam line's edge: `0.0` ≈ a near-hard crisp rim; `1.0` a wide, soft, hazy fade. Interpolates the edge width from `foamDepth × 0.04` up to `foamDepth`.

---

## 6. Ripples (animated contour lines)

The toon-water effect: bright lines parallel to the shore that scroll inward over time, confined to a band near the coast. They band on distance-from-shore, so they track the coastline as the camera orbits (see `ocean-shader.md` §5).

### Enabled
Turns the contour ripples on or off independently of foam.

### Width
Spacing and thickness of each contour line. Small values pack many thin rings near the shore; large values give a few bold bands.

### Distance
How far from the shoreline the rings reach before fading out. Independent of foam Depth, so you can pair a thin foam rim with ripples that travel well out to sea, or vice-versa.

> Animation speed for the ripples is the **Surface → Speed** slider (shared `uRippleSpeed`).

---

## 7. Tips & interactions

- **Speed is shared** between surface bob and ripple scroll. If you want still water with moving coastline rings (or the reverse), that isn't currently separable — see roadmap 8a.
- **Foam Depth scales two things** (foam edge *and* shallow gradient ×4). To widen only the shallow tint without a thick foam rim, raise Depth and drop Softness.
- **Ripples and foam are independent toggles** but both rely on the same depth pre-pass; enabling either pays for it, enabling both is nearly free on top.
- **Sea level interacts with terrain elevation scale** — if you raise terrain dramatically, you may need to lower sea level to keep coastlines visible.

---

## 8. Roadmap

Parameter and control additions worth considering next.

### 8a. Separate ripple speed
Split `rippleSpeed` into surface-motion speed and contour-scroll speed so still water can have moving coastline rings (and vice-versa).

### 8b. Ripple count / falloff curve
Expose how sharply ripples fade with distance (currently a fixed `smoothstep`), and optionally a fixed *number* of rings rather than continuous spacing.

### 8c. Color presets
A dropdown of curated deep/shallow/foam palettes (tropical, arctic, alien, swamp) to seed the three pickers in one click.

### 8d. Foam from slope
A toggle to concentrate foam on steep shores vs calm bays (pairs with `ocean-shader.md` roadmap 9c).

### 8e. Sea-level animation (tides)
Animate `seaLevel` on a slow sine to simulate tides; would also exercise the coastline detection dynamically.

### 8f. Per-planet wave direction
A direction vector so swells and ripples favor a prevailing direction instead of the fixed three-axis blend.

### 8g. Opacity / translucency control
The final ocean alpha is hardcoded at `0.88`. Exposing it (and a depth-based fade) would allow anything from glassy clear shallows to opaque deep seas.
