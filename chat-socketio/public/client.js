const socket = io();
let currentUsername = '';
let currentColor = '';
let currentAvatar = '';
let currentRoom = 'Général';
let currentDM = '';
let typingTimeout = null;
let soundEnabled = localStorage.getItem('chatSoundEnabled') !== 'false';
let deferredPrompt = null;

const loginOverlay = document.getElementById('loginOverlay');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const messagesArea = document.getElementById('messagesArea');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const usersList = document.getElementById('usersList');
const userCount = document.getElementById('userCount');
const typingIndicator = document.getElementById('typingIndicator');
const roomTabs = document.getElementById('roomTabs');
const soundToggle = document.getElementById('soundToggle');
const dmModal = document.getElementById('dmModal');
const dmMessages = document.getElementById('dmMessages');
const dmInput = document.getElementById('dmInput');
const dmForm = document.getElementById('dmForm');
const dmTitle = document.getElementById('dmTitle');
const emojiPicker = document.getElementById('emojiPicker');
const darkToggle = document.getElementById('darkToggle');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const installClose = document.getElementById('installClose');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

// === INSTALL PROMPT ===
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('chatInstallDismissed')) {
    installBanner.classList.add('show');
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    deferredPrompt = null;
    installBanner.classList.remove('show');
  });
}

if (installClose) {
  installClose.addEventListener('click', () => {
    installBanner.classList.remove('show');
    localStorage.setItem('chatInstallDismissed', 'true');
  });
}

window.addEventListener('appinstalled', () => {
  installBanner.classList.remove('show');
  deferredPrompt = null;
});

// === SIDEBAR TOGGLE ===
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarBackdrop.classList.toggle('show');
  });
}
if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('show');
  });
}

// === DARK MODE ===
if (localStorage.getItem('chatDarkMode') === 'true') {
  document.documentElement.setAttribute('data-theme', 'dark');
}
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
    localStorage.setItem('chatDarkMode', !isDark);
  });
}

// === SOUND ===
if (soundToggle) {
  soundToggle.innerHTML = soundEnabled ? '<i class="bi bi-volume-up"></i>' : '<i class="bi bi-volume-mute"></i>';
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('chatSoundEnabled', soundEnabled);
    soundToggle.innerHTML = soundEnabled ? '<i class="bi bi-volume-up"></i>' : '<i class="bi bi-volume-mute"></i>';
  });
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'message' ? 800 : 600;
    gain.gain.value = type === 'message' ? 0.1 : 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

// === EMOJI PICKER ===
const emojiList = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','💀','👻','👽','🤖','💩','🔥','⭐','💎','🎮','🎯','🎲','🎸','🎤','🎧','📱','💻','🖥️','⌚','📷','🔑','❤️','🧡','💛','💚','💙','💜','🖤','💯','✨','🎉','🎊'];

let selectedAvatar = emojiList[Math.floor(Math.random() * emojiList.length)];

if (emojiPicker) {
  emojiList.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      selectedAvatar = emoji;
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    emojiPicker.appendChild(btn);
  });
  const firstBtn = emojiPicker.querySelector('button');
  if (firstBtn) firstBtn.classList.add('selected');
}

// === JOIN CHAT ===
function joinChat() {
  const username = usernameInput.value.trim();
  if (username) {
    currentUsername = username;
    socket.emit('set username', { username, avatar: selectedAvatar });
    loginOverlay.style.display = 'none';
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') joinChat(); });

// === MESSAGE FORM ===
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', { message });
    socket.emit('stop typing');
    messageInput.value = '';
  }
});

// === TYPING ===
messageInput.addEventListener('input', () => {
  socket.emit('typing');
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit('stop typing'), 2000);
});

// === ACTIVITY ===
document.addEventListener('click', () => socket.emit('activity'));
document.addEventListener('keypress', () => socket.emit('activity'));

// === CHAT MESSAGE ===
socket.on('chat message', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${data.isOwn ? 'message-own' : 'message-other'}`;
  messageDiv.setAttribute('data-id', data.id);

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (!data.isOwn) {
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `<span class="msg-avatar">${data.avatar}</span><span class="msg-username" style="color:${data.color}">${data.username}</span>`;
    bubble.appendChild(header);
  }

  const text = document.createElement('div');
  text.className = 'message-text';
  text.textContent = data.message;
  bubble.appendChild(text);

  const footer = document.createElement('div');
  footer.className = 'message-footer';
  const time = document.createElement('span');
  time.className = 'timestamp';
  time.textContent = data.timestamp;
  footer.appendChild(time);

  const reactionsDiv = document.createElement('div');
  reactionsDiv.className = 'reactions';
  ['👍','😂','❤️','🔥','👀'].forEach(emoji => {
    const rBtn = document.createElement('button');
    rBtn.className = 'reaction-btn';
    rBtn.textContent = emoji;
    rBtn.addEventListener('click', () => {
      const existing = reactionsDiv.querySelector(`[data-emoji="${emoji}"]`);
      if (existing) {
        const count = parseInt(existing.getAttribute('data-count')) + 1;
        existing.setAttribute('data-count', count);
        existing.innerHTML = `${emoji} ${count}`;
      } else {
        const span = document.createElement('span');
        span.className = 'reaction-badge';
        span.setAttribute('data-emoji', emoji);
        span.setAttribute('data-count', '1');
        span.textContent = `${emoji} 1`;
        reactionsDiv.appendChild(span);
      }
    });
    footer.appendChild(rBtn);
  });
  footer.appendChild(reactionsDiv);
  bubble.appendChild(footer);
  messageDiv.appendChild(bubble);
  messagesArea.appendChild(messageDiv);
  messagesArea.scrollTop = messagesArea.scrollHeight;

  if (!data.isOwn) playSound('message');
});

// === SYSTEM MESSAGE ===
socket.on('system message', (data) => {
  const div = document.createElement('div');
  div.className = 'system-message';
  div.innerHTML = `<i class="bi bi-info-circle"></i> ${data.message}`;
  messagesArea.appendChild(div);
  messagesArea.scrollTop = messagesArea.scrollHeight;
});

// === USER JOINED ===
socket.on('user joined', (data) => {
  currentColor = data.color;
  currentAvatar = data.avatar;

  const div = document.createElement('div');
  div.className = 'system-message';
  div.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i> ${data.message}`;
  messagesArea.appendChild(div);

  if (roomTabs && data.rooms) {
    roomTabs.innerHTML = '';
    data.rooms.forEach(room => {
      const tab = document.createElement('button');
      tab.className = `room-tab ${room === currentRoom ? 'active' : ''}`;
      tab.textContent = room;
      tab.addEventListener('click', () => switchRoom(room));
      roomTabs.appendChild(tab);
    });
  }

  playSound('join');
});

// === ROOM JOINED ===
socket.on('room joined', (data) => {
  currentRoom = data.room;
  messagesArea.innerHTML = '';
  document.querySelectorAll('.room-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent === currentRoom);
  });
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
});

// === UPDATE USERS ===
socket.on('update users', (data) => {
  if (data.room !== currentRoom) return;
  usersList.innerHTML = '';
  userCount.textContent = `${data.users.length} utilisateur${data.users.length > 1 ? 's' : ''}`;
  data.users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.addEventListener('click', () => openDM(user.username));

    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.style.backgroundColor = user.color;
    avatar.textContent = user.avatar || user.username.charAt(0).toUpperCase();

    const statusDot = document.createElement('span');
    statusDot.className = `status-dot status-${user.status}`;
    avatar.appendChild(statusDot);

    const name = document.createElement('span');
    name.className = 'user-name';
    name.textContent = user.username;
    if (user.username === currentUsername) {
      name.innerHTML += ' <span class="badge bg-primary" style="font-size:0.6rem">Vous</span>';
    }

    div.appendChild(avatar);
    div.appendChild(name);
    usersList.appendChild(div);
  });
});

// === STATUS UPDATE ===
socket.on('status update', (users) => {
  document.querySelectorAll('.user-item').forEach(item => {
    const name = item.querySelector('.user-name')?.textContent?.replace('Vous', '').trim();
    const user = users.find(u => u.username === name);
    if (user) {
      const dot = item.querySelector('.status-dot');
      if (dot) dot.className = `status-dot status-${user.status}`;
    }
  });
});

// === TYPING ===
socket.on('user typing', (data) => {
  if (data.room === currentRoom) {
    typingIndicator.textContent = `${data.avatar} ${data.username} est en train d'écrire...`;
    typingIndicator.style.display = 'block';
  }
});

socket.on('user stop typing', (data) => {
  if (data.room === currentRoom) {
    typingIndicator.style.display = 'none';
  }
});

// === PRIVATE MESSAGES ===
function openDM(username) {
  if (username === currentUsername) return;
  currentDM = username;
  dmTitle.textContent = `DM avec ${username}`;
  dmMessages.innerHTML = '';
  dmModal.style.display = 'flex';
  dmInput.focus();
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
}

if (dmModal) {
  document.getElementById('dmClose').addEventListener('click', () => {
    dmModal.style.display = 'none';
    currentDM = '';
  });

  dmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = dmInput.value.trim();
    if (message && currentDM) {
      socket.emit('private message', { to: currentDM, message });
      dmInput.value = '';
    }
  });
}

socket.on('private message', (data) => {
  if (!dmModal) return;
  const div = document.createElement('div');
  div.className = `dm-message ${data.isOwn ? 'dm-own' : 'dm-other'}`;
  const sender = data.isOwn ? 'Vous' : data.from;
  const avatar = data.isOwn ? currentAvatar : data.fromAvatar;
  div.innerHTML = `<span class="dm-avatar">${avatar}</span><div><strong>${sender}</strong><br>${data.message}<br><small class="timestamp">${data.timestamp}</small></div>`;
  dmMessages.appendChild(div);
  dmMessages.scrollTop = dmMessages.scrollHeight;
  playSound('message');
});

// === ROOM SWITCHING ===
function switchRoom(room) {
  if (room === currentRoom) return;
  socket.emit('join room', room);
}

// === CONNECT ERROR ===
socket.on('connect_error', () => {
  alert('Erreur de connexion au serveur. Veuillez réessayer.');
});