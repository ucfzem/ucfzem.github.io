# Conversation Backup — « الأجوبة المسددة » Reader PWA

**Date:** 2026-10-18
**Repo:** https://github.com/ucfzem/ucfzem.github.io
**App:** https://ucfzem.github.io/al-ajwiba-al-musaddada/
**Link tree:** https://ucfzem.github.io/works/ (Maktaba folder)

---

## Objectif
Construire une PWA de lecture pour le livre arabe **« الأجوبة المسددة: روائع الحوارات النبوية والردود المعجزة »**, en reproduisant **fidèlement** le thème/design du site de référence **https://nuzhat-al-mushtaq.vercel.app/**, avec recherche arabe (tashkeel), surlignage, navigation dans les résultats, mode clair/sombre, favoris/position, import du texte et **fonctionnement hors-ligne**.

## Décisions
- **Déploiement:** sous-dossier GitHub Pages `ucfzem.github.io/al-ajwiba-al-musaddada/` (cohérent avec les autres apps du repo). *La question Vercel n'a pas été tranchée ; valeur par défaut = GitHub Pages.*
- **Texte du livre:** fourni par l'utilisateur (17 chapitres, rédigés par lui) → enregistré dans `data/book.md` (source de secours) **et** importable via `/import` (IndexedDB).
- **Polices:** Amiri (corps) + Cairo (interface) — hébergées **localement** dans `/fonts` (9 fichiers woff2 + `fonts/fonts.css`), pré-cachées pour l'offline.

## Design extrait du site de référence (tokens exacts)
Clair → Sombre :
- `--paper` `#faf5e9` → `#16130e` · `--ink` `#2b2118` → `#ece4d3`
- `--panel` `#f2e9d6` → `#241f16` · `--card` `#fffdf6` → `#1e1912` · `--modern-card` `#f1f6f2` → `#131b17`
- `--green` `#1f5c46` → `#4e9a73` · `--gold` `#a9792f` → `#d3a34a`
- `--accent-text` `#7c5620` → `#d9b977` · `--line` `#d8c9a8` → `#3a3225` · `--muted` `#7a6a50` → `#9a8a6c` · `--focus` `#ffd166`
- Interface: `Cairo` (line-height 1.9). Corps: `Amiri`, `calc(var(--content-font-size) * 1.15)`.
- Thème par défaut **sombre** (sauf `prefers-color-scheme: light`), clé locale `ajwiba_theme`.

## Structure du projet
```
al-ajwiba-al-musaddada/
├── index.html            lecteur (accueil + page chapitre + recherche)
├── import.html / import.js   page /import (coller, upload, aperçu, sauver, exporter, supprimer)
├── app.js                logique principale (routage, lecture, recherche, favoris, position, PWA)
├── parser.js             Markdown simplifié (# titre, ## chapitre, ### section) → modèle livre
├── search.js             normalisation arabe + index + recherche + surlignage
├── db.js                 IndexedDB (livre + export/delete)
├── styles.css            thème du site de référence + composants
├── sw.js                 service worker (pré-cache versionné, cache-first, fallback navigation)
├── manifest.webmanifest  PWA (rtl, ar, standalone, icons)
├── icon.svg / icon-192.png / icon-512.png   icône (bulles de dialogue or/vert)
├── fonts/                9 woff2 + fonts.css (@font-face local)
├── data/book.md          texte du livre (17 chapitres)
└── tools/render_icons.mjs  génération PNG depuis SVG (Playwright)
```

## Fonctionnalités
- **Accueil:** titre, intro, cartes de chapitres, bouton « تابع القراءة » (dernière position).
- **Lecture:** sections (السياق والراوي/السؤال/الجواب/التحليل/الدروس المستفادة), pagination Précédent/Suivant, barre de progression, surlignage ﴿ versets ﴾ et « hadiths ».
- **Recherche:** barre fixe, debounce 200 ms, normalisation arabe (suppression tashkeel/tatweel, unification أإآٱ→ا، ى/ئ→ي، ؤ→و، option ة→ه), options « كلمة كاملة » et « تجاهل التشكيل », compteur « وُجدت N مرة في M فصلاً », extraits surlignés, navigation النتيجة التالية/السابقة avec compteur.
- **Outils:** taille de police (0.8→1.6, clé `ajwiba_font_size`), thème, signets (`ajwiba_bookmarks`), position (`ajwiba_last_chapter`).
- **PWA/offline:** pré-cache de tous les fichiers + police + `data/book.md`; notification « تم تجهيز التطبيق للعمل دون اتصال »; barre « تحديث متوفر ».

## Vérifications (local + live, online + offline)
- Local: 17 chapitres, recherche « الصدقة » → 11 résultats / 1 chapitre, clic → 11 `<mark>` + courant, thème bascule, 0 erreur.
- Local offline (HTTP cache désactivé): 17 chapitres, recherche « الجواب » → 12/7, tashkeel « الذين » → 2/2, 0 erreur.
- **Live** `https://ucfzem.github.io/al-ajwiba-al-musaddada/`: 17 chapitres, SW contrôlé; recherche « الجواب » → 12/7; **offline OK** (17 chapitres, titre intact), 0 erreur.
- **Live works**: Maktaba **21 → 22** (carte « الأجوبة المسددة »), 27 images 0 cassée, offline OK (22 cartes, 0 image cassée), 0 erreur.

## Intégration /works (append-only, sans rien supprimer)
- `works/index.html` : ajout d'une seule entrée au tableau `maktaba` (après musawa-qasas) :
  `{ emoji:"💬", name:"الأجوبة المسددة", tag:"Hadith", icon:".../al-ajwiba-al-musaddada/icon.svg", url:".../al-ajwiba-al-musaddada/", newTab:true }`.
- `works/sw.js` : `works-v1.0.20 → works-v1.0.21`; ajout de l'icône de la nouvelle app au CORE (pré-cache) → icônes/paramètres disponibles hors-ligne (fallback `ignoreSearch` conservé pour `?v=`).

## Backups
- `backups/works-2026-10-18/` — `index.html`, `sw.js`, `robots.txt`, `sitemap.xml`, `assets/` (12 fichiers).
- `backups/al-ajwiba-al-musaddada-2026-10-18/` — app complète (code + fonts + data + icons).

## Commits
- `79d2cdc` — « Add al-ajwiba-al-musaddada reader PWA (17 chapters, Arabic search+highlight, offline); add Maktaba card; works SW v1.0.21 precaches new icon ».
- (ce backup) — snapshot + ce MD.

## Versions SW live
- `https://ucfzem.github.io/al-ajwiba-al-musaddada/sw.js` → `ajwiba-v1.0.0`
- `https://ucfzem.github.io/works/sw.js` → `works-v1.0.21`

## Note de contenu
Le texte des 17 chapitres est une **ébauche fournie par l'utilisateur** ; les hadiths/références doivent être vérifiés sur les sources avant publication. L'infrastructure n'invente ni ne modifie aucun texte.
