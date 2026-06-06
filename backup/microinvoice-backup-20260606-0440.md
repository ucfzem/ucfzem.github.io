# MicroInvoice Backup — 2026-06-06

## URL
https://ucfzem.azer-tyu199p.workers.dev/microinvoice/

## Repo
https://github.com/ucfzem/ucfzem.github.io (branch: main)
Local: /tmp/opencode/ucfzem.github.io

## Files
- microinvoice/index.html (309 lines, deployed version)
- microinvoice/index-v2.html (316 lines, older alt version)

## Bug
PDF export fails: "Invalid arguments passed to jsPDF.text"
Cause: `hotfixes:['px_scaling']` option in `new jsPDF()` + chained .setFont().setTextColor().text() calls

## Fix (commit 1164fdd)
- Removed hotfixes option
- Replaced chained calls with `w()` helper function
- Fixed em dash → hyphen fallback
- Cleaner PDF layout math
- Pushed to GitHub, awaiting Cloudflare auto-deploy

## Deployment
Cloudflare Worker "ucfzem" (account: 551159a93...)
_wrangler.js serves static assets from ./ via ASSETS binding
Auto-deploy from GitHub not confirmed; wrangler deploy needs API token
