#!/usr/bin/env python3
"""Rebuild masoudi data.json with exact chapter anchors.

The Akhbar text comes from Shamela pages and contains page-boundary tails.
We re-split it using the 41 chapter markers from the Shamela table of contents.
Muruj is already chapter-based in the archive source; we keep its boundaries,
add stable IDs, and mark obvious OCR/TOC fragments as hidden.
"""
from __future__ import annotations

import argparse
import bisect
import difflib
import json
import re
import unicodedata
from pathlib import Path

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

# Source-section indices (0-based) in the old data.json.
HIDDEN_MURUJ = {
    57: "toc_title_fragment",
    86: "toc_duplicate_fragment",
    87: "toc_duplicate_fragment",
    125: "title_fragment",
    129: "toc_duplicate_fragment",
    130: "toc_duplicate_fragment",
}


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


def para_at(offsets: list[int], pos: int) -> int:
    i = bisect.bisect_right(offsets, pos) - 1
    return max(0, min(i, len(offsets) - 1))


def slice_paras(paras: list[str], offsets: list[int], start: int, end: int) -> list[str]:
    if end <= start:
        return []
    out: list[str] = []
    i = para_at(offsets, start)
    while i < len(paras) and offsets[i] < end:
        pstart = offsets[i]
        pend = pstart + len(paras[i])
        a = max(start, pstart) - pstart
        b = min(end, pend) - pstart
        if b > a:
            out.append(paras[i][a:b])
        i += 1
    return [p for p in out if p.strip()]


def find_akhbar_starts(secs: list[dict]) -> list[dict]:
    paras: list[str] = []
    psec: list[int] = []
    for si, s in enumerate(secs):
        for p in s["x"]:
            paras.append(p)
            psec.append(si)

    text = "\n".join(paras)
    offsets: list[int] = []
    off = 0
    for p in paras:
        offsets.append(off)
        off += len(p) + 1

    markers: list[dict] = []
    for m in re.finditer(r"\[([^\]\n]{1,220})\]", text):
        inner = norm(m.group(1))
        for title in AKHBAR_TITLES:
            nt = norm(title)
            min_len = max(6, int(len(nt) * 0.6))
            if inner == nt or (
                len(inner) >= min_len and (inner.startswith(nt) or nt.startswith(inner))
            ):
                markers.append(
                    {
                        "title": title,
                        "start": m.start(),
                        "end": m.end(),
                        "inner": inner,
                    }
                )
                break

    sec_titles = [norm(s["t"]) for s in secs]
    starts: list[dict] = []
    last = 0
    for title in AKHBAR_TITLES:
        nt = norm(title)
        found = [m for m in markers if m["title"] == title and m["start"] >= last]
        if not found:
            found = [m for m in markers if m["title"] == title]
        if found:
            chosen = min(found, key=lambda m: m["start"])
        else:
            exact = [i for i, t in enumerate(sec_titles) if t == nt]
            if exact:
                si = exact[0]
                chosen = {
                    "title": title,
                    "start": offsets[min(pi for pi, x in enumerate(psec) if x == si)],
                    "end": None,
                }
            else:
                close = difflib.get_close_matches(nt, sec_titles, n=1, cutoff=0.82)
                if not close:
                    raise SystemExit(f"cannot locate Akhbar chapter: {title!r}")
                si = sec_titles.index(close[0])
                chosen = {
                    "title": title,
                    "start": offsets[min(pi for pi, x in enumerate(psec) if x == si)],
                    "end": None,
                }
        starts.append(chosen)
        last = chosen["start"] + 1

    starts.sort(key=lambda x: x["start"])
    if len(starts) != len(AKHBAR_TITLES):
        raise SystemExit(f"expected {len(AKHBAR_TITLES)} starts, got {len(starts)}")
    for a, b in zip(starts, starts[1:]):
        if a["start"] >= b["start"]:
            raise SystemExit(f"non-increasing starts: {a['title']!r} -> {b['title']!r}")

    chapters: list[dict] = []
    for i, st in enumerate(starts):
        start = st["start"]
        end = starts[i + 1]["start"] if i + 1 < len(starts) else len(text)
        content_start = 0 if i == 0 else (st["end"] if st["end"] is not None else start)
        x = slice_paras(paras, offsets, content_start, end)
        if i == 0 and st["end"] is not None:
            marker_text = text[st["start"] : st["end"]]
            x = [p.replace(marker_text, "", 1) for p in x]
        x = [p.strip() for p in x if p.strip()]
        pi = para_at(offsets, min(start, len(text) - 1))
        source_sec = secs[psec[pi]]
        chapters.append(
            {
                "id": f"akhbar-chap-{i + 1}",
                "w": "akhbar",
                "t": st["title"],
                "p": source_sec["p"],
                "chapter": i + 1,
                "source_section": psec[pi],
                "x": x,
            }
        )

    for i, ch in enumerate(chapters):
        first = ch["x"][0] if ch["x"] else ""
        next_title = chapters[i + 1]["t"] if i + 1 < len(chapters) else ""
        if next_title and norm(first).startswith(norm(next_title)):
            raise SystemExit(f"chapter {i + 1} starts with next title")
    return chapters


def build_muruj(secs: list[dict]) -> tuple[list[dict], list[str], list[dict]]:
    muruj = [s for s in secs if s.get("w") == "muruj"]
    out: list[dict] = []
    visible_ids: list[str] = []
    warnings: list[dict] = []

    for i, s in enumerate(muruj):
        source_index = 37 + i
        n = i + 1
        sid = f"muruj-chap-{n}"
        item = {
            "id": sid,
            "w": "muruj",
            "t": s["t"],
            "p": s["p"],
            "chapter": n,
            "x": s["x"],
        }
        if source_index in HIDDEN_MURUJ:
            item["hidden"] = True
            item["hiddenReason"] = HIDDEN_MURUJ[source_index]
            warnings.append(
                {
                    "id": sid,
                    "title": s["t"],
                    "reason": HIDDEN_MURUJ[source_index],
                }
            )
        else:
            visible_ids.append(sid)
        out.append(item)

    # The 28-char fragment at old section 57 belongs to the end of section 56.
    by_chapter = {x["chapter"]: x for x in out}
    if 21 in by_chapter and 20 in by_chapter:  # old 57 / old 56
        by_chapter[20]["x"].extend(by_chapter[21]["x"])
        by_chapter[21]["x"] = []

    return out, visible_ids, warnings


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", type=Path, default=Path(__file__).resolve().parents[1] / "data.json")
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()
    output = args.output or args.input

    data = json.loads(args.input.read_text(encoding="utf-8"))
    old_sections = data["sections"]

    akhbar_sources = [s for s in old_sections if s.get("w") == "akhbar"]
    akhbar = find_akhbar_starts(akhbar_sources)
    muruj, muruj_ids, warnings = build_muruj(old_sections)

    sections = akhbar + muruj
    by_id = {s["id"]: s for s in sections}
    if len(by_id) != len(sections):
        raise SystemExit("duplicate section ids")

    books = {
        "akhbar": {
            "title": data.get("meta", {}).get("works", {}).get("akhbar", {}).get("title", "أخبار الزمان"),
            "chapters": [s["id"] for s in akhbar],
        },
        "muruj": {
            "title": data.get("meta", {}).get("works", {}).get("muruj", {}).get("title", "مروج الذهب"),
            "chapters": muruj_ids,
        },
    }

    meta = data.get("meta", {})
    meta["segmentation"] = {
        "akhbar": {
            "method": "shamela_toc_markers",
            "source_sections": len(akhbar_sources),
            "chapters": len(akhbar),
        },
        "muruj": {
            "method": "archive_source_sections",
            "source_sections": len(muruj),
            "chapters": len(muruj_ids),
            "hidden": sorted(HIDDEN_MURUJ),
        },
    }
    meta["warnings"] = warnings

    result = {"meta": meta, "books": books, "sections": sections}
    output.write_text(
        json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"wrote {output}")
    print(f"akhbar chapters: {len(akhbar)}")
    print(f"muruj visible: {len(muruj_ids)} / hidden: {len(warnings)}")
    print(f"total sections: {len(sections)}")
    for ch in akhbar[:5] + akhbar[-2:]:
        print(f"  {ch['id']} p={ch['p']} len={sum(map(len, ch['x']))} {ch['t'][:55]}")


if __name__ == "__main__":
    main()
