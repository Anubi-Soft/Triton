// =========================================================
// js/games-hub.js - Controlador de Iframe y Cajón de Juegos
// =========================================================

// Declaramos las funciones explícitamente en el objeto window para asegurarnos de que sean globales
window.launchGame = function(gameUrl) {
    alert("Ejecutando launchGame para: " + gameUrl); // Modal para testear en celular
    
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

// Capturador global de eventos táctiles y clics
document.addEventListener("click", function(event) {
    // Si la persona toca la tarjeta del Ta-Te-Ti (o cualquier elemento dentro de ella)
    const tatetiBtn = event.target.closest('#btn-tateti') || event.target.closest('.game-card');
    
    if (tatetiBtn && !tatetiBtn.classList.contains('locked')) {
        event.preventDefault();
        window.launchGame("games/tateti.html");
        return;
    }

    // Si toca el botón de regresar
    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        window.closeGame();
        return;
    }
});
