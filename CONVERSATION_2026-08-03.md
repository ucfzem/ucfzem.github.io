# Backup conversation — 2026-08-03

Sujet : Ajout d'analytics (gratuit) au blog UcfZem, poussé sur GitHub Pages/Cloudflare.

## Résumé
Le blog `ucfzem.azer-tyu199p.workers.dev/ucfzem-blog/` n'avait aucun outil d'analyse.
Après discussion, choix d'une solution 100% gratuite : **Cloudflare Web Analytics** (déjà configuré sur le compte, auto_install=false).
Le script Plausible (payant) a été retiré et remplacé par le snippet Web Analytics.

## Changements
- `blog.html` : ajout du tag Cloudflare Web Analytics dans `<head>` :
  ```html
  <!-- Cloudflare Web Analytics -->
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "a30fd89985dc4555b08862b0d83bb975"}'></script>
  <!-- End Cloudflare Web Analytics -->
  ```

## Compte Cloudflare
- Account ID : `551159a931a5eb5754de241eb6ae2b7c` (Azer.tyu199p@gmail.com)
- Site Web Analytics existant : `ucfzem.github.io`
  - site_tag : `1e70088715d548b8a93b745216ee0cc5`
  - site_token : `a30fd89985dc4555b08862b0d83bb975`

## Liens partagés
- Blog (servi par Worker) : https://ucfzem.azer-tyu199p.workers.dev/ucfzem-blog/
- Github Pages : https://ucfzem.github.io/ucfzem-blog/
- Repo : https://github.com/ucfzem/ucfzem.github.io

## Statut
- [x] Script Web Analytics ajouté à blog.html
- [ ] (option) créer un site Web Analytics séparé pour `ucfzem.azer-tyu199p.workers.dev`