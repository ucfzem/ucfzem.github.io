# Conversation Backup — 07/07/2026

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
- **Fix:** PDF download format from fixed A4 to dynamic height based on content (`format: [210, pageHeight]`)
- **Repo:** https://github.com/ucfzem/microinvoice
- **Live:** https://ucfzem.github.io/microinvoice/

### All repos
https://github.com/ucfzem?tab=repositories
