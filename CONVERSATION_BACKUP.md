# Conversation Backup — 2026-06-27

## Projects Worked On

### 1. 500 Prompts IA
- **GitHub:** https://github.com/ucfzem/500-prompts-ia
- **GitHub Pages:** https://ucfzem.github.io/500-prompts-ia/
- **Cloudflare:** https://500-prompts-ia.pages.dev
- **Vercel:** https://500-prompts-ia.vercel.app
- **Features:** 500 prompts, 4 languages (FR/EN/SP/AR), RTL Arabic, dark/light theme
- **Fonts:** Manrope (body + headings), Cinzel (ornaments)
- **Changes made:** Font Outfit→Manrope, Playfair Display→Manrope, aligned prompt numbers, fixed Arabic Latin fonts, cache-busting

### 2. Chat Socket.io
- **GitHub:** https://github.com/ucfzem/chat-socketio
- **GitHub Pages:** https://ucfzem.github.io/chat-socketio/
- **Cloudflare:** https://chat-socketio.pages.dev
- **Vercel:** https://chat-socketio.vercel.app
- **Render (real-time):** https://ucfzem-github-io.onrender.com
- **Features:** 8 features — rooms/channels, emoji reactions, typing indicator, sound notifications, user avatars, private messaging, online status, dark mode
- **PWA:** Installable from Chrome on mobile

### 3. Guide Freelance (InFreelancing)
- **GitHub:** https://github.com/ucfzem/guide-freelance
- **GitHub Pages:** https://ucfzem.github.io/guide-freelance/
- **Vercel:** https://guide-freelance.vercel.app
- **Features:** 4 languages (FR/EN/ES/AR), Moroccan flag for Arabic, RTL support, dark/light theme, interactive checklist, progress bar
- **Fonts:** Cinzel (headings), Inter (body)
- **Backup:** BACKUP.md in repo

### 4. Works Page (Portfolio)
- **URL:** https://ucfzem.github.io/works/
- **Root:** https://ucfzem.github.io/
- **Password validator:** https://works-validator.azer-tyu199p.workers.dev
- **Status:** Recovered from force-push wipe, dead links removed/updated
- **Public projects:** 7 (Quran Majeed, Tanger, Blog, Lingotech, MicroInvoice, Rafeeq, ElixirTech)
- **Locked projects:** 24 (password protected)
- **Dead repos deleted:** Blog, Guide Freelance (old), EmailCollector, MicroInvoice, Rafeeq, Pristine, Magic Eraser, CVForge, Sandrawing

## Active Tokens
- **GitHub:** (stored separately)
- **Vercel:** (stored separately)
- **Cloudflare:** (stored separately)
- **Render:** (stored separately)

## GitHub Account
- **Username:** ucfzem
- **Email:** azer.tyu199p@gmail.com
- **User ID:** 225979212
- **Total repos:** 45
- **Repos with GitHub Pages:** 17

## Key Decisions
- Font: Manrope used for 500 Prompts (body + headings + Arabic Latin)
- Chat on Render for real-time Socket.io (Vercel/Cloudflare can't run WebSockets)
- PWA approach for mobile install (no PC/Android Studio)
- Works page: password-protected via Cloudflare Workers
- Guide Freelance: 4 languages with flags (🇫🇷 🇬🇧 🇪🇸 🇲🇦)
- Arabic uses Moroccan flag 🇲🇦

## Deploy Commands
```bash
# GitHub Pages
git push origin main

# Vercel (CLI)
cd project && vercel --yes --token <TOKEN> --prod

# Cloudflare Pages
# Auto-deploys from GitHub

# Render
# Auto-deploys from GitHub (real-time server)
```

## Session Notes
- Multiple token rotations throughout session (GitHub, Vercel expired)
- Force push to ucfzem.github.io wiped original content — recovered
- Works page dead links identified and updated
- Guide Freelance rebuilt with 4 languages from user's HTML code
- Vercel API had issues with default templates — fixed with Vercel CLI
