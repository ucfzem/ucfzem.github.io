# Conversation backup — Offline/PWA fixes for basair02 + works (2026-11-03)

Repo: ucfzem/ucfzem.github.io  |  Branch: main

## basair02
- Added PWA head tags: theme-color, description, apple-mobile-web-app-*,
  manifest link, favicon, apple-touch-icon.
- Registered service worker ./sw.js on load.
- Rewrote manifest.json: id, name, short_name, lang ar, dir rtl, scope,
  display standalone, categories, SVG icons (any + maskable).
- Rewrote sw.js (cache basair02-v5):
  * precache shell: ./, index.html, manifest.json, assets/favicon.svg,
    content-i18n.js, content-data.js
  * precache CDN as opaque: Tailwind browser@4, Google Fonts Tajawal CSS
  * runtime cache-first for fonts.googleapis.com, fonts.gstatic.com,
    cdn.jsdelivr.net
  * network-first for content-data.js with offline fallback
  * navigation fallback to cached index
  * static assets cache-first + background update
- Translation API (translate.googleapis.com) is online-only; offline the
  original Arabic text is shown (built-in fallback).

## works
- Added head tags: theme-color, manifest link, icon, apple-touch-icon.
- Added works/manifest.json (id /works/, icons maktaba-icon.png 512,
  avatar.png).
- Updated works/sw.js: cache works-v1.0.27, precache manifest.json and
  ./assets/basair02.svg (the new بصائر icon), keep all fonts and icons.
- External apps (Cloudflare Workers / Vercel) are separate origins and are
  not cacheable from works; they need their own offline support.

## Files
- basair02/index.html, basair02/manifest.json, basair02/sw.js
- works/index.html, works/manifest.json, works/sw.js

## Links
- https://ucfzem.github.io/
- https://ucfzem.github.io/works/
- https://ucfzem.github.io/basair02/
