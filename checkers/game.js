const BOARD_SIZE = 8;
const COLOR_WHITE = 'blanc';
const COLOR_BLACK = 'noir';

// white / black = [reflet, milieu, bord, contour]
const THEMES = {
  wood: {
    name: 'Bois', light: '#f1dfae', dark: '#b4572a',
    hl: 'rgba(255, 230, 90, 0.55)', mv: 'rgba(255, 240, 170, 0.9)',
    white: ['#fff7df', '#f2dca8', '#dcbb7c', '#a98544'],
    black: ['#f59a58', '#d96a22', '#b24a12', '#6b2a08'],
    frame: ['#d19a52', '#8a5524'], pat: ['#e5461e', '#d63c14'], chalk: ['#2a6a24', '#143c12'],
    page: { bg: '#c4361a', card: '#3b1d0e', card2: '#5a2f17', accent: '#2e9e3f', accentHover: '#238a33' }
  },
  classic: {
    name: 'Classique', light: '#f5e6d3', dark: '#3b2314',
    hl: 'rgba(234, 179, 8, 0.6)', mv: 'rgba(34, 197, 94, 0.6)',
    white: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    black: ['#4b5563', '#1f2937', '#111827', '#000000'],
    frame: ['#7a5a3c', '#3f2b19'], pat: ['#1e293b', '#18222f'], chalk: ['#1e293b', '#0f172a'],
    page: { bg: '#0f172a', card: '#1e293b', card2: '#334155', accent: '#2563eb', accentHover: '#1d4ed8' }
  },
  ocean: {
    name: 'Océan', light: '#dbeafe', dark: '#1d4ed8',
    hl: 'rgba(251, 146, 60, 0.65)', mv: 'rgba(250, 204, 21, 0.85)',
    white: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    black: ['#475569', '#1e293b', '#0f172a', '#020617'],
    frame: ['#3b82f6', '#1e3a8a'], pat: ['#17408a', '#133677'], chalk: ['#1d4f91', '#0f2f5e'],
    page: { bg: '#0b2a5c', card: '#0f2347', card2: '#1d3a6b', accent: '#0ea5e9', accentHover: '#0284c7' }
  },
  forest: {
    name: 'Forêt', light: '#eef0d5', dark: '#4d7c3a',
    hl: 'rgba(234, 88, 12, 0.55)', mv: 'rgba(250, 204, 21, 0.9)',
    white: ['#fffdf5', '#f1ead2', '#d9cfa8', '#a89b6a'],
    black: ['#52525b', '#27272a', '#18181b', '#000000'],
    frame: ['#8a6b3a', '#4a3a1c'], pat: ['#1f6b3a', '#1a5c32'], chalk: ['#2d6a2a', '#16401a'],
    page: { bg: '#1a5c32', card: '#15281c', card2: '#24402d', accent: '#16a34a', accentHover: '#15803d' }
  },
  royal: {
    name: 'Royal', light: '#ede9fe', dark: '#6d28d9',
    hl: 'rgba(244, 114, 182, 0.65)', mv: 'rgba(250, 204, 21, 0.9)',
    white: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    black: ['#52525b', '#27272a', '#18181b', '#000000'],
    frame: ['#8b5cf6', '#4c1d95'], pat: ['#4c2a9a', '#43238a'], chalk: ['#4c1d95', '#2e1065'],
    page: { bg: '#43238a', card: '#211645', card2: '#372a6b', accent: '#8b5cf6', accentHover: '#7c3aed' }
  },
  ruby: {
    name: 'Rubis', light: '#fbeaea', dark: '#8f1d1d',
    hl: 'rgba(250, 204, 21, 0.7)', mv: 'rgba(255, 255, 255, 0.8)',
    white: ['#ffffff', '#f1f5f9', '#cbd5e1', '#94a3b8'],
    black: ['#4b5563', '#1f2937', '#111827', '#000000'],
    frame: ['#b91c1c', '#6b0f0f'], pat: ['#b3261e', '#a02019'], chalk: ['#7f1d1d', '#450a0a'],
    page: { bg: '#a02019', card: '#2b1316', card2: '#47222a', accent: '#dc2626', accentHover: '#b91c1c' }
  },
  slate: {
    name: 'Ardoise', light: '#e7e5e4', dark: '#44403c',
    hl: 'rgba(245, 158, 11, 0.65)', mv: 'rgba(250, 204, 21, 0.9)',
    white: ['#ffffff', '#f5f5f4', '#d6d3d1', '#a8a29e'],
    black: ['#57534e', '#292524', '#1c1917', '#000000'],
    frame: ['#78716c', '#292524'], pat: ['#3b3633', '#34302d'], chalk: ['#44403c', '#1c1917'],
    page: { bg: '#34302d', card: '#1c1917', card2: '#292524', accent: '#f59e0b', accentHover: '#d97706' }
  }
};

const LEVEL_NAMES = ['Débutant', 'Facile', 'Moyen', 'Difficile', 'Expert'];

function avatarSvg(kind) {
  if (kind === 'bot') {
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#475569"/>' +
      '<rect y="42" width="64" height="22" fill="#334155"/><line x1="32" y1="8" x2="32" y2="16" stroke="#e2e8f0" stroke-width="3"/>' +
      '<circle cx="32" cy="8" r="3.5" fill="#f59e0b"/><rect x="13" y="15" width="38" height="30" rx="9" fill="#cbd5e1"/>' +
      '<circle cx="24" cy="30" r="5" fill="#0ea5e9"/><circle cx="40" cy="30" r="5" fill="#0ea5e9"/>' +
      '<rect x="23" y="38" width="18" height="3" rx="1.5" fill="#64748b"/><rect x="22" y="47" width="20" height="8" rx="3" fill="#94a3b8"/></svg>';
  }
  const shirt = kind === 'p2' ? '#2563eb' : '#15803d';
  const hair = kind === 'p2' ? '#7c4a21' : '#1f2937';
  const skin = kind === 'p2' ? '#e0ac86' : '#f1c9a0';
  return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#94a3b8"/>' +
    `<path d="M8 64c2-15 12-21 24-21s22 6 24 21z" fill="${shirt}"/>` +
    `<rect x="27" y="36" width="10" height="9" rx="3" fill="${skin}"/><circle cx="32" cy="26" r="12" fill="${skin}"/>` +
    `<path d="M20 26c0-10 5-14 12-14s12 4 12 14c-3-6-7-8-12-8s-9 2-12 8z" fill="${hair}"/></svg>`;
}


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
    this.variant = localStorage.getItem('checkers_variant') === 'spanish' ? 'spanish' : 'american';
    this.themeKey = 'classic';
    this.theme = THEMES.wood;
    this.lastMove = null;
    this.history = [];
    this.boardCache = null;
    this.coins = parseInt(localStorage.getItem('checkers_coins') || '0', 10);
    this.introTimer = null;
    this.resultTimer = null;


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
    this.menuVariant = document.getElementById('menuVariant');
    this.variantBadge = document.getElementById('variantBadge');
    if (this.menuVariant) this.menuVariant.value = this.variant;

    this.bannerTitle = document.getElementById('bannerTitle');
    this.btnMenu = document.getElementById('btnMenu');
    this.btnUndo = document.getElementById('btnUndo');
    this.btnResume = document.getElementById('btnResume');
    this.menuSheet = document.getElementById('menuSheet');
    this.coinCount = document.getElementById('coinCount');
    this.introOverlay = document.getElementById('introOverlay');
    this.resultModal = document.getElementById('resultModal');
    if (this.coinCount) this.coinCount.textContent = this.coins;

    this.buildThemePickers();
    const savedTheme = localStorage.getItem('checkers_theme');
    this.setTheme(THEMES[savedTheme] ? savedTheme : 'wood');


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
      this.variant = this.menuVariant.value === 'spanish' ? 'spanish' : 'american';
      localStorage.setItem('checkers_variant', this.variant);
      this.mainMenu.style.display = 'none';
      this.gameScreen.style.display = 'flex';
      this.resizeCanvas();
      this.resetGame();
      this.sendConfig();
      this.showIntro();
    });


    this.btnBackToMenu.addEventListener('click', () => {
      this.closeSheet();
      this.hideOverlays();
      this.gameScreen.style.display = 'none';
      this.mainMenu.style.display = 'flex';
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
        this.peerConnection = null;
      }
    });


    this.btnNewGame.addEventListener('click', () => {
      this.closeSheet();
      this.hideOverlays();
      this.resetGame();
    });

    this.btnMenu.addEventListener('click', () => this.menuSheet.classList.add('open'));
    this.btnResume.addEventListener('click', () => this.closeSheet());
    this.menuSheet.addEventListener('click', (e) => { if (e.target === this.menuSheet) this.closeSheet(); });
    this.btnUndo.addEventListener('click', () => this.undo());
    this.introOverlay.addEventListener('click', () => this.hideOverlays());
    this.resultModal.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="again"]')) { this.hideOverlays(); this.resetGame(); }
      else if (e.target.closest('[data-act="menu"]')) { this.btnBackToMenu.click(); }
    });
    window.addEventListener('resize', () => this.resizeCanvas());

    
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
      if (this.isHost) this.sendConfig();
    });

    conn.on('data', (data) => {
      if (data.type === 'move') {
        this.handleRemoteMove(data.move);
      } else if (data.type === 'config') {
        this.applyRemoteConfig(data);
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
    this.lastMove = null;
    this.boardCache = null;
    clearTimeout(this.resultTimer);


    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.isDarkSquare(r, c)) this.board[r][c] = { couleur: COLOR_BLACK, estDame: false };
      }
    }
    for (let r = 5; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.isDarkSquare(r, c)) this.board[r][c] = { couleur: COLOR_WHITE, estDame: false };
      }
    }


    this.updateVariantBadge();
    this.updatePlayers();
    this.history = [this.snapshot()];
    this.updateTurnUI();
    this.checkMandatoryCaptures();
    this.render();
    if (this.gameMessage) this.gameMessage.textContent = "Partie démarrée. À vous de jouer !";
  }


  updateTurnUI() {
    const w = document.getElementById('playerWhite');
    const b = document.getElementById('playerBlack');
    if (w) w.classList.toggle('active', !this.isGameOver && this.turn === COLOR_WHITE);
    if (b) b.classList.toggle('active', !this.isGameOver && this.turn === COLOR_BLACK);
    this.updateUndoState();
  }


  isDarkSquare(r, c) {
    // Américaines : case sombre en bas à gauche. Espagnoles : plateau inversé (sombre en bas à droite).
    return this.variant === 'spanish' ? (r + c) % 2 === 0 : (r + c) % 2 === 1;
  }


  buildThemePickers() {
    document.querySelectorAll('[data-theme-picker]').forEach((box) => {
      box.innerHTML = '';
      Object.entries(THEMES).forEach(([key, t]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'theme-swatch';
        b.dataset.theme = key;
        b.title = t.name;
        b.setAttribute('aria-label', 'Thème ' + t.name);
        b.style.background = `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)`;
        b.addEventListener('click', () => this.setTheme(key));
        box.appendChild(b);
      });
    });
  }


  setTheme(key) {
    if (!THEMES[key]) key = 'wood';
    this.themeKey = key;
    this.theme = THEMES[key];
    localStorage.setItem('checkers_theme', key);

    const t = this.theme, p = t.page;
    const root = document.documentElement.style;
    root.setProperty('--bg-primary', p.bg);
    root.setProperty('--bg-secondary', p.card);
    root.setProperty('--bg-card', p.card2);
    root.setProperty('--accent-color', p.accent);
    root.setProperty('--accent-hover', p.accentHover);
    root.setProperty('--board-light', t.light);
    root.setProperty('--board-dark', t.dark);
    root.setProperty('--piece-white', t.white[0]);
    root.setProperty('--piece-black', t.black[1]);
    root.setProperty('--pat-1', t.pat[0]);
    root.setProperty('--pat-2', t.pat[1]);
    root.setProperty('--chalk-1', t.chalk[0]);
    root.setProperty('--chalk-2', t.chalk[1]);
    root.setProperty('--frame-1', t.frame[0]);
    root.setProperty('--frame-2', t.frame[1]);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', p.card);

    document.querySelectorAll('.theme-swatch').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === key);
    });
    this.boardCache = null;
    this.render();
  }


  variantName() {
    return this.variant === 'spanish' ? 'Dames espagnoles' : 'Dames américaines';
  }


  updateVariantBadge() {
    if (!this.variantBadge) return;
    this.variantBadge.textContent = this.variant === 'spanish'
      ? "Dames espagnoles · dames volantes · prise maximale"
      : "Dames américaines";
  }


  modeLabel() {
    if (this.gameMode === 'ai') return LEVEL_NAMES[(this.aiLevel || 3) - 1];
    if (this.gameMode === 'online') return 'En ligne';
    return 'Deux joueurs';
  }


  playerInfo() {
    if (this.gameMode === 'ai') return { white: 'Vous', black: 'IA · ' + LEVEL_NAMES[(this.aiLevel || 3) - 1], wk: 'p1', bk: 'bot' };
    if (this.gameMode === 'online') {
      return {
        white: this.myColor === COLOR_WHITE ? 'Vous' : 'Adversaire',
        black: this.myColor === COLOR_BLACK ? 'Vous' : 'Adversaire',
        wk: 'p1', bk: 'p2'
      };
    }
    return { white: 'Joueur 1', black: 'Joueur 2', wk: 'p1', bk: 'p2' };
  }


  updatePlayers() {
    const info = this.playerInfo();
    const set = (id, html, text) => { const el = document.getElementById(id); if (el) { if (html !== null) el.innerHTML = html; else el.textContent = text; } };
    set('avatarWhite', avatarSvg(info.wk));
    set('avatarBlack', avatarSvg(info.bk));
    set('nameWhite', null, info.white);
    set('nameBlack', null, info.black);
    if (this.bannerTitle) this.bannerTitle.textContent = this.modeLabel();
  }


  playerPanel(color) {
    const info = this.playerInfo();
    const white = color === COLOR_WHITE;
    return `<div class="intro-player"><div class="avatar">${avatarSvg(white ? info.wk : info.bk)}</div>` +
      `<div class="pname">${white ? info.white : info.black}</div>` +
      `<div class="pscore">🏆 ${white ? this.scoreWhite : this.scoreBlack}</div></div>`;
  }


  piecesDecor() {
    return '<div class="intro-pieces"><span class="hp hp-cream"></span><span class="hp hp-copper"></span><span class="hp hp-cream small"></span></div>';
  }


  showIntro() {
    if (!this.introOverlay) return;
    this.introOverlay.innerHTML = `<div class="intro-card">${this.piecesDecor()}` +
      `<div class="intro-title gold-text">${this.modeLabel()}</div>` +
      `<div class="intro-vs">${this.playerPanel(COLOR_WHITE)}<div class="vs-small">VS</div>${this.playerPanel(COLOR_BLACK)}</div>` +
      `<div class="intro-sub">${this.variantName()}</div></div>`;
    this.introOverlay.style.display = 'flex';
    clearTimeout(this.introTimer);
    this.introTimer = setTimeout(() => this.hideOverlays(), 1800);
  }


  showResult(winner, reward) {
    if (!this.resultModal) return;
    const mine = this.gameMode === 'ai' ? winner === COLOR_WHITE
      : this.gameMode === 'online' ? winner === this.myColor : null;
    const title = mine === true ? 'Victoire !' : mine === false ? 'Défaite'
      : (winner === COLOR_WHITE ? 'Les Blancs gagnent !' : 'Les Noirs gagnent !');
    this.resultModal.innerHTML = `<div class="result-card">${this.piecesDecor()}` +
      `<div class="intro-title gold-text">${title}</div>` +
      `<div class="intro-vs">${this.playerPanel(COLOR_WHITE)}<div class="vs-small">VS</div>${this.playerPanel(COLOR_BLACK)}</div>` +
      (reward > 0 ? `<div class="reward">+${reward} 👑</div>` : '') +
      `<div class="result-actions"><button class="btn btn-play" data-act="again">Rejouer</button>` +
      `<button class="btn btn-secondary" data-act="menu">Menu principal</button></div></div>`;
    this.resultModal.style.display = 'flex';
  }


  hideOverlays() {
    clearTimeout(this.introTimer);
    clearTimeout(this.resultTimer);
    if (this.introOverlay) this.introOverlay.style.display = 'none';
    if (this.resultModal) this.resultModal.style.display = 'none';
  }


  closeSheet() {
    if (this.menuSheet) this.menuSheet.classList.remove('open');
  }


  addCoins(n) {
    this.coins += n;
    localStorage.setItem('checkers_coins', this.coins);
    if (this.coinCount) {
      this.coinCount.textContent = this.coins;
      const box = this.coinCount.parentElement;
      box.classList.remove('pulse');
      void box.offsetWidth;
      box.classList.add('pulse');
    }
  }


  vibrate(pattern) {
    try {
      if (!this.soundManager.muted && navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* non supporté */ }
  }


  // --- Historique / annulation ---
  snapshot() {
    return { board: this.cloneBoard(this.board), turn: this.turn, lastMove: this.lastMove };
  }


  canUndo() {
    if (this.gameMode === 'online' || this.isGameOver || this.isAnimating) return false;
    if (this.gameMode === 'ai') return this.turn === COLOR_WHITE && this.history.length >= 3;
    return this.history.length >= 2;
  }


  updateUndoState() {
    if (this.btnUndo) this.btnUndo.disabled = !this.canUndo();
  }


  undo() {
    if (!this.canUndo()) return;
    const steps = this.gameMode === 'ai' ? 2 : 1;
    for (let i = 0; i < steps; i++) this.history.pop();
    const s = this.history[this.history.length - 1];
    this.board = this.cloneBoard(s.board);
    this.turn = s.turn;
    this.lastMove = s.lastMove;
    this.selectedPiece = null;
    this.validMoves = [];
    this.activeMultiJumpPiece = null;
    this.updateTurnUI();
    this.checkMandatoryCaptures();
    this.render();
    this.gameMessage.textContent = "Coup annulé. À vous de jouer !";
  }


  // --- Online ---
  sendConfig() {
    if (this.gameMode === 'online' && this.isHost && this.peerConnection && this.peerConnection.open) {
      try { this.peerConnection.send({ type: 'config', variant: this.variant }); } catch (err) { console.error('Send error:', err); }
    }
  }


  applyRemoteConfig(data) {
    const variant = data.variant === 'spanish' ? 'spanish' : 'american';
    if (variant === this.variant) return;
    this.variant = variant;
    if (this.menuVariant) this.menuVariant.value = variant;
    if (this.gameScreen.style.display !== 'none') this.resetGame();
  }


  // --- Dessin ---
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let size = Math.round((rect.width * dpr) / BOARD_SIZE) * BOARD_SIZE;
    size = Math.max(320, Math.min(1200, size));
    if (size === this.canvas.width) return;
    this.canvas.width = size;
    this.canvas.height = size;
    this.boardCache = null;
    this.render();
  }


  shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const target = amt < 0 ? 0 : 255, p = Math.abs(amt);
    const mix = (v) => Math.round((target - v) * p + v);
    return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
  }


  buildBoardCache() {
    const size = this.canvas.width, tile = size / BOARD_SIZE;
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    const x = cv.getContext('2d');
    const t = this.theme;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const px = c * tile, py = r * tile;
        const base = this.isDarkSquare(r, c) ? t.dark : t.light;
        const grad = x.createLinearGradient(px, py, px + tile, py + tile);
        grad.addColorStop(0, this.shade(base, 0.08));
        grad.addColorStop(1, this.shade(base, -0.08));
        x.fillStyle = grad;
        x.fillRect(px, py, tile, tile);

        // Veines du bois (aléatoire déterministe par case)
        let seed = (r * 8 + c + 1) * 9301 + 49297;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        x.save();
        x.beginPath(); x.rect(px, py, tile, tile); x.clip();
        for (let i = 0; i < 14; i++) {
          const y = py + rnd() * tile;
          x.strokeStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
          x.lineWidth = 1 + rnd() * tile * 0.025;
          x.beginPath();
          x.moveTo(px, y);
          x.bezierCurveTo(px + tile * 0.3, y + (rnd() - 0.5) * tile * 0.1, px + tile * 0.7, y + (rnd() - 0.5) * tile * 0.1, px + tile, y + (rnd() - 0.5) * tile * 0.06);
          x.stroke();
        }
        x.restore();
        x.strokeStyle = 'rgba(0,0,0,0.14)';
        x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, tile - 1, tile - 1);
      }
    }
    this.boardCache = cv;
  }


  render() {
    if (!this.board.length) return;
    const t = this.theme;
    const tileSize = this.canvas.width / BOARD_SIZE;
    if (!this.boardCache || this.boardCache.width !== this.canvas.width) this.buildBoardCache();
    this.ctx.drawImage(this.boardCache, 0, 0);

    if (this.lastMove) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      for (const [r, c] of [[this.lastMove.fromR, this.lastMove.fromC], [this.lastMove.toR, this.lastMove.toC]]) {
        this.ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
    if (this.selectedPiece) {
      this.ctx.fillStyle = t.hl;
      this.ctx.fillRect(this.selectedPiece.c * tileSize, this.selectedPiece.r * tileSize, tileSize, tileSize);
    }
    for (const move of this.validMoves) {
      const cx = move.toC * tileSize + tileSize / 2, cy = move.toR * tileSize + tileSize / 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, tileSize * 0.17, 0, Math.PI * 2);
      this.ctx.fillStyle = t.mv;
      this.ctx.fill();
      this.ctx.lineWidth = Math.max(1.5, tileSize * 0.025);
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      this.ctx.stroke();
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.board[r][c]) this.drawPiece(r, c, this.board[r][c], tileSize);
      }
    }
  }


  drawPiece(r, c, piece, tileSize) {
    const lifted = this.selectedPiece && this.selectedPiece.r === r && this.selectedPiece.c === c;
    this.drawPieceAt(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2 - (lifted ? tileSize * 0.04 : 0), piece, tileSize, { glow: lifted });
  }


  drawPieceAt(cx, cy, piece, tile, opts = {}) {
    const ctx = this.ctx, R = tile * 0.4;
    const s = piece.couleur === COLOR_WHITE ? this.theme.white : this.theme.black;
    ctx.save();

    // ombre portée + tranche du pion
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = tile * 0.1;
    ctx.shadowOffsetY = tile * 0.06;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = s[3]; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2);
    ctx.fillStyle = s[2]; ctx.fill();

    // dessus bombé
    const top = cy - R * 0.03;
    const grad = ctx.createRadialGradient(cx - R * 0.35, top - R * 0.4, R * 0.05, cx, top, R * 0.95);
    grad.addColorStop(0, s[0]); grad.addColorStop(0.65, s[1]); grad.addColorStop(1, s[2]);
    ctx.beginPath(); ctx.arc(cx, top, R * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();

    // anneaux concentriques (ombre + reflet)
    const lw = Math.max(1.5, tile * 0.028);
    for (const k of [0.7, 0.48, 0.26]) {
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.arc(cx, top, R * k, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - lw * 0.4, top - lw * 0.5, R * k, Math.PI * 0.9, Math.PI * 1.7);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.stroke();
    }

    if (opts.glow) {
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
      ctx.lineWidth = tile * 0.05;
      ctx.strokeStyle = 'rgba(255, 230, 90, 0.95)'; ctx.stroke();
    }

    if (piece.estDame) {
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${tile * 0.38}px sans-serif`;
      ctx.fillText('👑', cx, top + 2);
    }
    ctx.restore();
  }


  handlePointerDown(e) {
    console.log("CLIC DETECTE");
    if (this.isGameOver || this.isAnimating) return;
    if (this.gameMode === 'ai' && this.turn === COLOR_BLACK) return;
    if (this.gameMode === 'online' && this.peerConnection && this.turn !== this.myColor) return;


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


    // Rafle en cours : seul un des coups proposés est possible
    if (this.activeMultiJumpPiece) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(move);
      return;
    }


    const clickedPiece = this.board[r][c];
    if (clickedPiece && clickedPiece.couleur === this.turn) {
      // Coups autorisés par les règles (capture obligatoire, prise maximale en espagnol)
      const allowed = this.getAllLegalMoves(this.turn, this.board);
      const moves = this.getLegalMovesForPiece(r, c, this.board).filter(m => allowed.some(a => this.sameMove(a, m)));
      if (moves.length === 0 && this.mustCapture) {
        this.gameMessage.textContent = this.variant === 'spanish'
          ? "Capture obligatoire : prenez le maximum de pièces !"
          : "Capture obligatoire !";
      } else {
        this.selectedPiece = { r, c }; this.validMoves = moves;
      }
      this.render();
      return;
    }


    if (this.selectedPiece) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(move);
      else { this.selectedPiece = null; this.validMoves = []; this.render(); }
    }
  }


  executeMove(move) {
    this.isAnimating = true;
    const piece = this.board[move.fromR][move.fromC];
    this.board[move.fromR][move.fromC] = null;

    if (move.captured) this.soundManager.playCapture();
    else this.soundManager.playMove();
    this.vibrate(move.captured ? 30 : 12);
    this.lastMove = { fromR: move.fromR, fromC: move.fromC, toR: move.toR, toC: move.toC };


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
      
      this.drawPieceAt(currentX, currentY, piece, tileSize);


      if (progress < 1) requestAnimationFrame(animate);
      else {
        this.board[move.toR][move.toC] = piece;
        clearTimeout(safetyTimeout);
        this.isAnimating = false;
        this.finalizeMove(move, piece);
      }
    };


    requestAnimationFrame(animate);

    // Filet de sécurité : si l'animation ne se termine pas dans les 500ms, forcer le reset
    const safetyTimeout = setTimeout(() => {
      this.isAnimating = false;
    }, 500);
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
      const furtherCaptures = this.keepMaxCaptures(this.getLegalMovesForPiece(move.toR, move.toC, this.board).filter(m => m.captured), this.board);
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
    // Envoi du coup à l'adversaire AVANT le test de fin de partie (sinon le dernier coup est perdu)
    if (this.gameMode === 'online' && this.peerConnection && move) {
      try {
        this.peerConnection.send({ type: 'move', move: move });
      } catch (err) {
        console.error('Send error:', err);
      }
    }

    this.turn = this.turn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    this.history.push(this.snapshot());
    this.updateTurnUI(); this.checkMandatoryCaptures(); this.render();
    if (this.checkGameOver()) return;

    if (this.gameMode === 'ai' && this.turn === COLOR_BLACK) {
      this.gameMessage.textContent = "Réflexion de l'IA...";
      setTimeout(() => this.triggerAIMove(), 400);
    }
  }


  handleRemoteMove(move) {
    this.isAnimating = true;
    this.lastMove = { fromR: move.fromR, fromC: move.fromC, toR: move.toR, toC: move.toC };
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
      
      this.drawPieceAt(currentX, currentY, piece, tileSize);

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
      const furtherCaptures = this.keepMaxCaptures(this.getLegalMovesForPiece(move.toR, move.toC, this.board).filter(m => m.captured), this.board);
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
    const flying = this.variant === 'spanish' && piece.estDame;


    for (const [dr, dc] of directions) {
      if (flying) {
        // Dame volante : glisse sur toute la diagonale, capture à distance
        let nr = r + dr, nc = c + dc;
        while (this.isValidSquare(nr, nc) && !boardState[nr][nc]) {
          moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, captured: null });
          nr += dr; nc += dc;
        }
        if (this.isValidSquare(nr, nc) && boardState[nr][nc].couleur !== piece.couleur) {
          let lr = nr + dr, lc = nc + dc;
          while (this.isValidSquare(lr, lc) && !boardState[lr][lc]) {
            moves.push({ fromR: r, fromC: c, toR: lr, toC: lc, captured: { r: nr, c: nc } });
            lr += dr; lc += dc;
          }
        }
        continue;
      }


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
    return captures.length > 0 ? this.keepMaxCaptures(captures, boardState) : allMoves;
  }


  sameMove(a, b) {
    return a.fromR === b.fromR && a.fromC === b.fromC && a.toR === b.toR && a.toC === b.toC;
  }


  // --- Prise maximale (dames espagnoles) ---
  keepMaxCaptures(captures, boardState) {
    if (this.variant !== 'spanish' || captures.length < 2) return captures;
    const scored = captures.map(m => ({ m, n: this.sequenceLength(m, boardState) }));
    const best = Math.max(...scored.map(s => s.n));
    return scored.filter(s => s.n === best).map(s => s.m);
  }


  sequenceLength(move, boardState) {
    const b = this.cloneBoard(boardState);
    const crowned = this.applySimulatedMove(b, move);
    return 1 + (crowned ? 0 : this.chainAfter(b, move.toR, move.toC));
  }


  chainAfter(boardState, r, c) {
    let best = 0;
    for (const m of this.getLegalMovesForPiece(r, c, boardState)) {
      if (!m.captured) continue;
      const b = this.cloneBoard(boardState);
      const crowned = this.applySimulatedMove(b, m);
      const n = 1 + (crowned ? 0 : this.chainAfter(b, m.toR, m.toC));
      if (n > best) best = n;
    }
    return best;
  }


  cloneBoard(boardState) {
    return boardState.map(row => row.map(cell => cell ? { couleur: cell.couleur, estDame: cell.estDame } : null));
  }


  applySimulatedMove(boardState, move) {
    const piece = boardState[move.fromR][move.fromC];
    boardState[move.fromR][move.fromC] = null;
    boardState[move.toR][move.toC] = piece;
    if (move.captured) boardState[move.captured.r][move.captured.c] = null;
    if (!piece.estDame && ((piece.couleur === COLOR_WHITE && move.toR === 0) || (piece.couleur === COLOR_BLACK && move.toR === BOARD_SIZE - 1))) {
      piece.estDame = true;
      return true;
    }
    return false;
  }


  isValidSquare(r, c) { return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE; }


  checkGameOver() {
    if (this.isGameOver) return true;
    if (this.getAllLegalMoves(this.turn, this.board).length === 0) {
      this.isGameOver = true;
      const winner = this.turn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
      this.addWin(winner);
      const reward = (this.gameMode === 'ai' && winner === COLOR_WHITE) ? this.aiLevel * 10 : 0;
      if (reward) this.addCoins(reward);
      this.soundManager.playVictory();
      this.vibrate([40, 60, 40]);
      this.gameMessage.textContent = `Victoire ! ${winner === COLOR_WHITE ? "Les Blancs gagnent !" : "Les Noirs gagnent !"}`;
      this.updateTurnUI();
      clearTimeout(this.resultTimer);
      this.resultTimer = setTimeout(() => this.showResult(winner, reward), 900);
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
