// =========================================================
// js/game-logic.js - Gestión del Tablero y Chat Retro
// =========================================================

let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

// Mover en el tablero
function makeMove(index) {
    if (boardState[index] !== "" || !isGameActive) return;

    boardState[index] = currentPlayer;
    updateBoardUI();

    if (checkWinner()) return;

    const modeElem = document.getElementById("game-mode");
    const mode = modeElem ? modeElem.value : "pvp-local";

    if (mode === "pve" && currentPlayer === "X") {
        currentPlayer = "O";
        updateStatus("Turno de: IA (O)");
        isGameActive = false; // Bloquea clics del usuario mientras la IA procesa

        setTimeout(() => {
            executeAIMove();
        }, 400);
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
            boardState[aiChoice] = "O";
            updateBoardUI();
            if (!checkWinner()) {
                currentPlayer = "X";
                updateStatus("Turno de: Jugador X");
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
            updateStatus(`¡Ganador: Jugador ${boardState[a]}! 🎉`);
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

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    updateStatus("Turno de: Jugador X");
    updateBoardUI();
}

function updateStatus(text) {
    const statusElem = document.getElementById("game-status");
    if (statusElem) statusElem.innerText = text;
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
    resetGame();
}

// =========================================================
// Envió de Mensajes y Control Dinámico desde el Chat
// =========================================================

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const nameInput = document.getElementById("player-name");

    const text = input ? input.value.trim() : "";
    const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Jugador";

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

        // Detección de Acciones devueltas por la IA
        const hasSwitchVS = reply.includes("[ACTION:SWITCH_AI]");
const hasAIFirst = reply.includes("[ACTION:START_AI]");
const hasUserFirst = reply.includes("[ACTION:START_USER]");

reply = reply
    .replace("[ACTION:SWITCH_AI]", "")
    .replace("[ACTION:START_AI]", "")
    .replace("[ACTION:START_USER]", "")
    .trim();


        appendChatMessage("AnubiBot", reply);

        // Cambiar a modo vs IA si la orden viene de la conversación
        if (hasSwitchVS || hasAIFirst || hasUserFirst) {
            switchToPVE();
            if (hasAIFirst) {
                resetGame();
                currentPlayer = "O";
                updateStatus("Turno de: IA (O)");
                isGameActive = false;
                setTimeout(() => executeAIMove(), 500);
            } else if (hasUserFirst) {
                resetGame();
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
