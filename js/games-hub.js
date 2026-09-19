// =========================================================
// js/games-hub.js - Control del Cajón de Minijuegos
// =========================================================

function launchGame(gameUrl) {
    // Cartel temporal para confirmar el toque en el celular
    alert("¡Tocaste el juego! Cargando: " + gameUrl);

    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
        drawer.classList.add('hidden'); // Oculta el cajón
        btnBack.classList.remove('hidden'); // Muestra botón Volver
    }
}

function closeGame() {
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
        drawer.classList.remove('hidden'); // Vuelve al cajón
        btnBack.classList.add('hidden');
    }
}

// Escuchadores de eventos cuando el HTML termina de cargar
document.addEventListener("DOMContentLoaded", () => {
    const btnTateti = document.getElementById("btn-tateti");
    const btnBack = document.getElementById("btn-back");

    if (btnTateti) {
        btnTateti.addEventListener("click", () => {
            launchGame("games/tateti.html");
        });
    }

    if (btnBack) {
        btnBack.addEventListener("click", closeGame);
    }
});
