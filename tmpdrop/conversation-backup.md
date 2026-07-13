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
2. Created `api/groq-vision.js` — Vercel serverless function calling Groq `meta-llama/llama-4-scout-17b-16e-instruct` with image analysis
3. Updated frontend generate button to send image+settings to backend API instead of simulating prompts
4. Set `GROQ_API_KEY` environment variable in Vercel project
5. Fixed deprecated model — switched from `llama-3.2-11b-vision-preview` to `meta-llama/llama-4-scout-17b-16e-instruct`
6. Deployed to Vercel production

## Links
- **Sounds of Nature**: https://ucfzem.eu.org/sounds-of-nature (or https://ucfzem-works.vercel.app/sounds-of-nature)
- **Image to Prompt**: https://ucfzem.eu.org/image2prompt
- **GitHub repo**: https://github.com/ucfzem/ucfzem.github.io
- **Source file**: https://github.com/ucfzem/ucfzem.github.io/blob/main/image2prompt/index.html
- **API function**: https://github.com/ucfzem/ucfzem.github.io/blob/main/api/groq-vision.js
- **Vercel project**: https://vercel.com/ucfzem-s-projects/ucfzem.github.io

## Files
- `image2prompt/index.html` — Full UI for Image to Prompt tool
- `api/groq-vision.js` — Vercel serverless function for Groq vision API

---

# Session 3 — Jul 13 2026

## Summary
Refactored **Sounds of Nature** button layout from flexbox to CSS Grid — clean 2-column grid on mobile, scaling up to 5 columns on ultrawide screens.

## Changes
1. Changed `.button-grid` from `display:flex;flex-wrap:wrap` to `display:grid;grid-template-columns:repeat(2,minmax(0,1fr))`
2. Removed all flex-based `flex:0 1 calc(...)` responsive rules
3. Added container query breakpoints: 2 cols → 3 at 600px → 4 at 900px
4. Updated media queries for all viewport ranges
5. Added `overflow:hidden;text-overflow:ellipsis;white-space:nowrap` to buttons for clean text clipping

## Files
- `sounds-of-nature/index.html` — Grid layout refactor

---

# Session 4 — Jul 13 2026

## Summary
Replaced **image2prompt** UI with **Aurionary Arts** design — dark teal theme, glassmorphism cards, floating prompt overlay. No external image dependencies (SVG icons, CSS logo). Deployed to Cloudflare Pages.

## Changes
1. Replaced the entire `image2prompt/index.html` with Aurionary Arts visual design
2. Removed Tailwind CSS dependency (pure CSS, Open Sans font)
3. Replaced external image assets with inline SVG icons and CSS logo
4. Kept full functionality: Groq API, drag-drop upload, copy/download
5. Added `api/groq-vision.js` to Cloudflare deployment (note: CF Pages doesn't support Vercel serverless functions)

## Links
- **Cloudflare**: https://ucfzem-github-io.pages.dev/image2prompt
- **Vercel**: https://ucfzem.eu.org/image2prompt (DNS pending) or https://ucfzemgithub-2x63wtmx2-ucfzem-s-projects.vercel.app/image2prompt
- **GitHub**: https://github.com/ucfzem/ucfzem.github.io/blob/main/image2prompt/index.html
- **Sounds of Nature**: https://ucfzem-works.vercel.app/sounds-of-nature

# Session 5 — Jul 13 2026

## Summary
Fixed upload issues in image2prompt — moved file input outside dropzone to avoid event conflicts, fixed preview image sizing (removed 150px cap, full-width with max-height), replaced cheap "AA" box logo with proper SVG brand mark.

## Changes
1. Moved `<input type="file">` outside the dropZone container to prevent click event conflicts
2. Removed redundant browseLink check in dropZone click handler
3. Increased preview image from 150px max-width to full-width with `max-height:50vh`
4. Replaced the "AA" div logo with an inline SVG: gradient teal box with serif "A" + "Aurionary ARTS" text
5. Cleaned up unused CSS classes

## Files
- `image2prompt/index.html` — All fixes above

---

# Session 6 — Jul 13 2026

## Summary
Added **Play ▶️ button** to **VoiceForge** — reads the generated article/story aloud using browser TTS (SpeechSynthesis API) in all 4 languages (EN/FR/ES/AR). Auto-stops on language switch, clean play/stop toggle.

## Changes
1. Added Play button with play/stop icon toggle next to Copy/Download/Clear
2. Added `play`/`stop` translations to all 4 languages (EN/FR/ES/AR)
3. Added TTS JavaScript: `SpeechSynthesisUtterance` with language-matched voice selection
4. Play button toggles to Stop square icon while speaking
5. TTS auto-cancels when language is switched or content is cleared
6. Deployed to Vercel + pushed to GitHub

## Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html

---

## Session 3 — TTS fix + Persistence + Mobile overflow fix

### Changes
1. **TTS play button not speaking**: Removed `getVoices()` voice lookup (async, empty on first call). Now just sets `utterance.lang` and lets the browser pick the right voice.
2. **Groq key lost on refresh**: Auto-saves key on page load (shows "Key saved" confirmation).
3. **Generated article lost on refresh**: Saves title, body, and questions to `localStorage`; restores on page load.
4. **API key row overflow on mobile**: Added `.groq-key-row` CSS with `flex-wrap: wrap` + min-width on input + column stack at 480px. Global `box-sizing: border-box` and `overflow-x: hidden` added too.
5. All pushed to GitHub + deployed to Vercel.

### Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html

---

## Session 5 — Fixed oversized API key input (password-manager bar)

### Changes
1. **API key `<input>` showing oversized box with dotted line** — caused by browser password-manager injecting UI into the password field. Fixed with `autocomplete="new-password"` to prevent injection, plus fixed `height: 44px; line-height: 44px` on `.groq-key-row input` and removed conflicting `py-2` Tailwind padding.
2. Pushed + deployed.

### Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html

---

## Session 4 — Toolbar overflow wrap + async TTS voice guard

### Changes
1. **Toolbar buttons (Play/Copy/.md/Clear) overflowing off right edge**: Added `flex-wrap` to the button row container so buttons drop to next line on narrow screens.
2. **Play button inactive on Android Chrome (async voice loading)**: `speechSynthesis.getVoices()` returns empty on first call. Added guard: if no voices available, defer `speak()` to the `onvoiceschanged` callback. Also now explicitly picks a matching voice by language (or falls back to first available).
3. Both fixes pushed + deployed.

### Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html

---

## Session 6 — TTS timeout fallback + error protection

### Changes
1. **Play button silently hangs** when `onvoiceschanged` never fires (known Android Chrome): Added 500ms `setTimeout` fallback + `addEventListener` instead of assignment.
2. **Clear button breaks** if `speechSynthesis.cancel()` throws: wrapped in `try/catch`. Entire `doSpeak()` also try/catch protected.
3. Pushed + deployed.

### Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html

---

## Session 7 — Defensive TTS: guard every speechSynthesis call

### Changes
1. Both **Lecture** and **Effacer** silently dead because they call `speechSynthesis.cancel()`/`.speak()` which can throw in embedded webviews that lack full Web Speech API support.
2. Every `speechSynthesis` call now guarded by `try/catch` + `console.error`. `stopTTS` checks `window.speechSynthesis` exists before calling `.cancel()`. `speakText` alerts the user if TTS is unsupported.
3. Pushed + deployed.

### Links
- **VoiceForge live**: https://voiceforge-delta.vercel.app
- **VoiceForge GitHub**: https://github.com/ucfzem/VoiceForge
- **VoiceForge source**: https://github.com/ucfzem/VoiceForge/blob/main/index.html
