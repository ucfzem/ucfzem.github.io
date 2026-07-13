# Session Backup — Jul 13 2026

## Summary
Added 28 new sounds to **Sounds of Nature** (44 total), implemented **Service Worker background upload** for both **Droppy** and **TmpDrop** (close tab, upload continues), fixed Sport `.btn` duplicate CSS.

## Key Events
1. Identified Supabase project `vjhcfbwuyebiesxslwhe.supabase.co` is dead (DNS NXDOMAIN)
2. Discovered `ucfzem-worker` had droppy logic + KV storage but was on wrong worker
3. Merged droppy routes + supabase-proxy + auth into `ucfzem` worker → broke open proxy
4. Reverted to clean worker: open proxy + droppy routes + supabase-proxy only (no auth)
5. Fixed internal KV token (old token lacked KV perms → replaced with user's token)
6. Converted **tmpdrop** from Supabase to Cloudflare KV backend
7. Added 25 MB size limit, 24h KV TTL on all file + meta keys
8. Tmpdrop page served from raw GitHub (bypass Pages CDN cache)
9. File limit UI text updated (50→25 MB), auto-delete note added
10. **Sport**: Fixed duplicate `.btn` CSS rule — TV button visibility
11. **Sounds of Nature**: Added 28 new sounds (sheep, monkey, cow×2, chickens, horse, elephant, peacock, kitten, dog, cricket, singing bird, beach, fire, wind, blizzard, sheep bells, didgeridoo×2, boat horn, train×2, train horn×2, train tuk-tuk, train moving, mourning dove×2, mystery sound) — now 44 total sounds, all with 4-language i18n labels
12. **Droppy**: Service Worker (`sw.js`) for background upload — files upload via SW, close tab safely, reopen to see result
13. **TmpDrop**: Same SW pattern — single-file upload in background, no need to watch progress bar

## Current State
- **Droppy**: Upload→KV, 25 MB limit, 24h TTL, background upload via SW (close tab, reopen later)
- **Tmpdrop**: Upload→KV, 25 MB limit, 24h TTL, background upload via SW
- **Worker**: Clean open proxy + droppy + tmpdrop routes, no auth, no pings needed
- **Sounds of Nature**: 44 loopable sounds, 4-language i18n (FR/EN/ES/AR), RTL Arabic, dark green theme

## Files
- `sounds-of-nature/index.html` — 44-sound nature soundboard
- `sounds-of-nature/assets/` — 44 MP3 files
- `tmpdrop/index.html` — single-file upload app (KV + SW background)
- `tmpdrop/sw.js` — Service Worker for background tmpdrop upload
- `droppy/index.html` — multi-file upload app (KV + SW background)
- `droppy/sw.js` — Service Worker for background droppy upload
- `droppy/get.html` — download page

Tokens stored in worker script (not committed to this repo).

---

# Session 2 — Jul 13 2026

## Summary
Created **image2prompt** tool — image upload, style/medium/detail/mood controls, Groq vision API integration for real AI prompt generation. Deployed on Vercel with serverless function.

## Key Events
1. Created `image2prompt/index.html` — dark-themed UI with drag-drop upload, preview, style & medium selectors, detail slider, mood input, copy/download buttons
2. Created `api/groq-vision.js` — Vercel serverless function calling Groq `llama-3.2-11b-vision-preview` with image analysis
3. Updated frontend generate button to send image+settings to backend API instead of simulating prompts
4. Set `GROQ_API_KEY` environment variable in Vercel project
5. Deployed to Vercel production

## Links
- **Live site**: https://ucfzem.eu.org/image2prompt
- **GitHub repo**: https://github.com/ucfzem/ucfzem.github.io
- **Source file**: https://github.com/ucfzem/ucfzem.github.io/blob/main/image2prompt/index.html
- **API function**: https://github.com/ucfzem/ucfzem.github.io/blob/main/api/groq-vision.js
- **Vercel project**: https://vercel.com/ucfzem-s-projects/ucfzem.github.io

## Files
- `image2prompt/index.html` — Full UI for Image to Prompt tool
- `api/groq-vision.js` — Vercel serverless function for Groq vision API
