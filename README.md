# Emacs Key Dojo

A browser game for learning real Emacs keybindings by actually pressing them on your
own keyboard --- not multiple choice, not flashcards.

## Play it

Just open `index.html` in a browser. No server, no build step, no install.

## How it works

- You're shown what a command *does* (e.g. "undo the last change"). You press the
  real key for it on your real keyboard (e.g. `C-/`, held with Ctrl and `/`).
- Multi-key sequences (`C-x C-s`) are tracked chord by chord, with on-screen progress.
- A virtual keyboard highlights which key (and, for Ctrl, which *side* --- see
  "Finger placement" below) to press next.
- Score, streak, a 10-second-per-round timer, and 3 lives (lost only on a timeout,
  not a wrong keypress --- a mistake just costs your streak and reveals a hint, so
  it's a lesson, not a dead end).
- 4 levels, unlocked in order as you get 15 keys correct on the current one. Progress
  and best scores are saved in your browser (`localStorage`), so they survive a reload.

## Where the content comes from

Every single key, command, and description is pulled directly from
[`research-emacs`](../research-emacs)'s own `docs/KEYBOARD.md` by
`extract-keybindings.py`, which writes `keybindings.js`. That means:

- **It's real.** That doc's own `tests/ert/keybindings.el` checks every row against
  an actual, live Emacs keymap --- this game is not guessing or half-remembering a
  binding, the same way a hand-written quiz might.
- **It only teaches core/stock Emacs**, not that project's own custom additions
  (anything marked "this config:" in the source doc is deliberately filtered out).
- **It's leveled by the doc's own structure**, not invented popularity numbers (there
  is no real usage-frequency data to draw on): Level 1 is that doc's own "five keys
  to survive" list; Levels 2--4 follow its section order, which its own author
  already wrote as a learning progression (its last section is literally "A learning
  path"). See `extract-keybindings.py`'s own `SECTION_TIERS` for the exact mapping.

To refresh the content after `docs/KEYBOARD.md` changes:

```sh
python3 extract-keybindings.py ../research-emacs/docs/KEYBOARD.md > keybindings.js
```

## Finger placement

The hint button (and the virtual keyboard's highlighting) don't guess at ergonomics
either --- they implement the real, considered advice already written in that same
project's `docs/TYPING.md` (section 3.1/3.2):

- **The modifier is pressed with the hand opposite the letter.** `C-f` (a left-hand
  letter) is shown with the *right* Ctrl; `C-n` (right-hand) with the *left* Ctrl.
- **Alt is a thumb key.**
- **A multi-key Control sequence (`C-x C-s`) is held through the whole thing** --- the
  hint says so explicitly, rather than implying you should tap Ctrl twice.
- **`C-M-` combos get a specific, real warning**: many Windows keyboard layouts treat
  Ctrl+Alt as AltGr and type a symbol instead, so the hint suggests `Esc` then the
  plain Control chord --- the same workaround that doc recommends.

This logic lives in `emacs-notation.js` (`chordGuidance`/`sequenceGuidance`), separate
from the game/UI code in `game.js`, so it can be read (or reused) on its own.

## Files

| File | What it is |
|---|---|
| `index.html` | page structure |
| `style.css` | all visual styling |
| `keybindings.js` | generated game content --- do not hand-edit, see above |
| `extract-keybindings.py` | generates `keybindings.js` from `docs/KEYBOARD.md` |
| `emacs-notation.js` | parsing Emacs key notation into real browser key matches, plus finger-placement guidance --- pure logic, no DOM |
| `keyboard-layout.js` | builds the on-screen virtual keyboard (visual only, not clickable) |
| `game.js` | game state, scoring, rounds, levels, localStorage save/load |

## A real, known limitation

Your browser may intercept some key combinations before the game ever sees them
(`Ctrl+W` closing the tab, `Ctrl+N` opening a window, and a few others are reserved
by browsers for security and cannot be overridden by any page). If a key seems to do
nothing, that's almost always why, not a bug in the game --- there's a note about this
on the title screen.

## Verification

This was tested end to end in a real headless Chromium session (not just by reading
the code): a real tier click, a real multi-chord sequence (`C-x C-f`) typed with
actual dispatched keyboard events and scored correct, a wrong keypress confirmed to
show feedback without costing a life, and a full 3-life drain via real timeouts
confirmed to reach the game-over screen with no JavaScript errors at any point.
