#!/usr/bin/env python3
"""Fetch license-clear plant photos from Wikimedia Commons for the encyclopedia.

Adds image/imageCredit/imageLicense/imageSource fields to data.js and downloads
thumbnails into images/<id>.<ext>. Writes image_report.json for manual review.
"""
import json, os, re, sys, time, html, urllib.parse, urllib.request

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'A3chabEncyclopedia/1.0 (https://ucfzem.github.io/al-a3chab-attebiah/)'
WIDTH = 480
SLEEP = 0.35

BAD_WORDS = ('map', 'distribution', 'range', 'diagram', 'logo', 'icon', 'flag', 'seal')
LOW_PREF = ('herbarium', 'specimen', 'sheet', 'drawing', 'illustration', 'plate')


def api(params):
    params = dict(params)
    params['format'] = 'json'
    url = API + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=35) as r:
        return json.loads(r.read().decode('utf-8'))


def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def binomial(latin):
    s = re.sub(r'\([^)]*\)', ' ', latin or '')
    s = re.split(r'\s+[—–]\s+', s)[0]
    s = s.split('/')[0]
    toks = s.split()
    if len(toks) >= 2:
        return toks[0] + ' ' + toks[1]
    return toks[0] if toks else ''


def license_ok(lic):
    L = lic.lower().strip()
    if not L:
        return False
    if re.search(r'\b(nc|nd)\b', L):
        return False
    return L.startswith('cc by') or L.startswith('cc0') or 'public domain' in L or L in ('pd', 'pd-old', 'cc-zero')


def search(binomial_name):
    d = api({
        'action': 'query', 'generator': 'search',
        'gsrsearch': binomial_name + ' filetype:bitmap',
        'gsrnamespace': 6, 'gsrlimit': 15,
        'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata',
        'iiurlwidth': WIDTH,
    })
    return list((d.get('query') or {}).get('pages', {}).values())


def pick(pages, binomial_name):
    genus, _, epithet = binomial_name.partition(' ')
    genus, epithet = genus.lower(), epithet.lower()
    best = None
    for p in pages:
        ii = (p.get('imageinfo') or [{}])[0]
        meta = ii.get('extmetadata') or {}
        lic = clean((meta.get('LicenseShortName') or {}).get('value', ''))
        if not license_ok(lic):
            continue
        title = p.get('title', '')
        desc = clean((meta.get('ImageDescription') or {}).get('value', ''))
        low = (title + ' ' + desc).lower()
        if any(b in low for b in BAD_WORDS):
            continue
        if genus not in low:
            continue
        score = 0
        if binomial_name.lower() in low:
            score += 6
        if epithet and epithet in low:
            score += 2
        if any(b in low for b in LOW_PREF):
            score -= 3
        if ii.get('width', 0) >= 800:
            score += 1
        if title.lower().endswith(('.jpg', '.jpeg')):
            score += 1
        if best is None or score > best[0]:
            best = (score, p, ii, meta, lic)
    return best


def fetch(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    with open(dest, 'wb') as f:
        f.write(data)
    return len(data)


def main(limit=None):
    src = open(os.path.join(APP, 'data.js'), encoding='utf-8').read()
    arr = json.loads(src[src.index('['):src.rindex(']') + 1])
    imgdir = os.path.join(APP, 'images')
    os.makedirs(imgdir, exist_ok=True)
    cache = {}          # binomial -> (path, credit dict)
    report = []
    entries = [x for x in arr if not x.get('isHeader')]
    if limit:
        entries = entries[:limit]
    done = 0
    for ch in entries:
        done += 1
        bn = binomial(ch.get('latin', ''))
        ch.pop('image', None)
        for k in ('imageCredit', 'imageLicense', 'imageLicenseUrl', 'imageSource'):
            ch.pop(k, None)
        if not bn:
            report.append({'id': ch['id'], 'latin': ch.get('latin', ''), 'status': 'no-binomial'})
            continue
        if bn in cache:
            path, credit = cache[bn]
            if path:
                ext = os.path.splitext(path)[1]
                dest = os.path.join(imgdir, ch['id'] + ext)
                if not os.path.exists(dest):
                    with open(os.path.join(APP, path), 'rb') as fi, open(dest, 'wb') as fo:
                        fo.write(fi.read())
                ch.update(image='images/' + ch['id'] + ext, **credit)
            report.append({'id': ch['id'], 'latin': bn, 'status': 'ok-cached' if path else 'none'})
            continue
        try:
            pages = search(bn)
            best = pick(pages, bn)
        except Exception as e:
            cache[bn] = (None, {})
            report.append({'id': ch['id'], 'latin': bn, 'status': 'error', 'error': str(e)})
            print('ERR', ch['id'], bn, e, flush=True)
            time.sleep(SLEEP)
            continue
        if not best:
            cache[bn] = (None, {})
            status = 'none' if pages else 'no-results'
            report.append({'id': ch['id'], 'latin': bn, 'status': status,
                           'candidates': len(pages)})
            print('MISS', ch['id'], bn, status, flush=True)
            time.sleep(SLEEP)
            continue
        score, p, ii, meta, lic = best
        url = ii.get('thumburl') or ii.get('url')
        ext = '.png' if url.lower().split('?')[0].endswith('.png') else '.jpg'
        dest = os.path.join(imgdir, ch['id'] + ext)
        try:
            size = fetch(url, dest)
        except Exception as e:
            cache[bn] = (None, {})
            report.append({'id': ch['id'], 'latin': bn, 'status': 'download-error', 'error': str(e)})
            print('DLERR', ch['id'], bn, e, flush=True)
            time.sleep(SLEEP)
            continue
        artist = clean((meta.get('Artist') or {}).get('value', ''))[:120] or 'Wikimedia Commons'
        licurl = clean((meta.get('LicenseUrl') or {}).get('value', ''))
        title = p.get('title', '').replace(' ', '_')
        credit = {
            'imageCredit': artist,
            'imageLicense': lic,
            'imageLicenseUrl': licurl,
            'imageSource': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title),
        }
        ch.update(image='images/' + ch['id'] + ext, **credit)
        cache[bn] = ('images/' + ch['id'] + ext, credit)
        report.append({'id': ch['id'], 'latin': bn, 'status': 'ok', 'file': ch['image'],
                       'license': lic, 'artist': artist, 'score': score, 'bytes': size})
        print('OK  ', done, ch['id'], bn, '|', lic, '|', artist[:40], flush=True)
        time.sleep(SLEEP)

    out = '/* بيانات الموسوعة — %d مدخلاً */\nwindow.BOOK_DATA = %s;\n' % (
        len(arr), json.dumps(arr, ensure_ascii=False, indent=0))
    open(os.path.join(APP, 'data.js'), 'w', encoding='utf-8').write(out)
    json.dump(report, open(os.path.join(APP, 'image_report.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    ok = sum(1 for r in report if r['status'].startswith('ok'))
    print(f'\nDONE ok={ok}/{len(report)}')


if __name__ == '__main__':
    main(int(sys.argv[1]) if len(sys.argv) > 1 else None)
