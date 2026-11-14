# Conversation Backup: Maktaba QR-Code & Restyle Fix
**Date**: 2026-11-13
**Task**: Update works/Maktaba/index.html - change QR-code PNG download link to new Droppy share, remove broken بصarris (#28) entry, remove Maktaba webapp card, convert webapps grid to single-column flex layout

## Changes Made

### 1. Remove broken بصarris (#28) entry from `works/Maktaba/index.html`
- Removed the malformed `<span class="app-num">28</span>` fragment between apps #27 and #30
- Apps now go from #27 (Tafsir Ibn Taymiyyah) directly to #30 (Cosmic Evidence)
- Verified: exactly 28 app rows (1-27 + 30), no #28 or #29 entries

### 2. Verified webapp cards - only 3 remain
- **Quran Majeed v3** ✅
- **Tanger d'Antan** ✅  
- **Mapamundi** ✅
- Maktaba webapp card **absent** ✅

### 3. QR-code download links updated
- **SVG**: `https://ucfzem.github.io/droppy/get.html?id=c49a5088` (old share, unchanged)
- **PNG**: `https://ucfzem.github.io/droppy/get.html?id=8a9174d1` (new share, updated) ✅

### 4. Service worker cache version bumped
- `sw.js`: `CACHE` changed from `works-v1.0.33` → `maktaba-v8`
- `activate` listener old-cache cleanup updated to filter `k.startsWith('maktaba-')` ✅

### 5. Only 2 files modified
- `works/Maktaba/index.html`
- `works/sw.js`

### 6. Local commit saved
- Commit `7103ce3`: "Remove broken بصarris #28, update QR-PNG Droppy link, bump sw cache to maktaba-v8, remove Maktaba webapp card"
- Ahead of `origin/main` by 1 commit

## Verification Results

- **App numbers present**: 1-27, 30 (28 rows total)
- **Broken #28 entry**: NOT found ✅
- **Webapp cards**: exactly 3 (Quran, Tanger, Mapamundi) ✅
- **QR download links**: SVG at old Droppy, PNG at new Droppy ✅
- **SW cache version**: `maktaba-v8` ✅
- **Only 2 files modified**: ✅

## Heads-Up for Deployment
All three hosts (GitHub Pages `https://ucfzem.github.io/works/Maktaba/`, Vercel, Cloudflare) need deployment verification after changes. Expected: 30 library rows + 3 webapp cards rendered; no "بصarris" or "basair" entries.

## Git Status
Only `works/Maktaba/index.html` and `works/sw.js` are modified per the task constraint.