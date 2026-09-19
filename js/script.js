// Opciones del módulo
let gamesModuleLoaded = false;

// Manejo de pestañas del Sidebar y Carga Dinámica de Módulos
document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    const moduleFile = button.getAttribute('data-module');

    // Cambiar estado activo en la barra lateral
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Ocultar todas las secciones
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Mostrar la sección seleccionada
    const activeSection = document.getElementById(targetTab);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Si la pestaña tiene un archivo HTML externo y aún no fue cargado:
    if (moduleFile && targetTab === 'games' && !gamesModuleLoaded) {
      loadModule(moduleFile, 'games-module-container', () => {
        gamesModuleLoaded = true;
        initGameLogic(); // Inicializamos los eventos del Ta-Te-Ti y Chat
      });
    }
  });
});

// Función cargadora dinámica (Equivalente a cargar la DLL)
function loadModule(filePath, containerId, callback) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el módulo: ' + filePath);
      return response.text();
    })
    .then(htmlContent => {
      document.getElementById(containerId).innerHTML = htmlContent;
      if (callback) callback();
    })
    .catch(err => console.error('Error cargando el módulo:', err));
}

// Función que arranca el Ta-Te-Ti y el Chat una vez que el HTML fue inyectado
function initGameLogic() {
  // Acá pegás la lógica del Ta-Te-Ti y del Chat que teníamos antes
  // Por ejemplo:
  const board = document.getElementById('board');
  if (board) {
    board.addEventListener('click', (e) => {
      if (e.target.classList.contains('cell')) {
        // Lógica de jugar ficha...
      }
    });
  }
}
