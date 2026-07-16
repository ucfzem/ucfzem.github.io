# Session Backup — 2026-07-16

## Tashkeel — Fixes & Deployment

### Issues Fixed
1. **CORS** — Added `Access-Control-Allow-Origin`, `OPTIONS` preflight handler
2. **"fetch failed"** — Deployed with Node.js 20 runtime (previous deploy used incompatible Node)
3. **Missing shaddah (شدة)** — Updated Groq system prompt to explicitly demand `ّ`
4. **Blind accessibility** — Added vibration feedback (short buzz = success, triple = error)
5. **UX** — Added labels to distinguish original vs result, clear + copy buttons for both fields, removed default text

### Files Changed
- `tashkeel/api/tashkeel.js` — CORS, OPTIONS, timeout, User-Agent, improved prompt for shaddah
- `tashkeel/index.html` — Labels, clear/copy buttons, vibration, no default text
- `tashkeel/vercel.json` — Added `functions` config with `maxDuration: 30`
- `tashkeel/package.json` — Added to pin Node.js >= 18

### Git Log (new commits)
```
9c7dd33 tashkeel: clear/copy buttons, remove default text
9ea8340 tashkeel: keep original text untouched, add labels
8dfb2c8 tashkeel: demand shaddah in system prompt
52b21de tashkeel: put result in textarea + vibrate feedback for blind use
4f5d4fc tashkeel: fix vercel.json runtime format
ae24886 tashkeel: fix CORS, add Node 20 runtime, improve error handling
```

### Vercel Deployments
| ID | Status | URL |
|----|--------|-----|
| Latest | Ready (aliased) | https://tashkeel-five.vercel.app |
| Inspect | — | https://vercel.com/ucfzem-s-projects/tashkeel/FDoxpZcgSTWmsfkuszjQntJpc9iE |

### API Keys (saved locally, DO NOT COMMIT)
- **Groq**: saved in session
- **GitHub PAT**: saved in session
- **Vercel**: saved in session

### Links
- **Frontend (Vercel)**: https://tashkeel-five.vercel.app/
- **Frontend (GitHub Pages)**: https://ucfzem.github.io/tashkeel/
- **API endpoint**: https://tashkeel-five.vercel.app/api/tashkeel
- **GitHub repo**: https://github.com/ucfzem/ucfzem.github.io
- **Vercel project**: https://vercel.com/ucfzem-s-projects/tashkeel

### Notes
- Vercel free tier: 100 deploys/day via API — hit limit, final deploy blocked until tomorrow
- GitHub Pages auto-deploys from `main` branch
