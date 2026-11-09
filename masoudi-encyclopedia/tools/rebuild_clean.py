#!/usr/bin/env python3
"""Rebuild data.json from the clean Ketabonline exports (Akhbar 6117, Muruj 16498)."""
from __future__ import annotations

import argparse
import bisect
import json
import re
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup

AKHBAR_TITLES = [
    "كلمة الناشر",
    "مقدمة الطبعة الأولى",
    "من هو المسعودي",
    "فاتحة الكتاب",
    "ذكر عمر الدنيا",
    "ذكر الأمم المخلوقات قبل آدم عليه السلام",
    "ذكر الجن وأجناسهم وقبائلهم",
    "ذكر الارض وما فيها",
    "ذكر البحر المحيط وما فيه من العجائب",
    "خبر تنيس",
    "ذكر آدم عليه السلام وولده",
    "ذكر شئ من أخبار ولده",
    "حام بن نوح عليه السلام",
    "ذكر كنعان بن حام",
    "ذكر يافث بن نوح",
    "ذكر يأجوج ومأجوج",
    "ذكر الصقالبة",
    "ذكر اليونانيين",
    "ذكر الصين",
    "ذكر الاهتردة",
    "ذكر الافرنج",
    "مملكة الاندلس",
    "ذكر مملكة البرجان",
    "ذكر مملكة الترك",
    "ذكر مملكة الروم",
    "ذكر مملكة الفرس",
    "ذكر مملكة خراسان",
    "ذكر سام بن نوح",
    "ذكر إبراهيم عليه السلام",
    "ذكر اسماعيل عليه السلام",
    "حدث البلبلة",
    "ذكر عاد",
    "ذكر عناق بنت آدم عليه السلام",
    "ذكر أخبار الكهان من العرب",
    "خبر اليمامة الزرقاء",
    "قونية الكاهنة",
    "(خبر الكهان بعد الطوفان)",
    "أول من بنى الاهرام",
    "ذكر ملوك مصر قبل الطوفان",
    "ذكر دخولهم البلدة، وكيف خرجوا اليها ونزلوا بها وحروبهم لمن حاربهم من الملوك",
    "ذكر ملوك مصر بعد الطوفان",
]


def norm_char(ch: str) -> str:
    ch = unicodedata.normalize("NFKC", ch)
    if re.match(r"[\u064B-\u0652\u0670\u06D6-\u06ED\u0640\u200f\u200e]", ch):
        return ""
    ch = (
        ch.replace("أ", "ا")
        .replace("إ", "ا")
        .replace("آ", "ا")
        .replace("ٱ", "ا")
        .replace("ى", "ي")
        .replace("ؤ", "و")
        .replace("ئ", "ي")
        .replace("ة", "ه")
    )
    if re.match(r"[^\w\u0600-\u06FF]", ch):
        return " "
    return ch.lower()


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", "".join(norm_char(c) for c in s)).strip()


def walk(nodes: list[dict], depth: int = 0):
    for node in nodes:
        yield depth, node
        yield from walk(node.get("children") or [], depth + 1)


def parse_pages(path: Path) -> tuple[list[dict], list[dict]]:
    book = json.loads(path.read_text(encoding="utf-8"))
    blocks: list[dict] = []
    for page in book["pages"]:
        soup = BeautifulSoup(page["content"], "html.parser")
        for el in soup.find_all("p"):
            titles = [norm(x.get_text(" ", strip=True)) for x in el.find_all(class_="g-title")]
            for x in el.find_all(class_="g-title"):
                x.decompose()
            text = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
            blocks.append(
                {
                    "pid": page["id"],
                    "page": page["page"],
                    "part": page["part"]["name"],
                    "text": text,
                    "titles": titles,
                }
            )
    return book, blocks


FOOTNOTE_RE = re.compile(r"^[\u0660-\u0669]\s*\)\s*")


def is_footnote(text: str) -> bool:
    return bool(FOOTNOTE_RE.match(text.strip())) or text.strip() in {"(*)", "(*)"}


def title_match(needle: str, text: str) -> str | None:
    if not text:
        return None
    hay = norm(text)
    if not hay:
        return None
    if hay == needle:
        return "exact"
    if hay.startswith(needle):
        rest = hay[len(needle) :].strip()
        return "exact" if len(rest) <= 2 else "contains"
    if needle in hay and len(needle) >= 8:
        return "contains"
    return None


def locate_titles(nodes: list[tuple[int, dict]], blocks: list[dict]) -> dict[int, dict]:
    first_block: dict[int, int] = {}
    for i, block in enumerate(blocks):
        first_block.setdefault(block["pid"], i)

    located: dict[int, dict] = {}
    last = -1
    for _, node in nodes:
        needle = norm(node["title"])
        page_start = first_block.get(node["page_id"], 0)
        low = max(page_start, last + 1)
        found = None
        kind = ""
        match = ""

        for i in range(low, len(blocks)):
            if any(title_match(needle, t) == "exact" for t in blocks[i]["titles"]):
                found, kind, match = i, "title", "exact"
                break
        if found is None:
            for i in range(low, len(blocks)):
                if title_match(needle, blocks[i]["text"]) == "exact":
                    found, kind, match = i, "text", "exact"
                    break
        if found is None:
            for i in range(low, len(blocks)):
                if any(title_match(needle, t) == "contains" for t in blocks[i]["titles"]):
                    found, kind, match = i, "title", "contains"
                    break
        if found is None:
            for i in range(low, len(blocks)):
                if title_match(needle, blocks[i]["text"]) == "contains":
                    found, kind, match = i, "text", "contains"
                    break
        if found is None:
            found, kind, match = max(last + 1, page_start), "fallback", "none"

        located[node["id"]] = {
            "pos": found,
            "drop": kind == "title" or (kind == "text" and match == "exact"),
        }
        last = found
    return located


def merge_empty(chapters: list[dict]) -> list[dict]:
    out: list[dict] = []
    i = 0
    while i < len(chapters):
        chapter = chapters[i]
        if chapter["x"]:
            out.append(chapter)
            i += 1
            continue
        j = i + 1
        while j < len(chapters) and not chapters[j]["x"]:
            j += 1
        if j < len(chapters):
            chapters[j]["t"] = chapter["t"]
            out.append(chapters[j])
            i = j + 1
        else:
            i += 1

    for number, chapter in enumerate(out, 1):
        chapter["chapter"] = number
        chapter["id"] = chapter["id"].rsplit("-", 1)[0] + f"-{number}"
    return out


def build_book(path: Path, work: str, muruj: bool) -> list[dict]:
    book, blocks = parse_pages(path)
    nodes = [(depth, node) for depth, node in walk(book["index"])]
    nodes.sort(key=lambda item: (item[1]["page_id"], item[1]["id"]))
    located = locate_titles(nodes, blocks)

    selected: list[dict] = []
    for depth, node in nodes:
        if muruj:
            if depth == 1 and not norm(node["title"]).startswith("فهرس"):
                selected.append(node)
        else:
            selected.append(node)

    positions = sorted({meta["pos"] for meta in located.values()})

    def next_boundary(pos: int) -> int:
        idx = bisect.bisect_right(positions, pos)
        return positions[idx] if idx < len(positions) else len(blocks)

    part_number = {
        page["id"]: int(page["part"]["name"])
        for page in book["pages"]
        if str(page["part"]["name"]).isdigit()
    }

    chapters: list[dict] = []
    for number, node in enumerate(selected, 1):
        meta = located[node["id"]]
        start = meta["pos"] + 1 if meta["drop"] else meta["pos"]
        end = next_boundary(meta["pos"])
        paragraphs: list[str] = []
        footnotes: list[str] = []
        for block in blocks[start:end]:
            if block["titles"]:
                continue
            text = block["text"]
            if not text:
                continue
            normalized = norm(text)
            if len(normalized) < 2:
                continue
            if normalized.startswith("الجزء ") and len(normalized) < 25:
                continue
            if re.fullmatch(r"[0-9٠-٩]+", text.strip()):
                continue
            if normalized.startswith("فهرس الموضوعات"):
                continue
            if normalized.startswith("تم الجزء") and len(normalized) < 120:
                continue
            if text in {"(*)", "* * *"}:
                continue
            if is_footnote(text):
                footnotes.append(text)
                continue
            paragraphs.append(text)

        chapters.append(
            {
                "id": f"{work}-chap-{number}",
                "w": work,
                "t": node["title"],
                "p": node["page"],
                "v": part_number.get(node["page_id"]),
                "chapter": number,
                "page_id": node["page_id"],
                "x": paragraphs,
                "footnotes": footnotes,
            }
        )

    return merge_empty(chapters)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    ap = argparse.ArgumentParser()
    ap.add_argument("--akhbar", type=Path, required=True)
    ap.add_argument("--muruj", type=Path, required=True)
    ap.add_argument("--template", type=Path, default=root / "data.json")
    ap.add_argument("--output", type=Path, default=root / "data.json")
    args = ap.parse_args()

    template = json.loads(args.template.read_text(encoding="utf-8"))
    akhbar = build_book(args.akhbar, "akhbar", muruj=False)
    muruj = build_book(args.muruj, "muruj", muruj=True)

    if [c["t"] for c in akhbar] != AKHBAR_TITLES:
        raise SystemExit("Akhbar chapter titles do not match the expected TOC")
    if any(not c["x"] for c in akhbar + muruj):
        raise SystemExit("empty chapter generated")
    if len({c["id"] for c in akhbar + muruj}) != len(akhbar) + len(muruj):
        raise SystemExit("duplicate chapter ids")

    chapters = [c["id"] for c in muruj]
    meta = template.get("meta", {})
    meta["segmentation"] = {
        "akhbar": {
            "method": "ketabonline_6117_index",
            "source_pages": 258,
            "chapters": len(akhbar),
        },
        "muruj": {
            "method": "ketabonline_16498_index",
            "source_pages": 1697,
            "chapters": len(muruj),
        },
    }
    meta["warnings"] = []

    books = {
        "akhbar": {
            "title": meta.get("works", {}).get("akhbar", {}).get("title", "أخبار الزمان"),
            "chapters": [c["id"] for c in akhbar],
        },
        "muruj": {
            "title": meta.get("works", {}).get("muruj", {}).get("title", "مروج الذهب"),
            "chapters": chapters,
        },
    }

    result = {"meta": meta, "books": books, "sections": akhbar + muruj}
    args.output.write_text(
        json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"wrote {args.output}")
    print(f"akhbar: {len(akhbar)} chapters")
    print(f"muruj: {len(muruj)} chapters")
    print(f"total: {len(akhbar) + len(muruj)} sections")


if __name__ == "__main__":
    main()
