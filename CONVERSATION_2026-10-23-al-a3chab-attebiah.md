# Conversation Summary - al-a3chab-attebiah complete
---
Completed 140-entry Moroccan medicinal plants encyclopedia with full monographs, dark mode, search, safety warnings for toxic plants, and cross-references for local names.

## Fix 2026-10-23 — mobile TOC overlay bug
Symptom: selecting an index item left the sidebar pinned over the text on narrow screens.
Root cause: sidebar was `w-full` + `sticky top-24` with near-viewport height, so in the mobile flex-col layout it stayed pinned over the content.
Fix: sidebar is now `hidden md:block` (desktop unchanged), mobile gets an "open index" floating button, and the index closes automatically after selecting an entry.
