// =========================================================
// js/game-mode-manager.js - Gestor Compartido de Modos
// =========================================================

window.GameModeManager = {
    currentMode: 'pvp-local',
    currentDifficulty: 'easy',

    // Inyecta o renderiza el selector estándar dentro de un contenedor
    renderSelector: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="controls-wrapper" style="margin: 5px 0; display: flex; flex-direction: column; gap: 6px; align-items: center;">
                <div>
                    <label for="game-mode" class="label-sm">Modo: </label>
                    <select id="game-mode" class="select-style" onchange="GameModeManager.handleModeChange(this.value)">
                        <option value="pvp-local">2 Jugadores (Mismo Celular)</option>
                        <option value="pvp-online">2 Jugadores (Online P2P)</option>
                        <option value="pve">vs IA</option>
                    </select>
                </div>

                <div id="difficulty-container" class="hidden" style="display: none;">
                    <label for="game-difficulty" class="label-sm">Dificultad: </label>
                    <select id="game-difficulty" class="select-style" onchange="GameModeManager.handleDifficultyChange(this.value)">
                        <option value="easy">😊 Fácil</option>
                        <option value="medium">😐 Medio</option>
                        <option value="hard">😈 Imbatible</option>
                    </select>
                </div>
            </div>
        `;
    },

    handleModeChange: function(mode) {
        this.currentMode = mode;
        const diffContainer = document.getElementById('difficulty-container');
        
        if (diffContainer) {
            if (mode === 'pve') {
                diffContainer.style.display = 'block';
                diffContainer.classList.remove('hidden');
            } else {
                diffContainer.style.display = 'none';
                diffContainer.classList.add('hidden');
            }
        }

        // Notificar al juego actual si implementó el Hook
        if (typeof window.onGameModeChange === 'function') {
            window.onGameModeChange(this.currentMode, this.currentDifficulty);
        }
    },

    handleDifficultyChange: function(diff) {
        this.currentDifficulty = diff;
        if (typeof window.onGameModeChange === 'function') {
            window.onGameModeChange(this.currentMode, this.currentDifficulty);
        }
    }
};
