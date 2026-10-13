# Conversation backup — 2026-10-13 — أسرار الكون + كتاب العظمة + fixes

## Summary
Added two new Arabic book PWAs to the link tree (`ucfzem.github.io/works`, **unlocked/public** section, middle of the book cluster), fixed a critical service-worker cache-collision regression (mujam offline), sped up Nuzhat al-Mushtaq loading, and fixed the Tarikh Ibn Khaldun أعلى/أسفل sidebar buttons.

## New webapps
| App | Repo | Live URL | Deploy |
|-----|------|----------|--------|
| أسرار الكون (Asrar al-Kawn) | ucfzem/asrar-al-kawn | https://ucfzem.github.io/asrar-al-kawn/ | main / |
| كتاب العظمة (al-Adhama) | ucfzem/al-adhama | https://ucfzem.github.io/al-adhama/ | main / |

- **أسرار الكون** — source: Shamela book 209 (`https://shamela.ws/book/209`), 15 chapters, 96 pages, 390 paras. Attribution flagged as *unattributed compilation*.
- **كتاب العظمة** — أبو الشيخ الأصبهاني (ت ٣٦٩هـ), source: Shamela book **13043** (`https://shamela.ws/book/13043`), **52 chapters**, 1461 pages, 1518 paras. Deep-green/gold crescent icon.

## Link tree (`works/index.html`)
- `publicProjects` now has **22** entries; أسرار الكون = #12, كتاب العظمة = #13 (middle of the book cluster).
- Subtitle updated to "22 projets publics"; JSON-LD itemList updated (24 items, incl. extra locked entries).
- Root `sw.js` `APPS` allowlist adds `asrar-al-kawn` and `al-adhama`.

## Critical fix — SW cache collision
Cache Storage is **per-origin**; the old unscoped `caches.keys().filter(k => k !== CACHE).map(delete)` on the shared `ucfzem.github.io` origin wiped every other app's cache (root cause of "mujam doesn't work offline"). Fixed by scoping each SW cleanup to its own prefix:

| App | New cache | Prefix guard | Deploy |
|-----|-----------|--------------|--------|
| mujam-al-buldan | mujam-cache-v1.0.4 | `startsWith('mujam-')` | gh-pages |
| nuzhat-al-mushtaq | nuzhat-cache-v1.1.1 | `startsWith('nuzhat-')` | main |
| al-tibb-al-nabawi | tibb-nabawi-v1.1.1 | `startsWith('tibb-nabawi-')` | gh-pages |
| al-adhkiya | adhkiya-cache-v1.0.2 | `startsWith('adhkiya-')` | gh-pages |
| tarikh-ibn-khaldun | tarikh-data-v1.3.3 | `startsWith('tarikh-')` | gh-pages |
| livre-al-istibsar | istibsar-cache-v1.0.3 | `startsWith('istibsar-')` | gh-pages |
| asrar-al-kawn | asrar-cache-v1.0.0 | `startsWith('asrar-')` | main |
| al-adhama | al-adhama-cache-v1.0.0 | `startsWith('al-adhama-')` | main |
| homepage light apps (works, childsgame, email-collector, webhealth) | v1.0.1 | per-prefix | main |
| droppy | droppy-v1.0.1 | `startsWith('droppy-')` | main |
| chat-socketio | uzchat-v1 | `startsWith('uzchat-')` | main |

Verified live: visiting mujam then nuzhat keeps **both** caches (`mujam-cache-v1.0.4` + `nuzhat-cache-v1.1.1`).

## Nuzhat performance fix
- Split data: new `regions-meta.js` (**9 KB**) renders the home instantly; full text (`all-regions.js`, 1.7 MB) loads lazily via `loadFull()` / `withFull()`.
- Google Fonts made non-blocking (`media="print" onload="this.media='all'"`).
- Home first-paint ≈ 218 ms (was gated on 1.7 MB). Index (70 parts) and search still work. 0 page errors.

## Tarikh bug fix
- `#chapterList` had `scrollHeight == clientHeight` on desktop (sidebar stretched), so أعلى/أسفل did nothing.
- Sidebar now `lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-7rem)]`, nav `min-h-0`. Verified live: ▼ أسفل scrolls (0 → 51265).

## Commits
- homepage `ucfzem.github.io`: `883039e` (works + SW isolation), `201a271` (add al-adhama)
- asrar-al-kawn: `1674137`
- al-adhama: (initial commit)
- nuzhat-al-mushtaq: `3583b50`
- mujam-al-buldan: `9791ae2`
- tarikh-ibn-khaldun: `869cbdb`
- al-tibb-al-nabawi: `fc73355`
- al-adhkiya: `992b1a7`
- livre-al-istibsar (gh-pages): `accec20`

## All live links
- Link tree: https://ucfzem.github.io/works/
- أسرار الكون: https://ucfzem.github.io/asrar-al-kawn/
- كتاب العظمة: https://ucfzem.github.io/al-adhama/
- Nuzhat al-Mushtaq: https://ucfzem.github.io/nuzhat-al-mushtaq/
- Tarikh Ibn Khaldun: https://ucfzem.github.io/tarikh-ibn-khaldun/
- Mujam al-Buldan: https://ucfzem.github.io/mujam-al-buldan/
- Al-Tibb al-Nabawi: https://ucfzem.github.io/al-tibb-al-nabawi/
- Al-Adhkiya: https://ucfzem.github.io/al-adhkiya/
- Al-Istibsar: https://ucfzem.github.io/livre-al-istibsar/

## Al-Tibb al-Nabawi — readable index fix (v1.1.2, commit `b213497`)
Two root causes behind the unreadable فهرس:
1. **CSS truncation** — `renderChapters()` gave each title span `className = 'truncate'` (`white-space:nowrap; text-overflow:ellipsis; overflow:hidden`), so every long title was cut, e.g. `29. فصل في هديه صلى الله عليه وسلم ف…`. Fixed by wrapping: `flex-1 text-right whitespace-normal break-words leading-snug` (also fixed the quick-jump dropdown span).
2. **Data** — the Shamela TOC had ~40 entries literally titled `"فَصْلٌ"` / `"[فصل]"`. The old check compared against bare `'فصل'`, so diacritics/brackets slipped through and all stayed generic.
Rebuild (`/tmp/tibb_rebuild.mjs`): normalise the title (strip diacritics/brackets) to detect generic entries; derive a real title from the first content sentence (strip leading `فصل`/connectors and footnote markers); merge clear continuation fragments (≤2 words before punctuation, or starting with `فإن`/`وإن`/`إلا`/`وهي`/… ) into the previous chapter. Result: **131 → 107 chapters, 24 merges, 0 generic titles**. Old chapter files pruned; `manifest.json` + all `chapters/*` rewritten; SW bumped `tibb-nabawi-v1.1.1 → v1.1.2`.
Verified live: 107 entries, 0 bare generic titles, longest title wraps over 4 lines (not clipped), search `العسل` → 43 results in 25 chapters, 0 console errors.
- al-tibb-al-nabawi: `b213497` (main + gh-pages)
