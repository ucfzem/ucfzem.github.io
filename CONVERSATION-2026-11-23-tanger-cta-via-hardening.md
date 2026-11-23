# Tanger CTA Via Browser Hardening - 2026-11-23

## Git
- `3889873` style(tanger): harden history CTA against dark mode and text-clip overrides

## Changes
- `tanger/index.html`:
  - Added `<meta name="color-scheme" content="dark">` to reduce browser forced-dark/night recoloring.
  - `.history-more` and states now explicitly set `background-image`, `background-clip:border-box`, `-webkit-background-clip:border-box` to prevent gradient text-clip overrides.
  - Nested children reset `background/background-image/clip` and keep `#3B230E` + `-webkit-text-fill-color`.

## Verification
- Raw contains `color-scheme` and border-box/background-image guards.
- Worker serves updated raw `/tanger/`.

## Client Caveats
- Via Night Mode, stale SW, or cached visited state may still require: disable Night Mode, clear site data/unregister SW, or test Incognito with cache-busting query (`?v=2`).

## Links
- https://ucfzem.azer-tyu199p.workers.dev/tanger/?v=2
- https://ucfzem.github.io/tanger/?v=2
- https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/tanger/index.html
