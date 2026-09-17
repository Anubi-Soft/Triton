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
// URL de tu microservicio en Vercel
const BACKEND_URL = "https://triton-bxoj.vercel.app/api/chat";

// Chat Inteligente conectado a Vercel / Llama 3
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');
    const rawText = input.value.trim();
    const text = rawText.toLowerCase();
    const mode = document.getElementById('game-mode').value;

    if (text !== '') {
        // 1. Mostrar mensaje del usuario
        const msg = document.createElement('div');
        msg.style.marginBottom = '4px';
        msg.innerHTML = `<strong>Tú:</strong> ${escapeHTML(rawText)}`;
        history.appendChild(msg);
        input.value = '';
        history.scrollTop = history.scrollHeight;

        // Lógica de comandos especiales del juego (si querés que empiece la IA)
        if (mode === 'pve') {
            if (text.includes('empeza vos') || text.includes('empezá vos') || text.includes('inicia vos') || text.includes('comenza vos')) {
                if (board.every(cell => cell === '')) {
                    turn = 'O';
                    const difficulty = document.getElementById('game-difficulty') ? document.getElementById('game-difficulty').value : 'easy';
                    let aiMove = IAEngine.getBestMove(board, 'O', 'X', difficulty);
                    if (aiMove !== null) {
                        executeMove(aiMove, 'O');
                    }
                }
            }

            // 2. Mostrar indicador de "Escribiendo..."
            const typingMsg = document.createElement('div');
            typingMsg.id = 'ai-typing';
            typingMsg.style.marginBottom = '4px';
            typingMsg.style.color = 'var(--accent-color, #00e5ff)';
            typingMsg.innerHTML = `<strong>AnubiBot:</strong> <i>Escribiendo...</i>`;
            history.appendChild(typingMsg);
            history.scrollTop = history.scrollHeight;

            try {
                // 3. Petición a tu API en Vercel
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: rawText })
                });

                const data = await response.json();
                
                // 4. Remover "Escribiendo..."
                const typingElem = document.getElementById('ai-typing');
                if (typingElem) typingElem.remove();

                // 5. Mostrar respuesta de la IA
                const iaMsg = document.createElement('div');
                iaMsg.style.marginBottom = '4px';
                iaMsg.style.color = 'var(--accent-color, #00e5ff)';
                
                const replyText = data.reply || "¡Ups, tuve un micro-lag en mis circuitos retro!";
                iaMsg.innerHTML = `<strong>AnubiBot:</strong> ${escapeHTML(replyText)}`;
                history.appendChild(iaMsg);

            } catch (error) {
                console.error("Error conectando con la IA:", error);
                const typingElem = document.getElementById('ai-typing');
                if (typingElem) typingElem.remove();

                const errorMsg = document.createElement('div');
                errorMsg.style.marginBottom = '4px';
                errorMsg.style.color = '#ff5555';
                errorMsg.innerHTML = `<strong>AnubiBot:</strong> ¡Sin conexión con el servidor de AnubiSoft!`;
                history.appendChild(errorMsg);
            }

            history.scrollTop = history.scrollHeight;
        }
    }
}

// Función auxiliar para evitar código malicioso en el chat
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
