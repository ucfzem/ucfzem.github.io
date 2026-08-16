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
   - Vercel : `https://quran-amp.vercel.app/` (projet `ucfzem-s-projects/quran-amp`).
    - Cloudflare Workers : `https://quran-amp.azer-tyu199p.workers.dev/` (Version ID `17661281-8339-469b-a3cd-cb20098f60d1`, puis `8aa4cc32-e069-490e-b9d0-0bdec5b4b610` après la mise à jour TV Gold).
    - Push `works/index.html` sur `ucfzem/ucfzem.github.io` → Pages auto → `https://ucfzem.github.io/works/`.
8. **Vérification finale :** les 4 URLs (3 plateformes + portail) → HTTP 200. Ordre live du portail vérifié : 3 = Quran Amp, juste sous Quran Reader. Section verrouillée intacte (9 dossiers / 39 cartes).
9. **Backup :** ce fichier + `github.md` dans le repo `quran-amp`.
10. **Mise à jour « TV Gold Edition » (suite de session) :** l'utilisateur a fourni une version optimisée Smart TV et demandé 3 correctifs pour anciens téléviseurs (webOS legacy, NetCast, Tizen 2.x, Android TV) :
    - **Fix 1 — Contrôleur D-Pad global** dans `setupTVNavigation()` : `keydown` sur `window` → `Enter`/`13`/`VK_ENTER`/`Select` déclenche `active.click()` ; flèches gauche/droite sur `input[type=range]` = seek/volume ±5 + `Event('input')` ; scroll `textContainer` ±60px.
    - **Fix 2 — `<select>` agrandi** : `height: 52px`, `font-size: 18px`, `padding: 8px 16px`, `background-color: var(--panel-bg)`, `color: var(--text-main)`.
    - **Fix 3 — Typographie 10 ft** : `.ar-text` `clamp(32px,4vw,44px)` + `line-height:1.8`, `.fr-text` `clamp(18px,2vw,24px)`, `.playlist-item` `padding:14px 16px`/`18px`, `.btn-winamp` `height:56px`/`font-size:20px`.
    - Déploiement v2 : commit `f7ea366`, `worker.js` régénéré (25 031 o), push GitHub (Pages + Vercel auto), `wrangler deploy` → **Version ID `8aa4cc32-e069-490e-b9d0-0bdec5b4b610`**.
    - Vérifié : les 3 plateformes servent 23 796 o, titre « TV Gold Edition », D-Pad controller + clamp présents, Shuraim corrigé. Portail inchangé (3ᵉ position intacte).
11. **Correction 3 bugs TV (fin de session) :** l'utilisateur a fourni une version complète corrigée (pattern modal sombre = app Walkman) :
    - **Bug 1 — Playlist sans navigation télécommande :** ajout d'un listener `keydown` sur `#playlist` (Up/Down + `keyCode` 38/40) déplaçant le focus item par item avec `scrollIntoView` ; fonction `normalizeDirection(e)` normalise `e.key` + `keyCode` (38/40/37/39/13/32/27/10009/461=Back) pour anciens firmwares.
    - **Bug 2 — Popup récitateur blanc :** conversion du `<select>` natif en picker modal sombre personnalisé (`.reciter-trigger` + overlay + `<li>`), le `<select id="reciter-select">` caché (`display:none`) garde l'état/valeur (`reciterSelect.value` + `change` inchangés via `selectReciter()`).
    - **Bug 3 — Focus RTL « derrière » le panneau :** résolu par le picker DOM sous notre contrôle (Up/Down/Enter/Back gérés en JS) ; le handler global D-Pad s'efface si le modal est ouvert ou si le focus est sur `.reciter-item`/`.playlist-item`.
    - Déploiement v3 : commit `828aef7`, `worker.js` régénéré (34 996 o), push GitHub (Pages + Vercel auto), `wrangler deploy` → **Version ID `e1cc620c-cf2c-4110-ab7a-0b6e40075d7d`**.
    - Vérifié : les 3 plateformes servent 33 253 o avec toutes les briques (normalizeDirection, reciter-trigger, select caché, Shuraim). Portail inchangé.
12. **Version v4 « TV Gold » (fin de session) :** nouvelle version complète fournie par l'utilisateur (3 points d'après l'écran TV) :
    - **Playlist auto-scroll :** `focus` → `scrollIntoView({ block: 'nearest', behavior: 'smooth' })` sur chaque item ; D-Pad Up/Down (flèche + 38/40) avec scroll et débordement vers `reciterBtn` (haut) / `textContainer` (bas).
    - **Texte :** couche de traduction française **supprimée** (choix utilisateur, fetch `quran-uthmani` seul), `.ar-text` réduit à `clamp(20px, 2.8vw, 30px)`.
    - **Boutons transport :** icônes **SVG vectorielles** remplaçant les caractères ASCII, finition or métallique (`fill: var(--accent)`, bevels, focus → `#fff` + `scale(1.1)`, actif → `translateY(2px)`).
    - **Correctif ré-appliqué :** le `RECITERS` de l'utilisateur réintroduisait le chemin 404 `Saood_Ash-Shuraym_128kbps` → re-corrigé en `Saood bin Ibraaheem Ash-Shuraym_128kbps` (HTTP 200 vérifié).
    - Déploiement v4 : commit `d5f18fb`, `worker.js` régénéré (31 860 o), push GitHub (Pages + Vercel auto), `wrangler deploy` → **Version ID `8ee8a327-435f-4e7b-9d14-f8fa3d636c54`**.
    - Vérifié : les 3 plateformes servent 30 348 o (titre TV Gold, clamp arabe, SVG, Shuraim ; chemin cassé absent). Portail inchangé.

13. **Version v5 — UI entièrement en arabe + 5 corrections, puis fix Basmalah (fin de session) :** nouvelle version complète fournie par l'utilisateur (`lang="ar"` `dir="rtl"`), avec 5 corrections TV :
    - **Boutons transport** redimensionnés (cercles 42px, Lecture 50px) — SVG conservées.
    - **Numéros de verset retirés** de l'affichage et du titre LCD.
    - **Noms arabes des récitateurs + liste étendue à 14** : 4 ajouts dont le chemin de l'utilisateur `Kahlid_Al-Qahtanee_128kbps` était **404** → corrigé en `Khaalid_Abdullaah_al-Qahtaanee_192kbps` (trouvé dans le listing `everyayah.com/data/`, 200). **14 chemins vérifiés HTTP 200**, Shuraim déjà correct.
    - **Visualiseur interactif** : canvas focusable, clic/OK bascule `vizMode` (0 barres / 1 onde / 2 ligne oscillante).
    - **Barre de progression fluide** sur toute la sourate : `((currentAyahIndex + currentAyahProgress) / totalAyahs) * 100`, `step="0.1"`.
    - **Fix Basmalah en double** : l'API `quran-uthmani` embarque déjà la Basmalah dans le verset 1 → `playAyah()` la retire (`replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')`) puis la préfixe stylisée (sauf Sourates 1 et 9).
    - Déploiement v5 : commits `0c1eca2` (v5) puis `1fbca3c` (Basmalah), `worker.js` régénéré (32 148 o), push GitHub (Pages + Vercel auto), `wrangler deploy` → **Version ID `1a3b988e-41c0-4f44-911d-4046bafbc10c`**.
    - Vérifié : CF 200 (strip Basmalah présent), Vercel 200 + fix, Pages 200 + fix, portail 200.

14. **Version v6 — finale (fin de session) :** nouvelle version complète fournie par l'utilisateur :
    - **Texte affiché tel quel** : `playAyah()` affiche `ayahAr.text` sans transformation (plus de retrait/préfixe Basmalah). Vérifié côté API `quran-uthmani` : la Basmalah est embarquée dans le verset 1 (ex. Sourate 2 `بِسْمِ ٱللَّهِ ... الٓمٓ`), Sourate 1 = Basmalah seule, Sourate 9 sans → aucune duplication visuelle. La Basmalah **audio** reste en intro (sauf 1 et 9).
    - **Garde de la barre de progression** : dans `seekBar` `input`, `if (isBasmalahPlaying) { isBasmalahPlaying = false; }` pour éviter un saut audio si l'utilisateur déplace la barre pendant la Basmalah ; le seek sur toute la sourate est conservé.
    - Déploiement v6 : commit `7b95eef`, `worker.js` régénéré (30 987 o), push GitHub (Pages + Vercel auto), `wrangler deploy` → **Version ID `cf5aa498-40c2-429e-a09b-cfd49d610a84`**.
    - Vérifié : CF 200 (tel quel + garde présents), Vercel 200 + v6, Pages 200 + v6, portail 200. Les 14 chemins de récitateurs re-vérifiés HTTP 200.

## Fichiers

| Fichier | Emplacement |
|---|---|
| `index.html` (lecteur) | repo `ucfzem/quran-amp` |
| `README.md` | repo `ucfzem/quran-amp` |
| `github.md` | repo `ucfzem/quran-amp` |
| `worker.js` + `wrangler.toml` | repo `ucfzem/quran-amp` |
| `works/index.html` (modifié) | repo `ucfzem/ucfzem.github.io` |
| Ce backup | `backups/CONVERSATION_2026-08-16-quran-amp.md` |

## Liens de validation (HTTP 200)

- Projet (GitHub Pages) : https://ucfzem.github.io/quran-amp/
- Projet (Vercel) : https://quran-amp.vercel.app/
- Projet (Cloudflare) : https://quran-amp.azer-tyu199p.workers.dev/ (Versions : `17661281` → `8aa4cc32` → `e1cc620c` → `8ee8a327-435f-4e7b-9d14-f8fa3d636c54` → `1a3b988e-41c0-4f44-911d-4046bafbc10c` → `cf5aa498-40c2-429e-a09b-cfd49d610a84`)
- Portail (position 3) : https://ucfzem.github.io/works/
- Repo projet : https://github.com/ucfzem/quran-amp
- Source portail : https://github.com/ucfzem/ucfzem.github.io/blob/main/works/index.html
