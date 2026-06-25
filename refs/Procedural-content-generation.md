# Key Algorithms in *Procedural Content Generation in Games*

**Shaker, Togelius & Nelson (eds.), Springer 2016**

A chapter-by-chapter outline of the main algorithms in the book, with pseudocode and code snippets. Notation follows the book; pseudocode is reproduced or condensed from the original text.

---

## Contents

1. [Foundations & taxonomy](#1-foundations--taxonomy)
2. [The search-based approach (Ch. 2)](#2-the-search-based-approach-ch-2)
3. [Constructive methods for dungeons & levels (Ch. 3)](#3-constructive-methods-for-dungeons--levels-ch-3)
4. [Fractals, noise & agents for landscapes (Ch. 4)](#4-fractals-noise--agents-for-landscapes-ch-4)
5. [Grammars & L-systems (Ch. 5)](#5-grammars--l-systems-ch-5)
6. [Rules & mechanics (Ch. 6)](#6-rules--mechanics-ch-6)
7. [Planning for quests & story (Ch. 7)](#7-planning-for-quests--story-ch-7)
8. [Answer Set Programming (Ch. 8)](#8-answer-set-programming-ch-8)
9. [Representations for search-based methods (Ch. 9)](#9-representations-for-search-based-methods-ch-9)
10. [Experience-driven PCG (Ch. 10)](#10-experience-driven-pcg-ch-10)
11. [Mixed-initiative creation (Ch. 11)](#11-mixed-initiative-creation-ch-11)
12. [Evaluating generators (Ch. 12)](#12-evaluating-generators-ch-12)

---

## 1. Foundations & taxonomy

Two core paradigm distinctions frame every algorithm in the book:

- **Constructive vs. generate-and-test.** A *constructive* method builds content in a single pass and never undoes its work, relying on the construction process itself to guarantee validity (e.g. agent diggers, BSP, L-systems). A *generate-and-test* method produces a candidate, evaluates it, and rejects/regenerates if it fails some test (e.g. search-based PCG, ASP solving).
- **Online vs. offline**, **necessary vs. optional**, **generic vs. adaptive**, **stochastic vs. deterministic**, and **degree of control** are the other taxonomy axes used to classify each method.

Desirable properties to trade off: **speed, reliability, controllability, expressivity/diversity, creativity.**

---

## 2. The search-based approach (Ch. 2)

The generate-and-test paradigm taken to its conclusion: search a space of content using an optimization algorithm guided by an **evaluation (fitness) function**. Three ingredients: a **search algorithm**, a **content representation** (genotype→phenotype mapping), and an **evaluation function**.

### 2.1 The (μ + λ) Evolution Strategy

The book's canonical evolutionary loop (μ = elite kept between generations, λ = offspring generated each generation; e.g. μ = λ = 50):

```
1. Initialise a population of (μ + λ) individuals
   (random, hand-designed, or from previous runs).
2. Shuffle the population (optional; helps escape loss-of-gradient).
3. Evaluate every individual → assign each a single numeric fitness.
4. Sort the population by ascending fitness.
5. Remove the λ worst individuals.
6. Replace them with copies (offspring) of the μ survivors.
7. Mutate the λ offspring (perturb randomly).
   - For real-valued vectors: Gaussian mutation
     (add N(0, σ) with small σ to each component).
8. If an individual is good enough OR max generations reached → stop.
   Otherwise go to step 2 (next generation).
```

Notes from the text:
- Implementable in 10–20 lines; even the degenerate **(1 + 1) ES** works well.
- **Genetic algorithms** are an alternative emphasizing recombination/crossover over mutation, with different selection.
- For short real-valued vectors, **CMA-ES** (Covariance Matrix Adaptation) is especially effective.
- For runnable programs / expression trees, use **genetic programming**.
- Non-evolutionary alternatives: exhaustive search (tiny spaces), random search (diversity-first), swarm methods (PSO, ant colony), and solver-based search (ASP, Ch. 8).

### 2.2 Multi-objective optimization

When one number can't capture quality, optimize several objectives at once and keep the **non-dominated (Pareto) set**.

- **Weighted sum**: simple, but some objectives get optimized at the expense of others.
- **NSGA-II**: the most popular multi-objective EA.
- **SMS-EMOA**: used for the StarCraft-map example (2–3 objectives).
- **Cascading elitism**: used for racing tracks — several selection stages, one per objective, to keep selection pressure on all.

### 2.3 Evaluation function types

| Type | Idea |
|------|------|
| **Direct** | Map content features straight to a quality score (e.g. count unreachable tiles). |
| **Simulation-based** | Run an AI agent on the content; derive fitness from how it plays (e.g. trained car controllers rating a track). |
| **Interactive** | A human supplies the fitness (used in interactive evolution, Ch. 11). |

### 2.4 Worked example — Galactic Arms Race weapons

A whole game acting as a **distributed, collective evolutionary algorithm**: weapons fired more often by players get higher fitness and higher probability of being evolved; new weapons are spawned into the world.

---

## 3. Constructive methods for dungeons & levels (Ch. 3)

### 3.1 Binary Space Partitioning (BSP) dungeons

Recursively split a rectangular area, place one room per leaf cell, then connect siblings.

```
1. Start with the whole dungeon area (root of the BSP tree).
2. Divide the area along a horizontal or vertical line
   (split position chosen randomly; cells need not be equal).
3. Select one of the two new partition cells.
4. If this cell is bigger than the minimal acceptable size
   (e.g. min width w/4, min height h/4):
5.    go to step 2 using this cell as the area to divide.
6. Select the other partition cell and go to step 4.
7. For every partition (leaf) cell:
8.    create a room inside it by randomly choosing two points
      (top-left and bottom-right) within its boundaries.
9. Starting from the lowest layers, draw corridors connecting
   rooms that are children of the same parent in the BSP tree.
10. Repeat step 9 up the tree until the root's children are connected.
```

A simpler **quadtree** variant subdivides into four equal cells per level; corridors can be added by random or rule-based processes.

### 3.2 Agent-based dungeon "digging"

**(a) Blind stochastic digger** — no look-ahead; can overlap rooms / make dead ends. Direction-change and room-add probabilities grow over time and reset on use:

```
1. Pc = 5        // chance of changing direction (%)
2. Pr = 5        // chance of adding a room (%)
3. Place digger at a random tile; randomize its direction
4. Dig one tile along the current direction
5. Roll Nc in [0,100]
6. if Nc < Pc:
7.    randomize direction
8.    Pc = 0
9. else:
10.   Pc = Pc + 5
11. Roll Nr in [0,100]
12. if Nr < Pr:
13.   randomize room width & length in [3,7]
14.   place room around the agent; Pr = 0
15. else:
16.   Pr = Pr + 5
17. if dungeon not large enough: go to step 4
```

**(b) Look-ahead ("informed") digger** — checks for intersections before placing, eliminating overlaps and dead ends:

```
1. Place the digger at a dungeon tile
2. Fr = 0, Fc = 0      // "placed room?" / "placed corridor?" flags
3. for all possible room sizes:
       if a potential room will not intersect existing rooms:
           place the room; Fr = 1; break
7. for all possible corridors (any direction, length 3..7):
       if a potential corridor will not intersect existing rooms:
           place the corridor; Fc = 1; break
   // stop when neither a room nor a corridor can be added anywhere
```

### 3.3 Cellular automata caves (Johnson et al.)

Produces organic, eroded-looking cave rooms. Parameters: rock percentage `r`, number of CA generations `n`, neighbourhood rock threshold `T` (=5), neighbourhood size.

```
For each 50×50 room:
1. Sprinkle: each cell becomes rock with probability r (e.g. 0.5).
2. Repeat n times (e.g. 2):
      for each cell:
          rock_neighbours = count of rock cells in its neighbourhood
          if rock_neighbours >= T:  cell → rock
          else:                     cell → free space
3. Mark rock cells bordering empty space as "wall" cells.

Connecting rooms:
- When a room is generated, also generate its neighbours.
- If the two largest empty regions of adjacent rooms aren't connected,
  drill a tunnel between them at the point of least separation.
- Run 2 more CA iterations across all 9 neighbouring rooms to smooth edges.
```

Very fast (all nine rooms in < 1 ms), but parameters are hard to reason about individually.

### 3.4 Grammar-based dungeons (Dormans; van der Linden)

Two-stage generative-grammar pipeline (detailed in Ch. 5):

1. A **graph grammar** generates a *mission* as a directed graph of sequential player tasks.
2. The mission graph is abstracted to nodes/edges and fed to a **shape grammar** that generates the corresponding *game space*.

Van der Linden et al. generalize this to **gameplay grammars**: designers author a vocabulary of player actions + sequencing constraints, which directly defines a graph grammar; generated action graphs are then mapped to dungeon geometry.

### 3.5 Platform-level case studies

- **Spelunky**: template-based room stitching along a guaranteed solution path.
- **Infinite Mario Bros.**: left-to-right placement of chunks (gaps, hills, enemies, pipes, coins) with probabilistic parameters.

---

## 4. Fractals, noise & agents for landscapes (Ch. 4)

Terrain is usually a **heightmap** (2D array of elevations). Filling it with independent random values yields useless "spikes"; nearby heights must be correlated.

### 4.1 Interpolated noise

Generate random values on a coarse lattice, then interpolate between them.

- **Bilinear interpolation** — linear weighted average along x then y. Cheap, but slopes are straight lines and peaks/valleys are sharp:
  `height[0,1] = 0.9·height[0,0] + 0.1·height[0,10]` (for a 1/10 lattice).
- **Bicubic / cosine interpolation** — S-curve profiles between lattice points; smoother, no sharp discontinuities (better for collision detection).
- **Gradient (Perlin) noise** — interpolates random *gradients* rather than values.

### 4.2 Fractal terrain via 1/f noise

Sum several scales of single-scale noise, scaling each layer by the inverse of its frequency:

```
1/f noise:  noise(f) + ½·noise(2f) + ¼·noise(4f) + ...
```

Larger-scale features get larger magnitude (mountains rise from plains more than boulders rise from slopes). This approximates **fractional Brownian motion (fBm)**.

### 4.3 Diamond-Square algorithm

An efficient, game-friendly fBm approximation on a heightmap whose side is `2ⁿ + 1`.

```
1. Seed the four corners of the heightmap (possibly random).
2. Repeat for each square at the current scale:
   a. DIAMOND step: set the square's centre to the average of its
      four corners + a random offset of magnitude `roughness`.
   b. SQUARE step: set each of the four edge-midpoints to the average
      of the two adjacent corners and the centre + a random offset.
3. Reduce `roughness`, halve the cell size, and repeat
   on the four sub-squares created.
4. Stop after a set number of iterations.
```

`roughness` controls terrain ruggedness (large → rough, small → smooth).

### 4.4 Agent-based terrain (Doran & Parberry)

Five agent types act concurrently across three phases, each agent limited by a *token* budget (controls level of detail; fewer tokens ⇒ more agents needed):

- **Coastline phase** — *coastline agents* raise land above sea level.
- **Landform phase** — *smoothing*, *beach*, *mountain* agents shape detail.
- **Erosion phase** — *river agents* carve rivers (one per agent).

Coastline-agent inner loop:

```
- Assign the agent a seed point on the map edge, a direction,
  and a number of tokens.
- If the current point is already land, search along the direction
  for a fresh starting point.
- To raise a point above sea level:
    a. generate two random points: an attractor and a repulser
    b. collect candidate points for elevation
    c. score each by distance (closer to attractor ⇒ higher score)
    d. elevate the highest-scoring point; it joins the coastline
    e. move to another point and repeat
```

### 4.5 Search-based terrain

- **Genetic Terrain Programming** — evolve terrain-generating functions.
- **Simple RTS map generation** — evolve maps against playability/balance objectives.

---

## 5. Grammars & L-systems (Ch. 5)

### 5.1 Formal grammars

A grammar is a set of **production rules** that rewrite strings, e.g.:

```
1. A → AB
2. B → A
```

Two rewriting orders matter: **sequential** (rewrite left-to-right as you read) vs. **parallel** (rewrite everything simultaneously).

### 5.2 L-systems

L-systems are grammars defined by **parallel rewriting** (Lindenmayer, 1968, for modelling organic growth). Starting from an **axiom** and applying `A → AB`, `B → A`:

```
A → AB → ABA → ABAAB → ABAABABA → ...
```

String lengths follow the Fibonacci sequence.

**Turtle-graphics interpretation** turns strings into drawings:

- `F` : move forward (e.g. 10 px)
- `+` : turn left 90°
- `-` : turn right 90°

The single rule `F → F+F−F−F+F` (axiom `F`) draws the **Koch curve** after successive expansions.

**Bracketed L-systems** add `[` and `]` as stack push/pop, enabling branching plants:

```
Rule:  F → F[−F]F[+F][F]      (turn angle 30°, axiom F)
[  : push current turtle position/orientation onto the stack
]  : pop, returning the turtle to the last saved position
```

This produces strikingly plant-like structures; extends to 3D with roll symbols.

**Evolving L-systems**: a canonical GA with crossover/mutation evolves the right-hand sides of the rules against a fitness function.

### 5.3 Graph grammars for missions

Generate a mission as a directed graph of player tasks by repeatedly matching a left-hand-side subgraph and rewriting it. The mission graph is then realized as physical space by a **shape grammar** (space accommodates mission). The process is typically broken into multiple staged generation steps.

### 5.4 Grammatical Evolution (GE)

Evolves variable-length **integer vectors (codons)**; a **BNF grammar** maps genotype → phenotype.

Example BNF (mathematical expressions):

```
(1) <exp> ::= <exp> <op> <exp>
            | ( <exp> <op> <exp> )
            | <var>
(2) <op>  ::= + | - | * | /
(3) <var> ::= X
```

**Genotype→phenotype mapping** uses `codon % (number of choices)` to pick a production:

```
Genome (4,5,8,11), start <exp>:
  4 % 3 = 1 → <exp> becomes ( <exp> <op> <exp> )
  5 % 3 = 2 → first <exp> becomes <var> → X        (no choice for <var>)
  8 % 4 = 0 → <op> becomes +
  11 % 3 = 2 → <exp> becomes X
  Result: ( X + X )
```

If genes run out: either declare the individual invalid (penalty fitness) or **wrap around** and reuse codons. Shaker et al. apply GE to generate Infinite Mario Bros. levels (grammar describes level structure; easy domain-knowledge incorporation).

---

## 6. Rules & mechanics (Ch. 6)

Generating *rules* rather than levels — mostly search-based over rule encodings.

### 6.1 Board games

- **Symmetric, chess-like games** — evolve piece movement rules.
- **Balanced board games** — evaluate via game-theoretic balance.
- **Evolutionary game design (Browne — Ludi / Yavalath)** — represent rules as symbolic **rule trees**; apply crossover and mutation to rule sets; evaluate generated games by self-play against aesthetic/quality criteria (e.g. drawishness, decisiveness, depth). Yavalath is a commercially successful, fully computer-generated game.

### 6.2 Video games

- **"Automatic Game Design"** — evolve Pac-Man-like grid-world rulesets.
- **Variations Forever** — *sculpt* a rule space with ASP-style constraints rather than search a single ruleset.
- **Angelina** — co-generates rules, levels and aesthetics for whole games.
- **VGDL (Video Game Description Language)** — a compact language encoding early-1980s arcade games, designed to make whole-game generation tractable. Defines sprite sets, level mappings, interaction sets and termination conditions.

---

## 7. Planning for quests & story (Ch. 7)

Story generation is overwhelmingly based on **AI planning**: find a sequence of operators transforming an initial state into a goal state.

### 7.1 State-space search

```
1. Construct the root node = initial state.
2. Select a non-terminal node.
     - if none found → return failure.
     - if it is the goal state → return path (initial→current) as solution.
3. Select an applicable operator
     (preconditions true in forward search;
      effects true in backward regression search).
     - if none → mark node terminal, go to 2.
4. Construct child nodes by applying the operator.
     - if #nodes exceeds the search-node maximum → return failure.
5. Go to step 2.
```

### 7.2 Partial-Order Planning (POP)

Searches a space of (partial) plans, repairing **flaws** (open preconditions / threats):

```
1. Root node = the planning problem (initial + goal state).
2. Select a non-terminal node (by heuristic value).
3. Select a flaw in the node.
     - if no flaw → return the node as a solution.
4. Construct children by repairing the flaw:
   If the flaw is an OPEN PRECONDITION, either
     a) establish a causal link from an existing plan step, or
     b) add a new plan step whose effects imply the precondition.
   If the flaw is a THREAT, either
     a) add an ordering constraint protecting the causal link, or
     b) add a binding constraint separating threat from the link.
```

POP yields partial orderings (only the necessary sequencing) rather than fully linearized plans.

### 7.3 STRIPS representation

States are conjunctions of ground, function-free **literals** under a **closed-world assumption** (anything unstated is false). Actions have **preconditions** and **effects** (effects may include negatives):

```
Initial:  At(Alex,Rooftop) ∧ Alive(Alex) ∧ Walkable(Rooftop,Ground)
          ∧ Person(Alex) ∧ Place(Rooftop) ∧ Place(Ground)

Goal:     At(Alex,Ground) ∧ Alive(Alex)

Action(WalkStairs(p, from, to))
  PRECONDITION: At(p,from) ∧ Walkable(from,to) ∧ Person(p)
                ∧ Place(from) ∧ Place(to)
  EFFECT:       ¬At(p,from) ∧ At(p,to)
```

### 7.4 ADL (Action Description Language)

Extends STRIPS with: positive **and** negative literals under open-world semantics; quantifiers and disjunction in goals; conditional effects; equality/inequality predicates and typed variables (e.g. `(p: Person)`, `(from ≠ to)`).

### 7.5 Joint world + story generation

Generate a story plan and a game **world** together: derive space from the story ("from story to space"), then schedule story execution ("from story to time") so the map fits the narrative.

---

## 8. Answer Set Programming (Ch. 8)

A **solver-based** (declarative) approach: state constraints in **AnsProlog**; a solver (e.g. *clingo* from Potassco) returns **answer sets** = all content configurations satisfying the constraints. Workflow: constructively **define a design space**, then **add constraints** that prune unwanted parts.

### 8.1 Core syntax

```prolog
% Implication ( :- reads "if" ). Variables Capitalized; atoms lowercase.
impassable(Tile) :- contains(Tile, wall).

% Choice rule: between 5 and 10 walls, solver chooses which tiles.
5 { contains(T, wall) : tile(T) } 10.

% Unbounded choice: any number of walls.
{ contains(T, wall) : tile(T) }.

% Integrity constraint (empty head): reject worlds with a wall at (1,1).
:- contains((1,1), wall).
```

### 8.2 Perfect mazes (a tree embedded in a grid)

Each non-root tile picks exactly one parent direction (`maze-core.lp`):

```prolog
#const width = 5.
dim(1..width).

1 { parent(X,Y, 0,-1),
    parent(X,Y, 1, 0),
    parent(X,Y,-1, 0),
    parent(X,Y, 0, 1) } 1 :-
      dim(X), dim(Y), (X,Y) != (1,1).
```

Enforce that the root `(1,1)` is reachable from every tile (`maze-reach.lp`):

```prolog
linked(1,1).
linked(X,Y) :- parent(X,Y,DX,DY), linked(X+DX, Y+DY).
:- dim(X;Y), not linked(X,Y).
```

Add a **soft constraint** (optimization) to discourage vertical links (`maze-bias.lp`):

```prolog
vertical(X,Y) :- parent(X,Y,0, 1).
vertical(X,Y) :- parent(X,Y,0,-1).
#minimize { vertical(X,Y) }.
```

Run with: `clingo maze-core.lp maze-reach.lp maze-bias.lp`

The same generate-then-constrain pattern scales up to **playable dungeons** (sprites: player start, gem, altar, exit, with guaranteed solvability and pacing constraints) and to **constraining the entire space of play**.

---

## 9. Representations for search-based methods (Ch. 9)

The genotype→phenotype representation shapes both the search space and the *appearance* of results. Different dungeon encodings (direct matrix, room-list "negative", positive/required-content, etc.) evolved against similar fitness yield visibly different styles.

### 9.1 Fantasy RPG level pipeline

Stages: **required content** → **map generation** → **room identification** → **graph generation** → **room population**. The map is evolved with a chromosome of `2N` integer loci for `N` required-content objects (positions taken modulo side length); overlapping objects get maximally bad fitness, so crossover/mutation increase diversity while preserving required pieces.

### 9.2 Compositional Pattern-Producing Networks (CPPNs)

A CPPN is an ANN variant used as a **pattern generator**. A neuron's activation:

```
y_i = σ( Σ_j  w_ij · x_j )            (Eq. 9.1)

Traditional ANN activation: sigmoid  σ(x) = 1 / (1 + e^(−kx))   (Eq. 9.2)
```

CPPN differences from a standard ANN:

- A **library of activation functions**, not just sigmoid — e.g. **sine** (repetition), **Gaussian** (symmetry), **linear** (straight lines) — mirroring patterns common in nature.
- **Queried across a coordinate domain** (e.g. every `(x,y)`), so the network *is* a complete image; resolution-independent because it is a composition of functions.

```
For each pixel/coordinate (x, y):
    intensity(x, y) = CPPN(x, y)      // colour / ink / height / etc.
```

### 9.3 NEAT (NeuroEvolution of Augmenting Topologies)

Evolves the CPPN/ANN itself by **complexification**:

```
- Start with a population of minimal networks (no hidden nodes).
- Over generations, mutations add new nodes and new connections.
- The topology is discovered automatically (user need not fix #neurons).
- Networks grow more complex/intricate as evolution proceeds.
```

Applications in the book:
- **Petalz** flowers — input **polar** coords `{θ, r}`; query `{θ, 0}` and feed `sin(Pθ)` (radial symmetry; `P` ≈ max petal count). Deform a circle into the petal outline, then colour by the CPPN pattern.
- **Galactic Arms Race** weapons — particle-system weapons whose firing patterns are CPPN-encoded and evolved by player use.

### 9.4 Generating level generators

Take representation to its limit: evolve the **content generator** itself (a "procedural procedural level generator generator"), judging it on a sample of its near-infinite output rather than a single artefact — e.g. Mario level generators encoded as parameters of agent-based systems.

---

## 10. Experience-driven PCG (Ch. 10)

Close the loop with the player: model player experience, then drive generation to optimize it.

### 10.1 Player-experience modelling pipeline

```
1. Model INPUT / feature extraction:
   - gameplay features (behaviour, performance, choices)
   - controller/objective signals (physiology, etc.)
2. Model OUTPUT / experience annotation:
   - the target affective/experience label (fun, frustration, challenge...)
3. Modelling APPROACH (input → output mapping):
   - subjective    (self-reports / questionnaires / rankings)
   - objective     (physiological & behavioural measures)
   - gameplay-based (in-game metrics)
   Learn the mapping via classification/regression/preference learning.
```

### 10.2 Personalized Super Mario Bros. generator

A **grammar-based personalised level generator**: model the player's experience from gameplay, then use the model as the evaluation function to select/generate level segments (via the grammar) tailored to that player.

---

## 11. Mixed-initiative creation (Ch. 11)

Human designer and generator collaborate. Two main algorithmic ingredients:

- **Interactive evolution** — the human acts as the fitness function. Key problem: **user fatigue** (a human can only evaluate so many candidates). Mitigations: present few candidates per generation, cluster/diversify the population, blend human ratings with automated surrogate fitness, and seed with promising individuals.
- **CAD / creativity-support tools** — the generator continuously suggests, completes, or critiques the designer's in-progress artefact (e.g. Tanagra for platformers, Sentient Sketchbook for strategy maps).

---

## 12. Evaluating generators (Ch. 12)

How to assess a generator once built — two complementary directions:

- **Top-down / expressivity** — characterize the *range* of a generator independent of players:
  - **Expressive-range analysis**: pick 2+ content metrics (e.g. linearity, leniency), generate many artefacts, and plot the 2D heatmap of where the generator's output lands.
  - Examine **controllability**: how reliably parameters move output through that space.
- **Bottom-up / players** — measure experience directly via questionnaires and play. Beware self-reporting limits; prefer **pairwise/ranking** questionnaires over absolute ratings, and triangulate with behavioural/physiological data.

---

## Quick algorithm index

| Algorithm | Chapter | Paradigm |
|-----------|---------|----------|
| (μ+λ) Evolution Strategy, GA, CMA-ES | 2, 9 | Search / generate-and-test |
| NSGA-II, SMS-EMOA, cascading elitism | 2 | Multi-objective search |
| Binary Space Partitioning | 3 | Constructive |
| Agent-based digger (blind / look-ahead) | 3, 4 | Constructive (agent) |
| Cellular automata caves | 3 | Constructive |
| Graph + shape grammars (missions/spaces) | 3, 5 | Grammar |
| Interpolated / gradient (Perlin) noise | 4 | Constructive (noise) |
| 1/f noise, fBm | 4 | Fractal |
| Diamond-Square | 4 | Fractal |
| Doran & Parberry agents | 4 | Constructive (agent) |
| L-systems / bracketed L-systems | 5 | Grammar |
| Grammatical Evolution (BNF + codons) | 5, 10 | Search + grammar |
| Evolutionary game design (rule trees) | 6 | Search |
| VGDL | 6 | Encoding |
| State-space & partial-order planning | 7 | Planning |
| STRIPS / ADL | 7 | Planning representation |
| Answer Set Programming (AnsProlog/clingo) | 8 | Solver / constraint |
| CPPN + NEAT | 9 | Search + representation |
| Player-experience modelling | 10 | Adaptive |
| Interactive evolution | 11 | Mixed-initiative |
| Expressive-range analysis | 12 | Evaluation |

---

*Outline compiled from* Procedural Content Generation in Games *(Shaker, Togelius & Nelson, eds., Springer 2016). Pseudocode and code snippets are condensed/transcribed from the book's own listings.*