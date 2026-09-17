// =========================================================
// 1. NAVEGACIÓN POR PESTAÑAS (TUS PESTAÑAS DEL SIDEBAR)
// =========================================================
function switchTab(tabId, element) {
    // 1. Limpiar cualquier Hash residual (como #triton o #news/001) si navegamos manualmente
    if (window.location.hash && !window.location.hash.startsWith('#' + tabId)) {
        history.replaceState(null, "", window.location.pathname);
    }

    // 2. Ocultar todas las pestañas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // 3. Quitar la clase active de la barra lateral
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 4. Activar la pestaña seleccionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // 5. Si pasamos el elemento botón, activarlo visualmente
    if (element) {
        element.classList.add('active');
    } else {
        // Si no se pasó elemento (ej: al hacer clic en "Ir al Proyecto"), buscamos el botón del menú
        const navItem = document.querySelector(`.nav-item[onclick*="${tabId}"]`);
        if (navItem) navItem.classList.add('active');
    }

    // 6. Avisarle al cargador dinámico
    if (typeof checkAndLoadModule === 'function') {
        checkAndLoadModule(tabId);
    }
}


// =========================================================
// 2. CAMBIO DE TEMA CLARO / OSCURO (SOL Y LUNA)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Formas vectoriales (SVG) para Sol y Luna
    const sunIcon = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>`;
    const moonIcon = `<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-5.4-5.4c0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/>`;

    // Escuchar el clic en el botón superior derecho
    if (themeBtn && themeIcon) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            themeIcon.innerHTML = isLight ? sunIcon : moonIcon;
        });
    }
});
