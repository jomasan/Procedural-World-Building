---
name: learning-to-learn
description: Break a subject — a topic in math, an algorithm, or any technical concept — into a ladder of follow-along tutorials for an absolute beginner. Use when asked to learn something from scratch, create a study path or curriculum, teach a concept step by step, or understand a hard topic with no prior background. Builds a learning/ folder where each tutorial scaffolds the next, from true foundations up to the complex target.
---

# Learning to Learn — build a tutorial ladder for a novice

Turn a subject into a **ladder of tutorials** a complete beginner can
climb. Each rung teaches one new idea, fully, before the next rung uses
it — so by the time the learner reaches the hard topic, every piece it
rests on has already been built. The deliverable is a `learning/<topic>/`
folder of numbered, follow-along tutorials.

## The governing assumption: the learner knows nothing

Assume an **absolute novice**. Concretely:

- Assume only basic literacy and grade-school arithmetic. Everything past
  that — every term, every symbol, every notation — gets **defined before
  it is used**.
- Never write a sentence the learner can't parse with what they've been
  taught *so far*. No forward references. If you need a word, teach the
  word first.
- When in doubt, explain it. An over-explained step costs seconds; an
  unexplained one stops the learner cold.

If you find yourself writing "recall that…" or "obviously…" or using a
symbol you haven't introduced — stop. That's a missing rung.

## The output: a `learning/<topic>/` folder

```
learning/<topic>/
  00-overview.md      ← the map: the ladder, the end goal, how to use it
  01-<foundation>.md  ← rung 1 — the most basic prerequisite
  02-<next>.md        ← rung 2 — uses only rung 1
  03-…                ← each rung uses only earlier rungs
  ...
  NN-<target>.md      ← the hard topic the learner wanted to reach
  glossary.md         ← every term, defined in plain language
  progress.md         ← checklist + self-tests to track the climb
```

Templates to copy: [templates/overview.md](templates/overview.md) and
[templates/tutorial.md](templates/tutorial.md).

## Process

1. **Pin the target and the floor.** Ask (or infer): what exactly does
   the learner want to be able to do at the end (the *target* topic), and
   what can we genuinely assume they already know (the *floor*)? Default
   the floor low — basic arithmetic. Confirm if unsure; guessing too high
   is the main way this fails.

2. **Map the dependency ladder.** Work *backward* from the target: what
   must you understand to grasp it? Then what must you understand to grasp
   *those*? Keep going until you hit the floor. You now have a graph of
   concepts; order it so nothing appears before its prerequisites
   (topological order). Each rung should introduce **one** major new idea.

3. **Write `00-overview.md`** from the template: the end goal in plain
   language, the full ladder as a numbered list (each with a one-line
   "what you'll be able to do"), and how to use the folder.

4. **Write tutorials one rung at a time, in order**, each from the
   tutorial template. Before writing rung *N*, the only concepts you may
   use are those taught in rungs *1…N-1* (plus the floor). This is the
   hard rule that makes the scaffold hold.

5. **Maintain the glossary and progress tracker** as you go — every new
   term added to `glossary.md` the moment it's introduced; every tutorial
   added to `progress.md` with its self-check.

## Anatomy of one tutorial (the rung)

Each tutorial follows the same shape (see the template). Every section
earns its place:

- **Where this sits** — rung number, what it builds on, where it leads.
- **Prerequisites** — exactly which earlier tutorials. If the learner did
  those, they're ready; nothing else is assumed.
- **What you'll be able to do** — concrete, checkable goals ("compute X,"
  "explain why Y"), not vague ("understand Z").
- **The idea, from zero** — introduce the one new concept. Lead with a
  **plain-language intuition or analogy**, *then* the precise definition,
  *then* the notation (spell out every new symbol the first time:
  "we write this as `∑`, read 'sum of'"). Concrete before abstract.
- **Worked examples** — at least one fully worked, **every step shown**,
  nothing "left to the reader." Narrate *why* each step happens, not just
  what.
- **Your turn** — 2–5 practice problems, easy → harder, that exercise
  *only* what this rung (and earlier ones) taught.
- **Solutions** — worked, not just answers, placed after the practice (or
  in a collapsible block) so the learner can try first.
- **Common mistakes** — the specific traps a beginner hits here.
- **Recap & next** — one-paragraph summary and a pointer to the next rung.

## Pedagogical rules (the heart of the skill)

- **Define before use.** The non-negotiable rule. No term, symbol, or
  technique appears before its own tutorial (or the floor).
- **One new idea per rung.** If a tutorial introduces two hard concepts,
  split it. Cognitive load is the enemy.
- **Concrete before abstract.** A specific example first; the general rule
  second. Generalize *after* the learner has seen instances.
- **Spell out notation.** Math symbols and jargon are a foreign alphabet
  to a novice. Introduce each explicitly, with how to *read it aloud*.
- **Show every step.** "It follows that" hides the step the learner most
  needs. Especially in math and algorithms, skip nothing.
- **Active recall every rung.** Practice problems and a self-check, not
  just reading. Learning happens in the doing.
- **Spiral back.** Briefly connect the new idea to earlier rungs ("this is
  the same addition from tutorial 2, now applied to…") to reinforce the
  scaffold.
- **For algorithms specifically:** trace the algorithm by hand on a tiny
  input *before* showing code; show the code only after the idea is clear;
  explain complexity in plain terms ("doubling the input roughly doubles
  the work") before introducing Big-O notation in its own rung.

## Gotchas

- **The hidden prerequisite.** The most common failure: a rung quietly
  assumes a concept you never taught. Before publishing a rung, list every
  term and symbol in it and confirm each was defined earlier. If one
  wasn't, you found a missing rung — insert it.
- **Assuming the floor is higher than it is.** "They surely know
  fractions / functions / loops" — don't. If it's load-bearing for the
  target and not clearly below the floor, give it a rung.
- **Rungs too tall.** If a tutorial needs more than one "aha," it's two
  tutorials. Better a longer ladder with short rungs than a short ladder
  with cliffs.
- **Answers without working.** Solutions must *teach* — show the path, not
  just the result, or the practice can't correct a wrong mental model.
- **Drifting from the target.** Every rung should be on the path to the
  stated goal. Interesting tangents that don't support the target belong
  in a "going further" note, not the main ladder.
