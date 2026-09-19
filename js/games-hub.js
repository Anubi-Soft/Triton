// =========================================================
// js/games-hub.js - Controlador de Juegos
// =========================================================

window.launchGame = function(gameUrl) {
    // 1. Ocultar el menú/drawer de minijuegos
    const drawer = document.getElementById('app-drawer');
    if (drawer) drawer.classList.add('hidden');

    // 2. Cargar la URL en el iframe y mostrarlo
    const frame = document.getElementById('game-frame');
    if (frame) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
    }

    // 3. Mostrar el botón de volver
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.classList.remove('hidden');
};

window.closeGame = function() {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
    }
    if (drawer) drawer.classList.remove('hidden');
    if (btnBack) btnBack.classList.add('hidden');
};

// Listener global para clics
document.addEventListener("click", function(event) {
    const tatetiBtn = event.target.closest('#btn-tateti') || event.target.closest('.game-card');
    
    if (tatetiBtn && !tatetiBtn.classList.contains('locked')) {
        event.preventDefault();
        window.launchGame("games/tateti.html");
        return;
    }

    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        window.closeGame();
        return;
    }
});
