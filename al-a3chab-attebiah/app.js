'use strict';

const app = document.getElementById('app');
const BOOK = window.BOOK_DATA || [];
const chapters = Array.isArray(BOOK) ? BOOK : (BOOK.entries || []);

let flat = null;
let currentQuery = '';
let occMarks = [];
let occCur = -1;

/* ---------- Arabic text helpers ---------- */
const DIAC = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;

function normChar(c) {
  if (c === 'إ' || c === 'أ' || c === 'آ' || c === 'ٱ') return 'ا';
  if (c === 'ى') return 'ي';
  if (c === 'ؤ') return 'و';
  if (c === 'ئ') return 'ي';
  if (c === 'ة') return 'ه';
  return c.toLowerCase();
}

function normalize(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (DIAC.test(c)) continue;
    out += normChar(c);
  }
  return out;
}

function buildNormMap(text) {
  const out = [];
  const map = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (DIAC.test(c)) continue;
    out.push(normChar(c));
    map.push(i);
  }
  return { out: out.join(''), map };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlight(text, nq) {
  if (!nq) return { html: esc(text), count: 0 };
  const { out, map } = buildNormMap(text);
  let idx = out.indexOf(nq);
  if (idx === -1) return { html: esc(text), count: 0 };
  const segs = [];
  let last = 0, count = 0;
  while (idx !== -1) {
    const s = map[idx];
    const e = map[idx + nq.length - 1] + 1;
    if (s > last) segs.push({ t: text.slice(last, s), m: false });
    segs.push({ t: text.slice(s, e), m: true });
    last = e; count++;
    idx = out.indexOf(nq, idx + nq.length);
  }
  if (last < text.length) segs.push({ t: text.slice(last), m: false });
  return { html: segs.map(x => (x.m ? '<mark class="hl">' + esc(x.t) + '</mark>' : esc(x.t))).join(''), count };
}

function snippet(text, nq) {
  const { out, map } = buildNormMap(text);
  const idx = out.indexOf(nq);
  if (idx === -1) return esc(text.slice(0, 150));
  const start = map[idx];
  const a = Math.max(0, start - 70);
  const b = Math.min(text.length, start + nq.length + 120);
  const { html } = highlight(text.slice(a, b), nq);
  return (a > 0 ? '… ' : '') + html + (b < text.length ? ' …' : '');
}

/* ---------- theme + font ---------- */
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
    try { localStorage.setItem('a3chab_theme', next); } catch (e) {}
  });
}

let fontSize = 1;
try { fontSize = parseFloat(localStorage.getItem('a3chab_font')) || 1; } catch (e) {}
function applyFontSize() {
  document.documentElement.style.setProperty('--content-font-size', fontSize + 'rem');
  try { localStorage.setItem('a3chab_font', String(fontSize)); } catch (e) {}
}
function fontControlsHTML() {
  return '<span class="font-row">' +
    '<button type="button" id="fontDec" title="تصغير الخط">A−</button>' +
    '<button type="button" id="fontReset" title="الخط الافتراضي">A</button>' +
    '<button type="button" id="fontInc" title="تكبير الخط">A+</button>' +
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

/* ---------- network indicator ---------- */
function setupNetwork() {
  const el = document.getElementById('netStatus');
  if (!el) return;
  const label = el.querySelector('.net-label');
  const update = () => {
    const on = navigator.onLine;
    el.classList.toggle('offline', !on);
    if (label) label.textContent = on ? 'متصل' : 'دون اتصال';
    el.title = on ? 'متصل بالإنترنت' : 'تعمل النسخة المحفوظة دون اتصال';
  };
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

/* ---------- data ---------- */
function metaOf(ch) {
  const parts = [];
  if (ch.darja) parts.push(['الدارجة', ch.darja]);
  if (ch.tamazight) parts.push(['الأمازيغية', ch.tamazight]);
  if (ch.latin) parts.push(['اللاتينية', ch.latin]);
  if (ch.french) parts.push(['الفرنسية', ch.french]);
  return parts;
}

function buildFlat() {
  if (flat) return flat;
  flat = [];
  chapters.forEach((ch, ci) => {
    flat.push({ ci, text: ch.title, norm: normalize(ch.title) });
    const m = metaOf(ch).map(p => p[0] + ': ' + p[1]).join(' · ');
    if (m) flat.push({ ci, text: m, norm: normalize(m) });
    String(ch.content || '').split('\n').forEach(p => {
      flat.push({ ci, text: p, norm: normalize(p) });
    });
  });
  return flat;
}

/* ---------- reader ---------- */
function renderReader(id) {
  const idx = chapters.findIndex(c => c.id === id);
  if (idx === -1) return renderHome();
  const ch = chapters[idx];
  try { localStorage.setItem('a3chab_last', String(id)); } catch (e) {}

  const nq = normalize(currentQuery);
  const title = highlight(ch.title, nq).html;
  const parts = metaOf(ch);
  const meta = ch.isHeader || !parts.length ? '' :
    '<div class="plant-meta">' + parts.map(p =>
      '<div><strong>' + esc(p[0]) + ':</strong> ' + highlight(p[1], nq).html + '</div>').join('') + '</div>';
  const isRef = /تُراجع البطاقة رقم/.test(ch.content || '');
  const note = isRef ? '<div class="ref-note">📌 بطاقة تعريف بالاسم المحلي — يُرجى مراجعة البطاقة الأصلية للاستعمالات الكاملة.</div>' : '';
  const body = String(ch.content || '').split('\n').map(p => '<p>' + highlight(p, nq).html + '</p>').join('');

  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
  const kicker = ch.isHeader
    ? 'الموسوعة · مقدمة'
    : 'الموسوعة · المدخل ' + toArabicDigits(idx) + ' من ' + toArabicDigits(chapters.length - 1);

  app.innerHTML =
    '<div class="topnav">' + fontControlsHTML() +
      '<button id="copyBtn" type="button">📋 نسخ المدخل</button>' +
      '<button id="homeBtn" type="button">🏠 الفهرس</button>' +
    '</div>' +
    '<div class="searchbar">' +
      '<input id="chapSearch" type="search" placeholder="ابحث في هذا المدخل…" value="' + esc(currentQuery) + '" autocomplete="off">' +
      '<span class="counter" id="occCount"></span>' +
      '<button type="button" class="navbtn" id="occNext" title="النتيجة التالية">▼</button>' +
      '<button type="button" class="navbtn" id="occPrev" title="النتيجة السابقة">▲</button>' +
      '<button type="button" class="clearbtn" id="clearSearch" title="مسح البحث">✕</button>' +
    '</div>' +
    '<div class="card" id="chapterCard">' +
      '<div class="kicker">' + esc(kicker) + '</div>' +
      '<h2>' + title + '</h2>' +
      note + meta + body +
    '</div>' +
    '<div class="pager">' +
      '<button id="prevBtn"' + (prev ? '' : ' disabled') + '>→ السابق</button>' +
      '<span>' + esc(kicker) + '</span>' +
      '<button id="nextBtn"' + (next ? '' : ' disabled') + '>التالي ←</button>' +
    '</div>';

  if (prev) document.getElementById('prevBtn').onclick = () => go('#/read/' + encodeURIComponent(prev.id));
  if (next) document.getElementById('nextBtn').onclick = () => go('#/read/' + encodeURIComponent(next.id));
  document.getElementById('homeBtn').onclick = () => go('#/');
  document.getElementById('copyBtn').onclick = (e) => {
    const metaLines = parts.map(p => p[0] + ': ' + p[1]).join('\n');
    copyText(ch.title + '\n' + metaLines + (metaLines ? '\n\n' : '') + ch.content, e.currentTarget);
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
  };
  document.getElementById('clearSearch').onclick = () => {
    currentQuery = '';
    renderReader(id);
    const box = document.getElementById('chapSearch');
    if (box) box.focus();
  };
  document.getElementById('occNext').onclick = () => goOcc(1);
  document.getElementById('occPrev').onclick = () => goOcc(-1);

  collectMarks();
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
    if (cEl) cEl.textContent = toArabicDigits(occCur + 1) + ' / ' + toArabicDigits(occMarks.length);
  } else if (cEl) {
    cEl.textContent = normalize(currentQuery) ? '0 / 0' : '';
  }
}
function goOcc(delta) {
  if (!occMarks.length) return;
  occCur = (occCur + delta + occMarks.length) % occMarks.length;
  paintMarks(true);
}

/* ---------- home / TOC / global search ---------- */
function renderHome() {
  let resume = null;
  try { resume = localStorage.getItem('a3chab_last'); } catch (e) {}
  const resumeCh = resume ? chapters.find(c => c.id === resume) : null;
  const resumeBtn = resumeCh
    ? '<button id="resumeBtn" type="button">↩️ متابعة القراءة — ' + esc(resumeCh.title) + '</button>' : '';

  const plants = chapters.filter(c => !c.isHeader).length;

  app.innerHTML =
    '<div class="topnav">' + fontControlsHTML() + resumeBtn + '</div>' +
    '<div class="home">' +
      '<h1>🌿 المعشبة المغربية</h1>' +
      '<p class="desc">دليل تفاعلي للأنواع الطبية المغربية المتداولة في الأسواق التقليدية: ' +
        toArabicDigits(plants) + ' مدخلاً موسوعياً بمسمياتها الدارجة والأمازيغية والعربية والفرنسية واللاتينية، ' +
        'مع استعمالاتها وطرق تحضيرها وتنبيهات السلامة. ابحث في الموسوعة كلها في الوقت نفسه، ' +
        'وستُلوَّن النتائج بالأخضر مع عدّاد وتنقّل بين المواضع.</p>' +
      '<p class="stats">' + toArabicDigits(plants) + ' مدخلاً · ' + toArabicDigits(chapters.length - 1) + ' بطاقة نباتية</p>' +
      '<div class="searchbar">' +
        '<input id="globalSearch" type="search" placeholder="ابحث في الموسوعة كلها…" autocomplete="off">' +
        '<button type="button" class="clearbtn" id="clearGlobal" title="مسح">✕</button>' +
      '</div>' +
      '<div class="results" id="searchResults" hidden></div>' +
      '<div id="tocWrap">' +
        '<h2>المداخل</h2>' +
        '<div class="toc">' +
          chapters.map((ch, i) =>
            '<button type="button" class="toc-item" data-id="' + esc(ch.id) + '">' +
              '<span class="num">' + (ch.isHeader ? 'مقدمة' : toArabicDigits(i)) + '</span>' +
              '<span>' + esc(ch.title.replace(/^\d+\.\s*/, '')) + '</span>' +
            '</button>').join('') +
        '</div>' +
      '</div>' +
    '</div>';

  setupFontControls();
  if (resumeCh) {
    const rb = document.getElementById('resumeBtn');
    if (rb) rb.onclick = () => go('#/read/' + encodeURIComponent(resumeCh.id));
  }
  app.querySelectorAll('.toc-item').forEach(b => {
    b.onclick = () => { currentQuery = ''; go('#/read/' + encodeURIComponent(b.dataset.id)); };
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
      resultsEl.innerHTML = '<p class="empty">لا نتائج عن «' + esc(q) + '».</p>';
      return;
    }
    const shown = hits.slice(0, 150);
    resultsEl.hidden = false;
    resultsEl.innerHTML =
      '<p class="empty">' + toArabicDigits(hits.length) + ' موضعاً في ' +
        toArabicDigits(new Set(hits.map(h => h.e.ci)).size) + ' مدخلاً' +
        (hits.length > shown.length ? ' (تُعرض أول ' + toArabicDigits(shown.length) + ')' : '') + ':</p>' +
      shown.map((h, i) => {
        const ch = chapters[h.e.ci];
        return '<div class="result" data-i="' + i + '">' +
          '<div class="rtitle">' + esc(ch.title) + '</div>' +
          '<div class="rsnip">' + snippet(h.e.text, nq) + '</div>' +
        '</div>';
      }).join('');
    resultsEl.querySelectorAll('.result').forEach((el) => {
      el.onclick = () => {
        const h = shown[Number(el.dataset.i)];
        currentQuery = q;
        go('#/read/' + encodeURIComponent(chapters[h.e.ci].id));
      };
    });
  }, 200);
  document.getElementById('clearGlobal').onclick = () => {
    gi.value = ''; gi.dispatchEvent(new Event('input')); gi.focus();
  };
}

function globalSearch(nq) {
  const idx = buildFlat();
  const hits = [];
  for (let i = 0; i < idx.length; i++) {
    const e = idx[i];
    if (e.norm.indexOf(nq) !== -1) {
      hits.push({ e });
      if (hits.length >= 400) break;
    }
  }
  return hits;
}

/* ---------- misc ---------- */
function toArabicDigits(n) {
  return String(n);
}
function debounce(fn, ms) {
  let t;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
}
function copyText(text, btn) {
  const done = () => {
    if (!btn) return;
    const old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = '✓ تم النسخ'; btn.classList.add('copied');
    setTimeout(() => { if (btn.isConnected) { btn.textContent = old; btn.classList.remove('copied'); } }, 1600);
  };
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { if (btn) btn.textContent = '⚠️ تعذّر النسخ'; }
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

/* ---------- routing ---------- */
function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const m = /^read\/(.+)$/.exec(h);
  if (m) return { view: 'read', id: decodeURIComponent(m[1]) };
  return { view: 'home' };
}
function route() {
  const r = parseHash();
  if (r.view === 'read' && chapters.some(c => c.id === r.id)) renderReader(r.id);
  else renderHome();
  window.scrollTo(0, 0);
}

function renderError() {
  app.innerHTML =
    '<div class="home">' +
      '<p class="empty">⚠️ تعذّر تحميل بيانات الموسوعة. أعد تحميل الصفحة.</p>' +
    '</div>';
}

function init() {
  setupTheme();
  setupNetwork();
  if (!chapters.length) { renderError(); return; }
  window.addEventListener('hashchange', route);
  route();
}
init();
