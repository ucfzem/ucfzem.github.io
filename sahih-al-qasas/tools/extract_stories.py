#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract_stories.py — Extract all stories from «صحيح القصص النبوي» PDF
into a structured data/sahih-al-qasas.json.

This script only processes a PDF that YOU provide locally. It does not
download anything. Run it on your own copy.

Usage:
    pip install pdfplumber
    python tools/extract_stories.py ar_Prophet_Stories.pdf
"""
import pdfplumber
import json
import re
import os
import sys

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else "ar_Prophet_Stories.pdf"
OUTPUT_JSON = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                           "data", "sahih-al-qasas.json")

CATEGORIES = [
    "قصص الأنبياء والمرسلين", "قصص الأنبياء",
    "القصص الدالة على عجائب قدرة الله", "عجائب قدرة الله",
    "القصص الدالة على فضائل الأعمال", "فضائل الأعمال",
    "قصص النماذج الإيمانية الراقية", "النماذج الإيمانية",
    "قصص النماذج السيئة", "النماذج السيئة",
]
ALIAS = {
    "قصص الأنبياء": "قصص الأنبياء والمرسلين",
    "عجائب قدرة الله": "القصص الدالة على عجائب قدرة الله",
    "فضائل الأعمال": "القصص الدالة على فضائل الأعمال",
    "النماذج الإيمانية": "قصص النماذج الإيمانية الراقية",
    "النماذج السيئة": "قصص النماذج السيئة",
}

AR_ORDINALS = (
    "الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|التاسعة|العاشرة|"
    "الحادية عشرة|الثانية عشرة|الثالثة عشرة|الرابعة عشرة|الخامسة عشرة|"
    "السادسة عشرة|السابعة عشرة|الثامنة عشرة|التاسعة عشرة|العشرون|"
    "الحادية والعشرون|الثانية والعشرون|الثالثة والعشرون|الرابعة والعشرون|"
    "الخامسة والعشرون|السادسة والعشرون|السابعة والعشرون|الثامنة والعشرون|"
    "التاسعة والعشرون|الثلاثون|الأربعون|الخمسون"
)
STORY_HEADER_RE = re.compile(
    r"^القصة\s+(?:" + AR_ORDINALS + r"|\d+|[\u0660-\u0669]+)\b"
)


def detect_category(text):
    best = ""
    for c in CATEGORIES:
        if c in text and len(c) > len(best):
            best = c
    return ALIAS.get(best, best)


def extract_title(lines):
    for l in lines[1:4]:
        if re.match(r"^[\d\s.\-–—]+$", l):
            continue
        if re.search(r"صحيح القصص النبوي|دار النفائس|الأشقر", l):
            continue
        if len(l) >= 4 and not STORY_HEADER_RE.match(l):
            return l
    return lines[0]


def clean_lines(text):
    out = []
    for l in text.split("\n"):
        l = l.strip()
        if not l:
            continue
        if re.match(r"^\d+$", l):
            continue
        if re.match(r"^[-–—•·\s]+$", l):
            continue
        out.append(l)
    return out


def extract():
    print(f"Opening PDF: {PDF_PATH} ...")
    full_text = ""
    with pdfplumber.open(PDF_PATH) as pdf:
        n = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            t = page.extract_text()
            if t:
                full_text += t + "\n"
            if (i + 1) % 50 == 0:
                print(f"  processed {i + 1}/{n} pages ...")

    lines = clean_lines(full_text)
    chunks = []
    current = []
    current_cat = ""
    pending_cat = ""
    for line in lines:
        cat = detect_category(line)
        if cat and not STORY_HEADER_RE.match(line):
            pending_cat = cat
        if STORY_HEADER_RE.match(line):
            if current:
                chunks.append({"category": current_cat, "lines": current})
            current_cat = pending_cat or current_cat
            current = [line]
        elif current:
            current.append(line)
    if current:
        chunks.append({"category": current_cat, "lines": current})

    stories = []
    counter = 0
    for chunk in chunks:
        if not STORY_HEADER_RE.match(chunk["lines"][0]):
            continue
        counter += 1
        header = chunk["lines"][0]
        title = extract_title(chunk["lines"])
        try:
            title_idx = chunk["lines"].index(title)
            rest = chunk["lines"][title_idx + 1:]
        except ValueError:
            rest = chunk["lines"][1:]
        content = "\n\n".join(rest)
        stories.append({
            "id": counter,
            "number": counter,
            "header": header,
            "category": chunk["category"] or detect_category("\n".join(chunk["lines"])),
            "title": title,
            "content": content or "\n\n".join(chunk["lines"][1:]),
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
    with_cat = sum(1 for s in stories if s["category"])
    print(f"✅ Extracted {len(stories)} stories -> {OUTPUT_JSON}")
    print(f"   with باب/category: {with_cat}/{len(stories)}")
    if len(stories) != 57:
        print("   ⚠️ Expected 57 stories. The header regex may need tuning for this PDF.")


if __name__ == "__main__":
    extract()
