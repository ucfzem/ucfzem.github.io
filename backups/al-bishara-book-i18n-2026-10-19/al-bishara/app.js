'use strict';

const DATA_URL = './data/chapters.json';
const LANG_DATA_URL = {
  en: './data/chapters.en.json',
  fr: './data/chapters.fr.json',
  es: './data/chapters.es.json'
};
let BOOK = null;
const bookCache = {};
let appliedLang = 'ar';
let meta = {};
let parts = [];
let chapters = [];
let flat = null;

let occMarks = [];
let occCur = -1;
let currentQuery = '';

let fontSize = 1;
try { fontSize = parseFloat(localStorage.getItem('bishara_font')) || 1; } catch (e) {}

const ALLOWED = { b: 1, i: 1, em: 1, strong: 1, ul: 1, ol: 1, li: 1, blockquote: 1, br: 1 };

const LANGS = ['ar', 'en', 'fr', 'es'];
let lang = 'ar';
try {
  const stored = localStorage.getItem('bishara_lang');
  if (stored && LANGS.indexOf(stored) !== -1) lang = stored;
} catch (e) {}

function lookup(dict, keyPath) {
  const parts = keyPath.split('.');
  let v = dict;
  for (let i = 0; i < parts.length; i++) {
    if (v && typeof v === 'object' && parts[i] in v) v = v[parts[i]];
    else return undefined;
  }
  return v;
}
function t(keyPath) {
  const L = window.LOCALES || {};
  const v = lookup(L[lang], keyPath);
  if (typeof v === 'string') return v;
  const d = lookup(L.ar, keyPath);
  return typeof d === 'string' ? d : keyPath;
}
function tsub(keyPath, vars) {
  let s = t(keyPath);
  Object.keys(vars || {}).forEach(k => { s = s.split('{' + k + '}').join(String(vars[k])); });
  return s;
}
function fmtNum(n) {
  return lang === 'ar' ? toArabicDigits(n) : String(n);
}
function applyDocumentLang() {
  const m = ((window.LOCALES || {})[lang] || {}).meta || {};
  document.documentElement.setAttribute('lang', m.lang || lang);
  document.documentElement.setAttribute('dir', m.dir || (lang === 'ar' ? 'rtl' : 'ltr'));
  const h = ((window.LOCALES || {})[lang] || {}).html || {};
  if (h.title) document.title = h.title;
  const md = document.querySelector('meta[name="description"]');
  if (md && h.description) md.setAttribute('content', h.description);
}
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const v = t(el.getAttribute('data-i18n-title'));
    el.title = v;
    el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  applyDocumentLang();
}
function setupLangSwitch() {
  const toggle = document.getElementById('langToggle');
  const menu = document.getElementById('langMenu');
  if (!toggle || !menu) return;
  const sync = () => {
    const m = ((window.LOCALES || {})[lang] || {}).meta || {};
    toggle.textContent = m.flag || '🌐';
    toggle.title = t('ui.langLabel');
    toggle.setAttribute('aria-label', t('ui.langLabel'));
    menu.querySelectorAll('button[data-lang]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  };
  window._syncLangUI = sync;
  sync();
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  menu.querySelectorAll('button[data-lang]').forEach(b => {
    b.addEventListener('click', () => {
      menu.hidden = true;
      setLanguage(b.getAttribute('data-lang'));
    });
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle) menu.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; toggle.focus(); }
  });
}
function setLanguage(next) {
  if (!next || LANGS.indexOf(next) === -1 || next === lang) return;
  lang = next;
  try { localStorage.setItem('bishara_lang', lang); } catch (e) {}
  applyStaticI18n();
  if (window._syncLangUI) window._syncLangUI();
  const d = document.getElementById('drawer');
  if (d && !d.hidden) {
    const f = document.getElementById('drawerFilter');
    renderDrawerList(f ? f.value : '');
  }
  if (!BOOK) return;
  const show = () => { applyBook(bookCache[lang] || bookCache.ar, lang); route(); };
  if (bookCache[lang]) { show(); return; }
  const app = document.getElementById('app');
  if (app) app.innerHTML = '<div class="home"><p class="empty">' + t('ui.loading') + '</p></div>';
  ensureLang(lang).then(show);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function sanitize(html) {
  let s = String(html);
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag) => {
    const t = tag.toLowerCase();
    if (!ALLOWED[t]) return '';
    return (m.charAt(1) === '/' ? '</' : '<') + t + '>';
  });
  if (s.replace(/<\/?[a-z]+>/g, '').indexOf('<') !== -1) s = s.replace(/</g, '&lt;');
  if ((s.match(/<b>/g) || []).length > (s.match(/<\/b>/g) || []).length) s += '</b>';
  return s;
}
function stripTags(html) {
  return String(html).replace(/<br\s*\/?>/gi, ' ').replace(/<\/(p|li|blockquote|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
}
function normalize(s) {
  if (!s) return '';
  return String(s)
    .replace(/\u0640+/g, '')
    .replace(/\u064B|\u064C|\u064D|\u064E|\u064F|\u0650|\u0651|\u0652|\u0670/g, '')
    .replace(/[^\u0621-\u064A\u0660-\u0669\u06F0-\u06F9\u0041-\u005A\u0061-\u007A\u00C0-\u024F\u0080-\u00FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
function toArabicDigits(n) {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}
function debounce(fn, ms) {
  let t;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
}

function blockHtml(block, nq) {
  const s = sanitize(block);
  const trimmed = s.trim();
  const sub = /^<b>([\s\S]*?)<\/b>$/.exec(trimmed);
  if (sub && stripTags(trimmed).length < 140) return '<h3>' + esc(sub[1]) + '</h3>';
  if (/^<(ul|ol)>/.test(trimmed)) return trimmed;
  if (/^<blockquote>/.test(trimmed)) return trimmed;
  return '<p>' + s + '</p>';
}
function highlightRange(root, nq) {
  if (!nq) return 0;
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue;
    const norm = normalize(text);
    if (!norm) return;
    let i = 0;
    const parts = [];
    let changed = false;
    while (i <= norm.length - nq.length) {
      const j = norm.indexOf(nq, i);
      if (j === -1) break;
      const pre = text.slice(i, j);
      const m = text.slice(j, j + nq.length);
      if (m) {
        parts.push(document.createTextNode(pre));
        const mk = document.createElement('mark');
        mk.className = 'hl';
        mk.textContent = m;
        parts.push(mk);
        count++;
        changed = true;
      }
      i = j + nq.length;
    }
    if (!changed) return;
    parts.push(document.createTextNode(text.slice(i)));
    const frag = document.createDocumentFragment();
    parts.forEach(p => frag.appendChild(p));
    node.parentNode.replaceChild(frag, node);
  });
  return count;
}
function snippet(text, nq) {
  if (!nq) return esc(text).slice(0, 180) + (text.length > 180 ? '…' : '');
  const norm = normalize(text);
  const idx = norm.indexOf(nq);
  if (idx === -1) return esc(text).slice(0, 180) + (text.length > 180 ? '…' : '');
  const start = Math.max(0, idx - 50);
  const b = Math.min(text.length, start + nq.length + 110);
  const sub = text.slice(start, b);
  const sn = normalize(sub);
  const k = sn.indexOf(nq);
  if (k === -1) return esc(sub);
  return esc(sub.slice(0, k)) + '<mark class="hl">' + esc(sub.slice(k, k + nq.length)) + '</mark>' + esc(sub.slice(k + nq.length));
}

function setupTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const cur = () => document.documentElement.getAttribute('data-theme') || 'light';
  const update = () => { btn.textContent = cur() === 'dark' ? '☀️' : '🌙'; };
  update();
  btn.addEventListener('click', () => {
    const next = cur() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    update();
    try { localStorage.setItem('bishara_theme', next); } catch (e) {}
  });
}
function applyFontSize() {
  document.documentElement.style.setProperty('--content-font-size', fontSize + 'rem');
  try { localStorage.setItem('bishara_font', String(fontSize)); } catch (e) {}
}
function fontControlsHTML() {
  return '<span class="font-row">' +
    '<button type="button" id="fontDec" title="' + t('ui.fontDec') + '">A−</button>' +
    '<button type="button" id="fontReset" title="' + t('ui.fontReset') + '">A</button>' +
    '<button type="button" id="fontInc" title="' + t('ui.fontInc') + '">A+</button>' +
    '</span>';
}
function setupFontControls() {
  const d = document.getElementById('fontDec');
  const r = document.getElementById('fontReset');
  const i = document.getElementById('fontInc');
  if (d) d.onclick = () => { if (fontSize > 0.8) { fontSize = Math.round((fontSize - 0.1) * 10) / 10; applyFontSize(); } };
  if (r) r.onclick = () => { fontSize = 1; applyFontSize(); };
  if (i) i.onclick = () => { if (fontSize < 1.8) { fontSize = Math.round((fontSize + 0.1) * 10) / 10; applyFontSize(); } };
}
applyFontSize();

function applyBook(data, l) {
  meta = (data && data.meta) || meta || {};
  parts = (data && data.parts) || [];
  chapters = (data && data.chapters) || [];
  chapters.forEach(ch => { ch._text = (ch.blocks || []).map(stripTags).join('\n'); });
  appliedLang = l || 'ar';
  flat = null;
  occMarks = []; occCur = -1;
}
async function fetchBook(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    if (!j || !j.chapters || !j.chapters.length) throw new Error('empty');
    return j;
  } finally { clearTimeout(timer); }
}
async function ensureLang(l) {
  if (bookCache[l]) return bookCache[l];
  if (l === 'ar' || !LANG_DATA_URL[l]) return bookCache.ar || BOOK;
  try {
    const j = await fetchBook(LANG_DATA_URL[l]);
    j._translated = true;
    bookCache[l] = j;
    return j;
  } catch (e) {
    return bookCache.ar || BOOK;
  }
}
async function loadData() {
  BOOK = await fetchBook(DATA_URL);
  bookCache.ar = BOOK;
  applyBook(await ensureLang(lang), lang);
}
function buildFlat() {
  if (flat) return flat;
  flat = [];
  chapters.forEach((ch, ci) => {
    (ch.blocks || []).forEach((b, bi) => {
      flat.push({ ci, bi, text: stripTags(b), norm: normalize(stripTags(b)) });
    });
  });
  return flat;
}
function globalSearch(nq) {
  const idx = buildFlat();
  const hits = [];
  for (let i = 0; i < idx.length; i++) {
    if (idx[i].norm.indexOf(nq) !== -1) {
      hits.push(idx[i]);
      if (hits.length >= 400) break;
    }
  }
  return hits;
}

function openDrawer() {
  const d = document.getElementById('drawer');
  if (!d) return;
  d.hidden = false;
  setTimeout(() => {
    const f = document.getElementById('drawerFilter');
    if (f) { f.value = ''; f.focus(); }
    renderDrawerList('');
  }, 20);
}
function closeDrawer() {
  const d = document.getElementById('drawer');
  if (d) d.hidden = true;
}
function renderDrawerList(q) {
  const list = document.getElementById('drawerList');
  if (!list) return;
  const nq = normalize(q);
  let items = chapters;
  if (nq) items = chapters.filter(ch => normalize(ch.title || '').indexOf(nq) !== -1);
  list.innerHTML = items.map(ch =>
    '<button type="button" data-id="' + ch.id + '">' +
      '<span>' + fmtNum(ch.id) + '. ' + esc(ch.title || (t('ui.chapter') + ' ' + ch.id)) + '</span>' +
    '</button>').join('');
  list.querySelectorAll('button').forEach(b => {
    b.onclick = () => { currentQuery = ''; closeDrawer(); go('#chapter-' + b.dataset.id); };
  });
}

function updateProgress() {
  const bar = document.getElementById('progressBar');
  const btn = document.getElementById('toTop');
  if (!bar || !btn) return;
  const doc = document.documentElement;
  const st = doc.scrollTop || document.body.scrollTop;
  const sh = doc.scrollHeight - doc.clientHeight;
  const pct = sh > 0 ? Math.min(100, (st / sh) * 100) : 0;
  bar.style.width = pct + '%';
  btn.hidden = st < 300;
}
function setupProgress() {
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
}

function copyText(text, btn) {
  const done = () => {
    if (!btn) return;
    const old = btn.textContent;
    btn.textContent = t('ui.copied');
    btn.classList.add('copied');
    setTimeout(() => {
      if (btn.isConnected) { btn.textContent = old; btn.classList.remove('copied'); }
    }, 1600);
  };
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { if (btn) { const old = btn.textContent; btn.textContent = t('ui.copyFail'); setTimeout(() => { if (btn.isConnected) btn.textContent = old; }, 1600); } }
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

function collectMarks() {
  occMarks = Array.from(document.querySelectorAll('#chapterCard mark.hl'));
  occCur = occMarks.length ? 0 : -1;
  paintMarks(false);
}
function paintMarks(scroll) {
  occMarks.forEach(m => m.classList.remove('hl-cur'));
  const cEl = document.getElementById('occCount');
  const prevB = document.getElementById('occPrev');
  const nextB = document.getElementById('occNext');
  const has = occMarks.length > 0;
  if (prevB) prevB.disabled = !has;
  if (nextB) nextB.disabled = !has;
  if (has && occCur >= 0) {
    const m = occMarks[occCur];
    m.classList.add('hl-cur');
    if (scroll) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (cEl) cEl.textContent = fmtNum(occCur + 1) + ' / ' + fmtNum(occMarks.length);
  } else if (cEl) {
    cEl.textContent = normalize(currentQuery) ? fmtNum(0) + ' / ' + fmtNum(0) : '';
  }
}
function goOcc(delta) {
  if (!occMarks.length) return;
  occCur = (occCur + delta + occMarks.length) % occMarks.length;
  paintMarks(true);
}

function partOf(ch) {
  return parts.find(p => p.id === ch.part);
}
function translationNoteHTML() {
  if (lang === 'ar') return '';
  if (appliedLang === 'ar') return '<p class="mt-note warn">🌐 ' + esc(t('ui.mtUnavailable')) + '</p>';
  return '<p class="mt-note">🌐 ' + esc(t('ui.mtNote')) + '</p>';
}
function renderReader(id) {
  const idx = chapters.findIndex(c => c.id === id);
  const ch = chapters[idx];
  if (idx === -1) return renderHome();
  try { localStorage.setItem('bishara_last', String(id)); } catch (e) {}

  const nq = normalize(currentQuery);
  const body = (ch.blocks || []).map(b => blockHtml(b, nq)).join('');

  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
  const app = document.getElementById('app');
  app.innerHTML =
    '<div class="topnav">' + fontControlsHTML() +
      '<button id="copyBtn" type="button">' + t('ui.copyChapter') + '</button>' +
      '<button id="homeBtn" type="button">' + t('ui.home') + '</button>' +
      '<button id="tocOpenBtn" type="button">' + t('ui.tocBtn') + '</button>' +
    '</div>' +
    translationNoteHTML() +
    '<div class="searchbar">' +
      '<input id="chapSearch" type="search" placeholder="' + esc(t('ui.searchChap')) + '" value="' + esc(currentQuery) + '" autocomplete="off">' +
      '<span class="counter" id="occCount">' + (nq ? fmtNum(0) + ' / ' + fmtNum(0) : '') + '</span>' +
      '<button type="button" class="navbtn" id="occPrev" title="' + esc(t('ui.prevOcc')) + '">▲</button>' +
      '<button type="button" class="navbtn" id="occNext" title="' + esc(t('ui.nextOcc')) + '">▼</button>' +
      '<button type="button" class="clearbtn" id="clearSearch" title="' + esc(t('ui.clearSearch')) + '">✕</button>' +
    '</div>' +
    '<div class="card" id="chapterCard">' +
      '<p class="kicker">' + esc((partOf(ch) || {}).title || '') + '</p>' +
      '<h2>' + fmtNum(id) + '. ' + esc(ch.title || (t('ui.chapter') + ' ' + id)) + '</h2>' +
      '<div class="chbody">' + body + '</div>' +
    '</div>' +
    '<div class="pager">' +
      '<button id="prevBtn"' + (prev ? '' : ' disabled') + '>' + t('ui.prev') + '</button>' +
      '<span>' + fmtNum(idx + 1) + ' / ' + fmtNum(chapters.length) + '</span>' +
      '<button id="nextBtn"' + (next ? '' : ' disabled') + '>' + t('ui.next') + '</button>' +
    '</div>';

  const card = document.getElementById('chapterCard');
  const hlCount = highlightRange(card, nq);

  if (prev) document.getElementById('prevBtn').onclick = () => go('#chapter-' + prev.id);
  if (next) document.getElementById('nextBtn').onclick = () => go('#chapter-' + next.id);
  document.getElementById('homeBtn').onclick = () => go('#/');
  document.getElementById('tocOpenBtn').onclick = openDrawer;
  document.getElementById('copyBtn').onclick = (e) => {
    const full = ch.title + '\n\n' + (ch.blocks || []).map(stripTags).join('\n\n');
    copyText(full, e.currentTarget);
  };
  setupFontControls();

  const input = document.getElementById('chapSearch');
  input.oninput = debounce(() => {
    currentQuery = input.value.trim();
    renderReader(id);
    const box = document.getElementById('chapSearch');
    if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
  }, 220);
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); goOcc(e.shiftKey ? -1 : 1); }
    if (e.key === 'Escape') { e.preventDefault(); currentQuery = ''; renderReader(id); }
  };
  document.getElementById('clearSearch').onclick = () => { currentQuery = ''; renderReader(id); const box = document.getElementById('chapSearch'); if (box) box.focus(); };
  document.getElementById('occPrev').onclick = () => goOcc(-1);
  document.getElementById('occNext').onclick = () => goOcc(1);

  collectMarks();
  window.scrollTo(0, 0);
  updateProgress();
}

function renderHome() {
  const app = document.getElementById('app');
  let resume = null;
  try { resume = localStorage.getItem('bishara_last'); } catch (e) {}
  const resumeCh = chapters.find(c => String(c.id) === resume);
  const resumeBtn = resumeCh
    ? '<button id="resumeBtn" type="button">' + t('ui.resume') + ' — ' + fmtNum(resumeCh.id) + '. ' + esc(resumeCh.title) + '</button>' : '';

  const total = chapters.length;
  const tocByPart = parts.map(p => {
    const items = chapters.filter(ch => ch.part === p.id);
    if (!items.length) return '';
    return '<div class="part-block">' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<div class="toc">' +
        items.map(ch =>
          '<button type="button" class="toc-item" data-id="' + ch.id + '">' +
            '<span class="num">' + fmtNum(ch.id) + '</span><span class="t">' + esc(ch.title || (t('ui.chapter') + ' ' + ch.id)) + '</span>' +
          '</button>').join('') +
      '</div></div>';
  }).join('');

  app.innerHTML =
    '<div class="topnav">' + fontControlsHTML() + resumeBtn + '<button id="tocOpenBtnHome" type="button">' + t('ui.tocBtn') + '</button></div>' +
    '<div class="home">' +
      '<h1>' + esc(t('ui.brand1')) + '</h1>' +
      '<p class="desc">' + esc(t('ui.byline')) +
        ' — ' + tsub('ui.desc', { n: fmtNum(total) }) + '</p>' +
      translationNoteHTML() +
      '<div class="searchbar">' +
        '<input id="globalSearch" type="search" placeholder="' + esc(t('ui.searchBook')) + '" autocomplete="off">' +
        '<button type="button" class="clearbtn" id="clearGlobal" title="' + esc(t('ui.clear')) + '">✕</button>' +
      '</div>' +
      '<div class="results" id="searchResults" hidden></div>' +
      '<div id="tocWrap">' + tocByPart + '</div>' +
    '</div>';

  setupFontControls();
  if (resumeCh) document.getElementById('resumeBtn').onclick = () => go('#chapter-' + resumeCh.id);
  document.getElementById('tocOpenBtnHome').onclick = openDrawer;
  app.querySelectorAll('.toc-item').forEach(b => {
    b.onclick = () => { currentQuery = ''; go('#chapter-' + b.dataset.id); };
  });

  const gi = document.getElementById('globalSearch');
  const resultsEl = document.getElementById('searchResults');
  const tocWrap = document.getElementById('tocWrap');
  gi.oninput = debounce(() => {
    const q = gi.value.trim();
    const nq = normalize(q);
    if (nq.length < 2) {
      resultsEl.hidden = true; resultsEl.innerHTML = '';
      tocWrap.hidden = false;
      return;
    }
    tocWrap.hidden = true;
    const hits = globalSearch(nq);
    if (!hits.length) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = '<p class="empty">' + tsub('ui.noResults', { q: esc(q) }) + '</p>';
      return;
    }
    const shown = hits.slice(0, 150);
    const chapterCount = new Set(hits.map(h => h.ci)).size;
    resultsEl.hidden = false;
    resultsEl.innerHTML =
      '<p class="empty">' + tsub('ui.found', { n: fmtNum(hits.length), c: fmtNum(chapterCount) }) +
        (hits.length > shown.length ? tsub('ui.foundShown', { s: fmtNum(shown.length) }) : '') + ':</p>' +
      shown.map((h, i) => {
        const ch = chapters[h.ci];
        return '<div class="result" tabindex="0" data-i="' + i + '">' +
          '<div class="rtitle">' + fmtNum(ch.id) + ' — ' + esc(ch.title || (t('ui.chapter') + ' ' + ch.id)) + '</div>' +
          '<div class="rsnip">' + snippet(h.text, nq) + '</div>' +
        '</div>';
      }).join('');
    resultsEl.querySelectorAll('.result').forEach((el) => {
      el.onclick = () => {
        const h = shown[Number(el.dataset.i)];
        currentQuery = q;
        go('#chapter-' + chapters[h.ci].id);
      };
    });
  }, 200);
  document.getElementById('clearGlobal').onclick = () => {
    gi.value = '';
    gi.dispatchEvent(new Event('input'));
    gi.focus();
  };
}

function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}
function parseHash() {
  const raw = location.hash || '';
  const h = raw.replace(/^#\/?/, '');
  const m1 = /^chapter[-\/]?(\d+)/i.exec(h);
  if (m1) return { view: 'read', id: parseInt(m1[1], 10) };
  const m2 = /^read\/(\d+)/i.exec(h);
  if (m2) return { view: 'read', id: parseInt(m2[1], 10) };
  return { view: 'home' };
}
function route() {
  const r = parseHash();
  if (r.view === 'read' && chapters.some(c => c.id === r.id)) renderReader(r.id);
  else renderHome();
  window.scrollTo(0, 0);
  updateProgress();
}
function renderError() {
  const app = document.getElementById('app');
  app.innerHTML =
    '<div class="home">' +
      '<p class="empty">' + t('ui.loadError') + '</p>' +
      '<p><button id="retryBtn" type="button" class="toc-item" style="display:inline-block">' + t('ui.retry') + '</button></p>' +
    '</div>';
  document.getElementById('retryBtn').onclick = () => init();
}
async function init() {
  applyStaticI18n();
  setupLangSwitch();
  setupTheme();
  setupProgress();
  const app = document.getElementById('app');
  app.innerHTML = '<div class="home"><p class="empty">' + t('ui.loading') + '</p></div>';

  const tocToggle = document.getElementById('tocToggle');
  if (tocToggle) tocToggle.onclick = openDrawer;
  const drawerClose = document.getElementById('drawerClose');
  if (drawerClose) drawerClose.onclick = closeDrawer;
  const drawer = document.getElementById('drawer');
  if (drawer) drawer.onclick = (e) => { if (e.target === drawer) closeDrawer(); };
  const drawerFilter = document.getElementById('drawerFilter');
  if (drawerFilter) drawerFilter.oninput = (e) => renderDrawerList(e.target.value);
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    await loadData();
  } catch (e) {
    renderError();
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}
window.addEventListener('DOMContentLoaded', init);
