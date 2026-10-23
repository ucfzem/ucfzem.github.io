#!/usr/bin/env python3
"""Read-only audit of Quranic quotations in the tafsir corpus (7 volumes).

- Extracts every ﴿...﴾ quote with volume/section/paragraph/offset and nearby [surah: ayah].
- Matches fragments as substrings against a trusted Qur'an text (1-3 ayah spans).
- Tries a global candidate only when the parsed reference fails.
- Scans the whole corpus for high-confidence OCR artifacts (قرهان، قرمان، اينت، تبرك...).
- Writes audit/quran-audit-review.json + audit/quran_audit_summary.md.

Nothing under data/ is modified.

Usage: python3 tools/audit_quran.py [--corpus /tmp/quran_uthmani.json]
"""
import argparse, difflib, json, os, re, unicodedata, urllib.request
from collections import Counter, defaultdict

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORPUS_URL = 'https://api.alquran.cloud/v1/quran/quran-uthmani'
DEFAULT_CORPUS = '/tmp/quran_uthmani.json'
MARK_RE = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]')
AR_DIGITS = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')

OCR_PATTERNS = [
    ('قرهان', 'قرآن', 'قرهان', 'high'),
    ('قرمان', 'قرآن', 'قرمان', 'high'),
    ('اينت', 'آيات', 'اينت', 'high'),
    ('تبرك الذي بيده الملك', 'تبارك الذي بيده الملك', 'تبرك الذي بيده', 'high'),
    ('انزلته', 'أنزلناه (بحسب السياق)', 'انزلته', 'medium'),
    ('جعلته', 'جعلناه (بحسب السياق)', 'جعلته', 'medium'),
]


RASM_FOLD = [
    ('الصلوة', 'الصلاة'), ('الزكوة', 'الزكاة'), ('الحيوة', 'الحياة'),
    ('الربوا', 'الربا'), ('مشكوة', 'مشكاة'), ('نجوة', 'نجاة'),
    ('داوود', 'داود'), ('الضحوة', 'الضحى'),
]


def norm(s, flex=False):
    s = unicodedata.normalize('NFKC', s or '')
    s = MARK_RE.sub('', s)
    for a, b in RASM_FOLD:
        s = s.replace(a, b)
    s = re.sub(r'[أإآٱ]', 'ا', s)
    s = re.sub(r'[ىئ]', 'ي', s)
    s = re.sub(r'ؤ', 'و', s)
    s = re.sub(r'ة', 'ه', s)
    s = re.sub(r'[^\w\u0600-\u06FF]+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    if flex:
        s = re.sub(r'\s+', ' ', s.replace('ا', '')).strip()
    return s


def tokens(s):
    return [t for t in norm(s).split() if t]


def corpus_label(path):
    b = os.path.basename(path).lower()
    if 'uthmani' in b:
        return 'quran-uthmani'
    if 'simple' in b:
        return 'quran-simple'
    return os.path.basename(path)


def load_corpus(path):
    if not os.path.exists(path):
        print('downloading corpus ...', flush=True)
        urllib.request.urlretrieve(CORPUS_URL, path)
    data = json.load(open(path, encoding='utf-8'))
    surahs = data['data']['surahs'] if 'data' in data else data
    ayahs, names = {}, {}
    for s in surahs:
        nm = re.sub(r'^سُورَةُ\s*', '', s['name'])
        names[norm(nm)] = s['number']
        names[norm(s.get('englishName', ''))] = s['number']
        names[str(s['number'])] = s['number']
        for a in s['ayahs']:
            ayahs[(s['number'], a['numberInSurah'])] = a['text']
    return ayahs, names


def parse_ref(raw, names):
    parts = re.split(r'[:：]', raw.strip())
    if len(parts) < 2:
        return None
    nm = re.sub(r'^سوره\s+', '', norm(parts[0]))
    sn = names.get(nm)
    if sn is None:
        for k, v in names.items():
            if k and k.replace(' ', '') == nm.replace(' ', ''):
                sn = v
                break
    digits = re.sub(r'[^\d٠-٩]', '', parts[-1].translate(AR_DIGITS))
    if not sn or not digits:
        return None
    return sn, int(digits)


def span_text(ayahs, sn, ay, size):
    parts = []
    for i in range(size):
        t = ayahs.get((sn, ay + i))
        if not t:
            return None
        parts.append(t)
    return ' '.join(parts)


def quote_in(q, text):
    qn, tn = norm(q), norm(text)
    return bool(qn and tn and (qn in tn or norm(q, True) in norm(text, True)))


def best_window(q, ayahs, sn, ay, maxspan=3):
    for size in range(1, maxspan + 1):
        t = span_text(ayahs, sn, ay, size)
        if t and quote_in(q, t):
            return size
    return 0


def token_overlap(q, expected):
    qt, et = set(tokens(q)), set(tokens(expected))
    return len(qt & et) / max(1, len(qt))


class Index:
    def __init__(self, ayahs):
        self.inv = defaultdict(set)
        self.ayah_tokens = {}
        for key, text in ayahs.items():
            ts = set(tokens(text))
            self.ayah_tokens[key] = ts
            for t in ts:
                if len(t) >= 3:
                    self.inv[t].add(key)

    def candidates(self, q, limit=30):
        ts = sorted({t for t in tokens(q) if len(t) >= 3}, key=len, reverse=True)[:4]
        if not ts:
            return []
        sets = [self.inv.get(t, set()) for t in ts]
        sets = [s for s in sets if s]
        if not sets:
            return []
        pool = set.intersection(*sets) if len(sets) > 1 else sets[0]
        if not pool:
            pool = set.union(*sets)
        qt = set(tokens(q))
        scored = [(len(qt & self.ayah_tokens[k]) / max(1, len(qt)), k) for k in pool]
        scored.sort(reverse=True)
        return [k for _, k in scored[:limit]]


def suggest_fragment(q, expected):
    en = expected.split()
    qn = [norm(w) for w in q.split()]
    best = (0, 0, 0)
    for i in range(len(en)):
        for j in range(i + 1, min(len(en), i + len(qn) + 5) + 1):
            r = difflib.SequenceMatcher(None, [norm(w) for w in en[i:j]], qn).ratio()
            if r > best[0]:
                best = (r, i, j)
    return ' '.join(en[best[1]:best[2]]) if best[0] >= 0.5 else ''


def known_ocr_in(q):
    n = norm(q)
    return [{'pattern': label, 'suggested': sug, 'level': lvl}
            for label, sug, pat, lvl in OCR_PATTERNS if pat in n]


def scan_known_ocr(vols):
    out = []
    for vol in vols:
        doc = json.load(open(os.path.join(APP, 'data', 'c', f'{vol}.json'), encoding='utf-8'))
        for sec in doc.get('sections', []):
            for pi, para in enumerate(sec.get('content', [])):
                np = norm(para)
                if not np:
                    continue
                for label, suggestion, pat, lvl in OCR_PATTERNS:
                    if label in ('انزلته', 'جعلته') and 'قر' not in np[max(0, np.find(pat) - 60): np.find(pat) + 90]:
                        continue
                    start = 0
                    while True:
                        i = np.find(pat, start)
                        if i < 0:
                            break
                        out.append({
                            'vol': vol, 'section': sec.get('heading', ''), 'para': pi,
                            'pattern': label, 'suggested': suggestion, 'level': lvl,
                            'context': np[max(0, i - 75): i + 95],
                        })
                        start = i + len(pat)
    return out


def confidence_for(entry, known):
    if any(k.get('level') == 'high' for k in known):
        return 'high'
    if known:
        return 'medium'
    sim = entry.get('similarity', 0)
    if entry['status'] == 'UNMATCHED_WITH_REF' and sim >= 0.8:
        return 'medium'
    return 'low'


def audit(ayahs, names):
    idx = Index(ayahs)
    items = []
    vols = sorted(int(f[:-5]) for f in os.listdir(os.path.join(APP, 'data', 'c')) if f.endswith('.json'))
    for vol in vols:
        doc = json.load(open(os.path.join(APP, 'data', 'c', f'{vol}.json'), encoding='utf-8'))
        for sec in doc.get('sections', []):
            for pi, para in enumerate(sec.get('content', [])):
                for m in re.finditer(r'﴿([^﴾]{1,700})﴾', para):
                    q = m.group(1).strip()
                    if not q or re.fullmatch(r'[\d\s٠-٩]+', q):
                        continue
                    tail = para[m.end():m.end() + 90]
                    rm = re.search(r'\[([^\]]{1,60})\]', tail)
                    ref = parse_ref(rm.group(1), names) if rm else None
                    known = known_ocr_in(q)
                    ent = {'vol': vol, 'section': sec.get('heading', ''), 'para': pi,
                           'offset': m.start(), 'quote': q,
                           'ref': f'{ref[0]}:{ref[1]}' if ref else None,
                           'known_ocr': known}
                    if ref:
                        size = best_window(q, ayahs, ref[0], ref[1])
                        if size:
                            ent.update(status='MATCH_REF', span=size)
                            items.append(ent)
                            continue
                        ent['expected'] = span_text(ayahs, ref[0], ref[1], 1) or ''
                        ent['similarity'] = round(token_overlap(q, ent['expected']), 2)
                        ent['status'] = 'UNMATCHED_WITH_REF'
                        ent['suggestion'] = suggest_fragment(q, ent['expected'])
                    else:
                        best = None
                        for key in idx.candidates(q):
                            exp = span_text(ayahs, key[0], key[1], 1) or ''
                            ov = token_overlap(q, exp)
                            if best is None or ov > best[0]:
                                best = (ov, key)
                        if best and best[0] >= 0.7:
                            ov, key = best
                            size = best_window(q, ayahs, key[0], key[1]) or 1
                            ent.update(status='MATCH_NO_REF', span=size,
                                       suggested_ref=f'{key[0]}:{key[1]}',
                                       similarity=round(ov, 2),
                                       expected=span_text(ayahs, key[0], key[1], size))
                        else:
                            ent['status'] = 'UNMATCHED_NO_REF'
                    ent['confidence'] = confidence_for(ent, known)
                    items.append(ent)
    return items, Counter(i['status'] for i in items), scan_known_ocr(vols)


def markdown(stats, items, ocr, actionable, needs):
    L = ['# تدقيق الآيات القرآنية — تقرير قراءة فقط', '',
         f"المرجع: **{stats.get('corpus', '—')}**. لم يُعدَّل أي نص في `data/`.", '',
         '## الإحصاء', '']
    for k, v in stats.items():
        if k != 'corpus':
            L.append(f'- **{k}**: {v}')
    L += ['', f"## مجموعة قابلة للتنفيذ — OCR مؤكد ({len(actionable)})", '']
    for i, o in enumerate(actionable[:40], 1):
        L.append(f"{i}. **{o['pattern']} → {o['suggested']}** [{o['level']}] — ج{o['vol']}، {o['section']}، فقرة {o['para']}")
        L.append(f"   `{o['context']}`")
    if len(actionable) > 40:
        L.append(f'- … و{len(actionable)-40} موضعاً آخر في ملف JSON.')
    if not actionable:
        L.append('لا توجد.')
    L += ['', f"## تحتاج مراجعة سياقية — غير قابلة للتنفيذ الآلي ({len(needs)})", '']
    for i, o in enumerate(needs[:30], 1):
        L.append(f"{i}. **{o['pattern']} → {o['suggested']}** [{o['level']}] — ج{o['vol']}، {o['section']}، فقرة {o['para']}")
        L.append(f"   `{o['context']}`")
    if len(needs) > 30:
        L.append(f'- … و{len(needs)-30} موضعاً آخر في ملف JSON.')
    if not needs:
        L.append('لا توجد.')
    L += ['', '## مقتبسات تحتاج مراجعة (أول 40)', '']
    picks = [x for x in items if x.get('confidence') in ('high', 'medium') and x['status'] not in ('MATCH_REF', 'MATCH_NO_REF')]
    picks.sort(key=lambda x: (x['confidence'] != 'high', -x.get('similarity', 0), -len(x['quote'].split())))
    for x in picks[:40]:
        L += [f"### ج{x['vol']} — {x['section']} — فقرة {x['para']} ({x['confidence']})",
              f"- الحالة: {x['status']} | المرجع: {x.get('ref') or x.get('suggested_ref') or '—'}",
              f"- المقتبس: {x['quote'][:300]}",
              f"- المتوقع: {(x.get('expected') or '—')[:300]}"]
        if x.get('suggestion'):
            L.append(f"- اقتراح: {x['suggestion'][:300]}")
        L.append('')
    L += ['## حدود التقرير', '',
          '- المطابقة تقبل الاقتباس الجزئي داخل الآية أو عبر آية/آيتين.',
          '- الأقواس المكسورة أو غير المغلقة قد تمنع الاستخراج؛ لذلك يُفحص متن كامل بحثاً عن آثار OCR.',
          '- «المرجع» قد يخص اقتباساً لاحقاً في نفس الفقرة؛ لذلك تظهر حالات UNMATCHED_WITH_REF تحتاج مراجعة بشرية.',
          '- «اينت/انزلته/جعلته» تُصنَّف سياقية ولا تُعدّ قابلة للتنفيذ الآلي (آياته/آياتنا/لآيات...).',
          '- لا توجد هنا أي تعديلات تلقائية على النص القرآني.']
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--corpus', default=DEFAULT_CORPUS)
    args = ap.parse_args()
    label = corpus_label(args.corpus)
    ayahs, names = load_corpus(args.corpus)
    items, stats, ocr = audit(ayahs, names)
    stats['corpus'] = label
    stats['quotes'] = len(items)
    stats['known_ocr_occurrences'] = len(ocr)
    stats['known_ocr_high'] = sum(1 for o in ocr if o.get('level') == 'high')
    stats['known_ocr_medium'] = sum(1 for o in ocr if o.get('level') == 'medium')
    safe = {'تبرك الذي بيده الملك', 'قرهان', 'قرمان'}
    actionable = [o for o in ocr if o.get('level') == 'high' and o.get('pattern') in safe]
    needs = [o for o in ocr if o not in actionable]
    stats['actionable'] = len(actionable)
    stats['needs_review'] = len(needs)
    outdir = os.path.join(APP, 'audit', 'uthmani' if 'uthmani' in label else 'simple')
    os.makedirs(outdir, exist_ok=True)
    payload = {'corpus': label, 'stats': dict(stats), 'actionable': actionable,
               'needs_review': needs, 'known_ocr': ocr, 'items': items}
    json.dump(payload, open(os.path.join(outdir, 'quran-audit-review.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    open(os.path.join(outdir, 'quran_audit_summary.md'), 'w', encoding='utf-8').write(
        markdown(stats, items, ocr, actionable, needs))
    json.dump({'actionable': actionable}, open(os.path.join(APP, 'audit', 'actionable-ocr.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    json.dump({'needs_review': needs}, open(os.path.join(APP, 'audit', 'needs-review-ocr.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(json.dumps(dict(stats), ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
