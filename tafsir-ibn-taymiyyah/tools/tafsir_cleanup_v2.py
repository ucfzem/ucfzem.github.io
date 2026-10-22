#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tafsir_cleanup.py  (v2)
تنظيف المجلدات السبعة + حماية قرآنية مضمَّنة + تقارير HTML + استيراد SQLite.
"""

from __future__ import annotations
import argparse
import difflib
import hashlib
import json
import re
import sqlite3
import sys
from dataclasses import dataclass, asdict
from pathlib import Path


# ============================================================
# 1) القواعد الآمنة
# ============================================================
@dataclass
class Rule:
    name: str
    pattern: re.Pattern
    replacement: str
    description: str


SAFE_RULES: list[Rule] = [
    Rule("ui_plus",   re.compile(r'\bA\s*\+\s*'),                    '',    'إزالة A+'),
    Rule("ui_minus",  re.compile(r'\bA\s*-\s*'),                    '',    'إزالة A-'),
    Rule("ui_volume", re.compile(r'\bالجزء\s*[0-9٠-٩]+\s*[:.]?\s*'), '',   'الجزء N'),
    Rule("ui_page1",  re.compile(r'\bالصفحة\s*[0-9٠-٩]+\s*[:.]?\s*'), '',  'الصفحة N'),
    Rule("ui_page2",  re.compile(r'\bصفحة\s*[0-9٠-٩]+\s*[:.]?\s*'),  '',   'صفحة N'),
    Rule("tatweel",     re.compile(r'ـ+'),                            '',    'إزالة التطويل'),
    Rule("dup_harakat", re.compile(r'([\u064B-\u0652])\1+'),          r'\1', 'دمج الحركات'),
    Rule("sp_before_punct", re.compile(r'[ \t]+([،؛:,.!؟])'),         r'\1', 'مسافة قبل علامة'),
    Rule("sp_multi",    re.compile(r'[ \t]{2,}'),                     ' ',   'دمج المسافات'),
    Rule("sp_newlines", re.compile(r'\n{3,}'),                        '\n\n','دمج الأسطر الزائدة'),
]


SUSPECT_PATTERNS: list[Rule] = [
    Rule("suspect_haa", re.compile(r'\b(\w+)ه(\s+)(?=[\u0627-\u064A])'), r'\1ة\2', 'ه قبل مسافة'),
    Rule("suspect_yaa", re.compile(r'\b(\w+)ى(\s+)'),                    r'\1ي\2', 'ى قبل مسافة'),
]


# ============================================================
# 2) حماية قرآنية مضمَّنة (Inline)
# ============================================================
class EnhancedQuranGuard:
    """يحمي النصوص بين ﴿ ﴾ داخل الأسطر أو الفقرات، ولا يمسّها أي تنظيف."""

    BRACKET_RE = re.compile(r'﴿([^﴾]{1,500})﴾')
    PLACEHOLDER_RE = re.compile(r'__QURAN_(\d+)__')

    def __init__(self, quran_json: Path | None):
        self.valid_ayahs: set[str] = set()
        if quran_json and quran_json.exists():
            data = json.loads(quran_json.read_text(encoding="utf-8"))
            for ayah in data.get("ayahs", []):
                t = (ayah.get("text") or "").strip()
                if t:
                    self.valid_ayahs.add(t)
        if not self.valid_ayahs:
            print("⚠️  تحذير: لم تُحمَّل أي آيات. الحماية تعتمد على الأقواس فقط.",
                  file=sys.stderr)
        self.bracket_count: int = 0
        self.unverified: list[str] = []

    def _is_verified(self, inner: str) -> bool:
        if not self.valid_ayahs:
            return True
        if inner in self.valid_ayahs:
            return True
        if ' ' in inner and len(inner) > 20:
            for ayah in self.valid_ayahs:
                if ayah in inner:
                    return True
        return False

    def protect(self, text: str) -> tuple[str, list[str]]:
        tokens: list[str] = []

        def replacer(m: re.Match) -> str:
            inner = m.group(1).strip()
            self.bracket_count += 1
            if not self._is_verified(inner):
                self.unverified.append(inner)
            tokens.append(m.group(0))
            return f"__QURAN_{len(tokens)-1}__"

        return self.BRACKET_RE.sub(replacer, text), tokens

    def restore(self, text: str, tokens: list[str]) -> str:
        def _repl(m: re.Match) -> str:
            idx = int(m.group(1))
            return tokens[idx] if 0 <= idx < len(tokens) else m.group(0)
        return self.PLACEHOLDER_RE.sub(_repl, text)


# ============================================================
# 3) تقرير HTML التفاعلي
# ============================================================
class HtmlDiffReporter:
    @staticmethod
    def generate_report(original_text: str, cleaned_text: str,
                        output_path: Path, show_all: bool = False) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        d = difflib.HtmlDiff(wrapcolumn=80)
        html = d.make_file(
            original_text.splitlines(),
            cleaned_text.splitlines(),
            fromdesc="النص الأصلي (قبل التنظيف)",
            todesc="النص بعد التنظيف الآلي",
            charset="utf-8",
            context=not show_all,
            numlines=3,
        )
        output_path.write_text(html, encoding="utf-8")


# ============================================================
# 4) استيراد SQLite
# ============================================================
def _row_hash(file: str, line: int, rule: str, before: str) -> str:
    return hashlib.sha1(f"{file}|{line}|{rule}|{before}".encode("utf-8")).hexdigest()


def import_suspects_to_db(suspects_jsonl: Path, db_path: Path,
                          reset: bool = False) -> int:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS pending_review (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file TEXT NOT NULL,
            line INTEGER,
            rule TEXT,
            before_text TEXT,
            status TEXT DEFAULT 'pending',
            row_hash TEXT UNIQUE
        )
    ''')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_review(status)')

    cur.execute("PRAGMA table_info(pending_review)")
    cols = {r[1] for r in cur.fetchall()}
    if 'row_hash' not in cols:
        try:
            cur.execute("ALTER TABLE pending_review ADD COLUMN row_hash TEXT")
        except Exception:
            pass
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_row_hash ON pending_review(row_hash)")

    if reset:
        cur.execute("DELETE FROM pending_review")

    count = 0
    if suspects_jsonl.exists():
        with suspects_jsonl.open("r", encoding="utf-8") as f:
            for raw in f:
                raw = raw.strip()
                if not raw:
                    continue
                d = json.loads(raw)
                h = _row_hash(d.get("file", ""), d.get("line", 0),
                              d.get("rule", ""), d.get("before", ""))
                cur.execute('''
                    INSERT OR IGNORE INTO pending_review
                        (file, line, rule, before_text, status, row_hash)
                    VALUES (?, ?, ?, ?, 'pending', ?)
                ''', (d.get("file"), d.get("line"), d.get("rule"),
                      d.get("before"), h))
                if cur.rowcount:
                    count += 1
        conn.commit()
    conn.close()
    return count


# ============================================================
# 5) المحرك
# ============================================================
@dataclass
class Change:
    file: str
    line: int
    rule: str
    before: str
    after: str


class Cleaner:
    def __init__(self, guard: EnhancedQuranGuard, dry_run: bool):
        self.guard = guard
        self.dry_run = dry_run
        self.applied: list[Change] = []
        self.suspects: list[Change] = []

    def _apply_safe(self, line: str, fname: str, ln: int) -> str:
        for r in SAFE_RULES:
            new, n = r.pattern.subn(r.replacement, line)
            if n:
                self.applied.append(Change(fname, ln, r.name, line, new))
                line = new
        return line

    def _scan_suspects(self, line: str, fname: str, ln: int) -> None:
        for r in SUSPECT_PATTERNS:
            if r.pattern.search(line):
                self.suspects.append(Change(fname, ln, r.name, line, ""))

    def process(self, text: str, fname: str) -> str:
        text, tokens = self.guard.protect(text)
        out = []
        for i, ln in enumerate(text.split("\n"), start=1):
            self._scan_suspects(ln, fname, i)
            out.append(self._apply_safe(ln, fname, i))
        result = self.guard.restore("\n".join(out), tokens)

        for tok in tokens:
            if tok not in result:
                raise RuntimeError(
                    f"❌ تسريب آية في {fname}: {tok[:60]}… "
                    f"(placeholder ربما كُسر — لا تكتب المخرجات)"
                )
        return result

    def run_file(self, path: Path, diff_dir: Path | None = None,
                 show_all: bool = False) -> Path | None:
        src = path.read_text(encoding="utf-8")
        dst = self.process(src, path.name)
        if diff_dir is not None and src != dst:
            HtmlDiffReporter.generate_report(
                src, dst,
                diff_dir / f"{path.stem}.diff.html",
                show_all=show_all,
            )
        if self.dry_run:
            return None
        out = path.with_suffix(".cleaned" + path.suffix)
        out.write_text(dst, encoding="utf-8")
        return out

    def dump_logs(self, applied_path: Path, suspects_path: Path) -> None:
        with applied_path.open("w", encoding="utf-8") as f:
            for c in self.applied:
                f.write(json.dumps(asdict(c), ensure_ascii=False) + "\n")
        with suspects_path.open("w", encoding="utf-8") as f:
            for c in self.suspects:
                f.write(json.dumps(asdict(c), ensure_ascii=False) + "\n")


# ============================================================
# 6) CLI
# ============================================================
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="تنظيف نصوص المجلدات السبعة (v2)")
    ap.add_argument("inputs", nargs="+", type=Path)
    ap.add_argument("--quran", type=Path, help="JSON بآيات المصحف")
    ap.add_argument("--applied-log",  type=Path, default=Path("cleanup_applied.jsonl"))
    ap.add_argument("--suspects-log", type=Path, default=Path("cleanup_suspects.jsonl"))
    ap.add_argument("--diff-dir", type=Path, default=None)
    ap.add_argument("--diff-show-all", action="store_true")
    ap.add_argument("--db", type=Path, default=Path("tafsir_database.sqlite"))
    ap.add_argument("--reset-pending", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--ext", default=".txt")
    args = ap.parse_args(argv)

    guard = EnhancedQuranGuard(args.quran)
    cleaner = Cleaner(guard, dry_run=args.dry_run)

    files: list[Path] = []
    for p in args.inputs:
        if p.is_dir():
            files.extend(sorted(p.glob(f"*{args.ext}")))
        elif p.is_file():
            files.append(p)

    for f in files:
        out = cleaner.run_file(f, diff_dir=args.diff_dir, show_all=args.diff_show_all)
        tag = "DRY" if args.dry_run else (out.name if out else "—")
        print(f"{f.name}: {tag}")

    cleaner.dump_logs(args.applied_log, args.suspects_log)
    imported = import_suspects_to_db(args.suspects_log, args.db, reset=args.reset_pending)

    print(f"\n📖 مقاطع قرآنية محمية: {guard.bracket_count}")
    if guard.unverified:
        print(f"❌ {len(guard.unverified)} مقطع داخل ﴿ ﴾ لم يطابق آية معتمدة:")
        for u in guard.unverified[:5]:
            print(f"   • {u[:70]}…")
        if len(guard.unverified) > 5:
            print(f"   … و{len(guard.unverified) - 5} أخرى")

    print(f"\n✅ تعديلات مطبقة: {len(cleaner.applied)}")
    print(f"🔎 مقاطع مشبوهة: {len(cleaner.suspects)}")
    print(f"📥 صفوف جديدة في pending_review: {imported}")
    print(f"   قاعدة البيانات: {args.db}")
    if args.diff_dir:
        print(f"📊 تقارير HTML: {args.diff_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
