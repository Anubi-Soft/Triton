// Módulos ya cargados en memoria
const loadedModules = {
    games: false,
    news: false
};

// Función descargadora de componentes
function loadModule(tabName, fileUrl, containerId, callback) {
    // Si ya lo descargamos antes, solo ejecutamos el callback para refrescar la vista
    if (loadedModules[tabName]) {
        if (callback) callback();
        return;
    }

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el módulo ${fileUrl}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
                loadedModules[tabName] = true;
                console.log(`[Loader] Módulo '${tabName}' cargado exitosamente.`);
                if (callback) callback();
            }
        })
        .catch(error => {
            console.error('[Loader Error]', error);
        });
}

// Hook llamado desde switchTab
function checkAndLoadModule(tabId) {
    // Si salimos de noticias hacia otra pestaña, limpiamos el hash de la noticia para no trabar el router
    if (tabId !== 'news' && window.location.hash.startsWith('#news/')) {
        history.replaceState(null, "", window.location.pathname);
    }

    if (tabId === 'games') {
        loadModule('games', 'games.html', 'games-container', () => {
            if (typeof resetGame === 'function') {
                resetGame();
            }
        });
    } else if (tabId === 'news') {
        loadModule('news', 'news.html', 'news-container', () => {
            if (typeof renderNews === 'function') {
                renderNews();
            }
        });
    }
}
