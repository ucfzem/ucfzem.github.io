# Remedy — Conversation Backup

## Date
July 18, 2026

## Summary
Built a fully i18n'd "Remèdes de Grand-Mère" (Grandma's Remedies) web app with 90 remedies translated into French, English, Spanish, and Arabic (RTL support). Includes dark mode, comprehensive responsive design, localStorage language/theme persistence, and Alexandria Arabic font.

## Key Decisions
- Used Moroccan flag 🇲🇦 for Arabic language
- Used Alexandria Google Font for Arabic script support (applied to all elements in Arabic mode)
- Added light/dark mode with system preference detection + localStorage persistence
- Used addEventListener + event delegation for reliable button handling
- Used CSS variables for theming (no class toggling for individual elements)
- Responsive breakpoints: phone (default), tablet (600px), desktop (900px), large (1200px), TV (1600px+)

## Files Created/Modified
- `remedy/index.html` — main app (330 lines): 90 remedies, i18n, dark mode, responsive CSS, event delegation
- `remedy/.gitignore` — ignores local Vercel config
- `remedy/CONVERSATION_BACKUP.md` — this file

## Build Script
- `/tmp/build2.js` — obsolete, data now inlined directly in HTML

## Deployments
- GitHub: https://github.com/ucfzem/ucfzem.github.io (in `remedy/` directory)
- Vercel: https://remedy-eight.vercel.app

## Commits
1. `13cfe83` — Add remedy project (initial structure)
2. `c4d9320` — Add i18n (EN/ES/AR + RTL) for all 90 remedies
3. `bb09796` — Use Moroccan flag for Arabic
4. `796b72d` — Persist language choice via localStorage, detect browser lang
5. `f5a5de6` — fix: addEventListener + event delegation, responsive CSS for all screens
6. `3048ab3` — fix: ad() drops data — now stores all 8 params; fix om() map crash on arrays
7. `6aeb58b` — style: center lang flags below search bar, column layout
8. `7e93d34` — fix: Arabic title changed to علاج, Alexandria font active
9. `cee4bed` — style: Alexandria font on all Arabic elements via --font-heading override
10. `7a33e4f` — feat: dark mode with toggle, localStorage, system pref detection

## Languages Supported
- 🇫🇷 French (default)
- 🇬🇧 English
- 🇪🇸 Spanish
- 🇲🇦 Arabic (with RTL + Alexandria font)

## Features
- 90 grandma remedies across 10 categories
- Full-text search across ailments, ingredients, and remedy names
- Modal popup for detailed remedy info (ingredients, preparation, dosage, contraindications)
- Language persistence (localStorage + browser detection)
- Light/Dark mode with toggle + system preference detection
- Responsive design (phone → tablet → laptop → TV)
- Alexandria Google Font for Arabic (all elements)
- Event delegation for reliable button handling
- Centered language selector layout
