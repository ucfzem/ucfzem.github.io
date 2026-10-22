# Tafsir Ibn Taymiyyah - Conversation Log (2026-10-21)

## Summary
Built Arabic-only PWA for تفسير شيخ الإسلام ابن تيمية الجامع لكلام الإمام ابن تيمية في التفسير (جمع وتحقيق: إياد بن عبد اللطيف القيسي، دار ابن الجوزي 7 مجلدات). Matched Maktaba/izhar style, added to works/index.html + root sw.js.

## Steps
- Scaffolded tafsir-ibn-taymiyyah (index.html, app.js, style.css, sw.js, manifest.json, fonts, icons)
- Crawled from aljam3.com book 18202 (7 vols, 4216 pages) via resumable crawler
- Built izhar-schema JSON, split into juz-1..7 + index for performance
- Fixed Al-Fatihah text (data + CSS font shaping)
- Theme updated to warm sepia (matching reference), perf tweaks for old mobile
- Deployed to GitHub Pages, tested, backed up

## Links
- App: https://ucfzem.github.io/tafsir-ibn-taymiyyah/
- Works/Maktaba: https://ucfzem.github.io/works/
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Commits: a3ce90a, d69bf6f, df7b858, 47aef81, 94b081f, 483bc84, d9bb963
- Backup: backups/tafsir-ibn-taymiyyah-2026-10-21-final/
