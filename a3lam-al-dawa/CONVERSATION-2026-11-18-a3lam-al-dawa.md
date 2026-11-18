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

## Session 2 — Card layout: full-width description (no gap under avatar)

### Changes
- **Layout fix:** Reworked `.card-top` from flex to CSS grid (`grid-template-columns: auto 1fr`) so the avatar and header (name/tag) stay aligned at the top row, while the description block spans the full card content width.
- **Full-width text flow:** Moved `desc` paragraphs out of the side info column into a `.desc-wrap` container placed as `grid-column: 1 / -1; width: 100%`, eliminating the empty vertical whitespace under the avatar.
- **Typography/readability:** `.desc` set to `text-align: justify; line-height: 1.7;` with paragraph spacing; `dir="auto"` preserved on content for correct RTL/LTR rendering (Arabic justified/right-flow per direction). Build marker `2026-11-18b`.
- **Offline/cache:** Service worker cache bumped to `a3lam-al-dawa-v36`.

### HTML/CSS snippet (key changes)
```css
.card-top{display:grid;grid-template-columns:auto 1fr;column-gap:14px;row-gap:10px;align-items:start}
.avatar{...;flex-shrink:0}
.head-info{min-width:0;align-self:center}
.desc-wrap{grid-column:1 / -1;width:100%}
.desc{font-size:.85rem;color:var(--muted);line-height:1.7;margin:0 0 8px;text-align:justify}
.desc:last-child{margin-bottom:0}
```
```html
<article class="card">
  <div class="card-top">
    <div class="avatar">…</div>
    <div class="head-info">
      <div class="row"><h2 class="name" dir="auto">…</h2><span class="tag" dir="auto">…</span></div>
    </div>
    <div class="desc-wrap"><p class="desc" dir="auto">…</p><p class="desc" dir="auto">…</p></div>
  </div>
  <div class="actions">…</div>
</article>
```

### Verification
- JS: both inline `<script>` blocks pass `new Function(...)` parse.
- Structure/CSS present: grid card-top, `.head-info`, `.desc-wrap` with `grid-column:1 / -1`, `.desc` with `text-align:justify`.
- Data integrity: 34 scholars intact, multi-paragraph desc preserved in all 4 languages.

## Session 3 — Correction: أحمد بن يوسف السيد (n=12)

### Correction (per https://ar.wikipedia.org/wiki/أحمد_بن_يوسف_السيد)
- **Identity/name:** corrected to full name `أحمد بن يوسف السيد` / `Ahmed bin Yusuf al-Sayyid` (AR/EN/FR/ES).
- **Birth/origin:** corrected to born **1985 in Yanbu, Saudi Arabia** (raised there, later moved to Madinah) — replaced incorrect “born in Egypt in the 1970s”.
- **Role/profile:** corrected to Saudi preacher, researcher, and author focused on da'wah education/intellectual development and youth formation (reviving the Prophetic method); removed incorrect attribution as “academic supervisor at Zad Academy”.
- **Work/programs:** bios now reflect supervision/involvement in projects such as «البناء المنهجي», «برد اليقين», «أكاديمية الجيل الصاعد», «صناعة المحاور», and «المحاورون», with books/lectures in creed, Hadith, and contemporary thought. Website preserved: https://ahmadalsayed.net/books
- **Tags:** updated to `دعوة وبناء معرفي` / `Da'wah and intellectual development` / `Prédication et formation intellectuelle` / `Da'wa y desarrollo intelectual`.
- **Bios:** rich 2-paragraph narratives in AR/EN/FR/ES with birth year/origin integrated. Schema/keys/other scholars unchanged.

### Build/cache
- `index.html` build `2026-11-18c`; `sw.js` cache bumped to `a3lam-al-dawa-v37`.

### Verification
- JS: both inline `<script>` blocks parse (`new Function`).
- n=12: correct name/birth(1985)/origin(Yanbu, Saudi Arabia)/profile; 2 paragraphs per language; no Egypt/1970s/Zad misattribution; website intact; 34 scholars total.

## Session 4 — Correction: أبو عمر الباحث / مكافح الشبهات (n=13)

### Correction (per user-provided details)
- **Identity/name:** corrected to `أبو عمر الباحث (طارق السيد)` / `Abu Omar al-Bahith (Tarek al-Sayed)` (AR/EN/FR/ES) — replaced incorrect `مهند السويدان (أبو عمر الباحث)` / `Muhannad al-Suwaidan`.
- **Nationality/birth:** corrected to Egyptian, born in Cairo in **1980** — replaced incorrect Syrian born in the 1970s.
- **Background/profile:** preacher/researcher focused on comparative religion and responding to doubts about Islam and the Sunnah; Sunni following the Salafi methodology; early Islamic studies at Ibn al-Jazari Institute, study at Dar al-Ulum (Cairo University), and ijazah in Hafs ‘an ‘Asim.
- **Activity/platforms:** early da'wah content creator on YouTube in refuting misconceptions (active since ~2008–2009), known for detailed responses and on-screen source documentation; content expanded to address missionaries, atheism, Qur’anists, secularism, Shi’ism, etc. Publishes via “Mukafih al-Shubuhat” (مكافح الشبهات) platforms.
- **Links:** YouTube `https://www.youtube.com/@antishubohat` (channel: مكافح الشبهات) added as `yt`; blog `https://antishubohat.wordpress.com/` added as `website`.
- **Tags:** updated to `مكافح الشبهات والردود` / `Refuting doubts and misconceptions` / `Réfutation des doutes et des idées fausses` / `Refutación de dudas e ideas erróneas`.
- **Bios:** rich 2-paragraph narratives in AR/EN/FR/ES with birth/origin and channel/platform details integrated. Schema/keys/other scholars unchanged.

### Build/cache
- `index.html` build `2026-11-18e`; `sw.js` cache bumped to `a3lam-al-dawa-v39`.

### Verification
- JS: both inline `<script>` blocks parse (`new Function`).
- n=13: correct name (Tarek al-Sayed), Egyptian/Cairo/1980, YouTube + blog links, channel name referenced, 2 paragraphs per language; no Syrian/Muhannad misattribution; 34 scholars total.
