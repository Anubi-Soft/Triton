// ia-engine.js - Motor con dificultades ajustables

const IAEngine = {
    getBestMove: function(board, aiSymbol, humanSymbol, difficulty) {
        let emptyCells = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') emptyCells.push(i);
        }

        // Nivel FÁCIL: 70% de probabilidad de jugar al azar
        if (difficulty === 'easy') {
            if (Math.random() < 0.7) {
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }

        // Nivel MEDIO: 35% de probabilidad de jugar al azar
        if (difficulty === 'medium') {
            if (Math.random() < 0.35) {
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }

        // Nivel DIFÍCIL (o cuando no falla en Fácil/Medio): Minimax Imbatible
        let bestScore = -Infinity;
        let move = null;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = aiSymbol;
                let score = this.minimax(board, 0, false, aiSymbol, humanSymbol);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    },

    minimax: function(board, depth, isMaximizing, aiSymbol, humanSymbol) {
        let result = this.checkWinner(board, aiSymbol, humanSymbol);
        if (result !== null) return result;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = aiSymbol;
                    let score = this.minimax(board, depth + 1, false, aiSymbol, humanSymbol);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = humanSymbol;
                    let score = this.minimax(board, depth + 1, true, aiSymbol, humanSymbol);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    },

    checkWinner: function(b, ai, human) {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let w of wins) {
            if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]) {
                return b[w[0]] === ai ? 10 : -10;
            }
        }
        if (!b.includes('')) return 0;
        return null;
    }
};
