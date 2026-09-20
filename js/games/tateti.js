// =========================================================
// js/games/tateti.js - Lógica e IA para Ta-Te-Ti Retro
// =========================================================

let boardState = ["", "", "", "", "", "", "", "", ""];
let playerSymbol = "X";
let aiSymbol = "O";
let currentPlayer = "X";
let isGameActive = true;

function initTateti() {
    resetGame(playerSymbol);
}

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
// Hooks para el Framework (GameActions / AnubiBot)
// =========================================================

window.onStartAI = function() {
    playerSymbol = "O";
    aiSymbol = "X";
    resetGame("X");
    isGameActive = false;
    setTimeout(() => executeAIMove(), 400);
};

window.onStartUser = function() {
    playerSymbol = "X";
    aiSymbol = "O";
    resetGame("X");
};

window.onChangeSide = function(side) {
    if (side === "X") {
        window.onStartUser();
    } else {
        window.onStartAI();
    }
};

window.onToggleSide = function() {
    if (playerSymbol === "X") {
        window.onStartAI();
    } else {
        window.onStartUser();
    }
};

window.onResetGame = function() {
    resetGame(playerSymbol);
};

window.onGameModeChange = function(mode, difficulty) {
    resetGame(playerSymbol);
};

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", initTateti);
