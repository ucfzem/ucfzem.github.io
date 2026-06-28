# Conversation Backup — 2026-06-28

## Projects Worked On

### 1. 500 Prompts IA
- **Features:** 500 prompts, 4 languages (FR/EN/SP/AR), RTL Arabic, dark/light theme
- **Fonts:** Manrope (body + headings), Cinzel (ornaments)
- **Changes made:** Font Outfit→Manrope, Playfair Display→Manrope, aligned prompt numbers, fixed Arabic Latin fonts, cache-busting

### 2. Chat Socket.io
- **Features:** 8 features — rooms/channels, emoji reactions, typing indicator, sound notifications, user avatars, private messaging, online status, dark mode
- **PWA:** Installable from Chrome on mobile

### 3. Guide Freelance (InFreelancing)
- **Features:** 4 languages (FR/EN/ES/AR), Moroccan flag for Arabic, RTL support, dark/light theme, interactive checklist, progress bar
- **Fonts:** Cinzel (headings), Inter (body)

### 4. Works Page (Portfolio)
- **Password validator:** Cloudflare Worker
- **Status:** Recovered from force-push wipe, dead links removed/updated
- **Public projects:** 7 (Quran Majeed, Tanger, Blog, Lingotech, MicroInvoice, Rafeeq, ElixirTech)
- **Locked projects:** 24 (password protected)
- **Dead repos deleted:** Blog, Guide Freelance (old), EmailCollector, MicroInvoice, Rafeeq, Pristine, Magic Eraser, CVForge, Sandrawing

### 5. Pristine Photo Editor
- All basic tools rewritten with real Canvas API (compress, resize, convert, watermark, thumbnail, crop, batch)
- Fixed CSS grid layout (min-height:0 on all panels)
- Fixed event param bugs in showPage/showDocPhase/selectTool
- Fixed mobile layout (tool buttons visible as scrollable strip)
- Warm dark mode theme (brown/gold/yellow/white)

### 6. Rafeeq Assistant
- Full rebuild with 4 languages (FR/EN/ES/AR), SOS emergency (15 countries), medication reminders, health advice
- Dark/light theme toggle persisted in localStorage
- Family CRUD, Gregorian + Hijri date

### 7. CV-Maker
- Fixed A4 preview layout (removed aspect-ratio, added min-height:1123px)
- Applied cvforgez.html user fix (proper font sizes, WYSIWYG PDF, 3 quality levels)

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

## Key Decisions
- Font: Manrope used for 500 Prompts (body + headings + Arabic Latin)
- Chat on Render for real-time Socket.io (Vercel/Cloudflare can't run WebSockets)
- PWA approach for mobile install
- Works page: password-protected via Cloudflare Workers
- Guide Freelance: 4 languages with flags (FR/EN/ES/AR)
- Arabic uses Moroccan flag

## Session Notes
- Multiple token rotations throughout session (GitHub, Vercel expired)
- Force push to ucfzem.github.io wiped original content — recovered
- Vercel CLI token expired — relies on GitHub webhook auto-deploy
- cvforgez.html user fix applied to cv-maker/index.html
- All links removed from backup files for security
