// extract.js — Extract all stories from «صحيح القصص النبوي» PDF into
// data/sahih-al-qasas.json (Node.js workflow).
//
// Usage:
//   npm init -y && npm install pdf-parse
//   node tools/extract.js ar_Prophet_Stories.pdf
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

const CATEGORIES = [
  'قصص الأنبياء والمرسلين',
  'القصص الدالة على عجائب قدرة الله',
  'القصص الدالة على فضائل الأعمال',
  'قصص النماذج الإيمانية الراقية',
  'قصص النماذج السيئة',
];

const detectCategory = (text) => CATEGORIES.find((c) => text.includes(c)) || '';

async function processPdf() {
  console.log('Reading PDF file ...');
  const dataBuffer = fs.readFileSync(PDF_PATH);

  const data = await pdf(dataBuffer);
  const text = data.text;

  console.log('Extracting stories using regex boundary parsing ...');
  const chunks = text.split(/\n(?=القصة\s+(?:ال|[\d\u0660-\u0669]))/);
  const stories = [];
  let counter = 0;

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length > 0 && lines[0].startsWith('القصة')) {
      counter++;
      const header = lines[0];
      const title = lines.length > 1 ? lines[1] : header;
      const content = lines.slice(2).join('\n\n');
      stories.push({
        id: counter,
        number: counter,
        header,
        category: detectCategory(chunk),
        title,
        content: content || chunk.trim(),
      });
    }
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
  console.log(`✅ Successfully formatted ${stories.length} stories into ${OUTPUT_PATH}`);
}

processPdf().catch((err) => {
  console.error('❌ Error parsing PDF:', err.message);
  process.exit(1);
});
