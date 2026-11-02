// Shared Google-translate network layer for al-jawab-al-sahih.
//
// Rotation/cooldown policy lives in clientPool.mjs (ClientPool): per-client
// 429 cooldowns, Retry-After support, fair round-robin across known-good
// `client=` buckets, soonest-cooldown recovery when every bucket is hot.
// This module adapts that pool to the translate.googleapis.com payload:
//   - URL construction (client injected as query param, UA header)
//   - payload validation + Arabic-echo detection (engine rate-limit disguise)
//   - PayloadError vs PoolError separation: bad payloads get sentence-split
//     and re-tried smaller; a dry pool pauses instead of hammering
//
// Exports: sleep, arabicRatio, chunkText, gtranslate, translateLong,
//          CLIENTS, BASE_DELAY, MAX_CHUNK.

import { ClientPool } from './clientPool.mjs';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const CLIENTS = (process.env.CLIENTS || 'gtx,at,dict-chrome-ex,surface,gtx-sr,ras')
  .split(',').map(s => s.trim()).filter(Boolean);

export const BASE_DELAY = parseInt(process.env.DELAY_MS || '400', 10);
export const MAX_CHUNK = parseInt(process.env.MAX_CHUNK || '800', 10);
const COOLDOWN_MS = parseInt(process.env.COOLDOWN_MS || '30000', 10);

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const pool = new ClientPool(CLIENTS, { defaultCooldownMs: COOLDOWN_MS });

// PayloadError: this exact text/URL will never translate (HTTP 400, empty
// response, Arabic echo). Retrying it verbatim is pointless → split smaller.
// PoolError: every bucket is rate-limited/timing out → pause, don't split.
class PayloadError extends Error {}
class PoolError extends Error {}

export function arabicRatio(s) {
  const letters = String(s).match(/[A-Za-z\u0600-\u06FF]/g);
  if (!letters || !letters.length) return 0;
  const ar = letters.filter(c => /[\u0600-\u06FF]/.test(c)).length;
  return ar / letters.length;
}

export function chunkText(text, max = MAX_CHUNK) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return [clean];
  const parts = [];
  let buf = '';
  for (const sent of clean.split(/(?<=[.!?؟:؛])\s+/)) {
    if (buf && buf.length + sent.length + 1 > max) { parts.push(buf); buf = sent; }
    else buf = buf ? buf + ' ' + sent : sent;
  }
  if (buf) parts.push(buf);
  return parts.length ? parts : [clean];
}

// Sentence-boundary split near the midpoint (null when the text is too short
// or has no boundary to split on).
function splitHalf(text) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length < 80) return null;
  const sentences = clean.split(/(?<=[.!?؟:؛])\s+/);
  if (sentences.length < 2) return null;
  const target = clean.length / 2;
  let best = 1, bestDiff = Infinity;
  for (let i = 1; i < sentences.length; i++) {
    const at = sentences.slice(0, i).join(' ').length;
    const diff = Math.abs(at - target);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  if (best <= 0 || best >= sentences.length) return null;
  return [sentences.slice(0, best).join(' '), sentences.slice(best).join(' ')];
}

export async function gtranslate(text, tl, attempt = 0) {
  const urlFactory = (c) =>
    'https://translate.googleapis.com/translate_a/single?client=' + c.id +
    '&sl=ar&tl=' + tl + '&dt=t&q=' + encodeURIComponent(text);
  try {
    // Hard 15s cap: Google occasionally accepts a connection and then stalls
    // forever; an untimed fetch would wedge the worker indefinitely.
    const { response, client } = await pool.fetchWithRotation(urlFactory, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(15000),
    }, CLIENTS.length);
    const j = await response.json();
    if (!(Array.isArray(j) && Array.isArray(j[0]))) throw new PayloadError('unexpected payload');
    const out = j[0].map((x) => (x && x[0]) || '').join('');
    if (!out.trim()) {
      // Pool already marked this bucket successful — undo that: an empty body
      // is the engine's rate-limit behaviour, not a translation.
      pool.markRateLimited(client.id);
      if (attempt < 2) return gtranslate(text, tl, attempt + 1);
      throw new PayloadError('empty translation');
    }
    // A "successful" call that still returns mostly Arabic is an engine echo
    // (rate-limit behaviour) — treat like a rejection, not a translation.
    if (arabicRatio(out) > 0.25 && arabicRatio(text) > 0.6) {
      pool.markRateLimited(client.id);
      if (attempt < 2) return gtranslate(text, tl, attempt + 1);
      throw new PayloadError('untranslated echo');
    }
    return out;
  } catch (e) {
    if (e instanceof PayloadError) throw e;
    const msg = String((e && e.message) || e);
    // HTTP 400 on a well-formed GET = this specific payload is unacceptable
    // (rare bad character runs). One confirm-retry, then hand to the splitter.
    if (msg.includes('status: 400')) {
      if (attempt < 1) return gtranslate(text, tl, attempt + 1);
      throw new PayloadError('HTTP 400');
    }
    if (attempt < 8) {
      await sleep(500 + Math.floor(Math.random() * 700) + Math.min(4000, attempt * 500));
      return gtranslate(text, tl, attempt + 1);
    }
    throw new PoolError(msg);
  }
}

// Payload-safe wrapper: on PayloadError split at the sentence boundary and
// retry each half independently (a failing half degrades to its original
// text); PoolError always bubbles up untouched.
async function translatePayloadSafe(text, tl, depth) {
  try {
    return await gtranslate(text, tl);
  } catch (e) {
    if (!(e instanceof PayloadError)) throw e;
    if (depth >= 4) throw e;
    const halves = splitHalf(text);
    if (!halves) throw e;
    const half = async (t) => {
      try { return await translatePayloadSafe(t, tl, depth + 1); }
      catch (err) { if (err instanceof PayloadError) return t; throw err; }
    };
    const a = await half(halves[0]);
    const b = await half(halves[1]);
    return a + ' ' + b;
  }
}

export async function translateLong(text, tl) {
  const parts = chunkText(text);
  const out = [];
  for (const part of parts) {
    let tr = null;
    try {
      tr = await translatePayloadSafe(part, tl, 0);
    } catch (e) {
      if (e instanceof PoolError) {
        console.error(`  !! pool dry (${tl}): ${e.message}`);
        // Every bucket is hot — hard pause before the next chunk instead of
        // burning attempts at the same dead rate.
        await sleep(25000);
      } else {
        console.error(`  !! chunk permanently failed (${tl}): ${e.message}`);
      }
    }
    out.push(tr === null ? part : tr);
    await sleep(BASE_DELAY + Math.floor(Math.random() * 300));
  }
  return out.join(' ');
}
