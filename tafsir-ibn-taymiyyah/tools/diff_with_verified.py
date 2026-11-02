#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
diff_with_verified.py
مقارنة القراءة الآمنة بين نصوص التفسير الحالية والنسخة المحققة

مبدأ العمل: قراءة فقط - لا يكتب ملفات المشروع ولا يعدّل قاعدة البيانات
"""

from __future__ import annotations
import argparse
import difflib
import html
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# حماية الآيات القرآنية أثناء حساب التشابه
QURAN_BRACKET_RE = re.compile(r'﴿([^﴾]{1,600})﴾')

# تطهير خفيف لقياس التشابه فقط
MULTISPACE_RE = re.compile(r'[ \t]+')
DIACRITICS_RE = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]')


@dataclass
class Para:
    file: str
    idx: int
    raw: str
    norm: str
    qcount: int


@dataclass
class Match:
    file: str
    cur_idx: int
    ver_idx: int | None
    ratio: float
    status: str
    reason: str
    cur_raw: str
    ver_raw: str
    cur_norm: str
    ver_norm: str
    diff_html: str


class QuranProtector:
    def __init__(self):
        self.tokens: list[str] = []

    def protect(self, text: str) -> str:
        self.tokens.clear()

        def rep(m: re.Match) -> str:
            self.tokens.append(m.group(0))
            return f' __QURANPH_{len(self.tokens)-1}__ '

        return QURAN_BRACKET_RE.sub(rep, text)

    def restore(self, text: str) -> str:
        for i, t in enumerate(self.tokens):
            text = text.replace(f' __QURANPH_{i}__ ', t)
            text = text.replace(f'__QURANPH_{i}__', t)
        return text


class Normalizer:
    @staticmethod
    def split_paragraphs(text: str) -> list[str]:
        # يقسم على فواصل الفقرات الفعلية
        parts = re.split(r'\n\s*\n+', text)
        out = []
        for p in parts:
            p2 = p.strip()
            if not p2:
                continue
            # دمج أسطر فقرة واحدة
            p2 = MULTISPACE_RE.sub(' ', p2)
            p2 = p2.replace('\r', '')
            out.append(p2)
        return out

    @staticmethod
    def normalize_for_ratio(text: str, strip_diac: bool = False) -> tuple[str, int]:
        qcount = len(QURAN_BRACKET_RE.findall(text))
        # حماية الآيات
        qp = QuranProtector()
        t = qp.protect(text)
        t = MULTISPACE_RE.sub(' ', t)
        t = t.replace('\n', ' ')
        if strip_diac:
            t = DIACRITICS_RE.sub('', t)
        t = qp.restore(t)
        t = ' '.join(t.split())
        return t, qcount


class Aligner:
    def __init__(self, current: list[Para], verified: list[Para], window: int = 25):
        self.cur = current
        self.ver = verified
        self.window = window

    def align(self) -> list[Match]:
        res: list[Match] = []
        j = 0
        mver = len(self.ver)
        for c in self.cur:
            best_i = -1
            best_r = -1.0
            # بحث ضمن نافذة حول الموقع التقريبي
            start = max(0, j - self.window)
            end = min(mver, j + self.window + 40)
            for i in range(start, end):
                r = difflib.SequenceMatcher(None, c.norm, self.ver[i].norm).ratio()
                if r > best_r:
                    best_r = r
                    best_i = i
                    if best_r >= 0.999:
                        break
            vraw = self.ver[best_i].raw if best_i >= 0 else ''
            vnorm = self.ver[best_i].norm if best_i >= 0 else ''
            ratio = round(best_r * 100.0, 2)
            if ratio >= 98.0:
                status, reason = 'ok', 'تطابق شبه تام'
            elif ratio >= 95.0:
                status, reason = 'minor', 'فرق طفيف'
            elif ratio >= 90.0:
                status, reason = 'review', 'يستحق مراجعة سريعة'
            elif ratio >= 80.0:
                status, reason = 'suspect', 'فرق واضح - احتمال تصحيف/سقط'
            else:
                status, reason = 'strong_suspect', 'فرق كبير - أولوية عالية'
            if best_i == j:
                j += 1
            elif best_i >= j:
                j = best_i + 1
            d = difflib.HtmlDiff(wrapcolumn=90)
            diff_h = d.make_table(c.raw.splitlines(), vraw.splitlines(),
                                  fromdesc='النص الحالي', todesc='النسخة المحققة',
                                  context=False)
            res.append(Match(file=c.file, cur_idx=c.idx, ver_idx=best_i,
                             ratio=ratio, status=status, reason=reason,
                             cur_raw=c.raw, ver_raw=vraw,
                             cur_norm=c.norm, ver_norm=vnorm,
                             diff_html=diff_h))
        return res


class Reporter:
    @staticmethod
    def build_html(matches: list[Match], out: Path, title: str):
        css = '''<style>
body{font-family:Tahoma,Arial;direction:rtl;background:#0f1026;color:#e7e7ea;margin:20px}
h1{color:#f5b700}
.summary{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
.card{background:#1c1f2b;padding:10px 14px;border-radius:10px;border:1px solid #2a2f45}
.ok{color:#22c55e}.minor{color:#84cc16}.review{color:#f59e0b}.suspect{color:#fb923c}.strong_suspect{color:#ef4444}
details{background:#161826;border:1px solid #2a2f45;border-radius:12px;margin:14px 0;overflow:hidden}
summary{padding:10px 14px;background:#20233a;cursor:pointer;display:flex;gap:14px;align-items:center}
table.diff{width:100%;border-collapse:collapse}
.diff_header{background:#2a2f45}
.diff_next{background:#1f2337}
.diff_add{background:rgba(34,197,94,.18)}
.diff_sub{background:rgba(239,68,68,.18)}
.diff_chg{background:rgba(245,158,11,.18)}
td{vertical-align:top;padding:6px 10px;border:1px solid #2a2f45;white-space:pre-wrap}
</style>'''
        cnt = {}
        for m in matches:
            cnt[m.status] = cnt.get(m.status, 0) + 1
        s = ['<div class="summary">']
        for k in ['ok', 'minor', 'review', 'suspect', 'strong_suspect']:
            if cnt.get(k):
                s.append(f'<div class="card"><span class="{k}">{k}</span>: {cnt[k]}</div>')
        s.append(f'<div class="card">الإجمالي: {len(matches)}</div></div>')
        body = ['<h1>' + html.escape(title) + '</h1>'] + s
        for m in matches:
            st = m.status
            body.append(f'''<details><summary>
<span class="{st}">{m.ratio}%</span>
<span>{html.escape(m.file)} #P{m.cur_idx + 1} ←→ V{(m.ver_idx + 1) if m.ver_idx is not None else '?'}</span>
<span>{html.escape(m.reason)}</span>
</summary>{m.diff_html}</details>''')
        html_doc = f'<!DOCTYPE html><html lang="ar"><head><meta charset="utf-8"><title>{html.escape(title)}</title>{css}</head><body>{"".join(body)}</body></html>'
        out.write_text(html_doc, encoding='utf-8')


def load_texts(paths: list[Path], ext: str) -> list[Path]:
    res = []
    for p in paths:
        if p.is_dir():
            res.extend(sorted(p.rglob(f'*{ext}')))
        elif p.is_file() and p.suffix == ext:
            res.append(p)
    # فريد
    seen = set()
    out = []
    for x in res:
        k = str(x.resolve())
        if k in seen:
            continue
        seen.add(k)
        out.append(x)
    return out


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description='مقارنة قراءة فقط مع نسخة محققة')
    ap.add_argument('--current', nargs='+', type=Path, required=True, help='مجلد/ملف نصي حالي')
    ap.add_argument('--verified', nargs='+', type=Path, required=True, help='مجلد/ملف نصي محقق')
    ap.add_argument('--ext', default='.txt')
    ap.add_argument('--out-html', type=Path, default=Path('diff_verified_report.html'))
    ap.add_argument('--out-json', type=Path, default=Path('diff_verified_summary.json'))
    ap.add_argument('--out-cand', type=Path, default=Path('diff_verified_candidates.jsonl'))
    ap.add_argument('--min-cand', type=float, default=90.0, help='أقل نسبة لإدراج في المرشحين')
    ap.add_argument('--strip-diac', action='store_true', help='تجاهل الحركات أثناء الحساب فقط')
    ap.add_argument('--window', type=int, default=30)
    args = ap.parse_args(argv)

    cur_files = load_texts(args.current, args.ext)
    ver_files = load_texts(args.verified, args.ext)
    if not cur_files or not ver_files:
        print('❌ لا توجد ملفات للمقارنة')
        return 1

    # دمج النسخة المحققة في قائمة واحدة مرتبة إن وُجد أكثر من ملف
    ver_all: list[Para] = []
    for vf in ver_files:
        try:
            txt = vf.read_text(encoding='utf-8')
        except Exception as e:
            print(f'⚠️  تخطّي {vf}: {e}')
            continue
        for i, p in enumerate(Normalizer.split_paragraphs(txt)):
            n, q = Normalizer.normalize_for_ratio(p, args.strip_diac)
            ver_all.append(Para(file=vf.name, idx=i, raw=p, norm=n, qcount=q))
    if not ver_all:
        print('❌ النسخة المحققة فارغة بعد التقسيم')
        return 1

    all_matches: list[Match] = []
    for cf in cur_files:
        try:
            txt = cf.read_text(encoding='utf-8')
        except Exception as e:
            print(f'⚠️  تخطّي {cf}: {e}')
            continue
        cur_list: list[Para] = []
        for i, p in enumerate(Normalizer.split_paragraphs(txt)):
            n, q = Normalizer.normalize_for_ratio(p, args.strip_diac)
            cur_list.append(Para(file=cf.name, idx=i, raw=p, norm=n, qcount=q))
        if not cur_list:
            continue
        aln = Aligner(cur_list, ver_all, window=args.window)
        all_matches.extend(aln.align())

    # تقرير
    Reporter.build_html(all_matches, args.out_html, 'مقارنة diff_with_verified (قراءة فقط)')
    summ = {'count': len(all_matches), 'by_status': {}}
    for m in all_matches:
        summ['by_status'][m.status] = summ['by_status'].get(m.status, 0) + 1
    if all_matches:
        summ['avg_ratio'] = round(sum(x.ratio for x in all_matches) / len(all_matches), 2)
    else:
        summ['avg_ratio'] = 0.0
    args.out_json.write_text(json.dumps(summ, ensure_ascii=False, indent=2), encoding='utf-8')

    cand = 0
    with args.out_cand.open('w', encoding='utf-8') as f:
        for m in all_matches:
            if m.ratio < args.min_cand:
                rec = {
                    'source': 'diff_with_verified',
                    'file': m.file,
                    'cur_p': m.cur_idx + 1,
                    'ver_p': (m.ver_idx + 1) if m.ver_idx is not None else None,
                    'ratio': m.ratio,
                    'status': m.status,
                    'reason': m.reason,
                    'current_raw': m.cur_raw,
                    'verified_raw': m.ver_raw
                }
                f.write(json.dumps(rec, ensure_ascii=False) + '\n')
                cand += 1

    print('✅ اكتمل (قراءة فقط)')
    print(f'  فقرات مقارَنة: {len(all_matches)}')
    print(f'  متوسط التشابه: {summ.get("avg_ratio")} %')
    print(f'  حسب الحالة: {summ["by_status"]}')
    print(f'  مرشّحون < {args.min_cand}% → {args.out_cand} ({cand})')
    print(f'  تقرير HTML: {args.out_html}')
    print(f'  ملخّص JSON: {args.out_json}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
