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

const authDialog = document.getElementById("auth");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const usernameInput = document.getElementById("auth-username");
const passwordInput = document.getElementById("auth-password");
const confirmRow = document.getElementById("auth-confirm-row");
const confirmInput = document.getElementById("auth-confirm");
const authError = document.getElementById("auth-error");
const authSubmit = document.getElementById("auth-submit");
const authSwitch = document.getElementById("auth-switch");
const authCancel = document.getElementById("auth-cancel");

const ACCOUNTS_KEY = "xoxo-accounts";
const SESSION_KEY = "xoxo-session";

let authSide = "X";
let registering = false;

// ponytail: accounts live in this browser and can be edited in devtools. Move them to a server before online play.
function loadAccounts() {
  return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(accounts, username) {
  const key = username.toLowerCase();
  return accounts.find(account => account.name.toLowerCase() === key);
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 600000 },
    key,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

const guestNames = { X: "Guest 1", O: "Guest 2" };
const displayName = side => players[side] || guestNames[side];

const players = { X: null, O: null };
try {
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {};
  const accounts = loadAccounts();
  players.X = findAccount(accounts, session.X || "")?.name || null;
  players.O = findAccount(accounts, session.O || "")?.name || null;
} catch (e) {}

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
    const winner = players[currentPlayer];
    if (winner) {
      try {
        const accounts = loadAccounts();
        const account = findAccount(accounts, winner);
        account.wins++;
        const loser = players[currentPlayer === "X" ? "O" : "X"];
        if (loser) (account.beat ||= []).push(loser);
        saveAccounts(accounts);
      } catch (e) {}
    }
    statusText.textContent = displayName(currentPlayer) + " wins!";
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
  let accounts = [];
  try {
    accounts = loadAccounts();
  } catch (e) {}
  const scoreOf = side => {
    if (!players[side]) return "–";
    const account = findAccount(accounts, players[side]);
    const opponent = players[side === "X" ? "O" : "X"];
    if (!opponent) return account?.wins || 0;
    return (account?.beat || []).filter(name => name === opponent).length;
  };
  nameXText.textContent = displayName("X");
  nameOText.textContent = displayName("O");
  scoreXText.textContent = scoreOf("X");
  scoreOText.textContent = scoreOf("O");
  renderUsers(accounts);
}

function renderUsers(accounts) {
  userList.innerHTML = "";
  ["X", "O"].forEach(side => {
    const name = players[side];
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "user user-" + side.toLowerCase();
    if (name) button.classList.add("active");
    button.innerHTML = name ? `<span></span><b></b><small></small>` : `<span></span><b></b>`;
    button.querySelector("span").textContent = side + " · " + displayName(side);
    if (name) button.querySelector("small").textContent = "Wins = " + (findAccount(accounts, name)?.wins || 0);
    button.querySelector("b").textContent = name ? "Log out" : "Log in";
    button.addEventListener("click", () => {
      if (name) setPlayer(side, null);
      else openAuth(side);
    });
    li.appendChild(button);
    userList.appendChild(li);
  });
}

function setPlayer(side, name) {
  players[side] = name;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(players));
  } catch (e) {}
  resetGame();
  updateScoreboard();
}

function openAuth(side) {
  authSide = side;
  authForm.reset();
  setAuthMode(false);
  authDialog.showModal();
}

function setAuthMode(isRegistering) {
  registering = isRegistering;
  const action = registering ? "Create account" : "Log in";
  authTitle.textContent = action + " · Player " + authSide;
  authSubmit.textContent = action;
  authSwitch.textContent = registering ? "Already have an account? Log in" : "New here? Create an account";
  confirmRow.hidden = !registering;
  confirmInput.required = registering;
  confirmInput.value = "";
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  clearAuthError();
}

function clearAuthError() {
  authError.textContent = "";
  authForm.querySelectorAll("[aria-invalid]").forEach(input => input.removeAttribute("aria-invalid"));
}

function showAuthError(message, input) {
  clearAuthError();
  authError.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.focus();
  input.select();
}

async function register(username, password) {
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  if (!authDialog.open) return null;

  // Re-read after the slow hash so a signup from another tab still counts as a duplicate.
  const accounts = loadAccounts();
  const taken = findAccount(accounts, username);
  if (taken) {
    const caseNote = taken.name === username ? "" : " Capital letters don't make a username different.";
    showAuthError(`The username "${taken.name}" is already taken.${caseNote} Choose another, or log in if it's yours.`, usernameInput);
    return null;
  }

  accounts.push({ name: username, salt, hash, wins: 0 });
  saveAccounts(accounts);
  return username;
}

async function logIn(username, password) {
  const account = findAccount(loadAccounts(), username);
  const hash = account && await hashPassword(password, account.salt);
  if (!authDialog.open) return null;
  if (!account || hash !== account.hash) {
    showAuthError("Wrong username or password.", passwordInput);
    return null;
  }
  return account.name;
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;
  const side = authSide;
  const other = side === "X" ? "O" : "X";

  if (registering && password !== confirmInput.value) {
    showAuthError("Passwords don't match.", confirmInput);
    return;
  }
  if (!registering && players[other]?.toLowerCase() === username.toLowerCase()) {
    showAuthError(`${players[other]} is already playing as ${other}. Each player needs their own account.`, usernameInput);
    return;
  }

  authSubmit.disabled = authSwitch.disabled = true;
  try {
    const name = await (registering ? register(username, password) : logIn(username, password));
    if (name) {
      authDialog.close();
      setPlayer(side, name);
    }
  } catch (err) {
    const message = crypto.subtle
      ? "Couldn't read or save accounts. Check that this browser allows site storage."
      : "Accounts need a secure page. Open the game from a local file, localhost, or https.";
    showAuthError(message, usernameInput);
  } finally {
    authSubmit.disabled = authSwitch.disabled = false;
  }
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
authForm.addEventListener("submit", handleAuthSubmit);
authForm.addEventListener("input", clearAuthError);
authSwitch.addEventListener("click", () => setAuthMode(!registering));
authCancel.addEventListener("click", () => authDialog.close());
resetGame();
updateScoreboard();
