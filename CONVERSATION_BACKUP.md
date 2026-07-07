# Conversation Backup — 07/07/2026

## Projects worked on

### 1. avito-annonce
- Reviewed CONVERSATION.md and index.html
- **Repo:** https://github.com/ucfzem/avito-annonce
- **Live:** https://ucfzem.github.io/avito-annonce/ | https://avito-annonce.vercel.app/

### 2. api-job-finder
- **Fix:** Arbeitnow `created_at` Unix seconds → milliseconds (`normalizeArbeitnow`)
- **Fix:** `job_type` translation via `translateJobType()` + `JOB_TYPE_MAP` + `CONTRACT_TYPES` normalization
- **Fix:** Added `type_parttime` i18n key for 5 languages
- **Repo:** https://github.com/ucfzem/api-job-finder
- **Live:** https://ucfzem.github.io/api-job-finder/

### 3. web-dev (ucfzem.github.io repo)
- **Fix:** Removed floating WhatsApp CTA (`.floating-cta` CSS + HTML + `pulse-cta` keyframe)
- **Fix:** Updated contact email `contact@code.ma` → `ucfzem@gmail.com`
- **Repo:** https://github.com/ucfzem/ucfzem.github.io (path: `web-dev/`)
- **Live:** https://ucfzem.github.io/web-dev/

### 4. promptgenius
- **Fix:** Horizontal overflow on mobile (`overflow-x: hidden` on html/body, `max-width: 100vw`, `word-wrap: break-word` on h1, `max-width: 100%` on containers)
- **Deploy:** Cloudflare Worker updated (base64-encoded HTML in B64 var)
- **Repo:** https://github.com/ucfzem/promptgenius
- **Live:** https://promptgenius.azer-tyu199p.workers.dev/

## All user repos
https://github.com/ucfzem?tab=repositories
