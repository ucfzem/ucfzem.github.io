#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply_approved.py  (v2)

يقرأ العناصر المقبولة (approved) من pending_review ويطبّقها على الملفات.

الضمانات:
  ✓ التحقق من مطابقة السطر لـ before_text قبل أي تعديل
  ✓ تجميع التعديلات حسب السطر (يدعم قواعد متعددة على سطر واحد)
  ✓ كتابة ذرية (tmp + fsync + rename)
  ✓ الحفاظ على نهايات الأسطر الأصلية (LF/CRLF)
  ✓ الالتزام بـ DB بعد كل ملف — اتساق دائم بين FS و DB
  ✓ نسخة .bak واحدة لكل ملف، لا تُستبدل بعد إنشائها
  ✓ سجل تدقيق JSONL مع SHA256 قبل/بعد لكل تعديل
  ✓ --dry-run لا يكتب ولا يعدّل DB، لكنه يسجّل ويطبع
"""

from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


# ============================================================
# 1) خريطة القواعد
# ============================================================
RULES_MAP: dict[str, tuple[str, str]] = {
    "suspect_haa": (r"\b(\w+)ه(\s+)(?=[\u0627-\u064A])", r"\1ة\2"),
    "suspect_yaa": (r"\b(\w+)ى(\s+)", r"\1ي\2"),
}


# ============================================================
# 2) أدوات
# ============================================================
def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def norm_line(s: str) -> str:
    """تطبيع للمقارنة فقط: يزيل \r ذيلية قد تكون بقيت من تشغيل قديم."""
    return s.rstrip("\r")


def atomic_write_text(path: Path, content: str) -> None:
    fd, tmp = tempfile.mkstemp(
        dir=str(path.parent), prefix=path.name + ".", suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass
        raise


def read_with_eol(path: Path) -> tuple[list[str], str]:
    """يقرأ الملف ويحافظ على نوع EOL. يعيد (أسطر بدون \r\n، EOL)."""
    raw = path.read_bytes()
    eol = "\r\n" if b"\r\n" in raw else "\n"
    text = raw.decode("utf-8").replace("\r\n", "\n")
    return text.split("\n"), eol


# ============================================================
# 3) نموذج التعديل
# ============================================================
class Edit:
    __slots__ = ("id", "line", "rule", "before")
    def __init__(self, id: int, line: int, rule: str, before: str):
        self.id = id
        self.line = line
        self.rule = rule
        self.before = before


# ============================================================
# 4) معالجة ملف واحد
# ============================================================
def apply_file(
    fname: str,
    fpath: Path,
    edits: list[Edit],
    conn: sqlite3.Connection,
    dry_run: bool,
    log_writer,
) -> tuple[int, int]:
    applied = 0
    failed = 0

    if not fpath.exists():
        print(f"⚠️  الملف غير موجود: {fpath}  ({len(edits)} تعديل مفقود)")
        return 0, len(edits)

    lines, eol = read_with_eol(fpath)

    # تجميع حسب رقم السطر — يدعم تعدد القواعد على نفس السطر
    by_line: dict[int, list[Edit]] = defaultdict(list)
    for e in edits:
        by_line[e.line].append(e)

    file_modified = False
    cur = conn.cursor()

    for line_no in sorted(by_line):
        line_edits = by_line[line_no]
        idx = line_no - 1

        if idx < 0 or idx >= len(lines):
            print(f"⚠️  السطر {line_no} خارج النطاق في {fname} "
                  f"({len(line_edits)} تعديل مفقود)")
            failed += len(line_edits)
            continue

        # كل التعديلات على نفس السطر يجب أن تتشارك نفس before
        expected = line_edits[0].before
        if any(norm_line(e.before) != norm_line(expected) for e in line_edits):
            print(f"⚠️  تعارض في before_text بين قواعد على "
                  f"{fname}:{line_no} — تخطٍّ")
            failed += len(line_edits)
            continue

        target = lines[idx]

        # 🔒 التحقق الحرج: السطر لم يتغيّر منذ المراجعة؟
        if norm_line(target) != norm_line(expected):
            print(f"🛑 رفض — السطر تغيّر منذ المراجعة: {fname}:{line_no}")
            print(f"     في DB : {expected[:90]!r}")
            print(f"     الآن  : {target[:90]!r}")
            failed += len(line_edits)
            continue

        # تطبيق القواعد بالتتابع — كل قاعدة على ناتج سابقتها
        current = target
        for edit in line_edits:
            pr = RULES_MAP.get(edit.rule)
            if pr is None:
                print(f"⚠️  قاعدة غير معروفة '{edit.rule}' "
                      f"في {fname}:{line_no}")
                failed += 1
                continue
            pat, rep = pr
            new_line, n = re.subn(pat, rep, current)
            if n == 0:
                print(f"⚠️  لا مطابقة بعد التحقق: "
                      f"{fname}:{line_no}  ({edit.rule})")
                failed += 1
                continue

            log_writer({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "file": fname,
                "line": line_no,
                "rule": edit.rule,
                "before": current,
                "after": new_line,
                "before_sha256": sha256(current),
                "after_sha256": sha256(new_line),
                "dry_run": dry_run,
            })

            if not dry_run:
                cur.execute(
                    "UPDATE pending_review SET status='applied' WHERE id=?",
                    (edit.id,),
                )
            current = new_line
            applied += 1

        if current != target:
            lines[idx] = current
            file_modified = True

    if file_modified:
        if dry_run:
            print(f"🔍 [DRY] سيُحدَّث: {fname}  (+{applied} -{failed})")
        else:
            bak = fpath.with_suffix(fpath.suffix + ".bak")
            if not bak.exists():
                bak.write_bytes(fpath.read_bytes())
                print(f"💾 .bak: {bak.name}")
            else:
                print(f"💾 .bak موجود، لم يُستبدل: {bak.name}")

            atomic_write_text(fpath, eol.join(lines))
            conn.commit()  # ← التزام فوري بعد كل ملف
            print(f"✅ حُفظ: {fname}  (+{applied} -{failed})")

    return applied, failed


# ============================================================
# 5) CLI
# ============================================================
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="تطبيق التعديلات المقبولة (approved) بأمان على الملفات",
    )
    ap.add_argument("--db", type=Path, default=Path("tafsir_database.sqlite"))
    ap.add_argument("--base-dir", type=Path, default=Path("./volumes"))
    ap.add_argument("--apply-log", type=Path, default=Path("apply_log.jsonl"))
    ap.add_argument("--dry-run", action="store_true",
                    help="محاكاة كاملة: لا يكتب، لا يعدّل DB، لكن يسجّل ويطبع")
    args = ap.parse_args(argv)

    if not args.db.exists():
        print(f"❌ قاعدة البيانات غير موجودة: {args.db}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(args.db)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        "SELECT id, file, line, rule, before_text FROM pending_review "
        "WHERE status='approved' ORDER BY file, line, id"
    )
    rows = cur.fetchall()

    if not rows:
        print("✨ لا توجد عناصر approved لتطبيقها.")
        conn.close()
        return 0

    print(f"📋 {len(rows)} عنصر مقبول"
          + ("   (وضع المحاكاة)" if args.dry_run else ""))

    by_file: dict[str, list[Edit]] = defaultdict(list)
    for r in rows:
        by_file[r["file"]].append(
            Edit(r["id"], r["line"], r["rule"], r["before_text"])
        )

    args.apply_log.parent.mkdir(parents=True, exist_ok=True)
    log_file = args.apply_log.open("a", encoding="utf-8")

    def log_writer(rec: dict) -> None:
        log_file.write(json.dumps(rec, ensure_ascii=False) + "\n")
        log_file.flush()

    total_applied = 0
    total_failed = 0
    try:
        for fname in sorted(by_file):
            a, f = apply_file(
                fname,
                args.base_dir / fname,
                by_file[fname],
                conn,
                args.dry_run,
                log_writer,
            )
            total_applied += a
            total_failed += f
    finally:
        log_file.close()
        if not args.dry_run:
            conn.commit()
        conn.close()

    print("\n" + "═" * 60)
    print(f"  ✅ مطبَّق:  {total_applied}")
    if total_failed:
        print(f"  ⚠️  فشل:   {total_failed}  (راجع الرسائل أعلاه)")
    print(f"  📝 السجل:  {args.apply_log}")
    if args.dry_run:
        print("  🔍 الوضع:  محاكاة — لم تُكتب أي ملفات، ولم تُعدَّل DB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
