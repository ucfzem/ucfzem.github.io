// Post-translation quality gate: every translated chapter must
//   1) match the Arabic source structurally (chapter ids, paragraph counts),
//   2) contain no Arabic-dominant paragraphs (failed gtx calls / 429 fallout).
// Damaged paragraphs are re-translated in place (atomic write) and re-checked.
// Networking/repair uses the shared multi-client layer (gtx.mjs).
// Usage: node tools/verify-translations.mjs            # en fr es, all volumes
//        TARGETS=en VOLS=1,2 node tools/verify-translations.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateLong, arabicRatio, sleep } from './gtx.mjs';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const TARGETS = (process.env.TARGETS || 'en,fr,es').split(',').map(s => s.trim()).filter(Boolean);
const VOLS = (process.env.VOLS || '1,2,3,4,5,6').split(',').map(s => parseInt(s.trim(), 10)).filter(n => n > 0);
const AR_RATIO_BAD = 0.35;

let repairable = 0, repaired = 0, structural = 0, missing = 0, checkedParas = 0;

for (const tl of TARGETS) {
  for (const volNum of VOLS) {
    const srcPath = path.join(DATA_DIR, `vol_${volNum}.json`);
    const outPath = path.join(DATA_DIR, `vol_${volNum}.${tl}.json`);
    if (!fs.existsSync(srcPath)) { console.error(`  !! missing source ${srcPath}`); missing++; continue; }
    if (!fs.existsSync(outPath)) { console.log(`  ${tl}/vol_${volNum}: no translation yet — skipped`); missing++; continue; }
    const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));

    if ((out.chapters || []).length !== (src.chapters || []).length) {
      console.log(`  ${tl}/vol_${volNum}: STRUCTURAL mismatch (${out.chapters?.length} vs ${src.chapters?.length} chapters) — needs full re-translation, not auto-repair`);
      structural++;
      continue;
    }

    const fixes = [];
    src.chapters.forEach((sc, ci) => {
      const oc = out.chapters[ci];
      if (sc.id !== oc.id) { fixes.push({ ci, kind: 'id' }); return; }
      if ((sc.paragraphs || []).length !== (oc.paragraphs || []).length) {
        fixes.push({ ci, kind: 'paracount' }); return;
      }
      if (arabicRatio(sc.title) > 0.6 && arabicRatio(oc.title) > AR_RATIO_BAD) fixes.push({ ci, pi: -1 });
      oc.paragraphs.forEach((pt, pi) => {
        checkedParas++;
        const srcRatio = arabicRatio(sc.paragraphs[pi]);
        if (srcRatio > 0.6 && arabicRatio(pt) > AR_RATIO_BAD) fixes.push({ ci, pi });
      });
    });

    const bad = fixes.filter(f => f.kind === undefined);
    const structuralCh = fixes.filter(f => f.kind);
    if (structuralCh.length) {
      console.log(`  ${tl}/vol_${volNum}: STRUCTURAL issues in ${structuralCh.length} chapter(s) — manual/full re-translation needed`);
      structural += structuralCh.length;
    }
    if (!bad.length) {
      console.log(`  ${tl}/vol_${volNum}: OK (${out.chapters.length} chapters, ${checkedParas} paras checked total so far)`);
      continue;
    }
    repairable += bad.length;
    console.log(`  ${tl}/vol_${volNum}: repairing ${bad.length} damaged paragraph(s)...`);
    for (const f of bad) {
      const sc = src.chapters[f.ci];
      const oc = out.chapters[f.ci];
      const srcText = f.pi === -1 ? sc.title : sc.paragraphs[f.pi];
      const tr = await translateLong(srcText, tl);
      if (f.pi === -1) oc.title = tr || oc.title;
      else oc.paragraphs[f.pi] = tr || oc.paragraphs[f.pi];
      repaired++;
      await sleep(200);
    }
    const tmp = outPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(out));
    fs.renameSync(tmp, outPath);

    let still = 0;
    out.chapters.forEach((oc, ci) => {
      const sc = src.chapters[ci];
      oc.paragraphs?.forEach((pt, pi) => {
        if (arabicRatio(sc.paragraphs?.[pi] || '') > 0.6 && arabicRatio(pt) > AR_RATIO_BAD) still++;
      });
    });
    console.log(`  ${tl}/vol_${volNum}: repaired ${bad.length}, still damaged after retry: ${still}`);
  }
}

console.log(`\nVERIFY SUMMARY: ${repairable} damaged found, ${repaired} repaired, ${structural} structural issue(s), ${missing} file(s) missing/not-yet-translated`);
process.exit(structural ? 1 : 0);
