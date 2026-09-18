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
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const history = document.getElementById("chat-history");
    const nameInput = document.getElementById("player-name");
    
    const text = input ? input.value.trim() : "";
    const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Jugador";

    if (!text) return;

    appendChatMessage(playerName, text);
    input.value = "";

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, playerName: playerName })
        });

        // Si la ruta no existe (404) o falla (500)
        if (!res.ok) {
            appendChatMessage("AnubiBot", `[Error Status ${res.status}]: Revisa la ruta /api/chat en Vercel.`);
            return;
        }

        const data = await res.json();
        let reply = data.reply || "Sin respuesta del servidor.";

        if (reply.includes("[ACTION:START]")) {
            reply = reply.replace("[ACTION:START]", "").trim();
            resetGame();
            const modeElem = document.getElementById("game-mode");
            if (modeElem && modeElem.value === "pve") {
                const diffElem = document.getElementById("game-difficulty");
                const diff = diffElem ? diffElem.value : "medium";
                const aiMove = getAIMove(boardState, diff);
                if (aiMove !== null) {
                    boardState[aiMove] = "O";
                    updateBoardUI();
                }
            }
        } else if (reply.includes("[ACTION:RESTART]")) {
            reply = reply.replace("[ACTION:RESTART]", "").trim();
            resetGame();
        }

        appendChatMessage("AnubiBot", reply);

    } catch (err) {
        appendChatMessage("AnubiBot", `[Error Catch]: ${err.message}`);
    }
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
