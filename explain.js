// "What this does in Emacs": a fuller explanation shown under every prompt, so you
// know what the command is for, not just which key it is. Hand-written explanations
// for the common commands, a jargon glossary for the Emacs words that appear in
// command names, and a fallback built from the command name itself.

const EMACS_GLOSSARY = {
  point: "point = the cursor position",
  mark: "mark = a second remembered position; point and mark together bound the region",
  region: "region = the text between point and mark (what other editors call the selection)",
  kill: "kill = cut (the text goes onto the kill ring, so it can be pasted back)",
  yank: "yank = paste from the kill ring",
  buffer: "buffer = an open file or other text Emacs is holding in memory",
  window: "window = a pane inside the Emacs frame showing a buffer",
  frame: "frame = what your OS calls a window",
  sexp: "sexp = a balanced expression: a word, a string, or everything between matching parens/brackets",
  defun: "defun = the whole function surrounding point",
  minibuffer: "minibuffer = the input line at the bottom where Emacs asks you things",
  dired: "dired = the directory editor, Emacs's file manager",
  isearch: "isearch = incremental search (C-s), which jumps as you type",
  register: "register = a named slot (a letter) that can hold a position or some text",
  rectangle: "rectangle = a columnar block of text between point and mark",
  macro: "keyboard macro = a recorded sequence of keys you can replay",
  kmacro: "keyboard macro = a recorded sequence of keys you can replay",
  xref: "xref = cross-references: jump to definitions and find usages",
  occur: "occur = list every line matching a regexp in a separate buffer",
  abbrev: "abbrev = a short abbreviation that expands into longer text",
  dabbrev: "dabbrev = dynamic abbreviation: complete from words already in your buffers",
  argument: "prefix argument = a number given before a command to repeat or modify it (C-u / M-digits)",
  ibuffer: "ibuffer = an interactive list of all buffers",
  vc: "vc = version control (git etc.) built into Emacs",
  project: "project = the current repository / directory tree",
  bookmark: "bookmark = a saved place in a file that survives restarts",
  evil: "evil = Vim keybindings inside Emacs",
  ranger: "ranger = a column-style file browser on top of dired",
  recenter: "recenter = scroll so point is in the middle (or top/bottom) of the window",
  apropos: "apropos = search Emacs's help for commands matching a word",
  fill: "fill = reflow/wrap text to the fill column (default 70)",
  transpose: "transpose = swap the two things around point",
  tab: "tab (here) = a tab-bar tab holding its own window layout",
  echo: "echo area = the line at the bottom where messages appear",
  lossage: "lossage = the record of your recent keystrokes",
  regexp: "regexp = a regular expression pattern",
};

const COMMAND_NOTES = {
  "keyboard-quit": "The universal escape hatch. Cancels a half-typed key sequence, a minibuffer prompt, or a running command. When in doubt, press it.",
  "save-buffers-kill-terminal": "Exits Emacs. Offers to save any modified buffers first and asks to confirm if processes are running.",
  "find-file": "Prompts for a file name in the minibuffer (with completion) and opens it in a new buffer; a name that does not exist creates a new file.",
  "save-buffer": "Writes the current buffer to its file. Does nothing if nothing changed.",
  "undo": "Undoes the last change; keep pressing to go further back. Any other command then makes the undos themselves undoable.",
  "undo-redo": "Redoes a change that was just undone.",
  "forward-char": "Moves point one character to the right (wraps to the next line).",
  "backward-char": "Moves point one character to the left.",
  "next-line": "Moves point down one line, trying to keep the same column.",
  "previous-line": "Moves point up one line, trying to keep the same column.",
  "forward-word": "Moves point to the end of the next word.",
  "backward-word": "Moves point to the start of the previous word.",
  "move-beginning-of-line": "Jumps to the start of the current line (Home).",
  "move-end-of-line": "Jumps to the end of the current line (End).",
  "back-to-indentation": "Jumps to the first non-whitespace character on the line.",
  "beginning-of-buffer": "Jumps to the very top. Sets the mark first so C-x C-x can take you back.",
  "end-of-buffer": "Jumps to the very bottom. Sets the mark first so you can return.",
  "forward-sentence": "Moves to the end of the sentence (sentences end at . ? ! followed by space).",
  "backward-sentence": "Moves to the start of the sentence.",
  "forward-paragraph": "Moves to the blank line after this paragraph.",
  "backward-paragraph": "Moves to the blank line before this paragraph.",
  "forward-sexp": "Moves over one balanced expression: a word, a string, or a whole (...) group. Great for code.",
  "backward-sexp": "Moves backward over one balanced expression.",
  "scroll-up-command": "Scrolls the text up, i.e. shows the NEXT screenful (Page Down).",
  "scroll-down-command": "Scrolls the text down, i.e. shows the PREVIOUS screenful (Page Up).",
  "recenter-top-bottom": "Scrolls so the current line is centred; press again for top, again for bottom.",
  "goto-line": "Asks for a line number and jumps there.",
  "set-mark-command": "Drops the mark at point. Then move: everything between mark and point is the region (shown highlighted).",
  "exchange-point-and-mark": "Swaps point and mark, so you jump to the other end of the region (or back to where you were).",
  "mark-whole-buffer": "Selects the entire buffer (like Ctrl+A elsewhere).",
  "kill-line": "Cuts from point to the end of the line; on an empty line it removes the line itself. Text goes to the kill ring.",
  "kill-word": "Cuts the word after point onto the kill ring.",
  "backward-kill-word": "Cuts the word before point onto the kill ring.",
  "kill-region": "Cuts the region (Ctrl+X elsewhere).",
  "kill-ring-save": "Copies the region to the kill ring without deleting it (Ctrl+C elsewhere).",
  "yank": "Pastes the most recent kill at point (Ctrl+V elsewhere).",
  "yank-pop": "Right after a yank, replaces the pasted text with the previous kill; keep pressing to go further back.",
  "zap-to-char": "Asks for a character and cuts everything from point up to and including the next occurrence of it.",
  "delete-backward-char": "Deletes the character before point (Backspace). Not saved to the kill ring.",
  "delete-char": "Deletes the character after point (Delete). Not saved to the kill ring.",
  "transpose-chars": "Swaps the two characters around point: fixes a typo like 'teh'.",
  "transpose-words": "Swaps the word before point with the word after.",
  "transpose-lines": "Swaps this line with the one above and moves down.",
  "upcase-word": "Makes the next word UPPERCASE and moves past it.",
  "downcase-word": "Makes the next word lowercase and moves past it.",
  "capitalize-word": "Capitalizes the next word and moves past it.",
  "fill-paragraph": "Re-wraps the paragraph so lines fit within the fill column.",
  "newline": "Inserts a line break.",
  "open-line": "Inserts a line break but leaves point where it is.",
  "delete-indentation": "Joins this line onto the end of the previous one with a single space.",
  "delete-horizontal-space": "Removes all spaces and tabs around point.",
  "cycle-spacing": "Collapses the whitespace around point to one space; press again for none, again to restore.",
  "execute-extended-command": "Opens M-x: type any command by name, with completion. Everything in Emacs is reachable this way.",
  "universal-argument": "Gives the next command a prefix argument of 4 (C-u C-u = 16). C-u C-f moves 4 characters; C-u 10 C-n moves 10 lines.",
  "digit-argument": "Starts typing a numeric prefix argument: M-5 C-f moves 5 characters forward.",
  "negative-argument": "Makes the next command go backwards: M-- M-d kills the previous word.",
  "isearch-forward": "Incremental search: start typing and point jumps to each match as you type. C-s again finds the next one; RET stops there; C-g goes back.",
  "isearch-backward": "Incremental search going upwards.",
  "query-replace": "Asks for a search string and a replacement, then stops at each match: y to replace, n to skip, ! for all.",
  "query-replace-regexp": "Like query-replace but the search is a regular expression; \\1 etc. work in the replacement.",
  "switch-to-buffer": "Prompts for a buffer name (with completion) and shows it in this window.",
  "list-buffers": "Lists all open buffers.",
  "kill-buffer": "Closes a buffer (asks to save it if modified).",
  "other-window": "Moves the cursor to the next window.",
  "delete-window": "Closes the current window (the buffer stays open).",
  "delete-other-windows": "Closes all other windows so this one fills the frame.",
  "split-window-below": "Splits the window into top and bottom halves.",
  "split-window-right": "Splits the window into left and right halves.",
  "kmacro-start-macro": "Starts recording every key you press.",
  "kmacro-end-macro": "Stops recording.",
  "kmacro-end-or-call-macro": "Stops recording if recording; otherwise replays the last macro. C-u 10 C-x e replays it 10 times.",
  "comment-dwim": "With a region: comments or uncomments it. Without: adds a comment at the end of the line.",
  "comment-line": "Comments or uncomments the current line and moves down.",
  "dabbrev-expand": "Completes the word you are typing using words found in your open buffers; press again to cycle candidates.",
  "xref-find-definitions": "Jumps to where the symbol at point is defined.",
  "xref-go-back": "Returns to where you were before the last definition jump.",
  "eval-last-sexp": "Evaluates the Lisp expression before point and shows the result in the echo area.",
  "describe-key": "Asks for a key and tells you which command it runs, with documentation.",
  "describe-function": "Shows the documentation of a function or command.",
  "describe-variable": "Shows the documentation and current value of a variable.",
  "help-for-help": "Shows all the help commands.",
  "self-insert-command": "The command bound to every ordinary key: inserts the character you typed.",
  "quoted-insert": "Inserts the next key literally, so you can type a raw Tab, Ctrl character or newline.",
  "repeat": "Repeats the last command (C-x z, then just z to keep repeating).",
  "keyboard-escape-quit": "A stronger C-g: exits the minibuffer, cancels prefix keys and deletes other windows.",
  "what-cursor-position": "Shows the character under point, its code, the buffer position and column.",
  "count-words-region": "Counts the lines, words and characters in the region (or whole buffer with a prefix).",
  "text-scale-adjust": "Zooms the text in this buffer; after the first press just + - 0 keep adjusting.",
};

function explainCommand(entry) {
  const name = entry.command;
  const base = COMMAND_NOTES[name] || fallbackNote(name, entry);
  const terms = [];
  for (const part of name.split(/-/)) {
    const g = EMACS_GLOSSARY[part];
    if (g && !terms.includes(g)) terms.push(g);
  }
  const where = entry.keymap && entry.keymap !== "global" ? `Only in ${entry.keymap} (mode-specific keymap).` : "Available everywhere (global keymap).";
  return { base, terms, where };
}

function fallbackNote(name, entry) {
  const words = name.replace(/-/g, " ");
  const prefix = /^(dired|ibuffer|evil|ranger|isearch|vc|project|wdired)-/.exec(name);
  const ctx = prefix ? ` It belongs to ${prefix[1]}, so it only works there.` : "";
  return `Runs the Emacs command “${words}”: ${entry.description.replace(/\.$/, "")}.${ctx} You could also run it by typing M-x ${name}.`;
}

function renderExplain(entry) {
  const box = document.getElementById("explain");
  if (!box) return;
  const { base, terms, where } = explainCommand(entry);
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  box.innerHTML =
    `<div class="explain-title">In Emacs: <code>M-x ${esc(entry.command)}</code> <span class="explain-where">${esc(where)}</span></div>` +
    `<div class="explain-body">${esc(base)}</div>` +
    (terms.length ? `<ul class="explain-terms">${terms.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");
}
