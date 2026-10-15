// Builds the on-screen virtual keyboard used purely as a visual aid (which key, and
// since Control is shown on the side OPPOSITE the letter, see emacs-notation.js and
// research-emacs/docs/TYPING.md section 3.1) --- it is not clickable; the real
// keyboard is what the game listens to.

const KEYBOARD_ROWS = [
  [["Esc", "Escape"], ["`", "`"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
   ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["0", "0"], ["-", "-"], ["=", "="], ["Backspace", "Backspace", "wide"]],
  [["Tab", "Tab", "wide"], ["q", "q"], ["w", "w"], ["e", "e"], ["r", "r"], ["t", "t"],
   ["y", "y"], ["u", "u"], ["i", "i"], ["o", "o"], ["p", "p"], ["[", "["], ["]", "]"], ["\\", "\\"]],
  [["Ctrl", null, "wide", "ctrl-left"], ["a", "a"], ["s", "s"], ["d", "d"], ["f", "f"], ["g", "g"],
   ["h", "h"], ["j", "j"], ["k", "k"], ["l", "l"], [";", ";"], ["'", "'"], ["Enter", "Enter", "wide"]],
  [["Shift", null, "wide", "shift-left"], ["z", "z"], ["x", "x"], ["c", "c"], ["v", "v"], ["b", "b"],
   ["n", "n"], ["m", "m"], [",", ","], [".", "."], ["/", "/"], ["Shift", null, "wide", "shift-right"]],
  [["Ctrl", null, "wide", "ctrl-left"], ["Alt", null, "wide", "alt-left"], ["Space", " ", "space"],
   ["Alt", null, "wide", "alt-right"], ["Ctrl", null, "wide", "ctrl-right"]],
];

function renderKeyboard() {
  const root = document.getElementById("keyboard");
  root.innerHTML = "";
  for (const row of KEYBOARD_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    for (const [label, browserKey, widthClass, dataKey] of row) {
      const keyEl = document.createElement("div");
      keyEl.className = "kb-key" + (widthClass ? ` kb-${widthClass}` : "");
      const shifted = browserKey && Object.keys(SHIFT_PAIRS).find((k) => SHIFT_PAIRS[k] === browserKey);
      if (shifted) {
        keyEl.innerHTML = `<span class="kb-shift">${shifted.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</span>${label}`;
        keyEl.dataset.shiftkey = shifted;
      } else {
        keyEl.textContent = label;
      }
      if (browserKey !== null && browserKey !== undefined) keyEl.dataset.browserkey = browserKey;
      if (dataKey) keyEl.dataset.key = dataKey;
      rowEl.appendChild(keyEl);
    }
    root.appendChild(rowEl);
  }
}

document.addEventListener("DOMContentLoaded", renderKeyboard);
