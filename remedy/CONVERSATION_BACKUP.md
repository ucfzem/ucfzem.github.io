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
11. `b497fd7` — fix: direct card click handler + ORL explanation badge + works page entry
12. `98bc133` — fix: om() TypeError — r.i/r.p are i18n objects, not arrays
13. `8454380` — docs: update conversation backup

## Languages Supported
- 🇫🇷 French (default)
- 🇬🇧 English
- 🇪🇸 Spanish
- 🇲🇦 Arabic (with RTL + Alexandria font)

## Session 2 Fixes (July 18)
- **Card click fix**: Replaced event delegation `.closest('.card')` with direct `addEventListener('click', ...)` on each card element — more reliable, no DOM traversal issues
- **om() TypeError fix**: `r.i` and `r.p` are i18n objects (`{fr: [...], en: [...], ...}`), not arrays. `om()` was calling `.map()` directly on the object (TypeError). Fixed to use `r.i[lang].map(...)` instead
- **ORL explanation**: Added a visible pill badge below the counter when "ORL & Respiratoire" category is selected, showing the meaning in each language (FR: Oreilles, Nez, Gorge; EN: Ear, Nose, Throat; ES: Oídos, Nariz, Garganta; AR: الأذن والأنف والحنجرة)
- **Works page entry**: Added Remèdes app (🍵 Remedy) to the locked "Autres" folder at `ucfzem.github.io/works/`

## Live URLs
- Remedy app: https://remedy-eight.vercel.app
- Works page: https://ucfzem.github.io/works/

## Features
- 90 grandma remedies across 10 categories
- Full-text search across ailments, ingredients, and remedy names
- Modal popup for detailed remedy info (ingredients, preparation, dosage, contraindications)
- Language persistence (localStorage + browser detection)
- Light/Dark mode with toggle + system preference detection
- Responsive design (phone → tablet → laptop → TV)
- Alexandria Google Font for Arabic (all elements)
- TV remote D-Pad navigation (Arrow keys, Enter, Escape, emerald focus ring)
- Direct `addEventListener` on each card for reliable click handling
- ORL explanation pill (Oreilles, Nez, Gorge) when category is selected
- Centered language selector layout

## Data Model
Each remedy stored via `ad(cat, m, rm, i, p, po, ci, wr)`:
- `cat` — category string (e.g. "ORL & Respiratoire")
- `m` — i18n object `{fr, en, es, ar}` for the ailment name
- `rm` — i18n object for the remedy name
- `i` — i18n object where each value is an **array** of ingredients
- `p` — i18n object where each value is an **array** of preparation steps
- `po` — i18n object for dosage
- `ci` — i18n object for contraindications
- `wr` — i18n object for warnings

**Critical**: `r.i` and `r.p` are objects of arrays, NOT arrays. Access via `r.i[lang]` or `(r.i[lang]||r.i.fr||[])`. Never call `.map()` directly on `r.i` or `r.p`.

## Git Remote
- Repo: `https://github.com/ucfzem/ucfzem.github.io`
- Branch: `main`
- Local path: `/tmp/ucfzem.github.io`
