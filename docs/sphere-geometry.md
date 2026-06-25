# Sphere Geometry

This document explains how the planet's spherical mesh is built, the tessellation structure behind it, and the coordinate conventions used throughout the terrain system.

---

## 1. What kind of sphere: the UV sphere

The planet uses a **UV sphere** (also called a latitude–longitude sphere). Three.js creates it with:

```ts
new THREE.SphereGeometry(radius, widthSegments, heightSegments)
```

In the codebase both segment counts are set to `resolution` (controlled by the Shape panel):

```ts
new THREE.SphereGeometry(radius, resolution, resolution)
```

A UV sphere divides the surface into a regular grid using **horizontal rings (latitude bands)** and **vertical strips (longitude sectors)**. It is the same subdivision scheme as lines of latitude and longitude on a globe. The name "UV sphere" comes from the fact that the two angular parameters map directly and uniformly to UV texture coordinates.

### Why UV sphere and not a cube-sphere or icosphere?

| Sphere type | Pros | Cons |
|---|---|---|
| UV sphere | Simple grid indexing; UV coords are trivially correct; Three.js built-in | Vertex density clusters near poles |
| Cube-sphere | Near-uniform vertex distribution | More complex construction; seams at cube edges |
| Icosphere | Most uniform distribution | Triangular faces only; harder to index; no built-in Three.js support |

The UV sphere is a practical starting point. Pole clustering becomes visible only at very high elevationScale values — a known limitation to revisit if polar terrain fidelity matters.

---

## 2. Tessellation structure

### Vertex grid

The geometry produces a rectangular grid of `(resolution + 1) × (resolution + 1)` vertices. The extra `+1` on each axis exists because:

- The first and last **column** share the same geometric position on the 0°/360° longitude seam, but are kept as separate vertices so each has a distinct U coordinate (0 and 1). This prevents a UV seam artifact on textures.
- The first and last **row** are the north and south poles. All vertices in a pole row converge to the same geometric point `(0, ±r, 0)`.

```
j=0     ●─────●─────●─────●    ← north pole row  (all verts at y = +r)
        │╲    │╲    │╲    │
j=1     ●─●───●─●───●─●───●
        │╲│   │╲│   │╲│   │
j=2     ●──●──●──●──●──●──●
        │  │╲ │  │╲ │  │╲ │
  ...   │  │ ╲│  │ ╲│  │ ╲│
j=W-1   ●──●──●──●──●──●──●
j=W     ●─────●─────●─────●    ← south pole row  (all verts at y = -r)
        i=0   i=1   i=2  i=W
```

### Face count

Each cell `(i, j)` in the interior grid becomes **two triangles** (one quad):

```
(i, j)   ──── (i+1, j)
   │    ╲         │
   │      ╲       │
(i, j+1) ── (i+1, j+1)

Triangle A: (i,j), (i,j+1), (i+1,j+1)
Triangle B: (i,j), (i+1,j+1), (i+1,j)
```

For the pole rows, the two triangles degenerate: both vertices of one edge share the same world-space position. Three.js handles this automatically.

| resolution | vertices | triangles |
|---|---|---|
| 8 | 81 | 128 |
| 16 | 289 | 512 |
| 32 | 1,089 | 2,048 |
| 64 | 4,225 | 8,192 |
| 128 | 16,641 | 32,768 |

Higher resolution means more triangles to displace during terrain rebuilds. Resolution 64 is the default — a good balance for interactive editing.

---

## 3. Coordinate systems

Three coordinate systems are used. Understanding when to use each prevents bugs.

### 3a. World-space Cartesian — `(x, y, z)`

The primary Three.js coordinate system. **Y is up.**

- Origin `(0, 0, 0)` is the center of the planet.
- The north pole sits at `(0, +r, 0)`.
- The south pole sits at `(0, −r, 0)`.
- The camera starts at `(0, 0, 3.5)` — looking down the −Z axis toward the planet.

Every vertex in the `BufferGeometry` is stored in these coordinates.

### 3b. Spherical coordinates — `(r, φ, θ)`

A point on the sphere can be described by two angles:

```
φ (phi)   — polar angle measured from the +Y axis downward    range [0, π]
θ (theta) — azimuthal angle in the XZ plane from the +X axis  range [0, 2π)
```

This convention is the **physics / ISO 80000-2 convention** (r, θ, φ in ISO; we swap the names here so φ is polar and θ is azimuthal, matching geographic intuition where longitude is the "horizontal" angle).

Conversion from spherical to Cartesian:

```
x = r · sin(φ) · cos(θ)
y = r · cos(φ)
z = r · sin(φ) · sin(θ)
```

Inverse (Cartesian → spherical):

```
r = sqrt(x² + y² + z²)
φ = arccos(y / r)          ∈ [0, π]
θ = atan2(z, x)            ∈ (−π, π]  →  add 2π if negative to get [0, 2π)
```

Geographic analogy:

```
Latitude  = 90° − φ·(180°/π)   (north pole = 90°N, equator = 0°, south pole = 90°S)
Longitude = θ·(180°/π)         (0° to 360°, or −180° to +180° if using signed atan2)
```

### 3c. Unit direction vector — `n̂ = (nx, ny, nz)`

The most important coordinate for this codebase. It is just the normalized position:

```
n̂ = (x, y, z) / r
  = (x/r, y/r, z/r)
```

Properties:
- Always has magnitude 1: `nx² + ny² + nz² = 1`
- For a perfect sphere: equal to the surface normal at that vertex
- Uniquely identifies every point on the unit sphere; equivalent to (φ, θ) but in Cartesian form
- **This is what the noise functions receive as input** (scaled by `layer.scale`)

The reason the codebase uses `n̂` rather than `(φ, θ)` for noise input is that 3D value noise treats its three input axes uniformly — there is no seam or singularity at the poles. If we used `(φ, θ)` as a 2D noise input, the north and south poles would show pinch artifacts because many different θ values map to the same pole point.

### 3d. UV / texture coordinates — `(u, v)`

Stored per-vertex in the geometry's `uv` attribute. Computed by Three.js from the grid indices:

```
u = i / resolution      ∈ [0, 1]   (longitude parameter)
v = 1 − j / resolution  ∈ [0, 1]   (latitude parameter, flipped so v=1 is north)
```

UV coordinates are not used by the terrain displacement code. They become relevant for texturing (biomes, ocean, atmosphere shaders).

---

## 4. Terrain displacement

The displacement pipeline in `buildPlanetGeometry` (`PlanetCanvas.tsx`) uses the coordinates above as follows.

### Step 1 — extract position and compute unit normal

```ts
const x = positions.getX(i);
const y = positions.getY(i);
const z = positions.getZ(i);

const r = Math.sqrt(x*x + y*y + z*z);
const nx = x / r;   // unit normal, same as n̂
const ny = y / r;
const nz = z / r;
```

### Step 2 — sample noise using n̂ as input

```ts
// scaled by layer.scale before entering the noise function
sampleNoise(nx * scale, ny * scale, nz * scale, noiseType, octaves, persistence, lacunarity)
```

`layer.scale` stretches or compresses the noise frequency in 3D space. A scale of 1.0 means one noise "cell" covers roughly the diameter of the unit sphere. A scale of 5.0 means features repeat approximately every 1/5th of the sphere circumference.

### Step 3 — combine layers and displace radially

```ts
const elevation =
  (macro.strength * macroNoise + micro.strength * microNoise) * elevationScale;

positions.setXYZ(
  i,
  x + nx * elevation,   // move vertex along its normal
  y + ny * elevation,
  z + nz * elevation,
);
```

The vertex moves **radially** — strictly along the line connecting the planet center to that vertex. This preserves the spherical nature of the mesh; no tangential shear is introduced.

`elevation` is in the same world units as `radius`. With `radius = 1` and `elevationScale = 0.25`, the maximum displacement at noise value ±1 is ±0.25 units, i.e. ±25% of the planet radius.

### Step 4 — recompute normals

```ts
positions.needsUpdate = true;
geo.computeVertexNormals();
```

After vertex positions change, the stored normals (which Three.js initialized from the perfect sphere) are outdated. `computeVertexNormals()` recalculates each normal as the average of the normals of all triangles that share that vertex. This is what makes the terrain shading respond correctly to the sun.

---

## 5. The longitude seam

The UV sphere has a geometric seam along one meridian (at `i=0` / `i=resolution`). The leftmost and rightmost columns of the grid share the same 3D position but are different vertices with `u=0` and `u=1` respectively.

**Effect on terrain:** none. The displacement code reads and writes the `position` attribute, not the `uv` attribute. Both seam vertices receive the same `(nx, ny, nz)` input (they are at the same world-space position), so they receive exactly the same displacement. The seam stays geometrically sealed.

**Effect on future texture mapping:** the seam will be visible if a texture samples near `u=0`/`u=1` with bilinear filtering unless the texture is designed to wrap. This is standard UV sphere behavior and must be accounted for when adding texture-based biomes or ocean maps.

---

## 6. Coordinate system summary table

| System | Components | Range | Used for |
|---|---|---|---|
| World Cartesian | x, y, z | (−∞, ∞) | Vertex storage, Three.js scene |
| Spherical | r, φ, θ | r≥0, φ∈[0,π], θ∈[0,2π) | Human-readable position (lat/lon) |
| Unit direction | nx, ny, nz | each ∈ [−1,1], magnitude = 1 | Noise input, displacement direction |
| UV | u, v | [0,1] × [0,1] | Future texturing |
