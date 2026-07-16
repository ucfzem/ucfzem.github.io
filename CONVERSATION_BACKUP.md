# Conversation Backup

## Session 2026-07-08 — Carousel RTL + Square + Optimizations

### Fixes
1. **RTL arabe** : `isRTL()` JS → direction `translateX` inversée au lieu du CSS `scaleX(-1)` qui cassait l'affichage
2. **Photos carré** : `aspect-ratio: 1/1` sur desktop/tablet/TV, gardé `height: 220px` sur mobile
3. **Optimisation** : `loading="lazy"`, `decoding="async"`, `fetchPriority`, `width`/`height`, `background` placeholder
4. **GitHub Pages** : CDN lent, pushé commit `b3a3cdf` en attente de propagation
5. **Mot de passe retiré** : `/photographer/` ajouté à `PUBLIC_PATHS` dans le worker Cloudflare
6. **Flèches centrées** : `flexbox` au lieu de `line-height` + petit `padding` pour compenser le décalage des caractères ‹ ›

### Commits
- `4513c80` — carousel: add RTL support for Arabic mode
- `d7a4cf7` — fix: carousel RTL direction via JS (remove scaleX)
- `4137e75` — perf: fetchPriority, width/height, background
- `b3a3cdf` — carousel: square aspect-ratio on desktop/tablet, keep height on mobile
- `8971f64` — fix: center carousel arrow icons with flexbox + padding nudge

### Liens
- GitHub Pages : https://ucfzem.github.io/photographer/
- Cloudflare Worker : https://ucfzem.azer-tyu199p.workers.dev/photographer/
- Vercel : https://ucfzem-works.vercel.app/photographer/
- Repo : https://github.com/ucfzem/ucfzem.github.io

## Projects worked on

### 1. avito-annonce
- Reviewed CONVERSATION.md and index.html
- **Repo:** https://github.com/ucfzem/avito-annonce
- **Live:** https://ucfzem.github.io/avito-annonce/ | https://avito-annonce.vercel.app/

### 2. api-job-finder
- **Fix:** Arbeitnow `created_at` Unix seconds → milliseconds (`normalizeArbeitnow` line 343)
- **Fix:** `job_type` translation via `translateJobType()` + `JOB_TYPE_MAP` + `CONTRACT_TYPES` normalization
- **Fix:** Added `type_parttime` i18n key for 5 languages (FR/EN/ES/AR/DE)
- **Blocked:** Himalayas, RemoteOK, Remotive return 0 results (CORS/proxy issue on GitHub Pages)
- **Blocked:** Job titles/descriptions remain in source language (DeepL/Google Translate API needed)
- **Repo:** https://github.com/ucfzem/api-job-finder
- **Live:** https://ucfzem.github.io/api-job-finder/

### 3. web-dev (ucfzem.github.io repo)
- **Fix:** Removed floating WhatsApp CTA (`.floating-cta` CSS + HTML `<a>` + `pulse-cta` keyframe)
- **Fix:** Updated contact email `contact@code.ma` → `ucfzem@gmail.com`
- **Repo:** https://github.com/ucfzem/ucfzem.github.io (path: `web-dev/`)
- **Live:** https://ucfzem.github.io/web-dev/

### 4. promptgenius
- **Fix:** Horizontal overflow on mobile (`overflow-x: hidden` on html/body, `max-width: 100vw`, `word-wrap: break-word` on h1, `max-width: 100%` on containers)
- **Deploy:** Cloudflare Worker updated (base64-encoded HTML via API PUT)
- **Note:** Worker not auto-synced from GitHub — requires manual token or dashboard re-deploy
- **Repo:** https://github.com/ucfzem/promptgenius
- **Live:** https://promptgenius.azer-tyu199p.workers.dev/

### 5. microinvoice
- **New repo:** Extracted from `ucfzem.github.io/microinvoice/` to dedicated repo
- **Fix:** Invoice preview white background (`color-scheme: light only` + `background: #fff !important`)
- **Fix:** Preview scaled to content height (no giant A4 empty space)
- **Fix:** PDF download — replaced jsPDF imperative drawing with clean HTML/CSS print layout, then reverted to jsPDF direct download
- **Fix:** A4 portrait forced via `doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })`
- **Fix:** Clean professional layout: gold header borders, gray table header, gold grand total, contacts section
- **Fix:** `formatCurrency` → `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- **Fix:** Total line clearance (increased y padding after gold line to prevent overlap)
- **Fix:** Removed min page height floor (avoids empty space below content)
- **Fix:** Lang switcher reordered — fr first, default changed to `'fr'`
- **Removed:** All print-mode code (`window.print()`, `@page`, `@media print`, `#printInvoice` div)
- **Repo:** https://github.com/ucfzem/microinvoice
- **Live:** https://ucfzem.github.io/microinvoice/

### All repos
https://github.com/ucfzem?tab=repositories

---

### 7. photographer — Site portfolio photo
- **Carousel:** Ajout d'un carrousel 15 images Unsplash entre Contact et Footer
- **Design:** Adapté au thème du site (navy/or, Playfair Display, Montserrat)
- **i18n:** FR/EN/NL/ES/AR — label + titre de section
- **Autoplay:** 4s, navigation prev/next + dots cliquables
- **Carousel fix:** ✅ ajout balise fermante `</div>` pour `.gallery-grid` (manquante)
- **Carousel images:** Changé Unsplash → 15 photos personnelles (haspict-01 à 15)
- **Worker:** `/photographer/` sert le HTML depuis KV, les images carousel depuis `raw.githubusercontent.com`
- **Live:** https://ucfzem.azer-tyu199p.workers.dev/photographer/

## Session — 08/07/2026 (afternoon)

### 8. photographer — Carousel RTL + Deploys
- **Fix:** CSS RTL pour le carousel (`scaleX(-1)` track, boutons prev/next inversés, dots inversés)
- **KV Cloudflare:** `photographer:index.html` mis à jour avec version RTL
- **GitHub:** Commit `4513c80` pushé — "carousel: add RTL support for Arabic mode"
- **Vercel:** Déploiement en attente (CLI non disponible)
- **Repo:** https://github.com/ucfzem/ucfzem.github.io
- **Live (Worker):** https://ucfzem.azer-tyu199p.workers.dev/photographer/
- **Live (GitHub Pages):** https://ucfzem.github.io/photographer/
- **Live (Vercel):** https://ucfzem-works.vercel.app/photographer/

## Session — 08/07/2026

### 6. ucfzem-ai — Mon Assistant IA
- **New page:** Landing page "Mon Assistant IA" with interactive chat
- **Theme:** Dark mode (brown/gold/yellow) + Light mode (beige/brown/gold) — default dark
- **i18n:** 4 langues — 🇫🇷 FR, 🇬🇧 EN, 🇪🇸 ES, 🇲🇦 AR (drapeau marocain)
- **API:** `/api/chat.js` — Vercel serverless function
- **Backend iterations:** OpenRouter (DeepSeek/Llama/Gemma) → Google Gemini direct → Hugging Face → ✅ **GitHub Models** (gpt-4o-mini)
- **Auth:** GitHub PAT (`GH_TOKEN`) via `models.inference.ai.azure.com` — 200 req/day, free, no région block
- **Deploy:** Vercel + Cloudflare DNS proxy (ucfzem.eu.org — en attente propagation)
- **Env:** `GH_TOKEN` configured on Vercel
- **Chat:** Interactive input + typing indicator + real API responses
- **Clear button:** 🗑 vidage de l'historique
- **Copy button:** 📋 copie des réponses de l'IA au survol
- **Persist history:** 💾 sauvegarde de la discussion dans localStorage (survit au refresh)
- **Works page:** Ajouté dans la section locked (verrouillée), au milieu
- **Repo:** https://github.com/ucfzem/ucfzem.github.io (path: `ucfzem-ai/` + `api/`)
- **Live (Vercel direct):** https://ucfzemgithubio.vercel.app/ucfzem-ai/
- **Live (GitHub Pages — sans API):** https://ucfzem.github.io/ucfzem-ai/
- **Domain (en attente):** https://ucfzem.eu.org/ucfzem-ai/

## Session — 08/07/2026 (evening) — Carousel GitHub Pages + Vercel Fix

### Problème
- **Vercel** : Les photos ne s'affichaient pas à cause du `trailingSlash: false` qui cassait les chemins relatifs (`/photographer/` → 308 → `/photographer`)
- **GitHub Pages** : Le sous-dossier `carousel/` retournait 404 (les images `haspict` n'étaient pas servies)
- **Cloudflare Worker** : OK

### Fix Vercel
- Ajout de `<base href="/photographer/">` dans le `<head>` pour que tous les chemins relatifs soient résolus correctement

### Fix GitHub Pages
- Les 15 images carousel déplacées de `photographer/carousel/haspict-XX.jpg` → `photographer/carousel-XX.jpg`
- Le JS mis à jour : `carousel/haspict-${...}.jpg` → `carousel-${...}.jpg`

### Commits
- `b9cb8363` — photographer: add base href for Vercel trailing slash fix
- `584f16ee` — photographer: move carousel images to root dir for GitHub Pages compat
- `dbeefeed` — photographer: add carousel-XX.jpg images to root dir for Pages compatibility

### Liens
- **GitHub Pages :** https://ucfzem.github.io/photographer/
- **Vercel :** https://ucfzem-works.vercel.app/photographer/
- **Cloudflare Worker :** https://ucfzem.azer-tyu199p.workers.dev/photographer/
- **Repo :** https://github.com/ucfzem/ucfzem.github.io

## Session 2026-07-15 — PixellApp: Text visibility, stopPropagation, localStorage

### Root Cause
- Canvas `onDown` (mousedown/touchstart) resets `ai=-1` at line 282 before checking hits
- Clicks on toolbar/topbar/sheet buttons propagated to canvas, deselecting the active layer
- Debug code (red bg, green TEST text) left in text rendering further broke the canvas state

### User Rewrite Integrated
- Text stroke (`sw`/`so`) + shadow (`sb`/`sd`) + alignment (`al`)
- Layer reorder (▲/▼ buttons), duplicate layer
- `deepCloneLayers` + `reviveLayer` for proper Image undo serialization
- Overlay (`#ovl`) for sheet backdrop
- Shift-constrain resize for images
- metaKey+z/y for undo/redo

### Fixes Applied
1. **stopPropagation()** — `.bb[data-t]`, `.tb`/`.ebtn` (via `data-cmd` delegation), `.sh` containers, sheet buttons — prevents canvas `onDown` from firing on toolbar/sheet clicks
2. **Toolbar buttons** — changed from `onclick="func()"` to `addEventListener` with stopPropagation; removed duplicate onclick from dup/del buttons
3. **Text rendering** — removed duplicated `font`/`textAlign`; each line wrapped in `ctx.save/restore` for shadow isolation; shadow offsets zeroed; stroke+fill in proper order
4. **Bold/Italic** — added click handlers to toggle `.act` class on B/I buttons
5. **Checkerboard** — fixed missing braces on second `fillRect`
6. **wPos** — fixed parenthesis placement in touch clientX/clientY
7. **Cancelable guards** — `if(e.cancelable) e.preventDefault()`
8. **Compact sheets** — `max-height: 70dvh → 40dvh`; compact form elements (padding, fonts, inputs, color swatches, sliders)
9. **localStorage persistence** — `saveProject()` called after every mutation (add/delete/reorder/edit/drag/import/undo/redo); `loadProject()` on init restores layers, dimensions, selection
10. **Text font scaling** — resizing text layer selection handles now scales `l.fs` proportionally
11. **Image aspect ratio** — auto-constrained by default on resize; hold Shift to freely deform
12. **Gaussian blur shadow** — shadow color + blur controls added to layer properties panel, works for image/bg layers
13. **Draggable toolbar** — grab the `⠿` grip to reposition toolbar; snaps to top/bottom/left/right edges; tap grip to cycle positions (mobile-friendly)
14. **Added to Works page** — PixellApp added to locked projects with ✦ icon, placed in middle of list; duplicate VoxForge/Sounds of Nature entries cleaned up

### Commits
- `e63c472` — PixellApp: fix text visibility — use textarea value, larger size, fix render bg
- `20e6455` — PixellApp: merge undo serialization, mobile buttons, event guard, fix addShape duplicates
- `eeea82d` — Debug: add console logs, red border on text, larger default font
- `2fa3a1b` — Save user's full rewrite: text stroke/align, layer reorder, dup, deepClone undo, plus bugfixes
- `7edcbec` — Debug: red bg on text, console logs in render/addText/dr
- `2fb7ae7` — Add alert+try/catch to debug addOrUpdateText not firing
- `e9633f5` — Fix text button using addEventListener, fix Delete key with closest() guard+Backspace, remove debug code
- `9153136` — fix: stopPropagation on toolbar/sheets, text rendering cleanup, B/I toggles
- `d160f8f` — fix: compact sheet height and form elements so text is visible during editing
- `d3fc146` — feat: localStorage persistence across page refresh
- `0aaac49` — fix: scale text font size when resizing selection handles
- `4f84a4c` — fix: auto-constrain image aspect ratio on resize (shift=free deform)
- `1362c2e` — feat: Gaussian blur shadow for image/bg layers
- `cdf68d2` — feat: draggable toolbar — snap to top/bottom/left/right
- `194d984` — fix: bar drag follows finger with transform, add tap-to-cycle on grip
- `1fa5bd3` — feat: add PixellApp to locked projects with ✦ icon, middle placement
- `6cc57a6` — fix: remove duplicate VoxForge and Sounds of Nature entries
- `181e5a6` — feat: organize locked projects into collapsible folders (IA & Vision, Audio & Voix, Design & Créatif, Carrière & Finance, Apprentissage, Partage & Média, Premium, Autres)

### Liens
- **GitHub Pages PixellApp :** https://ucfzem.github.io/pixellapp/
- **Works page :** https://ucfzem.github.io/works/
- **Repo :** https://github.com/ucfzem/ucfzem.github.io
- **Backup :** https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION_BACKUP.md
