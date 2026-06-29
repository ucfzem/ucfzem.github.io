# microInvoice Conversation Log — 29 June 2026

## 29 Jun 2026 — Hover Translate

### Feature
- Added mouse hover translation tooltip to all `[data-i18n]` elements
- Hovering any translated text shows its equivalents in all 4 languages with flag prefixes
- Current language marked with `→` prefix

### Implementation
- `setTitleTooltips()`: iterates `[data-i18n]` elements, builds `title` string with 🇬🇧 🇫🇷 🇪🇸 🇲🇦 translations
- Called at the end of `applyLang()` — fires on page load and language switch
- Added `data-i18n` attributes to invoice preview labels (piDocType, piFromLabel, piToLabel, piDescLabel, piAmtLabel, piTotalLabel)
- Fixed download/demo/add buttons to preserve `data-i18n` spans in `innerHTML`
- No external dependencies — uses native browser `title` attribute

### Files
- `microinvoice/index.html` — all changes
- `microinvoice/CONVERSATION.md` — this log
