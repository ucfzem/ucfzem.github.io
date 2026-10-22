#!/usr/bin/env python3
"""Corrected builder for تفسير شيخ الإسلام ابن تيمية.

Rebuilt from the raw crawl (/tmp/opencode/tafsir_it/raw/vol-N.json).

Fixes over the original Node builder (build.mjs):

 1. Running headers vs. section headings.  Every scanned page opens with a
    running header block (page number / volume marker / surah name, in any
    order).  The original treated EVERY "سورة X" line as a heading, which
    produced duplicate sections (e.g. "سورة الأنعام" three times in vol. 3),
    and the reverse mistake dropped whole surahs.

    The correct rule, verified against the scan:
      * the running header names the surah the page belongs to -> when it
        changes, a new section starts;
      * a "سورة X" line inside the body is a section heading;
      * surahs only ever move forward, so a heading whose canonical index is
        not greater than the current section's is a repeated/running header
        and is dropped (this also removes the duplicates).
 2. Page numbers in Persian digits (۰-۹, U+06F0-06F9) leaked into the text.
 3. Running footers spelled out as ordinals ("الجزء الأول", "الجزء
    الثلاثون") leaked into the text — 965 lines book-wide.
 4. The Al-Fatihah section: an earlier commit replaced the whole section
    with 2 clean ayat lines, destroying 995 paragraphs of commentary.  We
    rebuild from the raw crawl and swap only the garbled opening ayat.
 5. TOC / index pages (الفهرس / الموضوع / الصفحة) at the end of every volume
    are skipped instead of polluting the final section.
 6. Short Latin/digit OCR junk lines ("D", "o.1", "VV", "01.") are dropped.
"""

import json
import os
import re

RAW = '/tmp/opencode/tafsir_it/raw'
OUT = '/tmp/opencode/ucfzem.github.io/tafsir-ibn-taymiyyah/data'
VOLS = [1, 2, 3, 4, 5, 6, 7]

SURAHS = [
    'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة',
    'يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه',
    'الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم',
    'لقمان','السجادة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر',
    'فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق',
    'الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة',
    'الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج',
    'نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس',
    'التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد',
    'الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات',
    'القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر',
    'المسد','الإخلاص','الفلق','الناس'
]

DIAC = re.compile(u'[ً-ٰٟۖ-ۭـ]')
FOLD = {u'أ': u'ا', u'إ': u'ا', u'آ': u'ا', u'ٱ': u'ا', u'ة': u'ه'}

SURAH_LINE = re.compile(u'^سورة\s+(.+)$')
# page numbers: Arabic-Indic ٠-٩, Extended (Persian) ۰-۹, ASCII
PAGENUM = re.compile(u'^[٠-٩۰-۹0-9]+$')
# running footer "الجزء الأول" / "الجزء ٧"
PART_FOOTER = re.compile(u'^الجزء\s+[ء-ي٠-٩۰-۹0-9\s]+$')
RANGE_HEADER = re.compile(u'^سورة\s+[^-]+ - سورة\s+[^-]+$')
# mangled running header: 'سورة صر', 'سورة الزمـ', 'سورة .' ...
MANGLED_HEADER = re.compile(u'^سورة\s+\S{1,6}$')
PUBLISHER = (u'دار ابن الجوزي', u'دارابن الجوزي')
TOC_HEADS = (u'الفهرس', u'فهرس', u'الموضوع', u'الصفحة')
# short latin / digit OCR junk
JUNK_LATIN = re.compile(u'^[A-Za-z0-9][A-Za-z0-9 .,:\-]{0,11}$')

NOISE_EXACT = {
    u'تفسير شيخ الإسلام ابن تيمية',
    u'شيخ الإسلام ابن تيمية مفسراً',
    u'تصدير المراجع',
    u'مؤلفات شيخ الإسلام التي اعتمدت في جمع هذا التفسير',
    u'مقدمة الناشر',
}


def fold(s):
    s = DIAC.sub('', s)
    for k, v in FOLD.items():
        s = s.replace(k, v)
    return re.sub(r'\s+', ' ', s).strip()


SURAH_SET = {}
for _i, _s in enumerate(SURAHS):
    SURAH_SET.setdefault(fold(_s), _i)


def _one_edit(a, b):
    """True if a and b differ by at most one insert/delete/substitute."""
    la, lb = len(a), len(b)
    if abs(la - lb) > 1:
        return False
    if la == lb:
        diff = sum(1 for x, y in zip(a, b) if x != y)
        return diff <= 1
    if la > lb:
        a, b = b, a
        la, lb = lb, la
    i = j = 0
    skipped = False
    while i < la and j < lb:
        if a[i] == b[j]:
            i += 1
            j += 1
        elif skipped:
            return False
        else:
            skipped = True
            j += 1
    return True


def _fuzzy(name):
    """OCR-tolerant lookup: the printed edition contains typos such as
    'سورة السجدة' for 'سورة السجادة'.  Restricted to names that share the
    first four letters with exactly one canonical surah, so that short
    header fragments ('الرح' for الرحمن/الشرح) are never matched."""
    if len(name) < 5:
        return -1
    hits = []
    for i, s in enumerate(SURAHS):
        f = fold(s)
        if f[:4] != name[:4]:
            continue
        if _one_edit(name, f):
            hits.append(i)
    return hits[0] if len(hits) == 1 else -1


def surah_of(line):
    """Canonical surah index if the line names a real surah heading."""
    m = SURAH_LINE.match(line)
    if not m:
        return -1
    name = m.group(1).strip().rstrip('.؟ ')
    if not name or len(name) > 28:
        return -1
    f = fold(name)
    if f in SURAH_SET:
        return SURAH_SET[f]
    return _fuzzy(f)


def is_noise_line(line):
    l = line.strip()
    if not l:
        return True
    if PAGENUM.match(l):
        return True
    if PART_FOOTER.match(l):
        return True
    if RANGE_HEADER.match(l):
        return True
    if l in NOISE_EXACT:
        return True
    if l in PUBLISHER:
        return True
    if JUNK_LATIN.match(l):
        return True
    return False


def build_volume(vol):
    path = os.path.join(RAW, 'vol-%d.json' % vol)
    if not os.path.exists(path):
        return None
    pages = json.load(open(path, encoding='utf-8'))['pages']

    page_nums = sorted(int(k) for k, v in pages.items()
                       if isinstance(v, str) and len(v.strip()) > 40)

    sections = []
    cur = None
    cur_sidx = -1

    def start_section(sidx):
        nonlocal cur, cur_sidx
        cur = {
            'id': 'juz-%d-s%d' % (vol, len(sections) + 1),
            'heading': 'سورة ' + SURAHS[sidx],
            'content': [],
        }
        sections.append(cur)
        cur_sidx = sidx

    for pn in page_nums:
        lines = [re.sub(r'\s+', ' ', l).strip() for l in pages[str(pn)].split('\n')]
        lines = [l for l in lines if l]
        if not lines:
            continue

        # TOC / index pages carry a 2-3 line "الفهرس / الموضوع / الصفحة"
        # header — skip them entirely.
        if any(l in TOC_HEADS for l in lines[:4]):
            continue

        # --- running header block -------------------------------------------
        i = 0
        hdr_sidx = -1
        while i < len(lines):
            l = lines[i]
            if PART_FOOTER.match(l) or PAGENUM.match(l):
                i += 1
                continue
            s = surah_of(l)
            if s >= 0:
                hdr_sidx = s
                i += 1
                continue
            if MANGLED_HEADER.match(l):
                i += 1
                continue
            break

        # the running header names the surah the page belongs to
        if hdr_sidx > cur_sidx:
            start_section(hdr_sidx)

        # --- body ------------------------------------------------------------
        for line in lines[i:]:
            s = surah_of(line)
            if s >= 0:
                if s > cur_sidx:
                    start_section(s)
                # repeated heading / running header -> drop the line
                continue
            if is_noise_line(line):
                continue
            if cur is not None:
                cur['content'].append(line)

    return [s for s in sections if s['content']]


# ---------------------------------------------------------------- Fatihah

FATIHAH_AYAT = [
    u'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾',
    u'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
    u'الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾',
    u'مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾',
    u'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾',
    u'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾',
    u'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
]

# The scan lost the start of the basmala and split the ayat across three
# broken lines; these are their real openings.
FATIHAH_GARBLED = (
    u'\u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062d\u0645\u0646',
    u'\u0627\u0644\u0631\u062d\u064a\u0629\u0650 \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u064e \u0627\u0644\u0652\u064e\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e',
    u'\u0645\u064e\u0644\u0650\u0643\u0650 \u064a\u064e\u0648\u0652\u0645\u0650 \u0627\u0644\u0652\u062f\u0651\u064a\u0646\u0650 \u0625\u0650\u064a\u0651\u064e\u0627\u0643\u064e \u0646\u064e\u0639\u0652\u0628\u064f\u062f\u064f',
)
FATIHAH_COMMENTARY_START = u'\u0642\u0627\u0644 \u0634\u064a\u062e \u0627\u0644\u0625\u0633\u0644\u0627\u0645 \u0641\u064a \u0623\u0633\u0628\u0627\u0628 \u0646\u0632\u0648\u0644 \u0627\u0644\u0641\u0627\u062a\u062d\u0629 :'


def _pref(text, n=10):
    """First n characters with diacritics stripped - used to recognise the
    broken opening lines of Al-Fatihah."""
    return DIAC.sub('', text)[:n].strip()


def fix_fatihah(section):
    """Replace the garbled opening with the seven clean ayat (the basmala
    counts as the first one) and keep the full commentary."""
    content = section['content']
    start = None
    for i, line in enumerate(content):
        if line.startswith(FATIHAH_COMMENTARY_START):
            start = i
            break

    def clean(seq):
        out = []
        for l in seq:
            pl = _pref(l)
            if pl and any(pl == _pref(g) for g in FATIHAH_GARBLED):
                continue
            out.append(l)
        return out

    head = clean(content[:start]) if start is not None else clean(content)
    tail = content[start:] if start is not None else []
    section['content'] = list(FATIHAH_AYAT) + head + tail
    return section


# ------------------------------------------------------------------ main

def main():
    os.makedirs(os.path.join(OUT, 'c'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 's'), exist_ok=True)

    chapters = []
    for vol in VOLS:
        sections = build_volume(vol)
        if not sections:
            print('vol %d: no sections' % vol)
            continue
        if vol == 1 and sections and sections[0]['heading'] == 'سورة الفاتحة':
            fix_fatihah(sections[0])
        paras = sum(len(s['content']) for s in sections)
        print('vol %d: %2d sections, %5d paragraphs' % (vol, len(sections), paras))
        chapters.append({
            'id': 'juz-%d' % vol,
            'number': vol,
            'title': 'الجزء %d' % vol,
            'sections': sections,
        })

    book = {
        'id': 'tafsir-ibn-taymiyyah',
        'title': 'تفسير شيخ الإسلام ابن تيمية',
        'author': 'جمع وتحقيق: إياد بن عبد اللطيف القيسي',
        'author_full': 'شيخ الإسلام أحمد بن عبد الحليم بن عبد السلام ابن تيمية (٦٦١ - ٧٢٨هـ)',
        'collector': 'إياد بن عبد اللطيف بن إبراهيم القيسي',
        'publisher': 'دار ابن الجوزي — الدمام',
        'edition': 'الأولى، ١٤٣٢هـ',
        'volumes': 7,
        'year_ah': 1432,
        'total_chapters': len(chapters),
        'content_langs': ['ar'],
        'translations': {
            'ar': {
                'title': 'تفسير شيخ الإسلام ابن تيمية',
                'author': 'جمع وتحقيق: إياد بن عبد اللطيف القيسي',
            }
        },
    }

    # ---- write chapter files + search blobs
    for ch in chapters:
        n = ch['number']
        with open(os.path.join(OUT, 'c', '%d.json' % n), 'w', encoding='utf-8') as f:
            json.dump(ch, f, ensure_ascii=False, separators=(',', ':'))
        blob = []
        for sec in ch['sections']:
            for p in sec['content']:
                blob.append(fold(p))
        with open(os.path.join(OUT, 's', '%d.txt' % n), 'w', encoding='utf-8') as f:
            f.write('\n'.join(blob))

    # ---- index
    index = {
        'book': book,
        'chapters': [],
    }
    for ch in chapters:
        n = ch['number']
        index['chapters'].append({
            'id': ch['id'],
            'number': n,
            'title': ch['title'],
            'file': 'c/%d.json' % n,
            'search': 's/%d.txt' % n,
            'paras': sum(len(s['content']) for s in ch['sections']),
            'sections': [
                {'id': s['id'], 'heading': s['heading'], 'paras': len(s['content'])}
                for s in ch['sections']
            ],
        })
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, separators=(',', ':'))

    total = sum(c['paras'] for c in index['chapters'])
    secs = sum(len(c['sections']) for c in index['chapters'])
    print('WROTE %d chapters, %d sections, %d paragraphs' % (len(chapters), secs, total))


if __name__ == '__main__':
    main()
