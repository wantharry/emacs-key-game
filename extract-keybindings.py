#!/usr/bin/env python3
"""Extract real, verified Emacs keybindings from the research-emacs project's own
docs/KEYBOARD.md into keybindings.json for the game to use.

Why pull from there instead of hand-writing game content: every row in that file is
checked against the real, live Emacs keymaps by that project's own
tests/ert/keybindings.el --- so this game teaches keys that are actually real and
actually bound, not guessed or half-remembered. This script mirrors that same test's
own parsing rules (a <!-- keymap: NAME --> marker switches the current section; a row
is `| `KEY` | `COMMAND` | DESCRIPTION |`; a command containing a space is not a
real command and is skipped) so the two stay in agreement.

Usage: python3 extract-keybindings.py [path/to/KEYBOARD.md] > keybindings.json
Default path assumes this script sits next to a checkout of research-emacs.
"""
import json
import re
import sys

ROW_RE = re.compile(r"^\|\s*`([^`]+)`\s*\|\s*`([^`\s]+)`\s*\|\s*(.+?)\s*\|\s*$")
KEYMAP_RE = re.compile(r"<!--\s*keymap:\s*(\S+)\s*-->")
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$")

# No real usage-frequency telemetry exists for this --- there is no such data to
# pull from --- so "popularity"/difficulty here is a real, traceable proxy instead
# of an invented number: KEYBOARD.md's OWN section order, which its author already
# wrote as a learning progression (confirmed directly: the doc's own last section is
# literally "A learning path"). Tier 1 is that doc's own explicit "five keys to
# survive" list; the rest follow its section order, earliest = most fundamental.
SECTION_TIERS = {
    "The five keys to survive": 1,
    "Moving around": 2,
    "Selecting, cutting, pasting, undoing": 2,
    "Editing text": 2,
    "Searching and replacing": 2,
    "Files, buffers, windows, tabs": 2,
    "Help (the most valuable section)": 2,
    "Rectangles, registers, bookmarks, macros": 3,
    "Running commands and evaluating code": 3,
    "Dired: the directory editor": 3,
    "Minibuffer and completion": 3,
    "Programming": 4,
    "Ranger: a Miller-columns file manager (this config, `C-c R`)": 4,
    "The buffer list (ibuffer)": 4,
    "Evil: vi keys (optional)": 4,
    "Java, Rust and other languages (Eglot)": 4,
}
DEFAULT_TIER = 3
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")

# Keymaps that need a specific major/minor mode active to make sense out of context
# are kept (grouped as their own category), except ones this script cannot represent
# meaningfully as an isolated drill (none excluded currently, but this is where a
# keymap would be filtered out if that changed).
KEYMAP_LABELS = {
    "global": "Global",
    "isearch-mode-map": "Incremental Search",
    "emacs-lisp-mode-map": "Emacs Lisp",
    "dired-mode-map": "Dired",
    "wdired-mode-map": "Dired (editable names)",
    "ranger-mode-map": "ranger",
    "ibuffer-mode-map": "ibuffer",
    "minibuffer-local-map": "Minibuffer",
    "evil-normal": "Evil (vi keys), normal state",
}


def clean_description(text):
    text = LINK_RE.sub(r"\1", text)
    text = BOLD_RE.sub(r"\1", text)
    text = INLINE_CODE_RE.sub(r"\1", text)
    return text.strip()


def extract(path):
    keymap = "global"
    section = None
    rows = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            sm = SECTION_RE.match(line)
            if sm:
                section = sm.group(1)
                continue
            m = KEYMAP_RE.search(line)
            if m:
                keymap = m.group(1)
                continue
            if keymap == "none":
                continue
            m = ROW_RE.match(line.strip())
            if not m:
                continue
            key, command, desc = m.groups()
            if " " in command:
                continue  # not a real command (e.g. "Esc x"), same rule the test uses
            if "this config:" in desc:
                continue  # custom to research-emacs's own setup, not core/stock Emacs
            rows.append(
                {
                    "key": key,
                    "command": command,
                    "description": clean_description(desc),
                    "keymap": keymap,
                    "category": KEYMAP_LABELS.get(keymap, keymap),
                    "section": section,
                    "tier": SECTION_TIERS.get(section, DEFAULT_TIER),
                }
            )
    return rows


def main():
    default_path = "../research-emacs/docs/KEYBOARD.md"
    path = sys.argv[1] if len(sys.argv) > 1 else default_path
    rows = extract(path)
    # De-duplicate identical (keymap, key, description) rows --- KEYBOARD.md
    # occasionally repeats a key/command pair with the same description in a
    # different section (e.g. a "survive" quick list up top, then again in the
    # full table) --- one quiz entry is enough.
    seen = set()
    deduped = []
    for r in rows:
        sig = (r["keymap"], r["key"], r["description"])
        if sig in seen:
            continue
        seen.add(sig)
        deduped.append(r)
    # Emitted as a plain JS file assigning a global, not pure JSON loaded via
    # `fetch' --- confirmed directly: browsers block `fetch' of a local file under
    # `file://' by default (a real CORS restriction), which would break "just open
    # index.html" with no server. A `<script src="keybindings.js">' tag has no such
    # restriction.
    sys.stdout.write("// Generated by extract-keybindings.py --- do not hand-edit.\n")
    sys.stdout.write("// Source: research-emacs/docs/KEYBOARD.md, every row checked against a real\n")
    sys.stdout.write("// Emacs keymap by that project's own tests/ert/keybindings.el.\n")
    sys.stdout.write("const KEYBINDINGS = ")
    json.dump(deduped, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write(";\n")
    print(f"Extracted {len(deduped)} real keybindings ({len(rows) - len(deduped)} duplicates dropped).",
          file=sys.stderr)


if __name__ == "__main__":
    main()
