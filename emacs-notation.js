// Parsing Emacs key notation ("C-x C-s", "M-s o", "C-M-f", "RET", "<f3>", ...) into
// real browser KeyboardEvent matches, plus finger/hand guidance for how to press each
// chord comfortably.
//
// The finger-placement advice below is NOT invented for this game --- it is lifted
// directly from research-emacs/docs/TYPING.md section 3.1/3.2 (that project's own
// real, considered ergonomics guidance): press the modifier with the hand OPPOSITE
// the letter, thumb for Alt, hold Control through a whole multi-key chord instead of
// releasing between presses, and --- a real, specific gotcha that guidance calls
// out --- C-M- chords are often better typed as `Esc` then the Control chord, since
// many Windows keyboard layouts treat Ctrl+Alt as AltGr and produce a symbol instead.

// Standard QWERTY touch-typing finger chart (the same split typing tutors have used
// for decades --- not something specific to Emacs). Only the home three rows are
// mapped; anything else (function keys, arrows, etc.) is called out as "no standard
// touch-typing finger for this one" rather than guessed.
// US-layout Shift pairs: shifted symbol -> the unshifted key it lives on. Used both
// for finger guidance and for highlighting the right physical key on the virtual
// keyboard (a "!" round lights up Shift and the "1" key).
const SHIFT_PAIRS = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8",
  "(": "9", ")": "0", "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'",
  "<": ",", ">": ".", "?": "/",
};

const FINGER_CHART = {};
(function () {
  const rows = [
    ["`1qaz", "L", "pinky"], ["2wsx", "L", "ring"], ["3edc", "L", "middle"],
    ["45rfvtgb", "L", "index"],
    ["67yhnujm", "R", "index"], ["8ik,", "R", "middle"], ["9ol.", "R", "ring"],
    ["0p;/'[]-=\\", "R", "pinky"],
  ];
  for (const [chars, hand, finger] of rows) {
    for (const ch of chars) FINGER_CHART[ch] = { hand, finger };
  }
  for (const [sym, base] of Object.entries(SHIFT_PAIRS)) {
    if (FINGER_CHART[base]) FINGER_CHART[sym] = FINGER_CHART[base];
  }
})();

// Named keys with no single printable character --- their own real position, not a
// touch-typing-chart character.
const NAMED_KEYS = {
  RET: { browserKey: "Enter", hand: "R", finger: "pinky", note: "Enter, far right" },
  SPC: { browserKey: " ", hand: null, finger: "thumb", note: "either thumb" },
  TAB: { browserKey: "Tab", hand: "L", finger: "pinky", note: "top left" },
  DEL: { browserKey: "Backspace", hand: "R", finger: "pinky", note: "far right" },
  ESC: { browserKey: "Escape", hand: "L", finger: "pinky", note: "top left corner" },
};
const BRACKET_KEYS = {
  f1: "F1", f2: "F2", f3: "F3", f4: "F4", f5: "F5", f6: "F6", f7: "F7", f8: "F8",
  f9: "F9", f10: "F10", f11: "F11", f12: "F12",
  left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown",
  home: "Home", end: "End", next: "PageDown", prior: "PageUp",
  insert: "Insert", delete: "Delete", backspace: "Backspace", escape: "Escape",
  tab: "Tab", return: "Enter",
};

/** Split one Emacs chord token ("C-M-f", "M-s", "%", "<f3>") into
 * {ctrl, meta, shift, browserKey, display, finger}. */
function parseChord(token) {
  let ctrl = false, meta = false, shift = false, rest = token;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (rest.startsWith("C-")) { ctrl = true; rest = rest.slice(2); }
    else if (rest.startsWith("M-")) { meta = true; rest = rest.slice(2); }
    else if (rest.startsWith("S-") || rest.startsWith("s-")) { shift = true; rest = rest.slice(2); }
    else break;
  }
  let browserKey, finger, hand, note;
  if (NAMED_KEYS[rest]) {
    const n = NAMED_KEYS[rest];
    browserKey = n.browserKey; finger = n.finger; hand = n.hand; note = n.note;
  } else if (rest.startsWith("<") && rest.endsWith(">")) {
    const name = rest.slice(1, -1).toLowerCase();
    browserKey = BRACKET_KEYS[name] || name;
    finger = null; note = "no standard touch-typing finger for this one --- glance down";
  } else {
    browserKey = rest;
    if (shift && /^[a-z]$/.test(rest)) browserKey = rest.toUpperCase(); // S-v is typed as "V"
    const chart = FINGER_CHART[rest.toLowerCase()];
    if (chart) { hand = chart.hand; finger = chart.finger; }
  }
  const needsShift = shift || /^[A-Z]$/.test(browserKey) || !!SHIFT_PAIRS[browserKey];
  const baseKey = SHIFT_PAIRS[browserKey] || (/^[A-Z]$/.test(browserKey) ? browserKey.toLowerCase() : browserKey);
  return { ctrl, meta, shift: needsShift, browserKey, baseKey, display: rest, hand, finger, note };
}

/** Split a full Emacs key description ("C-x C-s", "M-s o") into chord tokens. */
function parseSequence(notation) {
  return notation.split(/\s+/).map(parseChord);
}

/** Does KeyboardEvent `e` match chord `c`? Shift is checked only when the chord's
 * own base key needs it to be typed at all (an uppercase letter or an explicit S-
 * prefix) --- `e.key` already reflects real shift state for letters, so comparing
 * it case-sensitively is enough; this only guards the few named/symbol keys where
 * `e.key` would not vary with shift on its own. */
function chordMatches(e, c) {
  if (!!e.ctrlKey !== c.ctrl) return false;
  if (!!e.altKey !== c.meta) return false;
  if (e.key === c.browserKey) return true;
  // Tolerate layouts/OSes that report the UNshifted key with shiftKey set (e.g.
  // key "5" + Shift for "%", or "v" + Shift for S-v) --- and the reverse for an
  // unshifted chord, so a stray Shift on "C-x 5" still fails as it should.
  if (c.shift && e.shiftKey && c.baseKey && e.key === c.baseKey) return true;
  if (!c.shift && c.browserKey.length === 1 && !e.shiftKey && e.key.toLowerCase() === c.browserKey) return true;
  return false;
}

/** Real, doc-sourced guidance for how to press one parsed chord comfortably. */
function chordGuidance(c) {
  const parts = [];
  if (c.ctrl && c.meta) {
    return "Tricky combo: on many Windows layouts Ctrl+Alt types a symbol instead " +
      "(AltGr). Easier as two steps: press Esc, release, then hold Ctrl and press " +
      (c.hand ? describeKey(c) : c.display) + ".";
  }
  if (c.ctrl) {
    const oppositeHand = c.hand === "L" ? "RIGHT" : c.hand === "R" ? "LEFT" : null;
    parts.push(
      oppositeHand
        ? `Hold Ctrl with your ${oppositeHand.toLowerCase()} pinky (opposite hand from the letter)`
        : "Hold either Ctrl"
    );
  }
  if (c.meta) parts.push("hold Alt with your thumb");
  if (c.shift) {
    const shiftHand = c.hand === "L" ? "right" : c.hand === "R" ? "left" : "either";
    parts.push(`hold Shift with your ${shiftHand} pinky`);
  }
  parts.push(`press ${describeKey(c)}`);
  return capitalize(parts.join(", then ")) + ".";
}

function describeKey(c) {
  if (c.note) return `${c.display} (${c.note})`;
  if (c.hand && c.finger) {
    const handWord = c.hand === "L" ? "left" : "right";
    const onKey = c.baseKey && c.baseKey !== c.browserKey ? ` (the ${c.baseKey} key)` : "";
    return `${c.display}${onKey} with your ${handWord} ${c.finger}`;
  }
  return c.display;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/** Full, multi-line guidance for a whole command (one or more chords). */
function sequenceGuidance(notation) {
  const chords = parseSequence(notation);
  const lines = chords.map((c, i) => `${i + 1}. ${chordGuidance(c)}`);
  if (chords.length > 1 && chords.every((c) => c.ctrl) ) {
    lines.push("Hold that same Ctrl down through the whole sequence --- do not release between presses.");
  } else if (chords.length > 1) {
    lines.push("Release any modifier before the next key unless that key also shows Ctrl/Alt above.");
  }
  return lines;
}
