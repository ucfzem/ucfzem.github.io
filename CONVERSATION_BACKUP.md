# Session Backup — 2026-07-01

## Session 1: Web Dev + Email Collector + SEO
- Added web-dev entry (`Code`) to locked projects with logo icon
- Removed "Uz" branding → kept only "Code"
- Created `/email-collector/` page with form + dark/light theme
- Replaced dead worker link with live GitHub Pages link
- Added GSC verification, updated sitemap

**Commits:** `a1449b9`, `cdf4b3b`, `e428617`, `f8e80cb`, `a5a70b2`, `c772227`, `8b3f71f`, `bd51777`, `9a0b5b0`

## Session 2: SaaS Email Generator + Flags SVGs
- Merged interactive SaaS Email Generator template (4 langs, 2 variants, copy-to-clipboard, metrics) with lead capture form
- Replaced all CSS-gradient flags with inline SVGs (FR tricolore, UK Union Jack, ES rojigualda, MA pentagram)

**Commits:** `67b4cc0`, `8ed4726`, `1ab6b94`, `d554c3a`, `2c8acbc`

## Session 3: Works Restructure + Fixes
- Moved EmailCollector from locked → public (position 8, under ElixirTech)
- Moved Code from public → locked with lock icon (🔒) + UZ logo bitmap
- Accidentally deleted 10 locked entries (Pristine, NanoLink, Brand Landing, NanoGen, Guide Freelance, Ultralengua Pro, TikTok Downloader, PromptGenius, Product Generator, Projets) — restored all
- Updated JSON-LD schema (position 8 → EmailCollector)
- Subtitle: 8 projets publics / 21 verrouillés

**Commits:** `d6d632d`, `335e1b0`, `bc66830`, `728c9eb`

## URLs
- **Main site:** https://ucfzem.github.io/
- **Works (linktree):** https://ucfzem.github.io/works/
- **Web Dev (Code portfolio):** https://ucfzem.github.io/web-dev/
- **Email Collector:** https://ucfzem.github.io/email-collector/
- **Blog:** https://ucfzem.github.io/blog.html
- **Blog article 1:** https://ucfzem.github.io/blog/automatiser-fiches-produit/
- **Blog article 2:** https://ucfzem.github.io/blog/seo-nextjs-app-router/
- **Sitemap:** https://ucfzem.github.io/sitemap.xml
- **Cloudflare Worker:** https://ucfzem.azer-tyu199p.workers.dev
- **GitHub repo:** https://github.com/ucfzem/ucfzem.github.io
- **Droppy:** https://ucfzem.github.io/droppy/
- **Droppy get:** https://ucfzem.github.io/droppy/get.html?id=EXAMPLE

## Session 4: Droppy Avatar + Binary Fix
- Fixed Cloudflare Worker binary corruption (0x89 → EF BF BD): switched from FormData upload to raw body with X-Filename/X-Password headers (bypasses Workers runtime UTF-8 decoding bug)
- Fixed CORS headers to allow custom headers
- Added avatar (468×468 PNG) as Droppy header logo, replacing the "D" badge
- Undeployed old corrupted KV entries (e152623d, ffc78c08); user re-uploaded via new method (d727bc15)
- Avatar saved permanently to `droppy/assets/avatar.png` (36×36px, rounded corners, gold border)

**Worker changes:**
- `kvGet` → returns `arrayBuffer()`
- `uploadDroppy` → reads `request.arrayBuffer()` directly + headers for metadata
- `corsOk` → allows `X-Filename`, `X-Password` headers
- `downloadDroppy` → serves raw binary from KV arrayBuffer

**Commits:** `e303e02`, `df272d7`, `e333f98`, `efa33fa`, `2d9959b`

## Session 5: EmailCollector Backend + Sitemap + R2 Prep + Droppy UX
- **EmailCollector backend**: added `__collect` endpoint to worker (stores leads in KV as `lead:{ts}:{rand}` with name, email, source, timestamp). Verified working.
- **Sitemap**: added `/droppy/` entry
- **R2 migration prepared**: worker code updated with `storeFile()`/`loadFile()` that use R2 REST API when `R2_BUCKET` is set, fall back to KV otherwise. Bloqué: user needs credit card to enable R2.
- **Droppy UX**: added "25 Mo max · 24h de rétention" info; result auto-scrolls into view after upload (no more manual scrolling).
- **Worker deployed** via API (`ucfzem` script, version `3e72a46a`)

**Worker changes:**
- Added `collectLead()` handler for `POST /__collect`
- Added `storeFile()`/`loadFile()` with R2 support + KV fallback
- Added `r2Api()` helper
- Preserved all existing Droppy + proxy + auth logic

**Commits:** (pending)
