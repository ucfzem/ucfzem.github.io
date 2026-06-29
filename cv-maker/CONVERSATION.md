# CV-Maker Conversation Log — 29 June 2026

## Problem
PDF export on Samsung S23 Ultra (Chrome Android) produced either "1/4 text" scaling or empty images. Arabic text corrupted with jsPDF helvetica font. All buttons dead after revert.

## Attempts

### 1. jsPDF Vector (triggerPrint)
- Pure jsPDF vector approach drawing text line by line
- **Failed**: Arabic text corrupted (helvetica has no Arabic glyphs)
- Still present as dead code in the file

### 2. html2canvas + jsPDF + New Tab (raw)
- Forced 794×1123 px A4 box, html2canvas capture → jsPDF → data URI → new tab with iframe + download button
- **Failed**: On mobile, html2canvas uses phone viewport causing ~25% scale text

### 3. html2pdf.js Wrapper
- **Failed**: `.save()` blocked on Chrome Android

### 4. `<table>` Layout + html2pdf
- **Failed**: blank capture

### 5. `window.print()` (final — working)
- Injects `@media print` CSS hiding everything except `#a4Preview`
- `@page { size: A4 portrait; margin: 0; }`
- `-webkit-print-color-adjust: exact` preserves dark sidebar
- Opens native print dialog → user selects "Save as PDF"
- Arabic renders natively via browser BiDi engine — no scaling issues, no glyph corruption, selectable text

### 6. Vercel Python API (attempted then reverted)
- ReportLab FastAPI at `api/generate_cv.py` for Arabic PDF generation
- **Failed**: unnecessary — `window.print()` already handles Arabic perfectly
- **Reverted**: removed `api/`, `requirements.txt`, cleaned `vercel.json`

### 7. Syntax Error Fix (critical)
- Revert left orphaned `fallbackPrint()` body at top level → stray `}` broke entire script
- **Fixed**: removed orphaned code, `downloadPDF()` now clean and single

## Final State
- `downloadPDF()`: single `window.print()` call for all languages
- `renderModern(lang)`: flex layout, 794×1120, RTL support via Cairo font + `unicode-bidi`
- CDNs: jspdf + html2canvas loaded (legacy/unused)
- Google Fonts: Inter, Plus Jakarta Sans, Cairo
- Deployed to GitHub Pages only (no Vercel)

## Files
- `cv-maker/index.html` — all template functions + PDF export
- `cv-maker/CONVERSATION.md` — this log
