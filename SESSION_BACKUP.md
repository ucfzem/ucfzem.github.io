# Session Backup — 2026-07-15

## Projects

### 1. Sand Draw (WebGL)
- **URL**: https://ucfzem.github.io/drawingsand/
- **File**: `drawingsand/index.html` (50467 bytes, WebGL 2.0)
- **Features**: Brush, stamps (3), eraser, rake, 6 sand colors, undo/redo, wave, keyboard shortcuts
- **Status**: ✅ Live on GitHub Pages

### 2. Tashkeel (Arabic Diacritization)
- **GitHub Pages**: https://ucfzem.github.io/tashkeel/
- **Vercel**: https://tashkeel-five.vercel.app/
- **Vercel (latest)**: https://tashkeel-vzm62dank-ucfzem-s-projects.vercel.app/
- **Files**:
  - `tashkeel/index.html` — Arabic RTL frontend, dual Groq + HuggingFace key sections
  - `tashkeel/api/tashkeel.js` — Vercel serverless function (CORS, Groq + HF proxy)
  - `tashkeel/vercel.json` — rewrites config
- **Status**: ✅ Deployed to Vercel (`dpl_2fn1Acrbb4mBF6FxSaeS3ZTQ1U9i`). GitHub Pages build queued.
- **Link Tree**: Added to `works/index.html` locked AI projects section (🕌 icon, middle of folder)

## Git Log (ucfzem.github.io)
```
2e77bab works: add Tashkeel to locked AI projects
ebc35df update session backup
b0ae8e2 tashkeel: cleaner serverless function with better prompts
90eaafc tashkeel: use absolute Vercel API URL for GitHub Pages
f55d28c tashkeel: add Groq + HuggingFace dual key support
092d3d8 feat: switch tashkeel from HF to Groq API (Llama 3.3 70B)
34b67f8 fix: add serverless proxy for CORS + HF token security
df9d4e9 feat: add tashkeel - Arabic diacritization tool
0317078 force: redeploy drawingsand WebGL
4a86126 feat: deploy full WebGL 2.0 sand drawer with brush, stamps, eraser, rake, undo/redo, wave, sand colors
```

## Vercel Deployments
| ID | Status | URL |
|----|--------|-----|
| `dpl_2fn1Acrbb4mBF6FxSaeS3ZTQ1U9i` | Ready | tashkeel-vzm62dank-ucfzem-s-projects.vercel.app |
| `dpl_DoFdKv2U87nvvDR8TFFCUnHi4oz2` | Ready | tashkeel-five.vercel.app |

## API Keys (User: UcfZem7)
- **GitHub**: `ucfzem/ucfzem.github.io` — PAT in remote URL
- **Groq**: Get free key at console.groq.com (gsk_...)
- **HuggingFace**: Get key at huggingface.co/settings/tokens (hf_...)
- **Vercel**: Token saved in local session (DO NOT COMMIT)
- **Cloudflare**: Token saved in local session (DO NOT COMMIT)

## Architecture
- Frontend (GitHub Pages) → calls absolute Vercel API URL → Serverless function → Groq/HF API
- GitHub Pages can't run serverless functions, so frontend uses `https://tashkeel-five.vercel.app/api/tashkeel`
- Serverless function handles CORS and proxies to Groq chat completions or HF inference API

## Key Decisions
- Groq preferred over HuggingFace (faster, no cold-start)
- Serverless proxy protects API keys (never exposed to frontend)
- Both Groq and HuggingFace key sections kept in UI for flexibility
- Cloudflare Pages abandoned (API issues, GitHub integration broken)
- Vercel chosen for serverless functions

## Notes
- GitHub Pages uses Fastly CDN (not Cloudflare) — cache-control: max-age=600
- Vercel free tier: 100 deploys/day via API, unlimited from dashboard
- Cloudflare zone `ucfzem.eu.org` has limited token permissions (can verify, can't purge/modify)
