# 02 — Node.js, npm, and installing React

> **Where this sits:** rung 02 of the ladder. Builds on
> [01 — The terminal](01-terminal-and-setup-checks.md). Leads to
> [03 — What React is, and why TypeScript](03-react-paradigm-and-typescript.md).

## Before you start

**Prerequisites:** tutorial 01. If you can open a terminal, `cd` into a
folder (drag-and-drop is fine), run `pwd` / `ls`, and read a
`--version` result, you have everything you need. You also need a web
browser and permission to install programs. Learning-path step 1 (HTML,
CSS, JavaScript in the browser) helps later — this rung is still about
**tools**, not about writing a React page yet.

**What you'll be able to do after this rung:**
- Install Node.js (the LTS version) and confirm that `node` and `npm`
  both work in the terminal
- Explain what npm is, what a package is, and what `package.json`,
  `node_modules`, and `package-lock.json` are for
- Scaffold a new React app with Vite, install its packages, and open it
  in the browser
- Run common npm commands (`npm install`, `npm run dev`) and know which
  folder they apply to

---

## The idea, from zero

A web browser can run JavaScript, but only inside a web page you already
opened. That is like a kitchen that can only cook food that is already
on the table.

To *build* a modern site you need JavaScript running **on your
computer**, before anything is in the browser: downloading libraries,
starting a local preview, preparing files. That extra engine is
**Node.js**.

> **New term:** **Node.js** (often just “Node”) is a **runtime** — a
> program that executes JavaScript on your machine, outside a web page.

When you install Node.js, you also get **npm**.

Think of npm as a **warehouse plus a shopping list**:

- The warehouse is a public catalog of code other people published.
  Each published bundle is a **package** (React is a package).
- The shopping list is a file in *your* project named `package.json`.
  It says which packages this project needs, and which commands you can
  run.
- When you shop, npm fills a folder named `node_modules` with the actual
  downloaded code.

You do **not** install React as a separate desktop app. You install
Node.js once, then use npm **inside a project folder** to pull in React
and the tools that run it.

> **New term:** **npm** is short for Node Package Manager. It is both
> the `npm` command you type and the public **registry** those packages
> come from ([npmjs.com](https://www.npmjs.com)).

The recommended way to *start* a React project in these tutorials is
**Vite**: a **build tool** that creates a starter folder for you and
runs a **development server** so you can preview the app at
`http://localhost:…` while you work.

Create React App (the older `npx create-react-app` / `react-scripts`
path) is **deprecated**. Do not use it for new student projects. This
repository's existing app still uses it; that is history, not the
recipe you should copy.

---

## Worked example

Let's do one fully, showing **every** step: install Node, learn the npm
files by looking at them, then create and run a React app.

**Problem:** On a computer that does not yet have Node.js, get to a
React page you can open in the browser.

### Step 1. Open a terminal and stand in a folder you like

Use Tutorial 01: open a terminal (Cursor’s **Terminal → New Terminal**
is fine). `cd` into Documents, Desktop, or a class folder — type `cd `
with a trailing space and **drag the folder** onto the window if you
do not want to type the path. Confirm with `pwd`.

*Why:* every `npm` command in this rung applies to the working
directory. Get the pin in the right place before you install or
scaffold.

### Step 2. Install Node.js (LTS)

1. In the browser, go to the official site: [https://nodejs.org](https://nodejs.org).
2. Download the **LTS** installer for your operating system. LTS means
   **Long Term Support** — the stable line that gets fixes for a long
   time. As of writing this tutorial (August 2026), LTS is the Node 24
   line. Prefer the button labeled LTS, not “Current.”
3. Run the installer. Accept the license. Leave the default options
   (they install Node *and* npm, and put both on your PATH so the
   terminal can find them).
4. **Quit the terminal completely and open a new one.** An already-open
   terminal often still has the old environment, so it will not see the
   new `node` command.

*Why:* npm ships with Node. One installer gives you both. LTS is what
almost all packages are tested against.

Optional later: tools like `nvm` let you switch Node versions. You do
not need that for this rung.

### Step 3. Verify the install (Tutorial 01’s pre-flight card)

Open a **new** terminal (the window from before the installer often
cannot see `node` yet). Run the required checks from Tutorial 01:

```bash
node --version
npm --version
npx --version
```

**Result you want:** each command prints a version number, for example
`v24.20.0` and `11.x.x`. Prefer Node **20 or newer** (LTS 24 as of
August 2026). Exact numbers change; a number is a pass, `command not
found` is a fail.

*Why:* this is the same `--version` pattern from rung 01. If the
terminal cannot find `node` or `npm`, the installer did not finish or
this terminal was opened before the install.

If you see `command not found` / `not recognized`: close *all* terminal
windows, open a fresh one, and try again. On Windows, a full sign-out
or reboot sometimes is needed before PATH updates apply.

### Step 4. What npm actually does (the three files)

You have not created a React app yet. Before you do, lock in the three
names you will see in every project:

| Name | What it is | What you do with it |
|---|---|---|
| `package.json` | The shopping list: project name, **scripts**, and which **packages** (with version *ranges*) this app needs | You read it; you edit it rarely by hand; npm updates it when you add packages |
| `package-lock.json` | The exact versions npm resolved last time | Keep it. Do not hand-edit it. It makes installs repeatable |
| `node_modules/` | The folder of downloaded package code | Recreate it with `npm install`. Do not copy it. Do not commit it if you use git |

Analogy: `package.json` is the recipe (“eggs, flour”). `package-lock.json`
is the receipt with brand and lot numbers. `node_modules` is the
groceries in the fridge. If you move to another kitchen, you take the
recipe and the receipt — then shop again (`npm install`). You do not
suitcase the fridge.

> **New term:** a **dependency** is a package your project needs listed
> in `package.json`. `npm install` with no extra name means “download
> everything this shopping list asks for.”

Useful commands (you will use the first two today):

```bash
npm install                 # install everything listed in package.json
npm install some-package    # add one package to this project, then install it
npm uninstall some-package  # remove it from the list and from node_modules
npm run script-name         # run a named script from package.json
```

`npm create …` is a special form: it **runs a starter tool** (via the
same idea as `npx`) to **scaffold** a new project folder. You are not
installing Vite onto your whole computer forever; you are running the
creator once to generate files.

### Step 5. Pick a folder and scaffold a React app

Decide where the new project should live. A Documents or a class folder
is fine. Move there with Tutorial 01’s `cd` — drag-and-drop the folder
after `cd ` if you like — then `pwd` to confirm.

Then create the app. This command means: “run the latest Vite
scaffolder, make a folder named `hello-react`, and use the React +
TypeScript template.”

**macOS / Linux:**

```bash
npm create vite@latest hello-react -- --template react-ts
```

**Windows PowerShell:** same command. The `--` is required so the flags
after it are passed through to Vite instead of being eaten by npm.

If the tool asks questions interactively instead, choose **React**, then
**TypeScript**.

*Why this template:* **TypeScript** is JavaScript plus type labels. This
repository uses TypeScript. You do not need to master types today — the
template just matches the course.

*Why Vite, not Create React App:* the React team sunset CRA in 2025. Vite
is the current, supported way to get a React + TypeScript starter with a
fast **dev server**.

You should now have a folder named `hello-react`.

### Step 6. Install the project's packages

Move *into* the new folder, then install. You can type `cd hello-react`
or drag the `hello-react` folder after `cd `:

```bash
cd hello-react
npm install
```

This reads `package.json`, talks to the npm **registry**, and fills
`node_modules`. The first time can take a minute. When it finishes, you
should see `node_modules` and `package-lock.json` in the folder.

*Why a second install:* `npm create` wrote the shopping list. `npm
install` actually buys the groceries. Until this step, the project
cannot run.

Open `package.json` in any text editor. You will see something like:

- `"dependencies"` — packages the app needs to run (including `react`
  and `react-dom`)
- `"devDependencies"` — packages needed while you develop (Vite, the
  React plugin, TypeScript)
- `"scripts"` — named commands, including `"dev"`

You did not install React globally. React lives **inside this project**,
which is what you want: each app can use its own versions.

### Step 7. Run the development server

Still inside `hello-react`:

```bash
npm run dev
```

`npm run dev` looks up the `"dev"` script in `package.json` and runs it
(Vite). Leave this terminal running. It is now the **development
server**.

The output includes a local address, usually:

```text
http://localhost:5173/
```

> **New term:** **localhost** means this computer. The number after the
> colon is a **port** — a numbered door on your machine. 5173 is Vite's
> usual door. If that door is busy, Vite picks another and prints it.

**Step 8. Open it in the browser**

Copy the URL from the terminal (or click it if your terminal supports
that) into the browser. You should see the Vite + React starter page.

*Why you must use the dev server:* you do not double-click `index.html`
on disk. The build tool serves the app, watches your files, and updates
the page as you edit.

To stop the server later, go back to that terminal and press `Ctrl + C`
(Tutorial 01).

**Result:** Node.js is installed, npm works, a React project exists on
disk, its packages are in `node_modules`, and the starter UI is visible
at localhost. You are ready for the next rung (writing components).

---

## Your turn

Try these before looking at the solutions. They use only what you've
learned up to and including this rung.

1. In one or two sentences each, what are **Node.js**, **npm**, and
   **React**? Which one do you install as a program on your computer?

2. You clone a classmate's project. It has `package.json` and
   `package-lock.json` but no `node_modules`. How do you get the
   terminal into that folder without typing the path? What single
   command do you run **there** before `npm run dev`? Why would running
   that command from your home folder be the wrong move?

3. Look at this `package.json` fragment:

   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc -b && vite build",
       "preview": "vite preview"
     }
   }
   ```

   What do you type to start the local preview while you work? What
   does the `"dev"` line mean in plain language?

4. A friend tells you to start React with `npx create-react-app my-app`.
   What do you tell them, and what command would you use instead for a
   TypeScript React app?

5. Why does npm create both `package.json` and `package-lock.json`?
   What goes wrong if you delete `node_modules` — and what command
   fixes it?

<details>
<summary><strong>Solutions</strong> (try first!)</summary>

1. **Node.js** is the runtime that runs JavaScript on your computer
   (outside the browser). **npm** is the tool (and registry) for
   installing **packages**. **React** is a JavaScript **library**
   (a package) for building user interfaces. You install **Node.js**
   as a program; React is then added *inside a project* by npm.

2. Type `cd ` (space), drag the project folder onto the terminal, press
   Enter. Confirm with `pwd` / `ls` until you see `package.json`. Then
   run `npm install`. If you run it from your home folder, npm looks
   for a `package.json` *there* (or may initialize the wrong place).
   The **working directory** is the project.

3. Type `npm run dev`. The `"dev"` script is a nickname: it runs the
   `vite` program, which starts the development server so you can open
   the app at localhost.

4. Create React App is deprecated; new apps should not use it. Use Vite
   instead, for example:

   ```bash
   npm create vite@latest my-app -- --template react-ts
   ```

   then `cd my-app`, `npm install`, and `npm run dev`.

5. `package.json` lists what the project *wants* (often as version
   *ranges*). `package-lock.json` records the *exact* tree npm installed,
   so another machine can reproduce it. Deleting `node_modules` only
   throws away the groceries; the lists remain. Run `npm install` again
   to refill the folder.

</details>

---

## Common mistakes here

- **Old terminal after installing Node.** The window you already had
  open cannot see `node`. Close it and open a new one, then check
  `node --version`.
- **Wrong working directory.** `npm install` and `npm run dev` must run
  inside the project folder (the one that contains `package.json`).
  `cd` there (drag-and-drop is fine), then `pwd` and `ls` until you see
  `package.json`.
- **Installing React “globally.”** You want React in *this* project's
  `node_modules`, not as a system-wide program. Scaffold with Vite, then
  `npm install` in that folder.
- **Opening the HTML file from disk.** Always use the URL the dev server
  prints (`http://localhost:…`).
- **Using Create React App.** `create-react-app` / `react-scripts` is
  retired. If you look at this repo's `React TS Site/my-react-ts-app/`,
  you will still see `react-scripts` — that is the old app, not the
  student starter path.
- **Copying or committing `node_modules`.** Recreate it with
  `npm install`. Keep `package.json` and `package-lock.json`.
- **Hand-editing `package-lock.json`.** Let npm write it.
- **Choosing Node “Current” instead of LTS.** Use LTS unless a teacher
  tells you otherwise.

---

## Recap & next

**In one breath:** Node.js runs JavaScript on your computer and includes
npm; npm installs packages from a registry into a project described by
`package.json`; you use that to scaffold a Vite React app and preview it
with `npm run dev`.

You can now install the toolchain and get a React starter running in the
browser. Rerun Tutorial 01’s pre-flight card any time you sit down to
work. Next rung:
[03 — What React is, and why TypeScript](03-react-paradigm-and-typescript.md),
where we pin down React’s paradigm and why this course authors in
TypeScript.

Official references (optional): [Node.js downloads](https://nodejs.org),
[npm docs](https://docs.npmjs.com),
[React installation](https://react.dev/learn/installation),
[Vite](https://vite.dev/guide/).
