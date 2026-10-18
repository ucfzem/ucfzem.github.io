// app.js — منطق التطبيق الرئيسي
import { parseBook } from './parser.js';
import { saveBook, loadBook, deleteBook, exportBook } from './db.js';
import { buildIndex, search, highlightParagraph, escapeHtml } from './search.js';

const LS = {
  theme: 'ajwiba_theme',
  font: 'ajwiba_font_size',
  marks: 'ajwiba_bookmarks',
  last: 'ajwiba_last_chapter',
  opts: 'ajwiba_search_opts',
};

const state = {
  book: null,
  index: null,
  view: 'home',
  chapterId: null,
  query: '',
  opts: { ignoreDiacritics: true, unifyTaMarbuta: false, wholeWord: false },
  occEls: [],
  occCursor: -1,
  bookmarks: new Set(),
  fontSize: 1,
};

const el = (id) => document.getElementById(id);
const contentEl = () => el('content');

/* ---------- عرض النص مع إبراز القرآن والحديث ---------- */
function decorate(html) {
  return html
    .replace(/﴿[^﴾]*﴾/g, (m) => `<span class="ayah">${m}</span>`)
    .replace(/«[^»]*»/g, (m) => `<span class="hadith">${m}</span>`);
}

/* ---------- إشعار ---------- */
let toastTimer = null;
function toast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- السمات والخط ---------- */
function applyFontSize() {
  document.documentElement.style.setProperty('--content-font-size', state.fontSize + 'rem');
  try { localStorage.setItem(LS.font, String(state.fontSize)); } catch (e) {}
}

/* ---------- التوجيه ---------- */
function go(hash, replace) {
  if (replace) history.replaceState(null, '', hash);
  else location.hash = hash;
}

function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/c\/(\d+)/);
  if (m) {
    renderChapter(parseInt(m[1], 10));
  } else {
    renderHome();
  }
}

/* ---------- الصفحة الرئيسية ---------- */
function renderHome() {
  state.view = 'home';
  const bk = state.book;
  if (!bk) return;
  const last = safeGet(LS.last);
  const resume = last ? `<button class="resume-btn" id="resumeBtn">↩︎ تابع القراءة — ${escapeHtml(chapterTitle(last))}</button>` : '';

  contentEl().innerHTML =
    topnavHTML() +
    `<div class="home">
      <h1>📜 ${escapeHtml(bk.title)}</h1>
      <p class="desc">${escapeHtml(bk.intro || '').replace(/\n+/g, '<br>')}</p>
      ${resume}
      <h2>اختر فصلاً للبدء</h2>
      <div class="chapters">
        ${bk.chapters.map((c) => {
          const marked = state.bookmarks.has(c.id);
          return `<button class="chapter-card" data-cid="${c.id}">
            <span class="num">الفصل ${toArabicDigits(c.id)}</span>
            <span class="ct">${escapeHtml(c.title.replace(/^الفصل[^:]*:\s*/, ''))}</span>
            <span class="meta">${toArabicDigits(c.wordCount)} كلمة${marked ? ' · <span class="bookmark-dot">🔖 محفوظ</span>' : ''}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;

  if (last) el('resumeBtn').onclick = () => go('#/c/' + last);
  contentEl().querySelectorAll('.chapter-card').forEach((b) => {
    b.onclick = () => go('#/c/' + b.dataset.cid);
  });
  setupFontControls();
}

function chapterTitle(id) {
  const c = state.book.chapters.find((x) => x.id == id);
  return c ? c.title.replace(/^الفصل[^:]*:\s*/, '') : '';
}

/* ---------- صفحة الفصل ---------- */
function renderChapter(id) {
  const bk = state.book;
  const chapter = bk.chapters.find((c) => c.id == id);
  if (!chapter) return renderHome();
  state.view = 'chapter';
  state.chapterId = id;
  safeSet(LS.last, String(id));

  let occ = 0;
  let bodyHtml = '';
  chapter.sections.forEach((sec, si) => {
    const isTakhrij = /التخريج/.test(sec.title || '');
    bodyHtml += `<div class="section${isTakhrij ? ' sec-takhrij' : ''}">`;
    if (sec.title) {
      bodyHtml += `<h3><span class="sect-ico">${isTakhrij ? '📚' : '◈'}</span> ${escapeHtml(sec.title)}`
        + `<button class="copy-sec" data-si="${si}" title="نسخ هذا القسم" aria-label="نسخ القسم">📋</button></h3>`;
    }
    sec.paragraphs.forEach((p, pi) => {
      const r = highlightParagraph(p, state.query, state.opts, occ);
      occ = r.next;
      bodyHtml += `<p>${decorate(r.html)}</p>`;
    });
    bodyHtml += '</div>';
  });

  const idx = bk.chapters.findIndex((c) => c.id == id);
  const prev = idx > 0 ? bk.chapters[idx - 1] : null;
  const next = idx < bk.chapters.length - 1 ? bk.chapters[idx + 1] : null;
  const isMarked = state.bookmarks.has(id);

  contentEl().innerHTML =
    topnavHTML() +
    `<div class="card chapter-body">
      <div class="kicker">${escapeHtml(bk.title)}</div>
      <h2>${escapeHtml(chapter.title)}</h2>
      ${bodyHtml}
    </div>
    <div class="pager">
      <button id="prevBtn"${prev ? '' : ' disabled'}>→ الفصل السابق</button>
      <span>الفصل ${toArabicDigits(chapter.id)} من ${toArabicDigits(bk.chapters.length)}</span>
      <button id="nextBtn"${next ? '' : ' disabled'}>الفصل التالي ←</button>
    </div>`;

  if (prev) el('prevBtn').onclick = () => go('#/c/' + prev.id);
  if (next) el('nextBtn').onclick = () => go('#/c/' + next.id);
  el('markBtn') && (el('markBtn').onclick = () => toggleBookmark(id));
  el('markBtn') && el('markBtn').classList.toggle('active', isMarked);
  setupFontControls();

  contentEl().querySelectorAll('.copy-sec').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const s = chapter.sections[+btn.dataset.si];
      if (!s) return;
      const txt = (s.title ? s.title + '\n\n' : '') + s.paragraphs.join('\n\n');
      const done = () => toast('نُسخ القسم 📋');
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('تعذّر النسخ'); }
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(fallback);
      } else fallback();
    });
  });

  state.occEls = Array.from(contentEl().querySelectorAll('mark[data-occ]'));
  state.occCursor = -1;
  updateProgress();
  window.scrollTo(0, 0);
}

/* ---------- أدوات شريط أعلى الصفحة ---------- */
function topnavHTML() {
  return `<div class="topnav">
    <span class="font-row">
      <button id="fontDecBtn" title="تصغير الخط">A−</button>
      <button id="fontResetBtn" title="الخط الافتراضي">A</button>
      <button id="fontIncBtn" title="تكبير الخط">A+</button>
    </span>
    <button id="markBtn" title="حفظ علامة في الفصل">🔖 علامة</button>
    <button id="homeBtn" title="القائمة الرئيسية">🏠 الرئيسية</button>
  </div>`;
}

function setupFontControls() {
  const dec = el('fontDecBtn'), res = el('fontResetBtn'), inc = el('fontIncBtn');
  if (dec) dec.onclick = () => { if (state.fontSize > 0.8) { state.fontSize = r1(state.fontSize - 0.1); applyFontSize(); } };
  if (res) res.onclick = () => { state.fontSize = 1; applyFontSize(); };
  if (inc) inc.onclick = () => { if (state.fontSize < 1.6) { state.fontSize = r1(state.fontSize + 0.1); applyFontSize(); } };
  const home = el('homeBtn');
  if (home) home.onclick = () => go('#/');
}
const r1 = (n) => Math.round(n * 10) / 10;

/* ---------- العلامات ---------- */
function loadBookmarks() {
  try { state.bookmarks = new Set(JSON.parse(localStorage.getItem(LS.marks) || '[]')); } catch (e) { state.bookmarks = new Set(); }
}
function persistBookmarks() {
  try { localStorage.setItem(LS.marks, JSON.stringify([...state.bookmarks])); } catch (e) {}
}
function toggleBookmark(id) {
  if (state.bookmarks.has(id)) { state.bookmarks.delete(id); toast('أُزيلت العلامة'); }
  else { state.bookmarks.add(id); toast('حُفظت علامة في هذا الفصل 🔖'); }
  persistBookmarks();
  el('markBtn') && el('markBtn').classList.toggle('active', state.bookmarks.has(id));
}

/* ---------- شريط التقدم ---------- */
function updateProgress() {
  const bar = el('progressBar');
  if (!bar) return;
  const doc = document.documentElement;
  const top = doc.scrollTop || document.body.scrollTop;
  const h = doc.scrollHeight - doc.clientHeight;
  bar.style.width = (h > 0 ? Math.min(100, (top / h) * 100) : 0) + '%';
}

/* ---------- البحث ---------- */
let searchTimer = null;
function bindSearch() {
  const input = el('searchInput');
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = input.value;
      if (state.query.trim().length >= 1) renderSearch();
      else route();
    }, 200);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; state.query = ''; route(); }
  });
  el('optWhole').addEventListener('change', (e) => { state.opts.wholeWord = e.target.checked; persistOpts(); rerunSearch(); });
  el('optDiacritics').addEventListener('change', (e) => { state.opts.ignoreDiacritics = !e.target.checked; persistOpts(); rerunSearch(); });
  el('clearSearch').addEventListener('click', () => { el('searchInput').value = ''; state.query = ''; route(); });
  el('prevOcc').addEventListener('click', () => moveOcc(-1));
  el('nextOcc').addEventListener('click', () => moveOcc(1));
}
function persistOpts() {
  try { localStorage.setItem(LS.opts, JSON.stringify(state.opts)); } catch (e) {}
}
function rerunSearch() {
  if (state.query.trim()) { renderSearch(); if (state.view === 'chapter') renderChapter(state.chapterId); }
}
function loadOpts() {
  try {
    const o = JSON.parse(localStorage.getItem(LS.opts) || 'null');
    if (o) state.opts = { ...state.opts, ...o };
  } catch (e) {}
  el('optWhole').checked = !!state.opts.wholeWord;
  el('optDiacritics').checked = !state.opts.ignoreDiacritics;
}

function renderSearch() {
  state.view = 'search';
  const res = search(state.index, state.query, state.opts);
  el('searchCount').textContent = res.normQuery
    ? (res.total ? `وُجدت ${toArabicDigits(res.total)} مرة في ${toArabicDigits(res.chapters.length)} فصلاً` : 'لا نتائج')
    : '';

  if (!res.chapters.length) {
    contentEl().innerHTML = topnavHTML() + `<div class="card"><h2>🔎 نتائج البحث</h2><div class="empty">لا توجد نتائج عن «${escapeHtml(state.query)}».</div></div>`;
    setupFontControls();
    return;
  }
  contentEl().innerHTML = topnavHTML() +
    `<div class="card"><h2>🔎 نتائج البحث — «${escapeHtml(state.query)}»</h2></div>` +
    `<div id="searchResults">${res.chapters.map((ch) => `
      <div class="result-chapter">
        <h4><span>${escapeHtml(ch.title)}</span><span class="cnt">${toArabicDigits(ch.count)}</span></h4>
        ${ch.hits.map((hit) => `<button class="result-hit" data-cid="${ch.id}" data-occ="${hit.occIndex}">${hit.snippetHtml}</button>`).join('')}
      </div>`).join('')}</div>`;
  setupFontControls();
  contentEl().querySelectorAll('.result-hit').forEach((b) => {
    b.onclick = () => {
      const cid = b.dataset.cid, occ = parseInt(b.dataset.occ, 10);
      go('#/c/' + cid);
      setTimeout(() => gotoOcc(occ), 60);
    };
  });
}

/* ---------- التنقل بين النتائج داخل الفصل ---------- */
function moveOcc(dir) {
  if (state.view !== 'chapter' || !state.occEls.length) return;
  state.occCursor += dir;
  if (state.occCursor < 0) state.occCursor = 0;
  if (state.occCursor >= state.occEls.length) state.occCursor = state.occEls.length - 1;
  gotoOcc(state.occCursor);
}
function gotoOcc(n) {
  if (!state.occEls.length) return;
  n = Math.max(0, Math.min(state.occEls.length - 1, n));
  state.occEls.forEach((m) => m.classList.remove('current'));
  state.occCursor = n;
  const m = state.occEls[n];
  m.classList.add('current');
  m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const cnt = el('navCounter');
  if (cnt) cnt.textContent = `${toArabicDigits(n + 1)} / ${toArabicDigits(state.occEls.length)}`;
}

/* ---------- أدوات ---------- */
function toArabicDigits(n) {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

/* ---------- تحميل الكتاب ---------- */
async function loadOrFetchBook() {
  // أحدث نسخة أولاً (شبكة أو كاش الـSW)، ثم الاحتياط من IndexedDB
  try {
    const res = await fetch('./data/book.md', { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      const book = parseBook(text);
      if (book && book.chapters.length) {
        await saveBook(book, text);
        return { book, raw: text };
      }
    }
  } catch (e) {}
  try { return await loadBook(); } catch (e) { return null; }
}

/* ---------- PWA ---------- */
function initPWA() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBar(reg);
          }
        });
      });
    } catch (e) {}
  });
}
function showUpdateBar(reg) {
  const bar = el('updateBar');
  bar.classList.add('show');
  el('updateReload').onclick = () => {
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}

/* ---------- التهيئة ---------- */
async function init() {
  try { state.fontSize = parseFloat(localStorage.getItem(LS.font)) || 1; } catch (e) {}
  applyFontSize();
  loadBookmarks();
  loadOpts();
  bindSearch();

  const rec = await loadOrFetchBook();
  if (!rec) {
    contentEl().innerHTML = `<div class="card"><h2>⚠️ لا يوجد كتاب</h2><p>لم يُعثر على الكتاب. افتح صفحة <a href="./import.html">/import</a> لإضافة النص.</p></div>`;
    return;
  }
  state.book = rec.book;
  state.index = buildIndex(state.book);
  route();

  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  window.addEventListener('beforeunload', () => {
    if (state.view === 'chapter') safeSet(LS.last, String(state.chapterId));
  });

  initPWA();

  document.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') moveOcc(-1);
    if (e.key === 'ArrowLeft') moveOcc(1);
  });

  toast('تم تجهيز التطبيق للعمل دون اتصال');
}

document.addEventListener('DOMContentLoaded', init);
