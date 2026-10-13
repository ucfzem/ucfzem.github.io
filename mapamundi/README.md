# Mapamundi Viewer

A standalone, single-file deep-zoom viewer for high-resolution historical maps,
built with [OpenSeadragon](https://openseadragon.github.io/). No build step, no
server — it runs from `file://` or any static host (GitHub Pages, Vercel, Netlify…).

```
mapamundi/
├── index.html      ← the whole app (HTML + CSS + JS + config)
├── manifest.json   ← PWA manifest
├── sw.js           ← offline service worker (app shell + runtime tile caching)
├── icon.svg        ← icon (+ icon-192.png / icon-512.png)
├── README.md       ← this file
└── assets/         ← put your tiles / images here
```

**Default map:** Urbano Monte's **1587 planisphere** (main 60-sheet composite,
~61,000 × 62,000 px) from the David Rumsey Map Collection, streamed via the
Internet Archive's public IIIF image API. Only the small tiles you look at are
downloaded (a typical tile is ~4–50 KB), so nothing heavy is ever fetched or cached.

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
- **4-language UI** (EN 🇬🇧 / FR 🇫🇷 / ES 🇪🇸 / AR 🇲🇦) with Arabic **RTL** and
  `localStorage` persistence.
- **Interactive annotations** — gold map pins (North Pole, title, ocean, Terra
  Australis) that open a translated note card in the current language.
- **Always-visible info panel** — a translated biography of Urbano Monte, the map's
  revisions, a David Rumsey digital-restoration provenance note, and the pin notes,
  shown on load and collapsible via the panel header or the toolbar **ℹ️** button
  (`INFO` block).
- **Quick-navigation hotspots** — buttons that fly to the North Pole, Japan, the
  Southern Ocean and Sheet 58 (`HOTSPOTS` block; approximate coordinates).
- **"Made by UcfZem in 2026" credit** — shown as a badge in the panel and as a
  persistent on-screen watermark (`INFO[...].credit`).
- Keyboard: arrow keys pan, `+`/`-` zoom, `Home` resets.
- Offline-ready: installable PWA + service worker that caches the app shell and,
  as you browse, the tiles you actually view.
- Friendly in-page error if a tile source can't be reached.

## Customizing

- **Title/subtitle:** edit the `.brand-text` markup in `index.html`.
- **Colors/theme:** the `:root` CSS variables (`--gold`, `--bg`, `--ink`, …).
- **Start view:** `viewer.viewport.goHome()` uses the image's default home
  rectangle; for a custom opening frame use `viewer.viewport.fitBounds(...)`
  on the `open` event.
- **Extra controls:** the toolbar buttons call `viewer.viewport.zoomBy()`,
  `.goHome()`, etc. — add your own the same way.
- **Map pins / annotations:** edit the `PINS` array — each entry is
  `{ id, x, y, t:{en,fr,es,ar}, d:{en,fr,es,ar} }` where `x`/`y` are normalized
  `0..1` image coordinates (top-left = `0,0`). Add or remove entries freely.
- **Info panel text:** edit the `INFO` object (`title/credit/bio/revisions[]`) per
  language, and `HOTSPOTS` for the quick-nav coordinate buttons.

## Credits

Viewer: [OpenSeadragon](https://openseadragon.github.io/) (BSD-3). The default map is
Urbano Monte's 1587 planisphere (public domain) from the David Rumsey Map Collection,
courtesy of Stanford University Libraries, streamed via the Internet Archive's IIIF API.
