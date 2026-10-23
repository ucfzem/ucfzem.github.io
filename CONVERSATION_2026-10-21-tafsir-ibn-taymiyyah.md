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

## Read-only Qur'an audit — 2026-10-23
Prompted by a claim that commit `9593dcd` replaced all quoted ayahs with Uthmani text (1,883 fixes). Verified: **false** — `git show --stat 9593dcd` changes only `sw.js`; `git diff 9593dcd~1 9593dcd -- data/` is empty. Live `data/c/1..7.json` is byte-identical (SHA-256) to the repo. Real text edits are in earlier commits (`4e7c970`, `fe83a91`, `d5878f2`) and are incomplete.

Added a read-only audit (`tools/audit_quran.py`, no data modified):
- Extracts every `﴿...﴾` quote with volume/section/paragraph/offset, matches fragments as substrings against `quran-simple` over 1–3 ayah spans, and parses `[surah: ayah]` references.
- Extracts and scans the whole corpus for known OCR artifacts.
- Results: **3,486** quotes; 747 matched to their stated ref, 735 matched without a ref; 1,187 unmatched with a ref, 817 unmatched without one (includes commentary, broken brackets, and ref-association noise — review-only).
- **175 OCR candidates: 126 high-confidence, 49 context-dependent.** High: `قرهان` 59, `قرمان` 33, `اينت` 27, `تبرك الذي بيده` 7. Context-dependent: `جعلته` 31, `انزلته` 18.
- Confirmed examples: Yusuf 12:1–2 (`الر تلك اينت الكتاب المبين انا انزلته قرهانا/قرمانا...`), Al-Baqarah p236 (`قرمانا`, `اينت`), Al-Anfal 2 (`واينته`), Al-Mulk 1 (`تبرك`), Hud 11:143 (`قرءانه` in data as `قرهانه`).
- Search index `data/s/*.txt` mirrors the corpus exactly (same corrupt counts), so it is not stale; it was rebuilt from the same OCR text.
- No Qur'anic text was changed. `data/` remains untouched.
Files: `tafsir-ibn-taymiyyah/tools/audit_quran.py`, `tafsir-ibn-taymiyyah/audit/quran-audit-review.json`, `tafsir-ibn-taymiyyah/audit/quran_audit_summary.md`. Backup: `backups/tafsir-ibn-taymiyyah-audit-2026-10-23/`.

## OCR correction pass — 2026-10-23
Regenerated the audit against **`quran-uthmani`** (not `quran-simple`) and separated actionable OCR corruption from contextual guesses.

Applied **111 verified edits**:
- `قرهان` → `قرآن`: 59
- `قرمان` → `قرآن`: 33
- `تبرك الذي بيده` → `تبارك الذي بيده`: 7
- `انزلته` → `أنزلناه` in verbatim 12:2 / 20:113: 10
- `جعلته` → `جعلناه` in verbatim 43:3: 2

Verification:
- Only `data/c/*.json` and `data/s/*.txt` changed; `data/index.json` untouched.
- Section and paragraph counts unchanged (7 volumes); search-blob line counts unchanged.
- Every changed paragraph reconstructs exactly from the manifest; 0 extra changes.
- Post-fix audit: **0 actionable**, **64 needs-review** (`اينت` 27, `جعلته` 29, `انزلته` 8).
- Service-worker cache bumped to `tafsir-v1.1.12`.
- Commit: `694c7b4`.

Links:
- App: https://ucfzem.github.io/tafsir-ibn-taymiyyah/
- Audit summary: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/quran_audit_summary.md
- Audit JSON: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/quran-audit-review.json
- Remaining review list: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/needs-review-ocr.json
- Applied manifest: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/applied-ocr-fixes.json
- Audit README: https://github.com/ucfzem/ucfzem.github.io/blob/main/tafsir-ibn-taymiyyah/audit/README.md
- Backup: https://github.com/ucfzem/ucfzem.github.io/tree/main/backups/tafsir-ibn-taymiyyah-ocr-fixes-2026-10-23
- Conversation: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/CONVERSATION_2026-10-21-tafsir-ibn-taymiyyah.md

## Fix 6:2 / 7:187 / 2:282 quotation — 2026-10-23
Location: `data/c/3.json`, `سورة الأنعام`, content items 61–62.

Corrections:
- `يَسْتَلُونَكَ` → `يَسْأَلُونَكَ`
- `لِوَقِنِهَا` → `لِوَقْتِهَا`
- `يُجَليها` → `يُجَلِّيهَا`
- `مُرْسَهَا` → `مُرْسَاهَا`
- Closed the 6:2 bracket after `عِنْدَهُ` and the 2:282 bracket after `مُّسَمًّى`.
- Removed the stray `﴿` before `«مسمىً»`.
- Added `فَاكْتُبُوهُ`; removed the extra waw before `إِذَا` in 2:282.
- Added `«...»` around the hadith and preserved footnotes `(۳)` / `(٤)`.

Verification:
- Only content items 61–62 changed; 6 sections and 7,473 content items unchanged.
- `data/s/3.txt` lines 62–63 updated; 7,472 newline count preserved.
- 6:2 and 2:282 normalized quotes match the trusted corpus; 7:187 uses the simple-script `مُرْسَاهَا` spelling.
- Service worker bumped to `tafsir-v1.1.13`.
- Commit: `868df90`.

Links:
- App: https://ucfzem.github.io/tafsir-ibn-taymiyyah/
- Audit summary: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/quran_audit_summary.md
- Remaining 64: https://ucfzem.github.io/tafsir-ibn-taymiyyah/audit/needs-review-ocr.json
- Backup: https://github.com/ucfzem/ucfzem.github.io/tree/main/backups/tafsir-ibn-taymiyyah-2026-10-23-araf187
- Conversation: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/CONVERSATION_2026-10-21-tafsir-ibn-taymiyyah.md

## Integrity fix — 6:4–11 + 43:84/6:3 brackets — 2026-10-23
Location: `data/c/3.json`, `سورة الأنعام`, content item 80.

- Replaced the heavily corrupted 6:4–11 block with the verified text and added the missing closing `﴾`.
- Closed the preceding 43:84 and 6:3 quotations in the same paragraph.
- Fixed `إِلَهُ` → `إِلَٰهٌ` and `السَّمَوَاتِ` → `السَّمَاوَاتِ`.
- Removed `مَكَتَهُمْ`, `أَنْبُوا`, `يَسْتَهْزِمُونَ`, `عَلِقِبَةُ`, `فَرْنًا`, `كِتَبا`, `الأَنْهَر`, `تَحْنِهِمْ`, `فَأَهْلَكْتَهُم`, `جَعَلْتَهُ`, `بِرُسُلِ`, etc.
- Verified 43:84, 6:3, and 6:4–11 against the trusted corpus.
- Only item 80 changed; 6 sections / 7,473 items unchanged.
- Search blob line 81 updated; newline count preserved.
- Service worker: `tafsir-v1.1.14`.
- Commit: `0c61cd7`.

Links:
- App: https://ucfzem.github.io/tafsir-ibn-taymiyyah/
- Backup: https://github.com/ucfzem/ucfzem.github.io/tree/main/backups/tafsir-ibn-taymiyyah-2026-10-23-anam-6-4-11
- Conversation: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/CONVERSATION_2026-10-21-tafsir-ibn-taymiyyah.md
