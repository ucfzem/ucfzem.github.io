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

## Écoute (Text-to-Speech) — commit `4cdb099`
- **Web Speech API** (`speechSynthesis`), sans dépendance externe.
- **Lecture par file de paragraphes** (`h2, h3, p` du chapitre) : chaque bloc est
  surligné (`.tts-highlight`) puis défilé **au centre** de l'écran pendant la lecture.
- Voix arabe sélectionnée automatiquement (`ar-SA` par défaut), débit 0,95.
- Boutons (en-tête) : **🔊 استماع / ⏸️ إيقاف مؤقت / ▶️ استئناف** (toggle) + **⏹️ إيقاف**.
- La lecture s'arrête automatiquement au **changement de chapitre** (`loadChapter` → `tts.stop()`).
- Fichiers : `script.js` (module `tts`), `index.html` (boutons + styles `.tts-highlight`).
- Déployé `main` + `gh-pages`, vérifié en ligne.

## Correctif TTS Chrome/Android — commit `220005f`
Problèmes signalés : défilement trop rapide (blocs courts) et absence de son sur certains Chrome.
Corrections :
- La file ne lit que les **`<p>`** (on ignore les titres `h2/h3` et les blocs très courts `< 5` car.).
- **Délais tampon** : 150 ms après `cancel()` avant de démarrer ; **320 ms** entre paragraphes
  (le moteur Chrome a le temps de réinitialiser son flux audio).
- **Sélection explicite de la voix arabe** (`getVoices()` → `ar*`) relue à chaque démarrage
  (les voix se chargent parfois tardivement → `voiceschanged`).
- **Garde d'état** : `playNext()` ne s'exécute que si `state === 'playing'` ; les erreurs
  `interrupted`/`canceled` (déclenchées par `cancel()`) sont ignorées pour ne pas bloquer la file.
- `resume()` relance la file si l'on était dans l'intervalle entre deux paragraphes.
- Fichier : `script.js` (module `tts`). Déployé `main` + `gh-pages`, vérifié en ligne.

## Retrait du lecteur audio (TTS) — commits `d4aafd7`, `a7adda6`
La synthèse vocale ne produisait aucun son sur l'appareil (Chrome : pas de voix arabe
installée → `onend` instantané → défilement rapide). Après plusieurs correctifs, à la
demande de l'utilisateur : **suppression complète de la fonction Écoute**.
- `index.html` : boutons `ttsToggle`/`ttsStop` retirés, styles `.tts-highlight` retirés
  (l'en-tête garde le thème + la taille de police, avec `flex-wrap`).
- `script.js` : module `tts` et appel `tts.stop()` supprimés ; plus aucune référence à
  `speechSynthesis`.
- `sw.js` : cache passé à `tibb-nabawi-v1.0.2`.
- Vérifié en ligne : 0 référence TTS, `sw v1.0.2`.
- Réversible : le code TTS reste dans l'historique Git si besoin de le réactiver.

## Ordre des boutons + offline complet
- **Boutons de pagination inversés** (`f028c9a`) : « الفصل التالي → » (suivant) à droite,
  « ← الفصل السابق » (précédent) à gauche (interversion dans l'ordre DOM, `index.html`).
- **Offline réellement stylé** (`6e789fa`) : le Service Worker ne cachait que le même-origine ;
  Tailwind (CDN) et Google Fonts (cross-origin) n'étaient pas mis en cache → page non stylée hors-ligne.
  Ajout d'une stratégie **cache-first cross-origin** (avec stockage des réponses `opaque`).
  Cache passé à `tibb-nabawi-v1.0.4`.
- Rappel : le lecteur charge **tous les 131 chapitres au démarrage** → tout le contenu est
  disponible hors-ligne dès la première visite en ligne (pas de mise en cache par chapitre).
- Vérifié en ligne : ordre des boutons OK, `sw v1.0.4` avec cache cross-origin.

## Recherche plein-texte : normalisation arabe
- **Bug réel** : la recherche parcourait bien tout le texte des chapitres (`doSearch`), mais le texte
  source est entièrement **vocalisé (tashkeel)** → taper `الحلبة` ne correspondait jamais à
  `الْحُلْبَةِ`. Aucune normalisation des hamzas / ta-marbuta non plus.
- **Correctif** (`e3ef87a`) :
  - `normalizeArabic()` : retire le tashkeel (`\u064B-\u0652`, `\u0670`, tatweel `\u0640`),
    unifie `أإآٱ→ا`, `ة→ه`, `ى→ي`, `ؤ→و`, `ئ→ي`, minuscule.
  - Index de recherche = texte normalisé (`chapterText`), requête normalisée.
  - **Surlignage** tolérant aux diacritiques : `termToPattern()` construit une regex avec classes de
    caractères (`ا`, `ه`, `ي`, `و`) et `DIAC` entre chaque lettre → surligne le mot vocalisé à l'écran.
  - Cache SW → `tibb-nabawi-v1.0.5` (pour forcer la mise à jour hors-ligne de `script.js`).
- **Vérifié (Node, 131 chapitres)** : `الحلبة` 4, `الصبر` 29, `القسط` 15, `الريحان` 6 occurrences.
- En ligne : `normalizeArabic` présent dans `script.js`, `sw v1.0.5`.

## Recherche par synonymes (remèdes + organes)
- **`SYNONYM_GROUPS`** (`546846a`) : dictionnaire de synonymes/noms alternatifs orienté
  médecine prophétique — remèdes (ex. الحبة السوداء = حبة البركة = الشونيز ; الدباء = القرع = اليقطين ;
  الصبر = الألوة ; القسط الهندي/البحري = الكست ; السنا = السنامكي ; الزعتر = السعتر = العتر…) et
  organes/parties du corps (القلب = الفؤاد ; الكلى = الكلية ; الأمعاء = المصارين = المعي ;
  الكتف = المنكب ; الشرايين = الأوردة = العروق ; الحلق = الحلقوم = البلعوم…).
- **`expandArabicTerms()`** : développe chaque terme saisi vers tous les synonymes de son groupe.
- **`queryTerms()`** : si la requête entière (normalisée) est un terme connu, elle est traitée comme
  une **expression** (ex. `حبة البركة`) et non découpée en mots — sinon découpage en jetons.
- **`isWholeTerm()` / `countTerm()` / `titleMatches()`** : correspondance **mot entier** (bornes
  arabes) pour les termes/synonymes connus → `الآس` ne matche plus `الإسلام`, `تين` plus `اثنتين`.
  La saisie partielle libre reste en sous-chaîne.
- **Surlignage** : les synonymes connus sont encadrés par des lookarounds `(?<![\u0621-\u064A])…(?![…])`
  (avec repli try/catch si non supporté).
- **Vérifié (Node, VM, 131 chapitres)** : حبة البركة = الحبة السوداء = الشونيز → 2 ch/9 ;
  القلب = الفؤاد → 46/98 ; الدباء = القرع → 6/22 ; الأمعاء = المصارين → 6/8 ; الآس → 1/1 ; تين → 4/7.
- Cache SW → `tibb-nabawi-v1.0.6`. En ligne : `SYNONYM_GROUPS` présent, `sw v1.0.6`.

## Boutons RTL : aucun changement requis
- Suggestion reçue : ajouter `direction: rtl` / `flex-direction: row-reverse` pour placer « الفصل التالي »
  à droite. **Vérifié : déjà en place.**
  - `index.html:2` → `<html lang="ar" dir="rtl" …>` (RTL global déjà actif).
  - Boutons statiques (`index.html:103-107`), ordre DOM `nextBtn` → `pageIndicator` → `prevBtn` ;
    en flex RTL le 1er élément est à **droite** → Next à droite, Prev à gauche. Correct.
  - Appliquer `row-reverse`/`order` inverserait → régression. **Aucune modification appliquée.**

## Hors-ligne dès la 1re visite (precache à l'install)
- `skipWaiting()` + `clients.claim()` déjà présents. Nouveau : **precache complet pendant `install`**
  (`ec3ef87`? non → `58b0484`, cache `tibb-nabawi-v1.0.7`).
  - `CORE` inclut `./manifest.json` ; l'install lit `manifest.json` et met en cache **les 131 chapitres**.
  - Les ressources CDN (Tailwind, Google Fonts) sont aussi précachées (`fetch(..., {mode:'no-cors'})` + `cache.put`).
  - Résultat : contenu disponible hors-ligne dès la première ouverture, sans second rechargement.
- **Test hors-ligne (Node VM, réseau coupé, sans requête de page préalable)** :
  install → 139 entrées ; `131/131` chapitres + shell + CDN servis **status 200**, `11/11` contrôles.
  (Harness : `/tmp/opencode/offline_test.js` ; le SW réel est exécuté, résolution des URL relatives
  façon navigateur.)
- Déployé : `sw v1.0.7` en ligne.

## Page `ucfzem.github.io/works` hors-ligne
- Nouveau `works/sw.js` (`works-v1.0.0`) : precache shell + 7 assets (`assets/*.png|svg`) + Google Fonts CSS.
- Enregistrement ajouté en fin de `works/index.html` (`navigator.serviceWorker.register('./sw.js')`).
- **Test hors-ligne : `10/10`** (navigate `/works/`, index, 7 assets, fonts). Harness :
  `/tmp/opencode/offline_test_works.js`.
- Portée limitée à `/works/` (scope du SW).

## Déploiement hors-ligne par lots (toutes les apps GitHub Pages)
Modèle standard appliqué : SW `install` → `skipWaiting()` + precache shell + données + CDN
(`fetch(...,{mode:'no-cors'})`) ; `activate` → purge anciens caches + `clients.claim()` ;
`fetch` → navigation réseau-d'abord → `index.html` ; même-origine cache-d'abord (`ignoreSearch`) ;
cross-origin cache-d'abord. Enregistrement `./sw.js` ajouté avant `</body>`.
Testé avec `/tmp/opencode/offline_test_generic.js <cfg.json>` (vrai `sw.js` en VM Node, réseau coupé).

### Apps dans des dépôts séparés (branche `main`, Pages = main)
- **tarikh-ibn-khaldun** : `tarikh-cache-v1.1.0` (commit `8150d03`) — shell + `book-data.js` + CDN. Test 7/7.
- **mujam-al-buldan** : `mujam-cache-v1.0.0` (commit `715cae6`) — shell + 29 `data/*.json` + polices. Test 7/7.
- **al-adhkiya** : `adhkiya-cache-v1.0.0` (commit `f078161`) — shell + `all-adhkiya.js` + `audio/manifest.js`
  + `data/adhkiya.json` + polices ; audio (423 fichiers / 33 Mo) **à la demande**. Test 6/6.
- **livre-al-istibsar** (Next.js) : `scripts/gen-sw.mjs` + `postbuild` génère `out/sw.js`
  (`istibsar-cache-v1.0.0`, 62 fichiers) et injecte l'enregistrement dans les 18 HTML. gh-pages `ca93b50`, main `dec58a6`. Test 6/6.
- **quran-reader** : `quran-reader-v1.0.0` (commit `d81e79c`) — shell (app audio, données en ligne). Test 2/2.
- **quran-amp** : `quran-amp-v1.0.0` (commit `6827e68`) — shell + polices Amiri/VT323/Tajawal. Test 3/3.
- **api-job-finder** : `api-job-finder-v1.0.0` (commit `bf36f44`) — shell + polices Cinzel/Inter. Test 3/3.

### Sous-dossiers du dépôt `ucfzem.github.io` (Pages = `main`, servis sous `/nom/`)
- **droppy** : `droppy-v1.0.0` — SW **fusionné** : conservation du worker d'upload en arrière-plan
  (messages `UPLOAD_FILE`/`GET_RESULTS`/`GET_PENDING`) + ajout du precache/`fetch` hors-ligne
  (shell + `assets/avatar.png` + Tailwind + polices). Test 6/6. Enregistrement aussi ajouté à `get.html`.
- **webhealth** : `webhealth-v1.0.0` — 9 pages HTML + `css/style.css` + `js/i18n.js` + polices.
  Enregistrement injecté dans les 9 pages. Test 7/7.
- **email-collector** : `email-collector-v1.0.0` — shell + Tailwind + polices. Test 4/4.
- **childsgame** : `childsgame-v1.0.0` — shell + polices. Test 3/3.
- Commit unique : **`e217fb9`** « offline: add offline-first precache SW + registration to
  droppy, webhealth, email-collector, childsgame » (poussé sur `main`).

### Vérification en ligne (CDN Pages propagé)
- Les 7 `sw.js` répondent avec le bon nom de cache ; balise d'enregistrement `data-sw-reg` présente
  dans les pages live (`webhealth/*`, `email-collector/`, `childsgame/`, `quran-reader/`, `quran-amp/`,
  `api-job-finder/`, `droppy/get.html`).

### Rappels d'exécution
- Jeton PAT (`repo` + `admin:ssh_signing_key`, **pas** `workflow`) → déployer via `main`/`gh-pages`,
  jamais de push sous `.github/workflows/*`.
- Pushes volumineux : `git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push`.
- Tâches longues en avant-plan (les jobs d'arrière-plan sont tués).
- Lag CDN Pages ~1–3 min (poll avec `?cb=<random>`).

## Correctif « URL sans slash » + PWA installable (manifests)
### Problème racine
- Un SW à `/app/sw.js` a une portée maximale `/app/` : il ne peut **jamais** intercepter `/app`
  (URL nue, sans slash). Résultat hors-ligne sur URL nue = page dinosaure / `ERR_INTERNET_DISCONNECTED`.
  C'est le vrai échec observé sur Android (les utilisateurs tapent l'URL nue).
### SW racine (scope `/`) — commit `6ab76b3`
- Nouveau `ucfzem.github.io/sw.js` : allowlist `APPS` ; si `mode==='navigate'` + même-origine +
  chemin à un seul segment dans l'allowlist → renvoie un **HTML 200 synthétique**
  `<script>location.replace('<origine>/<slug>/')</script>` (aucun accès réseau).
  (`Response.redirect(302)` depuis le SW bloquait lors des tests → remplacé par la redirection JS.)
- Enregistrement `register('/sw.js')` (marqueur `data-root-sw`) injecté dans : homepage, works,
  droppy, webhealth (9 pages), email-collector, childsgame, quran-reader, quran-amp, api-job-finder,
  tarikh, al-tibb, mujam, al-adhkiya, istibsar. Commit **`e74764f`** (dépôt `ucfzem.github.io`).
### Manifests PWA + icônes
- **mujam-al-buldan** (`eb3e9d7`, `mujam-cache-v1.0.1`) et **al-adhkiya** (`0718b49`,
  `adhkiya-cache-v1.0.1`) : `manifest.json`, `icon.svg`, `icon-192.png`, `icon-512.png`,
  `<link rel="manifest">` + `data-root-sw` ; precache inclut manifest + icônes. Déployés `main` + `gh-pages`.
- **livre-al-istibsar** (Next.js, `588d8d7` main / gh-pages) : `public/manifest.webmanifest` + icônes ;
  `scripts/gen-sw.mjs` injecte `<link manifest>`, `theme-color` et le SW racine dans les 18 HTML ;
  `out/` reconstruit.
- **al-tibb** (`9cb8144`, `tibb-nabawi-v1.0.8`) et **tarikh** (`348e222`, `tarikh-cache-v1.1.1`) :
  ajout d'icônes **PNG 192/512** (maskable) au manifest + precache (SVG seul insuffisant pour l'install Android).
- Icônes générées via Playwright (rendu SVG → PNG plein cadre). Manifests live vérifiés via CDP
  `Page.getAppManifest` : **0 erreur**, `display:standalone`, 3 icônes.
### Vérification live
- URL nue **hors-ligne OK** : mujam (len 544148), al-adhkiya (26476), istibsar (989), tarikh, al-tibb.
  `curl` manifests + icônes = `200` pour toutes.

## tarikh-ibn-khaldun — performance de chargement (B+B)
### Cause mesurée
- `book-data.js` monolithique **16,2 Mo** (4,2 Mo gzip) chargé en `<script>` **bloquant** → page blanche
  ~10 s ; GitHub Pages sert à ~400 Ko/s. De plus, double téléchargement à la 1re visite
  (la page **et** le precache du SW).
### Correctif
- **Découpage** : 29 chunks JSON (~500 Ko, 1er = 146 Ko) dans `data/chunks/` + `data/manifest.json`
  (méta + liste). Champs inutilisés `path`/`level` supprimés → **16,2 → 14,1 Mo**.
- **Chargement non bloquant / incrémentiel** : `book-data.js` retiré du HTML ; le loader lit
  `data/manifest.json` puis télécharge les chunks **6 en parallèle** (pool, **ordre préservé**),
  affiche la 1re section dès le 1er chunk, puis complète en arrière-plan. Les chunks sont stockés
  côté page dans le cache `tarikh-data-v1.2.0` (API Cache) → hors-ligne garanti même avant contrôle SW.
- **SW** renommé `tarikh-data-v1.2.0` : precache **shell seul** (plus de `book-data.js`).
- **Typographie alignée sur al-tibb** : `.text-reading` 18px / `line-height:1.6` / `margin-bottom:1.25rem` ;
  colonne `main { max-width:800px; margin:auto }` ; police par défaut 18 (plage 14–28) ;
  h2 `text-2xl sm:text-3xl` + filet.
- **Résultat live** : plein chargement **35 s → 9,6 s**, 1er contenu **~10 s → ~3,2 s** ;
  recherche 498 résultats / 187 chapitres ; hors-ligne OK (nue + slash) ; 0 erreur console.
  Commits **`29a9155`**, **`af6b581`**.
- Note : `book-data.js` d'origine conservé (désormais non référencé) ; source
  `data/0808IbnKhaldun.Tarikh.mARkdown` restaurée après un écrasement accidentel du dossier `data/`.
- Exécution : le push volumineux a échoué une fois (« broken pipe ») puis a réussi avec
  `http.postBuffer=524288000` + `HTTP/1.1` et un délai long.

## Liens mis à jour
- Accueil : https://ucfzem.github.io/
- Tarikh (perf + typo) : https://ucfzem.github.io/tarikh-ibn-khaldun/
- Al-tibb : https://ucfzem.github.io/al-tibb-al-nabawi/
- Mujam : https://ucfzem.github.io/mujam-al-buldan/
- Al-adhkiya : https://ucfzem.github.io/al-adhkiya/
- Istibsar : https://ucfzem.github.io/livre-al-istibsar/
- Works : https://ucfzem.github.io/works/
- Quran-reader : https://ucfzem.github.io/quran-reader/ · Quran-amp : https://ucfzem.github.io/quran-amp/ · API Job Finder : https://ucfzem.github.io/api-job-finder/
- SW racine : https://ucfzem.github.io/sw.js

## tarikh — justification du texte robuste (correctif)
- Constat : le paragraphe portait la classe Tailwind `text-justify` ; l'alignement dépendait donc du
  chargement du CDN Tailwind. Si le CDN est lent/bloqué (fréquent en mobilité/hors-ligne), le texte
  retombait en alignement « start » (bords irréguliers). (Mesure live : tarikh=`justify`,
  al-tibb=`start`.)
- Correctif : alignement inscrit directement dans la feuille de style —
  `.text-reading { … text-align: justify; text-justify: inter-word; direction: rtl; }` ;
  classe `text-justify` retirée du `<p>`.
- Vérifié localement **avec le CDN Tailwind bloqué** → `text-align:justify`, `text-justify:inter-word`,
  `direction:rtl`. Commit **`abcc305`** (main + gh-pages).

## tarikh — vraie cause : lignes OpenITI non fusionnées (correctif définitif)
- Le problème n'était pas (seulement) le CSS : les données contenaient une entrée par **ligne
  physique du manuscrit** (~70–80 car.), chaque `<p>` = une seule ligne → `justify` ne peut étirer
  que les lignes de continuation, donc chaque ligne était une « dernière ligne » → bord droit irrégulier.
- Origine : mARkdown OpenITI utilise `### ` = titre de section, `# ` = **début de paragraphe**,
  `~~` = continuation de ligne (retour à la ligne), `PageV…P…` / `ms…` = balises de page en ligne.
  `book-data.js` avait éclaté chaque ligne en paragraphe distinct (marqueurs déjà retirés).
- Correctif : nouveau générateur `split_ik_md.py` qui **re-fusionne** depuis le markdown brut
  (`# ` démarre un paragraphe, `~~` continue avec un espace, `PageV`/`ms` supprimés), régénère
  `data/chunks/chunk-000..028.json` (29 chunks, **13,92 Mo**) + `data/manifest.json`.
  Résultat : **2991 sections** (titres identiques, 0 diff), paragraphes de **408 car. en médiane**
  (contre ~80), soit ~4,7 paragraphes réels par section.
- Cache bumpé `tarikh-data-v1.2.0` → **`v1.3.0`** (index.html `SW_CACHE` + sw.js `CACHE_NAME`) pour
  forcer le re-téléchargement des nouveaux chunks.
- Vérifié **live** (Chromium réel) : paragraphe le plus long = **1061 car.**,
  `text-align:justify / text-justify:inter-word / direction:rtl`,
  **9 lignes sur 10 remplissent toute la colonne** (seule la dernière est courte = normal).
  Commit **`2b9e474`** (main + gh-pages).
- Génération : `python3 /tmp/opencode/split_ik_md.py` (relit `data/0808IbnKhaldun.Tarikh.mARkdown`).

## tarikh — justification défensive pour WebView légers (Via Browser)
- Symptôme : sur Chrome le texte est justifié pleine largeur, mais sur **Via Browser** (WebView léger /
  moteur agressif) chaque ligne reste courte. Les WebView légers traitent parfois les sauts de ligne
  résiduels ou les espaces conservés comme des frontières de bloc → chaque ligne = « dernière ligne ».
- Vérifié : les chunks régénérés contiennent **0 caractère `\n`/`\r`** dans les paragraphes (fusion
  déjà faite).
- Correctif (défensif, sans risque) sur `.text-reading` : ajout de
  `white-space: normal; display: block; text-align-last: right;` en plus de
  `text-align: justify; text-justify: inter-word; direction: rtl;`. Aucun changement de cache
  (index.html servi en network-first).
- Commit **`918d68a`** (main + gh-pages).

## tarikh — test du pseudo-élément `::after` (Via/WebView) — REJETÉ (mesures)
- Workaround proposé : `p::after{content:"";display:inline-block;width:100%}` +
  `text-align-last: justify`. Testé dans **Chromium réel** (colonne 800px, paragraphe le plus long) :
  | Variante | lignes | hauteur para | largeur dernière ligne |
  |---|---|---|---|
  | actuel (`text-align-last:right`) | 10 | 288px | 49px |
  | `text-align-last:justify` | 10 | 288px | 49px |
  | `::after{width:100%}` | 10 | **317px** | 49px |
- Conclusions : le `::after{width:100%}` **ajoute une ligne vide ~29px sous chaque paragraphe**
  (pas de gain de justification) ; `text-align-last:justify` est **sans effet** car la dernière ligne
  n'a qu'un seul mot (word-spacing ne peut pas étirer à l'intérieur d'un mot).
- La dernière ligne courte est le **comportement typographique correct** (fin de paragraphe).
  La vraie cause du souci Via était les lignes non fusionnées (corrigé au niveau des données).
- Décision : conserver la version propre (toutes les lignes justifiées sauf la dernière) ;
  `::after` non déployé. Fix Via : vider le cache de Via (le SW sert l'HTML en network-first,
  mais Via cache agressivement).

## tarikh — essai `text-justify: distribute` puis REVERT (espacement extrême)
- Essai (commit **`b3f8410`**) : `text-justify: distribute; text-align-last: justify;`. Dans Chromium,
  `distribute` est résolu en **`inter-character`** → **toutes** les lignes deviennent pleines (10/10)
  MAIS la dernière ligne (un seul mot) est étirée sur **718px** via un espacement **entre caractères**
  → rendu anormal (« bizarre wide word-spacing »), rejeté.
- Correctif final (commit **`527514d`**) : retour au CSS propre —
  `.text-reading { display:block; white-space:normal; word-break:normal; overflow-wrap:break-word;
  text-align:justify; text-justify:inter-word; direction:rtl; line-height:1.6; margin-bottom:1.25rem; }`
  → `text-justify: inter-word`, dernière ligne naturelle (49px), 9/10 lignes pleines, hauteur 288px,
  aucun espacement forcé. Déployé main + gh-pages.

## tarikh — CSS inter-word définitif + assainissement défensif (commit `bf0f1bb`)
- `.text-reading` aligné sur la spéc. propre : `white-space: normal !important`,
  `text-align: justify !important`, `text-justify: inter-word !important`,
  `direction: rtl !important`, `word-break: normal`, `overflow-wrap: break-word`,
  `line-height: 1.8` (18px → 32,4px), `margin-bottom: 1.25rem`.
- `renderContent` : assainissement défensif
  `String(ps[i]).replace(/\r?\n|\r/g,' ').replace(/\s+/g,' ').trim()` (no-op aujourd'hui : les
  chunks ont 0 `\n`, mais prévient toute régression future / source non fusionnée).
- Vérifié localement : `justify / inter-word`, lh 32,4px, 9/10 lignes pleines, 0 erreur console.
- Note : la vraie garantie reste la fusion des lignes **à la source** (commit `2b9e474`) ; le CSS et
  le sanitize ne sont que des filets de sécurité. Déployé main + gh-pages.

## tarikh — réunification des paragraphes coupés en pleine phrase (commit `18ed031`)
- Constat mesuré : **42,3 %** des paragraphes (6011/14198) ne se terminaient pas par une ponctuation
  de fin (`. ؟ ! : ۔ … » ”`). L'édition OpenITI marque `#` = paragraphe, mais ces marqueurs coupent
  souvent la phrase (ex. `«…وملئوا»` puis `«أكناف الضواحي…»`). La fusion `~~` (v1.3.0) ne réglait que
  les retours à la ligne, pas ces coupures `#`.
- Correctif : `mergeParas(ps)` appliqué **au build** (dans `split_ik_md.py`) — colle le paragraphe
  suivant tant que le précédent ne finit pas par une ponctuation de fin, avec plafond 1500 car.
  (Choix build-time plutôt que runtime : données déjà fusionnées, hors-ligne correct, recherche
  cohérente, charge runtime nulle.)
- Résultat : paragraphes **14198 → 9030** (médiane 669 car., p90 1728), 29 chunks, 13,91 Mo.
  Exemple vérifié : `«…لعموم الدولتين صدر الإسلام [1] في الآفاق والممالك…»` continu.
- Cache bumpé `v1.3.0` → **`v1.3.1`** (`SW_CACHE` index.html + `CACHE_NAME` sw.js) ; pied de page
  `v1.3.1`. Vérifié localement : 15 paragraphes (section 1), 10/11 lignes pleines, 0 erreur.
- Risque connu : léger sur-mélange possible (ex. Basmala collée à la phrase suivante ; textes sans
  ponctuation → blocs jusqu'à ~1500 car.). Ajustable (regex/régler le plafond) si besoin.
- Déployé main + gh-pages.

## al-tibb — même correctif (fusion des lignes Shamela coupées) — commit `1eaaa85`
- Diagnostic : le source Shamela (`/tmp/tibb_pages.json`) met **chaque ligne imprimée dans son propre
  `<p>`**, d'où des coupures en pleine phrase (ex. ch-003 `«…يُضْعِفُهَا»` → `«وَقَالَ فِي آيَةِ الْحَجِّ…»`,
  ch-005 `«…تَفْعَلُ مَا لَا تفعل الأدوية»` → `«الْحِسِّيَّةُ…»`). 16 % des `<p>` (341/2091) ne finissaient
  pas par une ponctuation de fin.
- Correctif dans `build_tibb.py` : `merge_paras()` **au build** — on colle les lignes de corps dont la
  précédente n'a pas de ponctuation finale (`. ؟ ! : ۔ … » ”`), **en coupant sur les vrais titres**
  (classe `c4` ou `head_re` : فصل/باب/ذكر/… et lignes ≤95 car.), plafond 1500 car.
- Résultat : `<p>` **2091 → 2002** ; non-terminaux **341 → 251**, dont 176 = vrais titres (corrects),
  62 = dernière ligne de chapitre, 10 = vers de poésie (à garder tels quels), 3 = coupure à la frontière
  de chapitre (non fusionnée). Les coupures en pleine phrase **à l'intérieur** des chapitres sont recollées
  (vérifié en direct : `«…يُضْعِفُهَا وَقَالَ…»`). 131 chapitres inchangés. Cache SW `v1.0.8 → v1.0.9`.
- Hors-ligne : harnais **11/11** (141 entrées précachées) après correction de l'URL de police dans la
  config (il manquait `&family=Cairo:…`).
- Note : `mujam-al-buldan` n'a pas ce défaut (une seule entrée texte par entrée) ; `al-adhkiya` est
  structuré en `stories`, pas en prose découpée.
- Déployé main + gh-pages.

## État global de la coupure « en pleine phrase » par livre
- **tarikh-ibn-khaldun** : corrigé (`mergeParas`, v1.3.1). ✅
- **al-tibb-al-nabawi** : corrigé (heading-aware, v1.0.9). ✅
- **mujam-al-buldan** : non concerné (entrées en bloc unique).
- **al-adhkiya** : structure stories, pas de lignes coupées.
- **Nuzhat al-Mushtaq** : application/ivre **introuvable** dans les dépôts locaux — à confirmer
  (nouveau livre à ajouter ? fournir la source).

## Correction de la ligne précédente : **mujam-al-buldan EST concerné**
- Vérification fine : **10 066 / 12 292 entrées** contenaient des `\n` et **76 %** des lignes ne se
  terminaient pas par une ponctuation → coupures en pleine phrase (ex. `«…موضع بين الأجفر وفيد، على\nخمسة
  أميال من الأجفر…»`). L'appli rend en `white-space: pre-line; text-align: justify` → justification cassée.
- Correctif dans `tools/build_data.mjs` (`cleanLines`) : fusion au build (colle tant que pas de ponctuation
  finale, plafond 1500). Résultat : **100 038 → 26 121 paragraphes**, non-terminaux **76 % → 10 %**.
  Commit `52c0096`, cache `v1.0.2`. Vérifié en direct (`«…وفيد، على خمسة أميال…»` recollé).
- **al-adhkiya** : confirmé non concerné (le parseur `parse_adhkiya.mjs` fait déjà `.replace(/~~/g,' ')` ;
  aucune entrée n'a de `\n`).
- **istibsar** : aussi concerné (Shamela `\n`) — voir ci-dessous.

## istibsar — fusion des lignes + rebuild (commit `183305c` / deploy `195bfa6`)
- `lib/book-texts.js` : 811 → 630 lignes (non-terminaux 259 → 17) via `scripts/merge-texts.mjs`
  (titres `[...]` et vers contenant `...` préservés). Rebuild Next avec `GITHUB_PAGES=true` (basePath
  `/livre-al-istibsar`), redeploy `out/` sur `gh-pages`. SW `v1.0.1 → v1.0.2`.

## Offline complet après **une seule** visite en ligne (todo « go for the rest »)
- Principe : un SW ne s'installe qu'avec **une visite réseau** ; impossible de démarrer à froid hors-ligne
  sans l'avoir visité en ligne une fois (ou installé comme PWA depuis le navigateur).
- tarikh précachait seulement le shell → chunks en cache *à la demande* : offline partiel. Correctif :
  le SW lit `data/manifest.json` et **précache les 29 chunks à l'install**. Cf. commit `e38245d`, cache
  `v1.3.2`.
- Les installs mettaient tout en `Promise.all` (29 à 131 fetch parallèles) → échecs partiels sous
  charge (vérifié : échecs `fetch failed` en Node). Ajout d'un `precacheAll(cache, urls, 4)` **throttlé
  + retry** dans tarikh, al-tibb (131 chapitres), mujam (29 fichiers) et istibsar (67 fichiers). Puis
  `cacheCdn()` (retry x3) pour les polices/tailwind CDN (tarikh, al-tibb, mujam ; istibsar auto-héberge
  ses polices).
- Harnais offline **au vert** : tarikh 38 entrées / 12-12, al-tibb 141 / 11-11, mujam 36 / 7-7,
  istibsar 67 / 6-6. Versions SW live : `tarikh-data-v1.3.2`, `tibb-nabawi-v1.1.0`, `mujam-cache-v1.0.3`,
  `istibsar-cache-v1.0.2`.
- `al-adhkiya` : SW précache déjà tout à l'install (pas de données volumineuses).

## Nuzhat al-Mushtaq (`ucfzem/nuzhat-al-mushtaq`) — fusion + offline (nouveau)
- Source retrouvée : dépôt GitHub `ucfzem/nuzhat-al-mushtaq` (branche `main`, Pages à la racine `/`,
  également miroité sur `https://nuzhat-al-mushtaq.vercel.app/`). Données dans `all-regions.js`
  (`IDRISI_META` + `allRegionsData`, 7 أقاليم × 10 أجزاء).
- Défaut confirmé : le rendu fait `part.fullText.split('\n')` → **3511 lignes**, dont **744 (21 %)**
  sans ponctuation finale ⇒ mêmes coupures en pleine phrase. De plus l'app n'avait **aucun**
  `text-align: justify`.
- Correctif build : `tools/merge-regions.mjs` (fusion *heading-aware* ; les titres `[الجزء …]` et
  `الجزء|الإقليم|المجلد …` restent des paragraphes à part ; cap 4000). `fullText` passe de
  **3511 → 2846 paragraphes** ; il ne reste qu'1 fragment final sans ponctuation (fin de partie).
- PWA/offline ajouté : `sw.js` (`nuzhat-cache-v1.1.0`, `precacheAll` + `cacheCdn`), `site.webmanifest`,
  `icon.svg` + `icon-192/512.png` (générés sans ImageMagick via `gen_nuzhat_icons.mjs`). Enregistrement
  de `./sw.js` **et** `/sw.js` (SW racine) dans `index.html`.
- Ajout de `text-align: justify` sur `.card p` (absent à l'origine).
- Intégration collection : slug `nuzhat-al-mushtaq` ajouté à l'allowlist `APPS` de `ucfzem.github.io/sw.js` ;
  la page `works/` pointe désormais vers `https://ucfzem.github.io/nuzhat-al-mushtaq/`.
- Vérifs : données servies **byte-identiques** (sha256 local = servi), harnais offline **8/8 réseau coupé**,
  navigateur live : 2 SW actifs (`/nuzhat-al-mushtaq/` + racine `/`), 1er paragraphe = 4 lignes dont
  **3 pleines (711px)** + dernière ligne courte, 0 erreur JS.
- Commits : `db1a7a6` (fusion + PWA), `c12f90f` (justify + v1.1.0) ; racine `7995c3c` (works + APPS).

