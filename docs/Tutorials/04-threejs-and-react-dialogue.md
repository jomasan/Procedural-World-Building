# 04 — Three.js and talking to the React UI

> **Where this sits:** rung 04 of the ladder. Builds on
> [01](01-terminal-and-setup-checks.md),
> [02](02-node-npm-and-react.md), and
> [03 — What React is, and why TypeScript](03-react-paradigm-and-typescript.md).
> Leads to React components and JSX (coming next), then to writing a
> real canvas.

## Before you start

**Prerequisites:** tutorials 01, 02, and 03. If you can explain that
React is a **declarative UI library** written here in **TypeScript**,
you are ready. You do **not** need to have written JSX or a 3D scene
yet. This rung is the *division of jobs* and the *conversation* between
the two libraries.

**What you'll be able to do after this rung:**
- Explain what **Three.js** is, and name the four pieces of a 3D
  canvas: **scene**, **camera**, **renderer**, **mesh**
- Say what makes the canvas **interactive** (mouse orbit vs UI
  sliders — two different jobs)
- Draw the **dialogue**: React UI writes **settings**; the Three.js
  canvas **reads** them and updates objects
- State the role of each library in one sentence, and say what must
  **not** live in React state (live meshes, the renderer)

---

## The idea, from zero

Tutorial 03 said: React describes a *page* from data — buttons, sliders,
labels.

A planet is not a button. It is a ball in space you can spin with the
mouse, lit from one side, with hills on its surface. The browser does
not know how to draw that as HTML. It can draw it on a **canvas** — a
rectangular drawing surface — using a low-level graphics system called
**WebGL**. WebGL is powerful and unpleasant to write by hand (buffers,
shaders, matrices).

**Three.js** is a **library** (same kind of thing as React: a toolkit
you install with npm, not a language) that speaks WebGL for you. You
say “there is a sphere here, a light there, a camera looking at them.”
Three.js turns that into pixels on the canvas, many times per second.

> **New term:** a **canvas** here means an HTML `<canvas>` — a box of
> pixels the page reserves for drawing. Three.js paints 3D into that
> box. React can *place* the box on the page (sidebar on the left,
> canvas on the right). React does not paint the planet.

Think of a puppet show:

- **React** runs the **booth and the controls**: the sliders, the
  “sea level” label, the layout. When you drag a slider, React updates
  the **numbers** it remembers.
- **Three.js** runs the **puppets and the stage**: the sphere, the
  water, the lights, the camera. Every frame it draws the stage as it
  is *right now*.
- The **script** they share is a pile of numbers — radius, sea level,
  wireframe on or off. That script is the **dialogue**.

They are two libraries in **one TypeScript app**. Neither replaces the
other. React is bad at a 60-times-a-second 3D loop. Three.js is bad at
accessible sliders and form layout. The planet builder needs both.

---

## What Three.js needs in order to show anything

Four ideas. Miss one and you usually get a **black box**.

> **New term:** the **scene** is the world container — an empty room
> you put objects into. Nothing in the room is visible until a camera
> looks and a renderer paints.

> **New term:** the **camera** is the eye. It has a position and a
> direction. What it sees is what you get on screen.

> **New term:** the **renderer** is the painter. It looks at the scene
> through the camera and writes pixels onto the canvas. In the browser
> this is usually a WebGL renderer.

> **New term:** a **mesh** is a visible object: a **geometry** (the
> shape — “this is a sphere”) plus a **material** (the surface —
> “this is matte blue”). Lights sit in the scene too; many materials
> stay black until a light exists.

Every frame (ideally about 60 times a second) the renderer paints
again. That repeating paint is the **animation loop**. Motion, orbit,
and water ripples live here — not in React’s “describe the page”
cycle.

**Interactive 3D** means the *stage* responds to the mouse: drag to
orbit, scroll to zoom. In this project that is **OrbitControls** — a
Three.js helper that moves the camera. That is interaction *inside*
the canvas. It is not the same as a React slider. Two hands, one
picture.

---

## Roles: which library does which job

| Job | Who | Why |
|---|---|---|
| Page layout, sidebar, buttons, sliders, tabs | **React** | Declarative UI. Accessibility, forms, “the label says 0.4.” |
| Remember the planet’s **numbers** (settings) | **React state** | One source of truth. Both the slider and the canvas can agree. |
| Scene, camera, lights, meshes, GPU drawing | **Three.js** | WebGL, animation loop, 3D math. |
| Mouse orbit / zoom on the planet | **Three.js** (controls) | Happens every frame on the camera, not as a React re-render of the whole page. |
| “Sea level changed — update the ocean” | **Dialogue** | React writes the number; Three.js applies it to a mesh. |
| Language you type | **TypeScript** (Tutorial 03) | Both libraries are JS packages; you author in TS. |

React and Three.js are both **libraries**. TypeScript is the
**language**. “React framework” and “Three.js framework” in casual
speech still mean these toolkits, not two programming languages.

---

## The dialogue: settings in, 3D objects stay out of React state

The conversation is not Two.js calling React functions all day. It is
simpler:

1. React **owns a settings object** (in this app, `PlanetSettings`:
   radius, resolution, sea level, terrain layers, …).
2. A **control panel** component shows sliders. When you drag, it
   asks React to **set** new settings. The sidebar **re-describes**
   itself (Tutorial 03): the number next to the slider updates.
3. The same settings are **handed down** to a canvas component as
   **props** — values a parent gives a child.
4. That canvas component is a React wrapper around Three.js. When
   props change, it **mutates or rebuilds Three.js objects** (move a
   mesh, swap geometry, toggle `visible`). The live scene is kept in
   a **ref**: a sticky note React does *not* treat as “data that
   redraws the HTML.” The planet is not thrown away every time React
   paints the sidebar.

> **New term:** **props** (properties) are inputs passed into a
> component. `PlanetCanvas` does not invent sea level; it
> **receives** `settings`.

> **New term:** **state** is data React remembers. When state
> changes, React updates the *UI* that depends on it. Settings live
> in state. The `WebGLRenderer` and the sphere **mesh** do not.

> **New term:** a **ref** is a box React keeps for you that can hold
> anything (including a Three.js scene) **without** triggering a UI
> re-render when you change what is inside. This course’s planet
> canvas stores the live 3D objects in a `sceneRef` for that reason.

**The rule that saves you:** React state and props are **plain data**
(numbers, booleans, lists of layer descriptions). Three.js objects
are **engines** (they have GPU memory, they expect to be disposed, they
update 60 times a second). Put engines in a ref (or an entity/world
you will meet later). Put **messages** in state.

```text
[ Slider in ControlPanel ]
        |  user drags
        v
[ React state: settings.ocean.seaLevel = 0.12 ]
        |  passed as props
        v
[ PlanetCanvas reads settings ]
        |  updates Three.js ocean mesh / material
        v
[ Animation loop draws the scene ]
```

The planet builder is this diagram. `App` holds `settings`.
`ControlPanel` writes. `PlanetCanvas` reads and talks to Three.js.
Later, the 2D map does the same kind of thing with a different
surface.

**The other direction** (canvas → UI) is rarer in this app, but the
same idea: the 3D side would *not* edit the DOM. It would call a
function React provided (“the user picked this biome”), and React
would set state. Dialogue stays **data and callbacks**, not “Three.js
reaches into the slider.”

---

## Worked example

Let's do one fully, showing **every** step of the thinking.

**Problem:** The student moves **Sea level** from `0.05` to `0.20`.
What should React do? What should Three.js do? What should *not*
happen?

**Step 1. Who heard the mouse?** — *why:* the pointer is on a slider
in the sidebar, which is HTML. React owns that control.

The control panel’s job: “the sea level number is now `0.20`.” It
does not move vertices.

**Step 2. React updates the script.** — *why:* one pile of numbers
must stay true for the whole app.

`settings` in `App` becomes a new object with `ocean.seaLevel: 0.20`.
React re-describes the sidebar so the label matches. It also
re-renders `PlanetCanvas`, handing it the new `settings` **props**.

**Step 3. The canvas applies the message to the stage.** — *why:*
only Three.js knows how a sphere of water is built.

`PlanetCanvas` already has a scene, camera, renderer, planet mesh,
and ocean mesh in its **ref** (created once when the canvas mounted).
It reads `settings.ocean.seaLevel` and changes the ocean (radius,
material uniforms, visibility — the details are later tutorials). It
does **not** store the `THREE.Mesh` in `useState`.

**Step 4. The loop keeps painting.** — *why:* 3D is a movie, not a
single screenshot.

The animation loop was already running. The next frames show a higher
ocean. OrbitControls can still spin the camera; that never went
through the slider.

**Step 5. What would be the wrong dialogue?** — *why:* this is the
bug this rung exists to prevent.

Wrong: put `new THREE.Mesh(...)` into React state. React would try to
treat a live GPU object like a number, clone it, or rebuild the whole
scene on every keystroke.

Wrong: have Three.js `document.querySelector` the slider and read
`input.value` every frame. Then the UI and the 3D world can disagree,
and you have two sources of truth.

**Result:** React = booth + numbers. Three.js = stage + drawing.
Settings = the shared script. Sea level is a number in the script,
not a mesh in React.

---

## Your turn

Try these before looking at the solutions. They use only what you've
learned up to and including this rung.

1. In one sentence each, what job does **React** have in this app, and
   what job does **Three.js** have?

2. Name the four Three.js pieces you need before a sphere can appear.
   What do you usually see if a light or the camera is missing?

3. A classmate stores `planetMesh` in React state “so the UI can
   share it.” What goes wrong, and where should the mesh live instead?

4. Trace the sea-level slider: who writes the new number, what carries
   it to the canvas, and who changes the water?

5. Dragging the planet to spin it is interactive. Changing radius in
   the sidebar is also interactive. Why are those two *different*
   kinds of dialogue?

<details>
<summary><strong>Solutions</strong> (try first!)</summary>

1. **React:** layout and controls; it remembers **settings** and
   describes the HTML UI. **Three.js:** the 3D **scene** — camera,
   lights, meshes — and the **animation loop** that paints the
   canvas.

2. **Scene, camera, renderer, mesh** (geometry + material). Also a
   light for many materials. Missing camera or light → typically a
   **black** canvas.

3. A mesh is a live Three.js engine (GPU memory, not a plain number).
   React state is for data that re-describes the *UI*. The mesh
   belongs in a **ref** (or a later entity/world), updated when
   **props/settings** change.

4. **Control panel (React)** writes `settings`. **React state** holds
   it. **Props** carry it into **PlanetCanvas**. **Three.js** updates
   the ocean object. The **renderer** draws the next frames.

5. **Orbit** is Three.js talking to the **camera** every frame from
   mouse events on the canvas. **Radius** is React talking to
   **settings**, then the canvas **applying** that number to geometry.
   Same planet on screen; two channels.

</details>

---

## Common mistakes here

- **Asking React to draw the planet.** React places the `<canvas>`;
  Three.js paints it.
- **Asking Three.js to build the sidebar.** Sliders and labels stay
  React.
- **Meshes in `useState`.** Plain data in state; engines in a ref.
- **Two sources of truth.** If both the slider and the mesh “own”
  sea level, they drift. One settings object.
- **Recreating the whole scene on every slider tick** when only a
  material number changed. (Some changes *do* need new geometry —
  radius/resolution in this app — that is a deliberate rebuild, not
  “React forgot the scene.”)
- **Treating Three.js as a language or a second React.** It is a 3D
  library. You still write TypeScript.
- **Forgetting the animation loop.** A single `render` call is a
  snapshot; orbit and motion need the loop.

---

## Recap & next

**In one breath:** Three.js is the 3D library that owns the canvas
(scene, camera, renderer, meshes, loop); React is the UI library that
owns layout and settings; they talk by passing **plain data** (and
sometimes callbacks), never by stuffing live 3D objects into React
state.

You can now explain both roles and the settings dialogue. Next rung
(coming soon): **React components and JSX** — the spelling for the
sidebar and the canvas wrapper. After that, you will attach a real
Three.js scene to a `<canvas>`.

This repository’s map (read later, do not require it tonight):
`App.tsx` holds `settings`; `ControlPanel.tsx` writes; `PlanetCanvas.tsx`
reads and keeps Three.js in a `sceneRef`.

Official references (optional):
[Three.js manual](https://threejs.org/manual/),
[three on npm](https://www.npmjs.com/package/three).
