---
name: review-vault-writing
description: Critically review a body of writing spread across several Obsidian notes — find inconsistencies, weak or fallacious arguments, inaccurate statements, and oversights, and surface prior art and real references from the field. Use when asked to review, critique, fact-check, or strengthen an argument across multiple vault notes, or to find who has written on a topic before. Produces a separate review note; never rewrites the author's text.
---

# Review Writing Across an Obsidian Vault

Read a set of related notes as one argument and review it the way a
sharp, well-read editor would: where is the reasoning weak, where do the
notes contradict each other, what is stated as fact but isn't, what did
the author miss — and who in the field has said this before. The output
is a **separate review note**; the author's own writing is left intact.

> **Related skill:** `append-vault-connections` is the generative
> companion to this one. This skill *pressure-tests* a body of notes
> (weak arguments, contradictions, prior art); `append-vault-connections`
> *expands* a note with links worth considering. Run that to enrich, this
> to critique.

## Output is a review note, not edits

By default, **do not modify the source notes.** Write findings to a new
note, e.g. `Review — <topic> (<date>).md`, that points back at the
sources with `[[wikilinks]]` and quoted snippets. The author keeps full
control of their text and decides what to act on.

Only add inline notes if the author explicitly asks — and then only as
Obsidian comments `%%review: …%%` (invisible in reading view), never by
altering a sentence they wrote.

## Scope: define the corpus first

Pin down which notes form the argument before reviewing:
- A folder, a tag (`#thesis`), a MOC/index note's outlinks, or an
  explicit list the author gives.
- Confirm the set and the **thesis** — what is this body of writing
  trying to argue or establish? Ask if it isn't stated. You can't judge
  "weak argument" without knowing the claim.

Read every note in the set before writing a single finding. Cross-file
problems are invisible note-by-note.

## What to look for

Review along five axes. For each finding, quote the exact passage and
name the note.

1. **Inconsistencies** — the same term defined two ways across notes; a
   claim in note A contradicted by note B; a number, date, or definition
   that drifts. These are the highest-value finds because the author
   usually can't see them from inside a single file.
2. **Weak or fallacious arguments** — conclusions that outrun their
   evidence, unstated assumptions doing heavy lifting, circular
   reasoning, false dichotomies, correlation treated as cause,
   cherry-picked examples, equivocation. Name the specific gap between
   premise and conclusion.
3. **Inaccurate statements** — claims that are factually wrong, outdated,
   or overstated. Verify before asserting a correction (see References).
   Distinguish "this is wrong" from "this needs a source."
4. **Oversights & gaps** — the obvious objection left unanswered, the
   counterexample not addressed, the scope claimed broader than the
   evidence supports, a step skipped in the chain.
5. **Prior art — who said this before** — ideas presented as novel that
   have an intellectual lineage. Point to the thinkers/works the author
   should engage, whether to credit, build on, or argue against.

## References discipline — never fabricate

Surfacing references is the most valuable and most dangerous part. A
made-up citation is worse than no citation.

- **Verify before citing.** Use WebSearch to confirm a work, author, and
  the claim attributed to them actually exist and say what you imply.
- **Cite specifics only when sure:** author, title, year. If you can name
  the field/idea but not the exact source, say so explicitly: *"This
  echoes work in [field] — search for [terms]; I can't verify a specific
  source."*
- **Mark confidence.** Tag each reference `[verified]` (you checked it),
  or `[unverified — confirm]` (plausible, not checked). Never present
  unverified as fact.
- Prefer foundational or widely-cited contributors in the field over
  obscure ones the author can't easily check.
- It is always acceptable — often better — to say "I don't know of a
  specific source for this; here's how to find one."

## Review note format

```markdown
# Review — <topic> (<date>)

**Corpus:** [[Note A]], [[Note B]], [[Note C]]
**Thesis as I understand it:** <one or two sentences>
**Overall:** <2–4 sentences — what's strong, what most needs work>

## Inconsistencies
- **[[Note A]] vs [[Note B]]** — A says "…", B says "…". These conflict
  because … → consider reconciling by …

## Weak arguments
- **[[Note B]]** — "<quoted claim>". The conclusion assumes <X>, which
  isn't established. → strengthen by … / or soften the claim to …

## Inaccurate statements
- **[[Note C]]** — "<quote>". This is inaccurate: <correction>.
  [verified — <source>]

## Oversights
- **[[Note A]]** — doesn't address <the obvious objection>: …

## Prior art & references
- The claim in [[Note B]] about <idea> has lineage:
  - <Author>, *<Work>* (<year>) — <what they argued> [verified]
  - <Author> — <related contribution> [unverified — confirm]
- To engage the field, search: "<query 1>", "<query 2>".
```

Each finding is: **location → quote → the problem → a concrete next step
or question.** A finding the author can't act on is just a complaint.

## Posture

- **Critique the work, respect the author.** Direct about weaknesses,
  never contemptuous. The goal is a stronger argument, not a takedown.
- **Steelman first.** State the author's point in its strongest form
  before attacking it, so they trust the critique landed on the real
  claim.
- **Specific over sweeping.** "The third premise doesn't support the
  conclusion because…" beats "this section is weak."
- **Prioritize.** Lead with the few issues that most threaten the thesis;
  don't bury them under typos and nitpicks.

## Gotchas

- **Single-note review misses the real problems.** Contradictions and
  drifting definitions only show up across the whole corpus — read it all
  first.
- **Fabricated citations.** The failure mode of this skill. If unsure,
  mark it `[unverified]` or don't name a source at all.
- **Reviewing the topic instead of the text.** Critique what the author
  actually wrote and claimed, not the subject in general.
- **Wikilinks must match note names** so the review note's links resolve
  in the vault.
- **Don't touch the source notes** unless asked; even then, only
  `%%comments%%`, never edits to their prose.
