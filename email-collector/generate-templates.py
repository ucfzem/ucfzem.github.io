#!/tmp/pdf-venv/bin/python3
from fpdf import FPDF
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), 'templates')
os.makedirs(OUT_DIR, exist_ok=True)

FONT_DIR = '/usr/share/fonts/truetype/liberation'

# Brown/Gold palette
DARK = (13, 11, 8)
SURFACE = (26, 21, 14)
GOLD = (201, 168, 76)
GOLD_LIGHT = (240, 192, 64)
BROWN = (107, 52, 16)
DARK_BROWN = (42, 31, 20)
TEXT_DIM = (138, 122, 100)
CREAM = (253, 246, 237)
ROW_ALT = (253, 249, 240)
WHITE = (255, 255, 255)
BORDER = (180, 160, 140)
SECTION_BG = BROWN
HEADER_BG = GOLD
FIELD_LINE = (200, 190, 175)

MM = 0.352778

class TemplatePDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))

    def header(self):
        if self.page_no() > 1:
            self.set_font('Sans', 'I', 6.5)
            self.set_text_color(*TEXT_DIM)
            txt = 'UCF ZEM — Templates Freelance Professionnels — ucfzem.gumroad.com'
            self.cell(0, 7, txt, align='C', new_x='LMARGIN', new_y='NEXT')
            self.set_draw_color(*GOLD)
            self.set_line_width(0.3)
            self.line(10, 12, 200, 12)
            self.ln(5)

    def footer(self):
        self.set_y(-14)
        self.set_font('Sans', 'I', 6.5)
        self.set_text_color(*TEXT_DIM)
        self.cell(0, 8, f'Page {self.page_no()}', align='C')

    def cover(self, title, subtitle, label):
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 297, 'F')
        self.ln(55)

        self.set_font('Sans', 'I', 7)
        self.set_text_color(*TEXT_DIM)
        self.cell(0, 6, 'UCF ZEM', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(2)

        self.set_font('Sans', 'B', 8)
        w = self.get_string_width(label) + 16
        self.set_x((210 - w) / 2)
        self.set_fill_color(*BROWN)
        self.set_text_color(*GOLD_LIGHT)
        self.cell(w, 7, label, fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(14)

        self.set_font('Sans', 'B', 24)
        self.set_text_color(*GOLD_LIGHT)
        self.cell(0, 11, title, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(4)

        self.set_font('Sans', '', 11)
        self.set_text_color(196, 181, 154)
        self.cell(0, 7, subtitle, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(20)

        self.set_draw_color(*GOLD)
        self.set_line_width(0.3)
        y = self.get_y()
        self.line(70, y, 140, y)
        self.ln(8)

        self.set_font('Sans', 'I', 8)
        self.set_text_color(*TEXT_DIM)
        self.cell(0, 5, 'ucfzem.gumroad.com', align='C', new_x='LMARGIN', new_y='NEXT')

    def section_title(self, title):
        self.ln(3)
        # Gold line above
        self.set_draw_color(*GOLD)
        self.set_line_width(0.2)
        y = self.get_y()
        self.line(10, y, 200, y)
        self.ln(1.5)
        # Section title in brown
        self.set_font('Sans', 'B', 13)
        self.set_text_color(*DARK_BROWN)
        self.cell(0, 7, title, new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def body(self, txt):
        self.set_font('Sans', '', 8.5)
        self.set_text_color(*DARK_BROWN)
        self.multi_cell(0, 4.8, txt)
        self.ln(1.5)

    def field_line(self, label, x2=50):
        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*DARK_BROWN)
        self.cell(x2, 5, label)
        self.set_draw_color(*FIELD_LINE)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(160, 140, 120)
        self.cell(0, 5, '___________________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def two_col_fields(self, left_label, right_label, lw=48, rw=48):
        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*DARK_BROWN)
        self.cell(lw, 5, left_label)
        self.set_draw_color(*FIELD_LINE)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(160, 140, 120)
        self.cell(45, 5, '___________________')

        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*DARK_BROWN)
        self.cell(rw, 5, right_label)
        self.set_draw_color(*FIELD_LINE)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(160, 140, 120)
        self.cell(0, 5, '___________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def columns_side(self, items):
        """items = [(label1, width1), (label2, width2), ...] all on one line"""
        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*DARK_BROWN)
        x_start = self.get_x()
        for label, w in items:
            self.set_font('Sans', 'B', 7.5)
            self.set_text_color(*DARK_BROWN)
            self.cell(w, 5, label)
        self.set_draw_color(*FIELD_LINE)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(160, 140, 120)
        self.cell(0, 5, '', new_x='LMARGIN', new_y='NEXT')
        self.set_x(x_start)
        total_w = sum(w for _, w in items)
        remaining = 190 - total_w
        gap = remaining / (len(items) - 1) if len(items) > 1 else 0
        self.set_x(x_start)
        for i, (label, w) in enumerate(items):
            self.set_draw_color(*FIELD_LINE)
            self.set_font('Sans', '', 7.5)
            self.set_text_color(160, 140, 120)
            self.cell(w + (gap if i < len(items)-1 else 0), 5, '____________________')
        self.ln(0.5)

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            col_widths = [190 / len(headers)] * len(headers)

        # Header row
        self.set_fill_color(*HEADER_BG)
        self.set_text_color(*DARK)
        self.set_font('Sans', 'B', 7.5)
        self.set_draw_color(*GOLD)
        self.set_line_width(0.3)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, f' {h}', border=1, fill=True, align='C' if i > 0 else 'L')
        self.ln()

        # Data rows
        self.set_line_width(0.15)
        self.set_draw_color(*BORDER)
        for ri, row in enumerate(rows):
            if ri % 2 == 0:
                self.set_fill_color(*ROW_ALT)
            else:
                self.set_fill_color(*WHITE)
            self.set_font('Sans', '', 7.5)
            self.set_text_color(*DARK_BROWN)
            for i, cell in enumerate(row):
                align = 'L' if i == 0 else 'C'
                self.cell(col_widths[i], 6, f' {cell}' if i == 0 else cell, border=1, align=align, fill=True)
            self.ln()
        self.ln(3)

    def bullet(self, txt):
        self.set_font('Sans', '', 8)
        self.set_text_color(*DARK_BROWN)
        self.cell(3, 5, '')
        self.cell(3, 5, '—')
        self.multi_cell(0, 4.8, txt)
        self.ln(0.3)

    def sig_block(self, label):
        self.ln(4)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*DARK_BROWN)
        self.cell(0, 5, label, new_x='LMARGIN', new_y='NEXT')
        self.ln(6)
        self.set_draw_color(*FIELD_LINE)
        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(*TEXT_DIM)
        self.cell(90, 5, 'Signature + mention « Bon pour accord »')
        self.cell(0, 5, '_________________________', new_x='LMARGIN', new_y='NEXT')

    def email_block(self, num, subject, body):
        self.ln(1)
        self.set_font('Sans', 'B', 8.5)
        self.set_text_color(*BROWN)
        self.cell(0, 5.5, f'Email {num}', new_x='LMARGIN', new_y='NEXT')

        self.set_font('Sans', 'I', 7)
        self.set_text_color(*TEXT_DIM)
        self.cell(0, 4.5, f'Objet : {subject}', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

        self.set_font('Sans', '', 7.5)
        self.set_text_color(*DARK_BROWN)
        self.multi_cell(0, 4.5, body)
        self.ln(3)


def gen_contrat():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('Contrat-Type Freelance',
              'Modèle prêt à l\'emploi — Personnalisable',
              'DOCUMENT JURIDIQUE')

    pdf.add_page()
    pdf.ln(2)
    pdf.set_font('Sans', 'B', 18)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(0, 8, 'Contrat-Type Freelance', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 8)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Modèle prêt à l\'emploi — Personnalisable', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 7)
    pdf.cell(0, 5, 'Version 2025', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(4)

    pdf.section_title('Parties')
    pdf.body('Le présent contrat est conclu entre les parties suivantes :')
    pdf.ln(2)

    pdf.set_font('Sans', 'B', 8.5)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(95, 5, 'Prestataire')
    pdf.cell(0, 5, 'Client', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(1)

    left_fields = ['Nom / Prénom', 'Adresse', 'Email / Tél.', 'SIRET / RC']
    right_fields = ['Nom / Société', 'Adresse', 'Email / Tél.', 'Réf. interne']

    for i in range(4):
        pdf.set_font('Sans', 'B', 7.5)
        pdf.set_text_color(*DARK_BROWN)
        pdf.cell(45, 5, left_fields[i])
        pdf.set_draw_color(*FIELD_LINE)
        pdf.set_font('Sans', '', 7.5)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(48, 5, '____________________')

        pdf.set_font('Sans', 'B', 7.5)
        pdf.set_text_color(*DARK_BROWN)
        pdf.cell(45, 5, right_fields[i])
        pdf.set_draw_color(*FIELD_LINE)
        pdf.set_font('Sans', '', 7.5)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(0, 5, '____________________', new_x='LMARGIN', new_y='NEXT')
        pdf.ln(0.5)

    pdf.ln(4)
    pdf.section_title('Objet du Contrat')
    pdf.body('Le Prestataire s\'engage à réaliser les prestations suivantes :')

    pdf.table(
        ['N°', 'Description de la prestation'],
        [
            ['1', ''],
            ['2', ''],
            ['3', ''],
            ['4', ''],
        ],
        [12, 178]
    )

    pdf.body('Livrables attendus :')
    pdf.field_line('Livrable 1')
    pdf.field_line('Livrable 2')
    pdf.field_line('Livrable 3')

    pdf.ln(2)
    pdf.section_title('Durée')
    pdf.field_line('Date de début')
    pdf.field_line('Date de fin estimée')
    pdf.field_line('Durée estimée')
    pdf.body('______ semaines / mois')
    pdf.body('Le contrat peut être reconduit par accord écrit des deux parties.')

    pdf.add_page()
    pdf.section_title('Montant et Conditions de Paiement')
    pdf.body('Les prestations sont facturées comme suit :')

    pdf.table(
        ['Désignation', 'Qté', 'Prix unitaire HT', 'Total HT'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [70, 20, 50, 50]
    )

    pdf.field_line('Sous-total HT')
    pdf.field_line('TVA (%)')
    pdf.field_line('Total TTC')
    pdf.field_line('Acompte à la signature')
    pdf.ln(1)

    pdf.body('Modalités de paiement :')
    pdf.bullet('Acompte de _____ % à la signature du contrat')
    pdf.bullet('Solde à la livraison / en plusieurs versements : _____')
    pdf.bullet('Paiement sous 30 jours fin de mois sauf mention contraire')
    pdf.bullet('Pénalités de retard : 3× le taux d\'intérêt légal')
    pdf.bullet('Indemnité forfaitaire pour frais de recouvrement : 40 EUR')

    pdf.ln(2)
    pdf.section_title('Obligations du Prestataire')
    pdf.bullet('Réaliser les prestations avec diligence et professionnalisme')
    pdf.bullet('Respecter les délais convenus')
    pdf.bullet('Garantir la confidentialité des informations du Client')
    pdf.bullet('Fournir un travail conforme au cahier des charges')

    pdf.ln(2)
    pdf.section_title('Obligations du Client')
    pdf.bullet('Fournir toutes les informations nécessaires à la réalisation de la prestation')
    pdf.bullet('Régler les factures dans les délais convenus')
    pdf.bullet('Donner son approbation dans un délai raisonnable (max 5 jours ouvrés)')
    pdf.bullet('Ne pas exploiter les livrables au-delà des droits accordés avant paiement intégral')

    pdf.add_page()
    pdf.section_title('Confidentialité')
    pdf.body('Les parties s\'engagent à garder strictement confidentielles toutes les informations '
             'échangées dans le cadre de ce contrat, y compris mais sans s\'y limiter : données '
             'commerciales, techniques, financières, et stratégiques.')
    pdf.body('Cette obligation de confidentialité reste en vigueur pendant toute la durée du contrat '
             'et pendant 2 ans après son expiration.')

    pdf.ln(2)
    pdf.section_title('Propriété Intellectuelle')
    pdf.body('Les livrables créés par le Prestataire deviennent la propriété du Client '
             'après paiement intégral des sommes dues.')
    pdf.body('Le Prestataire conserve le droit de mentionner la collaboration dans son portfolio '
             'et de reproduire des extraits anonymisés.')

    pdf.ln(2)
    pdf.section_title('Résiliation')
    pdf.body('À l\'amiable : Par accord écrit des deux parties à tout moment.')
    pdf.body('Pour faute : Après mise en demeure restée sans effet pendant 15 jours.')
    pdf.body('Sans motif : Le Client règle les prestations réalisées au prorata du temps passé.')

    pdf.ln(2)
    pdf.section_title('Droit Applicable et Litiges')
    pdf.body('Le présent contrat est régi par le droit marocain. Tout litige sera soumis '
             'à la juridiction compétente de la ville du Prestataire.')

    pdf.ln(4)
    pdf.section_title('Signatures')
    pdf.body('Fait en deux exemplaires originaux, à _________________, le _________________')
    pdf.ln(6)
    pdf.sig_block('Le Prestataire')
    pdf.ln(4)
    pdf.sig_block('Le Client')

    path = os.path.join(OUT_DIR, 'contrat-type-freelance.pdf')
    pdf.output(path)
    print(f'OK: {path}')


def gen_devis():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('Devis Professionnel',
              'Modèle vierge — Personnalisable',
              'DOCUMENT COMMERCIAL')

    pdf.add_page()
    pdf.ln(2)
    pdf.set_font('Sans', 'B', 18)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(0, 8, 'Devis Professionnel', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 8)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Modèle vierge — Personnalisable', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 7)
    pdf.cell(0, 5, 'Validité : 30 jours', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    pdf.set_font('Sans', 'B', 7.5)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(35, 5, 'N° Devis')
    pdf.set_draw_color(*FIELD_LINE)
    pdf.set_font('Sans', '', 7.5)
    pdf.set_text_color(160, 140, 120)
    pdf.cell(55, 5, '_________________')

    pdf.set_font('Sans', 'B', 7.5)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(25, 5, 'Date')
    pdf.set_draw_color(*FIELD_LINE)
    pdf.set_font('Sans', '', 7.5)
    pdf.set_text_color(160, 140, 120)
    pdf.cell(0, 5, '_________________', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(3)

    pdf.section_title('Informations')

    pdf.set_font('Sans', 'B', 8.5)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(95, 5, 'Prestataire')
    pdf.cell(0, 5, 'Client', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(1)

    left_fields = ['Nom / Société', 'Adresse', 'Email / Tél.', 'SIRET / RC / ICE']
    right_fields = ['Nom / Société', 'Adresse', 'Email / Tél.', 'À l\'attention de']

    for i in range(4):
        pdf.set_font('Sans', 'B', 7.5)
        pdf.set_text_color(*DARK_BROWN)
        pdf.cell(45, 5, left_fields[i])
        pdf.set_draw_color(*FIELD_LINE)
        pdf.set_font('Sans', '', 7.5)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(48, 5, '____________________')

        pdf.set_font('Sans', 'B', 7.5)
        pdf.set_text_color(*DARK_BROWN)
        pdf.cell(45, 5, right_fields[i])
        pdf.set_draw_color(*FIELD_LINE)
        pdf.set_font('Sans', '', 7.5)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(0, 5, '____________________', new_x='LMARGIN', new_y='NEXT')
        pdf.ln(0.5)

    pdf.ln(3)
    pdf.section_title('Prestations')

    pdf.table(
        ['Description', 'Qté', 'PU HT', 'Total HT'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [75, 20, 45, 50]
    )

    pdf.field_line('Total HT')
    pdf.field_line('TVA (20% / 14% / 10% / 7% / Exonéré)')
    pdf.field_line('Total TTC')
    pdf.field_line('Acompte demandé')

    pdf.add_page()
    pdf.section_title('Conditions')
    pdf.bullet('Délai de réalisation : ___________ jours / semaines')
    pdf.bullet('Validité du devis : 30 jours')
    pdf.bullet('Paiement : 50% à la commande, 50% à la livraison')
    pdf.bullet('Modes de paiement : Virement bancaire / Carte / Chèque')
    pdf.bullet('Livraison : Voie électronique (PDF / lien) / support physique')

    pdf.ln(3)
    pdf.section_title('Acceptation')
    pdf.body('Le Client reconnaît avoir pris connaissance et accepter les conditions générales '
             'ci-dessus. Le présent devis vaut bon de commande une fois signé.')

    pdf.ln(4)
    pdf.section_title('Cachet et signature du Client')
    pdf.ln(8)
    pdf.sig_block('Date et mention « Bon pour accord »')
    pdf.ln(8)
    pdf.set_font('Sans', 'I', 7)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Cachet de l\'entreprise (obligatoire pour les professionnels)', new_x='LMARGIN', new_y='NEXT')

    path = os.path.join(OUT_DIR, 'devis-vierge-freelance.pdf')
    pdf.output(path)
    print(f'OK: {path}')


def gen_grille():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('Grille Tarifaire',
              'Tarifs recommandés par niveau d\'expérience',
              'GRILLE DE PRIX')

    pdf.add_page()
    pdf.ln(2)
    pdf.set_font('Sans', 'B', 18)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(0, 8, 'Grille Tarifaire', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 8)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Tarifs recommandés par niveau d\'expérience', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(4)

    pdf.section_title('Débutant (< 6 mois)')
    pdf.body('Prix recommandés pour les freelances en démarrage :')
    pdf.table(
        ['Service', 'Mini', 'Maxi', 'Note'],
        [
            ['Landing page one-pager', '300', '500', 'Forfait fixe'],
            ['Site vitrine 3-5 pages', '600', '1 200', 'Forfait fixe'],
            ['Intégration HTML/CSS maquette', '200', '400', 'Forfait fixe'],
            ['Correction / amélioration site', '150', '300', 'Forfait fixe'],
            ['Audit technique rapide', '100', '200', 'Forfait fixe'],
        ],
        [70, 25, 25, 70]
    )
    pdf.body('Mes tarifs personnalisés :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.add_page()
    pdf.section_title('Intermédiaire (6-18 mois)')
    pdf.body('Prix recommandés pour les freelances confirmés :')
    pdf.table(
        ['Service', 'TJM', 'Durée', 'Note'],
        [
            ['Développement React / Next.js', '350 - 450', 'Régie', ''],
            ['API backend (Node.js)', '300 - 400', 'Semaine', ''],
            ['Refonte complète site', '2 500 - 5 000', 'Projet', ''],
            ['Maintenance mensuelle', '200 - 400/mois', 'Abonnement', ''],
            ['Consulting technique', '400 - 500/jour', 'Journée', ''],
        ],
        [65, 30, 30, 65]
    )
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.add_page()
    pdf.section_title('Confirmé (18+ mois)')
    pdf.body('Prix recommandés pour les freelances experts :')
    pdf.table(
        ['Service', 'TJM', 'Forfait'],
        [
            ['Architecture technique', '500 - 700', '3 000 - 8 000'],
            ['Lead tech / CTO temps partagé', '600 - 900', '3 000 - 6 000/mois'],
            ['Formation équipe', '600 - 900', 'Sur devis'],
            ['Application complète (SaaS)', '450 - 600', '10 000 - 30 000'],
            ['Consulting stratégique', '700 - 1 000', 'Sur devis'],
        ],
        [70, 40, 80]
    )
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.ln(4)
    pdf.section_title('Grille Vierge')
    pdf.body('Reproduis ce modèle pour définir tes propres tarifs :')
    pdf.table(
        ['Service', 'Prix min', 'Prix max', 'Type'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [70, 30, 30, 60]
    )

    path = os.path.join(OUT_DIR, 'grille-tarifaire-freelance.pdf')
    pdf.output(path)
    print(f'OK: {path}')


def gen_emails():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('5 Templates d\'Emails Prospection',
              'Pré-remplis — prêts à copier-coller',
              'PROSPECTION')

    pdf.add_page()
    pdf.ln(2)
    pdf.set_font('Sans', 'B', 18)
    pdf.set_text_color(*DARK_BROWN)
    pdf.cell(0, 8, '5 Templates d\'Emails Prospection', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 8)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Pré-remplis — prêts à copier-coller', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(4)

    pdf.section_title('Email Froid — Particulier')
    pdf.email_block(1,
        'Idée pour [site] de [Nom]',
        'Bonjour [Prénom],\n\n'
        'Je suis développeur freelance spécialisé en [React/Next.js/PHP].\n\n'
        'Je suis tombé sur [Site] et j\'ai remarqué que '
        '[point spécifique : design daté / temps de chargement / fonctionnalité manquante].\n\n'
        'Je pourrais vous proposer une solution en [X] jours pour [résultat concret]. '
        'Sans engagement.\n\n'
        'Vous avez 10 minutes cette semaine pour qu\'on en parle ?\n\n'
        'Cordialement,\n[Mon nom] — [Mon site / Calendly]')

    pdf.add_page()
    pdf.section_title('Email Froid — Agence')
    pdf.email_block(2,
        'Prestation dev — [Agence]',
        'Bonjour [Prénom],\n\n'
        'Je suis développeur freelance spécialisé en [frontend/backend].\n\n'
        'Si vous avez des projets ou des pics de charge, je peux vous dépanner '
        'en régie (TJM à partir de [X]€).\n\n'
        'Je m\'adapte à votre stack et vos process.\n\n'
        'Quelques réalisations : [lien 1] · [lien 2]\n\n'
        'Vous voulez qu\'on échange sur vos besoins à venir ?\n\n'
        'Bonne journée,\n[Mon nom] — [Mon site]')

    pdf.add_page()
    pdf.section_title('Relance J+7')
    pdf.email_block(3,
        'Relance — [Nom du projet]',
        'Salut [Prénom],\n\n'
        'Je me permets de revenir vers toi suite à mon précédent message.\n\n'
        'Si le timing n\'est pas bon, pas de souci — je reste dispo quand tu veux.\n\n'
        'Si tu préfères, je peux aussi faire une proposition plus légère pour commencer.\n\n'
        'Bonne semaine,\n[Mon nom]')

    pdf.ln(2)
    pdf.section_title('Recommandation')
    pdf.email_block(4,
        'Suivi projet [Nom]',
        'Salut [Prénom],\n\n'
        'Ça fait [X mois] qu\'on a bossé ensemble sur [projet].\n\n'
        'Est-ce que tout fonctionne bien de ton côté ?\n\n'
        'Si tu as des collègues ou connaissances qui cherchent un développeur, '
        'je suis preneur de recommandations. Et si toi-même tu as un nouveau projet, '
        'je reste disponible.\n\n'
        'Merci d\'avance,\n[Mon nom]')

    pdf.add_page()
    pdf.section_title('Proposition Après Audit')
    pdf.email_block(5,
        'Compte-rendu audit + proposition',
        'Bonjour [Prénom],\n\n'
        'Suite à notre échange, voici ce que j\'ai repéré :\n\n'
        'Points forts : [point 1], [point 2]\n'
        'Points d\'amélioration :\n'
        '  — [Point 1] — impact : fort / moyen / faible\n'
        '  — [Point 2] — impact : fort / moyen / faible\n'
        '  — [Point 3] — impact : fort / moyen / faible\n\n'
        'Je peux corriger tout ça en [X] jours pour [X]€.\n\n'
        'Tu veux qu\'on en discute ?\n\n'
        '[Mon nom]')

    pdf.ln(4)
    pdf.section_title('Conseils d\'envoi')
    pdf.bullet('Personnalise chaque email en fonction du destinataire')
    pdf.bullet('Relance J+7 si pas de réponse (template 3)')
    pdf.bullet('Maximum 2 relances, puis passe à autre chose')
    pdf.bullet('Utilise un CRM (Less Annoying CRM, Notion) pour suivre tes relances')
    pdf.bullet('Envoie entre 9h et 10h pour un meilleur taux d\'ouverture')
    pdf.bullet('Objectif : 5 emails froids par jour = 100/mois = 5-10 clients potentiels')

    path = os.path.join(OUT_DIR, 'pack-emails-prospection.pdf')
    pdf.output(path)
    print(f'OK: {path}')


gen_contrat()
gen_devis()
gen_grille()
gen_emails()

print(f'\nTous les PDFs générés dans {OUT_DIR}/')
