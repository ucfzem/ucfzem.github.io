# Conversation Backup — 2026-08-07 (fin de session)

## Session : accélération `ucfzem-ai` + sauvegarde

### Contexte
- Site : https://ucfzemgithubio.vercel.app/ucfzem-ai
- Repo : https://github.com/ucfzem/ucfzem.github.io
- Le chat répondait trop lentement (~4,2 s pour une réponse d'une ligne).

### Diagnostic
- `POST /api/chat` : HTTP 200, mais TTFB = 4,19 s.
- Cause : requête **non streamée** (le client attend la réponse COMPLETE) + modèle
  le plus lourd en premier (`nvidia/nemotron-3-super-120b-a12b:free`).

### Correctifs appliqués
1. **`api/chat.js`** (endpoint serverless Vercel)
   - Passage en **streaming SSE** (`stream: true`) → les premiers mots arrivent en ~1 s.
   - Modèles reclassés du plus rapide au plus lent :
     `nemotron-3-nano-30b-a3b` → `gemma-4-31b-it` → `gpt-oss-20b` →
     `nemotron-3-super-120b-a12b` (dernier recours).
   - Ajout d'un timeout de 60 s (AbortController).
   - `max_tokens` réduit à 512 pour borner le temps de génération.
2. **`ucfzem-ai/index.html`** (frontend)
   - Rend le flux de tokens en direct (SSE) via `res.body.getReader()` au lieu
     d'attendre le JSON complet.
   - Suppression de la fonction morte `sendMessageWithText`.

### Validation
- Test local du handler contre un mock OpenRouter en SSE : ✅ passé.
- Commit `46a6e6c` « Speed up chat: SSE streaming, fastest model first, 60s timeout » poussé sur `main`.

### La suite
- Vérifier le redéploiement Vercel puis re-tester `POST /api/chat` (streaming).
- Contrôler que le frontend reçoit bien le flux.

---

## Session (suite) : qualité des réponses + connaissances à jour

### Problème
- L'agent déblatérait son raisonnement interne au lieu de répondre directement
  (ex. question « Claude est en quelle version ? » → longue hésitation écrite).
- Réponses hors date : l'agent citait Claude 3.5 alors que la génération Claude 5
  est sortie en 2026 (Sonnet 5 le 30/06/2026, Opus 5 le 24/07/2026, Fable 5/Mythos 5 en juin 2026).

### Correctifs (commits sur main)
- `a299fe2` « Raccourcit les réponses du chat (1-3 phrases) »
- `880d8ee` « Chat: gemma en tête, temperature 0.4, interdit de dévoiler le raisonnement »
  → `gemma-4-31b-it:free` en modèle principal, temperature 0.4.
- `b143a52` « Injecte les connaissances actuelles (Claude 5) dans le prompt »
  → bloc CONNAISSANCES ACTUELLES (7 août 2026) dans le prompt système.

### Résultats mesurés
- Réponses directes : « La version la plus récente d'Anthropic est Claude Opus 5, sortie le 24 juillet 2026. »
- TTFB ~1,4-2,4 s, total ~3-4,7 s.

### Décision
- **Pas de modèle payant** (recherche web live OpenRouter `:online` non retenue) :
  les faits récents sont injectés manuellement dans le prompt système.