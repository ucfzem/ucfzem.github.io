#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract_stories.py — Extract all stories from «صحيح القصص النبوي» PDF
into a structured data/sahih-al-qasas.json.

Usage:
    pip install pdfplumber
    python tools/extract_stories.py ar_Prophet_Stories.pdf

If the PDF uses a different title marker, adjust STORY_HEADER_RE below.
"""
import pdfplumber
import json
import re
import os
import sys

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else "ar_Prophet_Stories.pdf"
OUTPUT_JSON = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                           "data", "sahih-al-qasas.json")

# Split on story headers like "القصة الأولى", "القصة 1", "القصة الخامسة والخمسون"
STORY_HEADER_RE = re.compile(r'\n(?=القصة\s+(?:ال|[\d\u0660-\u0669]))')

# Categories (أبواب) — used to tag stories by their باب heading.
CATEGORIES = [
    "قصص الأنبياء والمرسلين",
    "القصص الدالة على عجائب قدرة الله",
    "القصص الدالة على فضائل الأعمال",
    "قصص النماذج الإيمانية الراقية",
    "قصص النماذج السيئة",
]


def detect_category(text):
    for c in CATEGORIES:
        if c in text:
            return c
    return ""


def extract():
    print(f"Opening PDF: {PDF_PATH} ...")
    full_text = ""
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            t = page.extract_text()
            if t:
                full_text += t + "\n"
            if (i + 1) % 50 == 0:
                print(f"  processed {i + 1} pages ...")

    print("Parsing stories ...")
    chunks = STORY_HEADER_RE.split(full_text)
    stories = []
    counter = 0
    for chunk in chunks:
        lines = [l.strip() for l in chunk.split("\n") if l.strip()]
        if not lines:
            continue
        if lines[0].startswith("القصة"):
            counter += 1
            header = lines[0]
            title = lines[1] if len(lines) > 1 else header
            content = "\n\n".join(lines[2:]) if len(lines) > 2 else "\n\n".join(lines[1:])
            stories.append({
                "id": counter,
                "number": counter,
                "header": header,
                "category": detect_category(chunk),
                "title": title,
                "content": content,
            })

    output = {
        "bookInfo": {
            "title": "صحيح القصص النبوي",
            "author": "د. عمر سليمان الأشقر",
            "totalStories": len(stories),
            "language": "ar",
            "direction": "rtl",
        },
        "stories": stories,
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"✅ Extracted {len(stories)} stories -> {OUTPUT_JSON}")


if __name__ == "__main__":
    extract()
