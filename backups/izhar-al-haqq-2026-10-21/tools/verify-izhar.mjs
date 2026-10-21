// Post-translation quality gate for izhar-al-haqq: every translated book must
//   1) match the Arabic source structurally (chapter ids, section ids, paragraph counts),
//   2) contain no Arabic-dominant headings/paragraphs (failed gtx calls / 429 fallout).
// Damaged entries are re-translated in place (atomic write) and re-checked.
// Usage: node tools/verify-izhar.mjs             # en fr es
//        TARGETS=en node tools/verify-izhar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateLong, arabicRatio, sleep } from './gtx.mjs';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const SRC_FILE = path.join(DATA_DIR, 'izhar-al-haqq.json');
const TARGETS = (process.env.TARGETS || 'en,fr,es').split(',').map(s => s.trim()).filter(Boolean);
const AR_RATIO_BAD = 0.35;

let repairable = 0, repaired = 0, structural = 0, missing = 0, checked = 0;

const src = JSON.parse(fs.readFileSync(SRC_FILE, 'utf8'));
const atomicWrite = (file, obj) => {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj));
  fs.renameSync(tmp, file);
};

for (const tl of TARGETS) {
  const outPath = path.join(DATA_DIR, `izhar-al-haqq.${tl}.json`);
  if (!fs.existsSync(outPath)) { console.log(`  ${tl}: no translation yet — skipped`); missing++; continue; }
  const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));

  // ---- structural ----
  let structuralIssue = '';
  if ((out.chapters || []).length !== src.chapters.length) structuralIssue = `chapters ${out.chapters?.length} vs ${src.chapters.length}`;
  if (!structuralIssue) {
    for (let ci = 0; ci < src.chapters.length; ci++) {
      const sc = src.chapters[ci], oc = out.chapters[ci];
      if (sc.id !== oc.id) { structuralIssue = `ch[${ci}] id ${oc.id} vs ${sc.id}`; break; }
      if ((oc.sections || []).length !== sc.sections.length) { structuralIssue = `${sc.id}: sections ${oc.sections?.length} vs ${sc.sections.length}`; break; }
      for (let si = 0; si < sc.sections.length; si++) {
        const ss = sc.sections[si], os = oc.sections[si];
        if (ss.id !== os.id) { structuralIssue = `${sc.id}[${si}] section id ${os.id} vs ${ss.id}`; break; }
        if ((os.content || []).length !== ss.content.length) { structuralIssue = `${sc.id}/${ss.id}: paras ${os.content?.length} vs ${ss.content.length}`; break; }
      }
      if (structuralIssue) break;
    }
  }
  if (structuralIssue) {
    console.log(`  ${tl}: STRUCTURAL mismatch (${structuralIssue}) — needs completion via translate-izhar.mjs, not auto-repair`);
    structural++;
    continue;
  }

  // ---- content quality ----
  const fixes = [];
  src.chapters.forEach((sc, ci) => {
    const oc = out.chapters[ci];
    sc.sections.forEach((ss, si) => {
      const os = oc.sections[si];
      checked++;
      if (arabicRatio(ss.heading) > 0.6 && arabicRatio(os.heading || '') > AR_RATIO_BAD) fixes.push({ ci, si, hi: true });
      ss.content.forEach((txt, pi) => {
        checked++;
        if (arabicRatio(txt) > 0.6 && arabicRatio(os.content[pi] || '') > AR_RATIO_BAD) fixes.push({ ci, si, pi });
      });
    });
  });

  if (!fixes.length) {
    console.log(`  ${tl}: OK (${out.chapters.length} chapters, ${checked} entries checked total so far)`);
    continue;
  }
  repairable += fixes.length;
  console.log(`  ${tl}: repairing ${fixes.length} damaged entry(ies)...`);
  for (const f of fixes) {
    const os = out.chapters[f.ci].sections[f.si];
    const ss = src.chapters[f.ci].sections[f.si];
    if (f.hi) os.heading = (await translateLong(ss.heading, tl)) || os.heading;
    else os.content[f.pi] = (await translateLong(ss.content[f.pi], tl)) || os.content[f.pi];
    repaired++;
    await sleep(200);
  }
  atomicWrite(outPath, out);

  let still = 0;
  const out2 = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  src.chapters.forEach((sc, ci) => {
    sc.sections.forEach((ss, si) => {
      const os = out2.chapters[ci].sections[si];
      if (arabicRatio(ss.heading) > 0.6 && arabicRatio(os.heading || '') > AR_RATIO_BAD) still++;
      ss.content.forEach((txt, pi) => {
        if (arabicRatio(txt) > 0.6 && arabicRatio(os.content[pi] || '') > AR_RATIO_BAD) still++;
      });
    });
  });
  console.log(`  ${tl}: repaired ${fixes.length}, still damaged after retry: ${still}`);
}

console.log(`\nVERIFY SUMMARY: ${repairable} damaged found, ${repaired} repaired, ${structural} structural issue(s), ${missing} file(s) missing/not-yet-translated`);
process.exit(structural ? 1 : 0);
