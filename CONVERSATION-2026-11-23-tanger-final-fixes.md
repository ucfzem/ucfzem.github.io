# Tanger Final Fixes - 2026-11-23

## Scope
- Repo: ucfzem/ucfzem.github.io (main)
- Paths touched: `tanger/index.html`, `tanger/histoire/index.html`, `tanger/sw.js`, backup docs
- Untouched: `shubuhat-wa-rudud/index.html`, `shubuhat-wa-rudud/sw.js` remain local unstaged edits

## Deployed Git Changes
- `429f9ca` feat(tanger): improve full-history button styling
- `bc4deb5` docs: backup tanger history button update
- `a44b9be` style(tanger): solid gold full-history button
- `9a6c723` docs: backup tanger solid gold button
- `fb9f5e7` chore(tanger): bump service worker cache to v2
- `ab3bd17` docs: backup tanger service worker bump
- `11588f8` chore(tanger): cache-bust history button markup
- `b288885` docs: backup tanger cache bust
- `dfac699` chore: trigger GitHub Pages rebuild for tanger
- `ba7a029` chore(tanger): bump SW v3 and cache-bust registration
- `524972f` docs: backup tanger SW v3 cache-bust
- `f1caf78` fix(tanger): self-unregister service worker to clear stale cache

## Cloudflare Worker Fixes (deployed via API, not in repo)
- Worker: `ucfzem` on account `551159a931a5eb5754de241eb6ae2b7c`
- `/tanger/*`: served from `raw.githubusercontent.com/ucfzem/ucfzem.github.io/main` with no-cache headers to bypass stale GitHub Pages CDN.
- Stripped `content-security-policy`, `content-security-policy-report-only`, `x-frame-options` from proxied raw responses (raw `sandbox` CSP broke `/tanger/histoire/`).
- Non-HTML `/tanger/*` assets fall back to `https://ucfzem.github.io` when raw 404s, fixing missing history images not present in git tree.

## Verification
- Worker `/tanger/` returns 200 and updated gold button markup.
- Worker `/tanger/histoire/` returns 200, no sandbox CSP.
- Worker `/tanger/images/histoire/punic-amphora.jpg` returns 200 after Pages fallback.
- `https://ucfzem.github.io/tanger/` was still stale at last check (old etag/last-modified); GitHub Pages CDN propagation pending.

## User Recovery
- If browser shows ERR_FAILED on worker or Pages, clear site data/unregister old Service Worker for that origin, or use Incognito/hard refresh once.
- Current `tanger/sw.js` is self-unregistering cleanup (no offline support).

## Links
- Repo: https://github.com/ucfzem/ucfzem.github.io
- Worker Tanger: https://ucfzem.azer-tyu199p.workers.dev/tanger/
- Worker Histoire: https://ucfzem.azer-tyu199p.workers.dev/tanger/histoire/
- Pages Tanger: https://ucfzem.github.io/tanger/
- Pages Histoire: https://ucfzem.github.io/tanger/histoire/
- Raw index: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/tanger/index.html
- Raw SW: https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/tanger/sw.js
