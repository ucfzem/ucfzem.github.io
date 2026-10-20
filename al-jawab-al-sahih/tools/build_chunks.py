#!/usr/bin/env python3
"""Shamela-style raw text -> al-jawab-al-sahih/data/{manifest.json,vol_N.json}.

Usage:
    python3 tools/build_chunks.py al_jawab_al_sahih.txt [--out data] [--arabic-title 'الجزء الأول']

Input: one volume per section, separated by lines containing "الجزء N".
Output schema (must match index.html loader):
    manifest.json : {book_title, author, total_volumes, volumes:[{id,title,file,chapter_count,word_count}]}
    vol_N.json    : {title, chapters:[{id, title, paragraphs:[...]}]}
"""
import argparse
import json
import os
import re
import sys

VOL_PATTERN = re.compile(r"[\[（(]?\s*الج\s*ـ?زء\s*([0-9٠-٩]+)\s*[\]）)]?")
CHAPTER_HEAD = re.compile(
    r"^\s*((?:الباب|باب|الفصل|فصل|المسألة|مسألة|الأصل|أصل|القاعدة|قاعدة|"
    r"التتمة|تتمة|المقدمة|مقدمة|الخاتمة|خاتمة)\s+"
    r"(?:الاول|الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|"
    r"العاشر|الحادي|الأولى|الثانية|مقدمة|خاتمة|[0-9\u0660-\u0669]+)\b.*)$"
)

PAGE_MARKER_PATTERN = re.compile(
    r"[\[（(]\s*الجزء\s*[0-9٠-٩]+\s*-\s*الصفحة\s*[0-9٠-٩]+\s*[\]）)]"
)
DECORATION_PATTERN = re.compile(r"^[\s*✦✧❂❁۞◆◇■□▪▫─━═│·،.،*+~_\-–—={}\d٠-٩\t]+$")


def to_int(s):
    if s.isdigit():
        return int(s)
    return int(re.sub(r"[^\d]", "", str(s).translate(
        {ord(c): str(i) for i, c in enumerate("٠١٢٣٤٥٦٧٨٩")})) or 1)


def clean_arabic_text(line):
    line = line.replace("\u00a0", " ").replace("\ufeff", "")
    line = PAGE_MARKER_PATTERN.sub(" ", line)
    line = re.sub(r"\s+", " ", line)
    return line.strip()


def is_decoration(line):
    stripped = line.strip()
    if not stripped:
        return True
    if PAGE_MARKER_PATTERN.fullmatch(stripped):
        return True
    return bool(DECORATION_PATTERN.match(stripped))


def split_into_paragraphs(text, max_chars=700):
    """Split a chapter body into reading-sized paragraphs on sentence ends."""
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    sentences = re.split(r"(?<=[.。!؟؟:])\s+", text)
    paras, buf = [], ""
    for s in sentences:
        if buf and len(buf) + len(s) + 1 > max_chars:
            paras.append(buf.strip())
            buf = s
        else:
            buf = (buf + " " + s).strip()
    if buf:
        paras.append(buf.strip())
    return paras


def word_count(s):
    return len(re.findall(r"[\w\u0600-\u06FF]+", s))


def process_book_file(path):
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()

    volumes = []
    current = None
    current_chapter = None

    def close_chapter():
        nonlocal current_chapter
        if current_chapter:
            buf = current_chapter.pop("_buf", "").strip()
            if buf:
                current_chapter["paragraphs"].extend(split_into_paragraphs(buf))
            if current_chapter["paragraphs"]:
                current["chapters"].append(current_chapter)
        current_chapter = None

    def close_volume():
        nonlocal current
        close_chapter()
        if current:
            volumes.append(current)
        current = None

    for raw_line in raw.splitlines():
        line = raw_line.rstrip()
        if line.startswith("@@HEAD:"):
            head_title = clean_arabic_text(line[7:])
            if head_title:
                close_chapter()
                current_chapter = {"title": head_title, "paragraphs": []}
            continue
        if is_decoration(line):
            continue

        m = VOL_PATTERN.fullmatch(line.strip()) or (
            VOL_PATTERN.search(line) if len(line.strip()) <= 40 else None
        )
        if m:
            close_volume()
            n = to_int(m.group(1))
            current = {"n": n, "title": f"الجزء {n}", "chapters": []}
            current_chapter = None
            continue

        if current is None:
            current = {"n": 1, "title": "الجزء 1", "chapters": []}

        stripped = line.strip()
        head = CHAPTER_HEAD.match(stripped) if len(stripped) <= 120 else None
        if head:
            close_chapter()
            current_chapter = {"title": clean_arabic_text(head.group(1)),
                               "paragraphs": []}
            continue

        text = clean_arabic_text(line)
        if not text:
            continue

        if current_chapter is None:
            current_chapter = {"title": "مقدمة الكتاب", "paragraphs": []}
        current_chapter.setdefault("_buf", "")
        current_chapter["_buf"] = (current_chapter.get("_buf", "") + " " + text).strip()

        buf = current_chapter["_buf"]
        if len(buf) >= 700 or re.search(r"[.،؛؟!»)\]\u201d\u2019]$", buf.rstrip()):
            paras = split_into_paragraphs(buf)
            current_chapter["paragraphs"].extend(paras)
            current_chapter["_buf"] = ""

    close_volume()
    if not volumes:
        sys.exit("no volumes found — check volume markers (الجزء N)")
    return volumes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "data"))
    ap.add_argument("--title", default="الجواب الصحيح لمن بدل دين المسيح")
    ap.add_argument("--author", default="شيخ الإسلام أحمد بن تيمية")
    args = ap.parse_args()

    out = os.path.abspath(args.out)
    os.makedirs(out, exist_ok=True)
    volumes = process_book_file(args.input)

    manifest = {
        "book_title": args.title,
        "author": args.author,
        "total_volumes": len(volumes),
        "volumes": [],
    }

    for vol in volumes:
        file_name = f"vol_{vol['n']}.json"
        ar_ord = {1: "الأول", 2: "الثاني", 3: "الثالث", 4: "الرابع", 5: "الخامس", 6: "السادس"}
        vol_title = f"الجزء {ar_ord.get(vol['n'], vol['n'])}"
        chapters = []
        for i, chap in enumerate(vol["chapters"]):
            chapters.append({
                "id": f"ch_{i}",
                "title": chap["title"],
                "paragraphs": [p for p in chap["paragraphs"] if p],
            })
        payload = {"title": vol_title, "lang": "ar", "chapters": chapters}
        with open(os.path.join(out, file_name), "w", encoding="utf-8") as fh:
            json.dump(payload, fh, ensure_ascii=False, indent=1)
        words = sum(word_count(p) for c in chapters for p in c["paragraphs"])
        manifest["volumes"].append({
            "id": f"vol_{vol['n']}",
            "title": vol_title,
            "title_en": f"Volume {vol['n']}",
            "title_fr": f"Tome {vol['n']}",
            "title_es": f"Volumen {vol['n']}",
            "file": file_name,
            "chapter_count": len(chapters),
            "word_count": words,
        })
        print(f"  {file_name}: {len(chapters)} chapters, {words} words")

    # declare which languages actually have translated chunks on disk
    lang_codes = {"ar"}
    for name in os.listdir(out):
        m2 = re.fullmatch(r"vol_\d+\.([a-z]{2})\.json", name)
        if m2:
            lang_codes.add(m2.group(1))
    manifest["content_langs"] = sorted(lang_codes)

    with open(os.path.join(out, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=1)
    print(f"manifest.json: {len(manifest['volumes'])} volumes -> {out}")


if __name__ == "__main__":
    main()
