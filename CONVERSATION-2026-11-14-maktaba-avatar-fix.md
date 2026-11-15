# Maktaba Avatar Fix - 2026-11-14

## Problem

The Maktaba header avatar was a broken image because it pointed to an expired Droppy URL:

`https://ucfzem.azer-tyu199p.workers.dev/droppy/dl/4851aaca/1794599242989.jpg`

That URL returned `404 text/plain`.

## Fix

- Replaced the avatar with the local asset `../assets/maktaba-icon.png` (512x512 PNG).
- Removed the dead Droppy URL from `works/Maktaba/sw.js`.
- Bumped the service worker cache from `maktaba-main-v1` to `maktaba-main-v2` so cached pages receive the fix.

Deploy commit: `5b0438d` (`Fix Maktaba avatar and refresh offline cache`).

## Verification

Tested on both origins, online and offline:

- `https://ucfzem.github.io/works/Maktaba/`
- `https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/`

Results:

- Broken images: 0.
- Avatar loaded at 512x512.
- No page or request errors.
- Offline reload still served the page and avatar.
