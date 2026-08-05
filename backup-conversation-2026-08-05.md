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
