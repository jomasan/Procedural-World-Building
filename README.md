# Procedural World Building

A learning resource for the **Procedural World Building** class at
[Cornell Tech](https://tech.cornell.edu/).

This repository is the classroom workshop: tutorials for the tools, a
living web app you can run in the browser, and a path through
**procedural algorithms** — methods that *generate* terrain, water,
weather, life, and towns from rules and numbers instead of placing
every rock by hand.

The exercise is not “build a game engine from nothing.” It is **world
building in the browser**: you change a slider, an algorithm runs, and
a planet (or a map of that planet) updates in front of you. That loop —
parameter → procedure → picture — is how the class makes algorithms
concrete.

## What you will learn

Students start with the web stack (so the browser can host the studio),
then use that studio to climb a sequence of generation problems:

| Theme | Algorithms and ideas you will meet |
|---|---|
| **Foundations of terrain** | Noise (including Perlin-style and layered / ridged / warped stacks), heightmaps, sampling a field of numbers |
| **From flat to planet** | Mapping a 2D map onto a sphere, sphere geometry (and the pole-pinching problem) |
| **Richer structure** | Voxel terrain on a plane, then voxels on a sphere |
| **Maps as a workbench** | Equirectangular 2D views, painting features, **hydraulic (droplet) erosion**, biomes, flood-fill |
| **Flows** | Vector fields; atmospheres (wind, clouds); oceans and currents |
| **Populations** | Scattering objects by biome, slope, and soil; foliage; sampling; simple characters and schedules |
| **Networks** | Nodes and paths (roads), then a small simulated town graph |
| **Performance** | Level of detail (LOD), streaming data, line of sight / fog |

You do not need to implement every row on day one. The class app
already demonstrates several of these (live terrain noise, a 2D map
that agrees with the 3D planet, erosion you can apply back onto the
sphere). Later weeks add systems the way a world does: first ground,
then water and weather, then who lives there and how they connect.

Reference reading for the *ideas* behind planet-scale generation lives
in [`refs/pcg-reference-manifesto.md`](refs/pcg-reference-manifesto.md).

## Technologies

We build a **single-page studio in the browser**. Two libraries share
the screen; TypeScript is the language we write both in.

| Piece | Role in this class |
|---|---|
| **HTML, CSS, JavaScript** | The web’s floor: pages, layout, and the language the browser actually runs |
| **Node.js** and **npm** | Run JavaScript on your computer, install packages, start a local dev server |
| **React** | The **UI**: sidebar, sliders, tabs. It remembers **settings** (the numbers the algorithms read) |
| **TypeScript** | JavaScript plus type labels — the language this course uses for React and Three.js |
| **Three.js** | The **3D canvas**: scene, camera, planet mesh, orbit controls, the every-frame draw loop |
| **Vite** (new student apps) | Current way to scaffold and serve a React + TypeScript project |
| **Firebase** and **Supabase** | Later: authentication, databases, storage, and hosting — so a world can be saved and shared |

**How they fit together:** React owns the booth (controls and settings).
Three.js owns the stage (the 3D world). They talk by passing **plain
data** — not by stuffing live 3D objects into React state. Algorithms
(noise, erosion, flood-fill, …) are ordinary TypeScript functions:
settings in, heights or maps out, then the canvas or the 2D view
displays the result.

The class app in this repo lives at
[`React TS Site/my-react-ts-app/`](React%20TS%20Site/my-react-ts-app/)
(an older Create React App toolchain). **New student projects should
follow the tutorials and start with Vite**, not Create React App.

## How to start (students)

1. **Tools first** — work through
   [`docs/Tutorials/00-overview.md`](docs/Tutorials/00-overview.md)
   in order. Begin with the
   [terminal](docs/Tutorials/01-terminal-and-setup-checks.md), then
   [Node, npm, and React](docs/Tutorials/02-node-npm-and-react.md),
   [what React is and why TypeScript](docs/Tutorials/03-react-paradigm-and-typescript.md),
   and
   [Three.js talking to the React UI](docs/Tutorials/04-threejs-and-react-dialogue.md).
2. **Course map** — the full week-by-week climb is
   [`docs/learning-path.md`](docs/learning-path.md).
3. **Run the class planet builder** (once Node is installed):

   ```bash
   cd "React TS Site/my-react-ts-app"
   npm install
   npm start
   ```

   Then open [http://localhost:3000](http://localhost:3000). Drag the
   planet; use the left panel to change shape, terrain layers, and
   (in the 2D map tab) erosion.

## What’s in this repository

```
docs/
  Tutorials/          Student ladder (terminal → React → Three.js → …)
  learning-path.md    Class sequence of topics
  *.md                Notes on terrain, ocean, sphere geometry, shaders
React TS Site/
  my-react-ts-app/    The in-browser world builder (React + TS + Three.js)
refs/                 Background reading on procedural planets
```

Technical notes for the live app (layers, shaders, sphere mesh) are
under [`docs/`](docs/).

## For instructors

The intended pedagogy is **algorithms in situ**: each procedure is
introduced because the world needs it (a height field, a coastline, a
biome paint, a road). Prefer parameters students can see — sliders,
algorithm variants in a dropdown, tooltips, a debug view that shows
structure, not only the pretty surface.

---

Cornell Tech · Procedural World Building
