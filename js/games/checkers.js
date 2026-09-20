// =========================================================
// js/checkers-logic.js - Lógica, Reyes, Capturas y UI Casino
// =========================================================

let board = [];
let selectedPiece = null;
let turn = 'R';        // 'R' = Rojas, 'B' = Negras
let aiColor = 'B';     
let userColor = 'R';   
let isGameActive = true;

// Contadores de fichas capturadas
let capturedRedCount = 0;
let capturedBlackCount = 0;

function initCheckers() {
    board = [
        ['','B','','B','','B','','B'],
        ['B','','B','','B','','B',''],
        ['','B','','B','','B','','B'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['R','','R','','R','','R',''],
        ['','R','','R','','R','','R'],
        ['R','','R','','R','','R','']
    ];
    selectedPiece = null;
    isGameActive = true;
    capturedRedCount = 0;
    capturedBlackCount = 0;

    turn = 'R'; 
    updateCheckersStatus();
    renderBoard();
    updateCapturedUI();
    checkAITurn();
}

function updateCheckersStatus() {
    const statusElem = document.getElementById('game-status');
    if (!statusElem || !isGameActive) return;

    const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";
    const turnName = (turn === userColor) ? playerName : "AnubiBot 🤖";
    const colorName = (turn === 'R') ? "Rojas" : "Negras";
    statusElem.innerText = `Turno de: ${turnName} (${colorName})`;
}

function renderBoard() {
    const boardElem = document.getElementById('checkers-board');
    if (!boardElem) return;
    boardElem.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const isDark = (r + c) % 2 === 1;
            square.className = `square ${isDark ? 'dark' : 'light'}`;
            
            const cellValue = board[r][c];
            if (cellValue !== '') {
                const piece = document.createElement('div');
                const isKing = cellValue.includes('K');
                const baseColor = cellValue.charAt(0).toLowerCase();
                
                piece.className = `piece piece-${baseColor}${isKing ? ' king' : ''}`;
                if (isKing) piece.innerText = '👑';

                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                    piece.classList.add('selected');
                }
                square.appendChild(piece);
            }

            square.onclick = () => handleSquareClick(r, c);
            boardElem.appendChild(square);
        }
    }
}

// Renderiza las pilas laterales de fichas comidas (Efecto Tragaperras)
function updateCapturedUI() {
    const redStack = document.getElementById('captured-red');
    const blackStack = document.getElementById('captured-black');

    if (redStack) {
        redStack.innerHTML = '';
        for (let i = 0; i < capturedRedCount; i++) {
            const p = document.createElement('div');
            p.className = 'captured-piece red';
            redStack.appendChild(p);
        }
    }

    if (blackStack) {
        blackStack.innerHTML = '';
        for (let i = 0; i < capturedBlackCount; i++) {
            const p = document.createElement('div');
            p.className = 'captured-piece black';
            blackStack.appendChild(p);
        }
    }
}

function handleSquareClick(r, c) {
    if (!isGameActive) return;

    const modeElem = document.getElementById('game-mode');
    const isPVE = modeElem && modeElem.value === 'pve';
    if (isPVE && turn === aiColor) return;

    // Seleccionar pieza propia (compara la letra inicial 'R' o 'B')
    if (board[r][c] !== '' && board[r][c].charAt(0) === turn) {
        selectedPiece = { r, c };
        renderBoard();
        return;
    }

    // Mover pieza a casillero vacío
    if (selectedPiece && board[r][c] === '') {
        if (executeMove(selectedPiece.r, selectedPiece.c, r, c)) {
            selectedPiece = null;
            switchTurn();
        }
    }
}

function executeMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const isKing = piece.includes('K');
    const color = piece.charAt(0);

    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);
    
    let isCaptureMove = false;

    if (!isKing) {
        // --- MOVIMIENTO DE PEÓN NORMAL ---
        const validDirection = (color === 'R' && rowDiff === -1) || (color === 'B' && rowDiff === 1);
        if (validDirection && colDiff === 1 && Math.abs(rowDiff) === 1) {
            board[toR][toC] = piece;
            board[fromR][fromC] = '';
            checkKingCoronation(toR, toC);
            return true;
        }

        const validJumpDirection = (color === 'R' && rowDiff === -2) || (color === 'B' && rowDiff === 2);
        if (validJumpDirection && colDiff === 2 && Math.abs(rowDiff) === 2) {
            const midR = (fromR + toR) / 2;
            const midC = (fromC + toC) / 2;
            const midPiece = board[midR][midC];

            if (midPiece !== '' && midPiece.charAt(0) !== color) {
                if (midPiece.charAt(0) === 'R') capturedRedCount++;
                if (midPiece.charAt(0) === 'B') capturedBlackCount++;

                board[toR][toC] = piece;
                board[fromR][fromC] = '';
                board[midR][midC] = '';
                checkKingCoronation(toR, toC);
                updateCapturedUI();
                isCaptureMove = true;
            }
        }
    } else {
        // --- MOVIMIENTO DE REY (Dama Voladora en Diagonales) ---
        if (colDiff !== Math.abs(rowDiff)) return false; // Diagonales
        
        const distance = Math.abs(rowDiff);
        const dirR = Math.sign(toR - fromR);
        const dirC = Math.sign(toC - fromC);
        
        let enemiesInPath = 0;
        let enemyR = -1, enemyC = -1;
        
        for (let i = 1; i < distance; i++) {
            let r = fromR + i * dirR;
            let c = fromC + i * dirC;
            let p = board[r][c];
            
            if (p !== '') {
                if (p.charAt(0) === color) return false; // Bloqueado por ficha propia
                enemiesInPath++;
                enemyR = r;
                enemyC = c;
            }
        }
        
        if (enemiesInPath === 0) {
            board[toR][toC] = piece;
            board[fromR][fromC] = '';
            return true;
        } else if (enemiesInPath === 1) {
            const midPiece = board[enemyR][enemyC];
            if (midPiece.charAt(0) === 'R') capturedRedCount++;
            if (midPiece.charAt(0) === 'B') capturedBlackCount++;
            
            board[toR][toC] = piece;
            board[fromR][fromC] = '';
            board[enemyR][enemyC] = '';
            updateCapturedUI();
            isCaptureMove = true;
        }
    }

    // --- COMPROBAR CAPTURA MÚLTIPLE (Si comió, verificar si puede seguir comiendo) ---
    if (isCaptureMove) {
        const canEatMore = checkMoreCapturesAvailable(toR, toC, color, isKing || board[toR][toC].includes('K'));
        if (canEatMore) {
            // Mantiene la selección en la ficha para que el jugador o la IA sigan comiendo
            selectedPiece = { r: toR, c: toC };
            renderBoard();
            return false; // Retorna false para no cambiar de turno aún
        }
        return true; // No hay más para comer, finaliza el turno
    }

    return false;
}

// Función auxiliar para detectar si hay más fichas para comer desde la nueva posición
function checkMoreCapturesAvailable(r, c, color, isKing) {
    const directions = isKing 
        ? [{r:1,c:1}, {r:1,c:-1}, {r:-1,c:1}, {r:-1,c:-1}]
        : (color === 'R' ? [{r:-2,c:-2}, {r:-2,c:2}] : [{r:2,c:-2}, {r:2,c:2}]);

    if (!isKing) {
        for (let dir of directions) {
            let midR = r + dir.r / 2;
            let midC = c + dir.c / 2;
            let toR = r + dir.r;
            let toC = c + dir.c;

            if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                if (board[toR][toC] === '' && board[midR][midC] !== '' && board[midR][midC].charAt(0) !== color) {
                    return true;
                }
            }
        }
    } else {
        for (let dir of directions) {
            let enemyFound = false;
            for (let i = 1; i < 8; i++) {
                let nr = r + dir.r * i;
                let nc = c + dir.c * i;
                if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;

                let target = board[nr][nc];
                if (target === '') {
                    if (enemyFound) return true; // Encontró enemigo y espacio detrás para aterrizar
                } else if (target.charAt(0) === color) {
                    break;
                } else {
                    if (enemyFound) break;
                    enemyFound = true;
                }
            }
        }
    }
    return false;
}


function checkKingCoronation(r, c) {
    const piece = board[r][c];
    if (piece === 'R' && r === 0) board[r][c] = 'RK';
    if (piece === 'B' && r === 7) board[r][c] = 'BK';
}

function switchTurn() {
    turn = (turn === 'R') ? 'B' : 'R';
    updateCheckersStatus();
    renderBoard();

    if (checkGameOver()) return;
    checkAITurn();
}

function checkAITurn() {
    const modeElem = document.getElementById('game-mode');
    const isPVE = modeElem && modeElem.value === 'pve';

    if (isPVE && turn === aiColor && isGameActive) {
        setTimeout(makeAIMove, 600);
    }
}

// Variable global para habilitar/deshabilitar movimientos rectos (ortogonales)
let allowOrthogonalMoves = false;

function toggleOrthogonalRules(enabled) {
    allowOrthogonalMoves = enabled;
}

// En la función donde el Rey valida sus diagonales:
// Simplemente verificamos si es una diagonal pura O si el checkbox permite movimiento recto (misma fila o misma columna):
function isValidKingDirection(fromR, fromC, toR, toC) {
    const isDiagonal = Math.abs(toR - fromR) === Math.abs(toC - fromC);
    const isOrthogonal = (fromR === toR || fromC === toC);
    
    if (isDiagonal) return true;
    if (allowOrthogonalMoves && isOrthogonal) return true;
    
    return false;
}

// =========================================================
// IA y Búsqueda de Movimientos (Incluye Reyes)
// =========================================================

function makeAIMove() {
    if (!isGameActive || turn !== aiColor) return;

    const allMoves = getAllValidMovesForColor(aiColor);

    if (allMoves.length > 0) {
        const captureMoves = allMoves.filter(m => m.isCapture);
        const selectedMove = captureMoves.length > 0 
            ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
            : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(selectedMove.fromR, selectedMove.fromC, selectedMove.toR, selectedMove.toC);
        switchTurn();
    } else {
        isGameActive = false;
        const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";
        const statusElem = document.getElementById('game-status');
        if (statusElem) statusElem.innerText = `¡Sin movimientos! Ganador: ${playerName}`;
    }
}


function getAllValidMovesForColor(color) {
    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece !== '' && piece.charAt(0) === color) {
                const isKing = piece.includes('K');
                
                if (!isKing) {
                    // --- REGLAS IA PARA PEÓN NORMAL ---
                    const directions = [];
                    if (color === 'B') directions.push({ r: 1, c: -1 }, { r: 1, c: 1 });
                    if (color === 'R') directions.push({ r: -1, c: -1 }, { r: -1, c: 1 });

                    for (let dir of directions) {
                        // Movimiento Simple
                        let nr = r + dir.r, nc = c + dir.c;
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === '') {
                            moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, isCapture: false });
                        }
                        // Captura
                        let capR = r + dir.r * 2, capC = c + dir.c * 2;
                        if (capR >= 0 && capR < 8 && capC >= 0 && capC < 8) {
                            let midPiece = board[nr][nc];
                            if (board[capR][capC] === '' && midPiece !== '' && midPiece.charAt(0) !== color) {
                                moves.push({ fromR: r, fromC: c, toR: capR, toC: capC, isCapture: true });
                            }
                        }
                    }
                } else {
                    // --- REGLAS IA PARA DAMA VOLADORA (REY) ---
                    const directions = [{r:1,c:1}, {r:1,c:-1}, {r:-1,c:1}, {r:-1,c:-1}];
                    
                    for (let dir of directions) {
                        let enemyFound = false;
                        
                        // Escanear la diagonal completa (hasta 7 casilleros)
                        for (let i = 1; i < 8; i++) {
                            let nr = r + dir.r * i;
                            let nc = c + dir.c * i;
                            
                            // Si sale del tablero, frenar en esta dirección
                            if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                            
                            let target = board[nr][nc];
                            
                            if (target === '') {
                                // Casillero vacío: puede moverse o aterrizar tras comer
                                moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, isCapture: enemyFound });
                            } else if (target.charAt(0) === color) {
                                break; // Topó con una pieza aliada, fin de esta diagonal
                            } else {
                                if (enemyFound) break; // Ya encontró un enemigo antes, no puede saltar dos seguidos
                                enemyFound = true;     // Encontró un enemigo para comer
                            }
                        }
                    }
                }
            }
        }
    }
    return moves;
}

// Ejemplo para cuando cambie a modo MSN Messenger:
function setMSNModeActive(isMSN) {
    const checkbox = document.getElementById('allow-orthogonal');
    if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = isMSN; // Queda congelado en reglas estrictas de MSN
        allowOrthogonalMoves = false;
    }
}

// Hooks Framework
window.initCheckers = initCheckers;
window.handleSquareClick = handleSquareClick;

window.onStartAI = function() {
    aiColor = 'R'; userColor = 'B'; initCheckers();
};
window.onStartUser = function() {
    aiColor = 'B'; userColor = 'R'; initCheckers();
};
window.onChangeSide = function(side) {
    if (side === 'X' || side === 'R') window.onStartUser(); else window.onStartAI();
};
window.onToggleSide = function() {
    if (userColor === 'R') window.onStartAI(); else window.onStartUser();
};
window.onResetGame = function() { initCheckers(); };
window.onGameModeChange = function() { initCheckers(); };

function checkGameOver() {
    const pveMode = document.getElementById('game-mode')?.value === 'pve';
    const playerName = (typeof getPlayerName === "function") ? getPlayerName() : "Jugador";

    const redMoves = getAllValidMovesForColor('R');
    const blackMoves = getAllValidMovesForColor('B');

    if (redMoves.length === 0 || blackMoves.length === 0) {
        isGameActive = false;
        const winner = (redMoves.length > 0) ? "Rojas" : "Negras";
        updateStatus(`¡Fin de la partida! Ganador: ${winner}`);
        return true;
    }
    return false;
}

function updateStatus(text) {
    const statusElem = document.getElementById('game-status');
    if (statusElem) statusElem.innerText = text;
}

document.addEventListener("DOMContentLoaded", initCheckers);
