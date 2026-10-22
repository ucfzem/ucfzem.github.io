# Tafsir Ibn Taymiyyah - Conversation Log (2026-10-21)

## Summary
Built Arabic-only PWA for تفسير شيخ الإسلام ابن تيمية الجامع لكلام الإمام ابن تيمية في التفسير (جمع وتحقيق: إياد بن عبد اللطيف القيسي، دار ابن الجوزي، 7 مجلدات). Matched Maktaba/izhar style, added to works/index.html + root sw.js.

Final release restores the **complete** Al-Fatihah commentary (the earlier release had replaced the whole section with two ayat lines), fixes the surah-heading parser so all **114** surah sections across the 7 volumes are detected, and ships the warm sepia/Amiri manuscript theme with offline support tuned for old phones.

## Dataset
- Source: aljam3.com book 18202 (7 volumes, 4216 pages), crawled to `/tmp/opencode/tafsir_it/raw/vol-1..7.json`
- Rebuilt with `tools/build3.py` → `data/c/<n>.json` (lazy per volume) + `data/s/<n>.txt` (normalized search blob) + `data/index.json`
- **7 chapters · 114 sections · 54,044 paragraphs** (volumes: 2 / 3 / 6 / 13 / 23 / 40 / 27 sections)
- Parser rules that fixed the previous build:
  - a page's running header names the surah it belongs to → a change means a new section;
  - a `سورة X` line inside the body is a section heading;
  - surahs only move forward, so a repeated/lower-index heading is a running header and is dropped (kills the old duplicate sections);
  - OCR-tolerant surah names (`سورة السجدة` → السجادة) via 1-edit matching with a shared 4-letter prefix;
  - page numbers (ASCII / ٠-٩ / ۰-۹), spelled-out `الجزء …` footers (848), mangled headers and TOC/index pages are stripped;
  - Al-Fatihah: the 3 garbled opening lines are replaced with the **seven clean ayat**, one per line, with the **basmala counted as ayah 1** (﴿١﴾ basmala, ﴿٢﴾ الحمد … ﴿٧﴾ الضالين) - the scan had lost the start of the basmala and split the ayat; the full commentary (now 933 paragraphs) is preserved intact.
- Verified against the raw rebuild: **no tafsir prose lost** (only 8 OCR header fragments + the 3 intentionally replaced ayat lines differ).

## Steps
- Scaffolded tafsir-ibn-taymiyyah (index.html, app.js, style.css, sw.js, manifest.json, fonts, icons)
- Crawled all 7 volumes with a resumable crawler; re-crawled vol1 pages 582–595
- Built izhar-schema JSON, split into per-volume lazy files + search blobs
- Restored the full Al-Fatihah commentary (previous release had truncated it to 2 lines)
- Fixed the section-heading parser (8 surahs were being swallowed into the previous section)
- Warm sepia manuscript theme (bg `#16120e`, card `#1e1913`, text `#e6d5bc`, gold `#c89b3c`) + reader font-size control + old-phone optimizations
- Typography: the manuscript font (**AmiriPara**) is applied to **paragraphs only**; titles, headings and every UI control keep the original **Cairo** face (`--body-font`)
- Service worker `tafsir-v1.1.3`: precaches shell + index.json + all 12 font faces, runtime-caches per-volume data
- Fonts are force-loaded at startup (`document.fonts.load`, with an Arabic sample for the Arabic-only AmiriPara face) so the first paint never falls back and offline rendering works
- Deployed to GitHub Pages, ran the Playwright suite (67/67 passing), refreshed the backup

## Performance (360 px viewport, local)
- boot to chapter list: ~0.76 s
- chapter 1 rendered: ~0.25 s
- full-book search: ~1.4 s (progressive, streams 7 volumes)
- payload: `data/index.json` 1 KB gz · chapter 515 KB gz · search blob 443 KB gz

## Links
- App: https://ucfzem.github.io/tafsir-ibn-taymiyyah/
- Works/Maktaba: https://ucfzem.github.io/works/
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Backup: backups/tafsir-ibn-taymiyyah-2026-10-21-final/
- Builder: backups/tafsir-ibn-taymiyyah-2026-10-21-final/tools/build3.py
- Test suite: backups/tafsir-ibn-taymiyyah-2026-10-21-final/tools/test-tafsir-local.mjs
