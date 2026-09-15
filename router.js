// router.js - Control de navegación SPA mediante Hash (#)

function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');
    
    if (element) {
        element.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.nav-item[onclick*="'${tabId}'"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }

    window.location.hash = tabId;
}

window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
        switchTab(hash, null);
    }
});
