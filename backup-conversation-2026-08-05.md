# Backup Conversation — Session UcfZem (2026-08-05)

## Contexte
Projet : outils SaaS pour petites structures scolaires au Maroc (crèches, jardins d'enfants, écoles coraniques, cours de soutien, 20–80 enfants).

Positionnement marché : concurrents (SchoolApp, E-Schools, Minassa, Skoolly, DataSchool) visent les écoles 100+ élèves à 8 000–40 000 DH/an. Le vide = petites structures. Adversaire réel : Excel/Word et modèles Canva/PDF. Proposition : bulletin simple, bilingue FR/AR (RTL), mobile-first, ~100 DH sans engagement, + fonctionnalité inédite de vote/scrutin.

## Ce qui a été fait

### 1. Création des 2 repositories publics (compte `ucfzem`)
- `ucfzem/bulletin-scolaire` — Générateur de bulletins scolaires bilingue (FR/AR)
- `ucfzem/scrutin-pro` — Système de vote et dépouillement en direct
- GitHub Pages activés sur la branche `main`, dossier root.

### 2. Code des outils (version UcfZem fournie par l'utilisateur)
- **bulletin-scolaire/index.html** (22 172 octets) :
  - Logo upload, infos élève (nom, classe, matricule), matières avec coef, calcul auto moyenne + mention + appréciation, semestres, observations, signatures parents/directeur, bilingue FR/AR (RTL), sauvegarde localStorage, export PDF/print.
  - Signature : « Outil développé par UcfZem - Tanger ».
- **scrutin-pro/index.html** (25 327 octets) :
  - Procès-verbal de dépouillement, titre d'élection, établissement, date, inscrits, votes exprimés, blancs/nuls, participation %, candidats +/-, badges vainqueur, tableau des résultats avec % et barres de progression, signatures bureau de vote (print), bilingue FR/AR, sauvegarde localStorage.
  - Signature : « Outil développé par UcfZem - Tanger ».

### 3. Mise à jour de la page /works
- Catégorie ajoutée : **« Outils Pros »** (badge 2) dans la section Projets verrouillés.
- 2 cartes :
  - 📊 Bulletin Scolaire Pro — Nouveau — https://ucfzem.github.io/bulletin-scolaire
  - 🗳️ Scrutin Pro — Nouveau — https://ucfzem.github.io/scrutin-pro
- Classes CSS identiques aux autres cartes (`.card`, `.card-info`, `.card-tag`, couleurs gold/beige).
- Prix retirés des cartes (demande utilisateur).

### 4. Adaptations demandées
- **Responsive mobile** : media queries `<640px` (grilles 2 col., tableaux scrollables) ajoutées sur les 2 outils.
- **Bulletin v3 (version utilisateur)** — déployée : dark mode (toggle 🌓 + localStorage `bulletin_theme`), police adaptative selon écran (jusqu'à 4K), tableau scrollable min 600px, signatures 1 colonne <500px, accessibilité (focus visible, aria-label, clavier), RTL complet, logo mémorisé, appréciation bilingue. Commit `ee4cdcc`.
- **Vercel** : token `vcp_...` fourni par l'utilisateur (compte `ucfzem`, plan Hobby, email azer.tyu199p@gmail.com), CLI 58.7.0. **Les 2 outils sont déployés et en ligne** :
  - Bulletin : https://bulletin-scolaire.vercel.app (alias automatique)
  - Scrutin : https://scrutin-pro.vercel.app (alias automatique)

### 5. Qualité d'impression (Solution 1)
- Tableaux à l'impression : `overflow: visible`, `white-space: nowrap` sauf 1ère colonne (matière/candidat), police 11px, padding 4px 6px, `min-width: 0`. Appliqué aux 2 outils (media print).

### 6. Export PDF direct
- **html2pdf.js** intégré aux 2 outils → bouton **« Télécharger PDF »** génère le PDF et le télécharge directement (sans aperçu d'impression).
- Capture forcée en mode clair, tableaux sans scrollbar, A4 portrait, section émargement incluse sur le scrutin.
- `window.print()` conservé pour l'aperçu système.

### 7. Internationalisation
- Footer traduisible FR/AR : « Outil développé par UcfZem - Tanger » / « أداة مطورة من طرف UcfZem - طنجة » (clé `footer`, id `footer-text`). Les champs élève/établissement restent des données saisies par l'utilisateur.
- **Correctifs RTL** : `overflow-x: hidden` sur body/container, tableaux dans les limites, alignement header/statistiques correct en arabe.

### 8. Année scolaire
- Valeur par défaut : **2026-2027** (champ éditable).

### 9. Restructuration bulletin (header + toolbar)
- Toolbar réorganisé : `.actions-main` (grille `repeat(auto-fit, minmax(140px,1fr))` = boutons de largeur égale) + `.actions-utility` (langue + thème séparés).
- Header centré : `.header-content` (colonne centrée) — logo, titre `.school-title` centré, `.meta-info` (semestre | année) dessous. Anciens `.header`/`.school-info`/`.meta-row` supprimés.

### 10. Fix PDF vide (bug critique)
- **Problème** : PDF téléchargé quasi vide (3.0 ko). Cause : clone placé hors-écran (`left:-9999px`) dans un `body` flexbox → html2canvas ne le capture pas.
- **Fix** : capture de l'élément **en place** (`.report-card` / `.card`) avec largeur forcée `210mm`, classe temporaire **`.pdf-mode`** sur body (tableaux `overflow:visible`, inputs sans bordure, boutons masqués, section émargement affichée sur scrutin), thème light forcé, puis restauration. Commits GH : `9bca130` (bulletin), `6a6566c` (scrutin).
- À tester par l'utilisateur (pas de navigateur headless disponible pour valider le rendu PDF).

### 11. Fix responsive + PDF (session finale)
- **Tableau coupé sur mobile** : suppression du scroll horizontal (ancien `min-width:600px` bulletin / `380px` scrutin). Colonnes compactées, `table { min-width: 0 }` à tous les écrans ; au scrutin la colonne « Répartition » (barres visuelles) est masquée <640px. Le nom des matières s'affiche en entier.
- **Texte coupé dans le PDF** : `html2canvas.windowWidth` = largeur réelle de la carte (`captureWidth`) pour capturer les 210mm complets sans tronquer les colonnes. Appliqué aux 2 outils. Commits GH : `6829444` (bulletin), `f38ae2a` (scrutin).
- **Caractères arabes détachés/inversés dans le PDF** (Disjoined Arabic) : html2canvas/jsPDF n'assemble pas les ligatures arabes ni le RTL. Fix = capture en mode RTL forcé + police arabe **Tajawal** injectée dans la capture `.pdf-mode` (`html[dir="rtl"] body.pdf-mode { direction: rtl; text-align: right }`, `font-family: 'Poppins','Tajawal'`). Tajawal ajouté au `<head>` du scrutin. La solution native fiable reste le bouton « Imprimer / PV PDF » (`window.print()`), le moteur du navigateur gère l'arabe parfaitement.
- **Double téléchargement** : garde anti-doublon sur le bouton (« Télécharger PDF ») — `if (btn.disabled) return; btn.disabled = true` + opacité 0.6, réactivé après `.save()`. Un seul appel `.save()`, `e.preventDefault()` non requis (pas de `<form>`).
- Commits GH : `9ed3da7` (bulletin), `92680a3` (scrutin).

### 12. Fix i18n / RTL / troncature (session locale)
- **Header « ACTION »** → clé `thAction` ajoutée aux 2 outils : FR « Action » / AR « إجراء » (`id="th-action"`).
- **Boutons PDF arabisés** : bulletin `طباعة / PDF`→« طباعة المستند », `تحميل PDF`→« تحميل المستند » ; scrutin « طباعة المحضر » / « تحميل المحضر ». (FR inchangé.)
- **Bouton langue** : déjà correct (affiche la langue de destination — « العربية » en FR, « Français » en AR).
- **Démo localisée (`fillDemo`)** : en mode arabe, champs arabes — bulletin : « مدرسة عبد الكريم » / « ياسين المنصوري » / « السنة الثالثة إعدادي » ; scrutin : « انتخاب المكتب الطلابي » / « المعهد العالي للتسيير ». FR inchangé.
- **Troncature noms de matières (الرياضيات→الريا)** : pas de `substring()` dans le code — c'était la colonne matière trop étroite. Fix CSS : colonnes numériques réduites (70/60/70/50px), `th:first-child, td:first-child { min-width: 45%; white-space: normal; }`, `td:first-child input { box-sizing:border-box; text-overflow:clip }`, `table-layout:auto`, `min-width` tableau 600→480px. Même règle `min-width:45%` sur la colonne Candidat du scrutin.
- Commits GH : `36362dd` (bulletin), `5e4cc50` (scrutin).

## Liens finaux
- **Bulletin (Vercel)** : https://bulletin-scolaire.vercel.app
- **Scrutin (Vercel)** : https://scrutin-pro.vercel.app
- Bulletin (GitHub Pages) : https://ucfzem.github.io/bulletin-scolaire
- Scrutin (GitHub Pages) : https://ucfzem.github.io/scrutin-pro
- Page Works : https://ucfzem.github.io/works
- Repo bulletin-scolaire : https://github.com/ucfzem/bulletin-scolaire
- Repo scrutin-pro : https://github.com/ucfzem/scrutin-pro
- Dashboard Vercel : https://vercel.com/ucfzem-s-projects

## Notes de sécurité
- Token GitHub classique (`ghp_...`) fourni dans la session. Il est recommandé de le révoquer après usage (Settings → Developer settings → Tokens).
- Token Vercel (`vcp_...`) fourni dans la session. Révocable via https://vercel.com/account/tokens.
