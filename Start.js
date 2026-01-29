// Spieler laden
let players = JSON.parse(localStorage.getItem("players")) || [];

let player1Select;
let player2Select;
let newPlayerName;

document.addEventListener("DOMContentLoaded", () => {
  player1Select = document.getElementById("player1Select");
  player2Select = document.getElementById("player2Select");
  newPlayerName = document.getElementById("newPlayerName");

  document.getElementById("createPlayerBtn").addEventListener("click", createNewPlayer);
  document.getElementById("startGameBtn").addEventListener("click", startGame);

  // NEU: wenn Spieler 1 sich ändert, Spieler 2 automatisch setzen
  player1Select.addEventListener("change", autoSelectPlayer2);

  updatePlayerSelects();
});

function updatePlayerSelects() {
  player1Select.innerHTML = "";
  player2Select.innerHTML = "";

  players.forEach((player, index) => {
    [player1Select, player2Select].forEach(select => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = player;
      select.appendChild(option);
    });
  });

  // optional: direkt beim Laden automatisch setzen
  autoSelectPlayer2();
}

function createNewPlayer() {
  const name = newPlayerName.value.trim();

  if (!name) {
    alert("Bitte gib einen Spielernamen ein.");
    return;
  }

  if (players.includes(name)) {
    alert("Diesen Spieler gibt es bereits.");
    return;
  }

  players.push(name);
  localStorage.setItem("players", JSON.stringify(players));

  newPlayerName.value = "";
  updatePlayerSelects();
}

function startGame() {
  const p1Index = Number(player1Select.value);
  const p2Index = Number(player2Select.value);

  if (isNaN(p1Index) || isNaN(p2Index)) {
    alert("Bitte wähle beide Spieler aus.");
    return;
  }

  if (p1Index === p2Index) {
    alert("Ein Spieler kann nicht gegen sich selbst spielen.");
    return;
  }

  localStorage.setItem("player1Name", players[p1Index]);
  localStorage.setItem("player2Name", players[p2Index]);

  const gameMode = document.getElementById("gameModeSelect").value;

  if (gameMode === "501") {
    window.location.href = "501.html";
  } else if (gameMode === "Cricket") {
    window.location.href = "cricket.html";
  }
}

function autoSelectPlayer2() {
  const p1Index = Number(player1Select.value);

  if (isNaN(p1Index) || players.length < 2) return;

  player2Select.value = (p1Index + 1) % players.length;
}
