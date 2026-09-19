// =========================================================
// js/game-actions.js - Framework Unificado de Acciones IA
// =========================================================

window.GameActions = {
    // Procesa las etiquetas que devuelve AnubiBot desde la API
    processAction: function(actionTag) {
        console.log("[GameActions] Procesando comando:", actionTag);

        switch (actionTag) {
            case 'START_AI':
                this.trigger('onStartAI');
                break;

            case 'START_USER':
                this.trigger('onStartUser');
                break;

            case 'TOGGLE_SIDE':
            case 'CHANGE_SIDE_X':
            case 'CHANGE_SIDE_O':
                this.trigger('onToggleSide', actionTag);
                break;

            case 'RESET':
            case 'RESTART':
                this.trigger('onResetGame');
                break;

            default:
                console.warn("[GameActions] Comando no reconocido:", actionTag);
        }
    },

    // Notifica al script del juego activo si definió la función
    trigger: function(eventName, payload) {
        if (typeof window[eventName] === 'function') {
            window[eventName](payload);
        } else if (eventName === 'onResetGame' && typeof window.resetGame === 'function') {
            // Fallback genérico para reiniciar
            window.resetGame();
        } else {
            console.log(`[GameActions] El juego actual no implementa: ${eventName}`);
        }
    }
};
