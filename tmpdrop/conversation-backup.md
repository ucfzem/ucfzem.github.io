# Session Backup — Jul 12 2026

## Summary
Fixed **tmpdrop** (from dead Supabase to Cloudflare KV), fixed **droppy** (merged worker was broken, restored clean proxy with droppy routes), fixed Cloudflare token permissions, added 24h auto-delete TTL, 25 MB limits.

## Key Events
1. Identified Supabase project `vjhcfbwuyebiesxslwhe.supabase.co` is dead (DNS NXDOMAIN)
2. Discovered `ucfzem-worker` had droppy logic + KV storage but was on wrong worker (`ucfzem.azer-tyu199p.workers.dev` ran a simple proxy)
3. Merged droppy routes + supabase-proxy + auth into `ucfzem` worker → broke open proxy (auth required for all paths)
4. Reverted to clean worker: open proxy + droppy routes + supabase-proxy only (no auth)
5. Fixed internal KV token (old token lacked KV perms → replaced with user's token)
6. Converted **tmpdrop** from Supabase to Cloudflare KV backend
7. Added 25 MB size limit, 24h KV TTL on all file + meta keys
8. Tmpdrop page served from raw GitHub (bypass Pages CDN cache)
9. File limit UI text updated (50→25 MB), auto-delete note added

## Current State
- **Droppy**: Upload→KV, 25 MB limit, 24h TTL auto-delete
- **Tmpdrop**: Upload→KV, 25 MB limit, 24h TTL auto-delete (replaces dead Supabase)
- **Worker**: Clean open proxy + droppy + tmpdrop routes, no auth, no pings needed

## Files
- `tmpdrop/index.html` — single-file upload app (KV backend)
- `droppy/index.html` — multi-file upload app
- `droppy/get.html` — download page
- Worker deployed to `ucfzem.azer-tyu199p.workers.dev`

Tokens stored in worker script (not committed to this repo).
