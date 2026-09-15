const board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const scoreXText = document.getElementById("score-x");
const scoreOText = document.getElementById("score-o");

const scores = { X: 0, O: 0 };

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
    statusText.textContent = currentPlayer + " wins!";
    gameOver = true;
    scores[currentPlayer]++;
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
  scoreXText.textContent = scores.X;
  scoreOText.textContent = scores.O;
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
