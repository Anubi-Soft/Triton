// =========================================================
// js/games-hub.js - Control del Cajón de Minijuegos
// =========================================================

// Forzamos que las funciones sean globales en window
window.launchGame = function(gameUrl) {
    alert("¡Iniciando carga de: " + gameUrl + "!");

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

// Escuchador táctil directo para móviles (touchstart + click)
document.addEventListener("DOMContentLoaded", () => {
    const btnTateti = document.getElementById("btn-tateti");
    const btnBack = document.getElementById("btn-back");

    if (btnTateti) {
        const dispararJuego = (e) => {
            e.preventDefault();
            window.launchGame("games/tateti.html");
        };
        btnTateti.addEventListener("click", dispararJuego);
    }

    if (btnBack) {
        btnBack.addEventListener("click", window.closeGame);
    }
});
