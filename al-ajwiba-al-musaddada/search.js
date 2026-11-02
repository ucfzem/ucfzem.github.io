// search.js — تطبيع عربي + فهرسة + بحث + تظليل

const DIAC_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
const TATWEEL_RE = /\u0640/;

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// يبني النص المطبَّع مع خريطة تربط كل حرف مطبَّع بموضعه في الأصل
export function normalizeWithMap(original, opts = {}) {
  const {
    ignoreDiacritics = true,
    unifyTaMarbuta = false,
    collapseSpaces = true,
  } = opts;

  const chars = [];
  const map = [];
  let lastWasSpace = false;

  for (let i = 0; i < original.length; i++) {
    const ch = original[i];

    if (/\s/.test(ch)) {
      if (collapseSpaces) {
        if (lastWasSpace) continue;
        chars.push(' ');
        map.push({ o: i, e: i + 1 });
        lastWasSpace = true;
      } else {
        chars.push(ch);
        map.push({ o: i, e: i + 1 });
      }
      continue;
    }
    lastWasSpace = false;

    if (ignoreDiacritics && (DIAC_RE.test(ch) || TATWEEL_RE.test(ch))) continue;

    let out = ch;
    if (/[أإآٱ]/.test(ch)) out = 'ا';
    else if (ch === 'ى' || ch === 'ئ') out = 'ي';
    else if (ch === 'ؤ') out = 'و';
    if (unifyTaMarbuta && out === 'ة') out = 'ه';

    chars.push(out);
    map.push({ o: i, e: i + 1 });
  }
  return { text: chars.join(''), map };
}

export function normalizeQuery(q, opts = {}) {
  return normalizeWithMap(q, opts).text.trim();
}

const isWordChar = (c) => /[\p{L}\p{N}]/u.test(c);

export function findMatches(normText, normQuery, wholeWord = false) {
  const res = [];
  if (!normQuery) return res;
  const step = Math.max(1, normQuery.length);
  let i = normText.indexOf(normQuery);
  while (i !== -1) {
    let ok = true;
    if (wholeWord) {
      const before = i > 0 ? normText[i - 1] : '';
      const after = i + normQuery.length < normText.length ? normText[i + normQuery.length] : '';
      if ((before && isWordChar(before)) || (after && isWordChar(after))) ok = false;
    }
    if (ok) res.push(i);
    i = normText.indexOf(normQuery, i + step);
  }
  return res;
}

function origRange(map, nStart, nLen) {
  const a = map[nStart];
  const b = map[nStart + nLen - 1];
  if (!a || !b) return null;
  return [a.o, b.e];
}

// فهرس البحث: وحدات = فقرات، مع الاحتفاظ بعناوين الأقسام
export function buildIndex(book) {
  const chapters = book.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    units: ch.sections.flatMap((sec) =>
      sec.paragraphs.map((p) => ({ text: p, section: sec.title || '' }))
    ),
    _norms: {},
  }));
  const _index = { chapters };
  // título también indexable
  return _index;
}

function sig(opts) {
  return `${opts.ignoreDiacritics ? 1 : 0}${opts.unifyTaMarbuta ? 1 : 0}${opts.wholeWord ? 1 : 0}`;
}

function normsFor(chapter, opts) {
  const s = sig(opts);
  if (chapter._norms[s]) return chapter._norms[s];
  const norms = chapter.units.map((u) => normalizeWithMap(u.text, opts));
  chapter._norms[s] = norms;
  return norms;
}

export function search(index, query, opts = {}) {
  const nq = normalizeQuery(query, opts);
  const result = { query: query.trim(), normQuery: nq, total: 0, chapters: [] };
  if (!nq) return result;

  for (const chapter of index.chapters) {
    const norms = normsFor(chapter, opts);
    let chapterCount = 0;
    const hits = [];

    chapter.units.forEach((u, ui) => {
      const { text: norm, map } = norms[ui];
      const ms = findMatches(norm, nq, !!opts.wholeWord);
      if (!ms.length) return;
      ms.forEach((nStart) => {
        const rg = origRange(map, nStart, nq.length);
        if (!rg) return;
        chapterCount++;
        hits.push({
          unitIndex: ui,
          section: u.section,
          occIndex: chapterCount - 1,
          snippetHtml: snippet(u.text, rg[0], rg[1]),
        });
      });
    });

    if (chapterCount) {
      result.total += chapterCount;
      result.chapters.push({ id: chapter.id, title: chapter.title, count: chapterCount, hits });
    }
  }
  return result;
}

function snippet(text, oStart, oEnd, radius = 45) {
  const from = Math.max(0, oStart - radius);
  const to = Math.min(text.length, oEnd + radius);
  const pre = (from > 0 ? '…' : '') + escapeHtml(text.slice(from, oStart));
  const mid = `<mark class="mark">${escapeHtml(text.slice(oStart, oEnd))}</mark>`;
  const post = escapeHtml(text.slice(oEnd, to)) + (to < text.length ? '…' : '');
  return pre + mid + post;
}

// تظليل فقرة كاملة مع ترقيم متسلسل للنتائج داخل الفصل
export function highlightParagraph(text, query, opts = {}, startIndex = 0) {
  const nq = normalizeQuery(query, opts);
  if (!nq) return { html: escapeHtml(text), count: 0, next: startIndex };
  const { text: norm, map } = normalizeWithMap(text, opts);
  const ms = findMatches(norm, nq, !!opts.wholeWord);
  if (!ms.length) return { html: escapeHtml(text), count: 0, next: startIndex };

  let html = '';
  let last = 0;
  let k = startIndex;
  for (const nStart of ms) {
    const rg = origRange(map, nStart, nq.length);
    if (!rg) continue;
    const [os, oe] = rg;
    if (os < last) continue; // تفادي التداخل
    html += escapeHtml(text.slice(last, os));
    html += `<mark class="mark" data-occ="${k}">${escapeHtml(text.slice(os, oe))}</mark>`;
    last = oe;
    k++;
  }
  html += escapeHtml(text.slice(last));
  return { html, count: ms.length, next: k };
}

// عدّ نتائج فصل واحد (بنفس ترتيب العرض) لأغراض التنقل
export function countChapterOccurrences(chapter, query, opts = {}) {
  const nq = normalizeQuery(query, opts);
  if (!nq) return 0;
  const norms = normsFor(chapter, opts);
  let c = 0;
  for (const { text: norm } of norms) c += findMatches(norm, nq, !!opts.wholeWord).length;
  return c;
}
