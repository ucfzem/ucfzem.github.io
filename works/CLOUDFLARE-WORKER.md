# Cloudflare Worker Backup — `ucfzem`

**Deployed at:** `https://ucfzem.azer-tyu199p.workers.dev`
**Password:** `UcfZem@2026`

## Public paths (no auth)
- `/works/` — Projects directory
- `/quran-majeed-v3/` — Quran Majeed
- `/tanger/` — Tanger d'Antan
- `/ucfzem-blog/` — UcfZem Tech Blog
- `/lingotech/` — Lingotech English AI
- `/microinvoice/` — MicroInvoice
- `/rafeeq/` — Rafeeq Health

## Locked paths (password required)
All other paths behind password gate.

## Worker source

\`\`\`javascript
const PASSWORD = "UcfZem@2026";
const PROXY_TARGET = "https://ucfzem.github.io";
const COOKIE_NAME = "ucfzem_auth";
const PUBLIC_PATHS = [
  "/works", "/works/",
  "/quran-majeed-v3", "/quran-majeed-v3/",
  "/tanger", "/tanger/",
  "/ucfzem-blog", "/ucfzem-blog/",
  "/lingotech", "/lingotech/",
  "/microinvoice", "/microinvoice/",
  "/rafeeq", "/rafeeq/"
];

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/robots.txt") {
    return new Response("User-agent: *\\nAllow: /\\nSitemap: https://ucfzem.azer-tyu199p.workers.dev/sitemap.xml\\n", {
      headers: { "Content-Type": "text/plain" }
    });
  }

  if (path === "/sitemap.xml") {
    return new Response(getSitemap(), {
      headers: { "Content-Type": "application/xml" }
    });
  }

  if (path === "/" || path === "") {
    return Response.redirect("https://ucfzem.azer-tyu199p.workers.dev/works/", 301);
  }

  if (PUBLIC_PATHS.includes(path)) {
    return proxyRequest(request, path);
  }

  const cookie = request.headers.get("Cookie") || "";
  const authCookie = cookie.split(";").find(c => c.trim().startsWith(\`\${COOKIE_NAME}=\`));
  const isAuthenticated = authCookie && authCookie.split("=")[1] === PASSWORD;

  if (request.method === "POST" && path === "/__login") {
    const formData = await request.formData();
    const password = formData.get("password");
    if (password === PASSWORD) {
      return new Response("OK", {
        status: 200,
        headers: {
          "Set-Cookie": \`\${COOKIE_NAME}=\${PASSWORD}; Path=/; SameSite=Lax; Max-Age=86400; Secure\`,
          "Content-Type": "text/plain"
        }
      });
    }
    return new Response("Invalid", { status: 403 });
  }

  if (path === "/__logout") {
    return new Response("Logged out", {
      headers: {
        "Set-Cookie": \`\${COOKIE_NAME}=; Path=/; Max-Age=0\`,
        "Content-Type": "text/plain"
      }
    });
  }

  if (!isAuthenticated) {
    return new Response(getLoginPage(path), {
      headers: { "Content-Type": "text/html" }
    });
  }

  return proxyRequest(request, path);
}

async function proxyRequest(request, path) {
  const targetPath = path.startsWith("/") ? path : "/" + path;
  const targetUrl = \`\${PROXY_TARGET}\${targetPath}\`;
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  return response;
}

function getLoginPage(redirectPath) {
  return \`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Protected</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:#0d0d0d;color:#e8e0d0;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:40px;width:90%;max-width:400px;text-align:center}
h1{font-family:'Cinzel',serif;color:#c9a84c;margin-bottom:8px;font-size:1.4rem;font-weight:700}
p{color:#8a7a5a;font-size:0.85rem;margin-bottom:24px}
input{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(201,168,76,0.3);background:rgba(255,255,255,0.05);color:#e8e0d0;font-size:0.95rem;outline:none;margin-bottom:16px}
input:focus{border-color:#c9a84c}
button{width:100%;padding:14px;border-radius:20px;border:none;background:linear-gradient(135deg,#c9a84c,#f0c866);color:#0d0d0d;font-size:1rem;font-weight:700;cursor:pointer}
.error{color:#e74c3c;font-size:0.8rem;display:none;margin-bottom:12px}
.error.show{display:block}
</style></head><body><div class="card"><h1>🔐 Accès protégé</h1><p>Entrez le mot de passe pour accéder à ce projet.</p><div class="error" id="error">❌ Mot de passe incorrect</div>
<input type="password" id="password" placeholder="Mot de passe" autofocus>
<button onclick="login()">Déverrouiller</button></div><script>
async function login(){const pw=document.getElementById('password').value;const err=document.getElementById('error');err.classList.remove('show');const r=await fetch('/__login',{method:'POST',body:new URLSearchParams({password:pw})});if(r.ok)location.reload();else err.classList.add('show')}
document.getElementById('password').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
</script></body></html>\`;
}

function getSitemap() {
  const base = "https://ucfzem.azer-tyu199p.workers.dev";
  const paths = [
    "/works/",
    "/quran-majeed-v3/",
    "/tanger/",
    "/ucfzem-blog/",
    "/lingotech/",
    "/microinvoice/",
    "/rafeeq/"
  ];
  const urls = paths.map(p => \`  <url><loc>\${base}\${p}</loc></url>\`).join("\\n");
  return \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\${urls}\\n</urlset>\`;
}

export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
\`\`\`

## Vercel projects (unprotected)
- https://elixir-techx.vercel.app
- https://guide-freelance.vercel.app
- https://downloader-sepia-delta.vercel.app
- https://ucf-product-gen.vercel.app/generate

## Cloudflare projects (unprotected)
- https://promptgenius.azer-tyu199p.workers.dev

## Dead (404)
- email-collector
- launchkit (removed from /works/)
- magic-eraser (removed from /works/)
- Sandrawing (removed from /works/)
