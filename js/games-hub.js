// =========================================================
// js/games-hub.js - Control del Cajón y Manejo de Iframe
// =========================================================

function launchGame(gameUrl) {
    console.log("-> Ejecutando launchGame con la ruta:", gameUrl);
    
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (!drawer) console.error("Error: No se encontró el elemento #app-drawer");
    if (!frame) console.error("Error: No se encontró el elemento #game-frame");
    if (!btnBack) console.error("Error: No se encontró el elemento #btn-back");

    if (frame && drawer && btnBack) {
        frame.src = gameUrl;
        frame.classList.remove('hidden');
        drawer.classList.add('hidden'); // Oculta el cajón de minijuegos
        btnBack.classList.remove('hidden'); // Muestra el botón de volver
        console.log("-> Pantalla cambiada con éxito");
    }
}

function closeGame() {
    console.log("-> Cerrando juego y volviendo al menú");
    const drawer = document.getElementById('app-drawer');
    const frame = document.getElementById('game-frame');
    const btnBack = document.getElementById('btn-back');

    if (frame && drawer && btnBack) {
        frame.src = 'about:blank';
        frame.classList.add('hidden');
        drawer.classList.remove('hidden'); // Muestra de nuevo el cajón
        btnBack.classList.add('hidden');
    }
}
