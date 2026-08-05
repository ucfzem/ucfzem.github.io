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
