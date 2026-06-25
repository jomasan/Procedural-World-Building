#!/usr/bin/env python3
"""Surface candidate connections for one note against the rest of a vault.

This does NOT decide the final links — it ranks other notes by cheap,
explainable signals (shared tags, shared significant terms, existing
wikilinks) so the agent has a focused shortlist to read and judge.

Usage:
    python3 find_candidates.py <vault_dir> <target_note.md> [--top N]

Output: ranked candidates with the reasons they surfaced, as plain text.
The agent reads the top notes and writes the prose insights itself.
"""
import argparse
import pathlib
import re
import sys
from collections import Counter

STOP = set("""a an the and or but if then else for of to in on at by with from as is
are was were be been being this that these those it its his her their our your my we
you they he she them us i not no nor so than too very can will just into out up down
about over under again more most some such only own same own about above below
""".split())

WIKILINK = re.compile(r"\[\[([^\]|#]+)")
TAG_FRONT = re.compile(r"tags:\s*\[([^\]]*)\]")
TAG_INLINE = re.compile(r"(?:^|\s)#([A-Za-z0-9_/-]+)")
WORD = re.compile(r"[A-Za-z][A-Za-z'-]{2,}")


def parse(path: pathlib.Path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    tags = set()
    m = TAG_FRONT.search(text)
    if m:
        tags |= {t.strip().lower() for t in m.group(1).split(",") if t.strip()}
    tags |= {t.lower() for t in TAG_INLINE.findall(text)}
    links = {l.strip().lower() for l in WIKILINK.findall(text)}
    words = Counter(w.lower() for w in WORD.findall(text)
                    if w.lower() not in STOP)
    # keep only reasonably distinctive terms
    terms = {w for w, c in words.items() if c >= 1}
    return {"stem": path.stem.lower(), "tags": tags, "links": links, "terms": terms}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("vault")
    ap.add_argument("target")
    ap.add_argument("--top", type=int, default=10)
    args = ap.parse_args()

    vault = pathlib.Path(args.vault)
    target_path = pathlib.Path(args.target)
    if not target_path.is_absolute():
        target_path = vault / args.target
    if not target_path.exists():
        sys.exit(f"target not found: {target_path}")

    tgt = parse(target_path)
    notes = [p for p in vault.rglob("*.md") if p.resolve() != target_path.resolve()]

    scored = []
    for p in notes:
        info = parse(p)
        shared_tags = tgt["tags"] & info["tags"]
        shared_terms = tgt["terms"] & info["terms"]
        already = info["stem"] in tgt["links"] or tgt["stem"] in info["links"]
        score = 3 * len(shared_tags) + len(shared_terms)
        if score == 0:
            continue
        scored.append((score, p.stem, shared_tags, sorted(shared_terms)[:8], already))

    scored.sort(reverse=True)
    if not scored:
        print("No candidates found by tag/term overlap.")
        return
    print(f"Candidates for [[{target_path.stem}]] (top {args.top}):\n")
    for score, stem, tags, terms, already in scored[: args.top]:
        flag = "  [already linked]" if already else ""
        reasons = []
        if tags:
            reasons.append(f"tags: {', '.join(sorted(tags))}")
        if terms:
            reasons.append(f"terms: {', '.join(terms)}")
        print(f"- [[{stem}]]  (score {score}){flag}")
        print(f"    {' | '.join(reasons)}")


if __name__ == "__main__":
    main()
