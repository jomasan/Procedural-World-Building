# Learning React tools — from zero to a running app

> A follow-along course for a complete beginner. No prior knowledge of
> Node.js, npm, or React tooling is assumed. Work through the tutorials
> **in order** — each one uses only what the earlier ones taught.

This folder supports the student [learning path](../learning-path.md). The
first written rungs are the **terminal** and the tool setup for
**step 2 — React**. Later rungs will climb toward the planet-builder app
in this repository.

## What you'll be able to do at the end

By finishing this ladder you will be able to **use the terminal, install
Node.js and npm, create a React app, explain React’s declarative
paradigm and TypeScript, and explain how Three.js owns the 3D canvas
while React owns the UI — talking through shared settings**. We get
there one small step at a time.

## What we assume you already know (the floor)

- How to use a computer: folders, files, a web browser, downloading a file
- That a website is made of pages a browser can show (HTML, CSS, and
  JavaScript are helpful background from learning-path step 1, but these
  first tutorials are about *tools*, not writing React code yet)

Everything beyond this is taught from scratch. You do **not** need to
be comfortable with the command line — Tutorial 01 is written for
people who prefer clicking.

## The ladder

Each rung builds on the ones above it. Don't skip — a later rung will
assume you did the earlier ones.

| # | Tutorial | After it, you can… |
|---|---|---|
| 01 | [The terminal: navigation and setup checks](01-terminal-and-setup-checks.md) | `cd` with drag-and-drop, confirm the folder with `pwd` / `ls`, and run the Node/npm/npx version card |
| 02 | [Node.js, npm, and installing React](02-node-npm-and-react.md) | Install Node.js, explain npm, and scaffold a React app that runs in the browser |
| 03 | [What React is, and why TypeScript](03-react-paradigm-and-typescript.md) | Explain React’s declarative paradigm, how languages relate to React, and why this course uses TypeScript |
| 04 | [Three.js and talking to the React UI](04-threejs-and-react-dialogue.md) | Explain Three.js’s 3D canvas, each library’s role, and the settings dialogue between sidebar and scene |
| 05 | *(coming next)* React components and JSX | Write the first on-screen pieces of a React app |

## How to use this folder

1. Start at `01`. Read it, then do its **Your turn** problems before
   moving on — the practice is where the learning sticks.
2. Check the answer against the **Solutions** only after you've tried.
3. Hitting a word you don't know? Check [glossary.md](glossary.md); every
   term is defined there.
4. Track yourself in [progress.md](progress.md) — tick a rung once you can
   do its self-check without looking back.
5. If a rung feels too hard, the rung before it didn't land — go back one.
   That's normal, not failure.

## Going further (optional)

- This repository's existing app lives in `React TS Site/my-react-ts-app/`
  and was started with an older tool called Create React App. New student
  projects should follow Tutorial 02 (Vite) instead.
- Later learning-path steps (Firebase, procedural terrain) all sit on
  top of the same terminal + Node.js + npm + React + Three.js
  foundation.
