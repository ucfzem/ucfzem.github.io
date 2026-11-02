// Al-Bishara full-book translator.
// Reads data/chapters.json (Arabic, HTML "blocks") and produces
// data/chapters.<lang>.json for en/fr/es, mirroring the exact structure
// (meta / parts / chapters / blocks) with translated text.
//
// HTML-aware: tags are never sent to the translator; only text runs are.
// Long runs are chunked on sentence boundaries. Resumable: already-translated
// chapters present in the output file are skipped on re-run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SRC = path.join(DATA_DIR, 'chapters.json');

const TARGETS = ['en', 'fr', 'es'];
const MAX_CHUNK = 1200;
const DELAY_MS = 120;
const FORCE = process.argv.includes('--force');

const ARABIC = /[\u0600-\u06FF]/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function chunk(text) {
  if (text.length <= MAX_CHUNK) return [text];
  const parts = text.split(/(?<=[.،؛!؟:\n])\s+/);
  const out = [];
  let buf = '';
  for (const p of parts) {
    if ((buf + ' ' + p).length > MAX_CHUNK && buf) { out.push(buf); buf = p; }
    else buf = buf ? buf + ' ' + p : p;
  }
  if (buf) out.push(buf);
  return out.length ? out : [text];
}

async function gtranslate(text, tl, attempt = 0) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=' +
    tl + '&dt=t&q=' + encodeURIComponent(text);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (al-bishara/1.0)' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    if (Array.isArray(j) && Array.isArray(j[0])) {
      return j[0].map((x) => (x && x[0]) || '').join('');
    }
    throw new Error('unexpected payload');
  } catch (e) {
    if (attempt < 4) { await sleep(500 * Math.pow(2, attempt)); return gtranslate(text, tl, attempt + 1); }
    console.error('  !! translate failed (' + tl + '):', e.message);
    return text;
  }
}

// Fixed honorific renderings the machine translator gets wrong. Applied after
// translation so regeneration is consistent. Jesus ("كلمة الله") is already
// correct; Moses ("كليم الله") must NOT become "the Word of God".
const GLOSSARY = {
  en: [['Moses, the Word of God', 'Moses, to whom God spoke']],
  fr: [['Moïse, la Parole de Dieu', "Moïse, l'interlocuteur de Dieu"]],
  es: [['Moisés, la Palabra de Dios', 'Moisés, el interlocutor de Dios']]
};
function postfix(s, tl) {
  (GLOSSARY[tl] || []).forEach(([a, b]) => { s = s.split(a).join(b); });
  return s;
}

async function tr(text, tl) {
  if (!text || !ARABIC.test(text)) return text;
  if (text.trim().length <= 1) return text;
  const pieces = chunk(text);
  const out = [];
  for (const p of pieces) { out.push(await gtranslate(p, tl)); await sleep(DELAY_MS); }
  return postfix(out.join(pieces.length > 1 && /[.،؛!؟]\s*$/.test(out[pieces.length - 1]) ? '' : ' '), tl);
}

async function trHtml(html, tl) {
  const tokens = String(html).split(/(<[^>]+>)/);
  const out = [];
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.charAt(0) === '<') { out.push(tok); continue; }
    out.push(await tr(tok, tl));
  }
  return out.join('');
}

async function trChapter(ch, tl) {
  const blocks = [];
  for (let i = 0; i < (ch.blocks || []).length; i++) {
    blocks.push(await trHtml(ch.blocks[i], tl));
    if (i % 10 === 0) process.stdout.write(`\r    ${tl}: blocks ${i + 1}/${ch.blocks.length}   `);
  }
  process.stdout.write(`\r    ${tl}: blocks ${ch.blocks.length}/${ch.blocks.length}   \n`);
  return { id: ch.id, part: ch.part, title: await tr(ch.title, tl), blocks };
}

async function main() {
  const book = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  console.log(`Source: ${book.chapters.length} chapters, meta.title="${book.meta.title}"`);

  for (const tl of TARGETS) {
    const outPath = path.join(DATA_DIR, `chapters.${tl}.json`);
    let prev = null;
    if (!FORCE && fs.existsSync(outPath)) {
      try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) { prev = null; }
    }
    const done = new Set(prev ? (prev.chapters || []).map((c) => c.id) : []);
    console.log(`\n=== ${tl.toUpperCase()} === (${done.size} chapters already done)`);

    const meta = prev && prev.meta ? prev.meta : {
      title: await tr(book.meta.title, tl),
      titleAlt: await tr(book.meta.titleAlt, tl),
      author: await tr(book.meta.author, tl),
      publisher: await tr(book.meta.publisher, tl),
      edition: await tr(book.meta.edition, tl)
    };

    const parts = prev && prev.parts ? prev.parts : [];
    if (!prev || !prev.parts) {
      for (const p of book.parts) parts.push({ id: p.id, title: await tr(p.title, tl) });
    }

    const chapters = prev ? (prev.chapters || []).slice() : [];
    for (const ch of book.chapters) {
      if (done.has(ch.id)) continue;
      process.stdout.write(`  ch ${ch.id}: `);
      chapters.push(await trChapter(ch, tl));
      const ordered = book.chapters.map((c) => chapters.find((x) => x.id === c.id)).filter(Boolean);
      fs.writeFileSync(outPath, JSON.stringify({ meta, parts, chapters: ordered }, null, 0), 'utf8');
    }
    fs.writeFileSync(outPath, JSON.stringify({ meta, parts, chapters }, null, 0), 'utf8');
    console.log(`  saved ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
