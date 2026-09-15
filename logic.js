// game-logic.js - Lógica del juego y control de la UI

let board = ['', '', '', '', '', '', '', '', ''];
let turn = 'X';
let active = true;

function onModeChange() {
    const mode = document.getElementById('game-mode').value;
    const diffContainer = document.getElementById('difficulty-container');
    
    // Muestra u oculta el combo de Dificultad si se elige VS IA
    if (mode === 'pve') {
        diffContainer.style.display = 'inline-block';
    } else {
        diffContainer.style.display = 'none';
    }
    resetGame();
}

function makeMove(i) {
    if (board[i] !== '' || !active) return;
    
    executeMove(i, turn);

    const mode = document.getElementById('game-mode').value;
    const difficulty = document.getElementById('game-difficulty').value;
    
    if (mode === 'pve' && active && turn === 'O') {
        setTimeout(() => {
            let aiMove = IAEngine.getBestMove(board, 'O', 'X', difficulty);
            if (aiMove !== null) {
                executeMove(aiMove, 'O');
            }
        }, 300);
    }
}

function executeMove(i, player) {
    board[i] = player;
    const cells = document.querySelectorAll('.cell');
    cells[i].innerText = player;
    cells[i].classList.add(player.toLowerCase());
    
    if (checkWin()) {
        document.getElementById('game-status').innerText = `¡Gana el Jugador ${player}! 🎉`;
        active = false;
    } else if (!board.includes('')) {
        document.getElementById('game-status').innerText = '¡Empate!';
        active = false;
    } else {
        turn = turn === 'X' ? 'O' : 'X';
        document.getElementById('game-status').innerText = `Turno de: Jugador ${turn}`;
    }
}

function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(w => board[w[0]] && board[w[0]] === board[w[1]] && board[w[0]] === board[w[2]]);
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    turn = 'X';
    active = true;
    document.getElementById('game-status').innerText = 'Turno de: Jugador X';
    document.querySelectorAll('.cell').forEach(c => { c.innerText = ''; c.classList.remove('x','o'); });
}
