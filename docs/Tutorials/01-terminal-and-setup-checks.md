# 01 — The terminal: navigation and setup checks

> **Where this sits:** rung 01 of the ladder. Builds on nothing in this
> folder — this is the first rung. Leads to
> [02 — Node.js, npm, and installing React](02-node-npm-and-react.md).

## Before you start

**Prerequisites:** none of the other tutorials. You need a computer and
a way to open folders in your usual file window (Finder on macOS, File
Explorer on Windows, Files on Linux). You do **not** need to be “good
at the command line.” This rung is for people who prefer clicking.

**What you'll be able to do after this rung:**
- Open a terminal and say which folder it is “in” (`pwd`)
- Move into a folder with `cd`, including by **dragging the folder from
  your desktop/Finder/Explorer** so you never have to type a long path
- List what is in the current folder (`ls`)
- Run **version checks** (`node --version`, `npm --version`, and a short
  pre-flight list) so you know whether you are ready to develop a React
  app — or whether the next tutorial still has to install things

---

## The idea, from zero

Your file window (Finder, Explorer) is a *picture* of folders. You
click into Pictures, then back out, then into Documents.

The **terminal** is the same idea with text. It is always standing in
**one folder at a time**. That folder is the **working directory** —
“you are here.” Commands you type happen *there*, not to the whole
computer.

Moving to a different folder is one command: **`cd`**, read aloud as
“change directory.” Directory is an older word for folder.

You do **not** have to type the path by hand. The useful hack:

1. Type `cd` then a **space**.
2. Drag the folder from Finder / Explorer / the desktop onto the
   terminal window.
3. The path appears for you. Press Enter.

That is the whole trick. The terminal is a pointer; the mouse can still
aim it.

> **New notation:** we write `cd`, read “change directory.” It means
> “make this folder the working directory.” Always put a **space** after
> `cd` before you drop the folder, or the path sticks to the letters
> `cd` and the command fails.

A second pattern you will use constantly: ask a program who it is.

> **New notation:** we write `node --version` (two hyphens), read
> “node dash-dash version.” The `--version` part is a **flag** — an
> option bolted onto the command. It means “print your version number
> and stop.” If the program is installed and the terminal can find it,
> you get a number. If not, you get an error like `command not found`.

That is how you **test a setup** before you start building a React app.

---

## Worked example

Let's do one fully, showing **every** step.

**Problem:** Open a terminal, move into a folder you already know
(Documents, Desktop, or this course folder) without typing the path,
confirm you arrived, then run the version checks that tell you whether
React tooling is installed.

### Step 1. Open a terminal

A **terminal** is a text window. You type a **command**, then press
Enter. The computer replies with text.

- **macOS:** `Cmd + Space`, type `Terminal`, press Enter.
- **Windows:** Start menu, type `PowerShell` or `Terminal`, press Enter.
- **Linux:** open Terminal from your applications menu.
- **In Cursor / VS Code:** menu **Terminal → New Terminal**. This one
  often *already* opens inside the project you have open — a free win
  for GUI users.

You should see a **prompt**: a line waiting for you to type. Nothing is
broken; it is idle on purpose.

*Why:* every install and every `npm` command in this course is typed
here.

### Step 2. See where you are

Type this and press Enter:

```bash
pwd
```

> **New notation:** `pwd`, read “print working directory.” It means
> “tell me the full path of the folder I am in.”

On Windows PowerShell, `pwd` works too (it is a nickname for
`Get-Location`). You will get a path like
`/Users/yourname` or `C:\Users\yourname`.

*Why:* before you `cd`, you should know the starting pin on the map.

### Step 3. The drag-and-drop `cd` (the main hack)

Pick any real folder you can see in Finder or Explorer — **Documents**
is a good one.

1. Click in the terminal and type `cd` then **one space**. Do not press
   Enter yet. You should have `cd ` sitting there.
2. Switch to Finder / Explorer. Grab the folder icon (the folder
   itself, not a file inside it).
3. Drag it onto the terminal window and drop it.
4. The terminal fills in the path. It may look ugly (`\ ` before
   spaces, or quotes around the path). That is normal.
5. Press Enter.

Then run `pwd` again. It should now show **that** folder.

**Windows note:** File Explorer can paste a quoted path
(`"C:\Users\you\Documents"`). That is what you want when names have
spaces. If a drop does nothing, click the terminal once so it is
focused, type `cd ` again, and drop.

**macOS note:** dropping a folder inserts a POSIX path, for example
`/Users/you/Documents`. If the name has a space, Terminal usually
escapes it as `\ `.

*Why this is better than typing:* one typo in a long path and `cd`
fails. The OS already knows the real path; let it paste it.

### Step 4. Other GUI-friendly hacks (same idea)

You only need the drag-and-drop. These are extras when you want them:

| Hack | What it does |
|---|---|
| **Cursor / VS Code → New Terminal** | Opens already inside the project folder. No `cd` required for *that* project. |
| **Copy path, then paste** | macOS: right-click the folder, hold **Option**, choose **Copy … as Pathname**. Windows: Shift+right-click the folder → **Copy as path**. Then type `cd ` (space) and paste (`Cmd+V` / `Ctrl+V`). Wrap the paste in quotes if it has spaces and isn't quoted yet: `cd "the path"`. |
| **Open a terminal at the folder** | Windows 11: click into the folder, then Shift+right-click empty space → **Open in Terminal**. macOS: drag the folder onto the **Terminal icon** in the Dock. |
| **Jump back to the GUI** | From the terminal, `open .` (macOS) or `explorer .` (Windows) or `xdg-open .` (Linux) opens the *current* folder in Finder/Explorer. The `.` means “right here.” |
| **Tab completion** | Type the first few letters of a folder name after `cd ` and press **Tab**. The terminal fills the rest. |
| **Up arrow** | Recalls the last command so you do not retype it. |
| **`clear`** (Windows: `cls` also works) | Wipes the screen. Does not change your folder. |

Two more `cd` moves that do not need dragging:

```bash
cd ..
```

`..` means **parent** — the folder that contains this one. Repeat it to
walk “up” the tree.

```bash
cd ~
```

`~` means your **home** folder (your user folder). On Windows PowerShell,
`cd ~` works the same way.

### Step 5. See what is in this folder

```bash
ls
```

> **New notation:** `ls`, read “list.” It means “show the names in the
> working directory.”

PowerShell understands `ls`. Classic Command Prompt uses `dir` instead;
if `ls` fails there, type `dir`.

You are looking for names you recognize (Documents, a project folder,
later `package.json`). If you `cd` into a React project, `ls` should
show `package.json`. If it does not, you are in the wrong folder —
drag-and-drop `cd` into the project and `ls` again.

### Step 6. Stop a stuck command (you will need this)

Some commands keep running until you stop them (the React **dev
server** in the next tutorial is one). Click the terminal and press:

**`Ctrl + C`**

That does not “copy” here. It means **cancel the running command** and
give you the prompt back.

*Why:* if you try to type `pwd` while a server is running, the keys go
to the server, not to a new command. Stop it first, or open a **second**
terminal tab.

### Step 7. Version reviews — the React pre-flight card

A **version review** is a tiny test: “is this tool installed, and can
*this* terminal see it?” You run it in a **new** terminal (an old window
opened before an install often lies).

Run these one at a time. After each, you want a **version number**, not
an error.

```bash
node --version
npm --version
npx --version
```

| Command | What a passing result looks like | What it means for React |
|---|---|---|
| `node --version` | A number, often like `v24.20.0`. Prefer **20 or newer**. As of August 2026, Node **LTS** is the 24 line. | Node is the engine. No Node → you cannot run npm or the app. |
| `npm --version` | A number, often like `11.x`. | npm installs packages and runs scripts (`npm install`, `npm run dev`). It ships **with** Node. |
| `npx --version` | A number (usually matches npm). | `npx` / `npm create` *runs* starter tools. Vite’s scaffolder uses this. |

Optional extras (nice, not required for the next tutorial):

```bash
git --version
```

Git is for saving project history. A version number means it is
installed. `command not found` does not block Tutorial 02.

If you **already** have a React project folder, also do this **after**
`cd` into it:

```bash
pwd
ls
```

Passing: `pwd` is the project path, and `ls` shows `package.json`. Then
you are in the right place to run `npm install` / `npm run dev` later.

**How to read failures**

- `command not found` / `not recognized` — this terminal cannot see the
  program. **First fix:** close the terminal, open a new one, retry
  (installs do not update windows that were already open). **Second
  fix:** the tool is not installed yet → that is Tutorial 02.
- A version that is very old (Node 16 or 18) — may still print a
  number, but Vite may refuse to run. Install current **LTS** in
  Tutorial 02.
- `node` works and `npm` does not — unusual; reinstall Node LTS and
  keep the “install npm” box checked.

You do **not** need a passing card to *finish* this rung. You need to
know **how to run the tests** and **what pass vs fail looks like**. If
they fail, Tutorial 02 installs Node (which includes npm and npx). After
that, come back and run this card until every required line prints a
number.

**Result:** you can aim the terminal with the mouse, confirm the folder
with `pwd` / `ls`, and test whether the React toolchain is visible.

---

## Your turn

Try these before looking at the solutions. They use only what you've
learned up to and including this rung.

1. Open a terminal. What command prints the folder you are in? Run it.

2. Using **only** `cd`, a space, and **drag-and-drop**, move into your
   Desktop or Documents folder. How do you prove you arrived?

3. You typed `cd` with **no space** and then dropped a folder. The line
   looks like `cd/Users/you/Documents`. What happens, and how do you
   fix it?

4. A classmate says “I installed Node but `node --version` says command
   not found.” What do you try **before** telling them to reinstall?

5. Which three version commands are the **required** pre-flight for
   starting a React app in this course? What does a pass look like for
   each? What do you do if they all fail?

<details>
<summary><strong>Solutions</strong> (try first!)</summary>

1. `pwd`. It prints the working directory — the folder the terminal is
   standing in.

2. Type `cd ` (with a space), drop the folder, press Enter. Prove it
   with `pwd` (the path should end with `Desktop` or `Documents`) and
   optionally `ls` (you should see that folder's contents).

3. Without the space, the terminal thinks the command *name* is
   `cd/Users/you/Documents`, which does not exist, so it errors. Fix:
   type `cd`, then a space, then drop again (or paste the path), then
   Enter.

4. Close **every** terminal window (and in Cursor, kill the old
   terminal panel and open **New Terminal**). Installers update PATH
   for *new* sessions only. Then run `node --version` again. Reinstall
   only if a brand-new terminal still fails.

5. Required: `node --version`, `npm --version`, `npx --version`. A pass
   is any version number (prefer Node 20+ / current LTS). If all three
   fail after a new terminal, go to Tutorial 02 and install Node.js
   **LTS**, then rerun the card.

</details>

---

## Common mistakes here

- **Forgetting the space after `cd`.** Drag-and-drop must come after
  `cd `. Look at the line before you press Enter.
- **Dropping a file instead of a folder.** `cd` needs a folder. Drop the
  project folder (the one that will contain `package.json`), not a
  `.tsx` file inside it.
- **Assuming the terminal is in the folder you are looking at in
  Finder.** They are independent until you `cd`. Always `pwd`.
- **Typing the next command while a server is still running.** Press
  `Ctrl + C` or open a second terminal.
- **Trusting an old terminal after an install.** Version checks in a
  window that was already open can fail even when the install worked.
- **Treating `command not found` as “I can never use this computer.”**
  It usually means “not installed yet” or “this window is stale.”
- **Skipping `ls` in a project.** If you cannot see `package.json`,
  `npm run dev` will fail no matter how good Node’s version is.

---

## Recap & next

**In one breath:** the terminal is a “you are here” pin you move with
`cd` (drag-and-drop is allowed); `pwd` and `ls` confirm the pin; `--version`
flags tell you whether Node, npm, and npx are ready for React.

You can now drive the terminal without memorizing paths, and you can
run the pre-flight card. Next rung:
[02 — Node.js, npm, and installing React](02-node-npm-and-react.md),
where we install anything the card said was missing and scaffold the
app.
