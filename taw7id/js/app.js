/* app.js - تطبيق كتاب توحيد الربوبية وتوحيد الألوهية */
(function () {
  'use strict';

  const FONT_KEY = 'tawhid.font';
  const THEME_KEY = 'tawhid.theme';
  const LAST_KEY = 'tawhid.lastSection';
  const STATS_KEY = 'tawhid.statsCollapsed';
  const DEFAULT_FONT = 19;
  const MIN_FONT = 15;
  const MAX_FONT = 30;

  const state = {
    fontSize: DEFAULT_FONT,
    theme: 'dark',
    statsCollapsed: false,
    searchMarks: [],
    searchIndex: -1,
    searchTimer: null,
    suppressScrollSpy: false,
    sections: []
  };

  const els = {};

  function q(id) { return document.getElementById(id); }

  function cacheEls() {
    els.btnMenu = q('btn-menu');
    els.btnTocClose = q('btn-toc-close');
    els.tocDrawer = q('toc-drawer');
    els.backdrop = q('backdrop');
    els.tocFilter = q('toc-filter');
    els.tocList = q('toc-list');
    els.content = q('content');
    els.searchBar = q('search-bar');
    els.btnSearchToggle = q('btn-search-toggle');
    els.searchInput = q('search-input');
    els.searchClear = q('btn-search-clear');
    els.searchCount = q('search-count');
    els.searchPrev = q('btn-match-prev');
    els.searchNext = q('btn-match-next');
    els.searchDropdown = q('search-dropdown');
    els.btnTop = q('btn-top');
    els.quickParts = q('quick-parts');
    els.readingProgressFill = q('reading-progress-fill');
    els.readingProgressBar = q('reading-progress-bar');
    els.readingProgressLabel = q('reading-progress-label');
    els.readingProgressPos = q('reading-progress-pos');
    els.bookStats = q('book-stats');
    els.btnFontUp = q('btn-font-up');
    els.btnFontDown = q('btn-font-down');
    els.btnFontReset = q('btn-font-reset');
    els.btnTheme = q('btn-theme');
  }

  function isDiacritic(ch) {
    const c = ch.charCodeAt(0);
    return (c >= 0x064B && c <= 0x065F) || c === 0x0670 || c === 0x0610 || c === 0x0611 || c === 0x0612 || c === 0x0613 || c === 0x0614 || c === 0x0615 || c === 0x0616 || c === 0x0617 || c === 0x0618 || c === 0x0619 || c === 0x061A || c === 0x06D6 || c === 0x06D7 || c === 0x06D8 || c === 0x06D9 || c === 0x06DA || c === 0x06DB || c === 0x06DC || c === 0x06DF || c === 0x06E0 || c === 0x06E1 || c === 0x06E2 || c === 0x06E3 || c === 0x06E4 || c === 0x06E7 || c === 0x06E8 || c === 0x06EA || c === 0x06EB || c === 0x06EC || c === 0x06ED;
  }

  function normalizeChar(ch) {
    if (ch === 'أ' || ch === 'إ' || ch === 'آ' || ch === 'ٱ') return 'ا';
    if (ch === 'ة') return 'ه';
    if (ch === 'ى') return 'ي';
    if (ch === 'ؤ') return 'و';
    if (ch === 'ئ') return 'ي';
    return ch;
  }

  function normalizeArabic(s) {
    return normalizeWithMap(s).norm;
  }

  function normalizeWithMap(s) {
    let norm = '';
    const map = [];
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (isDiacritic(ch)) continue;
      norm += normalizeChar(ch);
      map.push(i);
    }
    return { norm, map };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadState() {
    const font = parseInt(localStorage.getItem(FONT_KEY), 10);
    if (!Number.isNaN(font)) state.fontSize = Math.min(MAX_FONT, Math.max(MIN_FONT, font));
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') state.theme = theme;
    state.statsCollapsed = localStorage.getItem(STATS_KEY) === '1';
  }

  function applyFontSize() {
    document.documentElement.style.setProperty('--base-size', state.fontSize + 'px');
  }

  function saveFontSize() { localStorage.setItem(FONT_KEY, String(state.fontSize)); }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.theme === 'light' ? '#f4ead2' : '#1c140d');
    if (els.btnTheme) {
      els.btnTheme.textContent = state.theme === 'light' ? '☀️' : '🌙';
      els.btnTheme.setAttribute('aria-label', state.theme === 'light' ? 'تبديل إلى المظهر الداكن' : 'تبديل إلى المظهر الفاتح');
    }
  }

  function saveTheme() { localStorage.setItem(THEME_KEY, state.theme); }

  function renderBook() {
    state.sections = Array.isArray(BOOK_DATA.sections) ? BOOK_DATA.sections : [];
    els.content.innerHTML = '';
    state.sections.forEach((sec, idx) => {
      const article = document.createElement('article');
      article.className = 'section';
      article.id = sec.id;
      article.setAttribute('data-index', String(idx));

      const part = document.createElement('div');
      part.className = 'section-part';
      part.textContent = sec.part || '';

      const chapter = document.createElement('div');
      chapter.className = 'section-chapter';
      chapter.textContent = sec.chapter || '';

      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = sec.title || '';

      const summary = document.createElement('div');
      summary.className = 'section-summary';
      summary.textContent = sec.summary || '';

      const body = document.createElement('div');
      body.className = 'section-body';
      body.innerHTML = sec.contentHtml || '';

      const sources = document.createElement('section');
      sources.className = 'section-sources';
      const srcHead = document.createElement('div');
      srcHead.className = 'section-sources-head';
      const srcH3 = document.createElement('h3');
      srcH3.textContent = 'المصادر';
      srcHead.appendChild(srcH3);
      sources.appendChild(srcHead);
      const ol = document.createElement('ol');
      (sec.sources || []).forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      });
      sources.appendChild(ol);

      const nav = document.createElement('nav');
      nav.className = 'section-nav';
      const prev = state.sections[idx - 1];
      const next = state.sections[idx + 1];
      if (prev) {
        const a = document.createElement('a');
        a.href = '#' + prev.id;
        a.textContent = '→ ' + prev.title;
        a.addEventListener('click', (e) => { e.preventDefault(); jumpToSection(prev.id); });
        nav.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.className = 'nav-placeholder';
        span.textContent = '.';
        nav.appendChild(span);
      }
      if (next) {
        const a = document.createElement('a');
        a.href = '#' + next.id;
        a.textContent = next.title + ' ←';
        a.addEventListener('click', (e) => { e.preventDefault(); jumpToSection(next.id); });
        nav.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.className = 'nav-placeholder';
        span.textContent = '.';
        nav.appendChild(span);
      }

      article.append(part, chapter, title, summary, body, sources, nav);
      els.content.appendChild(article);
    });
    attachCopyButtons();
  }

  function buildTOC() {
    const groups = [];
    const byPart = new Map();
    state.sections.forEach((sec) => {
      const key = sec.part || 'أقسام';
      if (!byPart.has(key)) {
        const group = { part: key, items: [] };
        byPart.set(key, group);
        groups.push(group);
      }
      byPart.get(key).items.push(sec);
    });

    els.tocList.innerHTML = '';
    groups.forEach((g) => {
      const wrap = document.createElement('div');
      wrap.className = 'toc-part';
      const h = document.createElement('div');
      h.className = 'toc-part-title';
      h.textContent = g.part;
      wrap.appendChild(h);
      g.items.forEach((sec) => {
        const a = document.createElement('a');
        a.className = 'toc-link';
        a.href = '#' + sec.id;
        a.dataset.target = sec.id;
        a.textContent = sec.title;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          jumpToSection(sec.id);
          closeTOC();
        });
        wrap.appendChild(a);
      });
      els.tocList.appendChild(wrap);
    });
  }

  function openTOC() {
    els.tocDrawer.classList.add('open');
    els.tocDrawer.setAttribute('aria-hidden', 'false');
    els.backdrop.hidden = false;
    els.btnMenu.setAttribute('aria-expanded', 'true');
    setTimeout(() => { if (els.tocFilter) els.tocFilter.focus(); }, 60);
  }

  function closeTOC() {
    els.tocDrawer.classList.remove('open');
    els.tocDrawer.setAttribute('aria-hidden', 'true');
    els.backdrop.hidden = true;
    els.btnMenu.setAttribute('aria-expanded', 'false');
  }

  function jumpToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    state.suppressScrollSpy = true;
    setActiveTOC(id);
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
    localStorage.setItem(LAST_KEY, id);
    setTimeout(() => { state.suppressScrollSpy = false; }, 700);
  }

  function setActiveTOC(id) {
    els.tocList.querySelectorAll('.toc-link').forEach((a) => {
      a.classList.toggle('active', a.dataset.target === id);
    });
    setActiveQuickPartBySection(id);
    updateReadingProgress(id);
  }

  function setupObserver() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      if (state.suppressScrollSpy) return;
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const id = visible.target.id;
        setActiveTOC(id);
        localStorage.setItem(LAST_KEY, id);
      }
    }, { rootMargin: '-100px 0px -55% 0px', threshold: [0.01, 0.2, 0.5] });
    state.sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) obs.observe(el);
    });
  }

  function buildQuickParts() {
    const parts = [];
    const seen = new Set();
    state.sections.forEach((sec) => {
      if (!seen.has(sec.part)) {
        seen.add(sec.part);
        parts.push({ part: sec.part, target: sec.id });
      }
    });
    els.quickParts.innerHTML = '';
    parts.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-part-btn';
      btn.dataset.target = p.target;
      btn.dataset.part = p.part;
      btn.textContent = p.part;
      btn.addEventListener('click', () => jumpToSection(p.target));
      els.quickParts.appendChild(btn);
    });
  }

  function setActiveQuickPartBySection(id) {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return;
    els.quickParts.querySelectorAll('.quick-part-btn').forEach((btn) => {
      const active = btn.dataset.part === sec.part;
      btn.classList.toggle('active', active);
      if (active) {
        const c = els.quickParts;
        const left = btn.offsetLeft - (c.clientWidth - btn.offsetWidth) / 2;
        c.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }
    });
  }

  function updateReadingProgress(id) {
    const idx = state.sections.findIndex(s => s.id === id);
    const total = state.sections.length || 1;
    const n = idx >= 0 ? idx + 1 : 1;
    const pct = Math.round((n / total) * 100);
    els.readingProgressFill.style.width = pct + '%';
    els.readingProgressBar.setAttribute('aria-valuenow', String(pct));
    els.readingProgressLabel.textContent = 'التقدم: ' + pct + '%';
    els.readingProgressPos.textContent = 'القسم ' + n + ' من ' + total;
  }

  function clearSearchHighlights() {
    state.searchMarks = [];
    state.searchIndex = -1;
    const marks = Array.from(els.content.querySelectorAll('mark.search-hit'));
    marks.forEach((mark) => {
      const text = document.createTextNode(mark.textContent || '');
      mark.parentNode.replaceChild(text, mark);
    });
    els.content.normalize();
  }

  function highlightInNode(textNode, normQ) {
    const text = textNode.nodeValue || '';
    if (!text || !normQ) return 0;
    const { norm, map } = normalizeWithMap(text);
    const lowerNorm = norm.toLowerCase();
    const lowerQ = normQ.toLowerCase();
    let pos = 0;
    let first = null;
    let count = 0;
    while (true) {
      const idx = lowerNorm.indexOf(lowerQ, pos);
      if (idx === -1) break;
      const startOrig = map[idx];
      let endOrig = map[idx + lowerQ.length - 1] + 1;
      while (endOrig < text.length && isDiacritic(text[endOrig])) endOrig++;
      if (!first) first = { node: textNode, ranges: [] };
      first.ranges.push([startOrig, endOrig]);
      count++;
      pos = idx + lowerQ.length;
    }
    if (!first) return 0;
    const ranges = first.ranges;
    const frag = document.createDocumentFragment();
    let last = 0;
    ranges.forEach(([s, e]) => {
      if (s > last) frag.appendChild(document.createTextNode(text.slice(last, s)));
      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = text.slice(s, e);
      frag.appendChild(mark);
      state.searchMarks.push(mark);
      last = e;
    });
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
    return count;
  }

  function performSearch(qRaw) {
    clearSearchHighlights();
    els.searchDropdown.innerHTML = '';
    els.searchDropdown.hidden = true;
    const qTrim = (qRaw || '').trim();
    if (!qTrim) {
      els.searchCount.textContent = 'النتائج: 0';
      return;
    }
    const normQ = normalizeArabic(qTrim).toLowerCase();
    if (!normQ) {
      els.searchCount.textContent = 'النتائج: 0';
      return;
    }

    const walker = document.createTreeWalker(els.content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') return NodeFilter.FILTER_REJECT;
        if (p.closest('.copy-btn,.section-nav,.section-sources-actions,.back-to-top')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => highlightInNode(n, normQ));

    els.searchCount.textContent = 'النتائج: ' + state.searchMarks.length;
    buildSearchDropdown(normQ);
    if (state.searchMarks.length > 0) activateMark(0, true);
  }

  function buildSearchDropdown(normQ) {
    const groups = new Map();
    state.searchMarks.forEach((mark, i) => {
      const sec = mark.closest('.section');
      if (!sec) return;
      const id = sec.id;
      if (!groups.has(id)) groups.set(id, { id, title: sec.querySelector('.section-title')?.textContent || id, index: i, mark });
    });
    const items = Array.from(groups.values()).slice(0, 15);
    if (!items.length) return;
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result';
      const snippet = makeSnippet(item.mark, normQ);
      btn.innerHTML = '<span class="search-result-title">' + escapeHtml(item.title) + '</span><span class="search-result-snippet">' + snippet + '</span>';
      btn.addEventListener('click', () => {
        activateMark(item.index, true);
        els.searchDropdown.hidden = true;
        els.searchInput.focus();
      });
      els.searchDropdown.appendChild(btn);
    });
    els.searchDropdown.hidden = false;
  }

  function makeSnippet(mark, normQ) {
    const container = mark.closest('p,li,blockquote,.verse,.hadith,.section-summary') || mark.parentElement;
    const text = (container?.textContent || mark.textContent || '').replace(/\s+/g, ' ').trim();
    const { norm, map } = normalizeWithMap(text);
    const idx = norm.toLowerCase().indexOf(normQ.toLowerCase());
    if (idx === -1) return escapeHtml(text.slice(0, 120));
    const origStart = map[idx];
    const origEnd = map[Math.min(norm.length - 1, idx + normQ.length - 1)] + 1;
    const from = Math.max(0, origStart - 40);
    const to = Math.min(text.length, origEnd + 60);
    let s = (from > 0 ? '... ' : '') + escapeHtml(text.slice(from, origStart));
    s += '<mark>' + escapeHtml(text.slice(origStart, origEnd)) + '</mark>';
    s += escapeHtml(text.slice(origEnd, to)) + (to < text.length ? ' ...' : '');
    return s;
  }

  function activateMark(i, scroll) {
    if (!state.searchMarks.length) return;
    const total = state.searchMarks.length;
    const idx = ((i % total) + total) % total;
    state.searchMarks.forEach((m) => m.classList.remove('active'));
    state.searchIndex = idx;
    const mark = state.searchMarks[idx];
    mark.classList.add('active');
    els.searchCount.textContent = 'النتائج: ' + total + ' — (' + (idx + 1) + '/' + total + ')';
    if (scroll) mark.scrollIntoView({ behavior: 'auto', block: 'center' });
  }

  function computeBookStats() {
    const parts = new Set(state.sections.map(s => s.part).filter(Boolean));
    const chaptersCount = state.sections.filter(s => s.chapter && s.chapter !== 'ثبت المصادر').length;
    let quotesCount = 0;
    state.sections.forEach((sec) => {
      const div = document.createElement('div');
      div.innerHTML = sec.contentHtml || '';
      quotesCount += div.querySelectorAll('.scholar-quote').length;
    });
    return { partsCount: parts.size, chaptersCount, quotesCount };
  }

  function renderBookStats() {
    const stats = computeBookStats();
    els.bookStats.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'book-stats-card';

    const head = document.createElement('div');
    head.className = 'book-stats-head';
    const title = document.createElement('h2');
    title.className = 'book-stats-title';
    title.textContent = 'إحصاءات الكتاب';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'btn-stats-toggle';
    toggle.className = 'book-stats-toggle';
    head.append(title, toggle);
    card.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'book-stats-grid';
    [
      { num: stats.partsCount, label: 'أبواب' },
      { num: stats.chaptersCount, label: 'فصول' },
      { num: stats.quotesCount, label: 'نقول العلماء' }
    ].forEach((item) => {
      const box = document.createElement('div');
      box.className = 'book-stat-item';
      const n = document.createElement('span');
      n.className = 'book-stat-num';
      n.textContent = String(item.num);
      const l = document.createElement('span');
      l.className = 'book-stat-label';
      l.textContent = item.label;
      box.append(n, l);
      grid.appendChild(box);
    });
    card.appendChild(grid);
    els.bookStats.appendChild(card);
    toggle.addEventListener('click', () => { state.statsCollapsed = !state.statsCollapsed; applyStatsCollapsed(true); });
    applyStatsCollapsed(false);
  }

  function applyStatsCollapsed(persist) {
    els.bookStats.classList.toggle('is-collapsed', state.statsCollapsed);
    const toggle = q('btn-stats-toggle');
    if (toggle) {
      toggle.textContent = state.statsCollapsed ? 'إظهار' : 'طي';
      toggle.setAttribute('aria-expanded', String(!state.statsCollapsed));
    }
    if (persist) localStorage.setItem(STATS_KEY, state.statsCollapsed ? '1' : '0');
  }

  function extractCleanText(node, excludeSel) {
    const clone = node.cloneNode(true);
    if (excludeSel) clone.querySelectorAll(excludeSel).forEach(el => el.remove());
    clone.querySelectorAll('mark.search-hit').forEach(m => m.replaceWith(document.createTextNode(m.textContent || '')));
    clone.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));
    clone.querySelectorAll('li').forEach(li => {
      if (!li.textContent.startsWith('\n')) li.prepend(document.createTextNode('\n- '));
    });
    return clone.textContent.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  async function copyTextLocally(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) { return false; }
  }

  function createCopyButton(ariaLabel, getPayload, idleText) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = idleText || 'نسخ';
    btn.setAttribute('aria-label', ariaLabel);
    btn.addEventListener('click', async () => {
      const text = typeof getPayload === 'function' ? getPayload() : '';
      const ok = await copyTextLocally(text);
      btn.textContent = ok ? 'تم النسخ ✓' : 'تعذّر النسخ';
      btn.classList.toggle('copied', ok);
      setTimeout(() => { btn.textContent = idleText || 'نسخ'; btn.classList.remove('copied'); }, 1800);
    });
    return btn;
  }

  function attachCopyButtons() {
    // Scholar quotes
    els.content.querySelectorAll('.scholar-quote').forEach((qel) => {
      if (qel.querySelector('.copy-btn')) return;
      const btn = createCopyButton('نسخ القول', () => {
        const name = qel.querySelector('.scholar-name')?.textContent?.trim() || '';
        const body = extractCleanText(qel, '.copy-btn,.scholar-name,.quote-ref');
        const ref = qel.querySelector('.quote-ref')?.textContent?.trim() || '';
        return [name ? 'القائل: ' + name : '', body, ref].filter(Boolean).join('\n');
      }, 'نسخ');
      qel.insertBefore(btn, qel.firstChild);
    });

    // Verses
    els.content.querySelectorAll('.verse').forEach((vel) => {
      if (vel.querySelector('.verse-copy-wrap')) return;
      const ref = vel.querySelector('.verse-ref');
      const wrap = document.createElement('div');
      wrap.className = 'verse-copy-wrap';
      const btn = createCopyButton('نسخ الآية', () => {
        const text = extractCleanText(vel, '.copy-btn,.verse-ref');
        const r = ref?.textContent?.trim() || '';
        return r ? text + ' ' + r : text;
      }, 'نسخ');
      if (ref) wrap.appendChild(ref);
      wrap.appendChild(btn);
      vel.appendChild(wrap);
    });

    // Hadiths
    els.content.querySelectorAll('.hadith').forEach((hel) => {
      if (hel.querySelector('.hadith-copy-wrap')) return;
      const ref = hel.querySelector('.hadith-ref');
      const wrap = document.createElement('div');
      wrap.className = 'hadith-copy-wrap';
      const btn = createCopyButton('نسخ الحديث', () => {
        const text = extractCleanText(hel, '.copy-btn,.hadith-ref');
        const r = ref?.textContent?.trim() || '';
        return r ? text + '\n' + r : text;
      }, 'نسخ');
      if (ref) wrap.appendChild(ref);
      wrap.appendChild(btn);
      hel.appendChild(wrap);
    });

    // Section sources actions
    state.sections.forEach((sec) => {
      const article = document.getElementById(sec.id);
      if (!article) return;
      const sources = article.querySelector('.section-sources');
      if (!sources) return;
      let head = sources.querySelector('.section-sources-head');
      if (!head) {
        head = document.createElement('div');
        head.className = 'section-sources-head';
        const h3 = sources.querySelector('h3');
        if (h3) head.appendChild(h3);
        sources.insertBefore(head, sources.firstChild);
      }
      if (head.querySelector('.section-sources-actions')) return;
      const actions = document.createElement('div');
      actions.className = 'section-sources-actions';

      const listSources = () => (sec.sources || []).map((s, i) => (i + 1) + '. ' + s).join('\n');

      actions.appendChild(createCopyButton('نسخ قائمة المصادر', () => {
        return 'مصادر (' + sec.title + '):\n' + listSources();
      }, 'نسخ قائمة المصادر'));

      actions.appendChild(createCopyButton('نسخ الملخص والمصادر', () => {
        return sec.title + '\n\nالملخص:\n' + (sec.summary || '') + '\n\nالمصادر:\n' + listSources();
      }, 'نسخ الملخص والمصادر'));

      actions.appendChild(createCopyButton('نسخ الفصل كاملاً', () => {
        const body = extractCleanText(article.querySelector('.section-body') || article, '.section-sources,.section-nav,.copy-btn');
        return sec.title + '\n\nالملخص:\n' + (sec.summary || '') + '\n\n' + body + '\n\nالمصادر:\n' + listSources();
      }, 'نسخ الفصل كاملاً'));

      head.appendChild(actions);
    });
  }

  function openSearch(focusInput) {
    els.searchBar.hidden = false;
    els.btnSearchToggle.setAttribute('aria-expanded', 'true');
    els.btnSearchToggle.setAttribute('aria-label', 'إغلاق البحث');
    if (focusInput) setTimeout(() => els.searchInput.focus(), 30);
  }

  function closeSearch(clear) {
    els.searchBar.hidden = true;
    els.btnSearchToggle.setAttribute('aria-expanded', 'false');
    els.btnSearchToggle.setAttribute('aria-label', 'فتح البحث');
    els.searchDropdown.hidden = true;
    if (clear) {
      els.searchInput.value = '';
      clearSearchHighlights();
      els.searchDropdown.innerHTML = '';
      els.searchCount.textContent = 'النتائج: 0';
    }
  }

  function toggleSearch() {
    if (els.searchBar.hidden) openSearch(true);
    else closeSearch(false);
  }

  function wireEvents() {
    els.btnMenu.addEventListener('click', openTOC);
    els.btnTocClose.addEventListener('click', closeTOC);
    els.backdrop.addEventListener('click', closeTOC);
    els.btnSearchToggle.addEventListener('click', toggleSearch);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (els.tocDrawer.classList.contains('open')) { closeTOC(); return; }
        if (!els.searchDropdown.hidden) { els.searchDropdown.hidden = true; els.searchInput.focus(); return; }
        if (!els.searchBar.hidden) { closeSearch(false); els.btnSearchToggle.focus(); return; }
      }
      if (e.key === '/' && document.activeElement !== els.searchInput && document.activeElement !== els.tocFilter) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); openSearch(true); }
      }
    });

    els.tocFilter.addEventListener('input', () => {
      const q = normalizeArabic(els.tocFilter.value.trim().toLowerCase());
      els.tocList.querySelectorAll('.toc-link').forEach((a) => {
        const txt = normalizeArabic(a.textContent.toLowerCase());
        const show = !q || txt.includes(q);
        a.style.display = show ? '' : 'none';
      });
      els.tocList.querySelectorAll('.toc-part').forEach((part) => {
        const any = Array.from(part.querySelectorAll('.toc-link')).some(a => a.style.display !== 'none');
        part.style.display = any ? '' : 'none';
      });
    });

    els.btnFontUp.addEventListener('click', () => { state.fontSize = Math.min(MAX_FONT, state.fontSize + 1); applyFontSize(); saveFontSize(); });
    els.btnFontDown.addEventListener('click', () => { state.fontSize = Math.max(MIN_FONT, state.fontSize - 1); applyFontSize(); saveFontSize(); });
    els.btnFontReset.addEventListener('click', () => { state.fontSize = DEFAULT_FONT; applyFontSize(); saveFontSize(); });
    els.btnTheme.addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveTheme(); });

    els.searchInput.addEventListener('input', () => {
      clearTimeout(state.searchTimer);
      const v = els.searchInput.value;
      state.searchTimer = setTimeout(() => performSearch(v), 180);
    });
    els.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!state.searchMarks.length) performSearch(els.searchInput.value);
        if (state.searchMarks.length) activateMark(state.searchIndex + (e.shiftKey ? -1 : 1), true);
      }
      if (e.key === 'Escape') { els.searchDropdown.hidden = true; }
    });
    els.searchClear.addEventListener('click', () => {
      closeSearch(true);
      els.btnSearchToggle.focus();
    });
    els.searchPrev.addEventListener('click', () => { if (state.searchMarks.length) activateMark(state.searchIndex - 1, true); });
    els.searchNext.addEventListener('click', () => { if (state.searchMarks.length) activateMark(state.searchIndex + 1, true); });
    document.addEventListener('click', (e) => {
      if (!els.searchDropdown.hidden && !e.target.closest('.search-bar')) els.searchDropdown.hidden = true;
    });

    window.addEventListener('scroll', () => {
      els.btnTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    els.btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'auto' }));
  }

  function init() {
    cacheEls();
    loadState();
    applyFontSize();
    applyTheme();
    renderBook();
    buildTOC();
    buildQuickParts();
    renderBookStats();
    setupObserver();
    wireEvents();

    const last = localStorage.getItem(LAST_KEY);
    if (last && document.getElementById(last)) {
      setActiveTOC(last);
      setTimeout(() => jumpToSection(last), 50);
    } else if (state.sections[0]) {
      setActiveTOC(state.sections[0].id);
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
