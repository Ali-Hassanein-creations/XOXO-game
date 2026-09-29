const board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const scoreXText = document.getElementById("score-x");
const scoreOText = document.getElementById("score-o");

const nameXText = document.getElementById("name-x");
const nameOText = document.getElementById("name-o");
const userList = document.getElementById("user-list");

const users = [
  { name: "NeonViper", side: "X" },
  { name: "ByteKnight", side: "X" },
  { name: "GlitchQueen", side: "X" },
  { name: "CyberFox", side: "X" },
  { name: "ZeroCool", side: "X" },
  { name: "PixelRonin", side: "O" },
  { name: "ChromeWitch", side: "O" },
  { name: "NullRider", side: "O" },
  { name: "VoltHex", side: "O" },
  { name: "SynthGhost", side: "O" }
];

let wins = {};
try {
  wins = JSON.parse(localStorage.getItem("xoxo-wins")) || {};
} catch (e) {}

const players = { X: users[0], O: users[5] };

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (gameOver || board[index] !== "") {
    return;
  }

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer.toLowerCase());

  const winningLine = getWinningLine();
  if (winningLine) {
    winningLine.forEach(i => cells[i].classList.add("win"));
    gameOver = true;
    const winner = players[currentPlayer].name;
    wins[winner] = (wins[winner] || 0) + 1;
    try {
      localStorage.setItem("xoxo-wins", JSON.stringify(wins));
    } catch (e) {}
    statusText.textContent = winner + " wins!";
    updateScoreboard();
    return;
  }

  if (checkDraw()) {
    statusText.textContent = "It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = currentPlayer + "'s turn";
}

function getWinningLine() {
  return winningLines.find(line => {
    const [a, b, c] = line;
    return board[a] !== "" && board[a] === board[b] && board[b] === board[c];
  });
}

function checkDraw() {
  return board.every(cell => cell !== "");
}

function updateScoreboard() {
  nameXText.textContent = players.X.name;
  nameOText.textContent = players.O.name;
  scoreXText.textContent = wins[players.X.name] || 0;
  scoreOText.textContent = wins[players.O.name] || 0;
  renderUsers();
}

function renderUsers() {
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "user user-" + user.side.toLowerCase();
    if (players[user.side] === user) button.classList.add("active");
    button.innerHTML = `<span></span><b></b>`;
    button.querySelector("span").textContent = user.side + " · " + user.name;
    button.querySelector("b").textContent = wins[user.name] || 0;
    button.addEventListener("click", () => {
      players[user.side] = user;
      updateScoreboard();
    });
    li.appendChild(button);
    userList.appendChild(li);
  });
}

function resetGame() {
  for (let i = 0; i < board.length; i++) {
    board[i] = "";
  }
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "win");
  });
  currentPlayer = "X";
  gameOver = false;
  statusText.textContent = "X's turn";
}

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);
updateScoreboard();
