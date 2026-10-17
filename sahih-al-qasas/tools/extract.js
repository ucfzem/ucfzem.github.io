// extract.js — Extract all stories from «صحيح القصص النبوي» PDF into
// data/sahih-al-qasas.json (Node.js workflow).
//
// Usage:
//   npm init -y && npm install pdf-parse
//   node tools/extract.js ar_Prophet_Stories.pdf
//
// This script only processes a PDF that YOU provide locally. It does not
// download anything. Run it on your own copy.
const fs = require('fs');
const path = require('path');

let pdf;
try { pdf = require('pdf-parse'); } catch (e) {
  console.error('Missing dependency. Run: npm install pdf-parse');
  process.exit(1);
}

const PDF_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'ar_Prophet_Stories.pdf');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'sahih-al-qasas.json');

// The 5 أبواب (main sections). Detection is fuzzy to tolerate OCR variants.
const CATEGORIES = [
  'قصص الأنبياء والمرسلين',
  'قصص الأنبياء',
  'القصص الدالة على عجائب قدرة الله',
  'عجائب قدرة الله',
  'القصص الدالة على فضائل الأعمال',
  'فضائل الأعمال',
  'قصص النماذج الإيمانية الراقية',
  'النماذج الإيمانية',
  'قصص النماذج السيئة',
  'النماذج السيئة',
];

// Arabic ordinals used for story headers: الأولى .. الخمسون
const AR_ORDINALS = [
  'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة',
  'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة', 'الثالثة عشرة',
  'الرابعة عشرة', 'الخامسة عشرة', 'السادسة عشرة', 'السابعة عشرة',
  'الثامنة عشرة', 'التاسعة عشرة', 'العشرون', 'الحادية والعشرون',
  'الثانية والعشرون', 'الثالثة والعشرون', 'الرابعة والعشرون', 'الخامسة والعشرون',
  'السادسة والعشرون', 'السابعة والعشرون', 'الثامنة والعشرون', 'التاسعة والعشرون',
  'الثلاثون', 'الحادية والثلاثون', 'الثانية والثلاثون', 'الثالثة والثلاثون',
  'الرابعة والثلاثون', 'الخامسة والثلاثون', 'السادسة والثلاثون', 'السابعة والثلاثون',
  'الثامنة والثلاثون', 'التاسعة والثلاثون', 'الأربعون', 'الحادية والأربعون',
  'الثانية والأربعون', 'الثالثة والأربعون', 'الرابعة والأربعون', 'الخامسة والأربعون',
  'السادسة والأربعون', 'السابعة والأربعون', 'الثامنة والأربعون', 'التاسعة والأربعون',
  'الخمسون', 'الحادية والخمسون', 'الثانية والخمسون', 'الثالثة والخمسون',
  'الرابعة والخمسون', 'الخامسة والخمسون', 'السادسة والخمسون', 'السابعة والخمسون',
  'الثامنة والخمسون', 'التاسعة والخمسون',
].join('|');

// Matches a story header line, e.g.:
//   "القصة الأولى", "القصة 12", "القصة الثالثة عشرة", "القصة ٥"
const STORY_HEADER_RE = new RegExp(
  '^القصة\\s+(?:' + AR_ORDINALS + '|\\d+|[\\u0660-\\u0669]+)\\b'
);

function detectCategory(text) {
  // Prefer the longest matching category label.
  let best = '';
  for (const c of CATEGORIES) {
    if (text.includes(c) && c.length > best.length) best = c;
  }
  // Normalize short aliases back to canonical names.
  const alias = {
    'قصص الأنبياء': 'قصص الأنبياء والمرسلين',
    'عجائب قدرة الله': 'القصص الدالة على عجائب قدرة الله',
    'فضائل الأعمال': 'القصص الدالة على فضائل الأعمال',
    'النماذج الإيمانية': 'قصص النماذج الإيمانية الراقية',
    'النماذج السيئة': 'قصص النماذج السيئة',
  };
  return alias[best] || best;
}

// Extract a clean title: the story's descriptive name after the ordinal header.
// Falls back to the header itself when no separate title line is detected.
function extractTitle(lines) {
  for (let i = 1; i < Math.min(lines.length, 4); i++) {
    const l = lines[i];
    // Skip lines that look like page numbers, headers/footers, or pure ordinals.
    if (/^[\d\s.\-–—]+$/.test(l)) continue;
    if (/صحيح القصص النبوي|دار النفائس|الأشقر/.test(l)) continue;
    if (l.length >= 4 && !STORY_HEADER_RE.test(l)) return l;
  }
  return lines[0];
}

// Strip common PDF page furniture (page numbers, running headers/footers).
function cleanLines(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/^\d+$/.test(l)) // bare page numbers
    .filter((l) => !/^[-–—•·\s]+$/.test(l));
}

async function processPdf() {
  console.log('Reading PDF file ...');
  const dataBuffer = fs.readFileSync(PDF_PATH);

  const data = await pdf(dataBuffer, { max: 0 }); // all pages
  const text = data.text;
  console.log(`Pages: ${data.numpages} | chars: ${text.length}`);

  // Split on story headers. We look at each line and cut when it starts a story.
  const lines = cleanLines(text);
  const chunks = [];
  let current = [];
  let currentCategory = '';
  let pendingCategory = '';

  for (const line of lines) {
    // Track the most recent أبواب heading seen (before the story).
    const cat = detectCategory(line);
    if (cat && !STORY_HEADER_RE.test(line)) {
      pendingCategory = cat;
    }
    if (STORY_HEADER_RE.test(line)) {
      if (current.length) {
        chunks.push({ category: currentCategory, lines: current });
      }
      currentCategory = pendingCategory || currentCategory;
      current = [line];
    } else if (current.length) {
      current.push(line);
    }
  }
  if (current.length) chunks.push({ category: currentCategory, lines: current });

  const stories = [];
  let counter = 0;
  for (const chunk of chunks) {
    if (!STORY_HEADER_RE.test(chunk.lines[0])) continue;
    counter++;
    const header = chunk.lines[0];
    const title = extractTitle(chunk.lines);
    // Content = everything after the title line.
    const titleIdx = chunk.lines.indexOf(title);
    const rest = titleIdx >= 0 ? chunk.lines.slice(titleIdx + 1) : chunk.lines.slice(1);
    const content = rest.join('\n\n');
    stories.push({
      id: counter,
      number: counter,
      header,
      category: chunk.category || detectCategory(chunk.lines.join('\n')),
      title,
      content: content || chunk.lines.slice(1).join('\n\n'),
    });
  }

  const outputData = {
    bookInfo: {
      title: 'صحيح القصص النبوي',
      author: 'د. عمر سليمان الأشقر',
      totalStories: stories.length,
      language: 'ar',
      direction: 'rtl',
    },
    stories,
  };

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`✅ Extracted ${stories.length} stories -> ${OUTPUT_PATH}`);
  const withCat = stories.filter((s) => s.category).length;
  console.log(`   with باب/category: ${withCat}/${stories.length}`);
  if (stories.length !== 57) {
    console.log('   ⚠️ Expected 57 stories. The header regex may need tuning for this PDF.');
  }
}

processPdf().catch((err) => {
  console.error('❌ Error parsing PDF:', err.message);
  process.exit(1);
});
