// =========================================================
// js/ia-engine.js - Algoritmo de decisión para Ta-Te-Ti
// =========================================================

function getAIMove(board, difficulty = "medium") {
  const emptyIndices = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
  if (emptyIndices.length === 0) return null;

  // Fácil: Movimiento 100% Aleatorio
  if (difficulty === "easy") {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Medio: Intenta ganar o bloquear al rival; si no, aleatorio
  if (difficulty === "medium") {
    const winMove = findWinningMove(board, "O");
    if (winMove !== null) return winMove;

    const blockMove = findWinningMove(board, "X");
    if (blockMove !== null) return blockMove;

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Imbatible: Algoritmo Minimax
  if (difficulty === "hard") {
    return minimax(board, "O").index;
  }

  return emptyIndices[0];
}

function findWinningMove(board, player) {
  const winConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    const line = [board[a], board[b], board[c]];
    if (line.filter(val => val === player).length === 2 && line.includes("")) {
      if (board[a] === "") return a;
      if (board[b] === "") return b;
      if (board[c] === "") return c;
    }
  }
  return null;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

  if (checkWinCondition(newBoard, "X")) return { score: -10 };
  if (checkWinCondition(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === "O") {
      const result = minimax(newBoard, "X");
      move.score = result.score;
    } else {
      const result = minimax(newBoard, "O");
      move.score = result.score;
    }

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function checkWinCondition(board, player) {
  const winConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winConditions.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
}
