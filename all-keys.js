// Level 5: "Full Keyboard" --- every number and symbol key on a US keyboard, so the
// whole keyboard gets practised, not just the letters.
//
// Unlike keybindings.js this file is hand-written, not generated. It has two kinds
// of rounds:
//   1. Stock Emacs commands bound to number/symbol keys (digit arguments, M-< / M->,
//      M-% query-replace, C-x ( macros, window sizing with C-x { } ^ - +, etc.).
//      These are the standard global bindings of a stock GNU Emacs (28+).
//   2. Plain "type this character" rounds (self-insert-command) for every printable
//      key, including the shifted ones --- ! @ # $ % ^ & * ( ) _ + { } | : " < > ? ~ ---
//      because reaching for Shift+symbol combos without looking is its own skill.
//
// Note for macOS: Option+key often types a special character (Option+1 = ¡) unless
// the browser or OS is set to treat Option as Alt. If an M- combo never registers,
// that is why; Esc then the key is an equivalent way to type M- chords in Emacs.

const FULL_TIER = 5;

const ALL_KEYS = [];

function addKey(key, command, description, category) {
  ALL_KEYS.push({
    key, command, description,
    keymap: "global", category, section: "Full keyboard", tier: FULL_TIER,
  });
}

// ---- 1. Number keys --------------------------------------------------------------
for (let d = 0; d <= 9; d++) {
  addKey(`M-${d}`, "digit-argument", `Prefix argument ${d} (then a command: e.g. M-${d} C-f)`, "Numbers");
  addKey(`C-${d}`, "digit-argument", `Prefix argument ${d} using Ctrl instead of Alt`, "Numbers");
}
addKey("M--", "negative-argument", "Negative prefix argument (M-- C-k kills backwards)", "Numbers");
addKey("C--", "negative-argument", "Negative prefix argument using Ctrl", "Numbers");
addKey("C-u", "universal-argument", "Prefix argument 4 (C-u C-u is 16)", "Numbers");
addKey("C-x 0", "delete-window", "Close the current window", "Windows");
addKey("C-x 1", "delete-other-windows", "Keep only this window", "Windows");
addKey("C-x 2", "split-window-below", "Split the window top/bottom", "Windows");
addKey("C-x 3", "split-window-right", "Split the window left/right", "Windows");
addKey("C-x 4 f", "find-file-other-window", "Open a file in another window", "Windows");
addKey("C-x 5 2", "make-frame-command", "Open a new frame (OS window)", "Frames");
addKey("C-x 5 0", "delete-frame", "Close this frame", "Frames");
addKey("C-x 5 1", "delete-other-frames", "Close all other frames", "Frames");
addKey("C-x 8 RET", "insert-char", "Insert a Unicode character by name", "Editing");
addKey("C-x C-0", "text-scale-adjust", "Reset text size", "Display");
addKey("C-x C-=", "text-scale-adjust", "Make text bigger", "Display");
addKey("C-x C--", "text-scale-adjust", "Make text smaller", "Display");

// ---- 2. Symbol keys: real stock bindings ----------------------------------------
addKey("M-<", "beginning-of-buffer", "Jump to the start of the buffer", "Moving around");
addKey("M->", "end-of-buffer", "Jump to the end of the buffer", "Moving around");
addKey("M-{", "backward-paragraph", "Back one paragraph", "Moving around");
addKey("M-}", "forward-paragraph", "Forward one paragraph", "Moving around");
addKey("M-,", "xref-go-back", "Go back to where you jumped from", "Code");
addKey("M-.", "xref-find-definitions", "Jump to the definition of the symbol at point", "Code");
addKey("M-?", "xref-find-references", "Find references to the symbol at point", "Code");
addKey("M-;", "comment-dwim", "Comment or uncomment (do what I mean)", "Code");
addKey("C-x C-;", "comment-line", "Comment or uncomment the current line", "Code");
addKey("M-/", "dabbrev-expand", "Complete the word from text in open buffers", "Editing");
addKey("M-:", "eval-expression", "Evaluate a Lisp expression", "Lisp");
addKey("M-!", "shell-command", "Run a shell command", "Shell");
addKey("M-&", "async-shell-command", "Run a shell command asynchronously", "Shell");
addKey("M-|", "shell-command-on-region", "Pipe the region through a shell command", "Shell");
addKey("M-%", "query-replace", "Search and replace, asking at each match", "Search");
addKey("C-M-%", "query-replace-regexp", "Regexp search and replace, asking at each match", "Search");
addKey("M-$", "ispell-word", "Spell-check the word at point", "Editing");
addKey("M-^", "delete-indentation", "Join this line onto the previous one", "Editing");
addKey("M-\\", "delete-horizontal-space", "Delete all spaces and tabs around point", "Editing");
addKey("C-M-\\", "indent-region", "Indent the region", "Editing");
addKey("M-@", "mark-word", "Mark the next word", "Marking");
addKey("C-M-@", "mark-sexp", "Mark the next expression", "Marking");
addKey("C-@", "set-mark-command", "Set the mark (same as C-SPC)", "Marking");
addKey("M-~", "not-modified", "Mark the buffer as unmodified", "Buffers");
addKey("M-=", "count-words-region", "Count lines, words and characters in the region", "Editing");
addKey("M-(", "insert-pair", "Insert a pair of parentheses ()", "Editing");
addKey("M-)", "move-past-close-and-reindent", "Move past the closing paren and reindent", "Editing");
addKey("M-'", "abbrev-prefix-mark", "Mark a prefix before an abbrev", "Editing");
addKey("M-`", "tmm-menubar", "Open the menu bar from the keyboard", "Help");
addKey("C-x (", "kmacro-start-macro", "Start recording a keyboard macro", "Macros");
addKey("C-x )", "kmacro-end-macro", "Stop recording the keyboard macro", "Macros");
addKey("C-x [", "backward-page", "Back one page (^L-delimited)", "Moving around");
addKey("C-x ]", "forward-page", "Forward one page (^L-delimited)", "Moving around");
addKey("C-x {", "shrink-window-horizontally", "Make this window narrower", "Windows");
addKey("C-x }", "enlarge-window-horizontally", "Make this window wider", "Windows");
addKey("C-x ^", "enlarge-window", "Make this window taller", "Windows");
addKey("C-x -", "shrink-window-if-larger-than-buffer", "Shrink the window to fit its buffer", "Windows");
addKey("C-x +", "balance-windows", "Make all windows the same size", "Windows");
addKey("C-x =", "what-cursor-position", "Show info about the character at point", "Display");
addKey("C-x <", "scroll-left", "Scroll the window left", "Display");
addKey("C-x >", "scroll-right", "Scroll the window right", "Display");
addKey("C-x $", "set-selective-display", "Hide lines indented more than N columns", "Display");
addKey("C-x '", "expand-abbrev", "Expand the abbrev before point", "Editing");
addKey("C-x `", "next-error", "Jump to the next compile/grep error", "Code");
addKey("C-x ;", "set-comment-column", "Set the comment column", "Code");
addKey("C-x .", "set-fill-prefix", "Set the fill prefix from the text before point", "Editing");
addKey("C-x #", "server-edit", "Finish editing an emacsclient file", "Buffers");
addKey("C-x * c", "calc", "Start the calculator", "Tools");
addKey("C-x C-x", "exchange-point-and-mark", "Swap point and mark", "Marking");
addKey("C-/", "undo", "Undo", "Editing");
addKey("C-_", "undo", "Undo (the other key for it)", "Editing");
addKey("C-?", "undo-redo", "Redo", "Editing");
addKey("C-\\", "toggle-input-method", "Toggle the input method", "Editing");
addKey("C-]", "abort-recursive-edit", "Abort a recursive edit", "Global");
addKey("C-x DEL", "backward-kill-sentence", "Kill back to the start of the sentence", "Killing");
addKey("DEL", "delete-backward-char", "Delete the character before point (Backspace)", "Killing");
addKey("M-DEL", "backward-kill-word", "Kill the word before point (Alt+Backspace)", "Killing");
addKey("C-<backspace>", "backward-kill-word", "Kill the word before point (Ctrl+Backspace)", "Killing");
addKey("<delete>", "delete-forward-char", "Delete the character after point", "Killing");
addKey("C-<delete>", "kill-word", "Kill the word after point", "Killing");
addKey("RET", "newline", "Insert a newline", "Editing");
addKey("C-o", "open-line", "Insert a newline after point without moving", "Editing");
addKey("C-j", "electric-newline-and-maybe-indent", "Newline and indent", "Editing");
addKey("C-q", "quoted-insert", "Insert the next key literally (e.g. a raw Tab)", "Editing");
addKey("ESC ESC ESC", "keyboard-escape-quit", "Get out of everything (minibuffer, extra windows)", "Global");
addKey("C-x ESC ESC", "repeat-complex-command", "Re-run the last minibuffer command", "Global");

// ---- 3. Every Alt (Meta) letter binding in stock Emacs -------------------------
addKey("M-a", "backward-sentence", "Back one sentence", "Alt keys");
addKey("M-b", "backward-word", "Back one word", "Alt keys");
addKey("M-c", "capitalize-word", "Capitalize the next word", "Alt keys");
addKey("M-d", "kill-word", "Kill the next word", "Alt keys");
addKey("M-e", "forward-sentence", "Forward one sentence", "Alt keys");
addKey("M-f", "forward-word", "Forward one word", "Alt keys");
addKey("M-g g", "goto-line", "Go to a line number", "Alt keys");
addKey("M-g M-g", "goto-line", "Go to a line number (holding Alt)", "Alt keys");
addKey("M-g c", "goto-char", "Go to a character position", "Alt keys");
addKey("M-g n", "next-error", "Next error / grep match", "Alt keys");
addKey("M-g p", "previous-error", "Previous error / grep match", "Alt keys");
addKey("M-g TAB", "move-to-column", "Go to a column", "Alt keys");
addKey("M-h", "mark-paragraph", "Mark the paragraph", "Alt keys");
addKey("M-i", "tab-to-tab-stop", "Indent to the next tab stop", "Alt keys");
addKey("M-j", "default-indent-new-line", "Newline, continuing a comment if in one", "Alt keys");
addKey("M-k", "kill-sentence", "Kill to the end of the sentence", "Alt keys");
addKey("M-l", "downcase-word", "Lowercase the next word", "Alt keys");
addKey("M-m", "back-to-indentation", "Go to the first non-blank character on the line", "Alt keys");
addKey("M-q", "fill-paragraph", "Reflow the paragraph", "Alt keys");
addKey("M-r", "move-to-window-line-top-bottom", "Move point to the window's top / middle / bottom", "Alt keys");
addKey("M-s o", "occur", "List all lines matching a regexp", "Alt keys");
addKey("M-s .", "isearch-forward-symbol-at-point", "Search for the symbol at point", "Alt keys");
addKey("M-s w", "isearch-forward-word", "Word search", "Alt keys");
addKey("M-s _", "isearch-forward-symbol", "Symbol search", "Alt keys");
addKey("M-s h r", "highlight-regexp", "Highlight everything matching a regexp", "Alt keys");
addKey("M-s h u", "unhighlight-regexp", "Remove a highlight", "Alt keys");
addKey("M-s h l", "highlight-lines-matching-regexp", "Highlight whole lines matching a regexp", "Alt keys");
addKey("M-s h .", "highlight-symbol-at-point", "Highlight the symbol at point", "Alt keys");
addKey("M-t", "transpose-words", "Swap the two words around point", "Alt keys");
addKey("M-u", "upcase-word", "Uppercase the next word", "Alt keys");
addKey("M-v", "scroll-down-command", "Scroll up one screen (toward the beginning)", "Alt keys");
addKey("M-w", "kill-ring-save", "Copy the region", "Alt keys");
addKey("M-x", "execute-extended-command", "Run any command by name", "Alt keys");
addKey("M-X", "execute-extended-command-for-buffer", "Run a command relevant to this buffer", "Alt keys");
addKey("M-y", "yank-pop", "Cycle through earlier kills after a yank", "Alt keys");
addKey("M-z", "zap-to-char", "Kill up to and including a character", "Alt keys");
addKey("M-SPC", "cycle-spacing", "Collapse spaces around point to one", "Alt keys");
addKey("M-DEL", "backward-kill-word", "Kill the previous word (Alt+Backspace)", "Alt keys");
addKey("M-TAB", "completion-at-point", "Complete the symbol at point (browser may grab this one)", "Alt keys");

// ---- 4. Every Ctrl+Alt (C-M-) letter binding --------------------------------------
addKey("C-M-a", "beginning-of-defun", "Start of the current function", "Ctrl+Alt keys");
addKey("C-M-b", "backward-sexp", "Back one balanced expression", "Ctrl+Alt keys");
addKey("C-M-c", "exit-recursive-edit", "Exit a recursive edit", "Ctrl+Alt keys");
addKey("C-M-d", "down-list", "Move down into the next list", "Ctrl+Alt keys");
addKey("C-M-e", "end-of-defun", "End of the current function", "Ctrl+Alt keys");
addKey("C-M-f", "forward-sexp", "Forward one balanced expression", "Ctrl+Alt keys");
addKey("C-M-h", "mark-defun", "Mark the whole function", "Ctrl+Alt keys");
addKey("C-M-i", "completion-at-point", "Complete the symbol at point", "Ctrl+Alt keys");
addKey("C-M-j", "default-indent-new-line", "Newline continuing a comment", "Ctrl+Alt keys");
addKey("C-M-k", "kill-sexp", "Kill the next balanced expression", "Ctrl+Alt keys");
addKey("C-M-l", "reposition-window", "Scroll so the current function is visible", "Ctrl+Alt keys");
addKey("C-M-n", "forward-list", "Forward over a parenthesised group", "Ctrl+Alt keys");
addKey("C-M-o", "split-line", "Split the line, keeping indentation", "Ctrl+Alt keys");
addKey("C-M-p", "backward-list", "Backward over a parenthesised group", "Ctrl+Alt keys");
addKey("C-M-r", "isearch-backward-regexp", "Regexp search backward", "Ctrl+Alt keys");
addKey("C-M-s", "isearch-forward-regexp", "Regexp search forward", "Ctrl+Alt keys");
addKey("C-M-t", "transpose-sexps", "Swap the two expressions around point", "Ctrl+Alt keys");
addKey("C-M-u", "backward-up-list", "Move up out of the current list", "Ctrl+Alt keys");
addKey("C-M-v", "scroll-other-window", "Scroll the other window", "Ctrl+Alt keys");
addKey("C-M-S-v", "scroll-other-window-down", "Scroll the other window backward", "Ctrl+Alt keys");
addKey("C-M-w", "append-next-kill", "Make the next kill append to the last one", "Ctrl+Alt keys");
addKey("C-M-x", "eval-defun", "Evaluate the current function (Lisp)", "Ctrl+Alt keys");
addKey("C-M-SPC", "mark-sexp", "Mark the next expression", "Ctrl+Alt keys");
addKey("C-M-.", "xref-find-apropos", "Find symbols matching a pattern", "Ctrl+Alt keys");

// ---- 5. Type-the-character rounds: every printable key, including Shift combos --
const PRINTABLE = {
  "`": "backtick", "~": "tilde", "1": "one", "!": "exclamation mark", "2": "two", "@": "at sign",
  "3": "three", "#": "hash", "4": "four", "$": "dollar", "5": "five", "%": "percent",
  "6": "six", "^": "caret", "7": "seven", "&": "ampersand", "8": "eight", "*": "asterisk",
  "9": "nine", "(": "open paren", "0": "zero", ")": "close paren", "-": "minus", "_": "underscore",
  "=": "equals", "+": "plus", "[": "open bracket", "{": "open brace", "]": "close bracket",
  "}": "close brace", "\\": "backslash", "|": "pipe", ";": "semicolon", ":": "colon",
  "'": "single quote", '"': "double quote", ",": "comma", "<": "less than", ".": "period",
  ">": "greater than", "/": "slash", "?": "question mark",
};
for (const [ch, name] of Object.entries(PRINTABLE)) {
  addKey(ch, "self-insert-command", `Type the ${name}:  ${ch}`, "Type it");
}
