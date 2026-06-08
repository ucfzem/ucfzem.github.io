#!/tmp/pdf-venv/bin/python3
from fpdf import FPDF
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), 'templates')
os.makedirs(OUT_DIR, exist_ok=True)

FONT_DIR = '/usr/share/fonts/truetype/liberation'

class PDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))
        self._in_header = False

    def header(self):
        if self._in_header or self.page_no() <= 1:
            return
        self._in_header = True
        self.set_font('Sans', 'I', 6.5)
        self.set_text_color(160, 150, 140)
        self.cell(95, 5, 'UCF ZEM', align='L')
        self.set_font('Sans', 'I', 7)
        self.set_text_color(180, 170, 155)
        self.cell(0, 5, 'DOCUMENT', align='R', new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', 'I', 6.5)
        self.set_text_color(160, 150, 140)
        self.cell(0, 4, 'ucfzem.gumroad.com', new_x='LMARGIN', new_y='NEXT')
        self.set_draw_color(200, 190, 175)
        self.set_line_width(0.2)
        self.line(10, 14, 200, 14)
        self.ln(5)
        self._in_header = False

    def footer(self):
        if self.page_no() <= 1:
            return
        self.set_y(-14)
        self.set_font('Sans', 'I', 6.5)
        self.set_text_color(160, 150, 140)
        self.cell(0, 8, f'Page {self.page_no()}  |  UCF ZEM \u2014 Templates Freelance Professionnels  |  ucfzem.gumroad.com', align='C')

    def cover(self, title, subtitle, label):
        self.set_fill_color(240, 235, 225)
        self.rect(0, 0, 210, 297, 'F')
        self.ln(60)
        self.set_font('Sans', 'I', 7)
        self.set_text_color(160, 150, 140)
        self.cell(0, 5, 'UCF ZEM', align='C', new_x='LMARGIN', new_y='NEXT')
        self.cell(0, 4, 'ucfzem.gumroad.com', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(8)
        w = self.get_string_width(label) + 12
        self.set_x((210 - w) / 2)
        self.set_fill_color(190, 175, 150)
        self.set_text_color(255, 255, 255)
        self.set_font('Sans', 'B', 8)
        self.cell(w, 7, label, fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(14)
        self.set_font('Sans', 'B', 22)
        self.set_text_color(60, 50, 40)
        self.cell(0, 10, title, align='C', new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', '', 11)
        self.set_text_color(140, 130, 120)
        self.cell(0, 7, subtitle, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(18)
        self.set_draw_color(190, 175, 150)
        self.set_line_width(0.3)
        self.line(70, self.get_y(), 140, self.get_y())
        self.ln(8)
        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(160, 150, 140)
        self.cell(0, 5, 'ucfzem.gumroad.com', align='C', new_x='LMARGIN', new_y='NEXT')

    def page_title(self, text, version='Version 2025'):
        self.ln(2)
        self.set_font('Sans', 'B', 18)
        self.set_text_color(60, 50, 40)
        self.cell(0, 8, text, new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', 'I', 8)
        self.set_text_color(140, 130, 120)
        self.cell(0, 5, 'Mod\u00e8le pr\u00eat \u00e0 l\'emploi \u2014 Personnalisable', new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', 'I', 7)
        self.cell(0, 5, version, new_x='LMARGIN', new_y='NEXT')
        self.ln(4)

    def section(self, num, title):
        self.ln(2)
        self.set_draw_color(200, 190, 175)
        self.set_line_width(0.2)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2)
        self.set_font('Sans', 'B', 11)
        self.set_text_color(180, 165, 135)
        self.cell(0, 6, f'{num}. {title}', new_x='LMARGIN', new_y='NEXT')
        self.ln(2)

    def body(self, txt):
        self.set_font('Sans', '', 8.5)
        self.set_text_color(60, 50, 40)
        self.multi_cell(0, 5, txt)
        self.ln(1)

    def body_multi(self, txt):
        self.set_font('Sans', '', 8.5)
        self.set_text_color(60, 50, 40)
        self.multi_cell(0, 5, txt)
        self.ln(1)

    def field(self, label, underline=True):
        self.set_font('Sans', 'B', 8)
        self.set_text_color(60, 50, 40)
        self.cell(self.get_string_width(label) + 2, 5, label + ': ')
        if underline:
            self.set_draw_color(200, 195, 185)
            self.set_font('Sans', '', 8)
            self.set_text_color(180, 170, 155)
            self.cell(0, 5, '___________________________', new_x='LMARGIN', new_y='NEXT')
        else:
            self.cell(0, 5, '', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def two_col(self, left, right):
        x0 = self.get_x()
        self.set_font('Sans', 'B', 8)
        self.set_text_color(60, 50, 40)
        self.cell(48, 5, left + ': ')
        self.set_draw_color(200, 195, 185)
        self.set_font('Sans', '', 8)
        self.set_text_color(180, 170, 155)
        self.cell(45, 5, '___________________')
        self.set_font('Sans', 'B', 8)
        self.set_text_color(60, 50, 40)
        self.cell(50, 5, right + ': ')
        self.set_draw_color(200, 195, 185)
        self.set_font('Sans', '', 8)
        self.set_text_color(180, 170, 155)
        self.cell(0, 5, '___________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def col_header(self, left, right):
        self.set_font('Sans', 'B', 9)
        self.set_text_color(60, 50, 40)
        self.cell(95, 5, left)
        self.cell(0, 5, right, new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            col_widths = [190 / len(headers)] * len(headers)
        self.set_font('Sans', 'B', 7.5)
        self.set_fill_color(230, 220, 205)
        self.set_text_color(60, 50, 40)
        self.set_draw_color(200, 190, 175)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align='C' if i > 0 else 'L')
        self.ln()
        self.set_font('Sans', '', 7.5)
        self.set_text_color(60, 50, 40)
        for ri, row in enumerate(rows):
            if ri % 2 == 0:
                self.set_fill_color(248, 244, 238)
            else:
                self.set_fill_color(255, 255, 255)
            for i, cell in enumerate(row):
                align = 'L' if i == 0 else 'C'
                self.cell(col_widths[i], 6, str(cell), border=1, align=align, fill=True)
            self.ln()
        self.ln(3)

    def bullet(self, txt):
        self.set_font('Sans', '', 8)
        self.set_text_color(60, 50, 40)
        self.cell(5, 5, '')
        self.cell(3, 5, '\u2014')
        self.multi_cell(0, 5, txt)
        self.ln(0.5)

    def sig_block(self, label):
        self.ln(4)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(60, 50, 40)
        self.cell(0, 5, label, new_x='LMARGIN', new_y='NEXT')
        self.ln(8)
        self.set_font('Sans', 'I', 7)
        self.set_text_color(140, 130, 120)
        self.cell(80, 5, 'Signature + mention \xab Bon pour accord \xbb')
        self.set_draw_color(200, 195, 185)
        self.cell(0, 5, '_________________________', new_x='LMARGIN', new_y='NEXT')

    def email_block(self, num, subject, body):
        self.ln(2)
        self.set_font('Sans', 'B', 8.5)
        self.set_text_color(120, 100, 70)
        self.cell(0, 5, f'Email {num}', new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', 'I', 7)
        self.set_text_color(140, 130, 120)
        self.cell(0, 4, f'Objet : {subject}', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)
        self.set_font('Sans', '', 7.5)
        self.set_text_color(60, 50, 40)
        self.multi_cell(0, 4.5, body)
        self.ln(3)


def gen_contrat():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.cover('Contrat-Type Freelance', 'Mod\u00e8le pr\u00eat \u00e0 l\'emploi \u2014 Personnalisable', 'DOCUMENT JURIDIQUE')
    pdf.add_page()
    pdf.page_title('Contrat-Type Freelance')

    pdf.section(1, 'Parties')
    pdf.body('Le pr\u00e9sent contrat est conclu entre les parties suivantes :')
    pdf.col_header('Prestataire', 'Client')
    for l, r in [('Nom / Pr\u00e9nom', 'Nom / Soci\u00e9t\u00e9'),
                  ('Adresse', 'Adresse'),
                  ('Email / T\u00e9l.', 'Email / T\u00e9l.'),
                  ('SIRET / RC', 'R\u00e9f. interne')]:
        pdf.two_col(l, r)

    pdf.section(2, 'Objet du Contrat')
    pdf.body('Le Prestataire s\'engage \u00e0 r\u00e9aliser les prestations suivantes :')
    pdf.table(['N\u00b0', 'Description de la prestation'],
              [['1', ''], ['2', ''], ['3', ''], ['4', '']], [10, 180])
    pdf.body('Livrables attendus :')
    for _ in range(3):
        pdf.field('')

    pdf.section(3, 'Dur\u00e9e')
    pdf.field('Date de d\u00e9but')
    pdf.field('Date de fin estim\u00e9e')
    pdf.field('Dur\u00e9e estim\u00e9e')
    pdf.body('______ semaines / mois')
    pdf.body('Le contrat peut \u00eatre reconduit par accord \u00e9crit des deux parties.')

    pdf.add_page()
    pdf.section(4, 'Montant et Conditions de Paiement')
    pdf.body('Les prestations sont factur\u00e9es comme suit :')
    pdf.table(['D\u00e9signation', 'Qt\u00e9', 'Prix unitaire HT', 'Total HT'],
              [['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
              [70, 20, 50, 50])
    pdf.field('Sous-total HT')
    pdf.field('TVA (%)')
    pdf.field('Total TTC')
    pdf.field('Acompte \u00e0 la signature')

    pdf.body('Modalit\u00e9s de paiement :')
    pdf.bullet('Acompte de _____ % \u00e0 la signature du contrat')
    pdf.bullet('Solde \u00e0 la livraison / en plusieurs versements : _____')
    pdf.bullet('Paiement sous 30 jours fin de mois sauf mention contraire')
    pdf.bullet('P\u00e9nalit\u00e9s de retard : 3\u00d7 le taux d\'int\u00e9r\u00eat l\u00e9gal')
    pdf.bullet('Indemnit\u00e9 forfaitaire pour frais de recouvrement : 40 EUR')

    pdf.section(5, 'Obligations du Prestataire')
    pdf.bullet('R\u00e9aliser les prestations avec diligence et professionnalisme')
    pdf.bullet('Respecter les d\u00e9lais convenus')
    pdf.bullet('Garantir la confidentialit\u00e9 des informations du Client')
    pdf.bullet('Fournir un travail conforme au cahier des charges')

    pdf.section(6, 'Obligations du Client')
    pdf.bullet('Fournir toutes les informations n\u00e9cessaires \u00e0 la r\u00e9alisation de la prestation')
    pdf.bullet('R\u00e9gler les factures dans les d\u00e9lais convenus')
    pdf.bullet('Donner son approbation dans un d\u00e9lai raisonnable (max 5 jours ouvr\u00e9s)')
    pdf.bullet('Ne pas exploiter les livrables au-del\u00e0 des droits accord\u00e9s avant paiement int\u00e9gral')

    pdf.add_page()
    pdf.section(7, 'Confidentialit\u00e9')
    pdf.body_multi('Les parties s\'engagent \u00e0 garder strictement confidentielles toutes les informations \u00e9chang\u00e9es dans le cadre de ce contrat, y compris mais sans s\'y limiter : donn\u00e9es commerciales, techniques, financi\u00e8res, et strat\u00e9giques.')
    pdf.body_multi('Cette obligation de confidentialit\u00e9 reste en vigueur pendant toute la dur\u00e9e du contrat et pendant 2 ans apr\u00e8s son expiration.')

    pdf.section(8, 'Propri\u00e9t\u00e9 Intellectuelle')
    pdf.body_multi('Les livrables cr\u00e9\u00e9s par le Prestataire deviennent la propri\u00e9t\u00e9 du Client apr\u00e8s paiement int\u00e9gral des sommes dues.')
    pdf.body_multi('Le Prestataire conserve le droit de mentionner la collaboration dans son portfolio et de reproduire des extraits anonymis\u00e9s.')

    pdf.section(9, 'R\u00e9siliation')
    pdf.body('\u00c0 l\'amiable : Par accord \u00e9crit des deux parties \u00e0 tout moment.')
    pdf.body('Pour faute : Apr\u00e8s mise en demeure rest\u00e9e sans effet pendant 15 jours.')
    pdf.body('Sans motif : Le Client r\u00e8gle les prestations r\u00e9alis\u00e9es au prorata du temps pass\u00e9.')

    pdf.section(10, 'Droit Applicable et Litiges')
    pdf.body_multi('Le pr\u00e9sent contrat est r\u00e9gi par le droit marocain. Tout litige sera soumis \u00e0 la juridiction comp\u00e9tente de la ville du Prestataire.')

    pdf.section(11, 'Signatures')
    pdf.body('Fait en deux exemplaires originaux, \u00e0 _________________, le _________________')
    pdf.ln(4)
    pdf.sig_block('Le Prestataire')
    pdf.sig_block('Le Client')

    pdf.output(os.path.join(OUT_DIR, 'contrat-type-freelance.pdf'))
    print('OK: contrat-type-freelance.pdf')


def gen_devis():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.cover('Devis Professionnel', 'Mod\u00e8le vierge \u2014 Personnalisable', 'DOCUMENT COMMERCIAL')
    pdf.add_page()
    pdf.page_title('Devis Professionnel')

    pdf.field('N\u00b0 Devis')
    pdf.field('Date')
    pdf.ln(2)

    pdf.section(1, 'Informations')
    pdf.col_header('Prestataire', 'Client')
    for l, r in [('Nom / Soci\u00e9t\u00e9', 'Nom / Soci\u00e9t\u00e9'),
                  ('Adresse', 'Adresse'),
                  ('Email / T\u00e9l.', 'Email / T\u00e9l.'),
                  ('SIRET / RC / ICE', '\u00c0 l\'attention de')]:
        pdf.two_col(l, r)

    pdf.section(2, 'Prestations')
    pdf.table(['Description', 'Qt\u00e9', 'PU HT', 'Total HT'],
              [['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
              [75, 20, 45, 50])
    pdf.field('Total HT')
    pdf.field('TVA (20% / 14% / 10% / 7% / Exon\u00e9r\u00e9)')
    pdf.field('Total TTC')
    pdf.field('Acompte demand\u00e9')

    pdf.add_page()
    pdf.section(3, 'Conditions')
    pdf.bullet('D\u00e9lai de r\u00e9alisation : ___________ jours / semaines')
    pdf.bullet('Validit\u00e9 du devis : 30 jours')
    pdf.bullet('Paiement : 50% \u00e0 la commande, 50% \u00e0 la livraison')
    pdf.bullet('Modes de paiement : Virement bancaire / Carte / Ch\u00e8que')
    pdf.bullet('Livraison : Voie \u00e9lectronique (PDF / lien) / support physique')

    pdf.section(4, 'Acceptation')
    pdf.body_multi('Le Client reconna\u00eet avoir pris connaissance et accepter les conditions g\u00e9n\u00e9rales ci-dessus. Le pr\u00e9sent devis vaut bon de commande une fois sign\u00e9.')

    pdf.section(5, 'Cachet et signature du Client')
    pdf.ln(4)
    pdf.sig_block('Date et mention \xab Bon pour accord \xbb')
    pdf.ln(4)
    pdf.set_font('Sans', 'I', 7)
    pdf.set_text_color(140, 130, 120)
    pdf.cell(0, 5, 'Cachet de l\'entreprise (obligatoire pour les professionnels)', new_x='LMARGIN', new_y='NEXT')

    pdf.output(os.path.join(OUT_DIR, 'devis-vierge-freelance.pdf'))
    print('OK: devis-vierge-freelance.pdf')


def gen_grille():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.cover('Grille Tarifaire Freelance', 'Tarifs recommand\u00e9s par niveau d\'exp\u00e9rience', 'DOCUMENT COMMERCIAL')
    pdf.add_page()
    pdf.page_title('Grille Tarifaire Freelance')

    pdf.section(1, 'D\u00e9butant (< 6 mois)')
    pdf.body('Prix recommand\u00e9s pour les freelances en d\u00e9marrage :')
    pdf.table(['Service', 'Mini', 'Maxi', 'Note'],
              [['Landing page one-pager', '300', '500', 'Forfait fixe'],
               ['Site vitrine 3-5 pages', '600', '1 200', 'Forfait fixe'],
               ['Int\u00e9gration HTML/CSS maquette', '200', '400', 'Forfait fixe'],
               ['Correction / am\u00e9lioration site', '150', '300', 'Forfait fixe'],
               ['Audit technique rapide', '100', '200', 'Forfait fixe']],
              [70, 25, 25, 70])
    pdf.body('Mes tarifs personnalis\u00e9s :')
    for i in range(3):
        pdf.field(f'Service {i+1}')

    pdf.add_page()
    pdf.section(2, 'Interm\u00e9diaire (6-18 mois)')
    pdf.body('Prix recommand\u00e9s pour les freelances confirm\u00e9s :')
    pdf.table(['Service', 'TJM', 'Dur\u00e9e', 'Note'],
              [['D\u00e9veloppement React / Next.js', '350 - 450', 'R\u00e9gie', ''],
               ['API backend (Node.js)', '300 - 400', 'Semaine', ''],
               ['Refonte compl\u00e8te site', '2 500 - 5 000', 'Projet', ''],
               ['Maintenance mensuelle', '200 - 400/mois', 'Abonnement', ''],
               ['Consulting technique', '400 - 500/jour', 'Journ\u00e9e', '']],
              [65, 30, 30, 65])
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field(f'Service {i+1}')

    pdf.add_page()
    pdf.section(3, 'Confirm\u00e9 (18+ mois)')
    pdf.body('Prix recommand\u00e9s pour les freelances experts :')
    pdf.table(['Service', 'TJM', 'Forfait'],
              [['Architecture technique', '500 - 700', '3 000 - 8 000'],
               ['Lead tech / CTO temps partag\u00e9', '600 - 900', '3 000 - 6 000/mois'],
               ['Formation \u00e9quipe', '600 - 900', 'Sur devis'],
               ['Application compl\u00e8te (SaaS)', '450 - 600', '10 000 - 30 000'],
               ['Consulting strat\u00e9gique', '700 - 1 000', 'Sur devis']],
              [70, 40, 80])
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field(f'Service {i+1}')

    pdf.section(4, 'Template de Devis')
    pdf.body('Mod\u00e8le de devis vierge \u00e0 copier-coller :')
    pdf.ln(2)
    pdf.set_font('Sans', '', 8)
    pdf.set_text_color(60, 50, 40)
    for line in ['OBJET : Devis \u2014 [Nom du projet]',
                  'CLIENT : [Nom du client]',
                  'DATE : [Date]', '',
                  'DESCRIPTION :',
                  '  \u2014 [T\u00e2che 1]',
                  '  \u2014 [T\u00e2che 2]',
                  '  \u2014 [T\u00e2che 3]', '',
                  'MONTANT : [    ] EUR TTC',
                  'D\u00c9LAI : [X] semaines',
                  'PAIEMENT : 50% signature, 50% livraison', '',
                  'Validit\u00e9 : 15 jours']:
        pdf.cell(0, 5, line, new_x='LMARGIN', new_y='NEXT')

    pdf.output(os.path.join(OUT_DIR, 'grille-tarifaire-freelance.pdf'))
    print('OK: grille-tarifaire-freelance.pdf')


def gen_emails():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.cover('Pack Emails de Prospection', '5 Templates pr\u00e9-remplis \u2014 Pr\u00eats \u00e0 copier-coller', 'DOCUMENT PROSPECTION')
    pdf.add_page()
    pdf.page_title('Pack Emails de Prospection')

    pdf.section(1, 'Email Froid \u2014 Particulier')
    pdf.email_block(1,
        'Id\u00e9e pour [site] de [Nom]',
        'Bonjour [Pr\u00e9nom],\n\n'
        'Je suis d\u00e9veloppeur freelance sp\u00e9cialis\u00e9 en [React/Next.js/PHP].\n\n'
        'Je suis tomb\u00e9 sur [Site] et j\'ai remarqu\u00e9 que '
        '[point sp\u00e9cifique : design dat\u00e9 / temps de chargement / fonctionnalit\u00e9 manquante].\n\n'
        'Je pourrais vous proposer une solution en [X] jours pour [r\u00e9sultat concret]. '
        'Sans engagement.\n\n'
        'Vous avez 10 minutes cette semaine pour qu\'on en parle ?\n\n'
        'Cordialement,\n[Mon nom] \u2014 [Mon site / Calendly]')

    pdf.add_page()
    pdf.section(2, 'Email Froid \u2014 Agence')
    pdf.email_block(2,
        'Prestation dev \u2014 [Agence]',
        'Bonjour [Pr\u00e9nom],\n\n'
        'Je suis d\u00e9veloppeur freelance sp\u00e9cialis\u00e9 en [frontend/backend].\n\n'
        'Si vous avez des projets ou des pics de charge, je peux vous d\u00e9panner '
        'en r\u00e9gie (TJM \u00e0 partir de [X]\u20ac).\n\n'
        'Je m\'adapte \u00e0 votre stack et vos process.\n\n'
        'Quelques r\u00e9alisations : [lien 1] \u00b7 [lien 2]\n\n'
        'Vous voulez qu\'on \u00e9change sur vos besoins \u00e0 venir ?\n\n'
        'Bonne journ\u00e9e,\n[Mon nom] \u2014 [Mon site]')

    pdf.add_page()
    pdf.section(3, 'Relance J+7')
    pdf.email_block(3,
        'Relance \u2014 [Nom du projet]',
        'Salut [Pr\u00e9nom],\n\n'
        'Je me permets de revenir vers toi suite \u00e0 mon pr\u00e9c\u00e9dent message.\n\n'
        'Si le timing n\'est pas bon, pas de souci \u2014 je reste dispo quand tu veux.\n\n'
        'Si tu pr\u00e9f\u00e8res, je peux aussi faire une proposition plus l\u00e9g\u00e8re pour commencer.\n\n'
        'Bonne semaine,\n[Mon nom]')

    pdf.section(4, 'Recommandation')
    pdf.email_block(4,
        'Suivi projet [Nom]',
        'Salut [Pr\u00e9nom],\n\n'
        '\u00c7a fait [X mois] qu\'on a boss\u00e9 ensemble sur [projet].\n\n'
        'Est-ce que tout fonctionne bien de ton c\u00f4t\u00e9 ?\n\n'
        'Si tu as des coll\u00e8gues ou connaissances qui cherchent un d\u00e9veloppeur, '
        'je suis preneur de recommandations. Et si toi-m\u00eame tu as un nouveau projet, '
        'je reste disponible.\n\n'
        'Merci d\'avance,\n[Mon nom]')

    pdf.add_page()
    pdf.section(5, 'Proposition Apr\u00e8s Audit')
    pdf.email_block(5,
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

    pdf.section(6, 'Conseils d\'envoi')
    pdf.bullet('Personnalise chaque email en fonction du destinataire')
    pdf.bullet('Relance J+7 si pas de r\u00e9ponse (template 3)')
    pdf.bullet('Maximum 2 relances, puis passe \u00e0 autre chose')
    pdf.bullet('Utilise un CRM (Less Annoying CRM, Notion) pour suivre tes relances')
    pdf.bullet('Envoie entre 9h et 10h pour un meilleur taux d\'ouverture')
    pdf.bullet('Objectif : 5 emails froids par jour = 100/mois = 5-10 clients potentiels')

    pdf.output(os.path.join(OUT_DIR, 'pack-emails-prospection.pdf'))
    print('OK: pack-emails-prospection.pdf')


gen_contrat()
gen_devis()
gen_grille()
gen_emails()
print(f'\nTous les PDFs g\u00e9n\u00e9r\u00e9s dans {OUT_DIR}/')
