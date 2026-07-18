# Remedy — Conversation Backup

## Date
July 18, 2026

## Summary
Built a fully i18n'd "Remèdes de Grand-Mère" (Grandma's Remedies) web app with 83 remedies translated into French, English, Spanish, and Arabic (RTL support).

## Key Decisions
- Used Moroccan flag 🇲🇦 for Arabic language
- Used Alexandria Google Font for Arabic script support
- Used compact remedy format (shorter instructions, merged variants) to fit 83 remedies
- Persisted language choice via localStorage + browser language detection
- Deployed to both GitHub Pages (via ucfzem.github.io/remedy/) and Vercel

## Files Created/Modified
- `remedy/index.html` — main app (230 lines): i18n framework, 83 remedies, Alexandria font, localStorage persistence
- `remedy/.gitignore` — ignores local Vercel config
- `remedy/CONVERSATION_BACKUP.md` — this file

## Build Script
- `/tmp/build2.js` — Node.js script that generated the HTML (heredoc with remedy data)

## Deployments
- GitHub: https://github.com/ucfzem/ucfzem.github.io (in `remedy/` directory)
- Vercel: https://remedy-eight.vercel.app

## Commits
1. `13cfe83` — Add remedy project (initial structure)
2. `c4d9320` — Add i18n (EN/ES/AR + RTL) for all 90 remedies
3. `bb09796` — Use Moroccan flag for Arabic
4. `796b72d` — Persist language choice via localStorage, detect browser lang

## Languages Supported
- 🇫🇷 French (default)
- 🇬🇧 English
- 🇪🇸 Spanish
- 🇲🇦 Arabic (with RTL + Alexandria font)

## Features
- 83 grandma remedies across 10 categories
- Full-text search across ailments, ingredients, and remedy names
- Modal popup for detailed remedy info (ingredients, preparation, dosage, contraindications)
- Language persistence (localStorage + browser detection)
- Responsive design with sage/earth-tone palette
