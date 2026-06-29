# CV-Maker Conversation Log — 29 June 2026

## Problem
PDF export on Samsung S23 Ultra (Chrome Android) produced either "1/4 text" scaling or empty images. Arabic text corrupted with jsPDF helvetica font.

## Attempts

### 1. jsPDF Vector (triggerPrint)
- Pure jsPDF vector approach drawing text line by line
- **Failed**: Arabic text corrupted (helvetica has no Arabic glyphs)
- Still present as dead code in the file

### 2. html2canvas + jsPDF + New Tab (raw)
- Forced 794×1123 px A4 box, html2canvas capture → jsPDF → data URI → new tab with iframe + download button
- **Failed**: On mobile, html2canvas uses phone viewport causing ~25% scale text
- Attempted fixes: `windowWidth: 794`, forced column widths (278px / 516px), forced heights (1123px)

### 3. html2pdf.js Wrapper
- Used `html2pdf().set(opt).from(element).save()`
- **Failed**: `.save()` blocked on Chrome Android (programmatic download loses user gesture)

### 4. `<table>` Layout + html2pdf
- Switched renderModern from flex `<div>` to `<table>` for rigid dimensions
- **Failed**: "images vides" (blank capture)

### 5. `window.print()` (current — working)
- No html2canvas, no jsPDF, no html2pdf
- Injects `@media print` CSS: hides everything except `#a4Preview`
- `@page { size: A4 portrait; margin: 0; }`
- `-webkit-print-color-adjust: exact` preserves dark sidebar
- Opens native print dialog → user selects "Save as PDF"
- Arabic renders natively, no scaling issues, no download restrictions
- Arabic RTL requires `dir="rtl"` on the template container + Cairo font
- html2canvas fundamentally cannot handle Arabic glyphs (bidi rendering, phone number reversal, broken letter connections)
- `window.print()` delegates to browser's native BiDi engine — perfect Arabic rendering, selectable text in PDF

## Current State
- `renderModern()`: flex-based `<div>` layout, explicit 794×1123, 278px sidebar / 516px main
  - RTL support: `currentLang === 'ar'` → `dir="rtl"`, Cairo font, mirrored summary border, swapped date margins
- `downloadPDF()`: `window.print()` with print-specific CSS
- CDNs: jspdf + html2canvas still loaded (legacy), html2pdf removed
- Google Fonts: Inter, Plus Jakarta Sans, Cairo added
- Deployed to GitHub Pages

## Files
- `cv-maker/index.html` — all template functions + PDF export
- `cv-maker/triggerprint_fix.js` — untracked helper file
