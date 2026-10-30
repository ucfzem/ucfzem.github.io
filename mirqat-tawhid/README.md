# مكتبة التوحيد — Lecteur Kitab al-Tawhid / Fath al-Majid / Majmu' al-Fatawa

Lecteur web (HTML + Tailwind CDN + JS pur), RTL, hors-ligne (PWA).
**Le dépôt ne contient aucun texte des livres** : le sommaire (`data/toc.json`) est réel, les textes doivent être importés depuis la source (Shamela). L'application n'affiche jamais de texte inventé.

## Structure

```
index.html            application (un seul fichier)
manifest.webmanifest  PWA
sw.js                 service worker (hors-ligne)
data/toc.json         67 chapitres + pages de début (Shamela) — réel
data/kitab.json       textes de Kitab al-Tawhid      (à importer)
data/fath.json        textes de Fath al-Majid        (à importer)
data/fatawa.json      passages de Majmu' al-Fatawa   (à remplir)
tools/fetch_shamela.py  télécharge les pages depuis shamela.ws (stdlib seulement)
tools/import_txt.py     importe un export .txt, découpé par chapitre
```

## 1. Importer les textes (Termux ou PC)

```bash
python tools/fetch_shamela.py --book kitab     # ~150 pages
python tools/fetch_shamela.py --book fath      # ~540 pages (≈ 12 min avec 1,2 s de délai)
```

* Le HTML brut est gardé dans `raw/` (reprise possible, vérification possible).
* Si la structure de page de Shamela n'est pas reconnue, le script s'arrête et vous dit quoi m'envoyer.
* À la fin il vérifie que **toutes** les pages de début de chapitre existent ; sinon il n'écrit rien.

Alternative avec un export `.txt` de l'application Shamela :

```bash
python tools/import_txt.py --book kitab --input kitab_raw.txt
python tools/import_txt.py --book fath  --input fath_raw.txt --skip-until "…début du corps du livre…"
```

Le rapport `report_<livre>.txt` liste, pour chaque chapitre, la ligne de titre trouvée et la longueur du texte. **Relisez-le.**

## 2. Majmu' al-Fatawa (seulement les passages sur le tawhid)

`data/fatawa.json` est une liste d'entrées que vous remplissez avec le texte exact copié de la source :

```json
[
  {
    "id": "mf-1-001",
    "volume": 1,
    "page": 12,
    "title": "عنوان قصير يصف المسألة",
    "category": "الألوهية",
    "related": [14, 15],
    "text": "النص كما هو في المصدر"
  }
]
```

* `related` = numéros de chapitres de `toc.json` auxquels la fatwa se rattache. Liste vide = apparaît dans « فتاوى عامة ».
* `category` : `"الربوبية"` ou `"الألوهية"` (ou vide).

## 3. Classer les chapitres (Rububiyya / Uluhiyya)

Le champ `category` de chaque chapitre dans `data/toc.json` est volontairement **vide** : ce classement est un jugement doctrinal, à faire par vous ou par un spécialiste. Une fois rempli, la barre latérale regroupe les chapitres par catégorie.

## 4. Lancer

```bash
python -m http.server 8000        # puis ouvrir http://localhost:8000
```

(Ouvrir `index.html` directement ne marche pas : le navigateur bloque `fetch` en `file://`.)
Pour publier : GitHub Pages / Vercel, le dossier tel quel.

## Fonctions

Index hiérarchique (catégorie → chapitre → fatawa liées) · trois panneaux séparés avec source et page · mode « مقارنة » (3 colonnes sur grand écran) · recherche instantanée sans voyelles ni variantes d'alif · filtres par livre / catégorie · taille et police du texte · thème parchemin / sombre · signets et notes (localStorage) avec export/import JSON · liens profonds (`#/c/12`) · impression.

## Note sur les pages de chapitre

Shamela indique la page où commence le titre d'un chapitre, qui peut être en milieu de page. La page frontière est donc affichée à la fois à la fin du chapitre précédent et au début du suivant (étiquette « صفحة مشتركة ») pour qu'aucun mot ne soit perdu.
