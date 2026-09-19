// =========================================================
// js/checkers-logic.js - Lógica e IA para Damas Retro
// =========================================================

let board = [];
let selectedPiece = null;
let turn = 'R';        // 'R' = Rojas (Jugador), 'B' = Negras (IA)
let aiColor = 'B';     // Color asignado a AnubiBot
let userColor = 'R';   // Color asignado al Jugador humano
let isGameActive = true;

function initCheckers() {
    board = [
        ['','B','','B','','B','','B'],
        ['B','','B','','B','','B',''],
        ['','B','','B','','B','','B'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['R','','R','','R','','R',''],
        ['','R','','R','','R','','R'],
        ['R','','R','','R','','R','']
    ];
    selectedPiece = null;
    isGameActive = true;

    // El jugador que empieza según los colores asignados
    turn = 'R'; 
    updateCheckersStatus();
    renderBoard();

    // Si le toca empezar a la IA al reiniciar/iniciar
    checkAITurn();
}

function updateCheckersStatus() {
    const statusElem = document.getElementById('game-status');
    if (!statusElem) return;

    if (!isGameActive) return;

    const turnName = (turn === userColor) ? getPlayerName() : "AnubiBot 🤖";
    const colorName = (turn === 'R') ? "Rojas" : "Negras";
    statusElem.innerText = `Turno de: ${turnName} (${colorName})`;
}

function renderBoard() {
    const boardElem = document.getElementById('checkers-board');
    if (!boardElem) return;
    boardElem.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const isDark = (r + c) % 2 === 1;
            square.className = `square ${isDark ? 'dark' : 'light'}`;
            
            if (board[r][c] !== '') {
                const piece = document.createElement('div');
                piece.className = `piece piece-${board[r][c].toLowerCase()}`;
                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                    piece.classList.add('selected');
                }
                square.appendChild(piece);
            }

            square.onclick = () => handleSquareClick(r, c);
            boardElem.appendChild(square);
        }
    }
}

function handleSquareClick(r, c) {
    if (!isGameActive) return;

    // En modo vs IA, bloqueamos clics si es turno de AnubiBot
    const modeElem = document.getElementById('game-mode');
    const isPVE = modeElem && modeElem.value === 'pve';
    if (isPVE && turn === aiColor) return;

    // Seleccionar pieza propia
    if (board[r][c] === turn) {
        selectedPiece = { r, c };
        renderBoard();
        return;
    }

    // Intentar mover pieza seleccionada
    if (selectedPiece && board[r][c] === '') {
        if (executeMove(selectedPiece.r, selectedPiece.c, r, c)) {
            selectedPiece = null;
            switchTurn();
        }
    }
}

function executeMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);

    // Regla de movimiento simple diagonal hacia adelante
    const validRow = (piece === 'R' && rowDiff === -1) || (piece === 'B' && rowDiff === 1);

    if (validRow && colDiff === 1) {
        board[toR][toC] = piece;
        board[fromR][fromC] = '';
        return true;
    }
    return false;
}

function switchTurn() {
    turn = (turn === 'R') ? 'B' : 'R';
    updateCheckersStatus();
    renderBoard();
    checkAITurn();
}

function checkAITurn() {
    const modeElem = document.getElementById('game-mode');
    const isPVE = modeElem && modeElem.value === 'pve';

    if (isPVE && turn === aiColor && isGameActive) {
        setTimeout(makeAIMove, 600);
    }
}

// =========================================================
// Motor de Movimiento IA para Damas
// =========================================================
function makeAIMove() {
    if (!isGameActive || turn !== aiColor) return;

    const validMoves = [];

    // Buscar todas las piezas de la IA y sus movimientos posibles
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === aiColor) {
                const targetRow = (aiColor === 'B') ? r + 1 : r - 1;
                
                // Opción Diagonal Izquierda
                if (targetRow >= 0 && targetRow < 8 && c - 1 >= 0 && board[targetRow][c - 1] === '') {
                    validMoves.push({ fromR: r, fromC: c, toR: targetRow, toC: c - 1 });
                }
                // Opción Diagonal Derecha
                if (targetRow >= 0 && targetRow < 8 && c + 1 < 8 && board[targetRow][c + 1] === '') {
                    validMoves.push({ fromR: r, fromC: c, toR: targetRow, toC: c + 1 });
                }
            }
        }
    }

    if (validMoves.length > 0) {
        // Selecciona un movimiento al azar entre los válidos
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        executeMove(randomMove.fromR, randomMove.fromC, randomMove.toR, randomMove.toC);
        switchTurn();
    } else {
        // Si no le quedan movimientos
        isGameActive = false;
        const statusElem = document.getElementById('game-status');
        if (statusElem) statusElem.innerText = `¡Sin movimientos! Ganador: ${getPlayerName()}`;
    }
}

// =========================================================
// Hooks del Framework para Comandos de Chat (GameActions)
// =========================================================

window.onStartAI = function() {
    aiColor = 'R';    // IA juega con Rojas (mueve primero)
    userColor = 'B';  // Jugador juega con Negras
    initCheckers();
};

window.onStartUser = function() {
    aiColor = 'B';    // IA juega con Negras
    userColor = 'R';  // Jugador juega con Rojas (mueve primero)
    initCheckers();
};

window.onChangeSide = function(side) {
    if (side === 'X' || side === 'R') {
        window.onStartUser();
    } else {
        window.onStartAI();
    }
};

window.onToggleSide = function() {
    if (userColor === 'R') {
        window.onStartAI();
    } else {
        window.onStartUser();
    }
};

window.onResetGame = function() {
    initCheckers();
};

window.onGameModeChange = function(mode, difficulty) {
    initCheckers();
};

// Iniciar al cargar la página
document.addEventListener("DOMContentLoaded", initCheckers);
