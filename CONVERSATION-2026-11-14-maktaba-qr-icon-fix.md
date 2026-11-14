# Conversation Backup: Maktaba QR + Herbal Icon Fix

**Date:** 2026-11-14
**Status:** Completed, deployed, and live-verified
**Repository:** https://github.com/ucfzem/ucfzem.github.io
**Live app:** https://ucfzem.github.io/works/Maktaba/

## Task

- Fix the Maktaba QR image and row 29 Herbal icon.
- Use the user-supplied new QR if a valid path is provided.
- Point QR image and both download links to `maktaba-qr-v2.png`.
- Copy a real al-a3chab icon to `works/Maktaba/icons/herbal.png` if the existing row 29 image source is not HTTP 200.
- Add the QR and Herbal icon to the Maktaba service worker precache list and bump the cache name.
- Do not touch the root service worker's book/offline logic.
- Commit, push, and prove deployment with md5 and `curl -sI`.

## Important QR Note

No exact QR source path was provided. The task contained the literal placeholder
`<full path to the file>`, and `/tmp/qr-new-probe` returned `Not found`.

No new QR was generated or invented. The existing committed file
`works/Maktaba/maktaba-qr-v2.png` was used and verified to decode to:

```text
https://ucfzem.github.io/works/Maktaba/
```

If a different QR image is intended, replace this file and bump the Maktaba cache
again so phones do not keep the old image.

## Changes Made

### `649a9ba` — Maktaba: use local herbal icon and precache QR/icon (cache v10)

- Added `works/Maktaba/icons/herbal.png` from the al-a3chab-attebiah repository.
- Replaced row 29's inline `data:image/jpeg;base64` icon with `icons/herbal.png`.
- Removed the QR SVG `<source>` so the PNG is displayed.
- Pointed the QR image and both download buttons to `maktaba-qr-v2.png`.
- Added `download` attributes to both QR buttons.
- Added these to `works/sw.js` `CORE`:
  - `./Maktaba/maktaba-qr-v2.png`
  - `./Maktaba/icons/herbal.png`
- Bumped the Maktaba cache from `maktaba-v9` to `maktaba-v10`.

### `d237e91` — Fix Pages checkout: remove broken session-backup-repo gitlink

Commit `1609285` accidentally added `session-backup-repo` as a gitlink
(mode `160000`) without a `.gitmodules` file.

GitHub Pages checkout failed with:

```text
fatal: No url found for submodule path 'session-backup-repo' in .gitmodules
```

Fix:

- Removed the broken gitlink from the index.
- Added `session-backup-repo/` to `.gitignore`.
- Pushed the fix.
- GitHub Pages then built successfully.

The root `sw.js` book/offline logic was not modified.

## Deployment Verification

### QR md5

```text
local: 5fda48fdfe1af3a93254e0ce8a2035de  works/Maktaba/maktaba-qr-v2.png
live:  5fda48fdfe1af3a93254e0ce8a2035de  -
```

### QR headers

```text
HTTP/2 200
content-type: image/png
```

### Herbal icon md5

```text
local: 8b2d6ee413ee40eb77835ca5fff04503  works/Maktaba/icons/herbal.png
live:  8b2d6ee413ee40eb77835ca5fff04503  -
```

### Herbal icon headers

```text
HTTP/2 200
content-type: image/png
```

### Live index references

```text
547: <img class="app-icon" src="icons/herbal.png" ...>
568: <img src="maktaba-qr-v2.png" ...>
573: <a class="btn" href="maktaba-qr-v2.png" download>Download QR</a>
574: <a class="btn secondary" href="maktaba-qr-v2.png" download>Download PNG</a>
```

### Live service worker

```js
const CACHE = 'maktaba-v10';
...
'./Maktaba/maktaba-qr-v2.png',
'./Maktaba/icons/herbal.png',
```

### Live QR decode

```text
https://ucfzem.github.io/works/Maktaba/
```

## Final State

- Remote `main`: `d237e91`
- GitHub Pages build: `built`
- Root service worker: unchanged
- Old Maktaba caches are deleted by the existing `maktaba-` cache cleanup.

## Phone Note

After deployment, clear site data once for `https://ucfzem.github.io` so the
`maktaba-v10` service worker replaces the old cached QR and icon.

## Links

- Live Maktaba: https://ucfzem.github.io/works/Maktaba/
- QR PNG: https://ucfzem.github.io/works/Maktaba/maktaba-qr-v2.png
- Herbal icon: https://ucfzem.github.io/works/Maktaba/icons/herbal.png
- Maktaba service worker: https://ucfzem.github.io/works/sw.js
- Repository: https://github.com/ucfzem/ucfzem.github.io
- QR/icon commit: https://github.com/ucfzem/ucfzem.github.io/commit/649a9ba
- Pages checkout fix commit: https://github.com/ucfzem/ucfzem.github.io/commit/d237e91
