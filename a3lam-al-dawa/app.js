"use strict";

(function () {
  const { UI, CATEGORIES, PROFILES } = window.A3LAM;
  const LANGS = ["ar", "en", "fr", "es"];
  const LANG_META = {
    ar: { dir: "rtl", htmlLang: "ar" },
    en: { dir: "ltr", htmlLang: "en" },
    fr: { dir: "ltr", htmlLang: "fr" },
    es: { dir: "ltr", htmlLang: "es" }
  };
  const THEME_TITLES = {
    ar: { sepia: "مظهر بارشمان", light: "مظهر نهاري", dark: "مظهر ليلي" },
    en: { sepia: "Parchment theme", light: "Light theme", dark: "Dark theme" },
    fr: { sepia: "Thème parchemin", light: "Thème clair", dark: "Thème sombre" },
    es: { sepia: "Tema pergamino", light: "Tema claro", dark: "Tema oscuro" }
  };
  const A11Y = {
    ar: {
      language: "اختيار اللغة",
      theme: "اختيار المظهر",
      reading: "حجم القراءة",
      smaller: "تصغير الخط",
      reset: "إعادة حجم الخط",
      larger: "تكبير الخط",
      search: "البحث في الدليل",
      toc: "فهرس الشخصيات والأقسام",
      openMenu: "فتح الفهرس",
      closeMenu: "إغلاق الفهرس"
    },
    en: {
      language: "Choose language",
      theme: "Choose theme",
      reading: "Reading size",
      smaller: "Decrease font size",
      reset: "Reset font size",
      larger: "Increase font size",
      search: "Search the directory",
      toc: "Index of figures and sections",
      openMenu: "Open index",
      closeMenu: "Close index"
    },
    fr: {
      language: "Choisir la langue",
      theme: "Choisir le thème",
      reading: "Taille de lecture",
      smaller: "Réduire la police",
      reset: "Réinitialiser la police",
      larger: "Agrandir la police",
      search: "Rechercher dans le répertoire",
      toc: "Sommaire des figures et sections",
      openMenu: "Ouvrir le sommaire",
      closeMenu: "Fermer le sommaire"
    },
    es: {
      language: "Elegir idioma",
      theme: "Elegir tema",
      reading: "Tamaño de lectura",
      smaller: "Reducir la letra",
      reset: "Restablecer la letra",
      larger: "Aumentar la letra",
      search: "Buscar en el directorio",
      toc: "Índice de figuras y secciones",
      openMenu: "Abrir el índice",
      closeMenu: "Cerrar el índice"
    }
  };
  const COUNT_LABELS = {
    ar: { figures: "شخصية", tracks: "مسارات" },
    en: { figures: "figures", tracks: "tracks" },
    fr: { figures: "figures", tracks: "parcours" },
    es: { figures: "figuras", tracks: "itinerarios" }
  };
  const LANG_KEY = "a3lam-lang";
  const THEME_KEY = "a3lam-theme";
  const SIZE_KEY = "a3lam-size";
  const ALL_IDS = CATEGORIES.flatMap((category) => category.ids);
  const ORDER = new Map(ALL_IDS.map((id, index) => [id, index + 1]));

  const mainContent = document.getElementById("mainContent");
  const categoriesEl = document.getElementById("categories");
  const tocList = document.getElementById("tocList");
  const toc = document.getElementById("toc");
  const tocOverlay = document.getElementById("tocOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const tocClose = document.getElementById("tocClose");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const resultSummary = document.getElementById("resultSummary");
  const searchNav = document.getElementById("searchNav");
  const prevMatch = document.getElementById("prevMatch");
  const nextMatch = document.getElementById("nextMatch");
  const matchCounter = document.getElementById("matchCounter");
  const emptyState = document.getElementById("emptyState");
  const topLink = document.getElementById("topLink");
  const netBadge = document.getElementById("netBadge");
  const fontReadout = document.getElementById("fontReadout");

  let currentLang = "ar";
  let currentTheme = "sepia";
  let readingScale = 1;
  let tokens = [];
  let matchEls = [];
  let activeMatch = -1;
  let searchTimer = 0;
  let tocTargets = [];
  let tocRaf = 0;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setAttr(id, name, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(name, value);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeChar(char) {
    const base = char.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const plain = base
      .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي");
    if (/[\p{L}\p{N}]/u.test(plain)) return plain;
    return " ";
  }

  function buildNormalized(raw) {
    let text = "";
    const map = [];
    for (let index = 0; index < raw.length; index += 1) {
      const normalized = normalizeChar(raw[index]);
      for (const char of normalized) {
        text += char;
        map.push(index);
      }
    }
    return { text, map };
  }

  function normalize(value) {
    return buildNormalized(String(value)).text.replace(/\s+/g, " ").trim();
  }

  function findRanges(raw, queryTokens) {
    if (!queryTokens.length) return [];
    const { text, map } = buildNormalized(raw);
    const ranges = [];
    for (const token of queryTokens) {
      if (!token) continue;
      let from = 0;
      while (from < text.length) {
        const index = text.indexOf(token, from);
        if (index === -1) break;
        const start = map[index];
        const end = map[index + token.length - 1] + 1;
        ranges.push([start, end]);
        from = index + Math.max(token.length, 1);
      }
    }
    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [];
    for (const range of ranges) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) {
        last[1] = Math.max(last[1], range[1]);
      } else {
        merged.push(range.slice());
      }
    }
    return merged;
  }

  function highlight(raw, queryTokens) {
    const text = String(raw);
    const ranges = findRanges(text, queryTokens);
    if (!ranges.length) return escapeHTML(text);
    let html = "";
    let position = 0;
    for (const [start, end] of ranges) {
      html += escapeHTML(text.slice(position, start));
      html += `<mark>${escapeHTML(text.slice(start, end))}</mark>`;
      position = end;
    }
    html += escapeHTML(text.slice(position));
    return html;
  }

  function tokenMatches(raw) {
    if (!tokens.length) return true;
    const text = normalize(raw);
    return tokens.every((token) => text.includes(token));
  }

  function categoryText(category) {
    return `${category.title[currentLang]} ${category.kicker[currentLang]}`;
  }

  function profileText(profile) {
    return [
      profile.name[currentLang],
      profile.spec[currentLang],
      profile.country[currentLang],
      profile.bio[currentLang],
      profile.channel,
      profile.search
    ].join(" ");
  }

  function youtubeUrl(profile) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(profile.search || profile.name.en)}`;
  }

  function flashElement(element) {
    element.classList.remove("flash");
    void element.offsetWidth;
    element.classList.add("flash");
    window.setTimeout(() => element.classList.remove("flash"), 1600);
  }

  function setActiveToc(targetId) {
    tocList.querySelectorAll(".toc-link").forEach((link) => {
      const isActive = link.dataset.target === targetId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function syncControls(ui) {
    const a11y = A11Y[currentLang];
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === currentLang));
    });
    document.querySelectorAll("[data-theme-value]").forEach((button) => {
      const active = button.dataset.themeValue === currentTheme;
      button.setAttribute("aria-pressed", String(active));
      const title = THEME_TITLES[currentLang][button.dataset.themeValue] || ui.theme;
      button.setAttribute("aria-label", title);
      button.setAttribute("title", title);
    });
    setAttr("langGroup", "aria-label", a11y.language);
    setAttr("themeGroup", "aria-label", a11y.theme);
    setAttr("fontGroup", "aria-label", a11y.reading);
    setAttr("fontMinus", "aria-label", a11y.smaller);
    setAttr("fontReset", "aria-label", a11y.reset);
    setAttr("fontPlus", "aria-label", a11y.larger);
    setAttr("searchInput", "aria-label", a11y.search);
    setAttr("toc", "aria-label", a11y.toc);
    setAttr("menuToggle", "aria-label", a11y.openMenu);
    setAttr("tocClose", "aria-label", a11y.closeMenu);
    if (fontReadout) fontReadout.textContent = `${Math.round(readingScale * 100)}%`;
  }

  function setTheme(theme) {
    currentTheme = ["sepia", "light", "dark"].includes(theme) ? theme : "sepia";
    document.documentElement.dataset.theme = currentTheme;
    const themeColor = currentTheme === "dark" ? "#0f172a" : currentTheme === "light" ? "#ffffff" : "#f8f4e8";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", themeColor);
    document.querySelectorAll("[data-theme-value]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeValue === currentTheme));
    });
    safeSet(THEME_KEY, currentTheme);
  }

  function setReadingScale(scale) {
    const value = Math.max(0.86, Math.min(1.26, scale));
    readingScale = Math.round(value * 100) / 100;
    document.documentElement.style.setProperty("--reading-scale", String(readingScale));
    if (fontReadout) fontReadout.textContent = `${Math.round(readingScale * 100)}%`;
    safeSet(SIZE_KEY, String(readingScale));
  }

  function updateNetBadge() {
    if (!netBadge) return;
    const online = navigator.onLine;
    const ui = UI[currentLang];
    netBadge.textContent = `${online ? "🟢" : "🟠"} ${online ? ui.online : ui.offline}`;
    netBadge.classList.toggle("offline", !online);
  }

  function renderStatic(ui) {
    const langMeta = LANG_META[currentLang];
    document.documentElement.lang = langMeta.htmlLang;
    document.documentElement.dir = langMeta.dir;
    document.title = ui.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (metaDescription) metaDescription.setAttribute("content", ui.heroLede);
    if (ogTitle) ogTitle.setAttribute("content", ui.title);
    if (ogDescription) ogDescription.setAttribute("content", ui.heroLede);

    setText("skipLink", ui.skip);
    setText("menuLabel", ui.menu);
    setText("brandTitle", ui.brand);
    setText("brandSub", ui.brandSub);
    setText("eyebrow", ui.eyebrow);
    setText("heroTitle", ui.title);
    setText("heroLede", ui.heroLede);
    const counts = COUNT_LABELS[currentLang];
    setText("metaProfiles", `${Object.keys(PROFILES).length} ${counts.figures}`);
    setText("metaCategories", `${CATEGORIES.length} ${counts.tracks}`);
    setText("metaLangs", "AR · EN · FR · ES");
    setText("searchClear", ui.searchClear);
    setText("searchHint", ui.searchHint);
    setText("prevLabel", ui.prevMatch);
    setText("nextLabel", ui.nextMatch);
    setText("tocTitle", ui.indexTitle);
    setText("tocNote", ui.indexNote);
    setText("intro", ui.intro);
    setText("bioLink", ui.bioLink);
    setText("introKicker", ui.introKicker);
    setText("introTitle", ui.introTitle);
    setText("introP1", ui.introP1);
    setText("introP2", ui.introP2);
    setText("bioKicker", ui.bioKicker);
    setText("bioName", ui.bioName);
    setText("bioRole", ui.bioRole);
    setText("bioText", ui.bioText);
    setText("catalogKicker", ui.catalogNote);
    setText("catalogTitle", ui.catalogTitle);
    setText("catalogNote", ui.catalogNote);
    setText("emptyTitle", ui.emptyTitle);
    setText("emptyHint", ui.emptyHint);
    setText("footerCopy", ui.footer);
    setText("footerMaktaba", ui.footerMaktaba);
    setText("footerWorks", ui.footerWorks);
    setText("footerGithub", ui.footerGithub);
    setText("topLink", "↑");
    setAttr("topLink", "aria-label", ui.top);
    setAttr("skipLink", "href", "#catalog");
    setAttr("searchInput", "placeholder", ui.searchPlaceholder);
    setAttr("langGroup", "aria-label", A11Y[currentLang].language);
    setAttr("themeGroup", "aria-label", A11Y[currentLang].theme);
    setAttr("fontGroup", "aria-label", A11Y[currentLang].reading);
    setAttr("menuToggle", "aria-label", A11Y[currentLang].openMenu);
    setAttr("tocClose", "aria-label", A11Y[currentLang].closeMenu);
    setAttr("toc", "aria-label", A11Y[currentLang].toc);
    setAttr("searchInput", "aria-label", A11Y[currentLang].search);
    setAttr("header", "aria-label", ui.brand);
    setAttr("bioGithub", "aria-label", "GitHub");
    setAttr("bioWorks", "aria-label", ui.footerWorks);

    syncControls(ui);
    updateNetBadge();
  }

  function renderToc(filtered) {
    const ui = UI[currentLang];
    const primary = `
      <a class="toc-link toc-main" href="#about" data-target="about">
        <span class="toc-num" aria-hidden="true">•</span><span>${escapeHTML(ui.intro)}</span>
      </a>
      <a class="toc-link toc-main" href="#bio" data-target="bio">
        <span class="toc-num" aria-hidden="true">•</span><span>${escapeHTML(ui.bioLink)}</span>
      </a>`;
    const groups = filtered.map((category) => {
      const figures = category.items.map((profile) => {
        return `<a class="toc-link toc-figure" href="#figure-${profile.id}" data-target="figure-${profile.id}">${highlight(profile.name[currentLang], tokens)}</a>`;
      }).join("");
      return `
        <div class="toc-group">
          <a class="toc-link toc-category" href="#cat-${category.id}" data-target="cat-${category.id}">
            <span class="toc-num">${category.num}</span><span>${highlight(category.title, tokens)}</span>
          </a>
          <div class="toc-figures">${figures}</div>
        </div>`;
    }).join("");
    tocList.innerHTML = primary + groups;
    setText("tocFoot", `${ui.catalogNote} · ${ui.footer}`);
  }

  function renderCard(profile) {
    const ui = UI[currentLang];
    const lang = currentLang;
    const order = String(ORDER.get(profile.id) || 0).padStart(2, "0");
    const name = highlight(profile.name[lang], tokens);
    const country = highlight(profile.country[lang], tokens);
    const specialty = highlight(profile.spec[lang], tokens);
    const bio = highlight(profile.bio[lang], tokens);
    const channel = highlight(profile.channel, tokens);
    return `
      <article class="figure-card" id="figure-${profile.id}" data-figure="${profile.id}">
        <div class="figure-index" aria-hidden="true">${order}</div>
        <div class="figure-body">
          <div class="figure-top">
            <h3 class="figure-name">${name}</h3>
            <div class="figure-badges">
              <span class="badge badge-country">${country}</span>
              <span class="badge badge-spec">${specialty}</span>
            </div>
          </div>
          <p class="figure-desc">${bio}</p>
          <div class="figure-actions">
            <a class="channel youtube-link" href="${youtubeUrl(profile)}" target="_blank" rel="noopener" aria-label="${escapeHTML(ui.youtube)}: ${escapeHTML(profile.name[lang])}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg>
              <span>${escapeHTML(ui.youtube)}</span>
            </a>
            <button class="channel copy-btn" type="button" data-copy="${profile.id}" aria-label="${escapeHTML(ui.copy)}: ${escapeHTML(profile.name[lang])}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>
              <span>${escapeHTML(ui.copy)}</span>
            </button>
            <span class="channel channel-name" title="${escapeHTML(ui.channel)}">${escapeHTML(ui.channel)}: ${channel}</span>
          </div>
        </div>
      </article>`;
  }

  function renderCategories(filtered) {
    const ui = UI[currentLang];
    categoriesEl.innerHTML = filtered.map((category) => {
      const cards = category.items.map(renderCard).join("");
      const countLabel = category.items.length === 1 ? ui.card : ui.cards;
      return `
        <section class="section-card category" id="cat-${category.id}">
          <div class="category-head">
            <div class="category-number" aria-hidden="true">${category.num}</div>
            <div>
              <h3 class="category-title">${highlight(category.title, tokens)}</h3>
              <p class="category-kicker">${highlight(category.kicker, tokens)}</p>
            </div>
            <span class="category-count">${category.items.length} ${countLabel}</span>
          </div>
          <div class="figures">${cards}</div>
        </section>`;
    }).join("");
    emptyState.classList.toggle("visible", filtered.length === 0);
  }

  function updateMatchNavigation(shouldScroll) {
    if (!matchEls.length) {
      activeMatch = -1;
      searchNav.classList.remove("visible");
      prevMatch.disabled = true;
      nextMatch.disabled = true;
      matchCounter.textContent = "";
      return;
    }
    if (activeMatch < 0 || activeMatch >= matchEls.length) activeMatch = 0;
    matchEls.forEach((mark, index) => mark.classList.toggle("active", index === activeMatch));
    searchNav.classList.add("visible");
    prevMatch.disabled = false;
    nextMatch.disabled = false;
    matchCounter.textContent = `${activeMatch + 1} / ${matchEls.length}`;
    if (shouldScroll) {
      matchEls[activeMatch].scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center",
        inline: "nearest"
      });
    }
  }

  function matchSummaryText(matches, cards) {
    const ui = UI[currentLang];
    if (currentLang === "ar") {
      const mod = matches % 100;
      const words = matches === 1 ? "كلمة واحدة" : matches === 2 ? "كلمتين" : mod >= 3 && mod <= 10 ? `${matches} كلمات` : `${matches} كلمة`;
      const cardMod = cards % 100;
      const cardText = cards === 1 ? "بطاقة واحدة" : cards === 2 ? "بطاقتين" : cardMod >= 3 && cardMod <= 10 ? `${cards} بطاقات` : `${cards} بطاقة`;
      return `تم العثور على ${words} في ${cardText}`;
    }
    if (currentLang === "en") {
      return `Found ${matches} ${matches === 1 ? "word" : ui.words} in ${cards} ${cards === 1 ? ui.card : ui.cards}`;
    }
    if (currentLang === "fr") {
      return `${matches} ${matches === 1 ? "mot" : ui.words} ${matches === 1 ? "trouvé" : "trouvés"} dans ${cards} ${cards === 1 ? ui.card : ui.cards}`;
    }
    return `${matches} ${matches === 1 ? "palabra" : ui.words} ${matches === 1 ? "encontrada" : "encontradas"} en ${cards} ${cards === 1 ? ui.card : ui.cards}`;
  }

  function updateSearchSummary(cardEls) {
    const ui = UI[currentLang];
    if (!tokens.length) {
      resultSummary.textContent = ui.catalogNote;
      searchNav.classList.remove("visible");
      matchCounter.textContent = "";
      prevMatch.disabled = true;
      nextMatch.disabled = true;
      matchEls = [];
      activeMatch = -1;
      return;
    }
    const cardsWithMatches = cardEls.length;
    if (!matchEls.length) {
      resultSummary.textContent = ui.noMatches;
    } else {
      resultSummary.textContent = matchSummaryText(matchEls.length, cardsWithMatches);
    }
  }

  function refreshTocTargets() {
    tocTargets = Array.from(document.querySelectorAll("#about, #bio, #categories .category, #categories .figure-card"));
  }

  function updateActiveTocFromScroll() {
    if (!tocTargets.length) return;
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.getBoundingClientRect().height : 80;
    const threshold = Math.max(headerHeight + 30, window.innerHeight * 0.35);
    let active = "about";
    for (const element of tocTargets) {
      if (element.getBoundingClientRect().top <= threshold) active = element.id;
      else break;
    }
    setActiveToc(active);
  }

  function scheduleTocUpdate() {
    if (tocRaf) return;
    tocRaf = window.requestAnimationFrame(() => {
      tocRaf = 0;
      updateActiveTocFromScroll();
    });
  }

  function render() {
    const ui = UI[currentLang];
    const query = searchInput.value.trim();
    tokens = normalize(query).split(" ").filter(Boolean);
    const filtered = CATEGORIES.map((category) => {
      const catMatch = tokens.length ? tokenMatches(categoryText(category)) : true;
      const items = category.ids
        .map((id) => PROFILES[id])
        .filter((profile) => !tokens.length || catMatch || tokenMatches(profileText(profile)));
      return {
        id: category.id,
        num: category.num,
        title: category.title[currentLang],
        kicker: category.kicker[currentLang],
        items
      };
    }).filter((category) => category.items.length > 0);

    renderStatic(ui);
    renderToc(filtered);
    renderCategories(filtered);
    searchClear.classList.toggle("visible", Boolean(query));
    matchEls = Array.from(mainContent.querySelectorAll("mark"));
    activeMatch = matchEls.length ? 0 : -1;
    updateSearchSummary(Array.from(categoriesEl.querySelectorAll(".figure-card")));
    updateMatchNavigation(false);
    refreshTocTargets();
    updateActiveTocFromScroll();
  }

  function openDrawer() {
    toc.classList.add("open");
    tocOverlay.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", A11Y[currentLang].closeMenu);
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    toc.classList.remove("open");
    tocOverlay.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", A11Y[currentLang].openMenu);
    document.body.classList.remove("drawer-open");
  }

  function copyFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch {
      return;
    } finally {
      area.remove();
    }
  }

  async function copyProfile(id, button) {
    const profile = PROFILES[id];
    if (!profile) return;
    const ui = UI[currentLang];
    const text = `${profile.name[currentLang]}\n${profile.spec[currentLang]} · ${profile.country[currentLang]}\n\n${profile.bio[currentLang]}\n\n${ui.channel}: ${profile.channel}\n${youtubeUrl(profile)}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        copyFallback(text);
      }
      const label = button.querySelector("span");
      if (label) label.textContent = ui.copied;
      button.classList.add("copied");
      window.setTimeout(() => {
        if (label) label.textContent = ui.copy;
        button.classList.remove("copied");
      }, 1600);
    } catch {
      copyFallback(text);
    }
  }

  document.getElementById("langGroup").addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    const lang = button.dataset.lang;
    if (!LANGS.includes(lang) || lang === currentLang) return;
    currentLang = lang;
    safeSet(LANG_KEY, currentLang);
    closeDrawer();
    render();
  });

  document.getElementById("themeGroup").addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-value]");
    if (!button) return;
    setTheme(button.dataset.themeValue);
    syncControls(UI[currentLang]);
  });

  document.getElementById("fontMinus").addEventListener("click", () => {
    setReadingScale(readingScale - 0.06);
  });
  document.getElementById("fontPlus").addEventListener("click", () => {
    setReadingScale(readingScale + 0.06);
  });
  document.getElementById("fontReset").addEventListener("click", () => {
    setReadingScale(1);
  });

  menuToggle.addEventListener("click", () => {
    if (toc.classList.contains("open")) closeDrawer();
    else openDrawer();
  });
  tocClose.addEventListener("click", closeDrawer);
  tocOverlay.addEventListener("click", closeDrawer);

  searchInput.addEventListener("input", () => {
    searchClear.classList.toggle("visible", Boolean(searchInput.value.trim()));
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(render, 90);
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.remove("visible");
    render();
    searchInput.focus();
  });

  prevMatch.addEventListener("click", () => {
    if (!matchEls.length) return;
    activeMatch = (activeMatch - 1 + matchEls.length) % matchEls.length;
    updateMatchNavigation(true);
  });

  nextMatch.addEventListener("click", () => {
    if (!matchEls.length) return;
    activeMatch = (activeMatch + 1) % matchEls.length;
    updateMatchNavigation(true);
  });

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      copyProfile(copyButton.dataset.copy, copyButton);
      return;
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    closeDrawer();
    setActiveToc(targetId);
    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    flashElement(target);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", `#${targetId}`);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  window.addEventListener("online", updateNetBadge);
  window.addEventListener("offline", updateNetBadge);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeDrawer();
  });

  window.addEventListener("scroll", () => {
    topLink.classList.toggle("visible", window.scrollY > 600);
    scheduleTocUpdate();
  }, { passive: true });

  const storedLang = safeGet(LANG_KEY);
  if (LANGS.includes(storedLang)) currentLang = storedLang;
  const storedTheme = safeGet(THEME_KEY);
  if (["sepia", "light", "dark"].includes(storedTheme)) currentTheme = storedTheme;
  const storedSize = Number.parseFloat(safeGet(SIZE_KEY) || "1");
  if (Number.isFinite(storedSize)) readingScale = Math.max(0.86, Math.min(1.26, storedSize));

  setTheme(currentTheme);
  setReadingScale(readingScale);
  render();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
