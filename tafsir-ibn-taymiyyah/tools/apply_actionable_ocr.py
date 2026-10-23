#!/usr/bin/env python3
"""Apply only the approved, mechanically-safe OCR fixes.

Scope: 99 occurrences of قرهان/قرمان/تبرك الذي بيده.
Does NOT touch اينت/انزلته/جعلته (context-dependent).
Writes data/c/*.json, rebuilds data/s/*.txt, writes audit/applied-ocr-fixes.json.
"""
import argparse, json, os, re

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(APP, 'data')
MARK = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]')
CH_FOLD = {'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ئ': 'ي', 'ؤ': 'و', 'ة': 'ه'}
PATTERNS = [('قرهان', 'قرآن'), ('قرمان', 'قرآن'), ('تبرك الذي بيده', 'تبارك الذي بيده')]
DIAC = re.compile('[\u064B-\u0650\u0651\u0652\u0670\u06D6-\u06ED\u0640]')
FOLD = {'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ة': 'ه'}


def fold(s):
    s = DIAC.sub('', s)
    for k, v in FOLD.items():
        s = s.replace(k, v)
    return re.sub(r'\s+', ' ', s).strip()


def norm_map(s):
    out, mp = [], []
    for i, ch in enumerate(s):
        if MARK.match(ch):
            continue
        ch = CH_FOLD.get(ch, ch)
        if not (ch.isalnum() or '\u0600' <= ch <= '\u06FF'):
            ch = ' '
        if ch == ' ':
            if out and out[-1] == ' ':
                continue
            out.append(' ')
            mp.append(i)
        else:
            out.append(ch)
            mp.append(i)
    return ''.join(out), mp


def target_for(pattern, raw):
    diac = bool(MARK.search(raw))
    if pattern in ('قرهان', 'قرمان'):
        return 'قُرْآن' if diac else 'قرآن'
    return 'تَبَارَكَ الَّذِي بِيَدِه' if diac else 'تبارك الذي بيده'


def changes_for_para(para):
    n, mp = norm_map(para)
    found = []
    for pat, _ in PATTERNS:
        start = 0
        while True:
            j = n.find(pat, start)
            if j < 0:
                break
            a = mp[j]
            b = mp[j + len(pat) - 1] + 1
            raw = para[a:b]
            found.append((a, b, pat, raw, target_for(pat, raw)))
            start = j + 1
    return sorted(found)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    approved_path = os.path.join(APP, 'audit', 'actionable-ocr-approved.json')
    if not os.path.exists(approved_path):
        approved_path = os.path.join(APP, 'audit', 'actionable-ocr.json')
    approved = json.load(open(approved_path, encoding='utf-8'))['actionable']
    extras_path = os.path.join(APP, 'audit', 'verified-needs-edits.json')
    extras = json.load(open(extras_path, encoding='utf-8')) if os.path.exists(extras_path) else []
    expected = {}
    for x in approved:
        key = 'تبرك الذي بيده' if x['pattern'].startswith('تبرك') else x['pattern']
        expected[key] = expected.get(key, 0) + 1
    print('approved:', len(approved), expected)

    all_changes = []
    docs = {}
    for vol in range(1, 8):
        path = os.path.join(DATA, 'c', f'{vol}.json')
        doc = json.load(open(path, encoding='utf-8'))
        docs[vol] = doc
        for sec in doc.get('sections', []):
            for pi, para in enumerate(sec.get('content', [])):
                found = changes_for_para(para)
                for a, b, pat, raw, new in found:
                    all_changes.append({
                        'vol': vol, 'section': sec.get('heading', ''), 'para': pi,
                        'pattern': pat, 'old': raw, 'new': new,
                        'before': para[max(0, a - 35):a], 'after': para[b:b + 35],
                        'offset': a,
                    })

    # Verified contextual edits (12:2 / 20:113 / 43:3).
    extra_target = {'انزلته': ('أَنزَلْنَاه', 'انزلناه'), 'جعلته': ('جَعَلْنَاه', 'جعلناه')}
    for e in extras:
        doc = docs[e['vol']]
        sec = next(x for x in doc['sections'] if x.get('heading', '') == e['section'])
        para = sec['content'][e['para']]
        n, mp = norm_map(para)
        spans = []
        start = 0
        while True:
            j = n.find(e['old'], start)
            if j < 0:
                break
            spans.append((mp[j], mp[j + len(e['old']) - 1] + 1))
            start = j + 1
        if len(spans) != 1:
            raise SystemExit(f"expected 1 {e['old']} in {e['vol']} {e['section']} p{e['para']}, found {len(spans)}")
        a, b = spans[0]
        raw = para[a:b]
        tgt = extra_target[e['old']]
        new = tgt[0] if MARK.search(raw) else tgt[1]
        all_changes.append({
            'vol': e['vol'], 'section': e['section'], 'para': e['para'],
            'pattern': e['old'], 'old': raw, 'new': new,
            'before': para[max(0, a - 35):a], 'after': para[b:b + 35],
            'offset': a, 'kind': 'verified_needs', 'ref': e['ref'],
        })

    counts = {}
    for c in all_changes:
        counts[c['pattern']] = counts.get(c['pattern'], 0) + 1
    print('found:', len(all_changes), counts)
    expected['انزلته'] = expected.get('انزلته', 0) + sum(1 for e in extras if e['old'] == 'انزلته')
    expected['جعلته'] = expected.get('جعلته', 0) + sum(1 for e in extras if e['old'] == 'جعلته')
    if counts != expected:
        raise SystemExit('count mismatch — aborting, no files written')

    for c in all_changes[:10]:
        print(f"v{c['vol']} {c['section']} p{c['para']}: {c['old']!r} -> {c['new']!r}")

    if args.dry_run:
        return

    by_para = {}
    for c in all_changes:
        by_para.setdefault((c['vol'], c['section'], c['para']), []).append(c)

    for (vol, section, pi), cs in by_para.items():
        doc = docs[vol]
        sec = next(s for s in doc['sections'] if s.get('heading', '') == section)
        para = sec['content'][pi]
        for c in sorted(cs, key=lambda x: -x['offset']):
            a, b = c['offset'], c['offset'] + len(c['old'])
            if para[a:b] != c['old']:
                raise SystemExit(f'offset mismatch at v{vol} {section} p{pi}')
            para = para[:a] + c['new'] + para[b:]
        sec['content'][pi] = para

    for vol, doc in docs.items():
        path = os.path.join(DATA, 'c', f'{vol}.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))

    # Patch the existing search blobs in place.  Do NOT regenerate them:
    # volume 3's live blob preserves Arabic-Indic digits and must not be
    # normalized differently from its current state.
    from collections import defaultdict
    by_vol = defaultdict(lambda: defaultdict(list))
    for c in all_changes:
        by_vol[c['vol']][(c['section'], c['para'])].append(c)
    search_targets = {'قرهان': 'قرآن', 'قرمان': 'قرآن',
                      'تبرك الذي بيده': 'تبارك الذي بيده',
                      'انزلته': 'انزلناه', 'جعلته': 'جعلناه'}
    for vol, doc in docs.items():
        spath = os.path.join(DATA, 's', f'{vol}.txt')
        raw = open(spath, encoding='utf-8').read()
        lines = raw.split('\n')
        ordinals = {}
        k = 0
        for sec in doc['sections']:
            for pi in range(len(sec.get('content', []))):
                ordinals[(sec.get('heading', ''), pi)] = k
                k += 1
        if len(lines) != k:
            raise SystemExit(f'search line count mismatch vol {vol}: {len(lines)} != {k}')
        for key, cs in by_vol[vol].items():
            line = lines[ordinals[key]]
            for c in cs:
                old = c['pattern']
                new = search_targets[old]
                if old not in line:
                    raise SystemExit(f'search token missing vol {vol} {key}: {old}')
                line = line.replace(old, new, 1)
            lines[ordinals[key]] = line
        with open(spath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

    out = {'approved': len(approved), 'applied': len(all_changes),
           'counts': counts, 'changes': all_changes}
    with open(os.path.join(APP, 'audit', 'applied-ocr-fixes.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print('applied and wrote audit/applied-ocr-fixes.json')


if __name__ == '__main__':
    main()
