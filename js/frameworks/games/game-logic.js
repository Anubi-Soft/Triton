// =========================================================
// js/frameworks/games/game-logic.js - Chat Universal y Feedback
// =========================================================

function getPlayerName() {
    const nameInput = document.getElementById("player-name");
    const val = nameInput ? nameInput.value.trim() : "";
    return val !== "" ? val : "Jugador";
}

// Detección dinámica del juego actual según la URL
function getCurrentGameName() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("checkers") || path.includes("damas")) {
        return "Damas Retro";
    }
    if (path.includes("tateti")) {
        return "Ta-Te-Ti Retro";
    }
    return "Juego Retro";
}

// =========================================================
// Envío de Mensajes y Procesamiento Dinámico
// =========================================================

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input ? input.value.trim() : "";
    const playerName = getPlayerName();

    if (!text) return;

    appendChatMessage(playerName, text);
    input.value = "";

    // Obtenemos el juego actual para que la IA sepa el contexto
    const currentGame = getCurrentGameName();

    try {
        const res = await fetch("https://triton-bxoj.vercel.app/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: text, 
                playerName: playerName,
                game: currentGame // Send context to Vercel backend
            })
        });

        if (!res.ok) {
            appendChatMessage("AnubiBot", `[Error ${res.status}]: Falló la respuesta de Vercel.`);
            return;
        }

        const data = await res.json();
        let reply = data.reply || "...";

        // Capturar todas las etiquetas [ACTION:...]
        const actionMatch = reply.match(/\[ACTION:([A-Z_]+)\]/i);
        
        // Limpiar las etiquetas para mostrar únicamente el texto
        let cleanReply = reply.replace(/\[ACTION:[^\]]+\]/gi, "").trim();
        if (!cleanReply) cleanReply = "¡A jugar!";

        appendChatMessage("AnubiBot", cleanReply);

        // Derivar la acción recibida a nuestro Framework (GameActions)
        if (actionMatch && window.GameActions) {
            const actionTag = actionMatch[1].toUpperCase();
            window.GameActions.processAction(actionTag);
        }

    } catch (err) {
        appendChatMessage("AnubiBot", `[Error Conexión]: ${err.message}`);
    }
}

// Cambia la UI al modo vs IA automáticamente
function switchToPVE() {
    const modeElem = document.getElementById("game-mode");
    if (modeElem && modeElem.value !== "pve") {
        modeElem.value = "pve";
        if (typeof window.onModeChange === "function") {
            window.onModeChange();
        }
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

function scrollToBottom() {
    const history = document.getElementById("chat-history");
    if (history) {
        history.scrollTop = history.scrollHeight;
    }
}

// Exposición Global de funciones principales
window.sendMessage = sendMessage;
window.appendChatMessage = appendChatMessage;
window.getPlayerName = getPlayerName;
window.switchToPVE = switchToPVE;

// =========================================================
// UX: Salto con Enter y Enfoque en Pantallas Móviles
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
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

    if (chatInputElem) {
        chatInputElem.addEventListener("focus", () => {
            setTimeout(() => {
                chatInputElem.scrollIntoView({ behavior: "smooth", block: "center" });
                scrollToBottom();
            }, 300);
        });
    }
});
