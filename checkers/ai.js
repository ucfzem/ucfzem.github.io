class CheckersAI {  constructor(gameInstance) {
    this.game = gameInstance;
  }


  getBestMove(boardState, aiColor, level) {
    const turnMoves = this.getTurnMoves(aiColor, boardState);
    return this.searchWithMoves(boardState, aiColor, level, turnMoves);
  }


  getBestMoveFromList(boardState, aiColor, level, moves) {
    if (!moves || moves.length === 0) return null;
    const sequences = [];
    for (const move of moves) {
      if (!move.captured) {
        sequences.push(this.makeSequence([move]));
        continue;
      }
      const simulatedBoard = this.cloneBoard(boardState);
      this.applyMoveOnSimulation(simulatedBoard, move);
      const crowned = this.justCrowned(boardState, move);
      this.expandCaptureSequences(simulatedBoard, move, [move], sequences, crowned);
    }
    return this.searchWithMoves(boardState, aiColor, level, sequences);
  }


  makeSequence(steps) {
    const last = steps[steps.length - 1];
    return {
      steps: steps.slice(),
      first: steps[0],
      toR: last.toR,
      toC: last.toC,
      captured: steps.some(s => s.captured)
    };
  }


  justCrowned(boardBefore, move) {
    const piece = boardBefore[move.fromR][move.fromC];
    if (!piece || piece.estDame) return false;
    return (piece.couleur === COLOR_WHITE && move.toR === 0) ||
           (piece.couleur === COLOR_BLACK && move.toR === BOARD_SIZE - 1);
  }


  collectCapturedPieces(steps, lastMove) {
    if (lastMove && Array.isArray(lastMove.capturedPieces)) return lastMove.capturedPieces.slice();
    const out = [];
    for (const step of steps) {
      if (step.captured) out.push({ r: step.captured.r, c: step.captured.c });
    }
    return out;
  }


  collectVisitedSquares(steps, lastMove) {
    if (lastMove && Array.isArray(lastMove.visitedSquares) && lastMove.visitedSquares.length) {
      return lastMove.visitedSquares.slice();
    }
    if (steps.length === 0) return [];
    const out = [{ r: steps[0].fromR, c: steps[0].fromC }];
    for (const step of steps) out.push({ r: step.toR, c: step.toC });
    return out;
  }


  getTurnMoves(color, boardState) {
    const baseMoves = this.game.getAllLegalMoves(color, boardState);
    const sequences = [];
    for (const move of baseMoves) {
      if (!move.captured) {
        sequences.push(this.makeSequence([move]));
        continue;
      }
      const simulatedBoard = this.cloneBoard(boardState);
      this.applyMoveOnSimulation(simulatedBoard, move);
      const crowned = this.justCrowned(boardState, move);
      this.expandCaptureSequences(simulatedBoard, move, [move], sequences, crowned);
    }
    return sequences;
  }


  expandCaptureSequences(boardAfter, lastMove, steps, out, crowned) {
    let further = [];
    if (!crowned) {
      const capturedPieces = this.collectCapturedPieces(steps, lastMove);
      const visitedSquares = this.collectVisitedSquares(steps, lastMove);
      further = this.game.getLegalMovesForPiece(lastMove.toR, lastMove.toC, boardAfter, capturedPieces, visitedSquares).filter(m => m.captured);
      if (this.game.variant === 'spanish' && typeof this.game.keepMaxCaptures === 'function' && further.length > 1) {
        further = this.game.keepMaxCaptures(further, boardAfter);
      }
    }
    if (further.length === 0) {
      out.push(this.makeSequence(steps));
      return;
    }
    for (const next of further) {
      const simulatedBoard = this.cloneBoard(boardAfter);
      this.applyMoveOnSimulation(simulatedBoard, next);
      const crownedNext = this.justCrowned(boardAfter, next);
      steps.push(next);
      this.expandCaptureSequences(simulatedBoard, next, steps, out, crownedNext);
      steps.pop();
    }
  }


  applySequence(boardState, sequence) {
    for (const step of sequence.steps) this.applyMoveOnSimulation(boardState, step);
  }


  orderMoves(boardState, moves) {
    return moves.slice().sort((a, b) => {
      const sa = (a.captured ? 1000 : 0) + (a.steps ? a.steps.length * 50 : 0) - Math.abs(3.5 - a.toC);
      const sb = (b.captured ? 1000 : 0) + (b.steps ? b.steps.length * 50 : 0) - Math.abs(3.5 - b.toC);
      return sb - sa;
    });
  }


  searchRoot(boardState, aiColor, depth, moves) {
    let alpha = -Infinity;
    const beta = Infinity;
    const nextTurn = aiColor === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    let bestScore = -Infinity;
    let bestSequences = [];

    for (let i = 0; i < moves.length; i++) {
      if (Date.now() > this.deadline) {
        return { completed: false, sequence: bestSequences[0] || null, score: bestScore };
      }
      const sequence = moves[i];
      const simulatedBoard = this.cloneBoard(boardState);
      this.applySequence(simulatedBoard, sequence);
      const score = this.minimax(simulatedBoard, depth - 1, alpha, beta, false, nextTurn, aiColor);

      if (score > bestScore) {
        bestScore = score;
        bestSequences = [sequence];
      } else if (score === bestScore) {
        bestSequences.push(sequence);
      }
      if (bestScore > alpha) alpha = bestScore;

      if (Date.now() > this.deadline) {
        return { completed: false, sequence: bestSequences[0] || null, score: bestScore };
      }
    }
    return { completed: true, sequence: bestSequences[Math.floor(Math.random() * bestSequences.length)], score: bestScore };
  }


  searchWithMoves(boardState, aiColor, level, allMoves) {
    if (!allMoves || allMoves.length === 0) return null;
    if (level === 1 && Math.random() < 0.5) return allMoves[Math.floor(Math.random() * allMoves.length)].first;

    const depthMap = { 1: 2, 2: 3, 3: 4, 4: 7, 5: 8 };
    const spanishPenalty = (this.game.variant === 'spanish' && level >= 4) ? 1 : 0; // dames volantes = plus de coups
    const maxDepth = Math.max(2, (depthMap[level] || 4) - spanishPenalty);
    const budgetMs = level >= 5 ? 6000 : level === 4 ? 3000 : 1200;
    this.deadline = Date.now() + budgetMs;
    this._diag = { eval: false, quies: false, depthEnd: false };
    console.log("IA - Niveau demandé:", level, "Profondeur calculée:", maxDepth, "Coups:", allMoves.length);
    if (level >= 5) console.log(`IA Expert : réflexion jusqu'à ${maxDepth} coups (budget ${budgetMs} ms max)...`);

    let ordered = this.orderMoves(boardState, allMoves);
    let bestSequence = ordered[0];
    let bestScore = -Infinity;

    for (let depth = 2; depth <= maxDepth; depth++) {
      const result = this.searchRoot(boardState, aiColor, depth, ordered);
      if (result.completed) {
        bestSequence = result.sequence;
        bestScore = result.score;
        ordered = [bestSequence].concat(ordered.filter(m => m !== bestSequence));
      } else {
        break;
      }
      if (Date.now() > this.deadline) break;
    }

    console.log("IA - Meilleur score trouvé:", bestScore, "coup:", JSON.stringify(bestSequence.first));
    return bestSequence.first;
  }


  minimax(boardState, depth, alpha, beta, maximizingPlayer, currentTurn, aiColor) {
    if (this.deadline && Date.now() > this.deadline) return this.evaluateBoard(boardState, aiColor);
    const legalMoves = this.getTurnMoves(currentTurn, boardState);
    if (legalMoves.length === 0) return this.evaluateBoard(boardState, aiColor);
    if (depth === 0) {
      if (this._diag && !this._diag.depthEnd) {
        console.log("Fin de profondeur atteinte, lancement Quiescence");
        this._diag.depthEnd = true;
      }
      return this.quiescenceSearch(boardState, alpha, beta, currentTurn, aiColor, 0);
    }

    const nextTurn = currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applySequence(simulatedBoard, move);
        const evaluation = this.minimax(simulatedBoard, depth - 1, alpha, beta, false, nextTurn, aiColor);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applySequence(simulatedBoard, move);
        const evaluation = this.minimax(simulatedBoard, depth - 1, alpha, beta, true, nextTurn, aiColor);
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

    const legalMoves = this.getTurnMoves(currentTurn, boardState);
    const captures = legalMoves.filter(m => m.captured);
    if (this._diag && !this._diag.quies) {
      console.log("Quiescence - Profondeur:", qDepth, "Captures possibles:", captures.length);
      this._diag.quies = true;
    }
    if (captures.length === 0) return this.evaluateBoard(boardState, aiColor);

    const maximizing = currentTurn === aiColor;
    const nextTurn = currentTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    let best = this.evaluateBoard(boardState, aiColor);

    if (maximizing) {
      if (best >= beta) return best;
      alpha = Math.max(alpha, best);
      for (const move of captures) {
        const simulatedBoard = this.cloneBoard(boardState);
        this.applySequence(simulatedBoard, move);
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
        this.applySequence(simulatedBoard, move);
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
    if (!piece) return;
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
