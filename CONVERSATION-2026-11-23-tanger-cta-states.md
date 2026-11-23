# Tanger CTA Link-State Consistency - 2026-11-23

## Git
- `9becde0` style(tanger): lock history CTA colors across link states

## Change
- `tanger/index.html` `.history-more` ("اقرأ التاريخ كاملاً", `data-i18n="history_more"`) now explicitly locks appearance across `:link,:visited,:hover,:focus,:focus-visible,:active`.
- Enforced: gold background/gradient, `#3B230E` text, `#b38f27` border, no underline/outline, `-webkit-text-fill-color`, and nested child `color/fill/stroke/currentColor` inheritance.
- Hover/focus keeps only lift/shadow transition; color/background remain deterministic.

## Verification
- Raw GitHub has 2 occurrences of `-webkit-text-fill-color: #3B230E !important`.
- Worker `/tanger/` serves updated markup (verified by grep).

## Caveats
- GitHub Pages `ucfzem.github.io` may still be stale until CDN propagation.
- Browser/Via Night Mode or stale SW/site data can still alter appearance client-side; clear site data/unregister SW or use Incognito once.

## Links
- https://ucfzem.azer-tyu199p.workers.dev/tanger/
- https://ucfzem.github.io/tanger/
- https://raw.githubusercontent.com/ucfzem/ucfzem.github.io/main/tanger/index.html
- https://github.com/ucfzem/ucfzem.github.io/blob/main/CONVERSATION-2026-11-23-tanger-cta-states.md
