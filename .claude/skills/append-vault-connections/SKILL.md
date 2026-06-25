---
name: append-vault-connections
description: Find connections between notes in an Obsidian vault and append a "Possible Connections" section with suggested links and insights to the end of a note. Use when asked to surface links between notes, enrich a note with related ideas, find related notes, or build connections in an Obsidian/markdown vault. Strictly append-only — never alters the original note text.
---

# Append "Possible Connections" to Obsidian Notes

Surface non-obvious links between a note and the rest of an Obsidian
vault, then append a **Possible Connections** section to the end of the
note: suggested `[[wikilinks]]` plus a one-line insight for each on *why*
the connection is worth considering. The point is discovery — links the
author hasn't drawn yet.

> **Related skill:** `review-vault-writing` is the critical companion to
> this one. This skill *expands* a note (finds links to consider);
> `review-vault-writing` *pressure-tests* a body of notes (finds weak
> arguments, contradictions, and prior art). Run this to enrich, that to
> critique.

## The one hard rule: never touch the original text

This skill is **append-only**. The author's words are inviolable.

- Do **not** edit, reword, reorder, summarize, or delete any existing
  line of the note — including its frontmatter, headings, and body.
- Everything you add goes **at the very end**, inside a single managed
  block delimited by HTML comment markers (below).
- Your suggestions are *links and insights*, never claims inserted into
  the author's prose.

If you cannot add the section without modifying existing content (e.g.
the file is malformed), stop and report — don't "fix" the note.

## The managed block (idempotent)

Append exactly this structure at the end of the file. The HTML comment
markers make re-runs safe: on a later pass you **replace everything
between the markers**, never appending a second section and never
touching anything above the opening marker.

```markdown
<!-- BEGIN POSSIBLE CONNECTIONS (auto-generated) -->
## Possible Connections

- [[Other Note]] — why this connection is worth considering (one line).
- [[Another Note]] — the shared idea or tension that links them.

<sub>Suggested links, not part of the original note. Generated <DATE>.</sub>
<!-- END POSSIBLE CONNECTIONS -->
```

Rules for the block:
- Separate it from the body with one blank line; if the file doesn't end
  in a newline, add one first.
- If the block already exists, regenerate **only** what's between the
  markers. If it doesn't, append it fresh.
- Never nest it or place it above existing content.

## Process

1. **Locate the vault root** (the folder containing the `.md` notes; an
   Obsidian vault has a `.obsidian/` dir at its root). Ask if ambiguous.
2. **Get a candidate shortlist** with the helper — it ranks other notes
   by shared tags, shared significant terms, and existing wikilinks:

   ```bash
   python3 .claude/skills/append-vault-connections/find_candidates.py \
     <vault_dir> <target_note.md> --top 10
   ```

   (Path is relative to wherever the skill lives; adjust if the vault is
   elsewhere. The script needs only Python 3, no dependencies.)
3. **Read the top candidates** and the target note. The script ranks by
   cheap signals; *you* judge real relevance — conceptual overlap,
   complementary ideas, productive tension, cause/effect, examples of a
   principle. Skip coincidental term matches.
4. **Prefer connections the author hasn't made.** Candidates flagged
   `[already linked]` are usually less valuable to suggest — favor the
   un-linked ones unless the existing link deserves a richer note.
5. **Write 3–7 suggestions**, each `[[Note]] — insight`. The insight
   names the *specific* shared idea, not "these are related." Use the
   note's real filename/title for the wikilink so it resolves in Obsidian.
6. **Append the managed block** per the rules above. Verify you changed
   nothing else (a diff should show only added lines at EOF).

## What makes a good suggestion

- **Specific over generic.** "Both discuss atomic notes as the unit of
  reuse" beats "both about note-taking."
- **Generative.** Favor links that pose a question or reveal a tension
  the author could develop, not just topical neighbors.
- **Honest about strength.** If a link is a stretch, say so in the
  insight ("loosely — both touch on emergence") rather than overstating.
- **Few and strong.** 3–7 real connections beat 15 weak ones.

## Gotchas

- **Wikilink targets must match note names.** Obsidian resolves
  `[[Name]]` by filename/title — use the exact stem the vault uses, or
  the link dangles.
- **Don't double-append.** Always check for the `BEGIN POSSIBLE
  CONNECTIONS` marker first and replace in place; appending blindly
  creates duplicate sections.
- **Frontmatter is content too.** It counts as original text — never
  edit tags/aliases/properties, even to "improve" them.
- **Term overlap is noisy.** The script may surface notes that share
  common words; that's a shortlist, not a verdict. Read before linking.
- **Batch runs:** when processing many notes, do one note at a time and
  keep each note's edit isolated to its own EOF block.
