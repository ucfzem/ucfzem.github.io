#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
admin_review.py
مراجعة تفاعلية لعناصر pending_review في قاعدة البيانات
"""

from __future__ import annotations
import argparse
import os
import sqlite3
import subprocess
import sys
from pathlib import Path

RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
MAGENTA = "\033[35m"

RULE_DESC = {
    "suspect_haa": "ه قبل مسافة → يُقترح تحويلها إلى ة",
    "suspect_yaa": "ى قبل مسافة → يُقترح تحويلها إلى ي",
}


def clear():
    os.system('clear' if os.name != 'nt' else 'cls')


def show_row(row: sqlite3.Row, idx: int, total: int):
    clear()
    print(f"{BOLD}مراجعة المشتبهات{RESET}  [{idx+1}/{total}]")
    print("=" * 60)
    print(f"{CYAN}ID:{RESET} {row['id']}")
    print(f"{CYAN}الملف:{RESET} {row['file']}")
    print(f"{CYAN}السطر:{RESET} {row['line']}")
    print(f"{CYAN}القاعدة:{RESET} {row['rule']}  {MAGENTA}{RULE_DESC.get(row['rule'],'')}{RESET}")
    print(f"{CYAN}الحالة:{RESET} {row['status']}")
    print("=" * 60)
    print(f"\n{YELLOW}النص قبل:{RESET}")
    print(row['before_text'])
    print("\n" + "=" * 60)
    print(f"{GREEN}[a]{RESET} قبول   {RED}[r]{RESET} رفض   {YELLOW}[s]{RESET} تخطي   {CYAN}[o]{RESET} فتح في المحرر   {BOLD}[q]{RESET} خروج")
    print("=" * 60)


def open_editor(file: str, line: int):
    path = Path("./volumes") / file
    if not path.exists():
        # try data/s
        path2 = Path("data/s") / file
        if path2.exists():
            path = path2
    if not path.exists():
        print(f"{RED}الملف غير موجود{RESET}")
        input("اضغط Enter للمتابعة...")
        return
    editors = [
        ["code", "-g", f"{path}:{line}"],
        ["nano", f"+{line}", str(path)],
        ["vim", f"+{line}", str(path)],
        ["vi", f"+{line}", str(path)],
    ]
    for cmd in editors:
        if subprocess.call(["which", cmd[0]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0:
            subprocess.call(cmd)
            return
    print(f"{YELLOW}لم يتم العثور على محرر معروف{RESET}")
    input("اضغط Enter للمتابعة...")


def main(argv=None):
    ap = argparse.ArgumentParser(description="مراجعة pending_review")
    ap.add_argument("--db", type=Path, default=Path("tafsir_database.sqlite"))
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--rule", type=str, default=None)
    ap.add_argument("--batch-approve", action="store_true", help="قبول جميع العناصر المطابقة للفلتر دفعة واحدة")
    args = ap.parse_args(argv)

    if not args.db.exists():
        print(f"{RED}قاعدة البيانات غير موجودة: {args.db}{RESET}")
        return 1

    conn = sqlite3.connect(args.db)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    where = "WHERE status='pending'"
    params = []
    if args.rule:
        where += " AND rule=?"
        params.append(args.rule)

    if args.batch_approve:
        cur.execute(f"SELECT COUNT(*) as c FROM pending_review {where}", params)
        c = cur.fetchone()['c']
        if c == 0:
            print("لا عناصر مطابقة")
            return 0
        ans = input(f"هل تريد قبول {c} عنصر فعلاً؟ (y/N): ").strip().lower()
        if ans == 'y':
            cur.execute(f"UPDATE pending_review SET status='approved' {where}", params)
            conn.commit()
            print(f"{GREEN}تم قبول {cur.rowcount} عنصر{RESET}")
        conn.close()
        return 0

    cur.execute(f"SELECT * FROM pending_review {where} ORDER BY file, line, id LIMIT ?", params + [args.limit])
    rows = cur.fetchall()
    if not rows:
        print("✨ لا توجد عناصر pending للمراجعة")
        conn.close()
        return 0

    i = 0
    total = len(rows)
    while i < total:
        row = rows[i]
        show_row(row, i, total)
        cmd = input("> ").strip().lower()
        if cmd == 'q':
            break
        elif cmd == 'a':
            cur.execute("UPDATE pending_review SET status='approved' WHERE id=?", (row['id'],))
            conn.commit()
            print(f"{GREEN}تم القبول{RESET}")
            i += 1
        elif cmd == 'r':
            cur.execute("UPDATE pending_review SET status='rejected' WHERE id=?", (row['id'],))
            conn.commit()
            print(f"{RED}تم الرفض{RESET}")
            i += 1
        elif cmd == 's':
            i += 1
            continue
        elif cmd == 'o':
            open_editor(row['file'], row['line'])
            continue
        else:
            print("أمر غير معروف")
            input("اضغط Enter...")
            continue

    conn.close()
    print(f"\nانتهت المراجعة. العناصر المتبقية أو المقبولة جاهزة للتطبيق عبر apply_approved.py")
    return 0


if __name__ == '__main__':
    sys.exit(main())
