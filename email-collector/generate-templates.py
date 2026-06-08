#!/tmp/pdf-venv/bin/python3
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), 'templates')
os.makedirs(OUT_DIR, exist_ok=True)

PW, PH = A4  # 595.2756 x 841.8898

# Colors (lighter brown/gold palette)
GOLD = HexColor('#d4a017')
GOLD_LIGHT = HexColor('#f5e1a0')
BROWN = HexColor('#8B6914')
DARK = HexColor('#1a150e')
DARK_BROWN = HexColor('#3d3224')
TEXT_DIM = HexColor('#9e9080')
SILVER = HexColor('#8a8270')
CREAM = HexColor('#fdf8f0')
ROW_ALT = HexColor('#faf5eb')
WHITE = HexColor('#ffffff')
SECTION_NUM = HexColor('#d4a017')
SECTION_TITLE = HexColor('#3d3224')
FIELD_COLOR = HexColor('#d4cdc0')
BORDER_COLOR = HexColor('#e0d5c5')
TABLE_HEADER = HexColor('#f5e1a0')
TABLE_BORDER = HexColor('#d4cdc0')
SIGNATURE_GRAY = HexColor('#8a8270')
COVER_GOLD = HexColor('#d4a017')
COVER_SUBTITLE = HexColor('#c4b59a')
HEADER_LABEL = HexColor('#b8a88c')

X0 = 51.02362
COL_GAP = 104.2234

class RLTemplate:
    def __init__(self, filename, title, subtitle, label):
        self.filename = os.path.join(OUT_DIR, filename)
        self.canvas = canvas.Canvas(self.filename, pagesize=A4)
        self.y = 0
        self.page_num = 0
        self._init_cover(title, subtitle, label)

    def _init_cover(self, title, subtitle, label):
        c = self.canvas
        c.setFillColor(HexColor('#1a150e'))
        c.rect(0, 0, PW, PH, fill=1)
        c.setFillColor(TEXT_DIM)
        c.setFont('Helvetica', 7)
        c.drawString(X0, PH - 31, 'UCF ZEM')
        c.drawString(X0, PH - 41, 'ucfzem.gumroad.com')

        c.setFillColor(BROWN)
        c.setFont('Helvetica-Bold', 8)
        lw = c.stringWidth(label, 'Helvetica-Bold', 8) + 16
        c.roundRect((PW - lw) / 2, PH - 65, lw, 12, 3, fill=1, stroke=0)
        c.setFillColor(GOLD_LIGHT)
        c.drawString((PW - c.stringWidth(label, 'Helvetica-Bold', 8)) / 2, PH - 61, label)

        c.setFillColor(GOLD_LIGHT)
        c.setFont('Helvetica-Bold', 24)
        c.drawCentredString(PW / 2, PH - 110, title)

        c.setFillColor(COVER_SUBTITLE)
        c.setFont('Helvetica', 11)
        c.drawCentredString(PW / 2, PH - 125, subtitle)

        c.setStrokeColor(GOLD)
        c.setLineWidth(0.3)
        c.line(70, PH - 148, 140, PH - 148)

        c.setFillColor(TEXT_DIM)
        c.setFont('Helvetica', 8)
        c.drawCentredString(PW / 2, PH - 162, 'ucfzem.gumroad.com')
        c.showPage()
        self.page_num = 1

    def new_page(self):
        self.canvas.showPage()
        self.page_num += 1

    def header_footer(self):
        c = self.canvas
        c.setFillColor(TEXT_DIM)
        c.setFont('Helvetica', 6.5)
        header = f'UCF ZEM'
        c.drawString(X0, PH - 31, header)
        c.drawString(X0, PH - 41, 'ucfzem.gumroad.com')

        c.setFillColor(HEADER_LABEL)
        c.setFont('Helvetica', 8)
        c.drawRightString(PW - 51, PH - 31, 'DOCUMENT')

        c.setFillColor(TEXT_DIM)
        c.drawString(X0, 12.75591,
                     f'Page {self.page_num}  |  UCF ZEM — Templates Freelance Professionnels  |  ucfzem.gumroad.com')
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.3)
        c.line(X0, 18, PW - 51, 18)
        c.setFillColor(DARK_BROWN)

    def title_block(self, main_title, version='Version 2025'):
        c = self.canvas
        c.setFont('Helvetica-Bold', 22)
        c.drawString(X0, self.y, main_title)
        self.y -= 28

        c.setFont('Helvetica', 9)
        c.setFillColor(TEXT_DIM)
        c.drawString(X0, self.y, 'Modèle prêt à l\'emploi — Personnalisable')
        self.y -= 12

        c.setFont('Helvetica-Bold', 9)
        c.drawString(X0, self.y, version)
        self.y -= 16
        c.setFillColor(DARK_BROWN)

    def section(self, num, title):
        self.y -= 6
        c = self.canvas
        c.setFont('Helvetica-Bold', 13)
        c.setFillColor(SECTION_NUM)
        c.drawString(X0, self.y, f'{num}.')
        c.setFillColor(SECTION_TITLE)
        c.drawString(X0 + c.stringWidth(f'{num}.', 'Helvetica-Bold', 13) + 3, self.y, title)
        self.y -= 18
        c.setFillColor(DARK_BROWN)

    def body(self, text, size=9):
        c = self.canvas
        c.setFont('Helvetica', size)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, text)
        self.y -= 14
        c.setFillColor(DARK_BROWN)

    def body_multi(self, text, size=9, max_width=500):
        c = self.canvas
        c.setFont('Helvetica', size)
        c.setFillColor(DARK_BROWN)
        lines = simpleSplit(text, 'Helvetica', size, max_width)
        for line in lines:
            if self.y < 40:
                self.header_footer()
                self.new_page()
                self.header_footer()
            c.drawString(X0, self.y, line)
            self.y -= 14
        c.setFillColor(DARK_BROWN)

    def field(self, label, value='___________________'):
        c = self.canvas
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, label)
        c.setFont('Helvetica', 9)
        c.setFillColor(FIELD_COLOR)
        c.drawString(X0 + c.stringWidth(label, 'Helvetica-Bold', 8) + 5, self.y, value)
        self.y -= 13
        c.setFillColor(DARK_BROWN)

    def two_col_fields(self, left_label, right_label, value='___________________'):
        c = self.canvas
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, left_label)
        c.drawString(X0 + COL_GAP, self.y, right_label)

        c.setFont('Helvetica', 9)
        c.setFillColor(FIELD_COLOR)
        vw = c.stringWidth(value, 'Helvetica', 9)
        c.drawString(X0 + c.stringWidth(left_label, 'Helvetica-Bold', 8) + 5, self.y, value)
        c.drawString(X0 + COL_GAP + c.stringWidth(right_label, 'Helvetica-Bold', 8) + 5, self.y, value)
        self.y -= 13
        c.setFillColor(DARK_BROWN)

    def two_col_header(self, left, right):
        c = self.canvas
        c.setFont('Helvetica-Bold', 9)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, left)
        c.drawString(X0 + COL_GAP, self.y, right)
        self.y -= 15

    def table(self, headers, rows, col_widths):
        c = self.canvas
        # Calculate total width
        total_w = sum(col_widths)
        x_start = X0

        # Draw header
        c.setFont('Helvetica-Bold', 8.5)
        c.setFillColor(DARK)
        c.setStrokeColor(TABLE_BORDER)
        c.setLineWidth(0.3)
        c.setFillColor(TABLE_HEADER)
        c.rect(x_start, self.y - 7, total_w, 7, fill=1, stroke=1)
        c.setFillColor(DARK)
        x = x_start + 3
        for i, h in enumerate(headers):
            c.drawString(x, self.y - 6, h)
            x += col_widths[i]
        self.y -= 7

        # Draw rows
        c.setFont('Helvetica', 8.5)
        for ri, row in enumerate(rows):
            if ri % 2 == 0:
                c.setFillColor(ROW_ALT)
            else:
                c.setFillColor(WHITE)
            c.setStrokeColor(TABLE_BORDER)
            c.setLineWidth(0.15)
            c.rect(x_start, self.y - 6, total_w, 6, fill=1, stroke=1)
            c.setFillColor(DARK_BROWN)
            x = x_start + 3
            for i, cell in enumerate(row):
                c.drawString(x, self.y - 5, str(cell))
                x += col_widths[i]
            self.y -= 6

        self.y -= 6

    def bullet(self, text, indent=12, size=9):
        c = self.canvas
        c.setFont('Helvetica', size)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0 + indent, self.y, f'\u2014 {text}')
        self.y -= 14

    def bullet_multi(self, text, indent=12, size=9, max_width=480):
        c = self.canvas
        c.setFont('Helvetica', size)
        c.setFillColor(DARK_BROWN)
        full = f'\u2014 {text}'
        lines = simpleSplit(full, 'Helvetica', size, max_width)
        for line in lines:
            if self.y < 40:
                self.header_footer()
                self.new_page()
                self.header_footer()
            c.drawString(X0 + indent, self.y, line)
            self.y -= 13
        c.setFillColor(DARK_BROWN)

    def sig_line(self, label):
        c = self.canvas
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, label)
        c.setFont('Helvetica', 8)
        c.setStrokeColor(FIELD_COLOR)
        c.line(X0 + 120, self.y + 2, X0 + 280, self.y + 2)
        self.y -= 22

    def sig_block(self, label):
        c = self.canvas
        c.setFont('Helvetica-Bold', 8)
        c.setFillColor(DARK_BROWN)
        c.drawString(X0, self.y, label)
        self.y -= 16
        c.setFont('Helvetica', 7.5)
        c.setFillColor(SILVER)
        c.drawString(X0, self.y, 'Signature + mention \xab Bon pour accord \xbb')
        c.setStrokeColor(FIELD_COLOR)
        c.line(X0 + 160, self.y + 2, X0 + 380, self.y + 2)
        self.y -= 10

    def email_block(self, num, subject, body, max_width=480):
        c = self.canvas
        self.y -= 4

        c.setFont('Helvetica-Bold', 8.5)
        c.setFillColor(BROWN)
        c.drawString(X0, self.y, f'Email {num}')
        self.y -= 12

        c.setFont('Helvetica', 7)
        c.setFillColor(TEXT_DIM)
        c.drawString(X0, self.y, f'Objet : {subject}')
        self.y -= 12

        c.setFont('Helvetica', 7.5)
        c.setFillColor(DARK_BROWN)
        lines = simpleSplit(body, 'Helvetica', 7.5, max_width)
        for line in lines:
            if self.y < 40:
                self.header_footer()
                self.new_page()
                self.header_footer()
            c.drawString(X0, self.y, line)
            self.y -= 11
        c.setFillColor(DARK_BROWN)
        self.y -= 4

    def save(self):
        self.canvas.showPage()
        self.canvas.save()
        print(f'OK: {self.filename}')


# ────────────────────────── CONTRAT TYPE ──────────────────────────

def gen_contrat():
    doc = RLTemplate('contrat-type-freelance.pdf',
                     'Contrat-Type Freelance',
                     'Mod\u00e8le pr\u00eat \u00e0 l\'emploi \u2014 Personnalisable',
                     'DOCUMENT JURIDIQUE')
    c = doc.canvas
    doc.y = PH - 200
    doc.header_footer()
    doc.title_block('Contrat-Type Freelance')

    doc.section(1, 'Parties')
    doc.body('Le pr\u00e9sent contrat est conclu entre les parties suivantes :')
    doc.two_col_header('Prestataire', 'Client')

    left = ['Nom / Pr\u00e9nom', 'Adresse', 'Email / T\u00e9l.', 'SIRET / RC']
    right = ['Nom / Soci\u00e9t\u00e9', 'Adresse', 'Email / T\u00e9l.', 'R\u00e9f. interne']
    for i in range(4):
        doc.two_col_fields(left[i], right[i])

    doc.section(2, 'Objet du Contrat')
    doc.body('Le Prestataire s\'engage \u00e0 r\u00e9aliser les prestations suivantes :')
    doc.table(
        ['N\u00b0', 'Description de la prestation'],
        [['1', ''], ['2', ''], ['3', ''], ['4', '']],
        [12, 488]
    )

    doc.body('Livrables attendus :')
    for _ in range(3):
        doc.field('')

    doc.section(3, 'Dur\u00e9e')
    doc.field('Date de d\u00e9but')
    doc.field('Date de fin estim\u00e9e')
    doc.field('Dur\u00e9e estim\u00e9e', '______ semaines / mois')
    doc.body('Le contrat peut \u00eatre reconduit par accord \u00e9crit des deux parties.')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(4, 'Montant et Conditions de Paiement')
    doc.body('Les prestations sont factur\u00e9es comme suit :')

    doc.table(
        ['D\u00e9signation', 'Qt\u00e9', 'Prix unitaire HT', 'Total HT'],
        [['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
        [180, 40, 140, 140]
    )

    doc.field('Sous-total HT')
    doc.field('TVA (%)')
    doc.field('Total TTC')
    doc.field('Acompte \u00e0 la signature')

    doc.body('Modalit\u00e9s de paiement :')
    doc.bullet('Acompte de _____ % \u00e0 la signature du contrat')
    doc.bullet('Solde \u00e0 la livraison / en plusieurs versements : _____')
    doc.bullet('Paiement sous 30 jours fin de mois sauf mention contraire')
    doc.bullet('P\u00e9nalit\u00e9s de retard : 3\u00d7 le taux d\'int\u00e9r\u00eat l\u00e9gal')
    doc.bullet('Indemnit\u00e9 forfaitaire pour frais de recouvrement : 40 EUR')

    doc.section(5, 'Obligations du Prestataire')
    doc.bullet('R\u00e9aliser les prestations avec diligence et professionnalisme')
    doc.bullet('Respecter les d\u00e9lais convenus')
    doc.bullet('Garantir la confidentialit\u00e9 des informations du Client')
    doc.bullet('Fournir un travail conforme au cahier des charges')

    doc.section(6, 'Obligations du Client')
    doc.bullet('Fournir toutes les informations n\u00e9cessaires \u00e0 la r\u00e9alisation de la prestation')
    doc.bullet('R\u00e9gler les factures dans les d\u00e9lais convenus')
    doc.bullet('Donner son approbation dans un d\u00e9lai raisonnable (max 5 jours ouvr\u00e9s)')
    doc.bullet('Ne pas exploiter les livrables au-del\u00e0 des droits accord\u00e9s avant paiement int\u00e9gral')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(7, 'Confidentialit\u00e9')
    doc.body_multi('Les parties s\'engagent \u00e0 garder strictement confidentielles toutes les informations \u00e9chang\u00e9es dans le cadre de ce contrat, y compris mais sans s\'y limiter : donn\u00e9es commerciales, techniques, financi\u00e8res, et strat\u00e9giques.')
    doc.body_multi('Cette obligation de confidentialit\u00e9 reste en vigueur pendant toute la dur\u00e9e du contrat et pendant 2 ans apr\u00e8s son expiration.')

    doc.section(8, 'Propri\u00e9t\u00e9 Intellectuelle')
    doc.body_multi('Les livrables cr\u00e9\u00e9s par le Prestataire deviennent la propri\u00e9t\u00e9 du Client apr\u00e8s paiement int\u00e9gral des sommes dues.')
    doc.body_multi('Le Prestataire conserve le droit de mentionner la collaboration dans son portfolio et de reproduire des extraits anonymis\u00e9s.')

    doc.section(9, 'R\u00e9siliation')
    doc.body('\u00c0 l\'amiable : Par accord \u00e9crit des deux parties \u00e0 tout moment.')
    doc.body('Pour faute : Apr\u00e8s mise en demeure rest\u00e9e sans effet pendant 15 jours.')
    doc.body('Sans motif : Le Client r\u00e8gle les prestations r\u00e9alis\u00e9es au prorata du temps pass\u00e9.')

    doc.section(10, 'Droit Applicable et Litiges')
    doc.body_multi('Le pr\u00e9sent contrat est r\u00e9gi par le droit marocain. Tout litige sera soumis \u00e0 la juridiction comp\u00e9tente de la ville du Prestataire.')

    doc.section(11, 'Signatures')
    doc.body('Fait en deux exemplaires originaux, \u00e0 _________________, le _________________')
    doc.y -= 12
    doc.sig_block('Le Prestataire')
    doc.sig_block('Le Client')

    doc.save()


# ────────────────────────── DEVIS ──────────────────────────

def gen_devis():
    doc = RLTemplate('devis-vierge-freelance.pdf',
                     'Devis Professionnel',
                     'Mod\u00e8le vierge \u2014 Personnalisable',
                     'DOCUMENT COMMERCIAL')
    doc.y = PH - 200
    doc.header_footer()
    doc.title_block('Devis Professionnel')

    # N° Devis and Date on same line
    c = doc.canvas
    c.setFont('Helvetica-Bold', 7.5)
    c.setFillColor(DARK_BROWN)
    c.drawString(X0, doc.y, 'N\u00b0 Devis')
    c.setFont('Helvetica', 9)
    c.setFillColor(FIELD_COLOR)
    lw1 = c.stringWidth('N\u00b0 Devis', 'Helvetica-Bold', 7.5) + 5
    c.drawString(X0 + lw1, doc.y, '_________________')

    c.setFont('Helvetica-Bold', 7.5)
    c.setFillColor(DARK_BROWN)
    c.drawString(X0 + 120, doc.y, 'Date')
    c.setFont('Helvetica', 9)
    c.setFillColor(FIELD_COLOR)
    c.drawString(X0 + 120 + c.stringWidth('Date', 'Helvetica-Bold', 7.5) + 5, doc.y, '_________________')
    doc.y -= 15
    c.setFillColor(DARK_BROWN)

    doc.section(1, 'Informations')
    doc.two_col_header('Prestataire', 'Client')

    left = ['Nom / Soci\u00e9t\u00e9', 'Adresse', 'Email / T\u00e9l.', 'SIRET / RC / ICE']
    right = ['Nom / Soci\u00e9t\u00e9', 'Adresse', 'Email / T\u00e9l.', '\u00c0 l\'attention de']
    for i in range(4):
        doc.two_col_fields(left[i], right[i])

    doc.section(2, 'Prestations')
    doc.table(
        ['Description', 'Qt\u00e9', 'PU HT', 'Total HT'],
        [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
        [180, 40, 140, 140]
    )

    doc.field('Total HT')
    doc.field('TVA (20% / 14% / 10% / 7% / Exon\u00e9r\u00e9)')
    doc.field('Total TTC')
    doc.field('Acompte demand\u00e9')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(3, 'Conditions')
    doc.bullet('D\u00e9lai de r\u00e9alisation : ___________ jours / semaines')
    doc.bullet('Validit\u00e9 du devis : 30 jours')
    doc.bullet('Paiement : 50% \u00e0 la commande, 50% \u00e0 la livraison')
    doc.bullet('Modes de paiement : Virement bancaire / Carte / Ch\u00e8que')
    doc.bullet('Livraison : Voie \u00e9lectronique (PDF / lien) / support physique')

    doc.section(4, 'Acceptation')
    doc.body_multi('Le Client reconna\u00eet avoir pris connaissance et accepter les conditions g\u00e9n\u00e9rales ci-dessus. Le pr\u00e9sent devis vaut bon de commande une fois sign\u00e9.')

    doc.section(5, 'Cachet et signature du Client')
    doc.y -= 12
    doc.sig_block('Date et mention \xab Bon pour accord \xbb')
    doc.y -= 8
    c.setFont('Helvetica', 7)
    c.setFillColor(TEXT_DIM)
    c.drawString(X0, doc.y, 'Cachet de l\'entreprise (obligatoire pour les professionnels)')

    doc.save()


# ────────────────────────── GRILLE TARIFAIRE ──────────────────────────

def gen_grille():
    doc = RLTemplate('grille-tarifaire-freelance.pdf',
                     'Grille Tarifaire Freelance',
                     'Tarifs recommand\u00e9s par niveau d\'exp\u00e9rience',
                     'DOCUMENT COMMERCIAL')
    doc.y = PH - 200
    doc.header_footer()
    doc.title_block('Grille Tarifaire Freelance')

    doc.section(1, 'D\u00e9butant (< 6 mois)')
    doc.body('Prix recommand\u00e9s pour les freelances en d\u00e9marrage :')
    doc.table(
        ['Service', 'Mini', 'Maxi', 'Note'],
        [
            ['Landing page one-pager', '300', '500', 'Forfait fixe'],
            ['Site vitrine 3-5 pages', '600', '1 200', 'Forfait fixe'],
            ['Int\u00e9gration HTML/CSS maquette', '200', '400', 'Forfait fixe'],
            ['Correction / am\u00e9lioration site', '150', '300', 'Forfait fixe'],
            ['Audit technique rapide', '100', '200', 'Forfait fixe'],
        ],
        [180, 60, 60, 200]
    )
    doc.body('Mes tarifs personnalis\u00e9s :')
    for i in range(3):
        doc.field(f'Service {i+1}')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(2, 'Interm\u00e9diaire (6-18 mois)')
    doc.body('Prix recommand\u00e9s pour les freelances confirm\u00e9s :')
    doc.table(
        ['Service', 'TJM', 'Dur\u00e9e', 'Note'],
        [
            ['D\u00e9veloppement React / Next.js', '350 - 450', 'R\u00e9gie', ''],
            ['API backend (Node.js)', '300 - 400', 'Semaine', ''],
            ['Refonte compl\u00e8te site', '2 500 - 5 000', 'Projet', ''],
            ['Maintenance mensuelle', '200 - 400/mois', 'Abonnement', ''],
            ['Consulting technique', '400 - 500/jour', 'Journ\u00e9e', ''],
        ],
        [180, 80, 120, 120]
    )
    doc.body('Mes tarifs :')
    for i in range(3):
        doc.field(f'Service {i+1}')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(3, 'Confirm\u00e9 (18+ mois)')
    doc.body('Prix recommand\u00e9s pour les freelances experts :')
    doc.table(
        ['Service', 'TJM', 'Forfait'],
        [
            ['Architecture technique', '500 - 700', '3 000 - 8 000'],
            ['Lead tech / CTO temps partag\u00e9', '600 - 900', '3 000 - 6 000/mois'],
            ['Formation \u00e9quipe', '600 - 900', 'Sur devis'],
            ['Application compl\u00e8te (SaaS)', '450 - 600', '10 000 - 30 000'],
            ['Consulting strat\u00e9gique', '700 - 1 000', 'Sur devis'],
        ],
        [180, 120, 200]
    )
    doc.body('Mes tarifs :')
    for i in range(3):
        doc.field(f'Service {i+1}')

    doc.section(4, 'Template de Devis')
    doc.body('Mod\u00e8le de devis vierge \u00e0 copier-coller :')
    doc.y -= 4
    c = doc.canvas
    c.setFont('Helvetica', 8)
    c.setFillColor(DARK_BROWN)
    lines = [
        'OBJET : Devis \u2014 [Nom du projet]',
        'CLIENT : [Nom du client]',
        'DATE : [Date]',
        '',
        'DESCRIPTION :',
        '  \u2014 [T\u00e2che 1]',
        '  \u2014 [T\u00e2che 2]',
        '  \u2014 [T\u00e2che 3]',
        '',
        'MONTANT : [    ] EUR TTC',
        'D\u00c9LAI : [X] semaines',
        'PAIEMENT : 50% signature, 50% livraison',
        '',
        'Validit\u00e9 : 15 jours',
    ]
    for line in lines:
        if doc.y < 40:
            doc.new_page()
            doc.y = PH - 40
            doc.header_footer()
            c = doc.canvas
            c.setFont('Helvetica', 8)
            c.setFillColor(DARK_BROWN)
        c.drawString(X0, doc.y, line)
        doc.y -= 13

    doc.save()


# ────────────────────────── PACK EMAILS ──────────────────────────

def gen_emails():
    doc = RLTemplate('pack-emails-prospection.pdf',
                     'Pack Emails de Prospection',
                     '5 Templates pr\u00e9-remplis \u2014 Pr\u00eats \u00e0 copier-coller',
                     'DOCUMENT PROSPECTION')
    doc.y = PH - 200
    doc.header_footer()
    doc.title_block('Pack Emails de Prospection')

    doc.section(1, 'Email Froid \u2014 Particulier')
    doc.email_block(1,
        'Id\u00e9e pour [site] de [Nom]',
        'Bonjour [Pr\u00e9nom],\n\n'
        'Je suis d\u00e9veloppeur freelance sp\u00e9cialis\u00e9 en [React/Next.js/PHP].\n\n'
        'Je suis tomb\u00e9 sur [Site] et j\'ai remarqu\u00e9 que '
        '[point sp\u00e9cifique : design dat\u00e9 / temps de chargement / fonctionnalit\u00e9 manquante].\n\n'
        'Je pourrais vous proposer une solution en [X] jours pour [r\u00e9sultat concret]. '
        'Sans engagement.\n\n'
        'Vous avez 10 minutes cette semaine pour qu\'on en parle ?\n\n'
        'Cordialement,\n[Mon nom] \u2014 [Mon site / Calendly]')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(2, 'Email Froid \u2014 Agence')
    doc.email_block(2,
        'Prestation dev \u2014 [Agence]',
        'Bonjour [Pr\u00e9nom],\n\n'
        'Je suis d\u00e9veloppeur freelance sp\u00e9cialis\u00e9 en [frontend/backend].\n\n'
        'Si vous avez des projets ou des pics de charge, je peux vous d\u00e9panner '
        'en r\u00e9gie (TJM \u00e0 partir de [X]\u20ac).\n\n'
        'Je m\'adapte \u00e0 votre stack et vos process.\n\n'
        'Quelques r\u00e9alisations : [lien 1] \u00b7 [lien 2]\n\n'
        'Vous voulez qu\'on \u00e9change sur vos besoins \u00e0 venir ?\n\n'
        'Bonne journ\u00e9e,\n[Mon nom] \u2014 [Mon site]')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(3, 'Relance J+7')
    doc.email_block(3,
        'Relance \u2014 [Nom du projet]',
        'Salut [Pr\u00e9nom],\n\n'
        'Je me permets de revenir vers toi suite \u00e0 mon pr\u00e9c\u00e9dent message.\n\n'
        'Si le timing n\'est pas bon, pas de souci \u2014 je reste dispo quand tu veux.\n\n'
        'Si tu pr\u00e9f\u00e8res, je peux aussi faire une proposition plus l\u00e9g\u00e8re pour commencer.\n\n'
        'Bonne semaine,\n[Mon nom]')

    doc.section(4, 'Recommandation')
    doc.email_block(4,
        'Suivi projet [Nom]',
        'Salut [Pr\u00e9nom],\n\n'
        '\u00c7a fait [X mois] qu\'on a boss\u00e9 ensemble sur [projet].\n\n'
        'Est-ce que tout fonctionne bien de ton c\u00f4t\u00e9 ?\n\n'
        'Si tu as des coll\u00e8gues ou connaissances qui cherchent un d\u00e9veloppeur, '
        'je suis preneur de recommandations. Et si toi-m\u00eame tu as un nouveau projet, '
        'je reste disponible.\n\n'
        'Merci d\'avance,\n[Mon nom]')

    doc.new_page()
    doc.y = PH - 40
    doc.header_footer()
    doc.section(5, 'Proposition Apr\u00e8s Audit')
    doc.email_block(5,
        'Compte-rendu audit + proposition',
        'Bonjour [Pr\u00e9nom],\n\n'
        'Suite \u00e0 notre \u00e9change, voici ce que j\'ai rep\u00e9r\u00e9 :\n\n'
        'Points forts : [point 1], [point 2]\n'
        'Points d\'am\u00e9lioration :\n'
        '  \u2014 [Point 1] \u2014 impact : fort / moyen / faible\n'
        '  \u2014 [Point 2] \u2014 impact : fort / moyen / faible\n'
        '  \u2014 [Point 3] \u2014 impact : fort / moyen / faible\n\n'
        'Je peux corriger tout \u00e7a en [X] jours pour [X]\u20ac.\n\n'
        'Tu veux qu\'on en discute ?\n\n'
        '[Mon nom]')

    doc.section(6, 'Conseils d\'envoi')
    doc.bullet('Personnalise chaque email en fonction du destinataire')
    doc.bullet('Relance J+7 si pas de r\u00e9ponse (template 3)')
    doc.bullet('Maximum 2 relances, puis passe \u00e0 autre chose')
    doc.bullet('Utilise un CRM (Less Annoying CRM, Notion) pour suivre tes relances')
    doc.bullet('Envoie entre 9h et 10h pour un meilleur taux d\'ouverture')
    doc.bullet('Objectif : 5 emails froids par jour = 100/mois = 5-10 clients potentiels')

    doc.save()


gen_contrat()
gen_devis()
gen_grille()
gen_emails()
print(f'\nTous les PDFs g\u00e9n\u00e9r\u00e9s dans {OUT_DIR}/')
