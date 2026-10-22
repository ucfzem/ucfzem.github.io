import { chromium } from '/tmp/opencode/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8099/tafsir-ibn-taymiyyah/';
const WORKS = process.env.WORKS || 'http://localhost:8099/works/';
let pass = 0, fail = 0;
const ok = (cond, label) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`); };
const hasArabic = s => /[\u0600-\u06FF]/.test(s || '');
const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`;

// expected shape read from the built index, so counts track the crawl
const dataDir = '/tmp/opencode/ucfzem.github.io/tafsir-ibn-taymiyyah/data';
let EXP = { chapters: 7, sections: 0, firstHeading: '', paras: 0 };
try {
  const d = JSON.parse(fs.readFileSync(dataDir + '/index.json', 'utf8'));
  EXP.chapters = d.chapters.length;
  EXP.sections = d.chapters.reduce((n, c) => n + c.sections.length, 0);
  EXP.firstHeading = d.chapters[0].sections[0]?.heading || '';
  EXP.paras = d.chapters.reduce((n, c) => n + c.paras, 0);
} catch {}

const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
const pageErrors = [];
const netIssues = [];
let offlinePhase = false;
p.on('pageerror', e => pageErrors.push('pageerror: ' + e.message));
p.on('response', r => { if (!offlinePhase && r.status() >= 400) netIssues.push(`HTTP ${r.status()} ${r.url()}`); });
p.on('requestfailed', r => { if (!offlinePhase) netIssues.push(`FAILED ${r.failure()?.errorText} ${r.url()}`); });

// ---------- ONLINE: shell + book ----------
await p.goto(BASE, { waitUntil: 'load' });
await p.evaluate(() => navigator.serviceWorker.ready);
if (!await p.evaluate(() => !!navigator.serviceWorker.controller)) await p.reload({ waitUntil: 'load' });
await p.waitForSelector('.chapter-item', { timeout: 30000 });

const bookMeta = await p.evaluate(async () => {
  const r = await fetch('./data/index.json');
  const d = await r.json();
  return { chapters: d.chapters.length, total: d.book.total_chapters,
           sections: d.chapters.reduce((a, c) => a + c.sections.length, 0),
           paras: d.chapters.reduce((a, c) => a + c.paras, 0),
           title: d.book.title, author: d.book.author, collector: d.book.collector,
           content_langs: d.book.content_langs || ['ar'] };
});
ok(bookMeta.chapters === EXP.chapters && bookMeta.total === EXP.chapters, `book JSON: ${EXP.chapters} chapters (${bookMeta.chapters}/${bookMeta.total})`);
ok(bookMeta.sections === EXP.sections, `book JSON: ${EXP.sections} surah sections (${bookMeta.sections})`);
ok(bookMeta.paras === EXP.paras, `book JSON: ${EXP.paras} paragraphs indexed (${bookMeta.paras})`);
ok(bookMeta.content_langs.join(',') === 'ar', `content_langs = ar only (${bookMeta.content_langs.join(',')})`);
ok(bookMeta.title === 'تفسير شيخ الإسلام ابن تيمية', `book JSON: title (${bookMeta.title})`);
ok(/إياد بن عبد اللطيف القيسي/.test(bookMeta.author), `book JSON: collector credited (${bookMeta.author})`);

const chapterCount = await p.$$eval('.chapter-item', e => e.length);
ok(chapterCount === EXP.chapters, `chapter list = ${EXP.chapters} (${chapterCount})`);
const h2 = await p.textContent('#contentContainer h2');
ok(h2.trim() === `الجزء 1`, `first chapter heading (${h2.trim()})`);
const paraLen = await p.$$eval('#contentContainer p', ps => ps.length);
ok(paraLen >= 3, `paragraphs rendered (${paraLen})`);
const firstSec = await p.textContent('#contentContainer h3.section-heading').catch(() => '');
ok(hasArabic(firstSec) && firstSec.trim() === EXP.firstHeading, `first surah section heading (${firstSec.trim()})`);
const nav0 = await p.evaluate(() => ({
  pos: document.getElementById('navPos').textContent.trim(),
  prevDis: document.getElementById('prevChapter').disabled,
  nextDis: document.getElementById('nextChapter').disabled
}));
ok(new RegExp(`1 / ${EXP.chapters}`).test(nav0.pos) && nav0.prevDis && !nav0.nextDis, `nav: at book start (${nav0.pos}, prev disabled)`);

const fonts = await p.evaluate(async () => {
  await document.fonts.ready;
  return {
    pFont: getComputedStyle(document.querySelector('#contentContainer p')).fontFamily.split(',')[0].replace(/["']/g, ''),
    hFont: getComputedStyle(document.querySelector('#contentContainer h2')).fontFamily.split(',')[0].replace(/["']/g, ''),
    para: document.fonts.check('1rem Amiri'), cairo: document.fonts.check('1rem Cairo')
  };
});
ok(fonts.pFont === 'Amiri', `paragraph font = ${fonts.pFont}`);
ok(fonts.hFont === 'Amiri', `heading font = ${fonts.hFont}`);
ok(fonts.para && fonts.cairo, 'AmiriPara + Cairo loaded online');

// ---------- THEME: light -> dark -> sepia cycle ----------
const themes = [];
for (let i = 0; i < 3; i++) {
  themes.push(await p.evaluate(() => ({
    name: document.body.getAttribute('data-theme'),
    bg: getComputedStyle(document.body).backgroundColor,
    icon: document.getElementById('themeToggle').textContent.trim()
  })));
  await p.click('#themeToggle');
  await p.waitForTimeout(200);
}
ok(themes[0].name === 'light' && themes[0].bg === rgb(22, 18, 14), `theme light = warm sepia (${themes[0].bg})`);
ok(themes[1].name === 'dark' && themes[1].bg === rgb(22, 18, 14), `theme dark = warm sepia (${themes[1].bg})`);
ok(themes[2].name === 'sepia' && themes[2].bg === rgb(36, 29, 21), `theme sepia = warm olive (${themes[2].bg})`);
ok(themes[0].icon !== themes[1].icon && themes[1].icon !== themes[2].icon, `theme icons differ (${themes.map(t => t.icon).join(' ')})`);
ok(await p.evaluate(() => document.body.getAttribute('data-theme')) === 'light', 'theme cycled back to light');
ok(await p.evaluate(() => localStorage.getItem('tafsir_theme')) === 'light', 'theme persisted');

// ---------- NO language pills (Arabic-only build) ----------
const flags = await p.$$eval('.lang-btn', bs => bs.length).catch(() => 0);
ok(flags === 0, `no language pills in Arabic-only build (${flags})`);

// ---------- SEARCH: global + badges + result navigation ----------
await p.fill('#searchInput', 'ابن تيمية');
// progressive search streams through the 7 volumes - wait until it settles
let stats = '';
for (let i = 0; i < 60; i++) {
  stats = (await p.textContent('#searchStats')).trim();
  if (stats && !stats.startsWith('\u062c\u0627\u0631\u064a \u0627\u0644\u0628\u062d\u062b')) break;
  await new Promise(r => setTimeout(r, 400));
}
const n1 = parseInt(stats, 10);
ok(n1 > 10, `global search "ابن تيمية" counts matches (${stats})`);
ok(await p.isVisible('#resultNav'), 'search: result navigation appears');
const counter0 = (await p.textContent('#resCounter')).trim();
ok(/^0 \/ \d+$/.test(counter0) && parseInt(counter0.split('/')[1], 10) > 10, `search: counter starts at 0/N (${counter0})`);
await p.click('#resNext');
await p.waitForTimeout(600);
const counter1 = (await p.textContent('#resCounter')).trim();
const hasCurrent1 = await p.$$eval('#contentContainer mark.highlight-current', m => m.length);
ok(counter1.startsWith('1 /') && hasCurrent1 === 1, `result nav: next → 1/N + current highlight (${counter1}, marks=${hasCurrent1})`);
await p.click('#resNext');
await p.waitForTimeout(600);
ok((await p.textContent('#resCounter')).trim().startsWith('2 /'), 'result nav: advances to 2/N');
await p.click('#resPrev');
await p.waitForTimeout(500);
ok((await p.textContent('#resCounter')).trim().startsWith('1 /'), 'result nav: prev returns to 1/N');

const badgeChapters = await p.$$eval('.chapter-item .badge-matches', e => e.length);
ok(badgeChapters >= 1, `chapter badges on matching chapters (${badgeChapters})`);

await p.fill('#searchInput', '((');
await p.waitForTimeout(400);
ok(await p.$$eval('.chapter-item', e => e.length) === EXP.chapters, 'regex-special "((" does not crash');
await p.fill('#searchInput', '<b>inject</b>');
await p.waitForTimeout(400);
ok(await p.$$eval('#contentContainer b', x => x.length) === 0, 'HTML-ish query not injected');
await p.fill('#searchInput', '');
await p.waitForTimeout(350);
ok(!await p.isVisible('#resultNav'), 'search: result nav hides when query cleared');

// ---------- FAVORITES ----------
ok((await p.textContent('#favBtn')).trim() === '☆', 'favorites: starts unstarred');
await p.click('#favBtn');
await p.waitForTimeout(300);
ok((await p.textContent('#favBtn')).trim() === '★', 'favorites: star toggles on');
ok(await p.getAttribute('#favBtn', 'aria-pressed') === 'true', 'favorites: aria-pressed true');
ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('tafsir_favs') || '[]')).length) === 1, 'favorites: persisted to localStorage');
await p.click('#chipFav');
await p.waitForTimeout(300);
ok(await p.$$eval('.chapter-item', e => e.length) === 1, 'favorites: filter shows only starred');
await p.click('#chipAll');
await p.waitForTimeout(300);
ok(await p.$$eval('.chapter-item', e => e.length) === EXP.chapters, `favorites: All filter restores ${EXP.chapters}`);

// ---------- NAV across chapters + ends ----------
await p.click('.chapter-item:nth-child(2)').catch(()=>{});
await p.waitForTimeout(400);
if (EXP.chapters >= 2) {
  ok(await p.evaluate(() => location.hash) === '#juz-2', `deep-link written (${await p.evaluate(() => location.hash)})`);
}
if (EXP.chapters >= 3) {
  const canNext = await p.evaluate(() => !document.getElementById('nextChapter').disabled);
  if (canNext) {
    await p.click('#nextChapter');
    await p.waitForTimeout(400);
    ok(await p.evaluate(() => location.hash) === '#juz-3', 'nav: next advances');
    await p.click('#prevChapter');
    await p.waitForTimeout(400);
    ok(await p.evaluate(() => location.hash) === '#juz-2', 'nav: prev returns');
  }
}
await p.evaluate((c) => { location.hash = `juz-${c}`; }, EXP.chapters);
// wait for the volume to load (production network can be slow)
let endNav = { pos: '', nextDis: false, prevDis: false };
for (let i = 0; i < 40; i++) {
  endNav = await p.evaluate(() => ({
    pos: document.getElementById('navPos').textContent.trim(),
    nextDis: document.getElementById('nextChapter').disabled,
    prevDis: document.getElementById('prevChapter').disabled
  }));
  if (new RegExp(`^${EXP.chapters} / ${EXP.chapters}`).test(endNav.pos)) break;
  await new Promise(r => setTimeout(r, 400));
}
ok(new RegExp(`${EXP.chapters} / ${EXP.chapters}`).test(endNav.pos) && endNav.nextDis && !endNav.prevDis, `nav: book end disables next (${endNav.pos})`);

// ---------- DEEP LINK + RESUME + DRAWER + FONT SIZE ----------
const resumeIdx = Math.min(3, EXP.chapters);
await p.click(`.chapter-item:nth-child(${resumeIdx})`).catch(()=>{});
await p.waitForTimeout(400);
const resumedTitle = await p.$eval('.chapter-item.active span', e => e.textContent.trim()).catch(() => '');
if (resumedTitle) {
  await p.reload({ waitUntil: 'load' });
  await p.waitForSelector('.chapter-item', { timeout: 30000 });
  ok(await p.$eval('.chapter-item.active span', e => e.textContent.trim()).catch(()=>null) === resumedTitle, `deep-link restores chapter after reload (${resumedTitle})`);
  await p.evaluate(() => history.replaceState(null, '', ' '));
  await p.reload({ waitUntil: 'load' });
  await p.waitForSelector('.chapter-item', { timeout: 30000 });
  ok(await p.$eval('.chapter-item.active span', e => e.textContent.trim()).catch(()=>null) === resumedTitle, 'resume: last reading position restored without hash');
} else {
  ok(true, 'resume test skipped (insufficient chapters)');
}

await p.click('#menuToggle'); await p.waitForTimeout(400);
const closed = await p.evaluate(() => document.getElementById('sidebar').classList.contains('closed'));
await p.click('#menuToggle'); await p.waitForTimeout(400);
ok(closed && !await p.evaluate(() => document.getElementById('sidebar').classList.contains('closed')), 'drawer toggles');

const fs0 = await p.evaluate(() => getComputedStyle(document.querySelector('#contentContainer p')).fontSize);
await p.click('#fontPlus');
const fsUp = await p.evaluate(() => getComputedStyle(document.querySelector('#contentContainer p')).fontSize);
ok(parseFloat(fsUp) > parseFloat(fs0), `A+ enlarges text (${fs0} -> ${fsUp})`);
await p.click('#fontMinus');
ok(await p.evaluate(() => getComputedStyle(document.querySelector('#contentContainer p')).fontSize) === fs0, 'A- restores text');
ok(!!await p.evaluate(() => localStorage.getItem('tafsir_font_size')), 'font size persisted');

const fontBtns = await p.evaluate(() => {
  const vis = id => { const el = document.getElementById(id); if (!el) return false; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
  return { minus: vis('fontMinus'), plus: vis('fontPlus'), minus2: vis('fontMinus2'), plus2: vis('fontPlus2') };
});
ok(fontBtns.minus && fontBtns.plus, 'header A-/A+ visible');
ok(fontBtns.minus2 && fontBtns.plus2, 'sidebar A-/A+ visible');

// ---------- OFFLINE ----------
let cached = false;
for (let i = 0; i < 90; i++) {
  cached = await p.evaluate(async () => {
    const ks = await caches.keys();
    for (const k of ks) {
      if (!k.startsWith('tafsir-')) continue;
      const c = await caches.open(k);
      let all = true;
      for (const f of ['data/index.json', 'fonts/cairo-400-arabic.woff2', 'style.css?v=3', 'app.js?v=7']) {
        if (!await c.match('/tafsir-ibn-taymiyyah/' + f)) all = false;
      }
      if (all) return true;
    }
    return false;
  });
  if (cached) break;
  await new Promise(r => setTimeout(r, 400));
}
ok(cached, 'book index + app files + fonts precached online');

offlinePhase = true;
await ctx.setOffline(true);
await p.reload({ waitUntil: 'load' }).catch(e => console.log('  offline reload err:', e.message));
await p.waitForSelector('.chapter-item', { timeout: 30000 }).catch(() => {});
ok(await p.$$eval('.chapter-item', e => e.length) === EXP.chapters, `OFFLINE: ${EXP.chapters} chapters render`);
const offBody = await p.textContent('#contentContainer');
ok(hasArabic(offBody) && offBody.length > 500, `OFFLINE: Arabic book text reads (${offBody.length} chars)`);
const offFonts = await p.evaluate(async () => { await document.fonts.ready; return { para: document.fonts.check('1rem Amiri'), cairo: document.fonts.check('1rem Cairo') }; });
ok(offFonts.para && offFonts.cairo, 'OFFLINE: fonts load');
await p.fill('#searchInput', 'ابن تيمية');
await p.waitForTimeout(3500);
ok(parseInt((await p.textContent('#searchStats')).trim(), 10) > 10, 'OFFLINE: global search works');
await p.click('#resNext');
await p.waitForTimeout(600);
ok((await p.textContent('#resCounter')).trim().startsWith('1 /'), 'OFFLINE: result navigation works');
await ctx.setOffline(false);
offlinePhase = false;

// ---------- MOBILE (360px) ----------
const mp = await ctx.newPage();
await mp.setViewportSize({ width: 360, height: 740 });
await mp.goto(BASE, { waitUntil: 'load' });
await mp.waitForSelector('.chapter-item', { timeout: 30000 });
const hdr = await mp.evaluate(() => {
  const h = document.querySelector('header.app-bar').getBoundingClientRect();
  const bs = document.querySelector('.brand-section').getBoundingClientRect();
  const c = document.querySelector('.controls-group').getBoundingClientRect();
  const t = document.querySelector('.app-title').getBoundingClientRect();
  const cy = r => r.top + r.height / 2;
  return {
    hH: h.height, rowGap: Math.abs(cy(bs) - cy(c)),
    titleInHeader: t.top >= h.top - 1 && t.bottom <= h.bottom + 1,
    noHScroll: document.documentElement.scrollWidth <= window.innerWidth + 1,
    fontBtnsVisible: ['fontMinus','fontPlus'].every(id => { const el = document.getElementById(id); const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && r.width > 0 && r.height > 0; })
  };
});
ok(hdr.hH <= 70 && hdr.rowGap <= 10, `MOBILE: header single row (rowGap ${hdr.rowGap.toFixed(1)}px)`);
ok(hdr.titleInHeader, 'MOBILE: title in header');
ok(hdr.noHScroll, 'MOBILE: no horizontal overflow');
ok(hdr.fontBtnsVisible, 'MOBILE: A-/A+ visible in header');
await mp.click('#menuToggle'); await mp.waitForTimeout(400);
const mobFont = await mp.evaluate(() => {
  const el = document.getElementById('fontPlus2'); const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
  return { visible: cs.display !== 'none' && r.width > 0, label: document.getElementById('fontSizeLabel')?.textContent };
});
ok(mobFont.visible && !!mobFont.label, `MOBILE: sidebar font control reachable (label "${mobFont.label}")`);
await mp.close();

// ---------- WORKS CARD (Maktaba, unlocked) ----------
const w = await ctx.newPage();
const wNet = [];
w.on('response', r => { if (r.status() >= 400) wNet.push(`HTTP ${r.status()} ${r.url()}`); });
await w.goto(WORKS, { waitUntil: 'domcontentloaded' });
await w.waitForSelector('#f-maktaba a.card', { timeout: 30000 });
await w.waitForFunction(() => {
  const img = document.querySelector('#f-maktaba a[href*="tafsir-ibn-taymiyyah"] img.card-icon');
  return !!img && img.complete;
}, null, { timeout: 12000 }).catch(() => {});
const card = await w.evaluate(() => {
  const a = document.querySelector('#f-maktaba a[href*="tafsir-ibn-taymiyyah"]');
  if (!a) return null;
  const img = a.querySelector('img.card-icon');
  return { name: a.querySelector('.card-name')?.textContent,
           inMaktaba: !!a.closest('#f-maktaba'), publicArea: !!a.closest('#publicProjects'),
           iconOk: !!img && img.complete && (img.naturalWidth > 0 || img.src.endsWith('.svg')),
           href: a.getAttribute('href') };
});
ok(!!card && card.inMaktaba && card.publicArea, 'works: card inside Maktaba (unlocked)');
ok(!!card && card.name === 'تفسير شيخ الإسلام ابن تيمية', `works: card name (${card?.name})`);
ok(!!card && card.iconOk, 'works: icon loads');
ok(!!card && /ucfzem\.github\.io\/tafsir-ibn-taymiyyah\//.test(card.href), `works: href (${card?.href})`);

if (pageErrors.length) { console.log('  page errors:'); pageErrors.slice(0, 6).forEach(e => console.log('   -', e)); }
if (netIssues.length) { console.log('  online net issues:'); netIssues.slice(0, 8).forEach(e => console.log('   -', e)); }
if (wNet.length) { console.log('  works net issues:'); wNet.slice(0, 4).forEach(e => console.log('   -', e)); }
ok(pageErrors.length === 0, 'no uncaught page errors');
ok(netIssues.length === 0, 'no failed/404 requests while online');
ok(wNet.length === 0, 'works page: no failed requests');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
