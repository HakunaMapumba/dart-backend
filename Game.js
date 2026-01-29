
console.log("game.js loaded");


const START_SCORE = 501;
let p1 = null;
let p2 = null;
let activePlayer = 1;
let rowCount = 0;
let undoStack = [];



document.addEventListener("DOMContentLoaded", () => {
  const dartBody = document.getElementById("dartBody");
  if (!dartBody) return;



  const p1Name = localStorage.getItem("player1Name") 
  const p2Name = localStorage.getItem("player2Name") 

  p1 = createPlayer(p1Name);
  p2 = createPlayer(p2Name);

  resetGame();
  enableTableInput();
});

function createPlayer(name) {
  return {
    name,
    score: START_SCORE,
    legs: 0,
    sets: 0,
    hits100: 0,
    hits140: 0,
    hits180: 0,
    highOut: 0,
    average: 0,
    totalPoints: 0,
    totalDarts: 0
  };
}

function resetGame() {
  document.getElementById("dartBody").innerHTML = "";
  createStartRow();
  updateUI();
  focusFirstPlayer();
}

function createStartRow() {
  rowCount = 0;
  const body = document.getElementById("dartBody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td></td>
    <td>${START_SCORE}</td>
    <td></td>
    <td>${START_SCORE}</td>
    <td></td>
  `;
  body.appendChild(row);
  addNewRow();
}

function addNewRow() {
  rowCount++;
  const body = document.getElementById("dartBody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td contenteditable="true" class="p1score"></td>
    <td></td>
    <td>${rowCount * 3}</td>
    <td></td>
    <td contenteditable="true" class="p2score"></td>
  `;
  body.appendChild(row);
}

function focusFirstPlayer() {
  const cell = document.querySelector(".p1score");
  if (cell) cell.focus();
}

function updateUI() {
  const p1Score = document.getElementById("p1Score");
  const p2Score = document.getElementById("p2Score");
  const bigP1Score = document.getElementById("bigP1Score");
  const bigP2Score = document.getElementById("bigP2Score");

  if (p1Score) p1Score.textContent = p1.score;
  if (p2Score) p2Score.textContent = p2.score;

  if (bigP1Score) bigP1Score.textContent = p1.score;
  if (bigP2Score) bigP2Score.textContent = p2.score;

  // Legs & Sets
  const p1Legs = document.getElementById("p1Legs");
  const p2Legs = document.getElementById("p2Legs");
  const p1Sets = document.getElementById("p1Sets");
  const p2Sets = document.getElementById("p2Sets");

  if (p1Legs) p1Legs.textContent = p1.legs;
  if (p2Legs) p2Legs.textContent = p2.legs;
  if (p1Sets) p1Sets.textContent = p1.sets;
  if (p2Sets) p2Sets.textContent = p2.sets;

  // Stats
  const p1_100 = document.getElementById("p1_100");
  const p1_140 = document.getElementById("p1_140");
  const p1_180 = document.getElementById("p1_180");
  const p1HighOut = document.getElementById("p1HighOut");
  const p1Avg = document.getElementById("p1Avg");

  const p2_100 = document.getElementById("p2_100");
  const p2_140 = document.getElementById("p2_140");
  const p2_180 = document.getElementById("p2_180");
  const p2HighOut = document.getElementById("p2HighOut");
  const p2Avg = document.getElementById("p2Avg");

  if (p1_100) p1_100.textContent = p1.hits100;
  if (p1_140) p1_140.textContent = p1.hits140;
  if (p1_180) p1_180.textContent = p1.hits180;
  if (p1HighOut) p1HighOut.textContent = p1.highOut;
  if (p1Avg) p1Avg.textContent = isNaN(p1.average) ? "0.00" : p1.average.toFixed(2);

  if (p2_100) p2_100.textContent = p2.hits100;
  if (p2_140) p2_140.textContent = p2.hits140;
  if (p2_180) p2_180.textContent = p2.hits180;
  if (p2HighOut) p2HighOut.textContent = p2.highOut;
  if (p2Avg) p2Avg.textContent = isNaN(p2.average) ? "0.00" : p2.average.toFixed(2);

  // Namen setzen
  const p1NameCard = document.getElementById("p1NameCard");
  const p1NameBig  = document.getElementById("p1NameBig");
  const p2NameCard = document.getElementById("p2NameCard");
  const p2NameBig  = document.getElementById("p2NameBig");

  if (p1NameCard) p1NameCard.textContent = p1.name;
  if (p1NameBig)  p1NameBig.textContent  = p1.name;
  if (p2NameCard) p2NameCard.textContent = p2.name;
  if (p2NameBig)  p2NameBig.textContent  = p2.name;
}


function enableTableInput() {
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;

    const cell = event.target;

    if (!cell.classList.contains("p1score") &&
        !cell.classList.contains("p2score")) {
      return;
    }

    event.preventDefault();

    if (cell.classList.contains("p1score")) {
      processScore(1, cell);
    } else {
      processScore(2, cell);
    }
  });
}

function processScore(playerNumber, cell) {
  let raw = cell.textContent.replace(/\u00A0/g, "").trim();
  let score = parseInt(raw);

  if (isNaN(score)) {
    cell.innerHTML = "&nbsp;";
    return;
  }

  if (score > 180) {
    cell.textContent = score;
    return;
  }

  let player = playerNumber === 1 ? p1 : p2;
  let newScore = player.score - score;
  const row = cell.parentElement;

  if (newScore < 0) {
    cell.textContent = "0";
    updateRest(playerNumber, player.score, row);

    if (playerNumber === 1) {
      activePlayer = 2;
    } else {
      addNewRow();
      activePlayer = 1;
    }

    setFocusToActivePlayer();
    return;
  }

  if (score >= 100 && score < 140) player.hits100++;
  if (score >= 140 && score < 180) player.hits140++;
  if (score === 180) player.hits180++;

  player.totalPoints += score;
  player.totalDarts += 3;
  player.average = player.totalPoints / (player.totalDarts / 3);

  if (newScore === 0 && score > player.highOut) {
    player.highOut = score;
  }

  player.score = newScore;
  updateUI();
  updateRest(playerNumber, newScore, row);

  if (player.score === 0) {
    winLeg(player);
    return;
  }

  if (playerNumber === 2) {
    addNewRow();
  }

  activePlayer = playerNumber === 1 ? 2 : 1;
  setFocusToActivePlayer();
}

function updateRest(playerNumber, rest, row) {
  if (!row) return;

  if (playerNumber === 1) row.children[1].textContent = rest;
  else row.children[3].textContent = rest;
}

function setFocusToActivePlayer() {
  const rows = document.querySelectorAll("#dartBody tr");
  const lastRow = rows[rows.length - 1];
  if (!lastRow) return;

  const cell = activePlayer === 1
    ? lastRow.querySelector(".p1score")
    : lastRow.querySelector(".p2score");

  if (cell) {
    cell.focus();
  }
}

function winLeg(player) {
  player.legs++;
  alert(player.name + " gewinnt das Leg!");

  activePlayer = activePlayer === 1 ? 2 : 1;

  if (player.legs >= 2) {
    winSet(player);
  } else {
    resetLeg();
  }
}

function winSet(player) {
  player.sets++;
  p1.legs = 0;
  p2.legs = 0;

  if (player.sets >= 2) {
    alert(player.name + " gewinnt das Match!");
    resetGame();
  } else {
    resetLeg();
  }
}

function resetLeg() {
  p1.score = START_SCORE;
  p2.score = START_SCORE;

  document.getElementById("dartBody").innerHTML = "";
  createStartRow();
  updateUI();
  setFocusToActivePlayer();
}
