# Session Backup — 500 Prompts IA + Chat Socket.io

**Date:** June 27, 2026

---

## Project 1: 500 Prompts IA

**Repo:** https://github.com/ucfzem/pack500Prompts  
**Cloudflare:** https://500-prompts-ia.pages.dev  
**Vercel:** https://500-prompts-ia-ucfzem-s-projects.vercel.app

### What we did:
1. Translated all 500 prompts to EN, SP, AR (French default)
2. Added multilingual support (FR/EN/SP/AR) with language switcher
3. RTL layout fix for Arabic
4. Copy button hidden when card collapsed
5. Theme button made smaller
6. Aligned prompt numbers with fixed min-width
7. Changed body font from Outfit → Manrope
8. Changed heading font from Playfair Display → Manrope
9. Ensured Latin text in Arabic mode uses Manrope
10. Added cache-busting for font loading

### Tech stack:
- Single `index.html` (inline CSS/JS)
- Google Fonts (Manrope + Noto Naskh Arabic)
- Dark/Light theme toggle
- Deployed to: Cloudflare Pages + Vercel + GitHub

---

## Project 2: Chat Socket.io

**Repo:** https://github.com/ucfzem/ucfzem.github.io/tree/main/chat-socketio  
**Cloudflare (static UI):** https://chat-socketio.pages.dev  
**Render (real-time server):** https://ucfzem-github-io.onrender.com  
**Vercel:** https://chat-socketio-ucfzem-s-projects.vercel.app

### Features (v2):
1. **Rooms/Channels** — Général, Gaming, Random, Tech
2. **Emoji Reactions** — 👍😂❤️🔥👀 on any message
3. **Typing Indicator** — "X est en train d'écrire..."
4. **Sound Notifications** — beep on new message, mute toggle
5. **User Avatars** — emoji picker on login (100+ emojis)
6. **Private Messaging** — click username → DM modal
7. **Online Status** — green dot (active), yellow dot (away)
8. **Dark Mode** — toggle button, saves to localStorage

### Files:
```
chat-socketio/
├── README.md
├── package.json
├── server.js
└── public/
    ├── index.html
    └── client.js
```

### Tech stack:
- Express.js server
- Socket.io for real-time WebSocket communication
- Bootstrap 5 + Bootstrap Icons
- Node.js

---

## Tokens used:
- All tokens are in a separate secure file (not in repo)

---

## To make it an APK:
Use **Capacitor** (Ionic):
```bash
npm install @capacitor/core @capacitor/cli
npx cap init ChatSocketio com.ucfzem.chat --web-dir public
npx cap add android
npx cap sync
npx cap open android
```
Opens Android Studio → Build → Generate APK.

---

## Next steps:
- [ ] Test all 8 features live
- [ ] Make APK with Capacitor
- [ ] Add more rooms/categories
- [ ] Add file/image sharing
- [ ] Deploy to Play Store
