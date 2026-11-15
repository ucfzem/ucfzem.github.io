# Maktaba Avatar Fix - 2026-11-14

## Problem

The Maktaba header avatar was a broken image because it pointed to an expired Droppy URL:

`https://ucfzem.azer-tyu199p.workers.dev/droppy/dl/4851aaca/1794599242989.jpg`

That URL returned `404 text/plain`.

## Initial fix (superseded)

- Replaced the avatar with the local asset `../assets/maktaba-icon.png` (512x512 PNG).
- Removed the dead Droppy URL from `works/Maktaba/sw.js`.
- Bumped the service worker cache from `maktaba-main-v1` to `maktaba-main-v2` so cached pages receive the fix.

Deploy commit: `5b0438d` (`Fix Maktaba avatar and refresh offline cache`).

The local icon was only a temporary placeholder; it was not the user's avatar.

## Correction - 2026-11-15

User clarified that the real avatar is this image:

`https://tmpfiles.org/wCAJycehQyQ0/1794599242989.jpg`

The tmpfiles page wraps the image; its direct URL was:

`https://tmpfiles.org/dl/1794736918.bd99545991c2707d/wCAJycehQyQ0/1794599242989.jpg`

It is the same 739x768 JPEG that was previously hosted at the expired Droppy URL.

Changes:

- Downloaded the direct JPEG and saved an exact local copy as `works/Maktaba/avatar.jpg`.
- JPEG, 739x768, 228207 bytes, MD5 `680435c76271546ef37c6572c18e1f28`.
- Updated the header avatar `src` from `../assets/maktaba-icon.png` to `avatar.jpg`.
- Added `./avatar.jpg` to the Maktaba service worker core cache.
- Bumped the service worker cache from `maktaba-main-v2` to `maktaba-main-v3`.

Deploy commit: `cd6f3bc` (`Restore Maktaba avatar image`).

## Verification

Tested on both origins, online and offline:

- `https://ucfzem.github.io/works/Maktaba/`
- `https://ucfzem.azer-tyu199p.workers.dev/works/Maktaba/`

Results:

- Broken images: 0.
- Avatar loaded at 739x768 from `avatar.jpg`.
- Service worker active with cache `maktaba-main-v3`.
- Avatar present in the offline cache.
- Offline reload still served the page and avatar.
- Live avatar MD5 matched the local file on both origins:
  `680435c76271546ef37c6572c18e1f28`.
- No page or request errors.
