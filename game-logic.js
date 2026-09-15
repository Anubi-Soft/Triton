// game-logic.js - Lógica del Juego y Chat Integrado

let board = ['', '', '', '', '', '', '', '', ''];
let turn = 'X';
let active = true;

function onModeChange() {
    const mode = document.getElementById('game-mode').value;
    const diffContainer = document.getElementById('difficulty-container');
    
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
    const difficulty = document.getElementById('game-difficulty') ? document.getElementById('game-difficulty').value : 'easy';
    
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

// Función del Chat Retro
function sendMessage() {
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');
    const text = input.value.trim();
    const mode = document.getElementById('game-mode').value;

    if (text !== '') {
        const msg = document.createElement('div');
        msg.style.marginBottom = '4px';
        msg.innerHTML = `<strong>Tú:</strong> ${text}`;
        history.appendChild(msg);
        input.value = '';
        history.scrollTop = history.scrollHeight;

        // Respuesta automática simulada de la IA
        if (mode === 'pve' && active) {
            setTimeout(() => {
                const iaMsg = document.createElement('div');
                iaMsg.style.marginBottom = '4px';
                iaMsg.style.color = 'var(--accent-color)';
                
                const responses = ["¡Buen movimiento!", "Mmm... déjame pensar 🤔", "¡Esa no me la esperaba!", "¡Te voy a ganar esta ronda! 😈"];
                const randomResp = responses[Math.floor(Math.random() * responses.length)];
                
                iaMsg.innerHTML = `<strong>IA:</strong> ${randomResp}`;
                history.appendChild(iaMsg);
                history.scrollTop = history.scrollHeight;
            }, 700);
        }
    }
}
