// =========================================================
// js/checkers-logic.js - Lógica Básica de Damas
// =========================================================

let board = [];
let selectedPiece = null;
let turn = 'R'; // 'R' = Rojas (Jugador), 'B' = Negras (IA)

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
    renderBoard();
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
    if (board[r][c] === turn) {
        selectedPiece = { r, c };
        renderBoard();
        return;
    }

    if (selectedPiece && board[r][c] === '') {
        // Movimiento diagonal simple
        const rowDiff = r - selectedPiece.r;
        const colDiff = Math.abs(c - selectedPiece.c);

        if ((turn === 'R' && rowDiff === -1 && colDiff === 1) || 
            (turn === 'B' && rowDiff === 1 && colDiff === 1)) {
            
            board[r][c] = turn;
            board[selectedPiece.r][selectedPiece.c] = '';
            selectedPiece = null;
            turn = turn === 'R' ? 'B' : 'R';
            renderBoard();
            
            const statusElem = document.getElementById('game-status');
            if (statusElem) statusElem.innerText = `Turno de: ${turn === 'R' ? 'Rojas' : 'Negras'}`;
        }
    }
}
// Hook invocado por GameModeManager
window.onGameModeChange = function(mode, difficulty) {
    console.log(`[Damas] Modo cambiado a: ${mode}, Dificultad: ${difficulty}`);
    
    const statusElem = document.getElementById('game-status');
    if (mode === 'pve') {
        if (statusElem) statusElem.innerText = `Modo vs IA (${difficulty}) - Turno de: Rojas`;
    } else if (mode === 'pvp-online') {
        if (statusElem) statusElem.innerText = "Esperando rival P2P...";
    } else {
        if (statusElem) statusElem.innerText = "Modo 2 Jugadores Local - Turno de: Rojas";
    }

    initCheckers(); // Reinicia el tablero al cambiar de modo
};


// Iniciar al cargar
document.addEventListener("DOMContentLoaded", initCheckers);
