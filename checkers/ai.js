class CheckersAI {  constructor(gameInstance) {
    this.game = gameInstance;
  }


  getBestMove(boardState, aiColor, level) {
    const depthMap = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
    const spanishPenalty = (this.game.variant === 'spanish' && level >= 4) ? 1 : 0; // dames volantes = plus de coups
    const maxDepth = Math.max(2, (depthMap[level] || 4) - spanishPenalty);
    const allMoves = this.game.getAllLegalMoves(aiColor, boardState);
    
    if (allMoves.length === 0) return null;
    if (level === 1 && Math.random() < 0.25) return allMoves[Math.floor(Math.random() * allMoves.length)];


    let bestScore = -Infinity;
    let bestMoves = [];


    for (const move of allMoves) {
      const simulatedBoard = this.cloneBoard(boardState);
      this.applyMoveOnSimulation(simulatedBoard, move);
      const nextTurn = aiColor === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
      const score = this.minimax(simulatedBoard, maxDepth - 1, -Infinity, Infinity, false, nextTurn, aiColor);


      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }


  minimax(boardState, depth, alpha, beta, maximizingPlayer, currentTurn, aiColor) {
    const legalMoves = this.game.getAllLegalMoves(currentTurn, boardState);
    if (depth === 0 || legalMoves.length === 0) return this.evaluateBoard(boardState, aiColor);


    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applyMoveOnSimulation(simulatedBoard, move);
        const nextTurn = currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
        const isMultiJump = move.captured && this.game.getLegalMovesForPiece(move.toR, move.toC, simulatedBoard).some(m => m.captured);
        const nextMaximizing = isMultiJump ? maximizingPlayer : false;
        const evaluation = this.minimax(simulatedBoard, depth - 1, alpha, beta, nextMaximizing, nextTurn, aiColor);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applyMoveOnSimulation(simulatedBoard, move);
        const nextTurn = currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
        const isMultiJump = move.captured && this.game.getLegalMovesForPiece(move.toR, move.toC, simulatedBoard).some(m => m.captured);
        const nextMaximizing = isMultiJump ? maximizingPlayer : true;
        const evaluation = this.minimax(simulatedBoard, depth - 1, alpha, beta, nextMaximizing, nextTurn, aiColor);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }


  evaluateBoard(boardState, aiColor) {
    let score = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = boardState[r][c];
        if (!piece) continue;
        let pieceValue = piece.estDame ? 300 : 100;
        if (!piece.estDame) {
          if (piece.couleur === COLOR_WHITE) pieceValue += (7 - r) * 10;
          else pieceValue += r * 10;
          if (c === 0 || c === 7) pieceValue += 12;
          if (c >= 2 && c <= 5 && r >= 2 && r <= 5) pieceValue += 15;
        }
        score += (piece.couleur === aiColor) ? pieceValue : -pieceValue;
      }
    }
    return score;
  }


  cloneBoard(boardState) {
    return boardState.map(row => row.map(cell => cell ? { couleur: cell.couleur, estDame: cell.estDame } : null));
  }


  applyMoveOnSimulation(boardState, move) {
    const piece = boardState[move.fromR][move.fromC];
    boardState[move.fromR][move.fromC] = null;
    boardState[move.toR][move.toC] = piece;
    if (move.captured) boardState[move.captured.r][move.captured.c] = null;
    
    if (!piece.estDame) {
      if ((piece.couleur === COLOR_WHITE && move.toR === 0) || (piece.couleur === COLOR_BLACK && move.toR === BOARD_SIZE - 1)) {
        piece.estDame = true;
      }
    }
  }
}
