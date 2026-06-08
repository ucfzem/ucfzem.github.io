#!/tmp/pdf-venv/bin/python3
from fpdf import FPDF
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), 'templates')
os.makedirs(OUT_DIR, exist_ok=True)

FONT_DIR = '/usr/share/fonts/truetype/liberation'

# Colors (brown/gold theme)
DARK = (13, 11, 8)
SURFACE = (26, 21, 14)
GOLD = (201, 168, 76)
GOLD_LIGHT = (240, 192, 64)
BROWN = (107, 52, 16)
TEXT = (42, 31, 20)
TEXT_DIM = (138, 122, 100)
CREAM = (253, 246, 237)
LIGHT_GOLD = (248, 242, 235)
ROW_ALT = (253, 249, 240)
WHITE = (255, 255, 255)
BORDER = (180, 160, 140)
SECTION_BG = (107, 52, 16)
HEADER_BG = (201, 168, 76)

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
            header_text = 'UCF ZEM  |  Templates Freelance Professionnels  |  ucfzem.gumroad.com'
            self.cell(0, 7, header_text, align='C', new_x='LMARGIN', new_y='NEXT')
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

    def section_box(self, num, title):
        self.ln(4)
        self.set_fill_color(*SECTION_BG)
        self.set_text_color(*GOLD_LIGHT)
        self.set_font('Sans', 'B', 11)
        y = self.get_y()
        self.cell(0, 8, '', fill=True, new_x='LMARGIN', new_y='NEXT')
        self.set_y(y)
        self.cell(6, 8, '', fill=True)
        self.set_x(16)
        self.cell(0, 8, f'{num}. {title}', fill=True, new_x='LMARGIN', new_y='NEXT')
        self.set_y(y + 10)
        self.ln(2)

    def section_box_simple(self, num, title):
        self.ln(3)
        self.set_fill_color(*SECTION_BG)
        self.set_text_color(*GOLD_LIGHT)
        self.set_font('Sans', 'B', 10)
        y = self.get_y()
        self.cell(0, 7, '', fill=True, new_x='LMARGIN', new_y='NEXT')
        self.set_y(y)
        self.cell(4, 7, '', fill=True)
        self.set_x(14)
        self.cell(0, 7, f'{num}. {title}', fill=True, new_x='LMARGIN', new_y='NEXT')
        self.set_y(y + 8.5)
        self.ln(1)

    def body(self, txt):
        self.set_font('Sans', '', 8.5)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 4.8, txt)
        self.ln(1.5)

    def field_line(self, label, x2=80):
        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*TEXT)
        self.cell(x2, 5, label + ':')
        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(160, 140, 120)
        self.set_draw_color(*BORDER)
        self.cell(0, 5, '_____________________________________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def field_short(self, label, w=45):
        self.set_font('Sans', 'B', 7.5)
        self.set_text_color(*TEXT)
        self.cell(w, 5, label + ':')
        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(160, 140, 120)
        self.set_draw_color(*BORDER)
        self.cell(0, 5, '____________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            col_widths = [190 / len(headers)] * len(headers)
        self.set_font('Sans', 'B', 7.5)
        self.set_fill_color(*HEADER_BG)
        self.set_text_color(*DARK)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align='C')
        self.ln()
        self.set_font('Sans', '', 7.5)
        self.set_text_color(*TEXT)
        for ri, row in enumerate(rows):
            if ri % 2 == 0:
                self.set_fill_color(*ROW_ALT)
            else:
                self.set_fill_color(*WHITE)
            for i, cell in enumerate(row):
                align = 'L' if i == 0 else 'C'
                self.cell(col_widths[i], 6, str(cell), border=1, align=align, fill=True)
            self.ln()
        self.ln(3)

    def bullet(self, txt):
        self.set_font('Sans', '', 8)
        self.set_text_color(*TEXT)
        x = self.get_x()
        self.cell(4, 5, '')
        self.cell(3, 5, '—')
        self.multi_cell(0, 4.8, txt)
        self.ln(0.3)

    def sig_line(self, label):
        self.ln(3)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*TEXT)
        self.cell(95, 5, label)
        self.set_font('Sans', '', 8)
        self.set_text_color(160, 140, 120)
        self.cell(0, 5, '_________________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def email_block(self, num, label, subject, body):
        self.ln(1)
        self.set_fill_color(*LIGHT_GOLD)
        self.set_draw_color(*BORDER)

        self.set_font('Sans', 'B', 8.5)
        self.set_text_color(*BROWN)
        self.cell(0, 5.5, f'Email {num}. {label}', new_x='LMARGIN', new_y='NEXT')

        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(*TEXT_DIM)
        self.cell(0, 4.5, 'Objet: ' + subject, new_x='LMARGIN', new_y='NEXT')
        self.ln(0.5)

        self.set_font('Sans', '', 7.5)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 4.5, body)
        self.ln(2)


def gen_contrat():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('Contrat-Type Freelance',
              'Modele pret a l\'emploi — Personnalisable',
              'DOCUMENT JURIDIQUE')

    pdf.add_page()
    pdf.section_box(1, 'Parties')
    pdf.body('Le present contrat est conclu entre les parties suivantes :')

    pdf.field_line('Prestataire (Nom / Prenom)')
    pdf.field_line('Adresse')
    pdf.field_line('Email / Telephone')
    pdf.field_line('SIRET / RC / ICE')
    pdf.ln(2)

    pdf.field_line('Client (Nom / Societe)')
    pdf.field_line('Adresse')
    pdf.field_line('Email / Telephone')
    pdf.field_line('Ref. interne')

    pdf.ln(3)
    pdf.section_box(2, 'Objet du Contrat')
    pdf.body('Le Prestataire s\'engage a realiser les prestations suivantes :')

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

    pdf.ln(3)
    pdf.section_box_simple(3, 'Duree')
    pdf.field_short('Date de debut')
    pdf.field_short('Date de fin estimee')
    pdf.field_short('Duree estimee', 60)
    pdf.body('Le contrat peut etre reconduit par accord ecrit des deux parties.')

    pdf.add_page()
    pdf.section_box(4, 'Montant et Conditions de Paiement')
    pdf.body('Les prestations sont facturees comme suit :')

    pdf.table(
        ['Designation', 'Qte', 'Prix unitaire HT', 'Total HT'],
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
    pdf.field_line('Acompte a la signature')
    pdf.ln(2)

    pdf.body('Modalites de paiement :')
    pdf.bullet('Acompte de _____ % a la signature du contrat')
    pdf.bullet('Solde a la livraison / en plusieurs versements : _____')
    pdf.bullet('Paiement sous 30 jours fin de mois sauf mention contraire')
    pdf.bullet('Penalites de retard : 3x le taux d\'interet legal')
    pdf.bullet('Indemnite forfaitaire pour frais de recouvrement : 40 EUR')

    pdf.ln(2)
    pdf.section_box_simple(5, 'Obligations du Prestataire')
    pdf.bullet('Realiser les prestations avec diligence et professionnalisme')
    pdf.bullet('Respecter les delais convenus')
    pdf.bullet('Garantir la confidentialite des informations du Client')
    pdf.bullet('Fournir un travail conforme au cahier des charges')

    pdf.ln(2)
    pdf.section_box_simple(6, 'Obligations du Client')
    pdf.bullet('Fournir toutes les informations necessaires a la realisation de la prestation')
    pdf.bullet('Regler les factures dans les delais convenus')
    pdf.bullet('Donner son approbation dans un delai raisonnable (max 5 jours ouvrés)')
    pdf.bullet('Ne pas exploiter les livrables au-dela des droits accordes avant paiement integral')

    pdf.add_page()
    pdf.section_box(7, 'Confidentialite')
    pdf.body('Les parties s\'engagent a garder strictement confidentielles toutes les informations '
             'echangees dans le cadre de ce contrat, y compris mais sans s\'y limiter : donnees '
             'commerciales, techniques, financieres, et strategiques.')
    pdf.body('Cette obligation de confidentialite reste en vigueur pendant toute la duree du contrat '
             'et pendant 2 ans apres son expiration.')

    pdf.ln(2)
    pdf.section_box(8, 'Propriete Intellectuelle')
    pdf.body('Les livrables crees par le Prestataire deviennent la propriete du Client '
             'apres paiement integral des sommes dues.')
    pdf.body('Le Prestataire conserve le droit de mentionner la collaboration dans son portfolio '
             'et de reproduire des extraits anonymises.')

    pdf.ln(2)
    pdf.section_box(9, 'Resiliation')
    pdf.body('A l\'amiable : Par accord ecrit des deux parties a tout moment.')
    pdf.body('Pour faute : Apres mise en demeure restee sans effet pendant 15 jours.')
    pdf.body('Sans motif : Le Client regle les prestations realisees au prorata du temps passe.')

    pdf.ln(2)
    pdf.section_box(10, 'Droit Applicable et Litiges')
    pdf.body('Le present contrat est regi par le droit marocain.')
    pdf.body('Tout litige sera soumis a la juridiction competente de la ville du Prestataire.')

    pdf.ln(4)
    pdf.section_box(11, 'Signatures')
    pdf.body('Fait en deux exemplaires originaux, a _________________, le _________________')
    pdf.ln(6)
    pdf.sig_line('Le Prestataire')
    pdf.body('Signature + mention "Bon pour accord"')
    pdf.ln(4)
    pdf.sig_line('Le Client')
    pdf.body('Signature + mention "Bon pour accord"')

    path = os.path.join(OUT_DIR, 'contrat-type-freelance.pdf')
    pdf.output(path)
    print(f'OK: {path}')


def gen_devis():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=18)

    pdf.add_page()
    pdf.cover('Devis Professionnel',
              'Modele vierge — Personnalisable',
              'DOCUMENT COMMERCIAL')

    pdf.add_page()
    pdf.set_font('Sans', 'B', 14)
    pdf.set_text_color(*BROWN)
    pdf.cell(0, 8, 'DEVIS', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 7.5)
    pdf.set_text_color(*TEXT_DIM)
    pdf.cell(0, 5, 'Validite : 30 jours', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(1)

    pdf.field_short('N° Devis')
    pdf.field_short('Date')

    pdf.ln(3)
    pdf.section_box(1, 'Informations')
    pdf.field_line('Prestataire (Nom / Societe)')
    pdf.field_line('Adresse')
    pdf.field_line('Email / Telephone')
    pdf.field_line('SIRET / RC / ICE')
    pdf.ln(2)
    pdf.field_line('Client (Nom / Societe)')
    pdf.field_line('Adresse')
    pdf.field_line('Email / Telephone')
    pdf.field_line('A l\'attention de')

    pdf.ln(3)
    pdf.section_box(2, 'Prestations')

    pdf.table(
        ['Description', 'Qte', 'PU HT', 'Total HT'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [75, 20, 45, 50]
    )

    pdf.field_line('Total HT')
    pdf.field_line('TVA (20% / 14% / 10% / 7% / Exonere)')
    pdf.field_line('Total TTC')
    pdf.field_line('Acompte demande')

    pdf.add_page()
    pdf.section_box(3, 'Conditions')
    pdf.bullet('Delai de realisation : ___________ jours / semaines')
    pdf.bullet('Validite du devis : 30 jours')
    pdf.bullet('Paiement : 50% a la commande, 50% a la livraison')
    pdf.bullet('Modes de paiement : Virement bancaire / Carte / Cheque')
    pdf.bullet('Livraison : Voie electronique (PDF / lien) / support physique')

    pdf.ln(3)
    pdf.section_box(4, 'Acceptation')
    pdf.body('Le Client reconnait avoir pris connaissance et accepter les conditions generales '
             'ci-dessus. Le present devis vaut bon de commande une fois signe.')

    pdf.ln(4)
    pdf.section_box_simple(5, 'Cachet et signature du Client')
    pdf.ln(8)
    pdf.sig_line('Date et mention "Bon pour accord"')
    pdf.ln(8)
    pdf.set_font('Sans', '', 7.5)
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
              'Tarifs recommandes par niveau d\'experience',
              'GRILLE DE PRIX')

    pdf.add_page()
    pdf.section_box(1, 'Debutant (< 6 mois)')
    pdf.body('Prix recommandes pour les freelances en demarrage :')
    pdf.table(
        ['Service', 'Mini', 'Maxi', 'Note'],
        [
            ['Landing page one-pager', '300', '500', 'Forfait fixe'],
            ['Site vitrine 3-5 pages', '600', '1 200', 'Forfait fixe'],
            ['Integration HTML/CSS maquette', '200', '400', 'Forfait fixe'],
            ['Correction / amelioration site', '150', '300', 'Forfait fixe'],
            ['Audit technique rapide', '100', '200', 'Forfait fixe'],
            ['Petite mission ponctuelle (1-2j)', '200', '400', 'Forfait'],
        ],
        [70, 25, 25, 70]
    )
    pdf.body('Mes tarifs personnalises :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.add_page()
    pdf.section_box(2, 'Intermediaire (6-18 mois)')
    pdf.body('Prix recommandes pour les freelances confirmes :')
    pdf.table(
        ['Service', 'TJM', 'Duree', 'Note'],
        [
            ['Developpement React / Next.js', '350 - 450', 'Regie', ''],
            ['API backend (Node.js)', '300 - 400', 'Semaine', ''],
            ['Refonte complete site', '2 500 - 5 000', 'Projet', ''],
            ['Maintenance mensuelle', '200 - 400/mois', 'Abonnement', ''],
            ['Consulting technique', '400 - 500/jour', 'Journee', ''],
            ['Application web sur mesure', '1 500 - 4 000', 'Projet', ''],
        ],
        [65, 30, 30, 65]
    )
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.add_page()
    pdf.section_box(3, 'Confirme (18+ mois)')
    pdf.body('Prix recommandes pour les freelances experts :')
    pdf.table(
        ['Service', 'TJM', 'Forfait'],
        [
            ['Architecture technique', '500 - 700', '3 000 - 8 000'],
            ['Lead tech / CTO temps partage', '600 - 900', '3 000 - 6 000/mois'],
            ['Formation equipe', '600 - 900', 'Sur devis'],
            ['Application complete (SaaS)', '450 - 600', '10 000 - 30 000'],
            ['Consulting strategique', '700 - 1 000', 'Sur devis'],
        ],
        [70, 40, 80]
    )
    pdf.body('Mes tarifs :')
    for i in range(3):
        pdf.field_line(f'Service {i+1}')

    pdf.ln(4)
    pdf.section_box(4, 'Grille Vierge')
    pdf.body('Reproduis ce modele pour definir tes propres tarifs :')
    pdf.ln(2)
    pdf.table(
        ['Service', 'Prix min', 'Prix max', 'Type'],
        [
            ['', '', '', ''],
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
              'Pre-remplis — prets a copier-coller',
              'PROSPECTION')

    pdf.add_page()
    pdf.section_box(1, 'Email Froid — Particulier')
    pdf.email_block(1, 'Froid vers particulier',
        'Idee pour [site] de [Nom]',
        'Bonjour [Prenom],\n\n'
        'Je suis developpeur freelance specialise en [React/Next.js/PHP].\n\n'
        'Je suis tombe sur [Site] et j\'ai remarque que '
        '[point specifique : design date / temps de chargement / fonctionnalite manquante].\n\n'
        'Je pourrais vous proposer une solution en [X] jours pour [resultat concret]. '
        'Sans engagement.\n\n'
        'Vous avez 10 minutes cette semaine pour qu\'on en parle ?\n\n'
        'Cordialement,\n[Mon nom] — [Mon site / Calendly]')

    pdf.add_page()
    pdf.section_box(2, 'Email Froid — Agence')
    pdf.email_block(2, 'Froid vers agence',
        'Prestation dev — [Agence]',
        'Bonjour [Prenom],\n\n'
        'Je suis developpeur freelance specialise en [frontend/backend].\n\n'
        'Si vous avez des projets ou des pics de charge, je peux vous depanner '
        'en regie (TJM a partir de [X]EUR).\n\n'
        'Je m\'adapte a votre stack et vos process.\n\n'
        'Quelques realisations : [lien 1] · [lien 2]\n\n'
        'Vous voulez qu\'on echange sur vos besoins a venir ?\n\n'
        'Bonne journee,\n[Mon nom] — [Mon site]')

    pdf.add_page()
    pdf.section_box(3, 'Relance J+7')
    pdf.email_block(3, 'Relance (7 jours apres)',
        'Relance — [Nom du projet]',
        'Salut [Prenom],\n\n'
        'Je me permets de revenir vers toi suite a mon precedent message.\n\n'
        'Si le timing n\'est pas bon, pas de souci — je reste dispo quand tu veux.\n\n'
        'Si tu preferes, je peux aussi faire une proposition plus legere pour commencer.\n\n'
        'Bonne semaine,\n[Mon nom]')

    pdf.ln(2)
    pdf.section_box_simple(4, 'Recommandation')
    pdf.email_block(4, 'Recommandation',
        'Suivi projet [Nom]',
        'Salut [Prenom],\n\n'
        'Ca fait [X mois] qu\'on a bosse ensemble sur [projet].\n\n'
        'Est-ce que tout fonctionne bien de ton cote ?\n\n'
        'Si tu as des collegues ou connaissances qui cherchent un developpeur, '
        'je suis preneur de recommandations. Et si toi-meme tu as un nouveau projet, '
        'je reste disponible.\n\n'
        'Merci d\'avance,\n[Mon nom]')

    pdf.add_page()
    pdf.section_box(5, 'Proposition Apres Audit')
    pdf.email_block(5, 'Proposition apres audit',
        'Compte-rendu audit + proposition',
        'Bonjour [Prenom],\n\n'
        'Suite a notre echange, voici ce que j\'ai repere :\n\n'
        'Points forts : [point 1], [point 2]\n'
        'Points d\'amelioration :\n'
        '  — [Point 1] — impact : fort / moyen / faible\n'
        '  — [Point 2] — impact : fort / moyen / faible\n'
        '  — [Point 3] — impact : fort / moyen / faible\n\n'
        'Je peux corriger tout ca en [X] jours pour [X]EUR.\n\n'
        'Tu veux qu\'on en discute ?\n\n'
        '[Mon nom]')

    pdf.ln(4)
    pdf.section_box(6, 'Conseils d\'envoi')
    pdf.bullet('Personnalise chaque email en fonction du destinataire')
    pdf.bullet('Relance J+7 si pas de reponse (template 3)')
    pdf.bullet('Maximum 2 relances, puis passe a autre chose')
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

print(f'\nTous les PDFs generes dans {OUT_DIR}/')
