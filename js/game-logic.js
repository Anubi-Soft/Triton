// =========================================================
// js/game-logic.js - Gestión del Tablero, Chat y Feedback
// =========================================================

let boardState = ["", "", "", "", "", "", "", "", ""];
let playerSymbol = "X";
let aiSymbol = "O";
let currentPlayer = "X";
let isGameActive = true;

function makeMove(index) {
    if (boardState[index] !== "" || !isGameActive) return;

    boardState[index] = currentPlayer;
    updateBoardUI();

    if (checkWinner()) return;

    const modeElem = document.getElementById("game-mode");
    const mode = modeElem ? modeElem.value : "pvp-local";

    if (mode === "pve") {
        if (currentPlayer === playerSymbol) {
            currentPlayer = aiSymbol;
            updateStatus(`Turno de: AnubiBot (${aiSymbol})`);
            isGameActive = false;

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

// Comprobación de ganador con comentarios automáticos de AnubiBot
function checkWinner() {
    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    const playerName = getPlayerName();

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            const winnerSymbol = boardState[a];
            isGameActive = false;

            if (winnerSymbol === playerSymbol) {
                updateStatus(`¡Ganador: ${playerName} (${playerSymbol})! 🎉`);
                appendChatMessage("AnubiBot", `¡Increíble jugada, ${playerName}! 🎮 Me ganaste esta ronda. ¿Echamos otra partida?`);
            } else {
                updateStatus(`¡Ganador: AnubiBot (${aiSymbol})! 🎉`);
                appendChatMessage("AnubiBot", `¡Punto para la IA! 🤖 Buena partida, ${playerName}. ¿Quieres la revancha?`);
            }
            return true;
        }
    }

    if (!boardState.includes("")) {
        updateStatus("¡Empate! 🤝");
        isGameActive = false;
        appendChatMessage("AnubiBot", `¡Un empate muy ajustado, ${playerName}! ⚔️ Estuvo muy parejo. ¿Jugamos el desempate?`);
        return true;
    }

    return false;
}

function resetGame(startingPlayer = playerSymbol) {
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

// =========================================================
// Obtener el Nick con Fallback Seguro
// =========================================================
function getPlayerName() {
    const nameInput = document.getElementById("player-name");
    const val = nameInput ? nameInput.value.trim() : "";
    return val !== "" ? val : "Jugador";
}

// =========================================================
// UX: Salto automático del Nick al Chat con Enter
// =========================================================
const nameInputElem = document.getElementById("player-name");
const chatInputElem = document.getElementById("chat-input");

if (nameInputElem && chatInputElem) {
    nameInputElem.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            chatInputElem.focus();
        }
    });
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
// Envío de Mensajes y Control Dinámico desde el Chat
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

        const hasSwitchVS     = reply.includes("[ACTION:SWITCH_AI]");
        const hasAIFirst      = reply.includes("[ACTION:START_AI]");
        const hasUserFirst    = reply.includes("[ACTION:START_USER]");
        const hasChangeSideX  = reply.includes("[ACTION:CHANGE_SIDE_X]");
        const hasChangeSideO  = reply.includes("[ACTION:CHANGE_SIDE_O]");
        const hasToggleSide   = reply.includes("[ACTION:TOGGLE_SIDE]");

        let cleanReply = reply.replace(/\[ACTION:[^\]]+\]/gi, "").trim();
        if (!cleanReply) cleanReply = "¡A jugar!";

        appendChatMessage("AnubiBot", cleanReply);

        if (hasSwitchVS || hasAIFirst || hasUserFirst || hasChangeSideX || hasChangeSideO || hasToggleSide) {
            switchToPVE();

            if (hasToggleSide) {
                if (playerSymbol === "X") {
                    playerSymbol = "O";
                    aiSymbol = "X";
                } else {
                    playerSymbol = "X";
                    aiSymbol = "O";
                }
                resetGame(playerSymbol);
            }
            else if (hasChangeSideX) {
                playerSymbol = "X"; 
                aiSymbol = "O";
                resetGame("X");
            } 
            else if (hasChangeSideO) {
                playerSymbol = "O";
                aiSymbol = "X";
                resetGame("X");
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
    scrollToBottom();
}

// =========================================================
// Auto-Scroll para el Chat e Input Focus en Móviles
// =========================================================

function scrollToBottom() {
    const history = document.getElementById("chat-history");
    if (history) {
        history.scrollTop = history.scrollHeight;
    }
}

// Una única declaración del listener de foco para el input del chat
if (chatInputElem) {
    chatInputElem.addEventListener("focus", () => {
        setTimeout(() => {
            chatInputElem.scrollIntoView({ behavior: "smooth", block: "center" });
            scrollToBottom();
        }, 300);
    });
}
