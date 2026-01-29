const CRICKET_NUMBERS = [15, 16, 17, 18, 19, 20, 25];

let p1 = null;
let p2 = null;
let activePlayer = 1;
let roundNumber = 1;

let dartMaskState = {
  1: { mult: "S", num: null },
  2: { mult: "S", num: null },
  3: { mult: "S", num: null }
};

// Für Undo
const historyStack = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded läuft");

  const p1Name = localStorage.getItem("player1Name") || "Player 1";
  const p2Name = localStorage.getItem("player2Name") || "Player 2";

  p1 = createPlayer(p1Name);
  p2 = createPlayer(p2Name);

  updateUI();
  renderMarks();
  resetDartMask();

  const throwInput = document.getElementById("throwInput");

  // Tastatur-Eingabe (nur wenn Feld existiert)
  if (throwInput) {
    throwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const raw = throwInput.value.trim().toUpperCase();
        if (!raw) return;
        handleThrowInput(raw);
        throwInput.value = "";
      }
    });
  }

  // 3-Dart-Maske initialisieren
  document.querySelectorAll(".dart-slot").forEach(slot => {
    const dartIndex = Number(slot.dataset.dart);
    const multButtons = slot.querySelectorAll(".dart-mult");
    const numButtons = slot.querySelectorAll(".dart-num");
    const display = slot.querySelector(".dart-display");

    // MULTIPLIER BUTTONS
    multButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        dartMaskState[dartIndex].mult = btn.dataset.mult;

        multButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        updateDartDisplay(dartIndex, display);
        updateDartSlotHighlight(slot, dartIndex);
      });
    });

    // NUMBER BUTTONS
    numButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        dartMaskState[dartIndex].num = Number(btn.dataset.num);

        numButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        updateDartDisplay(dartIndex, display);
        updateDartSlotHighlight(slot, dartIndex);
      });
    });

    updateDartDisplay(dartIndex, display);
  });

  // Wurf aus 3 Darts übernehmen
  const submitMaskBtn = document.getElementById("submitMaskBtn");
  if (submitMaskBtn) {
    submitMaskBtn.addEventListener("click", () => {
      const tokens = [];

      for (let i = 1; i <= 3; i++) {
        const { mult, num } = dartMaskState[i];
        if (!num) continue;
        const prefix = mult === "S" ? "" : mult;
        tokens.push(prefix + String(num));
      }

      if (tokens.length === 0) return;

      const raw = tokens.join(" ");
      handleThrowInput(raw);
      resetDartMask();
    });
  }

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetGame);

  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) undoBtn.addEventListener("click", undoLast);
});

function createPlayer(name) {
  return {
    name,
    score: 0,
    marks: {
      15: 0,
      16: 0,
      17: 0,
      18: 0,
      19: 0,
      20: 0,
      25: 0
    }
  };
}

function cloneState() {
  return {
    p1: { name: p1.name, score: p1.score, marks: { ...p1.marks } },
    p2: { name: p2.name, score: p2.score, marks: { ...p2.marks } },
    activePlayer,
    roundNumber,
    historyHTML: document.getElementById("historyList").innerHTML
  };
}

function restoreState(state) {
  p1.name = state.p1.name;
  p1.score = state.p1.score;
  p1.marks = { ...state.p1.marks };

  p2.name = state.p2.name;
  p2.score = state.p2.score;
  p2.marks = { ...state.p2.marks };

  activePlayer = state.activePlayer;
  roundNumber = state.roundNumber;

  document.getElementById("historyList").innerHTML = state.historyHTML;

  renderMarks();
  updateUI();
}

function updateUI() {
  document.getElementById("p1NameCard").textContent = p1.name;
  document.getElementById("p2NameCard").textContent = p2.name;

  document.getElementById("p1Score").textContent = p1.score;
  document.getElementById("p2Score").textContent = p2.score;

  document.getElementById("activePlayerName").textContent =
    activePlayer === 1 ? p1.name : p2.name;

  document.getElementById("roundNumber").textContent = roundNumber;

  document.querySelectorAll(".player-card").forEach(card =>
    card.classList.remove("active")
  );

  const activeCard = activePlayer === 1
    ? document.querySelector(".player-card:nth-of-type(1)")
    : document.querySelector(".player-card:nth-of-type(2)");

  if (activeCard) activeCard.classList.add("active");
}

function renderMarks() {
  const p1Marks = document.getElementById("p1Marks");
  const p2Marks = document.getElementById("p2Marks");

  p1Marks.innerHTML = "";
  p2Marks.innerHTML = "";

  CRICKET_NUMBERS.forEach(num => {
    p1Marks.innerHTML += `
      <div class="mark-box">
        <span class="me-1">${num}</span>
        <span>${renderSymbol(p1.marks[num])}</span>
      </div>`;

    p2Marks.innerHTML += `
      <div class="mark-box">
        <span class="me-1">${num}</span>
        <span>${renderSymbol(p2.marks[num])}</span>
      </div>`;
  });
}

function renderSymbol(count) {
  if (count <= 0) return "•";
  if (count === 1) return "X";
  if (count === 2) return "X X";
  return "✕";
}

function handleThrowInput(raw) {
  historyStack.push(cloneState());

  const tokens = raw.trim().split(/\s+/);
  const hits = [];

  for (const token of tokens) {
    const parsed = parseToken(token);
    if (!parsed) {
      alert("Ungültiger Wurf: " + token);
      historyStack.pop();
      return;
    }
    hits.push(parsed);
  }

  hits.forEach((hit, index) => {
    const isLast = index === hits.length - 1;
    for (let i = 0; i < hit.multiplier; i++) {
      handleSingleHit(hit.value, isLast && i === hit.multiplier - 1);
    }
  });
}

function parseToken(token) {
  token = token.toUpperCase();

  let multiplier = 1;
  if (token.startsWith("D")) { multiplier = 2; token = token.slice(1); }
  if (token.startsWith("T")) { multiplier = 3; token = token.slice(1); }

  const value = Number(token);
  if (!CRICKET_NUMBERS.includes(value)) return null;

  return { value, multiplier };
}

function handleSingleHit(value, logToHistory) {
  const player = activePlayer === 1 ? p1 : p2;
  const opponent = activePlayer === 1 ? p2 : p1;

  const before = player.marks[value];
  let scored = 0;

  if (before < 3) {
    player.marks[value]++;
  } else {
    if (opponent.marks[value] < 3) {
      player.score += value;
      scored = value;
      animateScore(activePlayer);
    }
  }

  if (logToHistory) {
    addHistoryEntry(player.name, value, scored);
  }

  renderMarks();
  updateUI();
  checkWin();

  if (logToHistory) {
    activePlayer = activePlayer === 1 ? 2 : 1;

    if (activePlayer === 1) {
      roundNumber++;
    }
    updateUI();
  }
}

function addHistoryEntry(playerName, value, scored) {
  const list = document.getElementById("historyList");
  const li = document.createElement("li");
  li.textContent = `${playerName} wirft ${value}${scored ? ` (+${scored})` : ""}`;
  list.prepend(li);
}

function animateScore(playerNumber) {
  const el = playerNumber === 1
    ? document.getElementById("p1Score")
    : document.getElementById("p2Score");

  el.classList.remove("score-animate");
  void el.offsetWidth;
  el.classList.add("score-animate");
}

function checkWin() {
  const p1Closed = CRICKET_NUMBERS.every(num => p1.marks[num] >= 3);
  const p2Closed = CRICKET_NUMBERS.every(num => p2.marks[num] >= 3);

  if (p1Closed && p1.score >= p2.score) {
    alert(p1.name + " gewinnt Cricket!");
    resetGame();
    return;
  }

  if (p2Closed && p2.score >= p1.score) {
    alert(p2.name + " gewinnt Cricket!");
    resetGame();
    return;
  }
}

function resetGame() {
  p1 = createPlayer(p1.name);
  p2 = createPlayer(p2.name);
  activePlayer = 1;
  roundNumber = 1;
  historyStack.length = 0;
  document.getElementById("historyList").innerHTML = "";
  renderMarks();
  updateUI();
  resetDartMask();
}

function undoLast() {
  if (historyStack.length === 0) return;
  const prev = historyStack.pop();
  restoreState(prev);
}

function updateDartDisplay(dartIndex, displayEl) {
  const { mult, num } = dartMaskState[dartIndex];
  if (!num) {
    displayEl.textContent = `Dart ${dartIndex}: –`;
    return;
  }
  const prefix = mult === "S" ? "" : mult;
  displayEl.textContent = `Dart ${dartIndex}: ${prefix}${num}`;
}

function resetDartMask() {
  dartMaskState = {
    1: { mult: "S", num: null },
    2: { mult: "S", num: null },
    3: { mult: "S", num: null }
  };

  document.querySelectorAll(".dart-slot").forEach(slot => {
    const dartIndex = Number(slot.dataset.dart);
    const display = slot.querySelector(".dart-display");

    slot.querySelectorAll(".dart-mult").forEach(b => b.classList.remove("active"));
    slot.querySelectorAll(".dart-num").forEach(b => b.classList.remove("active"));
    slot.classList.remove("filled");

    updateDartDisplay(dartIndex, display);
  });
}

function updateDartSlotHighlight(slot, dartIndex) {
  const { num } = dartMaskState[dartIndex];
  if (num) {
    slot.classList.add("filled");
  } else {
    slot.classList.remove("filled");
  }
}
