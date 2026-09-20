// =========================================================
// js/checkers-logic.js - Lógica, Reyes, Capturas y UI Casino
// =========================================================

let board = [];
let selectedPiece = null;
let turn = 'R';        // 'R' = Rojas, 'B' = Negras
let aiColor = 'B';     
let userColor = 'R';   
let isGameActive = true;

// Contadores de fichas capturadas
let capturedRedCount = 0;
let capturedBlackCount = 0;

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
    capturedRedCount = 0;
    capturedBlackCount = 0;

    turn = 'R'; 
    updateCheckersStatus();
    renderBoard();
    updateCapturedUI();
    checkAITurn();
}

function updateCheckersStatus() {
    const statusElem = document.getElementById('game-status');
    if (!statusElem || !isGameActive) return;

    const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";
    const turnName = (turn === userColor) ? playerName : "AnubiBot 🤖";
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
            
            const cellValue = board[r][c];
            if (cellValue !== '') {
                const piece = document.createElement('div');
                const isKing = cellValue.includes('K');
                const baseColor = cellValue.charAt(0).toLowerCase();
                
                piece.className = `piece piece-${baseColor}${isKing ? ' king' : ''}`;
                if (isKing) piece.innerText = '👑';

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

// Renderiza las pilas laterales de fichas comidas (Efecto Tragaperras)
function updateCapturedUI() {
    const redStack = document.getElementById('captured-red');
    const blackStack = document.getElementById('captured-black');

    if (redStack) {
        redStack.innerHTML = '';
        for (let i = 0; i < capturedRedCount; i++) {
            const p = document.createElement('div');
            p.className = 'captured-piece red';
            redStack.appendChild(p);
        }
    }

    if (blackStack) {
        blackStack.innerHTML = '';
        for (let i = 0; i < capturedBlackCount; i++) {
            const p = document.createElement('div');
            p.className = 'captured-piece black';
            blackStack.appendChild(p);
        }
    }
}

function handleSquareClick(r, c) {
    if (!isGameActive) return;

    const modeElem = document.getElementById('game-mode');
    const isPVE = modeElem && modeElem.value === 'pve';
    if (isPVE && turn === aiColor) return;

    // Seleccionar pieza propia (compara la letra inicial 'R' o 'B')
    if (board[r][c] !== '' && board[r][c].charAt(0) === turn) {
        selectedPiece = { r, c };
        renderBoard();
        return;
    }

    // Mover pieza a casillero vacío
    if (selectedPiece && board[r][c] === '') {
        if (executeMove(selectedPiece.r, selectedPiece.c, r, c)) {
            selectedPiece = null;
            switchTurn();
        }
    }
}

function executeMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const isKing = piece.includes('K');
    const color = piece.charAt(0);

    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);

    // 1. Movimiento Simple Diagonal (1 casilla)
    const validDirection = isKing || (color === 'R' && rowDiff === -1) || (color === 'B' && rowDiff === 1);
    if (validDirection && colDiff === 1 && Math.abs(rowDiff) === 1) {
        board[toR][toC] = piece;
        board[fromR][fromC] = '';
        checkKingCoronation(toR, toC);
        return true;
    }

    // 2. Captura / "Comer" (2 casillas en diagonal)
    const validJumpDirection = isKing || (color === 'R' && rowDiff === -2) || (color === 'B' && rowDiff === 2);
    if (validJumpDirection && colDiff === 2 && Math.abs(rowDiff) === 2) {
        const midR = (fromR + toR) / 2;
        const midC = (fromC + toC) / 2;
        const midPiece = board[midR][midC];

        if (midPiece !== '' && midPiece.charAt(0) !== color) {
            // Incrementar contador de fichas comidas
            if (midPiece.charAt(0) === 'R') capturedRedCount++;
            if (midPiece.charAt(0) === 'B') capturedBlackCount++;

            board[toR][toC] = piece;
            board[fromR][fromC] = '';
            board[midR][midC] = ''; // Quitar la ficha
            
            checkKingCoronation(toR, toC);
            updateCapturedUI();
            return true;
        }
    }

    return false;
}

function checkKingCoronation(r, c) {
    const piece = board[r][c];
    if (piece === 'R' && r === 0) board[r][c] = 'RK';
    if (piece === 'B' && r === 7) board[r][c] = 'BK';
}

function switchTurn() {
    turn = (turn === 'R') ? 'B' : 'R';
    updateCheckersStatus();
    renderBoard();

    if (checkGameOver()) return;
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
// IA y Búsqueda de Movimientos (Incluye Reyes)
// =========================================================

function makeAIMove() {
    if (!isGameActive || turn !== aiColor) return;

    const allMoves = getAllValidMovesForColor(aiColor);

    if (allMoves.length > 0) {
        const captureMoves = allMoves.filter(m => m.isCapture);
        const selectedMove = captureMoves.length > 0 
            ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
            : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(selectedMove.fromR, selectedMove.fromC, selectedMove.toR, selectedMove.toC);
        switchTurn();
    } else {
        isGameActive = false;
        const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";
        const statusElem = document.getElementById('game-status');
        if (statusElem) statusElem.innerText = `¡Sin movimientos! Ganador: ${playerName}`;
    }
}

function getAllValidMovesForColor(color) {
    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            // CORRECCIÓN CLAVE: Verificar la letra inicial para incluir 'R', 'RK', 'B', 'BK'
            if (piece !== '' && piece.charAt(0) === color) {
                const isKing = piece.includes('K');
                
                const directions = [];
                if (isKing || color === 'B') directions.push({ r: 1, c: -1 }, { r: 1, c: 1 });
                if (isKing || color === 'R') directions.push({ r: -1, c: -1 }, { r: -1, c: 1 });

                for (let dir of directions) {
                    // Movimiento Simple
                    const nr = r + dir.r;
                    const nc = c + dir.c;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === '') {
                        moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, isCapture: false });
                    }

                    // Captura
                    const capR = r + (dir.r * 2);
                    const capC = c + (dir.c * 2);
                    const midR = r + dir.r;
                    const midC = c + dir.c;

                    if (capR >= 0 && capR < 8 && capC >= 0 && capC < 8) {
                        const midPiece = board[midR][midC];
                        if (board[capR][capC] === '' && midPiece !== '' && midPiece.charAt(0) !== color) {
                            moves.push({ fromR: r, fromC: c, toR: capR, toC: capC, isCapture: true });
                        }
                    }
                }
            }
        }
    }
    return moves;
}

// Hooks Framework
window.initCheckers = initCheckers;
window.handleSquareClick = handleSquareClick;

window.onStartAI = function() {
    aiColor = 'R'; userColor = 'B'; initCheckers();
};
window.onStartUser = function() {
    aiColor = 'B'; userColor = 'R'; initCheckers();
};
window.onChangeSide = function(side) {
    if (side === 'X' || side === 'R') window.onStartUser(); else window.onStartAI();
};
window.onToggleSide = function() {
    if (userColor === 'R') window.onStartAI(); else window.onStartUser();
};
window.onResetGame = function() { initCheckers(); };
window.onGameModeChange = function() { initCheckers(); };

function checkGameOver() {
    const pveMode = document.getElementById('game-mode')?.value === 'pve';
    const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";

    const redMoves = getAllValidMovesForColor('R');
    const blackMoves = getAllValidMovesForColor('B');

    if (redMoves.length === 0 || blackMoves.length === 0) {
        isGameActive = false;
        const winner = (redMoves.length > 0) ? "Rojas" : "Negras";
        updateStatus(`¡Fin de la partida! Ganador: ${winner}`);
        return true;
    }
    return false;
}

function updateStatus(text) {
    const statusElem = document.getElementById('game-status');
    if (statusElem) statusElem.innerText = text;
}

document.addEventListener("DOMContentLoaded", initCheckers);
