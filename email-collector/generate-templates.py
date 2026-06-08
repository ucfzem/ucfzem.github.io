#!/tmp/pdf-venv/bin/python3
from fpdf import FPDF
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), 'templates')
os.makedirs(OUT_DIR, exist_ok=True)

FONT_DIR = '/usr/share/fonts/truetype/liberation'

GOLD = (139, 105, 20)
GOLD2 = (212, 160, 23)
BROWN = (107, 52, 16)
DARK = (26, 18, 11)
TEXT = (42, 31, 20)
TEXT2 = (90, 70, 40)
CREAM = (253, 246, 237)
WHITE = (255, 255, 255)

class TemplatePDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))
        self.add_font('Sans', 'BI', os.path.join(FONT_DIR, 'LiberationSans-BoldItalic.ttf'))

    def header(self):
        if self.page_no() > 1:
            self.set_font('Sans', 'I', 7)
            self.set_text_color(*TEXT2)
            self.cell(0, 8, 'UCF ZEM — Template freelance', align='L')
            self.cell(0, 8, f'Page {self.page_no()}', align='R', new_x='LMARGIN', new_y='NEXT')
            self.set_draw_color(*GOLD2)
            self.set_line_width(0.3)
            self.line(10, 14, 200, 14)
            self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font('Sans', 'I', 6)
        self.set_text_color(*TEXT2)
        self.cell(0, 10, 'ucfzem.gumroad.com', align='C')

    def cover(self, title, subtitle, label=''):
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 297, 'F')
        self.ln(70)
        if label:
            self.set_font('Sans', 'B', 10)
            self.set_text_color(*GOLD2)
            w = self.get_string_width(label) + 12
            self.set_x((210 - w) / 2)
            self.set_fill_color(*BROWN)
            self.cell(w, 8, label, fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
            self.ln(12)
        self.set_font('Sans', 'B', 26)
        self.set_text_color(*GOLD2)
        self.cell(0, 12, title, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(6)
        self.set_font('Sans', '', 12)
        self.set_text_color(196, 181, 154)
        self.cell(0, 8, subtitle, align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(20)
        self.set_font('Sans', 'I', 9)
        self.set_text_color(138, 122, 100)
        self.cell(0, 7, 'Offert par UCF ZEM — ucfzem.gumroad.com', align='C', new_x='LMARGIN', new_y='NEXT')

    def section_title(self, num, title):
        self.ln(4)
        self.set_font('Sans', 'B', 15)
        self.set_text_color(*GOLD)
        self.set_draw_color(*GOLD2)
        self.set_line_width(0.4)
        y = self.get_y()
        self.cell(0, 9, f'{num}. {title}', new_x='LMARGIN', new_y='NEXT')
        self.set_y(y + 10)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def sub_title(self, title):
        self.set_font('Sans', 'B', 10)
        self.set_text_color(*BROWN)
        self.cell(0, 7, title, new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def body(self, txt):
        self.set_font('Sans', '', 9)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 5, txt)
        self.ln(2)

    def field(self, label, width=80):
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*TEXT2)
        self.cell(width, 5, label)
        self.set_font('Sans', '', 9)
        self.set_text_color(*TEXT)
        self.set_draw_color(180, 160, 140)
        self.cell(0, 5, '_____________________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def signature_line(self, label):
        self.ln(4)
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*TEXT2)
        self.cell(90, 5, label)
        self.set_font('Sans', 'I', 8)
        self.set_text_color(160, 140, 120)
        self.cell(0, 5, '_______________', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            col_widths = [190 / len(headers)] * len(headers)
        self.set_font('Sans', 'B', 8)
        self.set_fill_color(*GOLD)
        self.set_text_color(*WHITE)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align='C')
        self.ln()
        self.set_font('Sans', '', 8)
        self.set_text_color(*TEXT)
        fill = False
        for row in rows:
            if fill:
                self.set_fill_color(248, 242, 235)
            for i, cell in enumerate(row):
                align = 'L' if i == 0 else 'C'
                self.cell(col_widths[i], 6, str(cell), border=1, align=align, fill=fill)
            self.ln()
            fill = not fill
        self.ln(3)

    def lined_field(self, label, w=60):
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*TEXT2)
        self.cell(w, 5, label + ': ')
        self.set_draw_color(180, 160, 140)
        self.set_font('Sans', '', 9)
        self.set_text_color(*TEXT)
        self.cell(0, 5, '_____________________________________________', new_x='LMARGIN', new_y='NEXT')
        self.ln(1)

    def bullet(self, txt):
        self.set_font('Sans', '', 8.5)
        self.set_text_color(*TEXT)
        x = self.get_x()
        self.cell(5, 5, '—')
        self.multi_cell(0, 5, txt)
        self.ln(0.5)

    def email_block(self, label, subject, body):
        self.ln(2)
        self.set_fill_color(253, 246, 237)
        self.set_draw_color(*GOLD2)
        y0 = self.get_y()
        self.set_font('Sans', 'B', 8)
        self.set_text_color(*BROWN)
        self.cell(0, 5, label, new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', 'I', 7.5)
        self.set_text_color(*TEXT2)
        self.cell(0, 4, 'Objet: ' + subject, new_x='LMARGIN', new_y='NEXT')
        self.ln(1)
        self.set_font('Sans', '', 8)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 4.5, body)
        self.ln(2)


def contrat_type():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.add_page()
    pdf.cover(
        'Contrat-Type Freelance',
        'Modele pret a l\'emploi — Personnalisable',
        '- DOCUMENT JURIDIQUE -'
    )

    pdf.add_page()
    pdf.section_title(1, 'Parties')
    pdf.body('Le present contrat est conclu entre les parties suivantes:')
    pdf.field('Prestataire (Nom / Prénom)')
    pdf.field('Adresse')
    pdf.field('Email / Téléphone')
    pdf.field('SIRET / Registre de commerce')
    pdf.ln(2)
    pdf.body('Ci-apres designe "le Prestataire"')
    pdf.ln(2)
    pdf.field('Client (Nom / Société)')
    pdf.field('Adresse')
    pdf.field('Email / Téléphone')
    pdf.ln(2)
    pdf.body('Ci-apres designe "le Client"')

    pdf.add_page()
    pdf.section_title(2, 'Objet du Contrat')
    pdf.body('Le Prestataire s\'engage a realiser les prestations suivantes pour le Client:')
    pdf.set_draw_color(200, 180, 160)
    pdf.set_fill_color(253, 246, 237)
    y = pdf.get_y()
    for i in range(6):
        pdf.set_font('Sans', '', 9)
        pdf.set_text_color(*TEXT)
        pdf.cell(6, 7, str(i+1) + '.')
        pdf.set_font('Sans', 'I', 8)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(0, 7, '_____________________________________________________________', new_x='LMARGIN', new_y='NEXT')

    pdf.ln(4)
    pdf.sub_title('Livrables attendus')
    pdf.set_draw_color(200, 180, 160)
    for i in range(3):
        pdf.set_font('Sans', 'I', 8)
        pdf.set_text_color(160, 140, 120)
        pdf.cell(10, 6, '   ')
        pdf.cell(0, 6, '_____________________________________________________________', new_x='LMARGIN', new_y='NEXT')

    pdf.ln(6)
    pdf.section_title(3, 'Duree')
    pdf.body('Le contrat prend effet le:')
    pdf.lined_field('Date de debut')
    pdf.lined_field('Date de fin (estimee)')
    pdf.body('Duree estimee de la mission: ______ semaines / mois')
    pdf.body('Le contrat peut etre reconduit par accord ecrit des deux parties.')

    pdf.add_page()
    pdf.section_title(4, 'Montant et Conditions de Paiement')
    pdf.body('Les prestations sont facturees comme suit:')

    pdf.table(
        ['Designation', 'Quantite', 'Prix unitaire', 'Total'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [70, 25, 45, 50]
    )

    pdf.lined_field('Sous-total HT')
    pdf.lined_field('TVA (%)')
    pdf.lined_field('Total TTC')
    pdf.lined_field('Acompte a la signature')
    pdf.ln(2)

    pdf.sub_title('Modalites de paiement')
    pdf.bullet('Acompte de _____% a la signature du contrat')
    pdf.bullet('Solde a la livraison / en plusieurs versements: _____')
    pdf.bullet('Paiement sous 30 jours fin de mois sauf mention contraire')
    pdf.bullet('Penalites de retard: 3x le taux d\'interet legal')
    pdf.bullet('Indemnite forfaitaire pour frais de recouvrement: 40EUR')

    pdf.ln(4)
    pdf.section_title(5, 'Obligations du Prestataire')
    pdf.bullet('Realiser les prestations avec diligence et professionnalisme')
    pdf.bullet('Respecter les delais convenus')
    pdf.bullet('Garantir la confidentialite des informations du Client')
    pdf.bullet('Fournir un travail conforme au cahier des charges')

    pdf.add_page()
    pdf.section_title(6, 'Obligations du Client')
    pdf.bullet('Fournir toutes les informations necessaires a la realisation de la prestation')
    pdf.bullet('Regler les factures dans les delais convenus')
    pdf.bullet('Donner son approbation dans un delai raisonnable (max 5 jours ouvrés)')
    pdf.bullet('Ne pas exploiter les livrables au-dela des droits accordes avant paiement integral')

    pdf.ln(4)
    pdf.section_title(7, 'Confidentialite')
    pdf.body('Les parties s\'engagent a garder strictement confidentielles toutes les informations '
             'echangees dans le cadre de ce contrat, y compris mais sans s\'y limiter: donnees '
             'commerciales, techniques, financieres, et strategiques.')
    pdf.body('Cette obligation de confidentialite reste en vigueur pendant toute la duree du contrat '
             'et pendant 2 ans apres son expiration.')

    pdf.ln(4)
    pdf.section_title(8, 'Propriete Intellectuelle')
    pdf.body('Les livrables crees par le Prestataire dans le cadre de ce contrat deviennent la '
             'propriete du Client apres paiement integral des sommes dues.')
    pdf.body('Le Prestataire conserve le droit de mentionner la collaboration dans son portfolio '
             'et de reproduire des extraits anonymises.')

    pdf.add_page()
    pdf.section_title(9, 'Resiliation')
    pdf.sub_title('Resiliation a l\'amiable')
    pdf.body('Les parties peuvent resilier le contrat d\'un commun accord a tout moment.')
    pdf.sub_title('Resiliation pour faute')
    pdf.body('Chaque partie peut resilier le contrat en cas de manquement grave de l\'autre partie, '
             'apres mise en demeure restee sans effet pendant 15 jours.')
    pdf.sub_title('Resiliation sans motif')
    pdf.body('Le Client peut resilier le contrat a tout moment en reglant les prestations '
             'deja realisees au prorata du temps passe.')

    pdf.ln(4)
    pdf.section_title(10, 'Droit Applicable et Litiges')
    pdf.body('Le present contrat est regi par le droit marocain.')
    pdf.body('Tout litige sera soumis a la jurisdiction competente de la ville du Prestataire.')

    pdf.ln(6)
    pdf.section_title(11, 'Signatures')
    pdf.body('Fait en deux exemplaires originaux, a ______, le ______')
    pdf.ln(6)
    pdf.signature_line('Le Prestataire (signature)')
    pdf.signature_line('Le Client (signature)')
    pdf.ln(4)
    pdf.body('Lu et approuve. Mention "Bon pour accord" manuscrite recommandee.')

    pdf.output(os.path.join(OUT_DIR, 'contrat-type-freelance.pdf'))
    print(f'OK: {OUT_DIR}/contrat-type-freelance.pdf')


def devis_vierge():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.add_page()
    pdf.cover(
        'Devis Professionnel',
        'Modele vierge — Personnalisable',
        'DOCUMENT COMMERCIAL'
    )

    pdf.add_page()
    pdf.section_title(1, 'Informations')
    pdf.set_font('Sans', 'B', 11)
    pdf.set_text_color(*BROWN)
    pdf.cell(0, 7, 'DEVIS', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', 'I', 8)
    pdf.set_text_color(*TEXT2)
    pdf.cell(0, 5, 'N° devis: _______________     Date: _______________', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(6)

    pdf.sub_title('Prestataire')
    pdf.lined_field('Nom / Societe')
    pdf.lined_field('Adresse')
    pdf.lined_field('Email / Telephone')
    pdf.lined_field('SIRET / RC / ICE')
    pdf.ln(4)

    pdf.sub_title('Client')
    pdf.lined_field('Nom / Societe')
    pdf.lined_field('Adresse')
    pdf.lined_field('Email / Telephone')
    pdf.lined_field('A l\'attention de')

    pdf.add_page()
    pdf.section_title(2, 'Prestations')
    pdf.body('Description detaillee des services proposes:')

    pdf.table(
        ['Prestation', 'Qté', 'PU HT', 'Total HT'],
        [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        [75, 20, 45, 50]
    )

    pdf.lined_field('Total HT')
    pdf.lined_field('TVA (20% / 14% / 10% / 7% / Exonere)')
    pdf.lined_field('Total TTC')
    pdf.lined_field('Acompte demande')
    pdf.ln(4)

    pdf.section_title(3, 'Conditions')
    pdf.bullet('Delai de realisation: _______________ jours / semaines')
    pdf.bullet('Validite du devis: 30 jours')
    pdf.bullet('Paiement: 50% a la commande, 50% a la livraison')
    pdf.bullet('Mode de paiement acceptes: Virement bancaire / Carte / Cheque')
    pdf.bullet('Livraison: par voie electronique (PDF / lien) / support physique')

    pdf.add_page()
    pdf.section_title(4, 'Acceptation')
    pdf.body('Le Client reconnait avoir pris connaissance et accepter les conditions generales '
             'ci-dessus. Le present devis vaut bon de commande une fois signe.')
    pdf.ln(4)
    pdf.sub_title('Cachet et signature du Client')
    pdf.ln(10)
    pdf.set_font('Sans', 'I', 9)
    pdf.set_text_color(*TEXT2)
    pdf.cell(90, 6, 'Date et signature')
    pdf.cell(0, 6, 'Mention "Bon pour accord"', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(12)
    pdf.set_draw_color(180, 160, 140)
    for i in range(3):
        pdf.cell(0, 0, '', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Sans', '', 8)
    pdf.set_text_color(*TEXT2)
    pdf.cell(0, 5, 'Cachet de l\'entreprise (obligatoire pour les professionnels)', new_x='LMARGIN', new_y='NEXT')

    pdf.output(os.path.join(OUT_DIR, 'devis-vierge-freelance.pdf'))
    print(f'OK: {OUT_DIR}/devis-vierge-freelance.pdf')


def grille_tarifaire():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.add_page()
    pdf.cover(
        'Grille Tarifaire',
        'Tarifs recommandés par niveau d\'expérience',
        '- GRILLE DE PRIX -'
    )

    pdf.add_page()
    pdf.section_title(1, 'Debutant (< 6 mois)')
    pdf.body('Prix recommandes pour les freelances en demarrage:')
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
    pdf.body('Mes tarifs personnalises:')
    for i in range(3):
        pdf.lined_field('Service ' + str(i+1))

    pdf.add_page()
    pdf.section_title(2, 'Intermediaire (6-18 mois)')
    pdf.body('Prix recommandes pour les freelances confirmes:')
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
    pdf.body('Mes tarifs:')
    for i in range(3):
        pdf.lined_field('Service ' + str(i+1))

    pdf.add_page()
    pdf.section_title(3, 'Confirme (18+ mois)')
    pdf.body('Prix recommandes pour les freelances experts:')
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
    pdf.body('Mes tarifs:')
    for i in range(3):
        pdf.lined_field('Service ' + str(i+1))

    pdf.add_page()
    pdf.section_title(4, 'Template de Devis')
    pdf.body('Modele de devis vierge a copier-coller:')
    pdf.set_fill_color(248, 242, 235)
    pdf.set_font('Sans', '', 8)
    pdf.set_text_color(*TEXT)
    lines = [
        'OBJET : Devis — [Nom du projet]',
        'CLIENT : [Nom du client]',
        'DATE : [Date]',
        '',
        'DESCRIPTION :',
        '  — [Tache 1]',
        '  — [Tache 2]',
        '  — [Tache 3]',
        '',
        'MONTANT : [    ] EUR TTC',
        'DELAI : [X] semaines',
        'PAIEMENT : 50% signature, 50% livraison',
        '',
        'Validite : 15 jours',
    ]
    for line in lines:
        pdf.cell(0, 5, line, new_x='LMARGIN', new_y='NEXT')

    pdf.output(os.path.join(OUT_DIR, 'grille-tarifaire-freelance.pdf'))
    print(f'OK: {OUT_DIR}/grille-tarifaire-freelance.pdf')


def pack_emails():
    pdf = TemplatePDF()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.add_page()
    pdf.cover(
        '5 Templates d\'Emails',
        'Pre-remplis — prets a copier-coller',
        '- PROSPECTION -'
    )

    pdf.add_page()
    pdf.section_title(1, 'Email Froid — Particulier')
    pdf.email_block(
        'Template 1 — Froid vers particulier',
        'Idee pour [site] de [Nom]',
        'Bonjour [Prenom],\n\n'
        'Je suis developpeur freelance specialise en [React/Next.js/PHP].\n\n'
        'Je suis tombe sur [Site] et j\'ai remarque que '
        '[point specifique: design date / temps de chargement / fonctionnalite manquante].\n\n'
        'Je pourrais vous proposer une solution en [X] jours pour [resultat concret]. '
        'Sans engagement.\n\n'
        'Vous avez 10 minutes cette semaine pour qu\'on en parle ?\n\n'
        'Cordialement,\n[Mon nom] — [Mon site / Calendly]'
    )

    pdf.add_page()
    pdf.section_title(2, 'Email Froid — Agence')
    pdf.email_block(
        'Template 2 — Froid vers agence',
        'Prestation dev — [Agence]',
        'Bonjour [Prenom],\n\n'
        'Je suis developpeur freelance specialise en [frontend/backend].\n\n'
        'Si vous avez des projets ou des pics de charge, je peux vous depanner '
        'en regie (TJM a partir de [X]EUR).\n\n'
        'Je m\'adapte a votre stack et vos process.\n\n'
        'Quelques realisations: [lien 1] · [lien 2]\n\n'
        'Vous voulez qu\'on echange sur vos besoins a venir ?\n\n'
        'Bonne journee,\n[Mon nom] — [Mon site]'
    )

    pdf.add_page()
    pdf.section_title(3, 'Relance J+7')
    pdf.email_block(
        'Template 3 — Relance (7 jours apres)',
        'Relance — [Nom du projet]',
        'Salut [Prenom],\n\n'
        'Je me permets de revenir vers toi suite a mon precedent message.\n\n'
        'Si le timing n\'est pas bon, pas de souci — je reste dispo quand tu veux.\n\n'
        'Si tu preferes, je peux aussi faire une proposition plus legere pour commencer.\n\n'
        'Bonne semaine,\n[Mon nom]'
    )

    pdf.section_title(4, 'Recommandation')
    pdf.email_block(
        'Template 4 — Recommandation',
        'Suivi projet [Nom]',
        'Salut [Prenom],\n\n'
        'Ca fait [X mois] qu\'on a bosse ensemble sur [projet].\n\n'
        'Est-ce que tout fonctionne bien de ton cote ?\n\n'
        'Si tu as des collegues ou connaissances qui cherchent un developpeur, '
        'je suis preneur de recommandations. Et si toi-meme tu as un nouveau projet, '
        'je reste disponible.\n\n'
        'Merci d\'avance,\n[Mon nom]'
    )

    pdf.add_page()
    pdf.section_title(5, 'Proposition Apres Audit')
    pdf.email_block(
        'Template 5 — Proposition apres audit',
        'Compte-rendu audit + proposition',
        'Bonjour [Prenom],\n\n'
        'Suite a notre echange, voici ce que j\'ai repere:\n\n'
        'Points forts: [point 1], [point 2]\n'
        'Points d\'amelioration:\n'
        '  — [Point 1] — impact: fort / moyen / faible\n'
        '  — [Point 2] — impact: fort / moyen / faible\n'
        '  — [Point 3] — impact: fort / moyen / faible\n\n'
        'Je peux corriger tout ca en [X] jours pour [X]EUR.\n\n'
        'Tu veux qu\'on en discute ?\n\n'
        '[Mon nom]'
    )

    pdf.ln(6)
    pdf.section_title(6, 'Conseils d\'envoi')
    pdf.bullet('Personnalise chaque email en fonction du destinataire')
    pdf.bullet('Relance J+7 si pas de reponse (template 3)')
    pdf.bullet('Maximum 2 relances, puis passe a autre chose')
    pdf.bullet('Utilise un CRM (Less Annoying CRM, Notion) pour suivre tes relances')
    pdf.bullet('Envoie entre 9h et 10h pour un meilleur taux d\'ouverture')
    pdf.bullet('Objectif: 5 emails froids par jour = 100/mois = 5-10 clients potentiels')

    pdf.output(os.path.join(OUT_DIR, 'pack-emails-prospection.pdf'))
    print(f'OK: {OUT_DIR}/pack-emails-prospection.pdf')


contrat_type()
devis_vierge()
grille_tarifaire()
pack_emails()

print(f'\nTous les PDFs generes dans {OUT_DIR}/')
print('Pret a uploader sur Gumroad !')
