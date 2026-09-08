# XO Game

A simple black-and-white Tic Tac Toe (XO) game, built with plain HTML, CSS, and JavaScript — no frameworks, no build tools.

**Version: 1.00**

## Status

- [x] HTML structure (3x3 grid, status line, reset button)
- [x] CSS layout (flexbox page centering, grid board, basic cell borders)
- [x] JavaScript game logic (turns, win detection, draw detection, reset)
- [ ] Visual polish (colors, hover states, animations)
- [ ] Score tracking across rounds
- [ ] Sound effects
- [ ] Two game modes (vs friend / vs computer)
- [ ] Mobile responsiveness pass

## Project Structure

```
xo-game/
├── index.html    — page structure/markup
├── style.css     — all visual styling
├── script.js     — game logic and interactivity
└── README.md     — this file
```

## How It Works (Quick Reference)

- `board` — a 9-item array representing the 9 cells (`""`, `"X"`, or `"O"`), indexed 0–8, top-left to bottom-right.
- `currentPlayer` — tracks whose turn it is (`"X"` or `"O"`).
- `gameOver` — boolean flag, stops further clicks once a game ends.
- `winningLines` — the 8 fixed index-triplets that count as a win (3 rows, 3 columns, 2 diagonals).
- Each cell click updates `board`, updates the visible text, checks for a win, checks for a draw, and otherwise flips the turn.

## Running Locally

Open `index.html` directly in a browser, or use the VS Code "Live Server" extension for auto-refresh on save.

## Version History

### v1.00
- Initial playable version.
- Black-and-white styling only, no colors.
- Core game loop complete: click to place, win/draw detection, reset button.

## Planned Next Steps

Notes for future sessions — add to this list as ideas come up:

-
-
-
