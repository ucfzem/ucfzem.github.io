# Session Backup — 2026-07-15

## Projects

### 1. Sand Draw (WebGL)
- **URL**: https://ucfzem.github.io/drawingsand/
- **File**: `drawingsand/index.html` (50467 bytes, WebGL 2.0)
- **Features**: Brush, stamps (3), eraser, rake, 6 sand colors, undo/redo, wave, keyboard shortcuts
- **Status**: ✅ Committed & pushed. GitHub Pages CDN (Fastly) may cache old version for ~10 min

### 2. Tashkeel (Arabic Diacritization)
- **GitHub Pages**: https://ucfzem.github.io/tashkeel/
- **Vercel**: https://tashkeel-five.vercel.app/
- **Files**:
  - `tashkeel/index.html` — Arabic RTL frontend, dual Groq + HuggingFace key sections
  - `tashkeel/api/tashkeel.js` — Vercel serverless proxy (CORS, Groq + HF)
  - `tashkeel/vercel.json` — rewrites config
- **Status**: ✅ Code pushed. Vercel daily deploy limit hit (100/100), auto-deploys when limit resets (~24h)

## Git Log (ucfzem.github.io)
```
b0ae8e2 tashkeel: cleaner serverless function with better prompts
90eaafc tashkeel: use absolute Vercel API URL for GitHub Pages
f55d28c tashkeel: add Groq + HuggingFace dual key support
092d3d8 feat: switch tashkeel from HF to Groq API (Llama 3.3 70B)
34b67f8 fix: add serverless proxy for CORS + HF token security
0317078 (empty)
4a86126 fix WebGL brush
07c70bf3 WebGL engine
22af084 rewrite
```

## API Keys (User: UcfZem7)
- **GitHub**: `ucfzem/ucfzem.github.io` — PAT in remote URL
- **Groq**: Get free key at console.groq.com (gsk_...)
- **HuggingFace**: Get key at huggingface.co/settings/tokens (hf_...)

## Key Decisions
- Groq preferred over HuggingFace (faster, no cold-start)
- Serverless proxy protects API keys (never sent to frontend)
- Frontend calls absolute Vercel URL (`https://tashkeel-five.vercel.app/api/tashkeel`) because GitHub Pages can't run serverless functions
- Both Groq and HuggingFace key sections kept in UI for flexibility

## Notes
- GitHub Pages uses Fastly CDN (not Cloudflare) — cache-control: max-age=600
- Cloudflare Pages abandoned — API issues, GitHub integration broken
- Vercel free tier: 100 deploys/day, 10s timeout for serverless functions
- Cloudflare zone `ucfzem.eu.org` has very limited token permissions
