# Session — 2026-10-12 — الطب النبوي (al-tibb-al-nabawi)

## Objectif
Construire un nouveau webapp hors-ligne **الطب النبوي لابن قيم الجوزية**
(texte arabe vocalisé + recherche + PWA) puis le déployer sur GitHub Pages
et l'ajouter au link tree public `ucfzem.github.io/works` en **position #10**,
en déplaçant **Nuzhat al-Mushtaq** de #18 → **#11** (total **20 projets publics**).

## Nouveau projet : `ucfzem/al-tibb-al-nabawi`
- **URL live :** https://ucfzem.github.io/al-tibb-al-nabawi/
- **Dépôt :** https://github.com/ucfzem/al-tibb-al-nabawi
- **Source du texte :** المكتبة الشاملة (Shamela), livre n° **23649** = الطب النبوي
  (partie de زاد المعاد), محمد بن أبي بكر بن أيوب شمس الدين **ابن قيم الجوزية** (ت 751هـ),
  دار الهلال بيروت. Endpoints :
  - `https://shamela.ws/ajax/pageContent/23649/{pageId}` → JSON `{nass, pageNum, title, nextId, …}`
  - `https://shamela.ws/ajax/titlechilds/23649/{id}` → HTML du sommaire (TOC)
  - Headers requis : `X-Requested-With: XMLHttpRequest`, `Referer`, `User-Agent`.
- **Téléchargé :** 318 pages + TOC (149 nœuds, 131 pages uniques) → `/tmp/tibb_pages.json`, `/tmp/tibb_toc.json`.
  (Les OCR archive.org/epub étaient illisibles → texte Shamela propre et مشكول.)
- **النص المفكك :** **131 فصلًا** بنصّ مشكول نظيف (≈1,8 MB au total).
- **التطبيق :** Tailwind CDN, RTL, فهرس جانبي، **بحث فوري في كل الفصول** مع
  **تظليل النتائج (multi-term)** وعدّاد النتائج + قائمة قفز سريع + تنقّل
  بالكيبورد (↑ ↓ Enter Esc)، تكبير/تصغير الخط، الوضع الليلي، تصميم متجاوب،
  **PWA / يعمل أوفلاين** (`sw.js` cache `tibb-nabawi-v1`).
- **بنية المستودع :** `index.html`, `script.js`, `sw.js`, `site.webmanifest`,
  `icon.svg`, `manifest.json` (فهرس `[{id,title,file}]`), `chapters/ch-001.json … ch-131.json`
  (`{id,title,content}` HTML), `build_tibb.py`, `README.md`, `.nojekyll`, `.gitignore`.
- **توليد الفصول (`build_tibb.py`) :** يسطّح TOC بترتيب الوثيقة ويزيل التكرار،
  يبدأ كل فصل من **عنوانه الحقيقي** (c4 أو فقرة تبدأ بـ فصل/ذكر/القسم/باب/حرف…)،
  ينظّف `nass` (إزالة المراسي وأزرار النسخ، فكّ الكيانات)، ويُثري العناوين
  العامة "فصل" من نصّ الفصل ثم يرقّمها `(ص N)` عند الحاجة.
- **النشر :** GitHub Pages من الفرع `gh-pages` (المسار `/`)، HTTP 200 (`/`, `manifest.json`, `chapters/*.json`, `icon.svg`).
  ملاحظة : PAT يملك `repo` فقط **بدون** `workflow` → لا `deploy.yml`، النشر من `gh-pages`.

## Link tree `ucfzem.github.io/works`
- Sous-titre passé à **« 20 projets publics »**.
- `publicProjects` réorganisé :
  1 Quran Majeed · 2 Quran Reader · 3 Quran Amp · 4 Tanger · 5 Tech Blog ·
  6 Lingotech · 7 MicroInvoice · 8 Al-Istibsar · 9 Al-Adhkiya ·
  **10 الطب النبوي (nouveau)** · **11 Nuzhat al-Mushtaq (déplacé de 18)** ·
  12 Tarikh Ibn Khaldun · 13 Mujam al-Buldan · 14 Droppy · 15 Rafeeq ·
  16 WebHealth · 17 ElixirTech · 18 EmailCollector · 19 API JobFinder · 20 SavoirsEnJouant.
- **Les 19 apps d'origine ont été préservées** (vérifié : 20 blocs `num:`, 19 noms présents).
- Icône ajoutée : `works/assets/al-tibb-al-nabawi.svg` (livre + pousse verte + croissant doré, fond émeraude).

## Correctifs
- `sw.js` fourni contenait un commentaire Python `#` → **erreur de syntaxe JS** ; réécrit.
- Bug `lastIndex` dans la mise en évidence (regex globale `.test()` en boucle) → **corrigé**
  (multi-termes, comparaison par ensemble, `re.lastIndex=0`).
- La saisie de recherche ne relance plus `loadChapter` (plus de saut en haut à chaque frappe).
- `site.webmanifest` pointait vers des PNG manquants → remplacé par `icon.svg` (`sizes:any`).

## Commits
- `al-tibb-al-nabawi` : `df72aa5` — feat: الطب النبوي reader — 131 chapters, search, PWA, offline (main + gh-pages).
- `ucfzem.github.io` : `750fa3a` — works: add الطب النبوي (#10), move Nuzhat al-Mushtaq to #11 — 20 projets publics.

## Liens
- App : https://ucfzem.github.io/al-tibb-al-nabawi/
- Link tree : https://ucfzem.github.io/works/
- Dépôt app : https://github.com/ucfzem/al-tibb-al-nabawi
- Icône : https://ucfzem.github.io/works/assets/al-tibb-al-nabawi.svg
- Session précédente : CONVERSATION_2026-10-11-tarikh-ibn-khaldun.md

## Mises à jour (durcissement post-déploiement) — commit `3f1b867`
- **Taille de police persistée** : `localStorage['tibb_fontSize']` (bornes 14–28px), restaurée au chargement.
- **Fetch robuste** : `fetchWithTimeout()` (AbortController, 12 s) pour le manifeste et chaque chapitre ;
  en cas d'échec du manifeste → message + **bouton « إعادة المحاولة »** (relance `initReader`).
- **Anti-débordement** : `overflow-x-hidden` sur `<body>`, `min-w-0` sur `<main>`, `overflow-wrap:break-word` sur le texte.
- **Service Worker** : cache passé à `tibb-nabawi-v1.0.1` (network-first → mise à jour instantanée).
- Déjà en place : appariement **Cairo (UI) + Amiri (texte)**, mode sombre persisté, recherche/filtrat des chapitres
  dans la barre latérale avec compteur de résultats.
- Déployé `main` + `gh-pages`, vérifié en ligne (`sw v1.0.1`, `fetchWithTimeout`, garde-fous présents).
