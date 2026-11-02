// Al-Jawab al-Sahih full-book translator (mirrors al-bishara/tools/translate-book.mjs).
// Reads data/vol_N.json (Arabic, vocalized) and produces data/vol_N.<lang>.json
// with the IDENTICAL structure — same top-level keys, same chapter ids, same
// paragraph count and order — so the reader swaps text in place without any
// structural realignment (ids/positions stay stable across languages).
//
// Resumable: progress is stored in data/.translate-progress.<lang>.json and a
// chapter is only marked done once its translated output has been written
// atomically. The output file is the ground truth for resume position.
//
// Networking lives in gtx.mjs: multi-client rotation + per-client cooldowns
// keep throughput alive when any single Google bucket starts returning 429.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateLong, BASE_DELAY, MAX_CHUNK, CLIENTS } from './gtx.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const MAX_CHAPTERS = parseInt(process.env.MAX_CHAPTERS || '0', 10); // 0 = all (smoke tests)
const progressFile = (tl) => path.join(DATA_DIR, `.translate-progress.${tl}.json`);

const TARGETS = (process.env.TARGETS || 'en,fr,es').split(',').map(s => s.trim()).filter(Boolean);
const VOLS = (process.env.VOLS || '1,2,3,4,5,6').split(',').map(s => parseInt(s, 10)).filter(Boolean);
const FORCE = process.argv.includes('--force');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadProgress(tl) {
  try { return JSON.parse(fs.readFileSync(progressFile(tl), 'utf8')); } catch (e) { return {}; }
}
function saveProgress(tl, p) {
  const f = progressFile(tl);
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(p, null, 1));
  fs.renameSync(tmp, f);
}

// Translate one volume for one language, chapter by chapter, writing atomically
// after every chapter so an interruption never loses more than one chapter.
async function translateVolume(volNum, tl) {
  const progress = loadProgress(tl);
  const srcPath = path.join(DATA_DIR, `vol_${volNum}.json`);
  const outPath = path.join(DATA_DIR, `vol_${volNum}.${tl}.json`);
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

  const key = `${tl}/vol_${volNum}`;
  let done = FORCE ? 0 : (progress[key] && progress[key].doneChapters) || 0;
  // If the output file is missing, recorded progress is meaningless — restart
  // from 0 instead of seeding the new file with untranslated Arabic chapters.
  if (done > 0 && !fs.existsSync(outPath)) done = 0;
  let out = null;
  if (!FORCE && done > 0 && fs.existsSync(outPath)) {
    try { out = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) { out = null; }
    if (!out || !Array.isArray(out.chapters)) { out = null; done = 0; }
    // Partial files are NORMAL (one chapter appended per write) — the file is
    // the ground truth for how far we really are. Only an unusable file
    // resets. (An early version compared against the FULL source length, so
    // any partial file looked "broken" and every resume restarted from zero.)
    else done = Math.min(out.chapters.length, src.chapters.length);
  }
  if (done >= src.chapters.length) { console.log(`  vol_${volNum}.${tl}: already complete`); return; }

  if (!out) {
    out = { title: src.title, lang: tl, chapters: [] };
    for (let i = 0; i < done; i++) {
      out.chapters.push({ id: src.chapters[i].id, title: src.chapters[i].title, paragraphs: src.chapters[i].paragraphs });
    }
  }

  const limit = MAX_CHAPTERS > 0 ? Math.min(src.chapters.length, done + MAX_CHAPTERS) : src.chapters.length;
  console.log(`  vol_${volNum}.${tl}: ${limit - done} chapters to translate (${src.chapters.length} total)`);
  for (let i = done; i < limit; i++) {
    const c = src.chapters[i];
    const title = await translateLong(c.title, tl) || c.title;
    const paragraphs = [];
    for (const para of c.paragraphs) paragraphs.push((await translateLong(para, tl)) || para);
    out.chapters.push({ id: c.id, title, paragraphs });

    const tmp = outPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(out));
    fs.renameSync(tmp, outPath);

    progress[key] = { doneChapters: i + 1, total: src.chapters.length };
    saveProgress(tl, progress);
    if ((i + 1) % 5 === 0 || i + 1 === limit) {
      console.log(`  vol_${volNum}.${tl}: ${i + 1}/${limit}`);
    }
  }
}

console.log(`Translating volumes [${VOLS.join(',')}] into [${TARGETS.join(',')}] ` +
  `(clients=${CLIENTS.join('/')}, delay=${BASE_DELAY}ms, maxChunk=${MAX_CHUNK})`);
for (const tl of TARGETS) {
  for (const volNum of VOLS) {
    await translateVolume(volNum, tl);
  }
}
console.log('ALL TRANSLATIONS DONE');
