// Izhar al-Haqq full-book translator (mirrors al-jawab-al-sahih/tools/translate-volumes.mjs,
// adapted to the single-file schema: chapters[].sections[].content[] paragraphs).
//
// Reads data/izhar-al-haqq.json (Arabic) and produces data/izhar-al-haqq.<lang>.json
// with the IDENTICAL structure — same book, same chapter ids, same section ids, same
// paragraph count and order — so the reader swaps text in place without any structural
// realignment (only sections[].heading + sections[].content[] are translated).
//
// Resumable at PARAGRAPH granularity: the output file is the ground truth. Work is
// written atomically after every paragraph, so an interruption never loses more than
// one paragraph. No progress file needed.
//
// Networking lives in gtx.mjs: multi-client rotation + per-client cooldowns.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateLong, arabicRatio, BASE_DELAY, MAX_CHUNK, CLIENTS } from './gtx.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SRC_FILE = path.join(DATA_DIR, 'izhar-al-haqq.json');
const MAX_SECTIONS = parseInt(process.env.MAX_SECTIONS || '0', 10); // 0 = all (smoke tests)
const MAX_PARAS = parseInt(process.env.MAX_PARAS || '0', 10);       // per section, 0 = all
const FORCE = process.argv.includes('--force');

const TARGETS = (process.env.TARGETS || 'en,fr,es').split(',').map(s => s.trim()).filter(Boolean);

const outPath = (tl) => path.join(DATA_DIR, `izhar-al-haqq.${tl}.json`);
const atomicWrite = (file, obj) => {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj));
  fs.renameSync(tmp, file);
};

// Non-Arabic source lines (numerals, stray latin) are copied verbatim — no request.
const needsTranslation = (s) => arabicRatio(String(s)) > 0.1;

async function translateBook(tl) {
  const src = JSON.parse(fs.readFileSync(SRC_FILE, 'utf8'));
  let out = null;
  if (!FORCE && fs.existsSync(outPath(tl))) {
    try { out = JSON.parse(fs.readFileSync(outPath(tl), 'utf8')); } catch (e) { out = null; }
    if (!out || !Array.isArray(out.chapters)) out = null;
  }
  if (!out) out = { book: src.book, lang: tl, chapters: [] };

  let totalParas = 0, translatedParas = 0;
  let sectionBudget = MAX_SECTIONS > 0 ? MAX_SECTIONS : Infinity;
  outer:
  for (let ci = 0; ci < src.chapters.length; ci++) {
    const sc = src.chapters[ci];
    let oc = out.chapters.find(c => c.id === sc.id);
    if (!oc) {
      oc = { id: sc.id, number: sc.number, title: sc.title, titles: sc.titles, sections: [] };
      out.chapters.push(oc);
    }
    if (sectionBudget <= 0) break;
    for (let si = 0; si < sc.sections.length; si++) {
      if (sectionBudget <= 0) break outer;
      const ss = sc.sections[si];
      let os = oc.sections.find(x => x.id === ss.id);
      if (!os) { os = { id: ss.id, heading: '', content: [] }; oc.sections.push(os); }
      else if (!Array.isArray(os.content)) os.content = [];

      if (!os.heading || (needsTranslation(ss.heading) && arabicRatio(os.heading) > 0.35)) {
        os.heading = needsTranslation(ss.heading)
          ? (await translateLong(ss.heading, tl)) || ss.heading
          : ss.heading;
        atomicWrite(outPath(tl), out);
      }

      let done = os.content.length;
      // Ground-truth guard: a partial section resumes exactly where it stopped.
      if (done > ss.content.length) { os.content = []; done = 0; }
      const limit = MAX_PARAS > 0 ? Math.min(ss.content.length, done + MAX_PARAS) : ss.content.length;
      if (done === 0 || done < limit || (MAX_PARAS > 0 && done < ss.content.length)) {
        console.log(`  ${tl}: ${sc.id}/${ss.id} ${done}/${ss.content.length} paras`);
      }
      for (let pi = done; pi < limit; pi++) {
        const para = ss.content[pi];
        const tr = needsTranslation(para) ? ((await translateLong(para, tl)) || para) : para;
        os.content.push(tr);
        totalParas++; translatedParas++;
        atomicWrite(outPath(tl), out);
        if (translatedParas % 50 === 0) {
          console.log(`  ${tl}: ...${translatedParas} paras written (last: ${sc.id}/${ss.id} ${pi + 1}/${ss.content.length})`);
        }
      }
      // Section fully done? (with MAX_PARAS cap we may stop mid-section)
      if (os.content.length < ss.content.length) { sectionBudget--; break outer; }
      sectionBudget--;
    }
    // Chapter complete → ensure parity book copy
    oc.title = sc.title;
  }

  // Final structural parity check
  const out2 = JSON.parse(fs.readFileSync(outPath(tl), 'utf8'));
  const chOk = out2.chapters.length === src.chapters.length;
  console.log(`  ${tl}: ${chOk ? 'chapter count matches' : 'CHAPTER COUNT MISMATCH (' + out2.chapters.length + ' vs ' + src.chapters.length + ')'} — paras written this run: ${translatedParas}`);
}

console.log(`Translating izhar-al-haqq into [${TARGETS.join(',')}] ` +
  `(clients=${CLIENTS.join('/')}, delay=${BASE_DELAY}ms, maxChunk=${MAX_CHUNK}` +
  `${MAX_SECTIONS ? `, maxSections=${MAX_SECTIONS}` : ''}${MAX_PARAS ? `, maxParas=${MAX_PARAS}` : ''})`);
// Languages run CONCURRENTLY through the shared ClientPool: the pool's
// synchronous rotation hands each in-flight request a different bucket, while
// cooldown state stays shared so a 429 slows everyone down together (instead
// of three independent processes hammering the same hot bucket).
await Promise.all(TARGETS.map(tl => translateBook(tl)));
console.log('ALL TRANSLATIONS DONE');
