// parser.js — تحويل نص Markdown مبسّط إلى نموذج كتاب
// Structure: { title, intro:[blocks], chapters:[{id,title,intro,blocks,sections:[{title,paragraphs}],wordCount}], wordCount, chapterCount }

export const SECTION_NAMES = [
  'السياق والراوي',
  'السياق',
  'الراوي',
  'السؤال',
  'الجواب',
  'التحليل',
  'الدروس المستفادة',
  'الدروس',
  'العبرة',
  'التخريج',
];

const AR_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const AR_TATWEEL = /\u0640/g;

function normHeading(s) {
  return s
    .replace(AR_DIACRITICS, '')
    .replace(AR_TATWEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(s) {
  if (!s) return 0;
  const m = s.replace(/\s+/g, ' ').trim();
  return m ? m.split(' ').length : 0;
}

// يكتشف سطر عنوان من الشكل "العنوان: نص" أو "العنوان"
function detectHeading(line) {
  const t = line.trim();
  if (!t) return null;

  const m = t.match(/^([^:：]{2,45})[:：]\s*(.*)$/);
  if (!m) return null;
  const left = m[1].trim();
  const rest = m[2].trim();
  if (!left) return null;
  if (/[.؟!،؛»]/.test(left)) return null;
  const words = left.split(/\s+/).filter(Boolean);
  if (words.length > 5) return null;

  const known = SECTION_NAMES.some((n) => normHeading(n) === normHeading(left));
  return { title: left, rest, known };
}

function splitParagraphs(lines) {
  // تجميع الأسطر المتتالية غير الفارغة في فقرة واحدة
  const paras = [];
  let buf = [];
  const flush = () => {
    if (buf.length) {
      paras.push(buf.join(' ').replace(/[ \t]+/g, ' ').trim());
      buf = [];
    }
  };
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (line.trim() === '') {
      flush();
    } else {
      buf.push(line.trim());
    }
  }
  flush();
  return paras.filter(Boolean);
}

// يحوّل كتلة أسطر إلى أقسام (sections). كل قسم {title, paragraphs}
function buildSections(lines) {
  const sections = [];
  let cur = { title: '', paragraphs: [] };
  let pre = []; // فقرة تتراكم بين العناوين

  const flushPara = () => {
    if (pre.length) {
      const paras = splitParagraphs(pre);
      paras.forEach((p) => cur.paragraphs.push(p));
      pre = [];
    }
  };
  const pushSection = () => {
    flushPara();
    if (cur.title || cur.paragraphs.length) sections.push(cur);
    cur = { title: '', paragraphs: [] };
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const trimmed = line.trim();

    // عنوان قسم صريح ###
    if (/^###\s+/.test(trimmed)) {
      pushSection();
      cur.title = trimmed.replace(/^###\s+/, '').trim();
      continue;
    }
    // عنوان قسم من الشكل "العنوان: نص"
    const h = detectHeading(trimmed);
    if (h) {
      pushSection();
      cur.title = h.title;
      if (h.rest) pre.push(h.rest);
      continue;
    }
    pre.push(line);
  }
  pushSection();
  return sections;
}

export function parseBook(text) {
  if (!text || !text.trim()) {
    return { title: '', intro: '', chapters: [], chapterCount: 0, wordCount: 0 };
  }
  const lines = text.replace(/^\uFEFF/, '').split('\n');

  // 1) العنوان الرئيسي: أول سطر يبدأ بـ "# "
  let title = '';
  let titleIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i].trim())) {
      title = lines[i].trim().replace(/^#\s+/, '').trim();
      titleIdx = i;
      break;
    }
  }

  const startBody = titleIdx >= 0 ? titleIdx + 1 : 0;

  // 2) تقسيم إلى مقدمة + فصول (## )
  const introLines = [];
  const chapters = [];
  let curCh = null;

  for (let i = startBody; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed)) {
      if (curCh) chapters.push(curCh);
      curCh = { title: trimmed.replace(/^##\s+/, '').trim(), lines: [] };
      continue;
    }
    if (curCh) curCh.lines.push(line);
    else introLines.push(line);
  }
  if (curCh) chapters.push(curCh);

  const resultChapters = chapters.map((c, idx) => {
    const sections = buildSections(c.lines);
    let wc = 0;
    sections.forEach((s) => s.paragraphs.forEach((p) => (wc += countWords(p))));
    return {
      id: idx + 1,
      title: c.title,
      sections: sections.length ? sections : [{ title: '', paragraphs: [''] }],
      wordCount: wc,
    };
  });

  const introParas = splitParagraphs(introLines);
  const intro = introParas.join('\n\n');
  const wordCount = resultChapters.reduce((a, c) => a + c.wordCount, 0) + countWords(intro);

  return {
    title: title || 'بدون عنوان',
    intro,
    chapters: resultChapters,
    chapterCount: resultChapters.length,
    wordCount,
  };
}

export function bookStats(book) {
  return {
    title: book.title,
    chapterCount: book.chapters.length,
    wordCount: book.wordCount,
  };
}
