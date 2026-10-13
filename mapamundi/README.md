# Mapamundi Viewer

A standalone, single-file deep-zoom viewer for high-resolution historical maps,
built with [OpenSeadragon](https://openseadragon.github.io/). No build step, no
server — it runs from `file://` or any static host (GitHub Pages, Vercel, Netlify…).

```
mapamundi/
├── index.html      ← the whole app (HTML + CSS + JS + config)
├── README.md       ← this file
└── assets/         ← put your tiles / images here
```

## Why tiles instead of one big image?

A scanned antique map can be hundreds of megapixels; loading it flat would freeze
the browser. Deep zoom (a.k.a. *image pyramid*, the same idea behind the David
Rumsey Map Collection viewer) slices the image into many small tiles at several
resolutions, so only what you look at is downloaded. OpenSeadragon stitches them
back together with buttery-smooth pan/zoom.

## 1. Add your map

Open `index.html`, find the `CONFIG` block near the bottom, and pick one option.

### Option A — Deep Zoom Image (`.dzi`) — recommended for huge scans

Generate a tile pyramid from your high-res image (free, no server):

**libvips (fastest):**
```bash
# produces assets/map.dzi + assets/map_files/…
vips dzsave your-map.tif assets/map --tile-size 256 --overlap 1 --suffix .jpg
```

**Python (pyvips):**
```bash
pip install pyvips
python - <<'PY'
import pyvips
pyvips.Image.new_from_file("your-map.tif").dzsave("assets/map")
PY
```

Then set:
```js
sources: ['assets/map.dzi'],
```

### Option B — a single still image (quickest)

Good for moderate sizes (a few thousand px per side). OpenSeadragon tiles it on
the fly:
```js
sources: [{ type: 'image', url: 'assets/map.jpg' }],
```

### Option C — IIIF image API (what many museums use)
```js
sources: ['https://example.org/iiif/<id>/info.json'],
```
Remote sources must send permissive CORS headers. If yours needs credentials,
also set `crossOriginPolicy: true` (or `'use-credentials'`) in `CONFIG`.

### Option D — multiple pages
```js
sources: ['assets/vol1.dzi', 'assets/vol2.dzi'],
```

## 2. Deploy (free)

- **GitHub Pages:** commit this folder; if the repo is published at its root it is
  live at `https://<user>.github.io/<repo>/mapamundi/`.
- **Vercel / Netlify:** drop the folder in (static site, no build command).

## Features

- Full-viewport dark antique theme, fully responsive (desktop + mobile).
- Mouse-wheel zoom, drag-to-pan, double-click zoom, and touch pinch-zoom/rotate.
- Mini overview **navigator** (bottom-right) with a draggable viewport box.
- Clean overlay toolbar: zoom in/out, Home reset, navigator toggle, fullscreen.
- Keyboard: arrow keys pan, `+`/`-` zoom, `Home` resets.
- Friendly in-page error if a tile source can't be reached.

## Customizing

- **Title/subtitle:** edit the `.brand-text` markup in `index.html`.
- **Colors/theme:** the `:root` CSS variables (`--gold`, `--bg`, `--ink`, …).
- **Start view:** `viewer.viewport.goHome()` uses the image's default home
  rectangle; for a custom opening frame use `viewer.viewport.fitBounds(...)`
  on the `open` event.
- **Extra controls:** the toolbar buttons call `viewer.viewport.zoomBy()`,
  `.goHome()`, etc. — add your own the same way.

## Credits

Viewer: [OpenSeadragon](https://openseadragon.github.io/) (BSD-3). The default
demo tileset is OpenSeadragon's public example image — replace it with your own.
