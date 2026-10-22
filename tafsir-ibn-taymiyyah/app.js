/* تفسير شيخ الإسلام ابن تيمية — application engine (Arabic-only, mobile-first).
   Performance model:
   - data/index.json  (~10 KB)  : metadata only, loaded at boot
   - data/c/<n>.json             : chapter text, fetched lazily when opened
   - data/s/<n>.txt             : normalized search blob, fetched lazily on search
   The reader renders paragraphs in small chunks through an IntersectionObserver
   sentinel so a 10 000-paragraph surah never creates 10 000 DOM nodes at once. */

let bookMeta = null;                 // { book, chapters:[...] }
let currentChapterIndex = 0;
let searchQuery = '';
let results = [];                    // { ch, gpara, mIdx }
let resultIdx = null;
let favorites = new Set(JSON.parse(localStorage.getItem('tafsir_favs') || '[]'));
let listFilter = localStorage.getItem('tafsir_filter') === 'fav' ? 'fav' : 'all';

const chapterData = new Map();       // idx -> { id, title, sections:[{id,heading,content[]}] }
const chapterPlan = new Map();       // idx -> { items:[{type,text,gpara}], g2i:Map }
const searchLines = new Map();       // idx -> string[]  (one normalized line per paragraph)
const chapterCounts = new Map();     // idx -> match count for the active query

let renderToken = 0;
let searchToken = 0;
let chunkTimer = null;

const UI = {
  title: 'تفسير شيخ الإسلام ابن تيمية',
  author: 'جمع وتحقيق: إياد بن عبد اللطيف القيسي',
  placeholder: 'ابحث في الكتاب كاملاً...', matches: 'نتيجة مطابقة',
  loading: 'جاري تحميل الكتاب...', error: 'خطأ في تحميل بيانات الكتاب: ',
  prev: 'السابق', next: 'التالي', navLabel: 'تنقل بين المواضع',
  all: 'الكل', favorites: 'المفضلة', noFavs: 'لا توجد مواضع مفضلة بعد',
  prevResult: 'النتيجة السابقة', nextResult: 'النتيجة التالية',
  resultsAria: 'التنقل بين نتائج البحث', favAria: 'المفضلة', theme: 'السمة',
  fontSize: 'حجم الخط', smaller: 'تصغير الخط', larger: 'تكبير الخط',
  searching: 'جاري البحث', loadingChapter: 'جاري تحميل المجلد...',
  more: 'التمرير للمزيد', end: 'نهاية المجلد'
};

const themeOrder = ['light', 'dark', 'sepia'];
const themeIcons = { light: '☀️', dark: '🌙', sepia: '📜' };

const themeToggle = document.getElementById('themeToggle');
const fontMinus = document.getElementById('fontMinus');
const fontPlus = document.getElementById('fontPlus');
const fontMinus2 = document.getElementById('fontMinus2');
const fontPlus2 = document.getElementById('fontPlus2');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const searchInput = document.getElementById('searchInput');
const searchStats = document.getElementById('searchStats');
const chapterList = document.getElementById('chapterList');
const contentContainer = document.getElementById('contentContainer');
const currentChapterTitle = document.getElementById('currentChapterTitle');
const uiTitle = document.getElementById('ui-title');
const authorLine = document.getElementById('authorLine');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const scrollArea = document.getElementById('scrollArea');
const prevChapter = document.getElementById('prevChapter');
const nextChapter = document.getElementById('nextChapter');
const navPos = document.getElementById('navPos');
const chapterNav = document.getElementById('chapterNav');
const favBtn = document.getElementById('favBtn');
const chipAll = document.getElementById('chipAll');
const chipFav = document.getElementById('chipFav');
const resPrev = document.getElementById('resPrev');
const resNext = document.getElementById('resNext');
const resCounter = document.getElementById('resCounter');
const resultNav = document.getElementById('resultNav');

const DIAC_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;
const FOLD_MAP = { '\u0623': '\u0627', '\u0625': '\u0627', '\u0622': '\u0627', '\u0671': '\u0627', '\u0629': '\u0647' };
const MAX_RESULTS = 20000;
const CHUNK = 200;              // paragraphs appended per frame
const PREFETCH_IDLE = 900;      // ms of idle before prefetching the next chapter

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function makeRegex(query) { return new RegExp(escapeRe(query), 'gi'); }

// Strip tashkeel + fold alef/hamza forms, keeping an index map back to the
// original (vocalized) text so highlights land on the exact source glyphs.
function normalizeText(text) {
  let norm = '';
  const map = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (DIAC_RE.test(ch)) continue;
    map.push(i);
    norm += (FOLD_MAP[ch] || ch);
  }
  return { norm: norm, map: map };
}

function normalizeQuery(q) {
  let out = '';
  for (const ch of q) { if (DIAC_RE.test(ch)) continue; out += (FOLD_MAP[ch] || ch); }
  return out;
}

function makeRegexSafe(query) {
  const nq = normalizeQuery(query);
  if (!nq) return null;
  try { return makeRegex(nq); } catch (e) { return null; }
}

// Render `text` into `el`, wrapping every (diacritic-insensitive) match of
// `query` in <mark class="highlight"> — DOM-safe, unlike innerHTML regexing.
function fillHighlighted(el, text, query) {
  el.textContent = '';
  if (!text) return 0;
  const re = makeRegexSafe(query);
  if (!re) { el.textContent = text; return 0; }
  const { norm, map } = normalizeText(text);
  let last = 0, m, n = 0;
  while ((m = re.exec(norm)) !== null) {
    if (m[0].length === 0) { re.lastIndex++; continue; }
    const start = map[m.index];
    const end = map[m.index + m[0].length - 1] + 1;
    if (start == null || end == null) continue;
    if (start > last) el.appendChild(document.createTextNode(text.slice(last, start)));
    const mark = document.createElement('mark');
    mark.className = 'highlight';
    mark.textContent = text.slice(start, end);
    el.appendChild(mark);
    last = end;
    n++;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  return n;
}

function chapterTitle(chap) { return chap.title; }
function chapters() { return (bookMeta && bookMeta.chapters) || []; }

function setFontSize(px) {
  const size = Math.max(12, Math.min(30, px));
  document.documentElement.style.setProperty('--reader-size', size + 'px');
  localStorage.setItem('tafsir_font_size', String(size));
  if (fontSizeValue) fontSizeValue.textContent = String(size);
  return size;
}

function currentFontSize() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--reader-size'), 10) || 19;
}

function stepFont(delta) { setFontSize(currentFontSize() + delta); }

/* ------------------------------------------------------------------ boot */

async function initApp() {
  setupEventListeners();
  loadSavedTheme();
  updateThemeBtn();
  setFontSize(parseInt(localStorage.getItem('tafsir_font_size'), 10) || 19);
  applyUiStrings();
  await fetchBook();
}

async function fetchBook() {
  try {
    const response = await fetch('./data/index.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    bookMeta = await response.json();
    applyBookStrings();
    await maybeLoadFromHash(true);
    schedulePrefetch(0);
  } catch (err) {
    console.warn('Book index load failed:', err);
    contentContainer.textContent = '';
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = UI.error + err.message;
    contentContainer.appendChild(p);
  }
}

/* ------------------------------------------------- lazy chapter loading */

async function loadChapter(idx) {
  if (chapterData.has(idx)) return chapterData.get(idx);
  const meta = chapters()[idx];
  if (!meta) return null;
  const res = await fetch('./data/' + meta.file, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  chapterData.set(idx, data);
  return data;
}

// Prefetch the next chapter while the reader is idle — makes navigation feel
// instant without blocking the first paint.
function schedulePrefetch(idx) {
  const meta = chapters()[idx];
  if (!meta) return;
  const target = idx + 1;
  if (target >= chapters().length || chapterData.has(target)) return;
  if (chunkTimer) clearTimeout(chunkTimer);
  chunkTimer = setTimeout(() => {
    loadChapter(target).catch(() => {});
  }, PREFETCH_IDLE);
}

/* ------------------------------------------------- rendering (chunked) */

function buildPlan(idx, data) {
  const items = [];
  const g2i = new Map();
  let gpara = 0;
  (data.sections || []).forEach(sec => {
    if (sec.heading) {
      g2i.set(gpara, items.length);
      items.push({ type: 'h3', text: sec.heading, gpara: -1 });
    }
    (sec.content || []).forEach(text => {
      g2i.set(gpara, items.length);
      items.push({ type: 'p', text: text, gpara: gpara });
      gpara++;
    });
  });
  const plan = { items: items, g2i: g2i, total: gpara, next: 0 };
  chapterPlan.set(idx, plan);
  return plan;
}

let sentinelObserver = null;

function observeSentinel(sentinel, idx, plan) {
  if (sentinelObserver) sentinelObserver.disconnect();
  sentinelObserver = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      if (plan.next < plan.items.length) {
        renderChunk(idx, plan);
      } else {
        sentinel.remove();
      }
    }
  }, { root: scrollArea, rootMargin: '600px 0px' });
  sentinelObserver.observe(sentinel);
}

function renderChunk(idx, plan) {
  const token = renderToken;
  const frag = document.createDocumentFragment();
  const end = Math.min(plan.next + CHUNK, plan.items.length);
  for (let i = plan.next; i < end; i++) {
    const item = plan.items[i];
    if (item.type === 'h3') {
      const h3 = document.createElement('h3');
      h3.className = 'section-heading';
      fillHighlighted(h3, item.text, searchQuery);
      frag.appendChild(h3);
    } else {
      const p = document.createElement('p');
      p.id = 'p-' + idx + '-' + item.gpara;
      fillHighlighted(p, item.text, searchQuery);
      frag.appendChild(p);
    }
  }
  plan.next = end;
  const sentinel = document.getElementById('renderSentinel');
  contentContainer.insertBefore(frag, sentinel || null);
  if (plan.next >= plan.items.length) {
    const s = document.getElementById('renderSentinel');
    if (s) s.textContent = UI.end;
    if (sentinelObserver) sentinelObserver.disconnect();
  }
  if (token !== renderToken) return;
}

async function displayChapter(chapIdx, opts) {
  const meta = chapters()[chapIdx];
  if (!meta) return;
  currentChapterIndex = chapIdx;
  currentChapterTitle.textContent = chapterTitle(meta);
  contentContainer.textContent = '';

  const h2 = document.createElement('h2');
  h2.className = 'chapter-heading';
  fillHighlighted(h2, chapterTitle(meta), searchQuery);
  contentContainer.appendChild(h2);

  const status = document.createElement('div');
  status.className = 'loading-spinner';
  status.textContent = UI.loadingChapter;
  contentContainer.appendChild(status);

  let data;
  try {
    data = await loadChapter(chapIdx);
  } catch (err) {
    status.textContent = UI.error + err.message;
    return;
  }
  if (currentChapterIndex !== chapIdx) return;   // user moved on

  status.remove();
  const plan = buildPlan(chapIdx, data);
  const sentinel = document.createElement('div');
  sentinel.id = 'renderSentinel';
  sentinel.className = 'render-sentinel';
  sentinel.textContent = plan.items.length ? UI.more : '';
  contentContainer.appendChild(sentinel);

  plan.next = 0;
  renderChunk(chapIdx, plan);
  observeSentinel(sentinel, chapIdx, plan);

  updateNav();
  updateFavBtn();
  savePosition();
  schedulePrefetch(chapIdx);

  if (opts && opts.gpara != null) {
    await ensureRendered(chapIdx, opts.gpara);
  }
}

// Render forward until the requested paragraph exists in the DOM.
async function ensureRendered(idx, gpara) {
  const plan = chapterPlan.get(idx);
  if (!plan) return;
  let guard = 0;
  while (plan.next < plan.items.length && guard++ < 400) {
    const itemIdx = plan.g2i.get(gpara);
    if (itemIdx != null && itemIdx < plan.next) break;
    renderChunk(idx, plan);
    if (plan.next % CHUNK === 0) await new Promise(r => setTimeout(r, 0));
  }
  const el = document.getElementById('p-' + idx + '-' + gpara);
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

/* --------------------------------------------------------- navigation */

function writeHash() {
  const chap = chapters()[currentChapterIndex];
  if (chap) history.replaceState(null, '', `#${chap.id}`);
}

async function maybeLoadFromHash(allowResume) {
  const hashId = (location.hash || '').replace(/^#/, '');
  let idx = chapters().findIndex(c => c.id === hashId);
  if (idx < 0 && allowResume) {
    const saved = JSON.parse(localStorage.getItem('tafsir_pos') || 'null');
    if (saved && saved.id) idx = chapters().findIndex(c => c.id === saved.id);
  }
  if (idx < 0) idx = 0;
  if (!chapters().length) return;
  currentChapterIndex = idx;
  renderChapterList();
  const saved = JSON.parse(localStorage.getItem('tafsir_pos') || 'null');
  await displayChapter(idx);
  if (idx > 0 || !saved) scrollArea.scrollTop = 0;
  if (saved && chapters()[idx] && saved.id === chapters()[idx].id && saved.top) {
    scrollArea.scrollTop = saved.top;
  }
  writeHash();
}

function gotoChapter(idx) {
  if (idx < 0 || idx >= chapters().length) return;
  currentChapterIndex = idx;
  renderChapterList();
  renderToken++;
  displayChapter(idx);
  writeHash();
  if (window.innerWidth <= 768) sidebar.classList.add('closed');
}

function updateNav() {
  const count = chapters().length;
  prevChapter.disabled = currentChapterIndex <= 0;
  nextChapter.disabled = currentChapterIndex >= count - 1;
  navPos.textContent = count ? `${currentChapterIndex + 1} / ${count}` : '';
}

function updateFavBtn() {
  const chap = chapters()[currentChapterIndex];
  const active = chap && favorites.has(chap.id);
  favBtn.classList.toggle('active', !!active);
  favBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
  favBtn.textContent = active ? '★' : '☆';
}

function savePosition() {
  const chap = chapters()[currentChapterIndex];
  if (!chap) return;
  localStorage.setItem('tafsir_pos', JSON.stringify({ id: chap.id, top: scrollArea.scrollTop }));
}

/* -------------------------------------------------- favorites + list */

function renderChapterList() {
  chapterList.textContent = '';
  let visible = 0;

  chapters().forEach((chap, idx) => {
    if (listFilter === 'fav' && !favorites.has(chap.id)) return;
    visible++;

    const div = document.createElement('div');
    div.className = 'chapter-item' + (idx === currentChapterIndex ? ' active' : '');
    div.tabIndex = 0;

    const label = document.createElement('span');
    label.textContent = chapterTitle(chap);
    div.appendChild(label);

    const tail = document.createElement('span');
    tail.style.display = 'flex';
    tail.style.gap = '0.35rem';
    tail.style.alignItems = 'center';

    if (favorites.has(chap.id)) {
      const star = document.createElement('span');
      star.className = 'fav-star';
      star.textContent = '★';
      tail.appendChild(star);
    }

    const count = chapterCounts.get(idx);
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'badge-matches';
      badge.textContent = String(count);
      tail.appendChild(badge);
    }
    div.appendChild(tail);

    const activate = () => gotoChapter(idx);
    div.addEventListener('click', activate);
    div.addEventListener('keydown', (e) => { if (e.key === 'Enter') activate(); });
    chapterList.appendChild(div);
  });

  if (!visible) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = UI.noFavs;
    chapterList.appendChild(note);
  }
}

function updateSearchStats(totalMatches) {
  if (!searchQuery) {
    searchStats.textContent = '';
    resultNav.classList.add('hidden');
    return;
  }
  searchStats.textContent = `${totalMatches} ${UI.matches}`;
  resultNav.classList.remove('hidden');
  updateResultCounter();
}

function updateResultCounter() {
  const n = results.length;
  resCounter.textContent = n ? `${resultIdx == null ? 0 : resultIdx + 1} / ${n}` : '0 / 0';
  resPrev.disabled = n === 0;
  resNext.disabled = n === 0;
}

/* ------------------------------------------------------ global search */

async function getSearchLines(idx) {
  if (searchLines.has(idx)) return searchLines.get(idx);
  const meta = chapters()[idx];
  if (!meta) return [];
  const res = await fetch('./data/' + meta.search, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n');
  searchLines.set(idx, lines);
  return lines;
}

// Progressive search: chapters stream in one at a time so the first results
// show up quickly on slow connections.
async function buildResults(query) {
  const token = ++searchToken;
  results = [];
  resultIdx = null;
  chapterCounts.clear();
  if (!query) { renderChapterList(); updateSearchStats(0); return; }

  const re = makeRegexSafe(query);
  if (!re) { renderChapterList(); updateSearchStats(0); return; }

  const total = chapters().length;
  for (let idx = 0; idx < total; idx++) {
    if (token !== searchToken) return;
    let lines;
    try { lines = await getSearchLines(idx); }
    catch (e) { lines = []; }
    if (token !== searchToken) return;

    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      re.lastIndex = 0;
      let m, mIdx = 0;
      while ((m = re.exec(line)) !== null) {
        if (m[0].length === 0) { re.lastIndex++; continue; }
        if (results.length < MAX_RESULTS) results.push({ ch: idx, gpara: i, mIdx: mIdx });
        mIdx++;
        count++;
      }
    }
    if (count) chapterCounts.set(idx, count);
    searchStats.textContent = `${UI.searching} ${idx + 1}/${total} — ${results.length} ${UI.matches}`;
    renderChapterList();
  }

  if (token !== searchToken) return;
  updateSearchStats(results.length);
  renderChapterList();
}

async function gotoResult(delta) {
  if (!results.length) return;
  if (resultIdx == null) {
    resultIdx = delta > 0 ? 0 : results.length - 1;
  } else {
    resultIdx = Math.min(results.length - 1, Math.max(0, resultIdx + delta));
  }
  const r = results[resultIdx];
  if (!r) return;
  if (r.ch !== currentChapterIndex) {
    currentChapterIndex = r.ch;
    renderChapterList();
    renderToken++;
    await displayChapter(r.ch, { gpara: r.gpara });
  } else {
    await ensureRendered(r.ch, r.gpara);
  }
  writeHash();
  const para = document.getElementById('p-' + r.ch + '-' + r.gpara);
  if (para) {
    const marks = para.querySelectorAll('mark.highlight');
    contentContainer.querySelectorAll('mark.highlight-current').forEach(mk => mk.classList.remove('highlight-current'));
    const target = marks[r.mIdx];
    if (target) {
      target.classList.add('highlight-current');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  updateResultCounter();
}

/* --------------------------------------------- strings / theme / favs */

function applyBookStrings() {
  const t = bookMeta && bookMeta.book;
  uiTitle.textContent = (t && t.title) || UI.title;
  authorLine.textContent = (t && t.author) || UI.author;
}

function applyUiStrings() {
  searchInput.placeholder = UI.placeholder;
  prevChapter.textContent = UI.prev;
  nextChapter.textContent = UI.next;
  chapterNav.setAttribute('aria-label', UI.navLabel || '');
  chipAll.textContent = UI.all;
  chipFav.textContent = UI.favorites;
  resPrev.title = UI.prevResult;
  resNext.title = UI.nextResult;
  resPrev.setAttribute('aria-label', UI.prevResult);
  resNext.setAttribute('aria-label', UI.nextResult);
  resultNav.setAttribute('aria-label', UI.resultsAria);
  favBtn.title = UI.favAria;
  favBtn.setAttribute('aria-label', UI.favAria);
  themeToggle.title = UI.theme;
  if (fontSizeLabel) fontSizeLabel.textContent = UI.fontSize;
  if (fontMinus) { fontMinus.title = UI.smaller; fontMinus.setAttribute('aria-label', UI.smaller); }
  if (fontPlus) { fontPlus.title = UI.larger; fontPlus.setAttribute('aria-label', UI.larger); }
  if (fontMinus2) { fontMinus2.title = UI.smaller; fontMinus2.setAttribute('aria-label', UI.smaller); }
  if (fontPlus2) { fontPlus2.title = UI.larger; fontPlus2.setAttribute('aria-label', UI.larger); }
  applyBookStrings();
  updateNav();
  document.documentElement.lang = 'ar';
  document.body.setAttribute('dir', 'rtl');
  if (bookMeta) renderChapterList();
}

function cycleTheme() {
  const cur = document.body.getAttribute('data-theme') || 'light';
  const next = themeOrder[(themeOrder.indexOf(cur) + 1) % themeOrder.length];
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('tafsir_theme', next);
  updateThemeBtn();
}

function updateThemeBtn() {
  const cur = document.body.getAttribute('data-theme') || 'light';
  themeToggle.textContent = themeIcons[cur] || '🌓';
}

function loadSavedTheme() {
  const saved = localStorage.getItem('tafsir_theme');
  if (saved && themeOrder.includes(saved)) document.body.setAttribute('data-theme', saved);
}

function toggleFavorite() {
  const chap = chapters()[currentChapterIndex];
  if (!chap) return;
  if (favorites.has(chap.id)) favorites.delete(chap.id);
  else favorites.add(chap.id);
  localStorage.setItem('tafsir_favs', JSON.stringify([...favorites]));
  updateFavBtn();
  renderChapterList();
}

function setFilter(mode) {
  listFilter = mode;
  localStorage.setItem('tafsir_filter', mode);
  chipAll.classList.toggle('active', mode === 'all');
  chipFav.classList.toggle('active', mode === 'fav');
  renderChapterList();
}

/* ------------------------------------------------------------ events */

function setupEventListeners() {
  themeToggle.addEventListener('click', cycleTheme);

  fontPlus.addEventListener('click', () => stepFont(2));
  fontMinus.addEventListener('click', () => stepFont(-2));
  if (fontPlus2) fontPlus2.addEventListener('click', () => stepFont(2));
  if (fontMinus2) fontMinus2.addEventListener('click', () => stepFont(-2));

  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      await buildResults(searchQuery);
      if (searchQuery) {
        renderToken++;
        await displayChapter(currentChapterIndex);
      }
    }, 260);
  });

  resPrev.addEventListener('click', () => gotoResult(-1));
  resNext.addEventListener('click', () => gotoResult(1));

  prevChapter.addEventListener('click', () => gotoChapter(currentChapterIndex - 1));
  nextChapter.addEventListener('click', () => gotoChapter(currentChapterIndex + 1));

  favBtn.addEventListener('click', toggleFavorite);
  chipAll.addEventListener('click', () => setFilter('all'));
  chipFav.addEventListener('click', () => setFilter('fav'));

  menuToggle.addEventListener('click', () => sidebar.classList.toggle('closed'));

  let saveTimer = null;
  scrollArea.addEventListener('scroll', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(savePosition, 400);
  }, { passive: true });

  window.addEventListener('hashchange', () => { if (bookMeta) maybeLoadFromHash(false); });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* Warm up the manuscript faces up-front so the first paint never falls back
   to a system serif, and so the service worker has them cached for offline
   reading.  document.fonts.check() only reports a face as available once it
   has actually been fetched. */
(function preloadFonts() {
  if (!document.fonts || !document.fonts.load) return;
  // [font shorthand, sample text] - AmiriPara is Arabic-only, so it needs an
  // Arabic sample to actually trigger the download.
  const faces = [
    ['1rem Amiri', ' '], ['1rem Cairo', ' '],
    ['1rem AmiriPara', '\u0628\u0633\u0645'],
    ['700 1rem Amiri', ' '], ['700 1rem Cairo', ' '],
    ['700 1rem AmiriPara', '\u0628\u0633\u0645']
  ];
  const run = () => faces.forEach(f => { try { document.fonts.load(f[0], f[1]); } catch (e) {} });
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
})();

initApp();
