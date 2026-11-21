# Conversation Backup - taw7id PWA (2026-11-21)

## Summary
- Built complete offline-first PWA at `taw7id/` (Vanilla HTML/CSS/JS, RTL Arabic, no external URLs/CDN).
- Added local fonts/icons, manifest, service worker `CACHE_NAME='tawhid-book-v12'`, book content with attributed Quran/ahadith/scholar quotes.
- Integrated `taw7id` into `works/index.html` (unlocked/public projects list) and `works/Maktaba/index.html` (webapps section), keeping existing entries intact.
- Did not touch or stage pre-existing uncommitted `shubuhat-wa-rudud/index.html` and `shubuhat-wa-rudud/sw.js`.

## Key Paths
- `/tmp/ucfzem-site/taw7id/index.html`
- `/tmp/ucfzem-site/taw7id/manifest.json`
- `/tmp/ucfzem-site/taw7id/sw.js`
- `/tmp/ucfzem-site/taw7id/css/style.css`
- `/tmp/ucfzem-site/taw7id/js/book-data.js`
- `/tmp/ucfzem-site/taw7id/js/app.js`
- `/tmp/ucfzem-site/taw7id/assets/fonts/Amiri-Regular.woff2`
- `/tmp/ucfzem-site/taw7id/assets/fonts/Amiri-Bold.woff2`
- `/tmp/ucfzem-site/taw7id/assets/fonts/Cairo-Regular.woff2`
- `/tmp/ucfzem-site/taw7id/assets/fonts/Cairo-Bold.woff2`
- `/tmp/ucfzem-site/taw7id/assets/icons/icon-192.png`
- `/tmp/ucfzem-site/taw7id/assets/icons/icon-512.png`
- `/tmp/ucfzem-site/works/index.html`
- `/tmp/ucfzem-site/works/Maktaba/index.html`

## Verification
- `grep -RInE "https?://" taw7id/index.html taw7id/css taw7id/js taw7id/manifest.json taw7id/sw.js` => OK offline
- `grep -c 'class="scholar-quote"' taw7id/js/book-data.js` => 22
- `grep -n "CACHE_NAME" taw7id/sw.js` => `tawhid-book-v12`
- Required IDs present: `quick-parts`, `reading-progress`, `book-stats`, `search-input`, `toc-drawer`, `btn-match-prev`, `btn-match-next`
- HTML/JSON/node syntax checks passed.
- Book stats: 16 sections, 5 parts; 3 per-section source copy actions.

## URLs
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Works: https://ucfzem.github.io/works/
- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Taw7id: https://ucfzem.github.io/taw7id/
