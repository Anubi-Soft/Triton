// game-logic.js - Lógica del Ta-Te-Ti y Chat Interactivo

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
        }, 400);
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

// Chat Inteligente con comandos de inicio de juego
function sendMessage() {
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');
    const rawText = input.value.trim();
    const text = rawText.toLowerCase();
    const mode = document.getElementById('game-mode').value;

    if (text !== '') {
        const msg = document.createElement('div');
        msg.style.marginBottom = '4px';
        msg.innerHTML = `<strong>Tú:</strong> ${rawText}`;
        history.appendChild(msg);
        input.value = '';
        history.scrollTop = history.scrollHeight;

        // Respuesta interactiva si jugamos vs IA
        if (mode === 'pve') {
            setTimeout(() => {
                const iaMsg = document.createElement('div');
                iaMsg.style.marginBottom = '4px';
                iaMsg.style.color = 'var(--accent-color)';
                
                let response = "";

                // Detecta si preguntás por empezar
                if (text.includes('comenzamos') || text.includes('empezamos') || text.includes('arrancamos') || text.includes('jugamos')) {
                    response = "¡Dale! ¿Arrancás vos con 'X' o querés que empiece yo? Escribí 'empezá vos' si te animás 😈";
                } 
                else if (text.includes('empeza vos') || text.includes('empezá vos') || text.includes('inicia vos') || text.includes('comenza vos')) {
                    response = "¡Acepto el reto! Muevo primero...";
                    
                    // Si el tablero está vacío, resetea y hace mover a la IA como O
                    if (board.every(cell => cell === '')) {
                        turn = 'O';
                        const difficulty = document.getElementById('game-difficulty') ? document.getElementById('game-difficulty').value : 'easy';
                        let aiMove = IAEngine.getBestMove(board, 'O', 'X', difficulty);
                        if (aiMove !== null) {
                            executeMove(aiMove, 'O');
                        }
                    }
                } 
                else {
                    const randomResponses = [
                        "¡Buen movimiento!",
                        "Mmm... déjame pensar la jugada 🤔",
                        "¡Ojo con esa esquina!",
                        "Te tengo rodeado 😈",
                        "¡Esta partida es mía!"
                    ];
                    response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
                }

                iaMsg.innerHTML = `<strong>IA:</strong> ${response}`;
                history.appendChild(iaMsg);
                history.scrollTop = history.scrollHeight;
            }, 600);
        }
    }
}
