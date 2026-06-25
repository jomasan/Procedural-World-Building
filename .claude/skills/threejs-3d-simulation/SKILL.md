---
name: threejs-3d-simulation
description: Build interactive 3D scenes and simulations with Three.js using an object-oriented entity/system architecture. Use when creating Three.js scenes, simulations, or interactive 3D, and when modeling cameras, lights, meshes, and other objects as entities that live in a world and interact each frame. Produces clear OOP code where every Three.js object is an Entity inside a World system.
---

# Three.js 3D Simulation (Entity / System)

Build interactive 3D and simulations in Three.js as a **system of
entities**. Every Three.js object — a mesh, a light, the camera — is
wrapped in an `Entity` that lives in a `World`. The world owns the
scene, the render loop, and the registry of entities; entities update
themselves each frame and can query the world to find and react to other
entities. This turns a pile of imperative `scene.add(...)` calls into a
simulation where objects interact.

## The model

- **`Entity`** — base class. Owns one `THREE.Object3D` (mesh, light,
  camera group…). Has lifecycle hooks: `onAdd(world)`, `update(dt, world)`,
  `onRemove(world)`. Entities never start their own render loop and never
  reach for globals — everything comes through `world`.
- **`World`** (the system) — owns the `THREE.Scene`, `WebGLRenderer`,
  `Clock`, and a registry of entities. Drives one update loop: each frame
  it calls `update(dt, world)` on every entity, then renders. Entities are
  added/removed through the world so the scene graph and registry stay in
  sync.
- **Interaction** — an entity reaches other entities via the world
  (`world.byTag('planet')`, `world.get(id)`), reads their state, and
  responds in its own `update`. No entity mutates another's internals
  directly; it reads public state and adjusts itself. That keeps
  interactions explicit and traceable.

## Core code

`src/engine/Entity.ts`:

```ts
import * as THREE from 'three';
import type { World } from './World';

let nextId = 0;

export abstract class Entity {
  readonly id = nextId++;
  readonly tags = new Set<string>();
  abstract readonly object3d: THREE.Object3D;

  /** Called once when added to the world. Build/init here. */
  onAdd(_world: World): void {}
  /** Called every frame with delta-time in seconds. */
  update(_dt: number, _world: World): void {}
  /** Called once when removed. Dispose geometry/materials here. */
  onRemove(_world: World): void {}

  tag(...names: string[]): this {
    for (const n of names) this.tags.add(n);
    return this;
  }
}
```

`src/engine/World.ts`:

```ts
import * as THREE from 'three';
import { Entity } from './Entity';

export class World {
  readonly scene = new THREE.Scene();
  readonly renderer: THREE.WebGLRenderer;
  readonly clock = new THREE.Clock();
  private entities = new Map<number, Entity>();
  private activeCamera?: THREE.Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  add(entity: Entity): Entity {
    this.entities.set(entity.id, entity);
    this.scene.add(entity.object3d);
    entity.onAdd(this);
    return entity;
  }

  remove(entity: Entity): void {
    entity.onRemove(this);
    this.scene.remove(entity.object3d);
    this.entities.delete(entity.id);
  }

  get(id: number): Entity | undefined { return this.entities.get(id); }

  byTag(tag: string): Entity[] {
    return [...this.entities.values()].filter((e) => e.tags.has(tag));
  }

  setCamera(camera: THREE.Camera): void { this.activeCamera = camera; }

  start(): void {
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private tick(): void {
    const dt = this.clock.getDelta();
    for (const e of this.entities.values()) e.update(dt, this);
    if (this.activeCamera) this.renderer.render(this.scene, this.activeCamera);
  }

  private resize(): void {
    const { clientWidth: w, clientHeight: h } = this.renderer.domElement;
    this.renderer.setSize(w, h, false);
  }
}
```

## Concrete entities

Each kind of Three.js object becomes a small subclass. They build their
`object3d` in the constructor and react in `update`.

`src/entities/CameraEntity.ts`:

```ts
import * as THREE from 'three';
import { Entity } from '../engine/Entity';
import type { World } from '../engine/World';

export class CameraEntity extends Entity {
  readonly object3d = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

  constructor(position = new THREE.Vector3(0, 5, 10)) {
    super();
    this.object3d.position.copy(position);
    this.object3d.lookAt(0, 0, 0);
  }

  onAdd(world: World): void {
    world.setCamera(this.object3d);
    const cam = this.object3d;
    const fit = () => {
      const el = world.renderer.domElement;
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    };
    fit();
    window.addEventListener('resize', fit);
  }
}
```

`src/entities/LightEntity.ts`:

```ts
import * as THREE from 'three';
import { Entity } from '../engine/Entity';

export class LightEntity extends Entity {
  readonly object3d: THREE.Light;

  constructor(light: THREE.Light = new THREE.DirectionalLight(0xffffff, 1)) {
    super();
    this.object3d = light;
  }
}
```

`src/entities/Body.ts` — a simulated mesh that interacts with others:

```ts
import * as THREE from 'three';
import { Entity } from '../engine/Entity';
import type { World } from '../engine/World';

export class Body extends Entity {
  readonly object3d: THREE.Mesh;
  velocity = new THREE.Vector3();
  mass: number;

  constructor(radius = 1, color = 0x44aa88, mass = 1) {
    super();
    const geo = new THREE.SphereGeometry(radius, 32, 16);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.object3d = new THREE.Mesh(geo, mat);
    this.mass = mass;
  }

  update(dt: number, world: World): void {
    // interact: pull toward every other body tagged 'body'
    const G = 0.5;
    const acc = new THREE.Vector3();
    for (const other of world.byTag('body')) {
      if (other === this) continue;
      const b = other as Body;
      const dir = b.object3d.position.clone().sub(this.object3d.position);
      const dist2 = Math.max(dir.lengthSq(), 0.5);
      acc.add(dir.normalize().multiplyScalar((G * b.mass) / dist2));
    }
    this.velocity.addScaledVector(acc, dt);
    this.object3d.position.addScaledVector(this.velocity, dt);
  }

  onRemove(): void {
    this.object3d.geometry.dispose();
    (this.object3d.material as THREE.Material).dispose();
  }
}
```

## Wiring a simulation

```ts
import * as THREE from 'three';
import { World } from './engine/World';
import { CameraEntity } from './entities/CameraEntity';
import { LightEntity } from './entities/LightEntity';
import { Body } from './entities/Body';

const canvas = document.querySelector('canvas')!;
const world = new World(canvas);

world.add(new CameraEntity(new THREE.Vector3(0, 8, 16)));
world.add(new LightEntity(new THREE.AmbientLight(0xffffff, 0.3)));
world.add(new LightEntity(new THREE.DirectionalLight(0xffffff, 1)));

const sun = new Body(2, 0xffcc33, 40).tag('body');
world.add(sun);

const planet = new Body(0.6, 0x4488ff, 1).tag('body');
planet.object3d.position.set(8, 0, 0);
planet.velocity.set(0, 0, 4);
world.add(planet);

world.start();
```

## Conventions

- **TypeScript, `strict` on.** `npm create vite@latest sim -- --template
  vanilla-ts`, then `npm install three @types/three`.
- **Folder layout:**
  ```
  src/
    engine/      ← World, Entity, shared systems (input, physics helpers)
    entities/    ← one file per entity subclass (CameraEntity, Body, …)
    main.ts      ← compose the world: add entities, world.start()
  ```
- **One entity per file.** A subclass owns exactly one `object3d` and its
  lifecycle.
- **dt in seconds, every frame.** All motion scales by `dt` so behavior is
  framerate-independent. For deterministic physics, accumulate `dt` and
  step a fixed timestep inside `update`.
- **Entities interact through the world, not by holding refs to internals.**
  Query with `byTag`/`get`, read public fields, adjust yourself.
- **Dispose in `onRemove`.** Geometries, materials, and textures are not
  garbage-collected by Three.js — free them when an entity leaves.

## Gotchas

- **`setAnimationLoop`, not `requestAnimationFrame`.** It's the supported
  loop (and the one that works in WebXR). The world owns the single loop;
  entities must never start their own.
- **Memory leaks from undisposed resources.** Every `Geometry`/`Material`/
  `Texture` you create must be `.dispose()`d in `onRemove`, or removing
  entities leaks GPU memory.
- **Canvas sizing.** Use `renderer.setSize(w, h, false)` (the `false` keeps
  CSS sizing) and update the camera `aspect` + `updateProjectionMatrix()`
  on resize, or the scene stretches.
- **Update order is registry order.** If entity B must read A's *new*
  position, either order their insertion, or split into read-phase /
  write-phase passes for order-independence.
- **Black screen = no light or no camera set.** `MeshStandardMaterial`
  needs a light; the world renders nothing until `setCamera` is called
  (the `CameraEntity` does this in `onAdd`).

