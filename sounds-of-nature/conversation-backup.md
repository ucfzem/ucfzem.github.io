# Sounds of Nature — Conversation Backup

## Summary
Created and deployed a nature soundboard with 16 loopable MP3 sounds, dark green theme, Google Fonts, SVG logo.

## Key Events
1. Created project `sounds-of-nature/` with index.html + 16 MP3s in `assets/`
2. Dark green radial-gradient theme, glassmorphism cards
3. Initial audio-on-load approach → refactored to audio-on-click (avoids autoplay blocking)
4. Removed Font Awesome dependency (replaced with emoji)
5. **Bug 1 — Silent Vercel**: Vercel redirects `/sounds-of-nature/` → `/sounds-of-nature` (strips trailing slash). Relative path `assets/file.mp3` resolved to `https://.../assets/file.mp3` → 404. Fix: absolute path `/sounds-of-nature/assets/`
6. **Bug 2 — Coq2 unstoppable**: `playing[id] = audio` was set inside `.then()` of `audio.play()`. On slow connections, the promise resolves asynchronously, creating a window where a second click creates a duplicate audio that can never be stopped. Fix: store `playing[id] = audio` before `play()`
7. **UX — 10-15s load time**: Added `.loading` class (opacity pulse) + ⏳ prefix while audio buffers
8. User upgraded design: Google Fonts (Cinzel, Playfair Display, Plus Jakarta Sans), SVG logo, brand-header

## Current State
- **Vercel**: https://ucfzem-works.vercel.app/sounds-of-nature/ — production
- **GitHub Pages**: https://ucfzem.github.io/sounds-of-nature/ — fallback
- Loading state: ⏳ while buffering, then green glow when playing
- All 16 sounds loopable, stop-all button works
- CSS: `.sound-btn.loading` with pulse animation

## Files
- `sounds-of-nature/index.html` — single-file app
- `sounds-of-nature/assets/` — 16 MP3 sound files
- `sounds-of-nature/conversation-backup.md` — this file
