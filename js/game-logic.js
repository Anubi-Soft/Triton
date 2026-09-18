// =========================================================
// js/game-logic.js - Lógica del Juego + Conexión IA Serverless
// =========================================================

let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

function makeMove(index) {
    if (boardState[index] !== "" || !isGameActive) return;

    boardState[index] = currentPlayer;
    updateBoardUI();

    if (checkWinner()) return;

    const mode = document.getElementById("game-mode") ? document.getElementById("game-mode").value : "pvp-local";

    if (mode === "pve" && currentPlayer === "X") {
        currentPlayer = "O";
        const statusElem = document.getElementById("game-status");
        if (statusElem) statusElem.innerText = "Turno de: IA (O)";
        isGameActive = false; // Bloquea clicks mientras piensa

        setTimeout(() => {
            const diffElem = document.getElementById("game-difficulty");
            const diff = diffElem ? diffElem.value : "medium";
            const aiMove = getAIMove(boardState, diff);
            if (aiMove !== null) {
                boardState[aiMove] = "O";
                updateBoardUI();
                if (!checkWinner()) {
                    currentPlayer = "X";
                    if (statusElem) statusElem.innerText = "Turno de: Jugador X";
                    isGameActive = true;
                }
            }
        }, 400);
    } else if (mode === "pvp-local") {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        const statusElem = document.getElementById("game-status");
        if (statusElem) statusElem.innerText = `Turno de: Jugador ${currentPlayer}`;
    }
}

function updateBoardUI() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, idx) => {
        cell.innerText = boardState[idx];
        cell.className = `cell ${boardState[idx].toLowerCase()}`;
    });
}

function checkWinner() {
    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            const statusElem = document.getElementById("game-status");
            if (statusElem) statusElem.innerText = `¡Ganador: Jugador ${boardState[a]}! 🎉`;
            isGameActive = false;
            return true;
        }
    }

    if (!boardState.includes("")) {
        const statusElem = document.getElementById("game-status");
        if (statusElem) statusElem.innerText = "¡Empate! 🤝";
        isGameActive = false;
        return true;
    }

    return false;
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    
    const statusElem = document.getElementById("game-status");
    if (statusElem) {
        statusElem.innerText = "Turno de: Jugador X";
    }
    
    if (document.querySelector(".cell")) {
        updateBoardUI();
    }
}

function onModeChange() {
    const modeElem = document.getElementById("game-mode");
    const diffContainer = document.getElementById("difficulty-container");
    if (modeElem && diffContainer) {
        if (modeElem.value === "pve") {
            diffContainer.classList.remove("hidden");
            diffContainer.style.display = "block";
        } else {
            diffContainer.classList.add("hidden");
            diffContainer.style.display = "none";
        }
    }
    resetGame();
}

/* =========================================================
   Sistema de Chat Retro conectado a Vercel / Groq API
   ========================================================= */
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


function appendChatMessage(sender, text) {
    const history = document.getElementById("chat-history");
    if (!history) return;

    const msgDiv = document.createElement("div");
    msgDiv.style.marginBottom = "6px";
    
    const isBot = sender === "AnubiBot";
    const color = isBot ? "#00A2ED" : "var(--accent-color, #00ffcc)";

    msgDiv.innerHTML = `<strong style="color: ${color};">${sender}:</strong> ${escapeHTML(text)}`;
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
