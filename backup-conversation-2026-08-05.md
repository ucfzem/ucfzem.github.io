# Backup Conversation — Session GIMI (2026-08-05)

## Contexte
Projet : outils SaaS pour petites structures scolaires au Maroc (crèches, jardins d'enfants, écoles coraniques, cours de soutien, 20–80 enfants).

Positionnement marché : concurrents (SchoolApp, E-Schools, Minassa, Skoolly, DataSchool) visent les écoles 100+ élèves à 8 000–40 000 DH/an. Le vide = petites structures. Adversaire réel : Excel/Word et modèles Canva/PDF. Proposition : bulletin simple, bilingue FR/AR (RTL), mobile-first, ~100 DH sans engagement, + fonctionnalité inédite de vote/scrutin.

## Ce qui a été fait

### 1. Création des 2 repositories publics (compte `ucfzem`)
- `ucfzem/bulletin-scolaire` — Générateur de bulletins scolaires bilingue (FR/AR)
- `ucfzem/scrutin-pro` — Système de vote et dépouillement en direct
- GitHub Pages activés sur la branche `main`, dossier root.

### 2. Code des outils (version GIMI fournie par l'utilisateur)
- **bulletin-scolaire/index.html** (22 172 octets) :
  - Logo upload, infos élève (nom, classe, matricule), matières avec coef, calcul auto moyenne + mention + appréciation, semestres, observations, signatures parents/directeur, bilingue FR/AR (RTL), sauvegarde localStorage, export PDF/print.
  - Signature : « Outil développé par GIMI - Tanger ».
- **scrutin-pro/index.html** (25 327 octets) :
  - Procès-verbal de dépouillement, titre d'élection, établissement, date, inscrits, votes exprimés, blancs/nuls, participation %, candidats +/-, badges vainqueur, tableau des résultats avec % et barres de progression, signatures bureau de vote (print), bilingue FR/AR, sauvegarde localStorage.
  - Signature : « Outil développé par GIMI - Tanger ».

### 3. Mise à jour de la page /works
- Catégorie ajoutée : **« Outils Pros »** (badge 2) dans la section Projets verrouillés.
- 2 cartes :
  - 📊 Bulletin Scolaire Pro — Nouveau — 100 DHS — https://ucfzem.github.io/bulletin-scolaire
  - 🗳️ Scrutin Pro — Nouveau — 150 DHS — https://ucfzem.github.io/scrutin-pro
- Classes CSS identiques aux autres cartes (`.card`, `.card-info`, `.card-tag`, couleurs gold/beige).

## Liens finaux
- Bulletin : https://ucfzem.github.io/bulletin-scolaire
- Scrutin : https://ucfzem.github.io/scrutin-pro
- Page Works : https://ucfzem.github.io/works
- Repo bulletin-scolaire : https://github.com/ucfzem/bulletin-scolaire
- Repo scrutin-pro : https://github.com/ucfzem/scrutin-pro

## Notes de sécurité
- Token GitHub classique (`ghp_...`) fourni dans la session. Il est recommandé de le révoquer après usage (Settings → Developer settings → Tokens).
