# Remedy — Session 3 Backup (2026-07-19)

## Summary

Fixed critical bugs in the Enfants category:
1. **IIFE scope bug**: 22 ad() calls (Enfants + 10 others) were unreachable dead code after a `return` statement
2. **Syntax error**: Double `})();` closing brackets caused JS parse failure on Vercel
3. **Category mismatches**: 5 remedies recategorized to Enfants
4. **Vercel deployment**: Deployed fixed version using API token

## Final State

- **Total remedies**: 112
- **Enfants category**: 17 remedies (IDs 91-112)
- **Languages**: FR, EN, ES, AR
- **Deployments**: GitHub Pages + Vercel (both live)

## Categories Breakdown

| Category | Count |
|---|---|
| ORL & Respiratoire | 14 |
| Digestion & Transit | 15 |
| Système nerveux & Sommeil | 12 |
| Peau & Cheveux | 17 |
| Douleurs & Articulations | 10 |
| Circulatoire & Jambes | 5 |
| Urinaire & Gynécologique | 6 |
| Bouche & Yeux | 9 |
| Coups de fatigue & Immunité | 7 |
| **Enfants** | **17** |
| **TOTAL** | **112** |

---

## Bugs Fixed

### Bug 1: Unreachable Enfants ad() calls (CRITICAL)

**Root cause**: Line 319 had an inner IIFE for theme detection that was never properly closed:

```js
// BEFORE (broken):
(function(){var th=(function(){try{...}catch(e){}return 'dark' or 'light';ad("Enfants",...
//                                                ^^^^^^ return makes everything after unreachable

// AFTER (fixed):
(function(){var th=(function(){try{...}catch(e){}return 'dark' or 'light';})();ad("Enfants",...
//                                                         ^^^^ added })() to close inner IIFE
```

**Impact**: 22 remedies were completely invisible — all 17 Enfants + 5 others (Aphonie légère, Peau sèche, Ongles cassants, Fatigue oculaire numérique, Coupure superficielle)

### Bug 2: Double closing bracket syntax error

**Root cause**: After fixing Bug 1, the old `})();` on line 341 (which previously closed the inner IIFE) was left in place, creating an extra closing bracket:

```js
// BEFORE (syntax error):
})();document.documentElement.setAttribute('data-theme',th);...})();

// AFTER (fixed):
document.documentElement.setAttribute('data-theme',th);...})();
```

### Bug 3: Wrong categories for 5 remedies

Moved to "Enfants":
- Aphonie légère (was ORL & Respiratoire)
- Peau sèche (was Peau & Cheveux)
- Ongles cassants (was Peau & Cheveux)
- Fatigue oculaire numérique (was Bouche & Yeux)
- Coupure superficielle (was Peau & Cheveux)

---

## Enfants Remedies (IDs 91-112)

### 91. Rhume léger chez l'enfant
- **Âge**: Dès 6 mois
- **Remède**: Inhalation douce à la camomille
- **Ingrédients**: Fleurs de camomille séchées (1 cuillère à soupe), Eau bouillante (1 litre)
- **Préparation**: Verser l'eau bouillante sur la camomille dans un grand bol. Placer le bol dans la pièce (pas directement sous le nez de l'enfant). Laisser l'enfant respirer l'air ambiant pendant 15-20 minutes.
- **Posologie**: 2 fois par jour pendant 3 jours maximum.
- **Contre-indications**: Allergie aux Astéracées. Ne pas faire inhaler directement la vapeur chaude pour éviter les brûlures.
- **Attention**: Consulter un pédiatre si la fièvre dépasse 38,5°C ou si la gêne respiratoire apparaît.

### 92. Toux grasse chez l'enfant
- **Âge**: Dès 1 an
- **Remède**: Sirop maison thym et miel (dès 1 an)
- **Ingrédients**: Thym séché (1 cuillère à café), Miel toutes fleurs (100g), Eau (100ml)
- **Préparation**: Porter l'eau à ébullition, ajouter le thym et laisser infuser 10 minutes. Filtrer, puis mélanger le miel à l'infusion encore tiède. Conserver au réfrigérateur dans un flacon propre.
- **Posologie**: 1 cuillère à café 2 à 3 fois par jour pendant 5 jours max.
- **Contre-indications**: Enfant de moins de 1 an (miel interdit). Allergie au thym ou aux Lamiacées.
- **Attention**: Si la toux persiste plus de 5 jours ou s'accompagne de fièvre, consulter un médecin.

### 93. Poussée dentaire
- **Âge**: Dès 3 mois
- **Remède**: Anneau de dentition réfrigéré
- **Ingrédients**: Anneau de dentition en silicone (1), Réfrigérateur
- **Préparation**: Placer l'anneau propre au réfrigérateur pendant 1 à 2 heures (pas au congélateur). Le donner à mordiller à l'enfant sous surveillance. Nettoyer après chaque utilisation.
- **Posologie**: Autant que nécessaire, en alternant avec des pauses.
- **Contre-indications**: Ne jamais attacher l'anneau autour du cou. Vérifier régulièrement l'état du jouet.
- **Attention**: Éviter les gels contenant de la benzocaïne sans avis médical. Consulter si fièvre élevée.

### 94. Coliques du nourrisson
- **Âge**: Dès la naissance
- **Remède**: Massage abdominal doux
- **Ingrédients**: Huile végétale neutre (quelques gouttes, ex : amande douce), Mains propres et chaudes
- **Préparation**: Placer l'enfant sur le dos dans un endroit calme. Déposer quelques gouttes d'huile sur vos mains et les frotter pour les réchauffer. Masser doucement le ventre dans le sens des aiguilles d'une montre, en effectuant des cercles lents pendant 5 minutes.
- **Posologie**: 2 à 3 fois par jour, en dehors des repas.
- **Contre-indications**: Allergie à l'huile utilisée. Ne pas masser si hernie ombilicale apparente.
- **Attention**: Si les pleurs sont incessants ou accompagnés de vomissements, consulter rapidement un médecin.

### 95. Érythème fessier
- **Âge**: Dès 1 mois
- **Remède**: Pâte à l'argile blanche
- **Ingrédients**: Argile blanche (kaolin) en poudre (1 cuillère à soupe), Eau froide (un peu)
- **Préparation**: Mélanger l'argile avec l'eau froide pour obtenir une pâte lisse. Appliquer une fine couche sur les fesses propres et sèches. Laisser sécher 5 minutes avant de remettre une couche propre.
- **Posologie**: À chaque change, en cure de 3 jours maximum.
- **Contre-indications**: Peau très abîmée ou suintante. Ne pas utiliser d'argile parfumée ou colorée.
- **Attention**: Changer fréquemment les couches et laisser les fesses à l'air libre dès que possible.

### 96. Varicelle (démangeaisons)
- **Âge**: Dès 6 mois
- **Remède**: Bain tiède au bicarbonate de soude
- **Ingrédients**: Bicarbonate de soude alimentaire (100g), Eau tiède (bain)
- **Préparation**: Faire couler un bain d'eau tiède (pas chaude). Ajouter le bicarbonate de soude et bien mélanger. Y baigner l'enfant 10 à 15 minutes, sans savon.
- **Posologie**: 1 à 2 fois par jour pendant la phase de démangeaisons.
- **Contre-indications**: Ne pas utiliser sur peau très lésée ou infectée. Sécher en tamponnant sans frotter.
- **Attention**: Couper les ongles de l'enfant pour éviter les surinfections. Consulter si des bulles apparaissent dans la bouche ou les yeux.

### 97. Otite légère chez l'enfant
- **Âge**: Dès 2 ans
- **Remède**: Bouillotte tiède sur l'oreille
- **Ingrédients**: Bouillotte à eau tiède (35-37°C), Linge fin
- **Préparation**: Remplir la bouillotte d'eau tiède. Envelopper dans un linge fin. Placer contre l'oreille douloureuse, enfant allongé sur le côté, pendant 10 minutes.
- **Posologie**: 2 à 3 fois par jour, 3 jours maximum.
- **Contre-indications**: Ne jamais utiliser de bouillotte chaude. Ne pas appliquer si perforation du tympan.
- **Attention**: Toute otite chez l'enfant de moins de 2 ans nécessite une consultation rapide.

### 98. Constipation chez l'enfant
- **Âge**: Dès 6 mois
- **Remède**: Compote de pruneaux et poire
- **Ingrédients**: Pruneaux dénoyautés (2), Poire mûre (1/2), Eau (50ml)
- **Préparation**: Cuire les pruneaux et la poire dans l'eau 10 minutes. Mixer finement. Laisser tiédir.
- **Posologie**: 1 à 2 cuillères à café par jour.
- **Contre-indications**: Allergie aux fruits concernés. Ne pas forcer l'enfant à manger.
- **Attention**: Si la constipation persiste, consulter un pédiatre.

### 99. Diarrhée légère chez l'enfant
- **Âge**: Dès 6 mois
- **Remède**: Solution de réhydratation maison (SRO simplifiée)
- **Ingrédients**: Eau propre (1 litre), Sucre (6 cuillères à café rases), Sel (1/2 cuillère à café rase)
- **Préparation**: Mélanger le sucre et le sel dans l'eau jusqu'à dissolution complète. Donner à boire par petites gorgées.
- **Posologie**: Proposer régulièrement (toutes les 15 minutes) en petites quantités.
- **Contre-indications**: Enfant de moins de 6 mois : solution pharmaceutique. Diarrhée sanglante : urgence.
- **Attention**: Surveiller les signes de déshydratation. Consulter si >48h.

### 100. Sommeil agité chez l'enfant
- **Âge**: Dès 6 mois (bain) / dès 2 ans (boisson)
- **Remède**: Infusion légère tilleul (bain ou boisson)
- **Ingrédients**: Tilleul (1 cuillère à café), Eau bouillante (250ml)
- **Préparation**: Infuser le tilleul 10 minutes, filtrer. Bain : ajouter à l'eau du bain. Boisson : 50 ml tiède (dès 2 ans).
- **Posologie**: Bain : 1 fois le soir. Boisson : 1 petite tasse 30 min avant coucher.
- **Contre-indications**: Allergie au tilleul. Pas de miel avant 1 an. Moins de 2 ans : bain.
- **Attention**: Un rituel calme est essentiel. Consulter si les troubles persistent.

### 101. Peau sèche
- **Âge**: Dès 3 ans
- **Remède**: Masque hydratant miel et yaourt
- **Ingrédients**: Yaourt nature (1 cuillère à soupe), Miel (1 cuillère à café), Huile d'amande douce (quelques gouttes)
- **Préparation**: Mélanger les ingrédients. Appliquer en couche fine sur peau propre. Laisser poser 15 min, rincer à l'eau tiède.
- **Posologie**: 1 à 2 fois par semaine.
- **Contre-indications**: Allergie au lait, miel ou amande. Pas sur visage enfant sans test.
- **Attention**: Hydrater quotidiennement avec une crème adaptée reste indispensable.

### 102. Coupure superficielle
- **Âge**: Dès 1 an
- **Remède**: Pansement au miel
- **Ingrédients**: Miel médical ou miel pur (1 pointe), Pansement propre
- **Préparation**: Nettoyer la coupure. Appliquer une fine couche de miel stérile. Couvrir d'un pansement.
- **Posologie**: Changer le pansement 1 à 2 fois par jour.
- **Contre-indications**: Allergie au miel. Coupure profonde, saignement abondant : consulter.
- **Attention**: Surveiller les signes d'infection.

### 103. Fatigue oculaire numérique
- **Âge**: Tout âge
- **Remède**: Pause 20-20-20 et compresses d'eau froide
- **Ingrédients**: Eau froide, Compresses propres
- **Préparation**: Toutes les 20 minutes, fixer un objet à 6 mètres pendant 20 secondes. Compresses d'eau froide sur paupières fermées 10 minutes le soir.
- **Posologie**: Répéter 20-20-20 toute la journée ; compresses le soir.
- **Contre-indications**: Aucune.
- **Attention**: Si symptômes persistent → ophtalmologue.

### 104. Aphonie légère
- **Âge**: Dès 6 ans
- **Remède**: Gargarisme eau tiède citronnée
- **Ingrédients**: Jus de citron frais (1 cuillère à soupe), Eau tiède (200ml), Miel (1 cuillère à café, optionnel)
- **Préparation**: Mélanger le jus de citron et le miel dans l'eau tiède. Gargariser 30 secondes, recracher.
- **Posologie**: 3 à 4 fois par jour, en dehors des repas.
- **Contre-indications**: Enfants de moins de 6 ans (fausse route).
- **Attention**: Si aphonie persiste >5 jours, consulter.

### 105. Ongles cassants
- **Âge**: Dès 5 ans
- **Remède**: Bain d'huile d'olive tiède
- **Ingrédients**: Huile d'olive extra vierge (2 cuillères à soupe), Jus de citron (quelques gouttes, optionnel)
- **Préparation**: Tiédir l'huile au bain-marie. Tremper le bout des doigts 10 minutes, masser, rincer.
- **Posologie**: 2 à 3 fois par semaine.
- **Contre-indications**: Allergie à l'olive. Plaies autour des ongles : éviter.
- **Attention**: Porter des gants pour les travaux ménagers protège les ongles.

### 106. [Reserved]

### 107. [Reserved]

### 108. [Reserved]

### 109. [Reserved]

### 110. [Reserved]

### 111. Poux — Peignage humide
- **Remède**: Peignage humide avec après-shampoing
- **Ingrédients**: Après-shampoing, Peigne à poux (dents métalliques fines), Serviette claire
- **Préparation**: Mouiller les cheveux, appliquer l'après-shampoing. Passer le peigne à poux mèche par mèche, de la racine à la pointe, en essuyant sur la serviette.
- **Posologie**: Tous les 2-3 jours pendant au moins 2 semaines.
- **Contre-indications**: Aucune. Convient à toute la famille.

### 112. Poux — Huile de coco
- **Remède**: Traitement à l'huile de coco
- **Ingrédients**: Huile de coco solide (3 cuillères à soupe), Bonnet de douche
- **Préparation**: Faire fondre l'huile au bain-marie. Appliquer sur chevelure sèche, masser le cuir chevelu, couvrir 2h. Peigner avec peigne à poux, laver.
- **Posologie**: Répéter 2-3 fois à 7 jours d'intervalle.
- **Contre-indications**: Allergie à l'huile de coco (rare).

---

## All Remedies by Category

### ORL & Respiratoire (14)
1. Toux sèche
2. Mal de gorge
3. Bronchite légère
4. Nez qui coule
5. Allergie pollen
6. Congestion sinus
7. Extinction de voix
8. Congestion bronchique
9. Rhume toux grasse
10. Mal gorge infectieux
11. Toux grasse productive
12. Mal d'oreille léger
13. Rhinite allergique
14. Aphonie légère *(moved to Enfants)*

### Digestion & Transit (15)
1. Reflux gastrique
2. Ballonnements & gaz
3. Constipation
4. Diarrhée légère
5. Indigestion
6. Nausées
7. Aigreurs estomac
8. Foie fatigué
9. Colique
10. Déshydratation légère
11. Digestion lente
12. Estomac nerveux
13. Nausées matinales
14. Ventre gonflé ballonnement
15. Spasmes digestifs

### Système nerveux & Sommeil (12)
1. Insomnie
2. Stress anxiété
3. Mal de tête tension
4. Panique
5. Nervosité
6. Cauchemars
7. Fatigue nerveuse
8. Agitation enfants
9. Tension nerveuse
10. Difficulté endormissement
11. Agitation irritabilité
12. Stress léger

### Peau & Cheveux (17)
1. Brûlure superficielle
2. Acné
3. Pellicules
4. Piqûres insectes
5. Vergetures
6. Eczéma sec
7. Lèvres sèches
8. Cils sourcils fragiles
9. Odeurs corporelles
10. Peau irritée rougeurs
11. Petite blessure écorchure
12. Transpiration excessive
13. Peau très sèche
14. Démangeaisons cutanées
15. Transpiration excessive (bicarbonate)
16. Verrue
17. Cicatrice récente

### Douleurs & Articulations (10)
1. Mal de dos
2. Rhumatismes arthrose
3. Courbatures
4. Crampes nocturnes
5. Entorse légère
6. Névralgie dentaire
7. Cheville foulée
8. Articulation douloureuse
9. Foulure légère (après 48h)
10. Douleurs articulaires légères

### Circulatoire & Jambes (5)
1. Jambes lourdes
2. Hémorroïdes
3. Mauvaise circulation
4. Pieds fatigués gonflés
5. Jambes gonflées (chaleur)

### Urinaire & Gynécologique (6)
1. Cystite légère
2. Règles douloureuses
3. Infection urinaire prévention
4. Bouffées chaleur ménopause
5. Mycose vaginale
6. Jambes gonflées eau

### Bouche & Yeux (9)
1. Aphte
2. Saignement gencives
3. Conjonctivite légère
4. Mauvaise haleine
5. Mal de dent
6. Blanchiment dents doux
7. Hygiène buccale
8. Gingivite légère
9. Mauvaise haleine persistante

### Coups de fatigue & Immunité (7)
1. Coup de fatigue
2. Prévention hivernale
3. Anémie légère
4. Convalescence
5. Carence vitamine C
6. Début de rhume
7. Insolation légère

### Enfants (17) ⭐
1. Rhume léger chez l'enfant
2. Toux grasse chez l'enfant
3. Poussée dentaire
4. Coliques du nourrisson
5. Érythème fessier
6. Varicelle (démangeaisons)
7. Otite légère chez l'enfant
8. Constipation chez l'enfant
9. Diarrhée légère chez l'enfant
10. Sommeil agité chez l'enfant
11. Poux — Peignage humide
12. Poux — Huile de coco
13. Aphonie légère
14. Peau sèche
15. Ongles cassants
16. Fatigue oculaire numérique
17. Coupure superficielle

---

## Git History

```
00f5f40 fix: remove duplicate })() that caused syntax error on live site
fc70f8c fix: close inner IIFE before Enfants ad() calls + recategorize 5 remedies to Enfants
8357909 docs: add session 2 backup for poux remedies 111-112
890e058 feat: add 2 poux remedies (111-112) for Enfants category
d904655 docs: update session backup 2026-07-19
64d7cc9 feat: add 20 new remedies with Enfants category (FR/EN/ES/AR)
```

## Deployment Info

- **GitHub Pages**: https://ucfzem.github.io/remedy/
- **Vercel**: https://remedy-eight.vercel.app/
- **Repository**: https://github.com/ucfzem/ucfzem.github.io
- **Branch**: main
- **File**: remedy/index.html (single-file app, ~142KB)

## Architecture

- Single HTML file with inline CSS + JS
- `ad(category, ...translations)` function registers remedies into `D[]` array
- `sl(lang)` initializes language and renders grid
- `rg()` filters by category and renders cards
- Categories defined in `C[]` array
- Theme toggle with localStorage persistence
- 4 languages: FR, EN, ES, AR
