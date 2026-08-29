# 03 — What React is, and why TypeScript

> **Where this sits:** rung 03 of the ladder. Builds on
> [01 — The terminal](01-terminal-and-setup-checks.md) and
> [02 — Node.js, npm, and installing React](02-node-npm-and-react.md).
> Leads to
> [04 — Three.js and talking to the React UI](04-threejs-and-react-dialogue.md).

## Before you start

**Prerequisites:** tutorials 01 and 02. If you can run a terminal, you
have Node/npm, and you have (or could create) a Vite React app, you are
ready. You do **not** need to have written any React code yet. This
rung is the *idea*, not the typing.

**What you'll be able to do after this rung:**
- Explain React’s core paradigm in plain language: you **describe** the
  screen from data; React updates the page
- Say what a **component** is, without yet writing one
- Explain that React is a **library**, not a programming language, and
  name the languages people actually write React in
- Explain what **TypeScript** is relative to **JavaScript**, and why
  **this course uses TypeScript**

---

## The idea, from zero

Imagine two ways to keep a classroom whiteboard in sync with a list of
names.

**Way A — give orders.** “Erase the third name. Write Maya under Ben.
Move the heading down two inches.” You must remember what is already on
the board. Miss a step and the board is wrong. This is **imperative**:
you spell out *how* to change the picture.

**Way B — describe the picture.** You hold up a card that says “the
board should show exactly these names, in this order.” Someone else
looks at the card, looks at the board, and makes the smallest changes
so they match. You never say “erase” or “move.” This is
**declarative**: you say *what* the picture should be.

React is Way B for websites.

You keep **data** in your program (a planet’s name, a sea level, a list
of biomes). You write small recipes that say, “given this data, the
screen looks like *this*.” When the data changes, React compares the
new description to what is on screen and updates the page. You do not
hunt through HTML by hand (`document.getElementById`, changing styles
one line at a time) as your main way of working.

> **New term:** a **component** is one named recipe for a piece of the
> UI — a button, a sidebar, a whole planet viewport. You combine
> components the way you snap Lego bricks. The next tutorial is where
> you write your first one.

> **New term:** **UI** means user interface — everything the human sees
> and clicks. React’s job is building UIs.

That is the paradigm: **the screen is a function of the data.** Change
the data; the components describe a new screen; React makes the browser
match it.

React is **not** a programming language. It is a **library** (you
already installed it as the `react` package in Tutorial 02): a toolkit
written in JavaScript that your code *calls*. People sometimes say “the
React framework” to mean “a React project and its tools.” In this
course we will be precise: **React = the UI library. Your language =
how you write the code that uses it.**

---

## Languages: React talks JavaScript; you may write something that becomes JavaScript

A browser does not run Python, Java, or TypeScript. It runs
**JavaScript**. Node.js, from Tutorial 02, also runs JavaScript.

So every React app, in the end, is JavaScript calling the `react`
library. The question is only: **in which language do *you* type?**

| How you write | What the computer actually runs | Typical files |
|---|---|---|
| **JavaScript** | JavaScript (as you wrote it, plus a build tool for JSX) | `.js`, `.jsx` |
| **TypeScript** | JavaScript **compiled** from your TypeScript | `.ts`, `.tsx` |
| Other compile-to-JS languages (less common in this course) | JavaScript produced by that language’s compiler | varies |

> **New term:** to **compile** (here) means “translate this language
> into JavaScript before the browser runs it.” Vite, from Tutorial 02,
> does that translation while you work. You still think in the
> language you typed.

**TypeScript** is JavaScript plus **type annotations** — little labels
that say what *kind* of value something is (`string` for text, `number`
for a number, and so on). Those labels are for you, your editor, and
the compiler. They are **stripped out** before the browser sees the
code. React does not need a special “TypeScript edition” of itself; it
is the same `react` package. TypeScript just *describes* that package
more strictly.

> **New notation:** we write `name: string`, read “name, colon, string.”
> It means “`name` is supposed to be text.” That extra `: string` is a
> **type annotation**. JavaScript would just say `name` with no label.

A tiny side-by-side (this is **not** React yet — only the language
difference):

```js
// JavaScript
function greet(name) {
  return "Hello, " + name;
}
```

```ts
// TypeScript — same function, with a label on the input
function greet(name: string) {
  return "Hello, " + name;
}
```

If you later call `greet(42)` by mistake, TypeScript can warn you
*before* the page runs. JavaScript would happily build `"Hello, 42"`
and you would debug it by eye.

**Other languages.** A few communities write React-like UIs in
languages that also compile to JavaScript (for example ReScript). That
is optional trivia. You will **not** write React in Python or C++ in
the browser; those ecosystems have different UI libraries. If someone
says “React in language X,” the honest test is: *does X become
JavaScript (or otherwise sit on the JS runtime) so it can import the
`react` package?*

**JSX / TSX** (preview only). React components are often written with a
HTML-like syntax mixed into the code. In a JavaScript file that is
usually **JSX** (`.jsx`). In a TypeScript file it is **TSX** (`.tsx`).
Same idea; TSX is JSX plus TypeScript. Tutorial 04 will teach you to
write it. Tutorial 02’s Vite template `react-ts` already created `.tsx`
files for that reason.

---

## This course chooses TypeScript

We are not choosing “a different React.” We are choosing **TypeScript as
the language we write our React apps in** — a very popular pairing, and
the one this repository already uses (`React TS Site/my-react-ts-app/`).

Reasons, in order:

1. **It matches this project.** The planet builder is TypeScript. Skills
   you learn here transfer into the real codebase.
2. **It is the usual professional default** for new React apps: Vite’s
   `react-ts` template, React’s own docs examples, and most team
   codebases.
3. **Types catch mistakes early** — wrong kind of value, missing
   argument — which matters as soon as the UI has more than one slider
   and one mesh.
4. **The browser still runs JavaScript.** You are not learning a
   parallel universe. You are learning JavaScript with seatbelts, then
   using React the same way JS developers do.

You do **not** need to master TypeScript today. We will introduce
annotations when a component actually needs them. If a type error
appears in the editor, treat it like a spelling check: read it, fix
the mismatch, continue.

If you ever open a `.jsx` example from the internet, the React
*paradigm* is the same. You would add type labels (or paste it into a
`.tsx` file and let the editor complain until it lines up).

---

## Worked example

Let's do one fully, showing **every** step of the *thinking*, not yet
the finished app.

**Problem:** A page should show the planet’s name. The name starts as
`Terra` and later becomes `Kepler`. Contrast the imperative habit with
React’s declarative habit, then say which language this course uses
for that code.

**Step 1. Imperative picture (the “give orders” way)** — *why:* this is
how many first HTML/JS lessons work, so we need it as a foil.

You might think:

1. Find the heading in the page.
2. Set its text to `Terra`.
3. Later, when the name changes, find the heading **again**.
4. Set its text to `Kepler`.
5. Hope nothing else also needed to change (the tab title, a list
   item, a 3D label).

Every extra place the name appears is another order you must remember.

**Step 2. React’s picture (the “describe the board” way)** — *why:*
this is the paradigm you will use for the rest of the course.

You keep a piece of data: `planetName = "Terra"`. A component says, in
effect, “the heading’s text **is** `planetName`.” When something sets
`planetName` to `"Kepler"`, React runs the description again and
updates whatever on the page depended on that data. You do not write
the find-and-replace steps for each widget.

**Step 3. Which language holds that description?** — *why:* React will
do the same job in JS or TS; we still have to pick how we type.

- JavaScript: the component file might be `PlanetTitle.jsx`.
- TypeScript (this course): the same component is `PlanetTitle.tsx`,
  with labels on props when we get there (`name: string`).
- Vite already chose this for you in Tutorial 02: `--template react-ts`.

**Step 4. What the browser sees** — *why:* so “TypeScript React” does
not sound like a second React.

Vite compiles the `.tsx` file to JavaScript. The browser loads that JS,
which imports the `react` library from `node_modules`. One React, one
runtime, two possible *author* languages. We author in TypeScript.

**Result:** React is the declarative UI library; TypeScript is how this
course writes the components; JavaScript is what actually runs.

---

## Your turn

Try these before looking at the solutions. They use only what you've
learned up to and including this rung.

1. In one or two sentences: is React a language, a library, or a
   framework? What is its main idea (the paradigm)?

2. A friend says, “TypeScript is a popular implementation of the React
   framework.” What would you correct, gently, so the picture is
   accurate?

3. Why can you write React in TypeScript even though the browser only
   runs JavaScript?

4. Name one reason **this course** uses TypeScript rather than plain
   JavaScript. Name one thing TypeScript is *not*.

5. (Uses Tutorial 02.) You ran `npm create vite@latest hello-react --
   --template react-ts`. What did `react-ts` choose for you, in the
   language of this rung?

<details>
<summary><strong>Solutions</strong> (try first!)</summary>

1. React is a **library** for building UIs (people loosely say
   “framework” for the whole project). It is **not** a language. The
   paradigm: you **describe** the screen from **data**; when data
   changes, React updates the page. Work happens in **components**.

2. TypeScript is a **language** (JavaScript plus type labels), not an
   implementation of React. React is one library. You *use* that
   library while writing TypeScript (or JavaScript). “Popular pairing”
   is the right idea; “TS is a kind of React” is the mix-up.

3. A **compiler** (Vite, in our setup) **translates** TypeScript into
   JavaScript. The `react` package is JavaScript. The browser only ever
   sees JS.

4. Reasons that count: this repo is TypeScript; it is the usual default
   for new React apps; types catch mistakes. TypeScript is **not** a
   second React, not a replacement for Node/npm, and not required by
   the browser.

5. `react-ts` means: scaffold a **React** app whose source language is
   **TypeScript** (`.tsx` / `.ts` files), not a different UI library.
   Same paradigm as a `react` (JavaScript) template; different author
   language.

</details>

---

## Common mistakes here

- **“React is a language.”** You write *in* JS or TS; you *import*
  React.
- **“TypeScript is another React.”** Same `react` package. Different
  file types and extra labels.
- **“The browser runs TypeScript.”** It runs the JavaScript Vite
  emitted. If you skip the dev server and open a `.tsx` file as a
  webpage, nothing sensible happens (Tutorial 02 already warned you
  not to open HTML from disk).
- **Jumping to JSX syntax before the idea.** Markup-in-code is the
  *spelling*. The paradigm is data → description → screen. You will
  write JSX after the Three.js roles tutorial.
- **Thinking you must learn all of TypeScript first.** You need the
  React idea now, and `: string`-style labels as they appear. Depth
  comes with components.
- **Equating “framework” with “language.”** A framework/library is a
  toolkit. A language is how you write instructions. This course:
  toolkit = React, language = TypeScript.

---

## Recap & next

**In one breath:** React is a declarative UI library (describe the
screen from data, in components); you write it in JavaScript or in
TypeScript that compiles to JavaScript; this course uses TypeScript
because it is the popular, project-matching way to author React — not
because it is a different React.

You can now explain the paradigm and the language choice. Next rung:
[04 — Three.js and talking to the React UI](04-threejs-and-react-dialogue.md),
where a second library owns the 3D canvas and **settings** carry the
dialogue.

Official references (optional):
[Thinking in React](https://react.dev/learn/thinking-in-react),
[React docs](https://react.dev/learn),
[TypeScript for JS programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).
