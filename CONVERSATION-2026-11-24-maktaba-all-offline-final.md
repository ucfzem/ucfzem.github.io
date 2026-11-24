# Conversation Backup - Maktaba Offline Final

**Date:** 2026-11-24
**Repo:** `ucfzem/ucfzem.github.io` (main)
**Scope:** Make the Maktaba link tree work online/offline and verify all linked apps/books.
**Status:** Final committed, pushed, and live-verified.

## User Request
- Make `https://ucfzem.github.io/works/Maktaba/` work online and offline, including everything inside it.
- If any webapp/book does not show offline, report its name and exact reason.
- Push/deploy, save the conversation as a GitHub Markdown backup, and share all links.

## User Constraints
- Verify actual files, scopes, cache names, and live endpoints; do not guess from memory.
- Use relative paths and `{ scope: './' }` where appropriate.
- Use unique cache prefixes and bump versions when changing offline assets.
- Never write, echo, commit, or log secrets.
- Do not use destructive git operations; stage only specific files.

## Final Commits
- `58eecde` fix(offline): prefetch Maktaba linked app shells
- `b7a8a8d` fix(mapamundi): make service worker registration scope explicit
- `0fcb805` feat(pwa): add a3lam-al-3olama offline SW and harden app scopes
- `427f399` docs: backup maktaba offline final verification

## Main Changes
### Root service worker: `sw.js`
- Added `a3lam-al-3olama`, `shubuhat-wa-rudud`, and `taw7id` to `SHELLS` and `APPS`.
- Expanded `CDN_HOSTS` for runtime caching of shared external assets/APIs/media hosts.
- Bumped `DATA_MARKER` from `/__bookdata-v37` to `/__bookdata-v38` so existing clients re-prefetch data.
- Root worker remains scope `/` with `ucfzem-shells-v1` and `ucfzem-cdn-v1` caches.

### Maktaba: `works/Maktaba/index.html`
- Kept local SW registration, bumped to `./sw.js?v=maktaba-main-v10`.
- Added root SW registration and `prefetch-book-data` message on load.
- Added storage persistence request when available.

### Maktaba SW: `works/Maktaba/sw.js`
- Bumped `CACHE` from `maktaba-main-v9` to `maktaba-main-v10`.

### Cloudflare Worker
- Sanitized `/tmp/ucfzem-worker.js` to ES module form using `env.CF_TOKEN`, `env.CF_ACCOUNT`, `env.KV_NAMESPACE_ID`, and `env.R2_BUCKET`.
- No hardcoded secrets remain in the worker source.
- Deployed to Cloudflare worker `ucfzem`; API reported `success:true`, `modified_on 2026-11-24T00:17:33.21061Z`.
- Live worker checks: `/tanger` returns `301` to `/tanger/`; `/tanger/sw.js`, `/a3lam-al-dawa/sw.js`, and `/quran-majeed-v3/sw.js` return `200` with `application/javascript` and no-cache headers.

## Verification
- `node --check` passed for `sw.js` and `works/Maktaba/sw.js`.
- Local coverage check parsed all 36 Maktaba links: no same-origin slug missing from root `SHELLS` or root `APPS`.
- Live audit of all 36 Maktaba links: 36/36 pages returned `200`.
- Live audit of all 36 SW endpoints: 36/36 returned `200` with `application/javascript`.
- Live registration audit: all 36 apps had service worker registration in HTML or JS.
- Live deployed-page check after `58eecde`: Maktaba contains `data-root-sw` and `maktaba-main-v10`; root `/sw.js` contains `/__bookdata-v38`.

## Offline Reality
- After Maktaba itself has been loaded online once, the root SW installs and prefetches the 33 same-origin `ucfzem.github.io` apps/books.
- Those 33 can then open offline without visiting each app first.
- Three apps are on a separate origin (`ucfzem.azer-tyu199p.workers.dev`) and must be opened online once:
  - Quran Majeed: https://ucfzem.azer-tyu199p.workers.dev/quran-majeed-v3/
  - A'lam al-Dawa: https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
  - Tanger: https://ucfzem.azer-tyu199p.workers.dev/tanger/
- Service workers cannot cross origins, so Maktaba/root SW cannot install or cache those three apps.
- Dynamic remote media/API/map/image data is cached only after it has been fetched online; never-opened remote data cannot be precomputed offline.

## Security Notes
- GitHub and Cloudflare tokens were present in chat during deployment; no token values are stored in this file or the repo.
- Rotate/revoke any exposed tokens and update Cloudflare encrypted `CF_TOKEN` if regenerated.
- Temporary git askpass helper was removed after push.

## Key Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Maktaba: https://ucfzem.github.io/works/Maktaba/
- Maktaba library: https://ucfzem.github.io/works/Maktaba/library/
- Works: https://ucfzem.github.io/works/
- Root SW live: https://ucfzem.github.io/sw.js
- Root SW raw: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/sw.js
- Maktaba SW live: https://ucfzem.github.io/works/Maktaba/sw.js
- Maktaba SW raw: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/works/Maktaba/sw.js
- Commit `58eecde`: https://github.com/ucfzem/ucfzem.github.io/commit/58eecde
- Commit `b7a8a8d`: https://github.com/ucfzem/ucfzem.github.io/commit/b7a8a8d
- Commit `0fcb805`: https://github.com/ucfzem/ucfzem.github.io/commit/0fcb805
- Previous backup: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-23-offline-pwa-batch.md
- This backup: https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-24-maktaba-all-offline-final.md

## All 36 Maktaba Links
1. https://ucfzem.azer-tyu199p.workers.dev/quran-majeed-v3/
2. https://ucfzem.azer-tyu199p.workers.dev/a3lam-al-dawa/
3. https://ucfzem.github.io/a3lam-al-3olama/
4. https://ucfzem.github.io/shubuhat-wa-rudud/
5. https://ucfzem.github.io/taw7id/
6. https://ucfzem.azer-tyu199p.workers.dev/tanger/
7. https://ucfzem.github.io/mapamundi/
8. https://ucfzem.github.io/livre-al-istibsar/
9. https://ucfzem.github.io/al-adhkiya/
10. https://ucfzem.github.io/al-tibb-al-nabawi/
11. https://ucfzem.github.io/nuzhat-al-mushtaq/
12. https://ucfzem.github.io/al-mudhish/
13. https://ucfzem.github.io/al-jawab-al-kafi/
14. https://ucfzem.github.io/asrar-al-kawn/
15. https://ucfzem.github.io/al-adhama/
16. https://ucfzem.github.io/tarikh-ibn-khaldun/
17. https://ucfzem.github.io/mujam-al-buldan/
18. https://ucfzem.github.io/karamat-al-awliya/
19. https://ucfzem.github.io/sifat-al-safwa/
20. https://ucfzem.github.io/masail-nafi-ibn-azraq/
21. https://ucfzem.github.io/ajayib-al-makhluqat/
22. https://ucfzem.github.io/al-masalik-wa-al-mamalik/
23. https://ucfzem.github.io/kharidat-al-ajaib/
24. https://ucfzem.github.io/masoudi-encyclopedia/
25. https://ucfzem.github.io/akhbar-al-hamqa-wal-mughaffalin/
26. https://ucfzem.github.io/rihlat-ibn-battuta/
27. https://ucfzem.github.io/risalat-ibn-fadlan/
28. https://ucfzem.github.io/barnabas/
29. https://ucfzem.github.io/musawa-qasas/
30. https://ucfzem.github.io/al-ajwiba-al-musaddada/
31. https://ucfzem.github.io/al-bishara/
32. https://ucfzem.github.io/al-jawab-al-sahih/
33. https://ucfzem.github.io/izhar-al-haqq/
34. https://ucfzem.github.io/tafsir-ibn-taymiyyah/
35. https://ucfzem.github.io/al-a3chab-attebiah/
36. https://ucfzem.github.io/earth-proofs-pwa/
