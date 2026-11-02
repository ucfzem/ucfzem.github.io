/* Izhar al-Haqq — application engine.
   Cloned from al-jawab-al-sahih (diacritic-insensitive highlight, drawer,
   nav) and extended for the single-file book schema: sections, favorites,
   reading-position resume, three themes, and global search result navigation. */

let bookData = null;
let contentBook = null;      // null => Arabic source (bookData); else the loaded translation
const translationCache = {}; // lang -> translation object, or false after a failed load
let currentChapterIndex = 0;
let searchQuery = '';
let results = [];          // flat search results: {ch, sec, para, start, end}
let resultIdx = null;      // index into results of the "current" result
let currentLang = localStorage.getItem('izhar_lang') || 'ar';
let favorites = new Set(JSON.parse(localStorage.getItem('izhar_favs') || '[]'));
let listFilter = localStorage.getItem('izhar_filter') === 'fav' ? 'fav' : 'all';

const i18n = {
  ar: {
    title: 'إظهار الحق', author: 'الشيخ رحمت الله الهندي',
    placeholder: 'ابحث في الكتاب كاملاً...', matches: 'نتيجة مطابقة',
    loading: 'جاري تحميل الكتاب...', error: 'خطأ في تحميل بيانات الكتاب: ',
    prev: 'السابق', next: 'التالي', navLabel: 'تنقل بين الفصول',
    all: 'الكل', favorites: 'المفضلة', noFavs: 'لا توجد فصول مفضلة بعد',
    prevResult: 'النتيجة السابقة', nextResult: 'النتيجة التالية',
    resultsAria: 'التنقل بين نتائج البحث', favAria: 'المفضلة', theme: 'السمة',
    fontSize: 'حجم الخط', smaller: 'تصغير الخط', larger: 'تكبير الخط'
  },
  en: {
    title: 'Izhar al-Haqq', author: 'Sheikh Rahmatullah al-Hindi',
    placeholder: 'Search the whole book...', matches: 'matches found',
    loading: 'Loading book...', error: 'Error loading book data: ',
    prev: 'Previous', next: 'Next', navLabel: 'Chapter navigation',
    all: 'All', favorites: 'Favorites', noFavs: 'No favorite chapters yet',
    prevResult: 'Previous result', nextResult: 'Next result',
    resultsAria: 'Search result navigation', favAria: 'Favorites', theme: 'Theme',
    fontSize: 'Font size', smaller: 'Smaller text', larger: 'Larger text'
  },
  fr: {
    title: 'Izhar al-Haqq', author: 'Cheikh Rahmatullah al-Hindi',
    placeholder: 'Rechercher dans tout le livre...', matches: 'correspondances',
    loading: 'Chargement du livre...', error: 'Erreur de chargement des données : ',
    prev: 'Précédent', next: 'Suivant', navLabel: 'Navigation entre les chapitres',
    all: 'Tout', favorites: 'Favoris', noFavs: 'Aucun chapitre favori pour le moment',
    prevResult: 'Résultat précédent', nextResult: 'Résultat suivant',
    resultsAria: 'Navigation dans les résultats de recherche', favAria: 'Favoris', theme: 'Thème',
    fontSize: 'Taille du texte', smaller: 'Réduire le texte', larger: 'Agrandir le texte'
  },
  es: {
    title: 'Izhar al-Haqq', author: 'Jeques Rahmatullah al-Hindi',
    placeholder: 'Buscar en todo el libro...', matches: 'coincidencias',
    loading: 'Cargando libro...', error: 'Error al cargar los datos: ',
    prev: 'Anterior', next: 'Siguiente', navLabel: 'Navegación entre capítulos',
    all: 'Todo', favorites: 'Favoritos', noFavs: 'Aún no hay capítulos favoritos',
    prevResult: 'Resultado anterior', nextResult: 'Resultado siguiente',
    resultsAria: 'Navegación de resultados de búsqueda', favAria: 'Favoritos', theme: 'Tema',
    fontSize: 'Tamaño de letra', smaller: 'Texto más pequeño', larger: 'Texto más grande'
  }
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

function countMatches(text, query) {
  if (!text) return 0;
  const re = makeRegexSafe(query);
  if (!re) return 0;
  const norm = normalizeText(text).norm;
  let n = 0;
  let m;
  while ((m = re.exec(norm)) !== null) {
    if (m[0].length === 0) { re.lastIndex++; continue; }
    n++;
  }
  return n;
}

// Render `text` into `el`, wrapping every (diacritic-insensitive) match of
// `query` in <mark class="highlight"> — DOM-safe, unlike innerHTML regexing.
function fillHighlighted(el, text, query) {
  el.textContent = '';
  if (!text) return;
  const re = makeRegexSafe(query);
  if (!re) { el.textContent = text; return; }
  const { norm, map } = normalizeText(text);
  let last = 0, m;
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
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
}

function chapterTitle(chap) { return (chap.titles && chap.titles[currentLang]) || chap.title; }

function chapterCorpus(chap) {
  const parts = [chap.title];
  (chap.sections || []).forEach(s => { parts.push(s.heading || ''); parts.push(...(s.content || [])); });
  return parts.join(' ');
}

function setFontSize(px) {
  const size = Math.max(12, Math.min(30, px));
  document.documentElement.style.setProperty('--reader-size', size + 'px');
  localStorage.setItem('izhar_font_size', String(size));
  if (fontSizeValue) fontSizeValue.textContent = String(size);
  return size;
}

function currentFontSize() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--reader-size'), 10) || 18;
}

function stepFont(delta) { setFontSize(currentFontSize() + delta); }

async function initApp() {
  setupEventListeners();
  loadSavedTheme();
  updateThemeBtn();
  setFontSize(parseInt(localStorage.getItem('izhar_font_size'), 10) || 18);
  applyUiStrings();
  await fetchBook();
}

async function fetchBook() {
  try {
    const response = await fetch('./data/izhar-al-haqq.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    bookData = await response.json();
    applyBookStrings();
    await ensureContent(currentLang); // restore translated content for a saved language
    await maybeLoadFromHash(true);
  } catch (err) {
    console.warn('Book load failed:', err);
    contentContainer.textContent = '';
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = i18n[currentLang].error + err.message;
    contentContainer.appendChild(p);
  }
}

function writeHash() {
  const chap = chapters()[currentChapterIndex];
  if (chap) history.replaceState(null, '', `#${chap.id}`);
}

function chapters() {
  const active = contentBook || bookData;
  return (active && active.chapters) || [];
}

// Language gate: only fetch a translation file the book declares in
// book.content_langs (no 404 probes for languages that don't exist yet).
function contentLangs() {
  return (bookData && bookData.book && bookData.book.content_langs) || ['ar'];
}

async function ensureContent(lang) {
  if (!bookData || lang === 'ar' || !contentLangs().includes(lang)) { contentBook = null; return; }
  if (translationCache[lang] === false) { contentBook = null; return; }
  if (translationCache[lang]) { contentBook = translationCache[lang]; return; }
  try {
    const response = await fetch(`./data/izhar-al-haqq.${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!json || !Array.isArray(json.chapters) || json.chapters.length !== bookData.chapters.length) {
      throw new Error('translation shape mismatch');
    }
    translationCache[lang] = json;
    contentBook = json;
  } catch (err) {
    console.warn('Translation load failed, using Arabic source:', err);
    translationCache[lang] = false;
    contentBook = null;
  }
}

async function maybeLoadFromHash(allowResume) {
  const hashId = (location.hash || '').replace(/^#/, '');
  let idx = chapters().findIndex(c => c.id === hashId);
  if (idx < 0 && allowResume) {
    const saved = JSON.parse(localStorage.getItem('izhar_pos') || 'null');
    if (saved && saved.id) idx = chapters().findIndex(c => c.id === saved.id);
  }
  if (idx < 0) idx = 0;
  if (!chapters().length) return;
  currentChapterIndex = idx;
  renderChapterList();
  displayChapter(currentChapterIndex);
  const saved = JSON.parse(localStorage.getItem('izhar_pos') || 'null');
  if (idx > 0 || !saved) scrollArea.scrollTop = 0;
  requestAnimationFrame(() => {
    if (saved && chapters()[idx] && saved.id === chapters()[idx].id && saved.top) {
      scrollArea.scrollTop = saved.top;
    }
  });
  writeHash();
}

function gotoChapter(idx) {
  if (idx < 0 || idx >= chapters().length) return;
  currentChapterIndex = idx;
  renderChapterList();
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

function displayChapter(chapIdx) {
  const chap = chapters()[chapIdx];
  if (!chap) return;

  currentChapterTitle.textContent = chapterTitle(chap);
  contentContainer.textContent = '';

  const h2 = document.createElement('h2');
  h2.className = 'chapter-heading';
  fillHighlighted(h2, chapterTitle(chap), searchQuery);
  contentContainer.appendChild(h2);

  (chap.sections || []).forEach(sec => {
    if (sec.heading) {
      const h3 = document.createElement('h3');
      h3.className = 'section-heading';
      fillHighlighted(h3, sec.heading, searchQuery);
      contentContainer.appendChild(h3);
    }
    (sec.content || []).forEach(text => {
      const p = document.createElement('p');
      fillHighlighted(p, text, searchQuery);
      contentContainer.appendChild(p);
    });
  });

  updateNav();
  updateFavBtn();
  savePosition();
}

function savePosition() {
  const chap = chapters()[currentChapterIndex];
  if (!chap) return;
  localStorage.setItem('izhar_pos', JSON.stringify({ id: chap.id, top: scrollArea.scrollTop }));
}

/* ---------------- favorites + list ---------------- */

function renderChapterList() {
  chapterList.textContent = '';
  let totalMatches = 0;
  const chaps = chapters();
  let visible = 0;

  chaps.forEach((chap, idx) => {
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

    if (searchQuery) {
      const count = countMatches(chapterCorpus(chap), searchQuery);
      totalMatches += count;
      if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge-matches';
        badge.textContent = String(count);
        tail.appendChild(badge);
      }
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
    note.textContent = i18n[currentLang].noFavs;
    chapterList.appendChild(note);
  }

  updateSearchStats(totalMatches);
}

function updateSearchStats(totalMatches) {
  if (!searchQuery) {
    searchStats.textContent = '';
    resultNav.classList.add('hidden');
    return;
  }
  searchStats.textContent = `${totalMatches} ${i18n[currentLang].matches}`;
  resultNav.classList.remove('hidden');
  updateResultCounter();
}

function updateResultCounter() {
  const n = results.length;
  resCounter.textContent = n ? `${resultIdx == null ? 0 : resultIdx + 1} / ${n}` : '0 / 0';
  resPrev.disabled = n === 0;
  resNext.disabled = n === 0;
}

/* ---------------- global search ---------------- */

function buildResults() {
  results = [];
  resultIdx = null;
  if (!searchQuery) return;
  const re = makeRegexSafe(searchQuery);
  if (!re) return;

  chapters().forEach((chap, ch) => {
    (chap.sections || []).forEach((sec, si) => {
      (sec.content || []).forEach((text, pi) => {
        if (results.length >= MAX_RESULTS) return;
        const { norm, map } = normalizeText(text || '');
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(norm)) !== null) {
          if (m[0].length === 0) { re.lastIndex++; continue; }
          const start = map[m.index];
          const end = map[m.index + m[0].length - 1] + 1;
          if (start == null || end == null) continue;
          results.push({ ch, sec: si, para: pi, start, end });
          if (results.length >= MAX_RESULTS) break;
        }
      });
    });
  });
}

function gotoResult(delta) {
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
    displayChapter(r.ch);
    writeHash();
  }
  // DOM marks appear in the same order as results for this chapter.
  const marks = contentContainer.querySelectorAll('mark.highlight');
  const firstOfChapter = results.findIndex(x => x.ch === r.ch);
  const markIdx = resultIdx - firstOfChapter;
  const target = marks[markIdx];
  contentContainer.querySelectorAll('mark.highlight-current').forEach(mk => mk.classList.remove('highlight-current'));
  if (target) {
    target.classList.add('highlight-current');
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  updateResultCounter();
}

/* ---------------- i18n / theme / favorites ---------------- */

function applyBookStrings() {
  const t = bookData && bookData.book && bookData.book.translations && bookData.book.translations[currentLang];
  uiTitle.textContent = (t && t.title) || i18n[currentLang].title;
  authorLine.textContent = (t && t.author) || i18n[currentLang].author;
}

function applyUiStrings() {
  const t = i18n[currentLang];
  searchInput.placeholder = t.placeholder;
  prevChapter.textContent = t.prev;
  nextChapter.textContent = t.next;
  chapterNav.setAttribute('aria-label', t.navLabel || '');
  chipAll.textContent = t.all;
  chipFav.textContent = t.favorites;
  resPrev.title = t.prevResult;
  resNext.title = t.nextResult;
  resPrev.setAttribute('aria-label', t.prevResult);
  resNext.setAttribute('aria-label', t.nextResult);
  resultNav.setAttribute('aria-label', t.resultsAria);
  favBtn.title = t.favAria;
  favBtn.setAttribute('aria-label', t.favAria);
  themeToggle.title = t.theme;
  if (fontSizeLabel) fontSizeLabel.textContent = t.fontSize;
  if (fontMinus) { fontMinus.title = t.smaller; fontMinus.setAttribute('aria-label', t.smaller); }
  if (fontPlus) { fontPlus.title = t.larger; fontPlus.setAttribute('aria-label', t.larger); }
  if (fontMinus2) { fontMinus2.title = t.smaller; fontMinus2.setAttribute('aria-label', t.smaller); }
  if (fontPlus2) { fontPlus2.title = t.larger; fontPlus2.setAttribute('aria-label', t.larger); }
  applyBookStrings();
  updateNav();
  document.documentElement.lang = currentLang;
  document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
  if (bookData) renderChapterList();
}

async function switchLanguage(lang) {
  if (!i18n[lang]) return;
  currentLang = lang;
  localStorage.setItem('izhar_lang', currentLang);
  await ensureContent(lang);
  applyUiStrings();
  buildResults();               // flat results must match the (possibly new) corpus
  displayChapter(currentChapterIndex);
  updateResultCounter();
}

function cycleTheme() {
  const cur = document.body.getAttribute('data-theme') || 'light';
  const next = themeOrder[(themeOrder.indexOf(cur) + 1) % themeOrder.length];
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('izhar_theme', next);
  updateThemeBtn();
}

function updateThemeBtn() {
  const cur = document.body.getAttribute('data-theme') || 'light';
  themeToggle.textContent = themeIcons[cur] || '🌓';
}

function loadSavedTheme() {
  const saved = localStorage.getItem('izhar_theme');
  if (saved && themeOrder.includes(saved)) document.body.setAttribute('data-theme', saved);
}

function toggleFavorite() {
  const chap = chapters()[currentChapterIndex];
  if (!chap) return;
  if (favorites.has(chap.id)) favorites.delete(chap.id);
  else favorites.add(chap.id);
  localStorage.setItem('izhar_favs', JSON.stringify([...favorites]));
  updateFavBtn();
  renderChapterList();
}

function setFilter(mode) {
  listFilter = mode;
  localStorage.setItem('izhar_filter', mode);
  chipAll.classList.toggle('active', mode === 'all');
  chipFav.classList.toggle('active', mode === 'fav');
  renderChapterList();
}

/* ---------------- events ---------------- */

function setupEventListeners() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });

  themeToggle.addEventListener('click', cycleTheme);

  fontPlus.addEventListener('click', () => stepFont(2));
  fontMinus.addEventListener('click', () => stepFont(-2));
  if (fontPlus2) fontPlus2.addEventListener('click', () => stepFont(2));
  if (fontMinus2) fontMinus2.addEventListener('click', () => stepFont(-2));

  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      buildResults();
      renderChapterList();
      displayChapter(currentChapterIndex);
      updateResultCounter();
    }, 120);
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
    saveTimer = setTimeout(savePosition, 300);
  });

  window.addEventListener('hashchange', () => { if (bookData) maybeLoadFromHash(false); });

  document.addEventListener('keydown', (e) => {
    if (e.target === searchInput) return;
    if (e.key === 'ArrowLeft' && !e.shiftKey && document.body.dir !== 'rtl') { /* ltr next */ }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

initApp();
