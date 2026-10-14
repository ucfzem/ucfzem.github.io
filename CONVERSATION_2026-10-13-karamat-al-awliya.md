# Conversation backup — 2026-10-13 — كرامات الأولياء (addendum 19)

## Summary
Ajout d'une nouvelle PWA livre (offline-first) à l'arbre de liens
(`ucfzem.github.io/works`, section **publique / déverrouillée**), dans le dossier
**Maktaba · المكتبة**, plus son icône, et intégration au service worker racine.
Rien d'existant n'a été modifié de façon destructive (aucun force-push, aucun `rm`).

## Nouvelle webapp
| App | Repo | Live URL | Deploy |
|-----|------|----------|--------|
| سياق كرامات الأولياء (Karamat al-Awliya) | ucfzem/karamat-al-awliya | https://ucfzem.github.io/karamat-al-awliya/ | main / |

- Manuscrit : **الإمام أبو القاسم اللالكائي (ت 418 هـ)** — « سياق كرامات الأولياء » من *شرح أصول اعتقاد أهل السنة والجماعة*.
- Structure demandée : `index.html`, `data.json`, `sw.js`, `manifest.json` (+ `icon.svg`, `icon-192.png`, `icon-512.png`, `tools/make_icons.py`).
- Recherche (titre / texte / isnad / narrateur / **رقم الأثر**), filtres dynamiques (*الفئة* + *الموطن/العصر*), partage/copie avec référence, thème clair/sombre, favoris.
- Cache SW `karamat-cache-v1.0.0`, scopé `karamat-` (pas de collision entre apps).

## Authenticité des données
- 5 récits authentiques fournis, intégrés verbatim (`verified: true`).
- 5 entrées d'épisodes connus, marquées `verified: false` + badge « بانتظار التوثيق », sans `source_num` — **aucune chaîne de transmission inventée**.
- Corpus complet (250+) **non inclus** ; `data.json` prêt pour l'import depuis la source.

## Arbre de liens (`works/index.html`)
- `maktaba` passe de **10 → 11** entrées ; كرامات الأولياء ajouté en fin de dossier Maktaba.
- Icône : `https://ucfzem.github.io/karamat-al-awliya/icon.svg`.
- Dossier Maktaba = section **publique/déverrouillée** (`#f-maktaba` dans `#publicProjects`), ouvert par défaut.

## Offline (SW)
- `works/sw.js` : `CACHE` `v1.0.3 → v1.0.4`, icône karamat ajoutée à `CORE`.
- Root `sw.js` : `SHELLS += karamat-al-awliya`, `APPS += karamat-al-awliya`, `DATA_MARKER` `v4 → v5` (re-prefetch, inclut `data.json`), polices karamat ajoutées à `CDN`.

## Vérification (Playwright, live)
- /works : `maktabaInPublic: true`, dossier ouvert, 11 cartes, carte `كرامات الأولياء` trouvée, icône OK, absente de la section verrouillée.
- App en ligne : SW actif (scopes works / root / app), 10 cartes, `سارية`→1, filtre `التابعون`→3, `2235`→1, thème light↔dark, favori→1, copie avec référence, 0 erreur.
- App hors-ligne (reload) : 10 cartes, recherche OK, 12 puces, polices OK, favori persistant, icônes OK, 0 erreur.

## Commits
- karamat-al-awliya : `7fea8b1` (initial : app + data + sw + manifest + icons)
- ucfzem.github.io : `07efae2` (works maktaba + icône ; root SW shell/app ; data marker v5)

## All live links
- Link tree : https://ucfzem.github.io/works/
- كرامات الأولياء : https://ucfzem.github.io/karamat-al-awliya/
- Icône : https://ucfzem.github.io/karamat-al-awliya/icon.svg

---

# Addendum 20 — Corpus complet (extraction verbatim)

## Méthode
- Source : **Shamela book 13150** « كتاب كرامات الأولياء للالكائي » — pages `id 1..318` (319+ = 404).
- Scraper : `/tmp/opencode/scrape13150.mjs` → `/tmp/opencode/shamela13150.json` (318 pages, 347 paragraphes).
- Build : `/tmp/opencode/build13150b.py` → `data.json` (220 récits, **tout `verified: true`**, aucun texte/isnad fabriqué).

## Résultat
- **220 récits** numérotés 1→230 (numérotation de l'imprimé), **92 chapitres**.
- Catégories : الصحابة 73 · التابعون 86 · أتباع التابعين 21 · القرآن والتفسير 28 · الأنبياء والأمم السابقة 12.
- Régions/époques (12) : تفسير القرآن، الأمم السابقة، عصر النبوة، الصحابة، المدينة، مكة، الشام، مصر، الكوفة، البصرة، بغداد، خراسان.
- Découpe isnâd/matn au **dernier connecteur de chaîne** avant 70 % du texte (210/220 récits avec chaîne).
- `data.json` ≈ 434 Ko.

## Déploiement & offline
- `karamat-al-awliya/sw.js` : `karamat-cache` `v1.0.0 → v1.1.0`.
- Root `sw.js` : `DATA_MARKER` `v5 → v6` (re-prefetch → recharge le nouveau `data.json` via `syncAppSW`).

## Vérification (Playwright, live)
- En ligne : **220 cartes**, 19 puces, recherche `سارية`→2 · `النار`→6 · `230`→1, filtre `التابعون`→86, thème, favori, copie OK, 0 erreur.
- Hors-ligne (reload) : **220 cartes**, 19 puces, polices OK, favori persistant, icônes OK, 0 erreur.
- /works : Maktaba publique, 11 cartes, carte كرامات الأولياء présente, non verrouillée.

## Commits
- karamat-al-awliya : `a5d2e73` (corpus complet 220 récits).
- ucfzem.github.io : `93bf6f5` (bump data marker v6).

---

# Addendum 21 — Correction UX de la barre de recherche

Diagnostic : la recherche **fonctionnait** (test Playwright desktop + émulation mobile : 220→2). Le problème était l'**affichage** — compteur discret/non libellé, aucun bouton d'effacement, aucune mise en évidence du terme trouvé.

## Changements (`index.html`)
- Compteur explicite : « نتائج البحث عن «سارية»: 2 أثر من 220 » (classe `.query`), `aria-live="polite"`.
- Bouton **مسح (✕)** dans la zone de recherche + touche **Échap** pour effacer.
- **Surlignage** du terme (`<mark>`) dans le titre, l'isnâd et le texte, **tolérant au تشكيل et aux variantes** (أ/إ/آ/ا، ى/ي، ة/ه، ؤ/ئ/و).
- Sécurité IME : `oncompositionend` en plus de `oninput`.

## Cache
- App `sw.js` : `karamat-cache` `v1.1.0 → v1.1.1`.
- Root `sw.js` : `DATA_MARKER` `v6 → v7` (réinstallation → re-précache du nouvel `index.html`).

## Vérification locale (Playwright)
- `سارية`→2 (6 marks) · `البخاري`→16 (16) · `عمر`→88 (176) · `النار`→6 (9) · `اسحاق` sans hamza→33 (40 marks). 0 erreur.

## Commits
- karamat-al-awliya : (recherche UX).
- ucfzem.github.io : (bump data marker v7).
