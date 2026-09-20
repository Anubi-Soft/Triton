// =========================================================
// js/game-actions.js - Framework Unificado de Acciones IA
// =========================================================

window.GameActions = {
    processAction: function(actionTag) {
        console.log("[GameActions] Procesando comando:", actionTag);

        // Si el juego está en modo local o P2P y llega una acción de IA, lo cambia a vs IA
        if (typeof window.switchToPVE === 'function') {
            window.switchToPVE();
        }

        switch (actionTag) {
            case 'SWITCH_AI':
            case 'START_AI':
                this.trigger('onStartAI');
                break;

            case 'START_USER':
                this.trigger('onStartUser');
                break;

            case 'CHANGE_SIDE_X':
                this.trigger('onChangeSide', 'X');
                break;

            case 'CHANGE_SIDE_O':
                this.trigger('onChangeSide', 'O');
                break;

            case 'TOGGLE_SIDE':
                this.trigger('onToggleSide');
                break;

            case 'RESET':
            case 'RESTART':
                this.trigger('onResetGame');
                break;

            default:
                console.warn("[GameActions] Comando no reconocido:", actionTag);
        }
    },

    trigger: function(eventName, payload) {
        if (typeof window[eventName] === 'function') {
            window[eventName](payload);
        } else if (eventName === 'onResetGame' && typeof window.resetGame === 'function') {
            window.resetGame();
        } else {
            console.log(`[GameActions] El juego actual no implementa: ${eventName}`);
        }
    }
};
