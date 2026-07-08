# Conversation Backup

## Session 2026-07-08 — Carousel RTL + Deploy

### Objectif
Ajouter le support RTL (arabe) au carousel photo, mettre à jour KV Cloudflare, push GitHub, déploiement Vercel.

### Modifications
- `photographer/index.html` : CSS RTL pour le carousel (`scaleX(-1)` pour le track, inversion des boutons prev/next)
- KV Cloudflare mis à jour avec la nouvelle version
- Commit `4513c80` : "carousel: add RTL support for Arabic mode"
- `.gitignore` : ajout de `photographer/haspict/`

### Liens
- GitHub Pages : https://ucfzem.github.io/photographer/
- Cloudflare Worker (protégé) : https://ucfzem.azer-tyu199p.workers.dev/photographer/
- Vercel (déploiement échoué - DNS bloqué) : `vercel deploy --token <token>`
- GitHub Repo : https://github.com/ucfzem/ucfzem.github.io

### TODO
- Retenter déploiement Vercel depuis un autre réseau (DNS api.vercel.com bloqué ici) — 07/07/2026

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
