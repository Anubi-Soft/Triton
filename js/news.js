// =========================================================
// js/news.js - Módulo de Noticias de AnubiSoft
// =========================================================

const newsData = [
  {
    id: "001",
    icon: "🔱",
    title: "Avance de UI en Tritón",
    date: "16 Septiembre 2026",
    summary: "Primeras capturas del cliente nativo corriendo en Android. Logramos conectar con el servidor Escargot.",
    fullContent: `
      <p>Tras varias semanas de trabajo en el motor de sockets y protocolos MSNP, logramos que la aplicación comunique de forma transparente con el servidor <strong>Escargot</strong>.</p>
      
      <h3>Puntos clave alcanzados:</h3>
      <ul>
        <li>Envío y recepción de Guiños (Nudges) con vibración nativa.</li>
        <li>Notificaciones Push en tiempo real.</li>
        <li>Sincronización de lista de contactos y estados (Conectado, Ausente, Ocupado).</li>
      </ul>

      <div class="news-gallery">
        <div class="media-box mobile-box">
          <img src="assets/img/news/triton_preview.png" alt="Tritón Android UI" loading="lazy">
        </div>
      </div>

      <p>Esperamos lanzar la primera Alfa pública para pruebas internas muy pronto.</p>
    `,
    badge: "Tritón Android",
    githubUrl: "https://github.com/AnubiSoft",
    projectUrl: "triton" // ID exacto de la pestaña de destino
  },
  {
    id: "002",
    icon: "⚙️",
    title: "Configuración sin supervisión",
    date: "16 Septiembre 2026",
    summary: "Instalación de Windows totalmente automatizada con particionamiento de disco y cuentas de usuario.",
    fullContent: `
      <p>Hemos integrado los scripts XML de respuesta automática para instalaciones de Windows 10 y 11 totalmente desatendidas.</p>

      <h3>Características incluidas:</h3>
      <ul>
        <li>Particionamiento automático del disco principal (GPT/UEFI).</li>
        <li>Omisión de requisitos de TPM y Cuenta Microsoft.</li>
        <li>Creación automática del usuario Administrador local.</li>
      </ul>

      <div class="news-gallery">
        <div class="media-box desktop-box">
          <img src="assets/img/news/win_preview.png" alt="Windows Setup Unattended" loading="lazy">
        </div>
      </div>
    `,
    badge: "Windows Mod",
    githubUrl: "https://github.com/AnubiSoft"
  }
];

// Función auxiliar para navegar a otras pestañas de forma segura
function navigateToProjectTab(tabId) {
  // 1. Si tenés disponible la función switchTab globalmente (la de tu sidebar/router)
  if (typeof switchTab === 'function') {
    // Buscamos el elemento de la nav correspondiente para mantener sincronizado el estado activo
    const navItem = document.querySelector(`.nav-item[onclick*="${tabId}"]`);
    switchTab(tabId, navItem || null);
  } else {
    // 2. Fallback de respaldo por Hash
    window.location.hash = tabId;
  }
}

// 1. Renderizar la grilla de tarjetas principales
function renderNewsGrid() {
  const container = document.getElementById('news-grid-container');
  if (!container) return;

  container.innerHTML = '';

  newsData.forEach(item => {
    const cardHtml = `
      <article class="card-tech" onclick="openNewsDetail('${item.id}')">
        <div class="card-tech-badge">${item.badge || 'AnubiSoft'}</div>
        <div class="card-tech-icon">${item.icon}</div>
        <h3 class="card-tech-title">${item.title}</h3>
        <span class="card-tech-date">${item.date}</span>
        <p class="card-tech-body">${item.summary}</p>
        <div class="card-tech-action">
          <span>Leer noticia completa</span>
          <span class="action-arrow">→</span>
        </div>
      </article>
    `;
    container.innerHTML += cardHtml;
  });
}

// 2. Abrir noticia por ID y actualizar la URL hash (#news/001)
function openNewsDetail(newsId) {
  const item = newsData.find(n => n.id === newsId);
  if (!item) return;

  const listView = document.getElementById('news-list-view');
  const detailView = document.getElementById('news-detail-view');
  const articleContainer = document.getElementById('news-article-content');

  // Construir enlaces externos o internos
  let linksHtml = '';
  if (item.githubUrl || item.projectUrl) {
    linksHtml = `<div class="article-links">`;
    if (item.projectUrl) {
      linksHtml += `<button type="button" onclick="navigateToProjectTab('${item.projectUrl}')" class="btn-tech-link" style="border:none; cursor:pointer;">🚀 Ir al Proyecto</button>`;
    }
    if (item.githubUrl) {
      linksHtml += `<a href="${item.githubUrl}" target="_blank" rel="noopener" class="btn-tech-link github">💻 Ver en GitHub</a>`;
    }
    linksHtml += `</div>`;
  }

  // Cargar contenido completo
  if (articleContainer) {
    articleContainer.innerHTML = `
      <header class="article-header">
        <div class="article-meta">
          <span class="article-badge">${item.badge || 'AnubiSoft'}</span>
          <span class="article-date">${item.date}</span>
        </div>
        <h1 class="article-title">${item.icon} ${item.title}</h1>
      </header>
      
      <div class="article-body">
        ${item.fullContent}
      </div>

      ${linksHtml}
    `;
  }

  // Cambiar visibilidad de vistas
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'block';

  // Actualizar hash en la barra de navegador
  window.location.hash = `news/${item.id}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Volver a la grilla general de noticias
function goBackToNewsList() {
  const listView = document.getElementById('news-list-view');
  const detailView = document.getElementById('news-detail-view');

  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  window.location.hash = 'news';
}

// 4. Función principal de arranque que llama loader.js
function renderNews() {
  const listView = document.getElementById('news-list-view');
  const detailView = document.getElementById('news-detail-view');
  const hash = window.location.hash;

  // Si hay un hash específico de noticia (ej: #news/001)
  if (hash.startsWith('#news/')) {
    const newsId = hash.replace('#news/', '');
    openNewsDetail(newsId);
  } else {
    // RESET VISUAL OBLIGATORIO: Asegurar que el listado se vea y el detalle se oculte
    if (detailView) detailView.style.display = 'none';
    if (listView) listView.style.display = 'block';

    // Volver a renderizar la grilla de tarjetas
    renderNewsGrid();
  }
}


// 5. Escuchar cambios de Hash en tiempo real (flechas atrás/adelante del navegador)
window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#news')) {
    renderNews();
  }
});
