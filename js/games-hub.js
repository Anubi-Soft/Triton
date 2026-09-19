// =========================================================
// js/games-hub.js - Control Global de Minijuegos
// =========================================================

function launchGame(gameUrl) {
    console.log("Cargando juego en iframe:", gameUrl);
    
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (drawer) drawer.classList.add('hidden');
    if (frame) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
    }
    if (btnBack) btnBack.classList.remove('hidden');
}

function closeGame() {
    console.log("Cerrando juego...");
    
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
    }
    if (drawer) drawer.classList.remove('hidden');
    if (btnBack) btnBack.classList.add('hidden');
}

// Delegación de eventos global
document.addEventListener("click", function(event) {
    // Detecta toque en la tarjeta del Ta-Te-Ti
    const tatetiBtn = event.target.closest('#btn-tateti');
    if (tatetiBtn) {
        event.preventDefault();
        launchGame("games/tateti.html");
        return;
    }

    // Detecta toque en el botón volver
    const backBtn = event.target.closest('#btn-back');
    if (backBtn) {
        event.preventDefault();
        closeGame();
        return;
    }
});
