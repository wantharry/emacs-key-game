// Emacs Key Dojo --- game engine and UI wiring. Depends on keybindings.js
// (KEYBINDINGS, generated from research-emacs/docs/KEYBOARD.md) and
// emacs-notation.js (parseSequence/chordMatches/sequenceGuidance).

const TIER_NAMES = { 1: "Survive", 2: "Foundations", 3: "Getting Fluent", 4: "Advanced", 5: "Full Keyboard" };
const FREE_TIER = 5; // always unlocked: every number/symbol/Alt key on the keyboard, for free practice
const TIER_COUNT = 5;
const ROUND_SECONDS = 10;
const LIVES_START = 3;
const UNLOCK_THRESHOLD = 15; // correct answers in a tier that count as "mastered" on the menu
const ALL_LEVELS_OPEN = true; // every level is playable any time --- pick whatever you feel like drilling

const SAVE_KEY = "emacs-key-dojo-save-v1";

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore a corrupt or inaccessible save; start fresh */ }
  return { unlocked: 1, correctByTier: {}, bestScore: {} };
}
function save(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage may be unavailable (private window); not fatal */ }
}

const progress = loadSave();

const byTier = {};
for (const row of KEYBINDINGS.concat(typeof ALL_KEYS !== "undefined" ? ALL_KEYS : [])) (byTier[row.tier] ||= []).push(row);

let state = null; // the current round/session state, see newSession()

function $(sel) { return document.querySelector(sel); }

function renderHome() {
  $("#screen-home").classList.remove("hidden");
  $("#screen-game").classList.add("hidden");
  $("#screen-over").classList.add("hidden");
  const list = $("#tier-list");
  list.innerHTML = "";
  for (let t = 1; t <= TIER_COUNT; t++) {
    const unlocked = ALL_LEVELS_OPEN || t <= progress.unlocked || t === FREE_TIER;
    const count = (byTier[t] || []).length;
    const correct = progress.correctByTier[t] || 0;
    const mastered = correct >= UNLOCK_THRESHOLD;
    const best = progress.bestScore[t] || 0;
    const btn = document.createElement("button");
    btn.className = "tier-card" + (unlocked ? "" : " locked");
    btn.disabled = !unlocked;
    btn.innerHTML = `
      <div class="tier-num">Level ${t}</div>
      <div class="tier-name">${TIER_NAMES[t]}</div>
      <div class="tier-meta">${unlocked ? `${count} keys &middot; best score ${best}${mastered ? " &middot; &#10003; mastered" : ` &middot; ${correct}/${UNLOCK_THRESHOLD} to master`}` : `locked --- get ${UNLOCK_THRESHOLD} correct on Level ${t - 1} to unlock`}</div>
      <div class="tier-progress"><div class="tier-progress-bar" style="width:${Math.min(100, (correct / UNLOCK_THRESHOLD) * 100)}%"></div></div>
    `;
    if (unlocked) btn.addEventListener("click", () => startSession(t));
    list.appendChild(btn);
  }
}

function startSession(tier) {
  state = {
    tier,
    pool: byTier[tier].slice(),
    recent: [],
    score: 0,
    streak: 0,
    lives: LIVES_START,
    correctThisSession: 0,
    roundsThisSession: 0,
    hintShown: false,
    chordIndex: 0,
    chords: [],
    current: null,
    timerId: null,
    timeLeft: ROUND_SECONDS,
  };
  $("#screen-home").classList.add("hidden");
  $("#screen-over").classList.add("hidden");
  $("#screen-game").classList.remove("hidden");
  $("#game-tier-label").textContent = `Level ${tier}: ${TIER_NAMES[tier]}`;
  nextRound();
}

function pickEntry() {
  const pool = state.pool;
  // avoid repeating any of the last few within a small pool
  const avoidN = Math.min(5, Math.max(0, pool.length - 3));
  let entry;
  let tries = 0;
  do {
    entry = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  } while (state.recent.slice(-avoidN).includes(entry) && tries < 20);
  state.recent.push(entry);
  return entry;
}

function nextRound() {
  if (state.timerId) clearInterval(state.timerId);
  const entry = pickEntry();
  state.current = entry;
  state.chords = parseSequence(entry.key);
  state.chordIndex = 0;
  state.hintShown = false;
  state.timeLeft = ROUND_SECONDS;
  state.roundsThisSession++;

  $("#prompt-category").textContent = entry.category;
  $("#prompt-desc").textContent = entry.description;
  $("#prompt-command").textContent = entry.command;
  $("#hint-box").classList.add("hidden");
  $("#hint-box").innerHTML = "";
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";
  renderChordProgress();
  renderHud();
  renderKeyboardHighlight();
  renderExplain(entry);
  demoReset();

  state.timerId = setInterval(tick, 1000);
}

function tick() {
  state.timeLeft--;
  $("#timer-bar").style.width = `${(state.timeLeft / ROUND_SECONDS) * 100}%`;
  if (state.timeLeft <= 0) {
    clearInterval(state.timerId);
    roundResult(false, "Out of time!");
  }
}

function renderHud() {
  $("#hud-score").textContent = state.score;
  $("#hud-streak").textContent = state.streak;
  $("#hud-lives").textContent = "\u2665".repeat(state.lives) + "\u2661".repeat(LIVES_START - state.lives);
  $("#timer-bar").style.width = "100%";
}

function renderChordProgress() {
  const box = $("#chord-progress");
  box.innerHTML = "";
  state.chords.forEach((c, i) => {
    const span = document.createElement("span");
    span.className = "chord-token" + (i < state.chordIndex ? " done" : i === state.chordIndex ? " active" : "");
    span.textContent = state.current.key.split(/\s+/)[i];
    box.appendChild(span);
  });
}

function showHint() {
  if (state.hintShown) return;
  state.hintShown = true;
  const lines = sequenceGuidance(state.current.key);
  $("#hint-box").innerHTML = "<strong>How to press it:</strong><ul>" +
    lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("") + "</ul>";
  $("#hint-box").classList.remove("hidden");
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function renderKeyboardHighlight() {
  document.querySelectorAll(".kb-key").forEach((el) => el.classList.remove("hl"));
  const c = state.chords[state.chordIndex];
  if (!c) return;
  if (c.ctrl) {
    const side = c.hand === "L" ? "right" : "left"; // opposite-hand Control, per TYPING.md
    document.querySelectorAll(`.kb-key[data-key="ctrl-${side}"]`).forEach((el) => el.classList.add("hl"));
  }
  if (c.meta) document.querySelectorAll('.kb-key[data-key="alt-left"]').forEach((el) => el.classList.add("hl"));
  if (c.shift) {
    const side = c.hand === "L" ? "right" : "left"; // opposite-hand Shift, same rule as Ctrl
    document.querySelectorAll(`.kb-key[data-key="shift-${side}"]`).forEach((el) => el.classList.add("hl"));
  }
  const keyEl = document.querySelector(`.kb-key[data-browserkey="${cssEscape(c.baseKey || c.browserKey)}"]`);
  if (keyEl) keyEl.classList.add("hl");
}
function cssEscape(s) { return s.replace(/["\\]/g, "\\$&"); }

function onKeydown(e) {
  if (!state || !state.current) return;
  if (e.key === "Tab" || e.key === "F6") return; // allow basic page navigation
  // A modifier going down on its own (Ctrl, Alt, Shift...) is not a keypress yet ---
  // the real key follows. Without this, every Ctrl/Alt chord counted as a wrong key
  // first, resetting the streak and popping the hint on a correct answer.
  if (["Control", "Alt", "Shift", "Meta", "AltGraph", "CapsLock", "OS"].includes(e.key)) return;
  e.preventDefault();
  const expected = state.chords[state.chordIndex];
  if (chordMatches(e, expected)) {
    state.chordIndex++;
    if (state.chordIndex >= state.chords.length) {
      clearInterval(state.timerId);
      demoApply(state.current.command, expected);
      roundResult(true);
    } else {
      renderChordProgress();
      renderKeyboardHighlight();
    }
  } else {
    // wrong key: does not end the round or cost a life --- only a timeout does
    // that --- but it must still say SOMETHING, confirmed missing by actually
    // testing a real wrong keypress (the UI showed no feedback at all otherwise).
    flashWrong();
    state.streak = 0;
    $("#feedback").textContent = "Not quite — try again.";
    $("#feedback").className = "feedback warn";
    renderHud();
    showHint();
  }
}

function flashWrong() {
  const card = $("#prompt-card");
  card.classList.remove("shake");
  // restart the animation even if it is already mid-flight
  void card.offsetWidth;
  card.classList.add("shake");
}

function roundResult(correct, reasonOverride) {
  if (correct) {
    const timeBonus = Math.max(0, state.timeLeft) * 2;
    const streakBonus = state.streak * 5;
    const hintPenalty = state.hintShown ? 10 : 0;
    const points = Math.max(5, 20 + timeBonus + streakBonus - hintPenalty);
    state.score += points;
    state.streak++;
    state.correctThisSession++;
    progress.correctByTier[state.tier] = (progress.correctByTier[state.tier] || 0) + 1;
    maybeUnlockNext();
    save(progress);
    $("#feedback").textContent = `Correct! +${points}`;
    $("#feedback").className = "feedback good";
    renderHud();
    setTimeout(nextRound, 1100); // a little longer so the demo buffer change can be seen
  } else {
    state.lives--;
    state.streak = 0;
    $("#feedback").textContent = reasonOverride || "Wrong key.";
    $("#feedback").className = "feedback bad";
    showHint();
    renderHud();
    if (state.lives <= 0) {
      setTimeout(endSession, 900);
    } else {
      setTimeout(nextRound, 1400);
    }
  }
}

function maybeUnlockNext() {
  const next = state.tier + 1;
  if (byTier[next] && next !== FREE_TIER && progress.unlocked < next &&
      (progress.correctByTier[state.tier] || 0) >= UNLOCK_THRESHOLD) {
    progress.unlocked = next;
  }
}

function endSession() {
  if (state.timerId) clearInterval(state.timerId);
  progress.bestScore[state.tier] = Math.max(progress.bestScore[state.tier] || 0, state.score);
  save(progress);
  $("#screen-game").classList.add("hidden");
  $("#screen-over").classList.remove("hidden");
  $("#over-score").textContent = state.score;
  $("#over-rounds").textContent = `${state.correctThisSession} / ${state.roundsThisSession}`;
  $("#over-best").textContent = progress.bestScore[state.tier];
  const correct = progress.correctByTier[state.tier] || 0;
  $("#over-unlock").textContent = correct >= UNLOCK_THRESHOLD
    ? `Level ${state.tier} mastered --- every level is open, pick any one from the menu.`
    : `${UNLOCK_THRESHOLD - correct} more correct on this level to mark it mastered. Every level is open any time.`;
  $("#btn-retry").onclick = () => startSession(state.tier);
}

function init() {
  document.addEventListener("keydown", onKeydown);
  $("#btn-hint").addEventListener("click", showHint);
  $("#btn-quit").addEventListener("click", () => { if (state && state.timerId) clearInterval(state.timerId); renderHome(); });
  $("#btn-home").addEventListener("click", renderHome);
  renderHome();
}

document.addEventListener("DOMContentLoaded", init);
