# AI Image Enhancer

Restaurez, colorez, upscalez et améliorez vos images par IA.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- 5 API providers avec fallback automatique
- Rate limiting (10 req/jour/IP)

## Déploiement Vercel (recommandé)

1. Push ce repo sur GitHub
2. Va sur https://vercel.com/new
3. Importe `ucfzem/ucfzem.github.io` (ou le repo contenant ce dossier)
4. Configure le projet :
   - Framework : Next.js
   - Root directory : `AI-Image-Enhancer`
5. Ajoute les variables d'environnement dans Vercel (voir `.env.local.example`)
6. Deploy

## Variables d'environnement

Copier `.env.local.example` vers `.env.local` et remplir les clés API :

| Variable | API | Où l'obtenir |
|---|---|---|
| `REPLICATE_API_TOKEN` | Replicate | https://replicate.com/account |
| `HUGGINGFACE_API_TOKEN` | Hugging Face | https://huggingface.co/settings/tokens |
| `DEEPAI_API_KEY` | DeepAI | https://deepai.org/dashboard |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | https://cloudinary.com/console |
| `CLOUDINARY_API_KEY` | Cloudinary | https://cloudinary.com/console |
| `CLOUDINARY_API_SECRET` | Cloudinary | https://cloudinary.com/console |

## Développement local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000
