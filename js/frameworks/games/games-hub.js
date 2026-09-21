// =========================================================
// js/games-hub.js - Controlador dinámico de Minijuegos (Win7 Edition)
// =========================================================

window.launchGame = function(gameUrl, gameTitle) {
    if (!gameUrl) return;
    console.log("[GamesHub] Lanzando juego:", gameUrl);
    
    // 1. Ocultar la galería de juegos
    const drawer = document.getElementById('app-drawer');
    if (drawer) drawer.classList.add('hidden');

    // 2. Actualizar el título del juego en la barra de direcciones (si existe)
    const titleSpan = document.getElementById('current-game-title');
    if (titleSpan && gameTitle) {
        titleSpan.textContent = gameTitle;
    }

    // 3. Cargar la URL correspondiente en el iframe y mostrarlo
    const frame = document.getElementById('game-frame');
    if (frame) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
    }

    // 4. Mostrar la barra completa de Windows 7 Explorer
    const explorerBar = document.getElementById('win7-explorer-bar');
    if (explorerBar) {
        explorerBar.classList.remove('hidden');
    } else {
        // Fallback por si en alguna vista solo existe el botón antiguo
        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.classList.remove('hidden');
    }
};

window.closeGame = function() {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const explorerBar = document.getElementById('win7-explorer-bar');
    const btnBack = document.getElementById('btn-back');

    if (frame) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
    }
    if (drawer) drawer.classList.remove('hidden');
    
    // Ocultar barra o botón
    if (explorerBar) explorerBar.classList.add('hidden');
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
        
        const gameUrl = gameCard.getAttribute('data-game-url');
        // Extraemos el texto visible o un atributo data-title si lo agregamos
        const titleSpan = gameCard.querySelector('span');
        const gameTitle = titleSpan ? titleSpan.textContent.trim() : 'Juego';

        if (gameUrl) {
            window.launchGame(gameUrl, gameTitle);
        }
        return;
    }

    // Detectar si se hizo clic en el botón Volver (funciona con la esfera 3D o con el id antiguo)
    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        window.closeGame();
        return;
    }
});
