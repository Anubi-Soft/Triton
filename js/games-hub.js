// =========================================================
// js/games-hub.js - Control del Cajón e Interacción Iframe
// =========================================================

function launchGame(gameUrl) {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
        drawer.classList.add('hidden'); // Se oculta el cajón mostrando el chat + juego
        btnBack.classList.remove('hidden');
    }
}

function closeGame() {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
        drawer.classList.remove('hidden'); // Tapa todo con la Galería
        btnBack.classList.add('hidden');
    }
}

// Función puente para que el iframe ordene ejecutar movimientos o reseteos
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "GAME_COMMAND") {
        const frame = document.getElementById('game-frame');
        if (frame && frame.contentWindow) {
            // Reenvía la orden recibida del chat directamente al iframe activo
            frame.contentWindow.postMessage(event.data, "*");
        }
    }
});
