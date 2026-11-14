# UCFZEM AI Chat Fix - 2026-11-14

## Summary

The "Mon Assistant IA" page loaded, but every message failed with a connection error. The frontend was calling `/api/chat`, which does not exist on the Cloudflare proxy or GitHub Pages. The intended Cloudflare AI worker was not deployed, and its JSON response format did not match the frontend's expected SSE format.

The permanent fix removes the missing backend dependency: the page now calls Pollinations' free, no-key OpenAI-compatible API directly from the browser and parses its streaming response.

## Root Cause

- Frontend request: `POST /api/chat` with `{ message }`.
- Result: GitHub Pages `404`; no API route on `https://ucfzem.azer-tyu199p.workers.dev`.
- Intended worker `https://ucfzem-ai.azer-tyu199p.workers.dev/` returned `404 text/plain`, `error code: 1042` (not deployed).
- Local `ucfzem-ai/worker.js` returned non-streaming JSON `{ reply }`, while the frontend expected streamed SSE `{ delta }`.
- No Cloudflare API token or wrangler login was available to deploy the worker.

## Fix

File: `ucfzem-ai/index.html`

- Replaced `/api/chat` with `https://text.pollinations.ai/openai`.
- Added `AI_MODEL = 'openai-fast'` and a French system prompt.
- Builds conversation history from the existing chat bubbles.
- Sends OpenAI-compatible `messages` with `stream: true`.
- Parses `choices[0].delta.content`, with fallback support for `delta` and `response`.
- Keeps a fallback for non-streaming JSON responses.
- Uses reasoning text only if the model returns no final content.
- Shows HTTP status in connection errors.

Deploy commit: `d3858f2` (`Fix AI chat endpoint and OpenAI-compatible streaming`).

## Verification

Local Playwright test:

- User message: `Réponds en une phrase courte: bonjour`
- AI response: `Bonjour`
- Console/page errors: none

Live Playwright tests:

- `https://ucfzem.github.io/ucfzem-ai/?cb=...` -> `test ok`, no errors.
- `https://ucfzem.azer-tyu199p.workers.dev/ucfzem-ai/?cb=...` -> `test ok`, no errors.
- Final `localStorage` contained both the user message and AI reply.
- Normal Cloudflare URL now serves the updated page (`cf-cache-status: DYNAMIC`, `age: 0`).

## Live Links

- Cloudflare: https://ucfzem.azer-tyu199p.workers.dev/ucfzem-ai/
- GitHub Pages: https://ucfzem.github.io/ucfzem-ai/

## Notes

- Pollinations allows browser CORS (`access-control-allow-origin: *`) and needs no API key.
- This is a third-party free service, so availability and rate limits are outside UCFZEM's control.
- If Pollinations becomes unreliable, deploy `ucfzem-ai/worker.js` with a Workers AI binding and point `API_URL` back to that worker; the frontend already handles both SSE and JSON responses.
