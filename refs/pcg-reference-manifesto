# Procedural Planet Generation — A Study Manifesto

*A curated set of sources for learning how to procedurally generate whole planets, in the style of* No Man's Sky.

This list is built outward from the project's foundational text — **Shaker, Togelius & Nelson, *Procedural Content Generation in Games* (Springer, 2016)**. That book gives you the fundamentals of noise, fractals, and terrain (especially **Chapter 4: Fractals, noise and agents** and **Chapter 5: Grammars and L-systems**), but it stops at flat 2D heightmaps. Generating a *planet* adds two challenges the textbook doesn't cover:

1. **Wrapping terrain around a sphere** rather than a flat grid.
2. **Generating it continuously at multiple scales**, so a player can fly from orbit down to the ground without seams or pop-in.

The sources below fill exactly that gap, sequenced from the canonical No Man's Sky material through the spherical-terrain problem to the foundational books.

---

## 1. Canonical No Man's Sky Sources

These are the primary and best secondary sources on how Hello Games actually did it.

### Continuous World Generation in 'No Man's Sky' (GDC 2017)
**Innes McKendrick, Hello Games** — *the single best primary source.*
A step-by-step breakdown of the full generation pipeline: voxel-based world generation → polygonization → texturing → population and simulation. This is precisely the bridge between the textbook's heightmaps and a playable, walkable planet, with an emphasis on doing it in real time as a small team.
🔗 https://www.gdcvault.com/play/1024265/Continuous-World-Generation-in-No
🔗 Write-up / context: https://www.gamedeveloper.com/programming/video-how-continuous-world-generation-works-in-i-no-man-s-sky-i-

### Procedural Generation in No Man's Sky Explained
**Kartikay Dubey** — *the best conceptual bridge from the textbook.*
Starts from the same Perlin-noise foundation as the project book and shows the extra steps NMS layers on top: stacking noise layers to smooth out extremities, filtering and image-processing the noise to highlight interesting features, and using real-world Digital Elevation Model (DEM) data to make terrain look more "earthy." Plain-language and well illustrated.
🔗 https://dubeykartikay.com/posts/procedural-generation-no-mans-sky/

### The Algorithms of No Man's Sky
**Rambus** — *good for breadth.*
Covers how pseudorandom numbers derived from each star's position cascade down to determine planetary features from a single seed, plus the use of L-systems (which connects directly to Chapter 5 of the project book).
⚠️ *Caveat:* this article repeats the claim that Gielis's "Superformula" was used. Hello Games publicly stated it was **not** actually used in the game — treat that detail skeptically.
🔗 https://www.rambus.com/blogs/the-algorithms-of-no-mans-sky-2/

### What the Code of No Man's Sky Says About Procedural Generation
**Game Developer (summary of 3D Game Dev Blog's reverse-engineering)** — *for the curious implementer.*
A breakdown of findings from digging through the game's code, split into geometry, textures, and animation — most detailed on how models (creatures, ships) are assembled by combining parts with weighted chance values. More about props than terrain, but useful for the "everything else" layer.
🔗 https://www.gamedeveloper.com/programming/what-the-code-of-i-no-man-s-sky-i-says-about-procedural-generation

---

## 2. The Spherical-Planet Problem

The hard, interesting part the textbook skips: mapping terrain onto a sphere with level-of-detail (LOD) that works from orbit down to ground level.

### Procedural Planets — video series
**Sebastian Lague (YouTube)** — *the most accessible practical starting point.*
The reference implementation most hobbyist projects cite. His companion devlog explains the core trick: a **"spherical quadtree"** — six quadtrees forming a cube, mapped onto a sphere — which lets you subdivide for detail near the camera.
🔗 Devlog: https://www.patreon.com/posts/behind-scenes-21195932
🔗 (Search "Sebastian Lague Procedural Planets" on YouTube for the full free series.)

### Making Worlds — "Of Spheres and Cubes" (series)
**Steven Wittens, acko.net** — *the deeper engineering treatment.*
Explains *why* the cube-to-sphere approach wins: each face of the cube map becomes a quadtree that splits four ways per level, letting you reuse well-researched flat-terrain rendering with only minor adjustments. Discusses the area-distortion tradeoffs of cube maps versus lat-long grids (which degenerate at the poles).
🔗 https://acko.net/blog/making-worlds-1-of-spheres-and-cubes/

### Terrain LOD on Spherical Grids
**vterrain.org** — *the index to the academic lineage.*
A catalog of the foundational papers and implementations: Thatcher Ulrich's chunked LOD, Sean O'Neil's "Mapping ROAM to a Sphere," and Matthias Dondorff's 2008 thesis on rendering real-scale planets combining static and procedural data. Start here to chase primary sources.
🔗 http://vterrain.org/LOD/spherical.html

### Simplex Noise Demystified
**Stefan Gustavson** — *essential implementation detail.*
2D noise doesn't work on a sphere — it ignores the z-coordinate and produces visible seams. You need **3D noise sampled on the sphere's surface**. This paper is the standard reference for implementing Ken Perlin's simplex noise, the efficient successor to classic Perlin noise.
🔗 Search "Stefan Gustavson Simplex Noise Demystified PDF" (hosted at various academic mirrors, e.g. weber.itn.liu.se).

### OpenGL Procedural Planet Generation — Quadtrees and Geomipmapping
**GameDev.net forum thread** — *practical problem-solving.*
A long, useful discussion of real implementation issues: building a quadtree on a single plane first, then bending it into a sphere by normalizing points; sharing vertex buffers between patches; and handling LOD transitions from "planet is a sprite" → "planet in one VBO" → "close-up quadtree subdivision."
🔗 https://www.gamedev.net/forums/topic/637956-opengl-procedural-planet-generation-quadtrees-and-geomipmapping/

---

## 3. Foundational Books & Papers

The deep references — several are cited directly in Chapter 4 of the project book.

### Texturing and Modeling: A Procedural Approach (3rd ed., 2003)
**Ebert, Musgrave, Peachey, Perlin & Worley** — *the bible; the natural next book.*
The definitive text on procedural noise and terrain. Musgrave's chapters specifically cover eroded fractal terrains and planet-building. This is the single most important follow-on to the project's textbook.

### The Fractal Geometry of Nature (1982)
**Benoît Mandelbrot** — *the mathematical foundation.*
The origin of the fractal and fractional Brownian motion (fBm) concepts that underpin all multi-scale terrain generation.

### The Synthesis and Rendering of Eroded Fractal Terrains (SIGGRAPH 1989)
**Musgrave, Kolb & Mace** — *making terrain stop looking "tacky."*
Adds erosion simulation to fractal terrain — the key step that turns raw noise into believable, naturally weathered landscapes.

---

## Suggested Study Sequence

1. **Finish the project book** — Chapter 4 (noise, fBm, diamond-square) and Chapter 5 (L-systems, used in NMS for flora).
2. **Watch the McKendrick GDC talk** for the overall architecture.
3. **Work through Sebastian Lague's series** to actually build a sphere.
4. **Read acko.net + Gustavson's noise paper** when you hit the LOD and seam problems.
5. **Move to *Texturing and Modeling*** for production-grade terrain and erosion.

---

*Compiled June 2026. Foundational text: Shaker, Togelius & Nelson,* Procedural Content Generation in Games *(Springer, 2016), ISBN 978-3-319-42716-4.*