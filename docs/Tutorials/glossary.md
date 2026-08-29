# Glossary

Every term introduced in these tutorials, in plain language. If a word in
a tutorial is new, it belongs here.

- **animation loop** — The repeating “draw the 3D scene again” cycle
  (many times per second). Three.js owns this. React’s UI updates are
  a different cycle.
- **camera** — The eye in a Three.js **scene**. What it sees is what
  the **renderer** paints onto the **canvas**.
- **canvas** — An HTML box of pixels (`<canvas>`). React can place it
  on the page; Three.js paints 3D into it.
- **geometry** — The shape of a **mesh** (sphere, box, custom planet
  surface). Paired with a **material**.
- **material** — The surface of a **mesh** (color, shiny, unlit, …).
  Many materials need a **light** in the scene or they look black.
- **mesh** — A visible 3D object: **geometry** + **material**. Live
  meshes belong in a **ref**, not in React **state**.
- **OrbitControls** — A Three.js helper that lets the mouse orbit and
  zoom the **camera**. Interaction *inside* the canvas, not a React
  slider.
- **props** — Values a parent component hands to a child. The 3D
  canvas **receives** `settings` as props; it does not own those
  numbers.
- **ref** — A React box that can hold anything (including a Three.js
  scene) without treating changes as “please redraw the HTML.” This
  app’s planet canvas uses `sceneRef` for live 3D objects.
- **renderer** — The Three.js painter. It draws the **scene** from the
  **camera** onto the **canvas** (usually via **WebGL**).
- **scene** — The Three.js world container. You add cameras, lights,
  and **meshes** to it.
- **settings** — The shared plain-data script (numbers, toggles, layer
  lists) React state holds. The UI writes it; the canvas reads it.
  That is the React ↔ Three.js **dialogue**.
- **state** — Data React remembers. When it changes, React updates the
  UI that depends on it. Put settings here; do not put `THREE.Mesh`
  here.
- **Three.js** — A JavaScript **library** for 3D graphics in the
  browser (scene, camera, renderer, meshes). Installed with npm
  (`three`). Not a language. Not a replacement for React.
- **WebGL** — The browser’s low-level 3D drawing system. Three.js
  talks to it so you do not have to.
- **build tool** — A program that prepares your source files so a browser
  can run them (bundling, transforming, serving). Vite is a build tool.
- **cd** — “change directory.” Moves the terminal into another folder.
  Type `cd `, then a space, then a path — or drag the folder from
  Finder/Explorer after the space so you never type the path.
- **clear / cls** — Clears the terminal screen. Does not change folder.
  `clear` on macOS/Linux; `cls` or `clear` in PowerShell.
- **command** — A short instruction you type in the terminal, then press
  Enter. Example: `node --version`.
- **compile** — Translate source code into another form before it
  runs. In this course, Vite compiles **TypeScript** (and JSX/TSX)
  into **JavaScript** the browser can execute.
- **component** — A named recipe for one piece of the **UI** (a button,
  a panel, a planet view). React apps are trees of components. Writing
  them is the next tutorial.
- **declarative** — Saying *what* the result should be, not the
  step-by-step orders to get there. React is declarative: you describe
  the screen from data; React updates the page.
- **imperative** — Giving step-by-step orders (“find this element, then
  change its text”). The opposite of **declarative**.
- **JSX** — A syntax that looks like HTML mixed into JavaScript.
  Used in `.jsx` files. The TypeScript version is **TSX**.
- **TSX** — JSX in a TypeScript file (`.tsx`). This course writes
  components as TSX.
- **type annotation** — A label that says what kind of value something
  is, written after a colon. Example: `name: string` means “`name` is
  text.” TypeScript uses these; they are removed before the browser
  runs the code.
- **UI** — User interface: what the human sees and clicks. React’s
  job is building UIs.
- **command line / terminal** — A text window where you type commands
  instead of clicking buttons. macOS: Terminal or iTerm. Windows: PowerShell
  or Command Prompt. Linux: Terminal. Cursor/VS Code: **Terminal → New
  Terminal** (often already inside the open project).
- **Ctrl + C** (in the terminal) — Cancels the command that is still
  running and gives you the prompt back. It is not “copy” in this
  window.
- **flag** — An option added to a command, usually starting with `-` or
  `--`. Example: `--version` means “print your version number.”
- **home folder** — Your user folder. Written `~` in `cd ~`.
- **ls** — “list.” Prints names in the working directory. Command Prompt
  uses `dir` instead; PowerShell accepts `ls`.
- **parent folder** — The folder that contains the current one. Written
  `..` in `cd ..`.
- **PATH** — The list of folders the terminal searches when you type a
  command name like `node`. A stale terminal (opened before an install)
  may have an old PATH and report `command not found` even after a good
  install — open a new window.
- **pre-flight card** — The short version checks in Tutorial 01:
  `node --version`, `npm --version`, `npx --version`. A pass is a
  version number; a fail is `command not found` (after trying a new
  terminal).
- **prompt** — The idle line in the terminal that means “type a command.”
- **pwd** — “print working directory.” Shows the full path of the folder
  the terminal is in.
- **Create React App (CRA)** — An older official way to start a React
  project. The React team deprecated it in 2025. Do not use it for new
  apps. This repo's existing site still uses it; new student apps should
  use Vite.
- **Current (Node.js)** — The newest Node.js line. It gets features first,
  but it is not the best default for students. Prefer **LTS**.
- **dependency** — A package your project needs in order to run. Listed
  under `"dependencies"` in `package.json`.
- **development server** (often shortened to **dev server**) — A small
  local web server that serves your app while you work. Vite's is started
  with `npm run dev`. You visit it at an address like `http://localhost:5173`.
- **devDependency** — A package needed to *build or test* the project, not
  to run the finished site in production. Listed under `"devDependencies"`.
- **install (npm)** — Download packages from the registry into
  `node_modules`, matching what `package.json` asks for.
- **JavaScript** — The programming language of the web. Browsers run it on
  pages; **Node.js** runs it on your computer outside a page.
- **library** — A reusable piece of code someone else wrote, usually an
  npm **package**. **React** is a UI library. **Three.js** is a 3D
  library. Neither is a programming language. People sometimes say
  “framework” for a whole project; in this course, UI toolkit = React,
  3D toolkit = Three.js, language = TypeScript.
- **localhost** — A special address that means “this computer.” When the
  dev server is running, `http://localhost:5173` is *your* app, not a
  public website.
- **LTS (Long Term Support)** — The Node.js version line that receives
  bug fixes and security updates for a long time. Students should install
  LTS from [nodejs.org](https://nodejs.org).
- **Node.js** — A program that runs JavaScript on your computer, outside
  the browser. Installing it also installs **npm**.
- **node_modules** — The folder npm fills with the actual downloaded
  packages. It is large and generated; you recreate it with `npm install`.
  Do not copy it around or commit it if you use git.
- **npm** — Short for **Node Package Manager**. Two things at once: (1) a
  command (`npm`) that installs and runs packages, and (2) a public
  **registry** of packages at [npmjs.com](https://www.npmjs.com).
- **npx** — A companion command that *runs* a package without you having
  to install it globally yourself. `npm create` uses this idea: it
  downloads a starter tool, runs it, then you keep the project it made.
- **package** — A named bundle of code published to npm, with a version
  number. Example: `react`.
- **package.json** — A text file in your project that lists the project's
  name, the **scripts** you can run, and which **packages** it needs
  (with version ranges). It is the project's shopping list.
- **package-lock.json** — A file npm writes that records the *exact*
  versions that were installed. It makes installs repeatable on another
  computer. Keep it; do not hand-edit it.
- **React** — A JavaScript **library** for building user interfaces out
  of **components**. You describe the screen from data (declarative);
  React updates the page. You add it with npm; you write it in
  JavaScript or TypeScript. It is not itself a language.
- **registry** — The public catalog npm downloads packages from (by
  default, npmjs.com).
- **runtime** — The program that actually executes your code. The browser
  is a JavaScript runtime for web pages; Node.js is a JavaScript runtime
  for your computer.
- **script (npm)** — A named command stored in `package.json` under
  `"scripts"`. You run it with `npm run <name>` (for example `npm run
  dev`). A few names like `start` and `test` can omit `run`.
- **scaffold** — To generate a starter project (folders, config, a first
  page) so you don't set everything up by hand. `npm create vite@latest`
  scaffolds a Vite app.
- **template** — A preset project shape. Vite's `react-ts` template is a
  React app written in TypeScript.
- **TypeScript** — JavaScript plus **type annotations**. A compiler
  (Vite, in our apps) turns it into JavaScript. This course writes
  React in TypeScript — a popular pairing, not a second React. The
  Vite `react-ts` template sets that up. You do not need to master
  types before Tutorial 04.
- **version** — A number that identifies a release of a program or
  package, often like `24.20.0`. Newer is not always better; students
  should prefer Node **LTS**.
- **Vite** — A modern **build tool** and dev server. The recommended way
  in these tutorials to start a new React app.
- **working directory** — The folder the terminal is “in” right now.
  Commands like `npm install` apply to *that* folder. `cd` changes it.
