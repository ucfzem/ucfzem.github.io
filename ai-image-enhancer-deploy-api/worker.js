const VALID_TOOLS = ["restore", "colorize", "upscale", "denoise", "enhance"];

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function replicatePredict(token, modelVersion, input) {
  const resp = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ version: modelVersion, input }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Replicate ${resp.status}: ${body || resp.statusText}`);
  }
  const prediction = await resp.json();
  const getUrl = prediction.urls?.get;
  if (!getUrl) throw new Error("Replicate: no prediction URL");
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
    const status = await poll.json();
    if (status.status === "succeeded") return Array.isArray(status.output) ? status.output[0] : status.output;
    if (status.status === "failed") throw new Error("Replicate: processing failed");
  }
  throw new Error("Replicate: timeout");
}

async function processWithReplicate(imageBuffer, fileType, tool, token) {
  const base64 = `data:${fileType || "image/png"};base64,${arrayBufferToBase64(imageBuffer)}`;
  const allTools = {
    restore: { version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c", input: { img: base64 } },
    colorize: { version: "376c74a2c9eb442a2ff9391b84dc5b949cd4e80b4dc0565115be0a19b7df0ae6", input: { input_image: base64, model_name: "Artistic" } },
    upscale: { version: "b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8", input: { image: base64, scale: 4 } },
    denoise: { version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c", input: { img: base64 } },
    enhance: { version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c", input: { img: base64 } },
  };
  const cfg = allTools[tool];
  return replicatePredict(token, cfg.version, cfg.input);
}

async function processWithHuggingFace(imageBuffer, tool, token) {
  const models = {
    restore: "nateraw/gfpgan",
    colorize: "microsoft/deoldify",
    upscale: "caidas/swin2SR-lightweight-x2-64",
    denoise: "nvidia/mit-b0-denoise",
    enhance: "nateraw/gfpgan",
  };

  let resp = await fetch(`https://api-inference.huggingface.co/models/${models[tool]}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageBuffer,
  });

  if (resp.status === 503) {
    await new Promise((r) => setTimeout(r, 3000));
    resp = await fetch(`https://api-inference.huggingface.co/models/${models[tool]}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HF ${resp.status}: ${text || resp.statusText}`);
  }

  const contentType = resp.headers.get("content-type") || "";
  if (!contentType.includes("image")) {
    const text = await resp.text();
    throw new Error(`HF: expected image, got ${text}`);
  }

  const buf = await resp.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);
  return `data:${contentType};base64,${base64}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/process" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const imageFile = formData.get("image");
        const tool = formData.get("tool");

        if (!imageFile || !tool) {
          return new Response(JSON.stringify({ error: "Image and tool are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        if (!VALID_TOOLS.includes(tool)) {
          return new Response(JSON.stringify({ error: "Invalid tool" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        const imageBuffer = await imageFile.arrayBuffer();
        const errors = [];

        if (env.REPLICATE_API_TOKEN) {
          try {
            const imageUrl = await processWithReplicate(imageBuffer, imageFile.type, tool, env.REPLICATE_API_TOKEN);
            return new Response(JSON.stringify({ imageUrl, provider: "Replicate" }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          } catch (err) {
            errors.push(`Replicate: ${err.message}`);
          }
        }

        if (env.HUGGINGFACE_API_TOKEN && (tool === "colorize" || tool === "denoise" || tool === "enhance")) {
          try {
            const imageUrl = await processWithHuggingFace(imageBuffer, tool, env.HUGGINGFACE_API_TOKEN);
            return new Response(JSON.stringify({ imageUrl, provider: "HuggingFace" }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          } catch (err) {
            errors.push(`HuggingFace: ${err.message}`);
          }
        }

        return new Response(JSON.stringify({ error: errors.length ? errors.join(" | ") : "No API tokens configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
