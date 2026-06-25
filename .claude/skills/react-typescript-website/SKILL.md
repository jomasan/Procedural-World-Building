---
name: react-typescript-website
description: Build, structure, and maintain a React website using TypeScript. Use when creating React components, scaffolding a TS/React site or page, refactoring components, or organizing markup, styling, and behavior. Enforces separation of structure (JSX), style (CSS), and interaction (logic) for maintainability.
---

# React + TypeScript Website

Build React websites in TypeScript where every component keeps three
concerns physically separate: **structure** (what is rendered),
**style** (how it looks), and **interaction** (how it behaves). This is
the classic separation-of-concerns discipline, applied at the component
level so that a designer, a stylist, and a logic author can each work
without stepping on the others.

## The core rule: structure / style / interaction

For any non-trivial component, split it into three files in a folder
named after the component:

```
Button/
  Button.tsx          ← STRUCTURE: JSX markup only
  Button.module.css   ← STYLE: all CSS, no inline styles
  useButton.ts        ← INTERACTION: state, handlers, effects
  index.ts            ← re-export: export { Button } from './Button'
```

- **Structure (`*.tsx`)** — Returns JSX. Reads props and values handed
  to it. Contains *no* business logic, no `fetch`, no event-handler
  bodies, no `style={{...}}` objects. It wires elements to handlers and
  class names that come from elsewhere. A reader should understand the
  layout at a glance.
- **Style (`*.module.css`)** — All visual rules live here, scoped via
  CSS Modules so class names don't collide. No styling in the TSX. The
  component imports `styles` and applies `className={styles.foo}`.
- **Interaction (`use<Name>.ts`)** — A custom hook holding state,
  effects, event handlers, and data fetching. It returns plain values
  and callbacks the structure file consumes. This is where behavior is
  tested and changed.

Trivial, purely-presentational components (no state, a couple of CSS
rules) may keep style + structure together, but **interaction always
moves to a hook** the moment a component gains state or side effects.

## Example

`Counter/useCounter.ts` — interaction:

```ts
import { useState, useCallback } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);
  return { count, increment, reset };
}
```

`Counter/Counter.module.css` — style:

```css
.wrapper { display: flex; gap: 0.5rem; align-items: center; }
.count { font-variant-numeric: tabular-nums; min-width: 2ch; }
.button { padding: 0.25rem 0.75rem; border-radius: 6px; }
```

`Counter/Counter.tsx` — structure:

```tsx
import { useCounter } from './useCounter';
import styles from './Counter.module.css';

type CounterProps = { initial?: number };

export function Counter({ initial = 0 }: CounterProps) {
  const { count, increment, reset } = useCounter(initial);
  return (
    <div className={styles.wrapper}>
      <span className={styles.count}>{count}</span>
      <button className={styles.button} onClick={increment}>+1</button>
      <button className={styles.button} onClick={reset}>Reset</button>
    </div>
  );
}
```

`Counter/index.ts`:

```ts
export { Counter } from './Counter';
```

## Project conventions

- **Scaffold with Vite + TS:** `npm create vite@latest my-site -- --template react-ts`.
- **Types are explicit at boundaries.** Every component's props get a
  `type Props = {...}`. Avoid `any`; prefer `unknown` + narrowing.
  Enable `strict` in `tsconfig.json`.
- **Folder layout:**
  ```
  src/
    components/   ← reusable UI, one folder per component (the 3-file split)
    pages/        ← route-level compositions of components
    hooks/        ← shared interaction logic used across components
    styles/       ← global CSS, design tokens / CSS variables
    lib/          ← non-UI helpers, API clients, pure functions
  ```
- **Styling approach:** CSS Modules (`*.module.css`) by default — it
  keeps the style/structure boundary clean and scopes names. If the
  project already uses Tailwind or styled-components, follow that, but
  still keep interaction in hooks.
- **Naming:** components and files `PascalCase`; hooks `useCamelCase`;
  CSS classes `camelCase` (so `styles.fooBar` reads naturally).
- **One component per file.** Co-locate its style and hook; export
  through `index.ts`.

## Checklist before considering a component done

- [ ] Markup lives in `*.tsx` and contains no handler bodies or `fetch`.
- [ ] No inline `style={{}}`; all CSS is in a `*.module.css`.
- [ ] State/effects/handlers live in a `use<Name>.ts` hook.
- [ ] Props have an explicit `type`; `tsconfig` is `strict`.
- [ ] Component is reachable via its folder's `index.ts`.

## Why this matters

Separating structure, style, and interaction means a visual change
touches only CSS, a behavior change touches only the hook, and a layout
change touches only the JSX. Reviews are smaller, conflicts are rarer,
and each concern can be tested in isolation — the hook with a unit test,
the structure with a render snapshot, the style by eye.
