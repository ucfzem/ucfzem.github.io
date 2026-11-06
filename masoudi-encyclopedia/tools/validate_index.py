#!/usr/bin/env python3
"""Validate the rebuilt masoudi data and static index wiring."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from rebuild_data import AKHBAR_TITLES, HIDDEN_MURUJ  # noqa: E402

ID_RE = re.compile(r"^(akhbar|muruj)-chap-(\d+)$")


def fail(msg: str) -> None:
    raise SystemExit(f"FAIL: {msg}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, default=Path(__file__).resolve().parents[1] / "data.json")
    ap.add_argument("--html", type=Path, default=Path(__file__).resolve().parents[1] / "index.html")
    args = ap.parse_args()

    data = json.loads(args.data.read_text(encoding="utf-8"))
    sections = data.get("sections") or []
    books = data.get("books") or {}
    by_id = {}
    for s in sections:
        sid = s.get("id", "")
        if not ID_RE.match(sid):
            fail(f"bad section id: {sid!r}")
        if sid in by_id:
            fail(f"duplicate section id: {sid}")
        by_id[sid] = s
        if not str(s.get("t", "")).strip():
            fail(f"empty title: {sid}")
        if not s.get("x") and not s.get("hidden"):
            fail(f"empty content: {sid}")
        if not s.get("p"):
            fail(f"missing page/volume: {sid}")

    for book in ("akhbar", "muruj"):
        if book not in books:
            fail(f"missing books.{book}")
        ids = books[book].get("chapters") or []
        if len(ids) != len(set(ids)):
            fail(f"duplicate ids in books.{book}")
        for sid in ids:
            if sid not in by_id:
                fail(f"books.{book} references missing id: {sid}")
            if by_id[sid].get("w") != book:
                fail(f"books.{book} references wrong-book id: {sid}")
            if by_id[sid].get("hidden"):
                fail(f"books.{book} includes hidden id: {sid}")

    akhbar_ids = books["akhbar"]["chapters"]
    if len(akhbar_ids) != len(AKHBAR_TITLES):
        fail(f"expected {len(AKHBAR_TITLES)} akhbar chapters, got {len(akhbar_ids)}")
    for sid, expected in zip(akhbar_ids, AKHBAR_TITLES):
        if by_id[sid]["t"] != expected:
            fail(f"akhbar title mismatch: {sid}: {by_id[sid]['t']!r} != {expected!r}")

    visible_ids = [s["id"] for s in sections if not s.get("hidden")]
    indexed_ids = akhbar_ids + books["muruj"]["chapters"]
    if set(visible_ids) != set(indexed_ids):
        missing = set(visible_ids) - set(indexed_ids)
        extra = set(indexed_ids) - set(visible_ids)
        fail(f"visible/indexed mismatch missing={sorted(missing)} extra={sorted(extra)}")

    hidden = [s for s in sections if s.get("hidden")]
    for s in hidden:
        if not s.get("hiddenReason"):
            fail(f"hidden section lacks reason: {s['id']}")
        if s["id"] in indexed_ids:
            fail(f"hidden section indexed: {s['id']}")
    if len(hidden) != len(HIDDEN_MURUJ):
        fail(f"expected {len(HIDDEN_MURUJ)} hidden fragments, got {len(hidden)}")

    # The reported bug: chapter 5 must start at its own text, not the previous tail.
    target = by_id.get("akhbar-chap-5")
    if not target:
        fail("missing akhbar-chap-5")
    first = re.sub(r"\s+", " ", target["x"][0]).strip()
    if not first.startswith("فأما ما ذكروه"):
        fail(f"akhbar-chap-5 starts with wrong text: {first[:80]!r}")

    html = args.html.read_text(encoding="utf-8")
    for needle in (
        '<h2 id="',
        "scrollIntoView({ behavior:\"smooth\", block:\"start\" })",
        '[id^="akhbar-chap"], [id^="muruj-chap"]{scroll-margin-top:var(--anchor-offset,96px)}',
        "DATA.byId",
        "data-target",
        "async function robustJumpToSection",
        "data-title=",
        "window.addEventListener(\"hashchange\", goHash)",
    ):
        if needle not in html:
            fail(f"index.html missing: {needle}")

    print(f"PASS: {len(sections)} sections, {len(akhbar_ids)} akhbar, "
          f"{len(books['muruj']['chapters'])} muruj, {len(hidden)} hidden")
    print("PASS: unique ids, book grouping, titles, content, HTML anchors")


if __name__ == "__main__":
    main()
