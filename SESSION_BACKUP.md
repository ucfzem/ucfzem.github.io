# Session Backup — 2026-07-16

## Projects

### 1. Sand Draw (WebGL)
- **URL**: https://ucfzem.github.io/drawingsand/
- **File**: `drawingsand/index.html` (50467 bytes, WebGL 2.0)
- **Features**: Brush, stamps (3), eraser, rake, 6 sand colors, undo/redo, wave, keyboard shortcuts
- **Status**: ✅ Live on GitHub Pages

### 2. Tashkeel (Arabic Diacritization)
- **Frontend (Vercel)**: https://tashkeel-five.vercel.app/
- **Frontend (GitHub Pages)**: https://ucfzem.github.io/tashkeel/
- **API**: https://tashkeel-five.vercel.app/api/tashkeel
- **Files**:
  - `tashkeel/index.html` — Arabic RTL frontend, Groq + HuggingFace key sections, clear/copy buttons, vibration
  - `tashkeel/api/tashkeel.js` — Vercel serverless function (CORS, OPTIONS, Groq/HF proxy, shaddah prompt)
  - `tashkeel/vercel.json` — functions config (maxDuration: 30)
  - `tashkeel/package.json` — Node >= 18
- **Status**: ✅ Deployed & aliased to `tashkeel-five.vercel.app`

## Git Log
```
9c7dd33 tashkeel: clear/copy buttons, remove default text
9ea8340 tashkeel: keep original text untouched, add labels
8dfb2c8 tashkeel: demand shaddah in system prompt
52b21de tashkeel: put result in textarea + vibrate feedback for blind use
4f5d4fc tashkeel: fix vercel.json runtime format
ae24886 tashkeel: fix CORS, add Node 20 runtime, improve error handling
0df231e update session backup
2e77bab works: add Tashkeel to locked AI projects
```

## Architecture
- Frontend (Vercel / GitHub Pages) → calls absolute Vercel API URL → Serverless function → Groq/HF API
- Serverless function handles CORS, proxies to Groq chat completions (Llama 3.3 70B)

## Key Decisions
- Groq preferred over HuggingFace (faster, no cold-start)
- Serverless proxy protects API keys
- System prompt updated to explicitly demand shaddah (ّ)

## Links
- **Tashkeel app**: https://tashkeel-five.vercel.app/
- **GitHub Pages mirror**: https://ucfzem.github.io/tashkeel/
- **GitHub repo**: https://github.com/ucfzem/ucfzem.github.io
- **Vercel project**: https://vercel.com/ucfzem-s-projects/tashkeel

## Notes
- Vercel free tier: 100 deploys/day via API
- Final deploy blocked by rate limit — deploy from dashboard or wait
- `.vercelignore` is empty
