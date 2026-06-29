"""
Vercel serverless function — generates CV PDF via ReportLab.
POST /api/generate-cv with JSON body matching CVData schema.
Auto-detects language: fr → Helvetica LTR, ar → Amiri RTL + arabic_reshaper.
"""

import os, tempfile, urllib.request, zipfile, shutil
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

app = FastAPI(title="CV Generator")

# ── Colors ──
GOLD      = HexColor('#C9A84C')
GOLD_DARK = HexColor('#A88830')
DARK      = HexColor('#2C1A06')
LIGHT     = HexColor('#FAF3E8')
SUB       = HexColor('#D4C4A8')
EMPTY_DOT = HexColor('#6B5535')
MAIN_TEXT = HexColor('#3D2E1A')
MID_TEXT  = HexColor('#5C4A2E')
MUTED     = HexColor('#A89878')
BEIGE_BG  = HexColor('#FAF3E8')

W, H = A4
SIDEBAR_W = 178
MARGIN_S  = 16
MARGIN_M  = 18
MAIN_X    = SIDEBAR_W + MARGIN_M
MAIN_W    = W - SIDEBAR_W - MARGIN_M - 14

FONT_DIR = '/tmp/amiri_font'
AMIRI_PATH = os.path.join(FONT_DIR, 'Amiri-Regular.ttf')
AMIRI_URL = 'https://github.com/alif-type/amiri/releases/download/v1.001/Amiri-1.001.zip'

_arabic_loaded = False
_arabic_reshaper = None
_bidi_get_display = None

def _ensure_amiri():
    if os.path.exists(AMIRI_PATH):
        return
    os.makedirs(FONT_DIR, exist_ok=True)
    zip_path = os.path.join(FONT_DIR, 'amiri.zip')
    req = urllib.request.Request(AMIRI_URL, headers={'User-Agent': 'CV-Maker/1.0'})
    with urllib.request.urlopen(req, timeout=30) as src, open(zip_path, 'wb') as dst:
        shutil.copyfileobj(src, dst)
    with zipfile.ZipFile(zip_path, 'r') as z:
        for f in z.namelist():
            if f.endswith('Amiri-Regular.ttf'):
                z.extract(f, FONT_DIR)
                extracted = os.path.join(FONT_DIR, f)
                shutil.move(extracted, AMIRI_PATH)
                break
    os.remove(zip_path)

def _load_arabic():
    global _arabic_loaded, _arabic_reshaper, _bidi_get_display
    if not _arabic_loaded:
        import arabic_reshaper
        _arabic_reshaper = arabic_reshaper
        from bidi.algorithm import get_display
        _bidi_get_display = get_display
        _ensure_amiri()
        pdfmetrics.registerFont(TTFont('Amiri', AMIRI_PATH))
        _arabic_loaded = True

def ar(text):
    if not text: return ''
    _load_arabic()
    reshaped = _arabic_reshaper.reshape(str(text))
    return _bidi_get_display(reshaped)

# ── Models ──
class Skill(BaseModel):
    name: str
    level: int

class SkillCategory(BaseModel):
    name: str
    skills: List[Skill]

class Language(BaseModel):
    name: str
    level: str

class CustomItem(BaseModel):
    title: str
    subtitle: Optional[str] = ''
    description: Optional[str] = ''

class CustomSection(BaseModel):
    title: str
    items: List[CustomItem]

class Experience(BaseModel):
    position: str
    company: str
    startDate: str
    endDate: Optional[str] = ''
    description: Optional[str] = ''

class Education(BaseModel):
    degree: str
    field: Optional[str] = ''
    institution: str
    startDate: str
    endDate: Optional[str] = ''
    gpa: Optional[str] = ''

class Personal(BaseModel):
    fullName: str
    title: str
    email: str
    phone: str
    location: str
    website: Optional[str] = ''
    summary: Optional[str] = ''
    lang: Optional[str] = 'fr'

class CVData(BaseModel):
    personal: Personal
    experiences: List[Experience] = []
    education: List[Education] = []
    skillCategories: List[SkillCategory] = []
    languages: List[Language] = []
    customSections: List[CustomSection] = []

# ── Shared helpers ──
def draw_dots(c_obj, x, y, filled, total=4):
    r = 3.2
    gap = 9
    for i in range(total):
        c_obj.setFillColor(GOLD if i < filled else EMPTY_DOT)
        c_obj.circle(x + i * gap, y, r, fill=1, stroke=0)

# ── French (LTR) ──
def draw_sidebar_fr(c, p, skill_cats, langs):
    sy = H - 36
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 20)
    c.drawString(MARGIN_S, sy, p.fullName)
    sy -= 14
    c.setFillColor(SUB)
    c.setFont('Helvetica-Bold', 7.5)
    c.drawString(MARGIN_S, sy, p.title.upper())
    sy -= 10
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
    sy -= 12
    for val in [p.email, p.phone, p.location, p.website]:
        if not val: continue
        c.setFillColor(GOLD)
        c.rect(MARGIN_S, sy - 3, 3, 3, fill=1, stroke=0)
        c.setFillColor(LIGHT)
        c.setFont('Helvetica', 7.5)
        text = val
        max_w = SIDEBAR_W - MARGIN_S - 8
        while c.stringWidth(text, 'Helvetica', 7.5) > max_w and len(text) > 5:
            text = text[:-2]
        c.drawString(MARGIN_S + 6, sy, text)
        sy -= 10
    sy -= 4
    for cat in skill_cats:
        if not cat.skills: continue
        c.setFillColor(GOLD)
        c.setFont('Helvetica-Bold', 7)
        c.drawString(MARGIN_S, sy, cat.name.upper())
        sy -= 3
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.3)
        c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
        sy -= 9
        for sk in cat.skills:
            c.setFillColor(LIGHT)
            c.setFont('Helvetica', 8)
            c.drawString(MARGIN_S + 2, sy, sk.name)
            dot_x = SIDEBAR_W - MARGIN_S - 4 * 9 + 3
            draw_dots(c, dot_x, sy - 2, sk.level)
            sy -= 11
        sy -= 4
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 7)
    c.drawString(MARGIN_S, sy, 'LANGUES')
    sy -= 3
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.3)
    c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
    sy -= 9
    for lang in langs:
        c.setFillColor(LIGHT)
        c.setFont('Helvetica', 8)
        c.drawString(MARGIN_S + 2, sy, lang.name)
        c.setFillColor(GOLD)
        c.setFont('Helvetica-Bold', 8)
        c.drawRightString(SIDEBAR_W - MARGIN_S, sy, lang.level)
        sy -= 11

def wrap_ltr(c_obj, text, x, y, max_w, font, size, color, lh=11):
    c_obj.setFont(font, size)
    c_obj.setFillColor(color)
    words = text.split()
    line = ''
    for w in words:
        test = (line + ' ' + w).strip()
        if c_obj.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            c_obj.drawString(x, y, line)
            y -= lh
            line = w
    if line:
        c_obj.drawString(x, y, line)
        y -= lh
    return y

def section_title_fr(c, text, x, y, width):
    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(DARK)
    c.drawString(x, y, text.upper())
    y -= 4
    c.setStrokeColor(DARK)
    c.setLineWidth(1)
    c.line(x, y, x + width, y)
    return y - 10

def draw_main_fr(c, p, exps, edus, custom_secs):
    my = H - 30
    if p.summary:
        words = p.summary.split()
        lines = []
        line = ''
        for w in words:
            test = (line + ' ' + w).strip()
            if c.stringWidth(test, 'Helvetica', 8.5) <= MAIN_W - 12:
                line = test
            else:
                lines.append(line)
                line = w
        if line: lines.append(line)
        box_h = len(lines) * 11 + 14
        c.setFillColor(BEIGE_BG)
        c.rect(MAIN_X - 2, my - box_h + 6, MAIN_W + 4, box_h, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(MAIN_X - 2, my - box_h + 6, 2.5, box_h, fill=1, stroke=0)
        c.setFillColor(MAIN_TEXT)
        c.setFont('Helvetica', 8.5)
        ty = my
        for l in lines:
            c.drawString(MAIN_X + 8, ty, l)
            ty -= 11
        my = ty - 8
    if exps:
        my = section_title_fr(c, 'Expérience Professionnelle', MAIN_X, my, MAIN_W)
        for e in exps:
            c.setFont('Helvetica-Bold', 9.5)
            c.setFillColor(DARK)
            c.drawString(MAIN_X, my, e.position)
            date_str = e.startDate + ' - ' + (e.endDate or 'Présent')
            c.setFont('Helvetica', 7.5)
            c.setFillColor(MUTED)
            c.drawRightString(MAIN_X + MAIN_W, my, date_str)
            my -= 11
            c.setFont('Helvetica-Bold', 8)
            c.setFillColor(GOLD_DARK)
            c.drawString(MAIN_X, my, e.company)
            my -= 11
            if e.description:
                my = wrap_ltr(c, e.description, MAIN_X, my, MAIN_W, 'Helvetica', 8, MAIN_TEXT, 11)
            my -= 6
    if edus:
        my = section_title_fr(c, 'Education & Formation', MAIN_X, my, MAIN_W)
        for e in edus:
            degree = e.degree + (' en ' + e.field if e.field else '')
            c.setFont('Helvetica-Bold', 9)
            c.setFillColor(DARK)
            c.drawString(MAIN_X, my, degree)
            date_str = e.startDate + ' - ' + (e.endDate or 'Présent')
            c.setFont('Helvetica', 7.5)
            c.setFillColor(MUTED)
            c.drawRightString(MAIN_X + MAIN_W, my, date_str)
            my -= 11
            inst = e.institution + (' | GPA: ' + e.gpa if e.gpa else '')
            c.setFont('Helvetica', 8)
            c.setFillColor(MID_TEXT)
            c.drawString(MAIN_X, my, inst)
            my -= 14
    for sec in custom_secs:
        if not sec.items: continue
        my = section_title_fr(c, sec.title, MAIN_X, my, MAIN_W)
        for item in sec.items:
            c.setFont('Helvetica-Bold', 9)
            c.setFillColor(DARK)
            c.drawString(MAIN_X, my, item.title)
            my -= 11
            if item.subtitle:
                c.setFont('Helvetica-Oblique', 7.5)
                c.setFillColor(MUTED)
                c.drawString(MAIN_X, my, item.subtitle)
                my -= 10
            if item.description:
                my = wrap_ltr(c, item.description, MAIN_X, my, MAIN_W, 'Helvetica', 8, MAIN_TEXT, 11)
            my -= 4

# ── Arabic (RTL) ──
def draw_sidebar_ar(c, p, skill_cats, langs):
    sy = H - 36
    c.setFillColor(GOLD)
    c.setFont('Amiri', 20)
    c.drawString(MARGIN_S, sy, p.fullName)
    sy -= 15
    c.setFillColor(SUB)
    c.setFont('Amiri', 8)
    c.drawRightString(SIDEBAR_W - MARGIN_S, sy, ar(p.title))
    sy -= 10
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
    sy -= 12
    for val in [p.email, p.phone, p.location, p.website]:
        if not val: continue
        c.setFillColor(GOLD)
        c.rect(MARGIN_S, sy - 3, 3, 3, fill=1, stroke=0)
        c.setFillColor(LIGHT)
        c.setFont('Amiri', 7.5)
        max_w = SIDEBAR_W - MARGIN_S - 10
        text = val
        while c.stringWidth(text, 'Amiri', 7.5) > max_w and len(text) > 4:
            text = text[:-1]
        c.drawString(MARGIN_S + 6, sy, text)
        sy -= 10
    sy -= 4
    for cat in skill_cats:
        if not cat.skills: continue
        c.setFillColor(GOLD)
        c.setFont('Amiri', 7.5)
        c.drawRightString(SIDEBAR_W - MARGIN_S, sy, ar(cat.name))
        sy -= 3
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.3)
        c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
        sy -= 9
        for sk in cat.skills:
            c.setFillColor(LIGHT)
            c.setFont('Amiri', 8)
            c.drawString(MARGIN_S + 2, sy, sk.name)
            dot_x = SIDEBAR_W - MARGIN_S - 4 * 9 + 3
            draw_dots(c, dot_x, sy - 2, sk.level)
            sy -= 11
        sy -= 4
    c.setFillColor(GOLD)
    c.setFont('Amiri', 7.5)
    c.drawRightString(SIDEBAR_W - MARGIN_S, sy, ar('اللغات'))
    sy -= 3
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.3)
    c.line(MARGIN_S, sy, SIDEBAR_W - MARGIN_S, sy)
    sy -= 9
    for lang in langs:
        c.setFillColor(LIGHT)
        c.setFont('Amiri', 8)
        c.drawRightString(SIDEBAR_W - MARGIN_S, sy, ar(lang.name))
        c.setFillColor(GOLD)
        c.setFont('Amiri', 8)
        c.drawString(MARGIN_S + 2, sy, lang.level)
        sy -= 11

def wrap_ar_right(c_obj, text, x, y, max_w, size=8.5, color=MAIN_TEXT, lh=12):
    c_obj.setFont('Amiri', size)
    c_obj.setFillColor(color)
    words = text.split()
    line_words = []
    lines = []
    for w in words:
        test = ' '.join(line_words + [w])
        bidi = ar(test)
        if c_obj.stringWidth(bidi, 'Amiri', size) <= max_w:
            line_words.append(w)
        else:
            if line_words: lines.append(' '.join(line_words))
            line_words = [w]
    if line_words: lines.append(' '.join(line_words))
    for line in lines:
        c_obj.drawRightString(x + max_w, y, ar(line))
        y -= lh
    return y

def section_title_ar(c, text, x, y, width):
    c.setFont('Amiri', 10)
    c.setFillColor(DARK)
    c.drawRightString(x + width, y, ar(text))
    y -= 4
    c.setStrokeColor(DARK)
    c.setLineWidth(1)
    c.line(x, y, x + width, y)
    return y - 10

def draw_main_ar(c, p, exps, edus, custom_secs):
    my = H - 30
    if p.summary:
        words = p.summary.split()
        lines_s = []
        lw = []
        for w in words:
            test = ' '.join(lw + [w])
            bidi = ar(test)
            if c.stringWidth(bidi, 'Amiri', 8.5) <= MAIN_W - 12:
                lw.append(w)
            else:
                if lw: lines_s.append(' '.join(lw))
                lw = [w]
        if lw: lines_s.append(' '.join(lw))
        box_h = len(lines_s) * 12 + 14
        c.setFillColor(BEIGE_BG)
        c.rect(MAIN_X - 2, my - box_h + 6, MAIN_W + 4, box_h, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(MAIN_X + MAIN_W - 0.5, my - box_h + 6, 2.5, box_h, fill=1, stroke=0)
        c.setFillColor(MAIN_TEXT)
        c.setFont('Amiri', 8.5)
        ty = my
        for line in lines_s:
            c.drawRightString(MAIN_X + MAIN_W - 6, ty, ar(line))
            ty -= 12
        my = ty - 8
    if exps:
        my = section_title_ar(c, 'الخبرة المهنية', MAIN_X, my, MAIN_W)
        for e in exps:
            c.setFont('Amiri', 10)
            c.setFillColor(DARK)
            c.drawRightString(MAIN_X + MAIN_W, my, ar(e.position))
            date_str = e.startDate + ' - ' + (e.endDate or 'الآن')
            c.setFont('Amiri', 7.5)
            c.setFillColor(MUTED)
            c.drawString(MAIN_X, my, ar(date_str))
            my -= 12
            c.setFont('Amiri', 8.5)
            c.setFillColor(GOLD_DARK)
            c.drawRightString(MAIN_X + MAIN_W, my, ar(e.company))
            my -= 12
            if e.description:
                my = wrap_ar_right(c, e.description, MAIN_X, my, MAIN_W, 8.5, MAIN_TEXT, 12)
            my -= 6
    if edus:
        my = section_title_ar(c, 'التعليم والتكوين', MAIN_X, my, MAIN_W)
        for e in edus:
            degree = e.degree + (' - ' + e.field if e.field else '')
            c.setFont('Amiri', 9.5)
            c.setFillColor(DARK)
            c.drawRightString(MAIN_X + MAIN_W, my, ar(degree))
            date_str = e.startDate + ' - ' + (e.endDate or 'الآن')
            c.setFont('Amiri', 7.5)
            c.setFillColor(MUTED)
            c.drawString(MAIN_X, my, ar(date_str))
            my -= 12
            inst = e.institution + (' | GPA: ' + e.gpa if e.gpa else '')
            c.setFont('Amiri', 8)
            c.setFillColor(MID_TEXT)
            c.drawRightString(MAIN_X + MAIN_W, my, ar(inst))
            my -= 14
    for sec in custom_secs:
        if not sec.items: continue
        my = section_title_ar(c, sec.title, MAIN_X, my, MAIN_W)
        for item in sec.items:
            c.setFont('Amiri', 9)
            c.setFillColor(DARK)
            c.drawRightString(MAIN_X + MAIN_W, my, ar(item.title))
            my -= 12
            if item.subtitle:
                c.setFont('Amiri', 7.5)
                c.setFillColor(MUTED)
                c.drawString(MAIN_X, my, item.subtitle)
                my -= 10
            if item.description:
                my = wrap_ar_right(c, item.description, MAIN_X, my, MAIN_W, 8, MAIN_TEXT, 11)
            my -= 4

# ── Endpoint ──
@app.post("/api/generate-cv")
async def generate_cv(data: CVData):
    lang = (data.personal.lang or 'fr').lower()
    is_ar = lang in ('ar', 'ara', 'arabic')

    if is_ar:
        _load_arabic()

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    out_path = tmp.name
    tmp.close()

    c = canvas.Canvas(out_path, pagesize=A4)

    # Sidebar background
    c.setFillColor(DARK)
    c.rect(0, 0, SIDEBAR_W, H, fill=1, stroke=0)

    if is_ar:
        draw_sidebar_ar(c, data.personal, data.skillCategories, data.languages)
        draw_main_ar(c, data.personal, data.experiences, data.education, data.customSections)
    else:
        draw_sidebar_fr(c, data.personal, data.skillCategories, data.languages)
        draw_main_fr(c, data.personal, data.experiences, data.education, data.customSections)

    c.save()

    filename = (data.personal.fullName or 'CV').replace(' ', '_') + '.pdf'
    return FileResponse(out_path, media_type='application/pdf', filename=filename,
                        headers={'Content-Disposition': f'attachment; filename="{filename}"'})
