// =========================================================
// js/games-hub.js - Control del Cajón e Iframe (Delegado)
// =========================================================

window.launchGame = function(gameUrl) {
    console.log("Cargando juego:", gameUrl);
    
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (drawer) drawer.classList.add('hidden');
    if (frame) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
    }
    if (btnBack) btnBack.classList.remove('hidden');
};

window.closeGame = function() {
    console.log("Cerrando juego y volviendo al menú");
    
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

// Delegación global de clics para atrapar los botones sin importar el fetch
document.addEventListener("click", function(event) {
    // Si hace clic en la tarjeta de Tateti (o cualquier elemento dentro de ella)
    const tatetiCard = event.target.closest('#btn-tateti');
    if (tatetiCard) {
        event.preventDefault();
        window.launchGame("games/tateti.html");
        return;
    }

    // Si hace clic en el botón de volver
    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        window.closeGame();
        return;
    }
});
