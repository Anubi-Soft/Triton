// =========================================================
// js/games-hub.js - Lógica del Cajón y Manejo de Iframe
// =========================================================

function launchGame(gameUrl) {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
        drawer.classList.add('hidden'); // Oculta el cajón de minijuegos
        btnBack.classList.remove('hidden'); // Muestra la flecha <= Atrás
    }
}

function closeGame() {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = 'about:blank'; // Vacía el iframe para no gastar recursos
        frame.classList.add('hidden');
        drawer.classList.remove('hidden'); // Vuelve a mostrar el cajón
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
