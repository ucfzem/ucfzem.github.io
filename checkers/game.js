const BOARD_SIZE = 8;const COLOR_WHITE = 'blanc';
const COLOR_BLACK = 'noir';


class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('checkers_muted') === 'true';
  }


  init() {
    if (this.muted) return;
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }


  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('checkers_muted', this.muted);
    return this.muted;
  }


  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.08);
  }


  playCapture() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.15);
  }


  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const startTime = this.ctx.currentTime + index * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(startTime); osc.stop(startTime + 0.25);
    });
  }
}


class CheckersGame {
  constructor() {
    this.canvas = document.getElementById('board');
    this.ctx = this.canvas.getContext('2d');
    this.board = [];
    this.turn = COLOR_WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.mustCapture = false;
    this.gameMode = 'ai';
    this.aiLevel = 3;
    this.isGameOver = false;
    this.activeMultiJumpPiece = null;
    this.isAnimating = false;


    // Peer-to-peer multiplayer
    this.peer = null;
    this.peerConnection = null;
    this.myColor = COLOR_WHITE;
    this.isHost = false;
    this.roomCode = null;


    this.soundManager = new SoundManager();
    this.aiEngine = new CheckersAI(this);


    this.scoreWhite = parseInt(localStorage.getItem('checkers_score_white') || '0', 10);
    this.scoreBlack = parseInt(localStorage.getItem('checkers_score_black') || '0', 10);


    // DOM Elements
    this.mainMenu = document.getElementById('mainMenu');
    this.gameScreen = document.getElementById('gameScreen');
    this.menuGameMode = document.getElementById('menuGameMode');
    this.menuAiDifficulty = document.getElementById('menuAiDifficulty');
    this.menuDifficultyGroup = document.getElementById('menuDifficultyGroup');
    this.menuOnlineGroup = document.getElementById('menuOnlineGroup');
    this.menuRoomCode = document.getElementById('menuRoomCode');
    this.menuRoomCodeDisplay = document.getElementById('menuRoomCodeDisplay');
    this.btnStartGame = document.getElementById('btnStartGame');
    this.btnBackToMenu = document.getElementById('btnBackToMenu');
    this.turnIndicator = document.getElementById('turnIndicator');
    this.turnText = document.getElementById('turnText');
    this.gameMessage = document.getElementById('gameMessage');
    this.btnNewGame = document.getElementById('btnNewGame');
    this.btnMute = document.getElementById('btnMute');
    this.btnCreateRoom = document.getElementById('btnCreateRoom');
    this.btnJoinRoom = document.getElementById('btnJoinRoom');


    this.initEvents();
    this.updateMuteButtonUI();
    this.updateScoreDisplay();
  }


  updateScoreDisplay() {
    document.getElementById('scoreWhite').textContent = this.scoreWhite;
    document.getElementById('scoreBlack').textContent = this.scoreBlack;
  }


  addWin(winnerColor) {
    if (winnerColor === COLOR_WHITE) {
      this.scoreWhite++;
      localStorage.setItem('checkers_score_white', this.scoreWhite);
    } else {
      this.scoreBlack++;
      localStorage.setItem('checkers_score_black', this.scoreBlack);
    }
    this.updateScoreDisplay();
  }


  updateMuteButtonUI() {
    if (this.btnMute) {
      if (this.soundManager.muted) {
        this.btnMute.textContent = "🔇 Sons : Coupés";
        this.btnMute.style.opacity = "0.6";
      } else {
        this.btnMute.textContent = "🔊 Sons : Activés";
        this.btnMute.style.opacity = "1";
      }
    }
  }


  initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handlePointerDown(e);
    });


    this.menuGameMode.addEventListener('change', (e) => {
      const mode = e.target.value;
      this.menuDifficultyGroup.style.display = mode === 'ai' ? 'flex' : 'none';
      this.menuOnlineGroup.style.display = mode === 'online' ? 'flex' : 'none';
    });


    this.btnStartGame.addEventListener('click', () => {
      this.gameMode = this.menuGameMode.value;
      this.aiLevel = parseInt(this.menuAiDifficulty.value, 10);
      this.mainMenu.style.display = 'none';
      this.gameScreen.style.display = 'flex';
      this.resetGame();
    });


    this.btnBackToMenu.addEventListener('click', () => {
      this.gameScreen.style.display = 'none';
      this.mainMenu.style.display = 'flex';
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
        this.peerConnection = null;
      }
    });


    this.btnNewGame.addEventListener('click', () => this.resetGame());
    
    this.btnMute.addEventListener('click', () => {
      this.soundManager.toggleMute();
      this.updateMuteButtonUI();
    });

    this.btnCreateRoom.addEventListener('click', () => this.createRoom());
    this.btnJoinRoom.addEventListener('click', () => this.joinRoom());
  }


  createRoom() {
    const code = this.generateRoomCode();
    this.roomCode = code;
    if (this.menuRoomCodeDisplay) {
      this.menuRoomCodeDisplay.textContent = "Code de salon : " + code;
      this.menuRoomCodeDisplay.style.display = 'block';
    }

    this.peer = new Peer(code);
    this.setupPeerEvents();
    this.isHost = true;
    this.myColor = COLOR_WHITE;
    this.gameMessage.textContent = "En attente d'un adversaire (code : " + code + ")...";
  }


  joinRoom() {
    const code = this.menuRoomCode.value.trim().toUpperCase();
    if (!code || code.length < 3) {
      this.gameMessage.textContent = "Code de salon invalide";
      return;
    }
    this.roomCode = code;
    this.peer = new Peer();
    this.setupPeerEvents();
    this.isHost = false;
    this.myColor = COLOR_BLACK;

    this.peerConnection = this.peer.connect(code);
    this.setupConnectionEvents(this.peerConnection);
  }


  setupPeerEvents() {
    this.peer.on('open', (id) => {
      console.log('Peer ID:', id);
      if (this.isHost) {
        this.gameMessage.textContent = "En attente d'un adversaire (code : " + this.roomCode + ")...";
      }
    });

    this.peer.on('connection', (conn) => {
      if (this.peerConnection) {
        conn.close();
        return;
      }
      this.peerConnection = conn;
      this.setupConnectionEvents(conn);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.gameMessage.textContent = "Erreur de connexion PeerJS";
    });

    this.peer.on('disconnected', () => {
      this.gameMessage.textContent = "Adversaire déconnecté";
    });

    this.peer.on('close', () => {
      this.peer = null;
    });
  }


  setupConnectionEvents(conn) {
    conn.on('open', () => {
      console.log('Connected to peer');
      this.gameMessage.textContent = "Partie connectée !";
      if (!this.isHost) {
        this.myColor = COLOR_BLACK;
      }
    });

    conn.on('data', (data) => {
      if (data.type === 'move') {
        this.handleRemoteMove(data.move);
      }
    });

    conn.on('close', () => {
      this.gameMessage.textContent = "Connexion fermée";
      this.peerConnection = null;
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }


  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }


  resetGame() {
    this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    this.turn = COLOR_WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.mustCapture = false;
    this.isGameOver = false;
    this.activeMultiJumpPiece = null;
    this.isAnimating = false;


    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if ((r + c) % 2 === 1) this.board[r][c] = { couleur: COLOR_BLACK, estDame: false };
      }
    }
    for (let r = 5; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if ((r + c) % 2 === 1) this.board[r][c] = { couleur: COLOR_WHITE, estDame: false };
      }
    }


    this.updateTurnUI();
    this.checkMandatoryCaptures();
    this.render();
    if (this.gameMessage) this.gameMessage.textContent = "Partie démarrée. À vous de jouer !";
  }


  updateTurnUI() {
    const dot = this.turnIndicator.querySelector('.turn-dot');
    if (this.turn === COLOR_WHITE) {
      dot.className = 'turn-dot white-dot';
      this.turnText.textContent = "Tour des Blancs";
    } else {
      dot.className = 'turn-dot black-dot';
      this.turnText.textContent = "Tour des Noirs";
    }
  }


  render() {
    const tileSize = this.canvas.width / BOARD_SIZE;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        this.ctx.fillStyle = ((r + c) % 2 === 1) ? '#3b2314' : '#f5e6d3';
        this.ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        if (this.selectedPiece && this.selectedPiece.r === r && this.selectedPiece.c === c) {
          this.ctx.fillStyle = 'rgba(234, 179, 8, 0.6)';
          this.ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        }
      }
    }
    for (const move of this.validMoves) {
      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(move.toC * tileSize + tileSize / 2, move.toR * tileSize + tileSize / 2, tileSize * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.board[r][c]) this.drawPiece(r, c, this.board[r][c], tileSize);
      }
    }
  }


  drawPiece(r, c, piece, tileSize) {
    const centerX = c * tileSize + tileSize / 2;
    const centerY = r * tileSize + tileSize / 2;
    const radius = tileSize * 0.38;


    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(centerX + 2, centerY + 4, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fill();


    const gradient = this.ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, centerX, centerY, radius);
    if (piece.couleur === COLOR_WHITE) {
      gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.8, '#e2e8f0'); gradient.addColorStop(1, '#cbd5e1');
    } else {
      gradient.addColorStop(0, '#4b5563'); gradient.addColorStop(0.7, '#1f2937'); gradient.addColorStop(1, '#111827');
    }


    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = piece.couleur === COLOR_WHITE ? '#94a3b8' : '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();


    if (piece.estDame) {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = `bold ${tileSize * 0.4}px sans-serif`;
      this.ctx.fillText('👑', centerX, centerY + 2);
    }
    this.ctx.restore();
  }


  handlePointerDown(e) {
    if (this.isGameOver || this.isAnimating) return;
    if (this.gameMode === 'ai' && this.turn === COLOR_BLACK) return;


    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;


    // Coordonnées du clic ramenées à l'échelle interne du canvas
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;


    this.processClick(x, y);
  }


  processClick(x, y) {
    const tileSize = this.canvas.width / BOARD_SIZE;
    const c = Math.floor(x / tileSize);
    const r = Math.floor(y / tileSize);
    console.log(`Clic reçu: X=${Math.round(x)}, Y=${Math.round(y)} | Case: Ligne ${r}, Colonne ${c}`);
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;


    if (this.activeMultiJumpPiece && (this.activeMultiJumpPiece.r !== r || this.activeMultiJumpPiece.c !== c)) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(move);
      return;
    }


    const clickedPiece = this.board[r][c];
    if (clickedPiece && clickedPiece.couleur === this.turn) {
      const moves = this.getLegalMovesForPiece(r, c, this.board);
      if (this.mustCapture) {
        const captureMoves = moves.filter(m => m.captured);
        if (captureMoves.length > 0) {
          this.selectedPiece = { r, c }; this.validMoves = captureMoves;
        } else {
          this.gameMessage.textContent = "Capture obligatoire !";
        }
      } else {
        this.selectedPiece = { r, c }; this.validMoves = moves;
      }
      this.render();
      return;
    }


    if (this.selectedPiece) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(move);
      else if (!this.activeMultiJumpPiece) {
        this.selectedPiece = null; this.validMoves = []; this.render();
      }
    }
  }


  executeMove(move) {
    this.isAnimating = true;
    const piece = this.board[move.fromR][move.fromC];
    this.board[move.fromR][move.fromC] = null;


    if (move.captured) this.soundManager.playCapture();
    else this.soundManager.playMove();


    const tileSize = this.canvas.width / BOARD_SIZE;
    const startX = move.fromC * tileSize + tileSize / 2;
    const startY = move.fromR * tileSize + tileSize / 2;
    const endX = move.toC * tileSize + tileSize / 2;
    const endY = move.toR * tileSize + tileSize / 2;
    const duration = 220;
    const startTime = performance.now();


    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress);
      this.render();
      
      const currentX = startX + (endX - startX) * easeProgress;
      const currentY = startY + (endY - startY) * easeProgress;
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(currentX + 2, currentY + 4, tileSize * 0.38, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fill();
      const gradient = this.ctx.createRadialGradient(currentX - tileSize*0.1, currentY - tileSize*0.1, tileSize*0.04, currentX, currentY, tileSize*0.38);
      if (piece.couleur === COLOR_WHITE) { gradient.addColorStop(0,'#fff'); gradient.addColorStop(0.8,'#e2e8f0'); gradient.addColorStop(1,'#cbd5e1'); }
      else { gradient.addColorStop(0,'#4b5563'); gradient.addColorStop(0.7,'#1f2937'); gradient.addColorStop(1,'#111827'); }
      this.ctx.beginPath(); this.ctx.arc(currentX, currentY, tileSize*0.38, 0, Math.PI*2);
      this.ctx.fillStyle = gradient; this.ctx.fill();
      this.ctx.strokeStyle = piece.couleur === COLOR_WHITE ? '#94a3b8' : '#000000'; this.ctx.lineWidth = 2; this.ctx.stroke();
      this.ctx.restore();


      if (progress < 1) requestAnimationFrame(animate);
      else {
        this.board[move.toR][move.toC] = piece;
        this.isAnimating = false;
        this.finalizeMove(move, piece);
      }
    };
    requestAnimationFrame(animate);
  }


  finalizeMove(move, piece) {
    if (move.captured) this.board[move.captured.r][move.captured.c] = null;


    let newlyCrowned = false;
    if (!piece.estDame) {
      if ((piece.couleur === COLOR_WHITE && move.toR === 0) || (piece.couleur === COLOR_BLACK && move.toR === BOARD_SIZE - 1)) {
        piece.estDame = true; newlyCrowned = true;
      }
    }


    if (move.captured && !newlyCrowned) {
      const furtherCaptures = this.getLegalMovesForPiece(move.toR, move.toC, this.board).filter(m => m.captured);
      if (furtherCaptures.length > 0) {
        this.selectedPiece = { r: move.toR, c: move.toC };
        this.validMoves = furtherCaptures;
        this.activeMultiJumpPiece = { r: move.toR, c: move.toC };
        this.mustCapture = true;
        this.gameMessage.textContent = "Rafle en cours ! Continuez à capturer.";
        this.render();
        if (this.gameMode === 'ai' && this.turn === COLOR_BLACK) setTimeout(() => this.triggerAIMove(), 500);
        return;
      }
    }


    this.activeMultiJumpPiece = null; this.selectedPiece = null; this.validMoves = [];
    this.switchTurn(move);
  }


  switchTurn(move) {
    this.turn = this.turn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    this.updateTurnUI(); this.checkMandatoryCaptures(); this.render();
    if (this.checkGameOver()) return;
    
    if (this.gameMode === 'ai' && this.turn === COLOR_BLACK) {
      this.gameMessage.textContent = "Réflexion de l'IA...";
      setTimeout(() => this.triggerAIMove(), 400);
    }
    
    if (this.gameMode === 'online' && this.peerConnection && move) {
      try {
        this.peerConnection.send({ type: 'move', move: move });
      } catch (err) {
        console.error('Send error:', err);
      }
    }
  }


  handleRemoteMove(move) {
    this.isAnimating = true;
    const piece = this.board[move.fromR][move.fromC];
    this.board[move.fromR][move.fromC] = null;

    const tileSize = this.canvas.width / BOARD_SIZE;
    const startX = move.fromC * tileSize + tileSize / 2;
    const startY = move.fromR * tileSize + tileSize / 2;
    const endX = move.toC * tileSize + tileSize / 2;
    const endY = move.toR * tileSize + tileSize / 2;
    const duration = 220;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress);
      this.render();
      
      const currentX = startX + (endX - startX) * easeProgress;
      const currentY = startY + (endY - startY) * easeProgress;
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(currentX + 2, currentY + 4, tileSize * 0.38, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fill();
      const gradient = this.ctx.createRadialGradient(currentX - tileSize*0.1, currentY - tileSize*0.1, tileSize*0.04, currentX, currentY, tileSize*0.38);
      if (piece.couleur === COLOR_WHITE) { gradient.addColorStop(0,'#fff'); gradient.addColorStop(0.8,'#e2e8f0'); gradient.addColorStop(1,'#cbd5e1'); }
      else { gradient.addColorStop(0,'#4b5563'); gradient.addColorStop(0.7,'#1f2937'); gradient.addColorStop(1,'#111827'); }
      this.ctx.beginPath(); this.ctx.arc(currentX, currentY, tileSize*0.38, 0, Math.PI*2);
      this.ctx.fillStyle = gradient; this.ctx.fill();
      this.ctx.strokeStyle = piece.couleur === COLOR_WHITE ? '#94a3b8' : '#000000'; this.ctx.lineWidth = 2; this.ctx.stroke();
      this.ctx.restore();

      if (progress < 1) requestAnimationFrame(animate);
      else {
        this.board[move.toR][move.toC] = piece;
        this.isAnimating = false;
        this.finalizeRemoteMove(move, piece);
      }
    };
    requestAnimationFrame(animate);
  }


  finalizeRemoteMove(move, piece) {
    if (move.captured) this.board[move.captured.r][move.captured.c] = null;

    let newlyCrowned = false;
    if (!piece.estDame) {
      if ((piece.couleur === COLOR_WHITE && move.toR === 0) || (piece.couleur === COLOR_BLACK && move.toR === BOARD_SIZE - 1)) {
        piece.estDame = true; newlyCrowned = true;
      }
    }

    if (move.captured && !newlyCrowned) {
      const furtherCaptures = this.getLegalMovesForPiece(move.toR, move.toC, this.board).filter(m => m.captured);
      if (furtherCaptures.length > 0) {
        this.selectedPiece = { r: move.toR, c: move.toC };
        this.validMoves = furtherCaptures;
        this.activeMultiJumpPiece = { r: move.toR, c: move.toC };
        this.mustCapture = true;
        this.gameMessage.textContent = "Rafle en cours ! Continuez à capturer.";
        this.render();
        return;
      }
    }

    this.activeMultiJumpPiece = null; this.selectedPiece = null; this.validMoves = [];
    this.switchTurn();
  }


  checkMandatoryCaptures() {
    this.mustCapture = this.getAllLegalMoves(this.turn, this.board).some(m => m.captured);
    if (this.gameMode === 'pvp') {
      this.gameMessage.textContent = this.mustCapture ? "Capture obligatoire !" : "Sélectionnez une pièce.";
    }
    if (this.gameMode === 'online') {
      this.gameMessage.textContent = this.mustCapture ? "Capture obligatoire !" : "Tour de " + (this.turn === this.myColor ? "vous" : "l'adversaire");
    }
  }


  getLegalMovesForPiece(r, c, boardState) {
    const piece = boardState[r][c];
    if (!piece) return [];
    const moves = [];
    const directions = piece.estDame ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.couleur === COLOR_WHITE ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);


    for (const [dr, dc] of directions) {
      const nextR = r + dr, nextC = c + dc;
      if (this.isValidSquare(nextR, nextC) && !boardState[nextR][nextC]) {
        moves.push({ fromR: r, fromC: c, toR: nextR, toC: nextC, captured: null });
      }
      const jumpR = r + 2 * dr, jumpC = c + 2 * dc;
      if (this.isValidSquare(jumpR, jumpC)) {
        const midPiece = boardState[nextR][nextC];
        if (midPiece && midPiece.couleur !== piece.couleur && !boardState[jumpR][jumpC]) {
          moves.push({ fromR: r, fromC: c, toR: jumpR, toC: jumpC, captured: { r: nextR, c: nextC } });
        }
      }
    }
    return moves;
  }


  getAllLegalMoves(color, boardState) {
    let allMoves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (boardState[r][c] && boardState[r][c].couleur === color) {
          allMoves = allMoves.concat(this.getLegalMovesForPiece(r, c, boardState));
        }
      }
    }
    const captures = allMoves.filter(m => m.captured);
    return captures.length > 0 ? captures : allMoves;
  }


  isValidSquare(r, c) { return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE; }


  checkGameOver() {
    if (this.getAllLegalMoves(this.turn, this.board).length === 0) {
      this.isGameOver = true;
      const winner = this.turn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
      this.addWin(winner);
      this.soundManager.playVictory();
      this.gameMessage.textContent = `Victoire ! ${winner === COLOR_WHITE ? "Les Blancs gagnent !" : "Les Noirs gagnent !"}`;
      return true;
    }
    return false;
  }


  triggerAIMove() {
    if (this.isGameOver) return;
    if (this.activeMultiJumpPiece) {
      const move = this.validMoves[Math.floor(Math.random() * this.validMoves.length)];
      if (move) this.executeMove(move);
      return;
    }
    const bestMove = this.aiEngine.getBestMove(this.board, this.turn, this.aiLevel);
    if (bestMove) this.executeMove(bestMove);
    else this.checkGameOver();
  }
}


window.addEventListener('DOMContentLoaded', () => { window.gameInstance = new CheckersGame(); });
