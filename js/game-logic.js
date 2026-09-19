// =========================================================
// js/game-logic.js - Gestión del Tablero y Chat Retro
// =========================================================

// Variables globales con soporte para cambio de bando dinámico
let boardState = ["", "", "", "", "", "", "", "", ""];
let playerSymbol = "X";
let aiSymbol = "O";
let currentPlayer = "X";
let isGameActive = true;

// Mover en el tablero
function makeMove(index) {
    if (boardState[index] !== "" || !isGameActive) return;

    // Registra el movimiento del jugador actual
    boardState[index] = currentPlayer;
    updateBoardUI();

    if (checkWinner()) return;

    const modeElem = document.getElementById("game-mode");
    const mode = modeElem ? modeElem.value : "pvp-local";

    if (mode === "pve") {
        // Si acaba de mover el jugador, le toca a la IA
        if (currentPlayer === playerSymbol) {
            currentPlayer = aiSymbol;
            updateStatus(`Turno de: AnubiBot (${aiSymbol})`);
            isGameActive = false; // Bloquea clics del usuario mientras la IA procesa

            setTimeout(() => {
                executeAIMove();
            }, 400);
        }
    } else if (mode === "pvp-local") {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus(`Turno de: Jugador ${currentPlayer}`);
    }
}

function executeAIMove() {
    const diffElem = document.getElementById("game-difficulty");
    const diff = diffElem ? diffElem.value : "medium";

    if (typeof getAIMove === "function") {
        const aiChoice = getAIMove(boardState, diff);
        if (aiChoice !== null && aiChoice !== undefined) {
            boardState[aiChoice] = aiSymbol;
            updateBoardUI();
            if (!checkWinner()) {
                currentPlayer = playerSymbol;
                updateStatus(`Turno de: ${getPlayerName()} (${playerSymbol})`);
                isGameActive = true;
            }
        }
    }
}

function updateBoardUI() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, idx) => {
        if (cell) {
            cell.innerText = boardState[idx];
            cell.className = `cell ${boardState[idx].toLowerCase()}`;
        }
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
            const winnerName = boardState[a] === playerSymbol ? getPlayerName() : "AnubiBot";
            updateStatus(`¡Ganador: ${winnerName} (${boardState[a]})! 🎉`);
            isGameActive = false;
            return true;
        }
    }

    if (!boardState.includes("")) {
        updateStatus("¡Empate! 🤝");
        isGameActive = false;
        return true;
    }

    return false;
}

// Resetea la partida respetando quién arranca según las banderas
function resetGame(startingPlayer = "X") {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = startingPlayer;
    isGameActive = true;

    const startText = currentPlayer === playerSymbol ? getPlayerName() : "AnubiBot";
    updateStatus(`Turno de: ${startText} (${currentPlayer})`);
    updateBoardUI();
}

function updateStatus(text) {
    const statusElem = document.getElementById("game-status");
    if (statusElem) statusElem.innerText = text;
}

function getPlayerName() {
    const nameInput = document.getElementById("player-name");
    return (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Jugador";
}

function onModeChange() {
    const modeElem = document.getElementById("game-mode");
    const diffContainer = document.getElementById("difficulty-container");
    if (modeElem && diffContainer) {
        if (modeElem.value === "pve") {
            diffContainer.style.display = "block";
            diffContainer.classList.remove("hidden");
        } else {
            diffContainer.style.display = "none";
            diffContainer.classList.add("hidden");
        }
    }
    resetGame(playerSymbol);
}

// =========================================================
// Envió de Mensajes y Control Dinámico desde el Chat
// =========================================================

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input ? input.value.trim() : "";
    const playerName = getPlayerName();

    if (!text) return;

    appendChatMessage(playerName, text);
    input.value = "";

    try {
        const res = await fetch("https://triton-bxoj.vercel.app/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, playerName: playerName })
        });

        if (!res.ok) {
            appendChatMessage("AnubiBot", `[Error ${res.status}]: Falló la respuesta de Vercel.`);
            return;
        }

        const data = await res.json();
        let reply = data.reply || "...";

        // 1. Detectar acciones
        const hasSwitchVS     = reply.includes("[ACTION:SWITCH_AI]");
        const hasAIFirst      = reply.includes("[ACTION:START_AI]");
        const hasUserFirst    = reply.includes("[ACTION:START_USER]");
        const hasChangeSideX  = reply.includes("[ACTION:CHANGE_SIDE_X]");
        const hasChangeSideO  = reply.includes("[ACTION:CHANGE_SIDE_O]");
        const hasToggleSide   = reply.includes("[ACTION:TOGGLE_SIDE]");

        // 2. Limpieza TOTAL con expresión regular (evita filtrados visuales)
        let cleanReply = reply.replace(/\[ACTION:[^\]]+\]/gi, "").trim();
        appendChatMessage("AnubiBot", cleanReply);

        // 3. Ejecutar cambios en el juego
        if (hasSwitchVS || hasAIFirst || hasUserFirst || hasChangeSideX || hasChangeSideO || hasToggleSide) {
            switchToPVE();

            // Alternar bando automáticamente si dice "cambiamos"
            if (hasToggleSide) {
                if (playerSymbol === "X") {
                    playerSymbol = "O";
                    aiSymbol = "X";
                } else {
                    playerSymbol = "X";
                    aiSymbol = "O";
                }
                resetGame(playerSymbol);
                updateStatus(`Ahora eres '${playerSymbol}'. Turno de: ${playerName}`);
            }
            else if (hasChangeSideX) {
                playerSymbol = "X"; 
                aiSymbol = "O";
                resetGame("X");
                updateStatus(`Ahora eres 'X'. Turno de: ${playerName}`);
            } 
            else if (hasChangeSideO) {
                playerSymbol = "O";
                aiSymbol = "X";
                resetGame("X"); // Arranca X (que ahora es la IA)
                isGameActive = false;
                setTimeout(() => executeAIMove(), 500);
            }
            else if (hasAIFirst) {
                resetGame(aiSymbol);
                isGameActive = false;
                setTimeout(() => executeAIMove(), 500);
            } 
            else if (hasUserFirst) {
                resetGame(playerSymbol);
            }
        }

    } catch (err) {
        appendChatMessage("AnubiBot", `[Error Conexión]: ${err.message}`);
    }
}

function switchToPVE() {
    const modeElem = document.getElementById("game-mode");
    if (modeElem && modeElem.value !== "pve") {
        modeElem.value = "pve";
        onModeChange();
    }
}

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

    msgDiv.innerHTML = `<strong style="color: ${color};">${escapeHTML(sender)}:</strong> ${escapeHTML(text)}`;
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}

// Auto-Scroll para el teclado en móviles
const chatInput = document.getElementById("chat-input");
if (chatInput) {
    chatInput.addEventListener("focus", () => {
        setTimeout(() => {
            chatInput.scrollIntoView({ behavior: "smooth", block: "center" });
            const history = document.getElementById("chat-history");
            if (history) history.scrollTop = history.scrollHeight;
        }, 300);
    });
}
