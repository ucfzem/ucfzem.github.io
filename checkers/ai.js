class CheckersAI {  constructor(gameInstance) {
    this.game = gameInstance;
  }


  getBestMove(boardState, aiColor, level) {
    const depthMap = { 1: 2, 2: 3, 3: 4, 4: 7, 5: 8 };
    const spanishPenalty = (this.game.variant === 'spanish' && level >= 4) ? 1 : 0; // dames volantes = plus de coups
    const maxDepth = Math.max(2, (depthMap[level] || 4) - spanishPenalty);
    const budgetMs = level >= 5 ? 6000 : level === 4 ? 3000 : 1200;
    this.deadline = Date.now() + budgetMs;
    this._diag = { eval: false, quies: false, depthEnd: false };
    console.log("IA - Niveau demandé:", level, "Profondeur calculée:", depthMap[level] || 4);
    if (level >= 5) console.log(`IA Expert : réflexion jusqu'à ${maxDepth} coups (budget ${budgetMs} ms max)...`);
    const allMoves = this.game.getAllLegalMoves(aiColor, boardState);
    
    if (allMoves.length === 0) return null;
    if (level === 1 && Math.random() < 0.25) return allMoves[Math.floor(Math.random() * allMoves.length)];


    let bestScore = -Infinity;
    let bestMoves = [];
    console.log("IA - Nombre de coups légaux à évaluer:", allMoves.length);


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
    console.log("IA - Meilleur score trouvé:", bestScore, "Nombre de meilleurs coups:", bestMoves.length);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }


  minimax(boardState, depth, alpha, beta, maximizingPlayer, currentTurn, aiColor) {
    if (this.deadline && Date.now() > this.deadline) return this.evaluateBoard(boardState, aiColor);
    const legalMoves = this.game.getAllLegalMoves(currentTurn, boardState);
    if (legalMoves.length === 0) return this.evaluateBoard(boardState, aiColor);
    if (depth === 0) {
      if (this._diag && !this._diag.depthEnd) {
        console.log("Fin de profondeur atteinte, lancement Quiescence");
        this._diag.depthEnd = true;
      }
      return this.quiescenceSearch(boardState, alpha, beta, currentTurn, aiColor, 0);
    }


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

  quiescenceSearch(boardState, alpha, beta, currentTurn, aiColor, qDepth) {
    if (this.deadline && Date.now() > this.deadline) return this.evaluateBoard(boardState, aiColor);
    if (qDepth >= 4) return this.evaluateBoard(boardState, aiColor);

    const legalMoves = this.game.getAllLegalMoves(currentTurn, boardState);
    const captures = legalMoves.filter(m => m.captured);
    if (this._diag && !this._diag.quies) {
      console.log("Quiescence - Profondeur:", qDepth, "Captures possibles:", captures.length);
      this._diag.quies = true;
    }
    if (captures.length === 0) return this.evaluateBoard(boardState, aiColor);

    const maximizing = currentTurn === aiColor;
    let best = this.evaluateBoard(boardState, aiColor);

    if (maximizing) {
      if (best >= beta) return best;
      alpha = Math.max(alpha, best);
      for (const move of captures) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applyMoveOnSimulation(simulatedBoard, move);
        const isMultiJump = this.game.getLegalMovesForPiece(move.toR, move.toC, simulatedBoard).some(m => m.captured);
        const nextTurn = isMultiJump ? currentTurn : (currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE);
        const evaluation = this.quiescenceSearch(simulatedBoard, alpha, beta, nextTurn, aiColor, qDepth + 1);
        best = Math.max(best, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      if (best <= alpha) return best;
      beta = Math.min(beta, best);
      for (const move of captures) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applyMoveOnSimulation(simulatedBoard, move);
        const isMultiJump = this.game.getLegalMovesForPiece(move.toR, move.toC, simulatedBoard).some(m => m.captured);
        const nextTurn = isMultiJump ? currentTurn : (currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE);
        const evaluation = this.quiescenceSearch(simulatedBoard, alpha, beta, nextTurn, aiColor, qDepth + 1);
        best = Math.min(best, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return best;
    }
  }


  evaluateBoard(boardState, aiColor) {
    const opponentColor = aiColor === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    const backRow = { [COLOR_WHITE]: 7, [COLOR_BLACK]: 0 };
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    let score = 0;
    let aiThreatPawn = 0, aiThreatKing = 0, oppThreatPawn = 0, oppThreatKing = 0;

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

          if (r === backRow[piece.couleur]) pieceValue += 10;

          let connected = false;
          for (const [dr, dc] of diagDirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              const neighbor = boardState[nr][nc];
              if (neighbor && neighbor.couleur === piece.couleur) { connected = true; break; }
            }
          }
          if (connected) pieceValue += 5;
        }
        score += (piece.couleur === aiColor) ? pieceValue : -pieceValue;

        const threatenedBy = piece.couleur === aiColor ? opponentColor : aiColor;
        if (this.isThreatened(boardState, r, c, piece, threatenedBy)) {
          if (piece.couleur === aiColor) {
            if (piece.estDame) aiThreatKing++; else aiThreatPawn++;
          } else {
            if (piece.estDame) oppThreatKing++; else oppThreatPawn++;
          }
        }
      }
    }

    score -= aiThreatPawn * 50 + aiThreatKing * 150;
    score += oppThreatPawn * 50 + oppThreatKing * 150;
    let totalPieces = 0;
    for (let rr = 0; rr < BOARD_SIZE; rr++) {
      for (let cc = 0; cc < BOARD_SIZE; cc++) if (boardState[rr][cc]) totalPieces++;
    }
    if (totalPieces === 24 && this._diag && !this._diag.eval) {
      console.log("IA - Évaluation du plateau de départ:", score, "(aiColor:", aiColor + ", pièces: 24)");
      this._diag.eval = true;
    }
    return score;
  }

  isThreatened(boardState, r, c, piece, enemyColor) {
    const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of dirs) {
      const er = r + dr, ec = c + dc;
      if (er < 0 || er >= BOARD_SIZE || ec < 0 || ec >= BOARD_SIZE) continue;
      const enemy = boardState[er][ec];
      if (!enemy || enemy.couleur !== enemyColor) continue;
      const landingR = r - dr, landingC = c - dc;
      if (landingR < 0 || landingR >= BOARD_SIZE || landingC < 0 || landingC >= BOARD_SIZE) continue;
      if (boardState[landingR][landingC]) continue;
      if (enemy.estDame) return true;
      const enemyForward = enemy.couleur === COLOR_WHITE ? -1 : 1;
      if (-dr === enemyForward) return true;
    }
    return false;
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
