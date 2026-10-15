// A tiny Emacs-buffer simulator shown under the prompt. When a round is answered
// correctly, the command is actually applied to this buffer so you SEE what it does:
// the point (cursor) moves for movement commands, text disappears for kill commands,
// the region lights up when the mark is set, and so on. Pure logic + one render
// function; the game calls demoReset() each round and demoApply(command, chord)
// on a correct answer.

const DEMO_TEXT = [
  ";; -*- lesson.el -*-",
  "(defun greet (name)",
  "  \"Say hello to NAME.\"",
  "  (message \"Hello, %s!\" name))",
  "",
  "The quick brown fox jumps over the lazy dog.",
  "Emacs is a text editor, and much more besides.",
  "",
  "Second paragraph starts here. It has two sentences.",
  "(greet \"world\")",
].join("\n");

const DEMO_HOME_POINT = DEMO_TEXT.indexOf("brown");

const demo = { text: DEMO_TEXT, point: DEMO_HOME_POINT, mark: null, kill: "", echo: "", history: [] };

function demoReset() {
  demo.text = DEMO_TEXT; demo.point = DEMO_HOME_POINT; demo.mark = null; demo.echo = ""; demo.history = [];
  demoRender();
}

// ---- buffer helpers -------------------------------------------------------------
const isWordCh = (c) => /[A-Za-z0-9]/.test(c || "");
function lineStart(t, p) { const i = t.lastIndexOf("\n", p - 1); return i < 0 ? 0 : i + 1; }
function lineEnd(t, p) { const i = t.indexOf("\n", p); return i < 0 ? t.length : i; }
function column(t, p) { return p - lineStart(t, p); }
function moveLines(t, p, n) {
  const col = column(t, p);
  let ls = lineStart(t, p);
  for (let i = 0; i < Math.abs(n); i++) {
    if (n > 0) { const e = lineEnd(t, ls); if (e >= t.length) break; ls = e + 1; }
    else { if (ls === 0) break; ls = lineStart(t, ls - 1); }
  }
  return Math.min(ls + col, lineEnd(t, ls));
}
function fwdWord(t, p) { while (p < t.length && !isWordCh(t[p])) p++; while (p < t.length && isWordCh(t[p])) p++; return p; }
function bwdWord(t, p) { while (p > 0 && !isWordCh(t[p - 1])) p--; while (p > 0 && isWordCh(t[p - 1])) p--; return p; }
function fwdSentence(t, p) { const m = /[.!?]["')]*(\s|$)/g; m.lastIndex = p; const r = m.exec(t); return r ? r.index + r[0].length - (r[1] ? 1 : 0) + (r[1] === "\n" ? 0 : 0) : t.length; }
function bwdSentence(t, p) { let i = p - 1; while (i > 0 && /\s/.test(t[i])) i--; while (i > 0 && !/[.!?]/.test(t[i - 1])) i--; while (i < p && /\s/.test(t[i])) i++; return i; }
function fwdPara(t, p) { let i = t.indexOf("\n\n", p); if (i < 0) return t.length; return i + 1; }
function bwdPara(t, p) { let i = t.lastIndexOf("\n\n", Math.max(0, p - 2)); return i < 0 ? 0 : i + 1; }
function matchParen(t, p, dir) {
  let depth = 0;
  for (let i = p; i >= 0 && i < t.length; i += dir) {
    if (t[i] === "(") depth += dir; else if (t[i] === ")") depth -= dir;
    if (depth < 0) return null;
    if (depth === 0 && (t[i] === "(" || t[i] === ")")) return dir > 0 ? i + 1 : i;
  }
  return null;
}
function splice(start, end, ins) { demo.text = demo.text.slice(0, start) + ins + demo.text.slice(end); }
function snapshot() { demo.history.push({ text: demo.text, point: demo.point }); }
function killRange(a, b) { const s = Math.min(a, b), e = Math.max(a, b); demo.kill = demo.text.slice(s, e); snapshot(); splice(s, e, ""); demo.point = s; demo.mark = null; return demo.kill; }
function insertAt(s) { snapshot(); splice(demo.point, demo.point, s); demo.point += s.length; }
function caseWord(fn) { const e = fwdWord(demo.text, demo.point); snapshot(); const w = demo.text.slice(demo.point, e); splice(demo.point, e, fn(w)); demo.point = e; }

// ---- the command table ----------------------------------------------------------
// Each entry: (chord) => echo string. `chord` is the last parsed chord of the key.
const DEMO_COMMANDS = {
  "forward-char": () => { demo.point = Math.min(demo.text.length, demo.point + 1); },
  "backward-char": () => { demo.point = Math.max(0, demo.point - 1); },
  "next-line": () => { demo.point = moveLines(demo.text, demo.point, 1); },
  "previous-line": () => { demo.point = moveLines(demo.text, demo.point, -1); },
  "forward-word": () => { demo.point = fwdWord(demo.text, demo.point); },
  "backward-word": () => { demo.point = bwdWord(demo.text, demo.point); },
  "move-beginning-of-line": () => { demo.point = lineStart(demo.text, demo.point); },
  "move-end-of-line": () => { demo.point = lineEnd(demo.text, demo.point); },
  "back-to-indentation": () => { let p = lineStart(demo.text, demo.point); while (/[ \t]/.test(demo.text[p])) p++; demo.point = p; },
  "beginning-of-buffer": () => { demo.mark = demo.point; demo.point = 0; return "Mark set"; },
  "end-of-buffer": () => { demo.mark = demo.point; demo.point = demo.text.length; return "Mark set"; },
  "forward-sentence": () => { demo.point = fwdSentence(demo.text, demo.point); },
  "backward-sentence": () => { demo.point = bwdSentence(demo.text, demo.point); },
  "forward-paragraph": () => { demo.point = fwdPara(demo.text, demo.point); },
  "backward-paragraph": () => { demo.point = bwdPara(demo.text, demo.point); },
  "forward-sexp": () => { const t = demo.text; let p = demo.point; while (p < t.length && /\s/.test(t[p])) p++; demo.point = t[p] === "(" ? (matchParen(t, p, 1) ?? fwdWord(t, p)) : fwdWord(t, p); },
  "backward-sexp": () => { const t = demo.text; let p = demo.point; while (p > 0 && /\s/.test(t[p - 1])) p--; demo.point = t[p - 1] === ")" ? (matchParen(t, p - 1, -1) ?? bwdWord(t, p)) : bwdWord(t, p); },
  "backward-up-list": () => { const t = demo.text; let depth = 0; for (let i = demo.point - 1; i >= 0; i--) { if (t[i] === ")") depth++; else if (t[i] === "(") { if (depth === 0) { demo.point = i; return; } depth--; } } return "At top level"; },
  "down-list": () => { const i = demo.text.indexOf("(", demo.point); if (i >= 0) demo.point = i + 1; else return "No next list"; },
  "beginning-of-defun": () => { const i = demo.text.lastIndexOf("\n(defun", demo.point - 1); demo.point = i < 0 ? (demo.text.startsWith("(defun") ? 0 : demo.point) : i + 1; },
  "end-of-defun": () => { const t = demo.text; let i = t.indexOf("\n(defun", demo.point); const s = i < 0 ? t.lastIndexOf("(defun") : t.lastIndexOf("(defun", demo.point); const e = matchParen(t, s, 1); demo.point = e == null ? t.length : Math.min(t.length, e + 1); },
  "scroll-up-command": () => { demo.point = moveLines(demo.text, demo.point, 4); return "Scrolled down (point follows)"; },
  "scroll-down-command": () => { demo.point = moveLines(demo.text, demo.point, -4); return "Scrolled up (point follows)"; },
  "goto-line": () => { demo.point = lineStart(demo.text, moveLines(demo.text, 0, 5)); return "Goto line: 6"; },
  "goto-char": () => { demo.point = 42; return "Goto char: 42"; },
  "move-to-column": () => { const ls = lineStart(demo.text, demo.point); demo.point = Math.min(lineEnd(demo.text, demo.point), ls + 10); return "Move to column: 10"; },
  "recenter-top-bottom": () => "Recentered the window (point stays put)",

  "set-mark-command": () => { demo.mark = demo.point; return "Mark set"; },
  "exchange-point-and-mark": () => { if (demo.mark == null) return "No mark set in this buffer"; [demo.point, demo.mark] = [demo.mark, demo.point]; },
  "mark-word": () => { demo.mark = fwdWord(demo.text, demo.point); return "Mark set"; },
  "mark-sexp": () => { demo.mark = fwdWord(demo.text, demo.point); return "Mark set"; },
  "mark-paragraph": () => { demo.point = bwdPara(demo.text, demo.point); demo.mark = fwdPara(demo.text, demo.point); return "Mark set"; },
  "mark-whole-buffer": () => { demo.point = 0; demo.mark = demo.text.length; return "Mark set"; },

  "kill-line": () => { const e = lineEnd(demo.text, demo.point); killRange(demo.point, e === demo.point && e < demo.text.length ? e + 1 : e); },
  "kill-whole-line": () => { killRange(lineStart(demo.text, demo.point), Math.min(demo.text.length, lineEnd(demo.text, demo.point) + 1)); },
  "kill-word": () => { killRange(demo.point, fwdWord(demo.text, demo.point)); },
  "backward-kill-word": () => { killRange(bwdWord(demo.text, demo.point), demo.point); },
  "kill-sexp": () => { DEMO_COMMANDS["forward-sexp"](); const e = demo.point; demo.point = demo.history.length ? demo.point : demo.point; /* point already moved */ const s = demo.text.slice(0, e).search(/\S+$/); killRange(s < 0 ? e : s, e); },
  "backward-kill-sentence": () => { killRange(bwdSentence(demo.text, demo.point), demo.point); },
  "kill-region": () => { if (demo.mark == null) return "The mark is not set now, so there is no region"; killRange(demo.mark, demo.point); },
  "kill-ring-save": () => { if (demo.mark == null) return "The mark is not set now, so there is no region"; demo.kill = demo.text.slice(Math.min(demo.mark, demo.point), Math.max(demo.mark, demo.point)); demo.mark = null; return "Copied to the kill ring"; },
  "zap-to-char": () => { const i = demo.text.indexOf(".", demo.point); if (i < 0) return "Zap to char: ."; killRange(demo.point, i + 1); return "Zap to char: ."; },
  "yank": () => { insertAt(demo.kill || "fox "); },
  "yank-pop": () => "Would replace the yanked text with the previous kill",
  "delete-backward-char": () => { if (demo.point > 0) { snapshot(); splice(demo.point - 1, demo.point, ""); demo.point--; } },
  "delete-char": () => { if (demo.point < demo.text.length) { snapshot(); splice(demo.point, demo.point + 1, ""); } },
  "delete-forward-char": () => DEMO_COMMANDS["delete-char"](),
  "delete-horizontal-space": () => { let s = demo.point, e = demo.point; while (s > 0 && /[ \t]/.test(demo.text[s - 1])) s--; while (e < demo.text.length && /[ \t]/.test(demo.text[e])) e++; snapshot(); splice(s, e, ""); demo.point = s; },
  "cycle-spacing": () => { let s = demo.point, e = demo.point; while (s > 0 && /[ \t]/.test(demo.text[s - 1])) s--; while (e < demo.text.length && /[ \t]/.test(demo.text[e])) e++; snapshot(); splice(s, e, " "); demo.point = s + 1; },
  "delete-indentation": () => { const ls = lineStart(demo.text, demo.point); if (ls === 0) return; let e = ls; while (/[ \t]/.test(demo.text[e])) e++; snapshot(); splice(ls - 1, e, " "); demo.point = ls - 1; },
  "delete-blank-lines": () => { snapshot(); demo.text = demo.text.replace(/\n\n+/g, "\n"); demo.point = Math.min(demo.point, demo.text.length); },
  "newline": () => { insertAt("\n"); },
  "electric-newline-and-maybe-indent": () => { insertAt("\n  "); },
  "open-line": () => { snapshot(); splice(demo.point, demo.point, "\n"); },
  "self-insert-command": (c) => { insertAt(c.browserKey.length === 1 ? c.browserKey : "x"); },
  "quoted-insert": () => { insertAt("^I"); return "Quoted insert: inserted a raw tab"; },
  "transpose-chars": () => { const p = demo.point; if (p < 1 || p >= demo.text.length) return; snapshot(); const t = demo.text; demo.text = t.slice(0, p - 1) + t[p] + t[p - 1] + t.slice(p + 1); demo.point = p + 1; },
  "transpose-words": () => { const t = demo.text; const aS = bwdWord(t, demo.point), aE = fwdWord(t, aS), bE = fwdWord(t, aE), bS = bwdWord(t, bE); if (bS < aE) return; snapshot(); demo.text = t.slice(0, aS) + t.slice(bS, bE) + t.slice(aE, bS) + t.slice(aS, aE) + t.slice(bE); demo.point = bE; },
  "transpose-sexps": () => DEMO_COMMANDS["transpose-words"](),
  "transpose-lines": () => { const t = demo.text; const ls = lineStart(t, demo.point); if (ls === 0) return; const ps = lineStart(t, ls - 1); const le = lineEnd(t, ls); snapshot(); demo.text = t.slice(0, ps) + t.slice(ls, le) + "\n" + t.slice(ps, ls - 1) + t.slice(le); demo.point = Math.min(demo.text.length, le + 1); },
  "upcase-word": () => caseWord((w) => w.toUpperCase()),
  "downcase-word": () => caseWord((w) => w.toLowerCase()),
  "capitalize-word": () => caseWord((w) => w.replace(/[a-z]/, (c) => c.toUpperCase())),
  "fill-paragraph": () => "Reflowed the paragraph to the fill column",
  "indent-region": () => "Reindented the region",
  "comment-dwim": () => { const le = lineEnd(demo.text, demo.point); snapshot(); splice(le, le, "  ;; comment"); demo.point = le + 12; },
  "comment-line": () => { const ls = lineStart(demo.text, demo.point); snapshot(); splice(ls, ls, ";; "); demo.point = moveLines(demo.text, demo.point + 3, 1); },
  "dabbrev-expand": () => { const s = bwdWord(demo.text, demo.point); const prefix = demo.text.slice(s, demo.point); const m = new RegExp("\\b" + prefix + "[A-Za-z]+").exec(demo.text.slice(0, s) + " " + demo.text.slice(demo.point)); if (m && prefix) { insertAt(m[0].slice(prefix.length)); } else insertAt("jumps"); },
  "undo": () => { const h = demo.history.pop(); if (!h) return "No further undo information"; demo.text = h.text; demo.point = h.point; return "Undo"; },
  "undo-redo": () => "Redo",
  "universal-argument": () => "C-u-",
  "digit-argument": (c) => `C-u ${c.display}-`,
  "negative-argument": () => "C-u --",
  "keyboard-quit": () => { demo.mark = null; return "Quit"; },
  "keyboard-escape-quit": () => { demo.mark = null; return "Quit"; },
  "count-words-region": () => { const t = demo.text; return `Buffer has ${t.split("\n").length} lines, ${t.split(/\s+/).filter(Boolean).length} words, and ${t.length} characters`; },
  "what-cursor-position": () => { const ch = demo.text[demo.point] || "EOB"; return `Char: ${ch} point=${demo.point + 1} of ${demo.text.length} column=${column(demo.text, demo.point)}`; },
  "insert-pair": () => { insertAt("()"); demo.point--; },
  "insert-char": () => { insertAt("λ"); return "Inserted GREEK SMALL LETTER LAMDA"; },
  "xref-find-definitions": () => { const i = demo.text.indexOf("(defun greet"); demo.point = i + 7; return "Jumped to the definition of greet"; },
  "xref-go-back": () => { demo.point = demo.text.lastIndexOf("(greet"); return "Jumped back"; },
  "not-modified": () => "Modification-flag cleared",
};

/** Apply COMMAND to the demo buffer. Returns true if the buffer knows this command. */
function demoApply(command, lastChord) {
  const fn = DEMO_COMMANDS[command];
  if (!fn) { demo.echo = `M-x ${command}`; demoRender(); return false; }
  const msg = fn(lastChord);
  demo.point = Math.max(0, Math.min(demo.text.length, demo.point));
  demo.echo = msg || command;
  demoRender(true);
  return true;
}

function demoRender(flash) {
  const el = document.getElementById("demo-buffer");
  if (!el) return;
  const t = demo.text, p = demo.point;
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  let html;
  const regionA = demo.mark == null ? null : Math.min(demo.mark, p), regionB = demo.mark == null ? null : Math.max(demo.mark, p);
  const cursorCh = p < t.length ? (t[p] === "\n" ? " " : t[p]) : " ";
  const cursorHtml = `<span class="demo-cursor">${esc(cursorCh)}</span>` + (t[p] === "\n" ? "\n" : "");
  if (regionA != null && regionA !== regionB) {
    html = esc(t.slice(0, regionA)) + '<span class="demo-region">' + esc(t.slice(regionA, regionB)) + "</span>" + esc(t.slice(regionB));
    // overlay the cursor by re-inserting at p relative to region edges
    if (p === regionA) html = esc(t.slice(0, p)) + cursorHtml + '<span class="demo-region">' + esc(t.slice(p + 1, regionB)) + "</span>" + esc(t.slice(regionB));
    else html = esc(t.slice(0, regionA)) + '<span class="demo-region">' + esc(t.slice(regionA, p)) + "</span>" + cursorHtml + esc(t.slice(p + 1));
  } else {
    html = esc(t.slice(0, p)) + cursorHtml + esc(t.slice(p + 1));
  }
  el.querySelector(".demo-text").innerHTML = html;
  const ln = t.slice(0, p).split("\n").length;
  el.querySelector(".demo-modeline").textContent = `-:${demo.history.length ? "**" : "--"}  lesson.el   L${ln}:C${column(t, p)}   (Emacs-Lisp)`;
  el.querySelector(".demo-echo").textContent = demo.echo;
  if (flash) { const c = el.querySelector(".demo-cursor"); if (c) { c.classList.add("flash"); } }
}
