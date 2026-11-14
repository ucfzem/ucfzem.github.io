# Conversation Backup — Maktaba QR Replacement (v3)

**Date:** 2026-11-14
**Task:** Replace the Maktaba QR image with the user-supplied image from Droppy share `7dee697a`.

## Source

- Share page: https://ucfzem.github.io/droppy/get.html?id=7dee697a
- Droppy list API: https://ucfzem.azer-tyu199p.workers.dev/droppy/list/7dee697a
- Listed filename: `maktaba-qr_QR.png` (underscore, no spaces)
- Download URL: https://ucfzem.azer-tyu199p.workers.dev/droppy/dl/7dee697a/maktaba-qr_QR.png

Earlier shares (`ad723c44`, `fb7abbcd`, `c49a5088`, `8a9174d1`) listed filenames containing spaces and returned `404 Not found` from the Droppy worker. The space-free filename in `7dee697a` downloaded successfully.

## Downloaded file

- Saved as: `works/Maktaba/maktaba-qr-v3.png`
- Type: PNG image data, 1048 x 1048, 8-bit/color RGB, non-interlaced
- Size: 387042 bytes
- MD5: `e6734ce08198c2829761003ed03451e5`
- QR decode (`zbarimg`): `https://ucfzem.github.io/works/Maktaba/`

## Changes

- `works/Maktaba/index.html`
  - QR `<img src>` → `maktaba-qr-v3.png`
  - Both download links → `maktaba-qr-v3.png`
- `works/sw.js`
  - Cache bumped: `maktaba-v10` → `maktaba-v11`
  - Precache entry: `./Maktaba/maktaba-qr-v2.png` → `./Maktaba/maktaba-qr-v3.png`
- Root `sw.js` and `works/Maktaba/library/sw.js` were not modified.
- Old `maktaba-qr-v2.png` remains in the repo but is no longer referenced.

## Commit and deployment

- Main repo commit: `aff71c3` — `Maktaba: replace QR with user image (cache v11)`
- Pushed to `origin/main`.
- GitHub Pages published successfully.

## Live verification

```text
local: e6734ce08198c2829761003ed03451e5  works/Maktaba/maktaba-qr-v3.png
live:  e6734ce08198c2829761003ed03451e5  https://ucfzem.github.io/works/Maktaba/maktaba-qr-v3.png
```

- Live HTTP status: `200`
- Live file: PNG image data, 1048 x 1048, 8-bit/color RGB, non-interlaced
- Live QR decode: `https://ucfzem.github.io/works/Maktaba/`
- Live `index.html` uses `maktaba-qr-v3.png` for the image and both download links.
- Live `works/sw.js` has `CACHE = 'maktaba-v11'` and precaches `./Maktaba/maktaba-qr-v3.png`.

## Links

- Maktaba page: https://ucfzem.github.io/works/Maktaba/
- New QR: https://ucfzem.github.io/works/Maktaba/maktaba-qr-v3.png
- Maktaba service worker: https://ucfzem.github.io/works/sw.js
- Commit: https://github.com/ucfzem/ucfzem.github.io/commit/aff71c3
