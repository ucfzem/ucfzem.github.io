# Tafsir Ibn Taymiyyah - Conversation Log (2026-10-21)

## Summary
Built Arabic-only PWA for تفسير شيخ الإسلام ابن تيمية الجامع لكلام الإمام ابن تيمية في التفسير (جمع وتحقيق: إياد بن عبد اللطيف القيسي، دار ابن الجوزي، 7 مجلدات). Matched Maktaba/izhar style, added to works/index.html + root sw.js.

Final release restores the **complete** Al-Fatihah commentary (the earlier release had replaced the whole section with two ayat lines), fixes the surah-heading parser so all **114** surah sections across the 7 volumes are detected, and ships the warm sepia/Amiri manuscript theme with offline support tuned for old phones.

## Dataset
- Source: aljam3.com book 18202 (7 volumes, 4216 pages), crawled to `/tmp/opencode/tafsir_it/raw/vol-1..7.json`
- Rebuilt with `tools/build3.py` → `data/c/<n>.json` (lazy per volume) + `data/s/<n>.txt` (normalized search blob) + `data/index.json`
- **7 chapters · 114 sections · 50,852 paragraphs** (volumes: 2 / 3 / 6 / 13 / 23 / 40 / 27 sections)
- Parser rules that fixed the previous build:
  - a page's running header names the surah it belongs to → a change means a new section;
  - a `سورة X` line inside the body is a section heading;
  - surahs only move forward, so a repeated/lower-index heading is a running header and is dropped (kills the old duplicate sections);
  - OCR-tolerant surah names (`سورة السجدة` → السجادة) via 1-edit matching with a shared 4-letter prefix;
  - page numbers (ASCII / ٠-٩ / ۰-۹), spelled-out `الجزء …` footers (848), mangled headers and TOC/index pages are stripped;
  - Al-Fatihah: the 3 garbled opening lines are replaced with the **seven clean ayat**, one per line, with the **basmala counted as ayah 1** (﴿١﴾ basmala, ﴿٢﴾ الحمد … ﴿٧﴾ الضالين) - the scan had lost the start of the basmala and split the ayat; the full commentary (now 863 paragraphs after the 2026-10-22 text clean-up) is preserved intact.
- Verified against the raw rebuild: **no tafsir prose lost** (only 8 OCR header fragments + the 3 intentionally replaced ayat lines differ).

## Steps
- Scaffolded tafsir-ibn-taymiyyah (index.html, app.js, style.css, sw.js, manifest.json, fonts, icons)
- Crawled all 7 volumes with a resumable crawler; re-crawled vol1 pages 582–595
- Built izhar-schema JSON, split into per-volume lazy files + search blobs
- Restored the full Al-Fatihah commentary (previous release had truncated it to 2 lines)
- Fixed the section-heading parser (8 surahs were being swallowed into the previous section)
- Warm sepia manuscript theme (bg `#16120e`, card `#1e1913`, text `#e6d5bc`, gold `#c89b3c`) + reader font-size control + old-phone optimizations
- Typography: the manuscript font (**AmiriPara**) is applied to **paragraphs only**; titles, headings and every UI control keep the original **Cairo** face (`--body-font`)
- Service worker `tafsir-v1.1.9`: precaches shell + index.json + all 12 font faces, runtime-caches per-volume data
- Fonts are force-loaded at startup (`document.fonts.load`, with an Arabic sample for the Arabic-only AmiriPara face) so the first paint never falls back and offline rendering works
- Deployed to GitHub Pages, ran the Playwright suite (67/67 passing), refreshed the backup
- **2026-10-22 Al-An'am 1 fix (commit f02a5a0):** restored the full ayah with `يَعْدِلُونَ`, merged and normalized the ابن تيمية passage (v3 سورة الأنعام) per the corrected text, tightened punctuation/brackets.
- **2026-10-22 Qur'anic quotation fixes (commit fe83a91):** ash-Shura 21 (`شُرَكَوا`/`شُرَكَلُوا`→`شُرَكَاءُ`, `يَأْذَنُ`→`يَأْذَنْ`, `بأن …`→`بقوله: ﴿أَمْ …`), Maryam 18-19 (`تَقِيَّا`→`تَقِيًّا`, `لا هَبَ … رَكِيَّا`→`لِأَهَبَ … زَكِيًّا`, `زَكِبًا`→`زَكِيًّا`), az-Zumar 54 (`وَأَنبُوا`→`وَأَنِيبُوا`), `الَّذِى`→`الَّذِي` (297).
- **2026-10-22 UI fixes (commit f9f5bd3):** fixed the active volume/chapter button contrast (gold text on gold highlight made الجزء 1 invisible); forced dark ink on `.chapter-item.active`; speed up clearing the search field.
- **2026-10-22 text clean-up (commit 4e7c970):**
  - added a corpus-wide correction table to `tools/build3.py` (24 classes, 422 paragraphs fixed): `عَانَيْنَكَ→آتَيْنَاكَ`, `يَتَأَيُّهَا→يَا أَيُّهَا` (94), `الكَفِرُونَ→الكَافِرُونَ` (44), `مثلِكِ/ملِكِ يَوْمِ→مَالِكِ يَوْمِ الدِّينِ` (13), `النبي الله→نبي الله` (267), `بن المعلى→بن المُعَلَّى`, `عن بن→عن ابن`, `في تفسره→في تفسيره`, `ينسوه→ينسخه`, `فيها الله الحمد→فيها لله الحمد`, `العبادة الله→العبادة لله`, `الْقُرْوَانَ→الْقُرْءَانَ` (16), and the mangled basmala fragments (`الرحمن الرحية/الرجة/الرحيدية`, `الري الحر`, `العلمي الرحمة`, `الم الرحيم`, stray `ه الرحمن الرحيم`);
  - fixed the three garbled Al-Fatihah quotations: Al-Hijr 87, Al-Kafirun, Al-Ikhlas (added the missing `﴾`), and restored `أَنْعَمْتَ عَلَيْهِمْ غَيْرِ` in the hadith;
  - dropped **3,185** punctuation/symbol-only OCR fragments (e.g. `،`, `:`, `•`, `·`, `เ`) and regenerated the search blobs;
  - stitched the fragmented `فضل الفاتحة` hadith into one paragraph and removed the duplicate word-fragments (`أنعمت`, `بره`, `عليهم غير`);
  - footnote markers like `(1)` / `(٢)` now render as inline superscripts on the paragraph instead of floating as their own line;
  - bumped `sw.js` to `tafsir-v1.1.4`, `style.css?v=5`, `app.js?v=9`; re-ran 67/67 local and production tests.

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


## 2026-10-22 - Quranic ayahs corrected to King Fahd Uthmani text (commit 9593dcd)
- Fetched authenticated Uthmani text from api.alquran.cloud
- Replaced all quoted ayahs between ﴿﴾ referenced with [Surah: Ayah] using correct Uthmani text (1,883 fixes across all 7 volumes)
- Rebuilt, tests 67/67 passed, sw tafsir-v1.1.11
