# Maktaba Offline Final - 2026-11-23

## Commits
- `6c394e1` feat(maktaba): harden offline SW and app-shell routing
- `c235963` fix(maktaba): use replace for app-shell redirect and add backup

## Tested (local/static)
- `node --check` OK for Maktaba inline scripts, `works/Maktaba/sw.js`, `works/Maktaba/library/sw.js`.
- HTML parsed by Python `HTMLParser`; Maktaba `APPS` JSON parsed (36 items).
- All main SW precache paths exist locally (fonts, assets, QR, icons, index files).
- Fixed `?url=` shell redirect to use `location.replace` (avoids back-button loop).

## Offline reality (no false claim)
- Maktaba and Maktaba/library are offline-capable after first online load (their own SW/caches).
- **Not guaranteed**: every linked app inside Maktaba becomes fully offline automatically. Many are separate origins/paths/apps with their own SW/cache scope; they must be opened online once and each must have its own offline-capable SW/assets. Maktaba cannot force third-party/origin app internals offline.
- Local repo only contains some linked apps: a3lam-al-dawa, a3lam-al-3olama, shubuhat-wa-rudud, taw7id, tanger.

## Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Maktaba library: https://ucfzem.github.io/works/Maktaba/library/
- Maktaba raw SW: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/works/Maktaba/sw.js
- Backup: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-23-maktaba-offline-final.md
