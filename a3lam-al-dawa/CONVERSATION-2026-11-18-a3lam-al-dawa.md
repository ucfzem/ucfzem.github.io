# Conversation Backup — a3lam-al-dawa — 2026-11-18

## Session: Rich quad-lingual biographical enrichment (34 scholars)

### Goal
Expand and rewrite biography datasets for all figures in the A'lam al-Dawa & Al-Fikr web application to feature rich, deep, multi-line narrative profiles across all 4 supported languages (Arabic, English, French, Spanish), while preserving schema, UI, and offline behavior.

### Live targets
- GitHub Pages: https://ucfzem.github.io/a3lam-al-dawa/
- Worker proxy: https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
- Repo: https://github.com/ucfzem/ucfzem.github.io/tree/main/a3lam-al-dawa

### Changes implemented
- **Rich paragraph bios (AR/EN/FR/ES):** Rewrote `desc.ar/en/fr/es` for all 34 scholar entries (n 01–34) from short single-line stubs into structured, flowing multi-paragraph narratives (2 paragraphs per language, separated by `\n\n`).
- **Birth year/decade & origin:** Each profile narrative explicitly weaves in birth year/decade/date and geographic origin at the beginning, across all four languages (using verified dates where well-known, e.g. Ahmed Deedat 1918, Yusuf Estes 1944, Zakir Naik 1965, Yasir Qadhi 1975, Hamza Tzortzis 1980, Mohammed Hijab 1991, Othman al-Khamis 1962, Adnan al-Arour 1948, Hatem al-Awni 1966, etc., and approximate decades/origins for others), alongside academic/training background, intellectual methodology, and major focus areas.
- **Schema & data integrity preserved:** Kept existing inline `var scholars = [...]` schema and keys (`n`, `name{ar,en,fr,es}`, `website`, `tag{ar,en,fr,es}`, `desc{ar,en,fr,es}`, optional `yt`/`img`), ordering, links, tags, and names intact; no changes to localization toggle logic, search/indexing approach, themes, or CSS styles beyond rendering support.
- **Rendering update:** Updated card description rendering to split `desc` on paragraph breaks (`\n\n`) and emit multiple `<p class="desc">` blocks (preserving single-line breaks within paragraphs) so multi-line narratives display correctly.
- **Offline/SW:** Bumped service worker cache `CACHE_NAME` from `a3lam-al-dawa-v34` to `a3lam-al-dawa-v35` to ensure updated content is fetched while retaining offline caching strategy (precache of core assets/portraits, network-first navigation with cache fallback). Build marker updated to `2026-11-18a`.

### Verification / tests
- JSON parse of inline `scholars` array: **34 entries**, all with required keys and `name/tag/desc` present in `ar,en,fr,es`.
- Bio quality checks: **34/34** scholars have 2 paragraphs per language (136/136 desc fields) with substantial length; birth/origin information included at start of narratives in all four languages. `ALL_OK True`.
- Render logic simulation: paragraph split produces ≥2 `<p class="desc">` blocks for every scholar in every language.
- JS syntax: both inline `<script>` blocks pass `new Function(...)` parse.
- Offline/cache integrity: SW install/activate/fetch logic unchanged except version bump to `v35`; manifest and asset references preserved.

### Files changed
- `a3lam-al-dawa/index.html` — enriched `desc` for all 34 scholars (AR/EN/FR/ES), multi-paragraph render support, build marker bump.
- `a3lam-al-dawa/sw.js` — cache version bump to `v35`.
- `a3lam-al-dawa/CONVERSATION-2026-11-18-a3lam-al-dawa.md` — this session backup.

### Notes
- Portraits/images, platform/website/YouTube links, tags, names, and UI strings were preserved; no schema migration.
- Some birth details for less-documented figures are given as approximate decades/origins based on available public context to satisfy origin/year integration while avoiding fabricated specifics.
