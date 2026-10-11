# Session — 2026-10-11 — Ajout d'Al-Adhkiya au link tree

## Ce qui a été fait dans ce dépôt (ucfzem.github.io)

Ajout du projet **Al-Adhkiya** (كتاب الأذكياء — ابن الجوزي) à la page
`works/index.html`, section **« Projets publics »**.

### Modification exacte (fichier unique : `works/index.html`)

- **Position 9** (milieu de la liste, dans le groupe « patrimoine ») :
  ```js
  { num: 9, emoji: "🧠", name: "Al-Adhkiya", tag: "Adab", icon: null,
    url: "https://ucfzem.github.io/al-adhkiya/", newTab: true },
  ```
- Renumérotation des projets 9→18 suivants.
- Compteur mis à jour : « 17 » → « **18 projets publics** ».
- `ItemList` **JSON-LD** : nouvelle position 9, décalage des positions 9→21.
- `<meta name="description">` : ajout de « Al-Adhkiya ».

### Commit

- `2b168e9` — *works: add Al-Adhkiya (كتاب الأذكياء) to public projects at position 9 (middle) + JSON-LD/meta*

### Vérifications avant push

- `git diff` relu : **1 seul fichier** modifié, aucun autre changement.
- JSON-LD `JSON.parse` OK (21 items, position 9 = Al-Adhkiya).
- `publicProjects` : 18 éléments, numéros uniques 1..18, Al-Adhkiya en position 9/18.
- Après push : page live HTTP 200, `Al-Adhkiya` présent, sous-titre « 18 projets publics ».

## Précautions

Conformément à la consigne (ne rien perdre), aucun fichier supprimé, aucune
réécriture d'historique, push en fast-forward uniquement, édition chirurgicale
d'un seul fichier.

## Lien du nouveau projet

- https://ucfzem.github.io/al-adhkiya/
