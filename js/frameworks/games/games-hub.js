// =========================================================
// js/games-hub.js - Controlador dinámico de Minijuegos
// =========================================================

window.launchGame = function(gameUrl) {
    if (!gameUrl) return;
    console.log("[GamesHub] Lanzando juego:", gameUrl);
    
    // 1. Ocultar la galería de juegos
    const drawer = document.getElementById('app-drawer');
    if (drawer) drawer.classList.add('hidden');

    // 2. Cargar la URL correspondiente en el iframe y mostrarlo
    const frame = document.getElementById('game-frame');
    if (frame) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
    }

    // 3. Mostrar el botón de volver al menú
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

window.initGamesHub = function() {
    console.log("[GamesHub] Módulo de minijuegos listo.");
};

// Delegación de eventos para capturar cualquier tarjeta de juego
document.addEventListener("click", function(event) {
    // Detectar si se hizo clic en alguna tarjeta de juego que no esté bloqueada
    const gameCard = event.target.closest('.game-card:not(.locked)');
    
    if (gameCard) {
        event.preventDefault();
        // Obtener la URL del atributo data-game-url o por defecto usará la definida en onclick
        const gameUrl = gameCard.getAttribute('data-game-url');
        if (gameUrl) {
            window.launchGame(gameUrl);
        }
        return;
    }

    // Detectar si se hizo clic en el botón Volver
    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        window.closeGame();
        return;
    }
});
