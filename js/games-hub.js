// =========================================================
// js/games-hub.js - Control del Cajón de Minijuegos
// =========================================================

function launchGame(gameUrl) {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
        drawer.classList.add('hidden');
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
        drawer.classList.remove('hidden');
        btnBack.classList.add('hidden');
    }
}
