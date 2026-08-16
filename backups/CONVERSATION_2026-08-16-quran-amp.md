# Backup conversation — Intégration « Quran Amp » dans le portail Works

> **Date :** 16 août 2026
> **Résumé :** ajout du projet « Quran Amp » (lecteur Coran rétro Winamp) dans la section déverrouillée de `ucfzem.github.io/works`, en 3ᵉ position, juste après « Quran Reader ».
> **Note sécurité :** aucun token stocké ni commité.

---

## Déroulé de la session

1. **Demande initiale :** intégrer un projet Coran & Tafsir dans `https://ucfzem.github.io/works`, section « Applications ouvertes / déverrouillées » uniquement, en 3ᵉ position après « quran-reader », icône 📖, sans toucher aux 26 sites existants ni à la section « Applications verrouillées ». Sauvegarde de la conversation en Markdown + partage des liens de validation.
2. **Recherche du projet :** aucun repo `quran-amp` n'existait ; le projet devait être fourni par l'utilisateur.
3. **Réception du code :** version « Winamp Quran Player - Gold Edition » (index.html autonome), puis **version finale optimisée** (auto-scroll texte + playlist, AudioContext résumé au Play, canvas explicite, ticker inline-block, `scrollTop=0` au changement de verset).
4. **Vérifications techniques :**
   - `api.alquran.cloud/v1/surah` → 200 (114 sourates).
   - Éditions arabe+français → 200 (7/7 versets pour la Fatiha).
   - Audio `everyayah.com` : **9/10 récitateurs OK**, 1 en échec.
   - **Bug corrigé :** `Saood_Ash-Shuraym_128kbps` → 404. Chemin correct trouvé : `Saood bin Ibraaheem Ash-Shuraym_128kbps` (vérifié 200).
   - CORS `access-control-allow-origin: *` présent (nécessaire au spectre).
5. **Modification du portail (`works/index.html`)** — uniquement 4 lignes ciblées :
   - `publicProjects` : carte `{ num: 3, emoji: "📖", name: "Quran Amp", tag: "Quran", url: "https://ucfzem.github.io/quran-amp/", newTab: true }` insérée après Quran Reader ; numéros suivants décalés (Tanger 3→4 … SavoirsEnJouant 14→15).
   - Sous-titre « 14 projets publics » → « 15 projets publics ».
   - JSON-LD : position 3 ajoutée, positions 3–17 décalées en 4–18.
   - Meta description enrichie (« Quran Amp »).
   - Section verrouillée : **intacte** (9 dossiers / 39 cartes).
6. **Vérification jsdom :** 15 cartes rendues dans le bon ordre ; carte 3 = Quran Amp (📖, tag Quran, href correct).
7. **Déploiement :**
   - Repo `ucfzem/quran-amp` créé (main) → GitHub Pages `https://ucfzem.github.io/quran-amp/`.
   - Push `works/index.html` sur `ucfzem/ucfzem.github.io` → Pages auto → `https://ucfzem.github.io/works/`.
8. **Backup :** ce fichier + `github.md` dans le repo `quran-amp`.

## Fichiers

| Fichier | Emplacement |
|---|---|
| `index.html` (lecteur) | repo `ucfzem/quran-amp` |
| `README.md` | repo `ucfzem/quran-amp` |
| `github.md` | repo `ucfzem/quran-amp` |
| `works/index.html` (modifié) | repo `ucfzem/ucfzem.github.io` |
| Ce backup | `backups/CONVERSATION_2026-08-16-quran-amp.md` |

## Liens de validation

- Projet : https://ucfzem.github.io/quran-amp/
- Portail (position 3) : https://ucfzem.github.io/works/
- Repo projet : https://github.com/ucfzem/quran-amp
- Source portail : https://github.com/ucfzem/ucfzem.github.io/blob/main/works/index.html
