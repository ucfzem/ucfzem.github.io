#!/tmp/pdf-venv/bin/python3
from fpdf import FPDF
import os

FONT_DIR = '/usr/share/fonts/truetype/liberation'

class GuidePDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.add_font('Sans', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))
        self.add_font('Sans', 'B', os.path.join(FONT_DIR, 'LiberationSans-Bold.ttf'))
        self.add_font('Sans', 'I', os.path.join(FONT_DIR, 'LiberationSans-Italic.ttf'))
        self.add_font('Sans', 'BI', os.path.join(FONT_DIR, 'LiberationSans-BoldItalic.ttf'))
        self.add_font('Mono', '', os.path.join(FONT_DIR, 'LiberationSans-Regular.ttf'))

    def header(self):
        if self.page_no() > 1:
            self.set_font('Sans', 'I', 7)
            self.set_text_color(100, 116, 139)
            self.cell(0, 8, 'Le Guide Ultime du Freelance — Ucf Zem', align='L')
            self.cell(0, 8, f'Page {self.page_no()}', align='R', new_x='LMARGIN', new_y='NEXT')
            self.line(10, 14, 200, 14)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Sans', 'I', 6)
            self.set_text_color(71, 85, 105)
            self.cell(0, 10, 'Guide gratuit — ucfzem.github.io', align='C')

    def section_title(self, num, title):
        self.set_font('Sans', 'B', 18)
        self.set_text_color(15, 23, 42)
        self.set_fill_color(79, 70, 229)
        w = self.get_string_width(f'{num}. {title}') + 12
        self.set_x((210 - w) / 2)
        self.cell(w, 12, f'{num}. {title}', fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
        self.set_text_color(255, 255, 255)
        self.set_x((210 - w) / 2)
        self.cell(w, 12, f'{num}. {title}', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(6)

    def sub_title(self, title):
        self.set_font('Sans', 'B', 13)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, title, new_x='LMARGIN', new_y='NEXT')
        self.ln(2)

    def body_text(self, txt):
        self.set_font('Sans', '', 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 5.5, txt)
        self.ln(2)

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            col_widths = [190 / len(headers)] * len(headers)
        self.set_font('Sans', 'B', 9)
        self.set_fill_color(241, 245, 249)
        self.set_text_color(15, 23, 42)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align='C')
        self.ln()
        self.set_font('Sans', '', 9)
        self.set_text_color(51, 65, 85)
        for row in rows:
            for i, cell in enumerate(row):
                self.cell(col_widths[i], 6.5, str(cell), border=1)
            self.ln()
        self.ln(4)

    def bullet(self, txt):
        self.set_font('Sans', '', 10)
        self.set_text_color(51, 65, 85)
        x = self.get_x()
        self.cell(5, 5.5, chr(8226))
        self.multi_cell(0, 5.5, txt)
        self.ln(1)

    def code_block(self, txt):
        self.set_fill_color(248, 250, 252)
        self.set_font('Mono', '', 9)
        self.set_text_color(30, 41, 59)
        lines = txt.split('\n')
        for line in lines:
            self.cell(0, 5, '  ' + line, new_x='LMARGIN', new_y='NEXT')
        self.ln(4)

    def email_block(self, title, label_tag, content):
        self.set_font('Sans', 'B', 10)
        self.set_text_color(30, 41, 59)
        self.cell(0, 6, title, new_x='LMARGIN', new_y='NEXT')
        self.set_font('Sans', '', 9)
        self.set_text_color(51, 65, 85)
        lines = content.split('\n')
        for line in lines:
            self.cell(0, 5, line, new_x='LMARGIN', new_y='NEXT')
        self.ln(4)

    def checkbox_list(self, items):
        for item in items:
            self.set_font('Sans', '', 10)
            self.set_text_color(51, 65, 85)
            self.cell(5, 6, '')
            self.cell(5, 6, '[ ]')
            self.multi_cell(0, 6, item)
            self.ln(1)


pdf = GuidePDF()
pdf.set_auto_page_break(auto=True, margin=20)

# ---- Cover ----
pdf.add_page()
pdf.ln(50)
pdf.set_font('Sans', 'B', 32)
pdf.set_text_color(79, 70, 229)
pdf.cell(0, 15, 'Le Guide Ultime', align='C', new_x='LMARGIN', new_y='NEXT')
pdf.set_text_color(15, 23, 42)
pdf.set_font('Sans', '', 28)
pdf.cell(0, 15, 'du Freelance', align='C', new_x='LMARGIN', new_y='NEXT')
pdf.ln(10)
pdf.set_font('Sans', '', 12)
pdf.set_text_color(100, 116, 139)
pdf.cell(0, 7, 'Grille tarifaire · Templates d\'emails · Routine quotidienne · Checklist 30 jours', align='C', new_x='LMARGIN', new_y='NEXT')
pdf.ln(30)
pdf.set_font('Sans', 'I', 10)
pdf.set_text_color(148, 163, 184)
pdf.cell(0, 7, 'Offert par Ucf Zem', align='C', new_x='LMARGIN', new_y='NEXT')
pdf.cell(0, 7, 'ucfzem.github.io', align='C', new_x='LMARGIN', new_y='NEXT')

# ---- Section 1: Grille Tarifaire ----
pdf.add_page()
pdf.section_title(1, 'Grille Tarifaire Prete a l\'Emploi')

pdf.sub_title('Pour les debutants (< 6 mois)')
pdf.table(
    ['Service', 'Mini', 'Maxi', 'Note'],
    [
        ['Landing page one-pager', '300', '500', 'Forfait fixe'],
        ['Site vitrine 3-5 pages', '600', '1 200', 'Forfait fixe'],
        ['Integration HTML/CSS maquette', '200', '400', 'Forfait fixe'],
        ['Correction / amelioration site', '150', '300', 'Forfait fixe'],
        ['Audit technique rapide', '100', '200', 'Forfait fixe'],
    ],
    [85, 25, 25, 55]
)

pdf.sub_title('Pour les intermediaires (6-18 mois)')
pdf.table(
    ['Service', 'TJM', 'Duree'],
    [
        ['Developpement React / Next.js', '350 - 450', 'Regie'],
        ['API backend (Node.js)', '300 - 400', 'Semaine'],
        ['Refonte complete site', '2 500 - 5 000', 'Projet'],
        ['Maintenance mensuelle', '200 - 400/mois', 'Abonnement'],
        ['Consulting technique', '400 - 500/jour', 'Journee'],
    ],
    [85, 45, 60]
)

pdf.sub_title('Pour les confirmes (18+ mois)')
pdf.table(
    ['Service', 'TJM', 'Forfait'],
    [
        ['Architecture technique', '500 - 700', '3 000 - 8 000'],
        ['Lead tech / CTO temps partage', '600 - 800', '3 000 - 6 000/mois'],
        ['Formation equipe', '600 - 900', 'Sur devis'],
        ['Application complete (SaaS)', '450 - 600', '10 000 - 30 000'],
    ],
    [85, 45, 60]
)

pdf.sub_title('Template de devis')
pdf.code_block(
    'OBJET : Devis - [Projet]\n'
    'CLIENT : [Client]\n'
    'DATE : [Date]\n\n'
    'DESCRIPTION :\n'
    '  - [Tache 1]\n'
    '  - [Tache 2]\n'
    '  - [Tache 3]\n\n'
    'MONTANT : [    ] EUR TTC\n'
    'DELAI : [X] semaines\n'
    'PAIEMENT : 50% signature, 50% livraison\n\n'
    'Validite : 15 jours'
)

# ---- Section 2: Templates d'Emails ----
pdf.add_page()
pdf.section_title(2, '5 Templates d\'Emails Prospection')

content = '''Objet : Idee pour [site web / projet] de [Nom]

Bonjour [Prenom],

Je suis developpeur freelance et je suis tombe sur [site / projet / LinkedIn de la personne].

J'ai remarque que [point specifique : design date / temps de chargement / fonctionnalite manquante].

Je pourrais vous proposer une solution en [X] jours pour [resultat concret]. Sans engagement.

Vous avez 10 minutes cette semaine pour qu'on en parle ?

Cordialement,
[Mon nom] · [Mon lien Calendly ou site]'''

pdf.email_block('1. Froid particulier', 'FROID', content)

content = '''Objet : Prestation dev - [Nom de l'agence]

Bonjour [Prenom],

Je suis developpeur freelance specialise en [frontend / backend].

Si vous avez des projets ou des pics de charge, je peux vous depanner en regie (TJM a partir de [X]EUR).

Je m'adapte a votre stack et vos process.

Quelques realisations : [lien 1] · [lien 2]

Vous voulez qu'on echange sur vos besoins a venir ?

Bonne journee,
[Mon nom] · [Mon site]'''

pdf.email_block('2. Agence', 'AGENCE', content)

content = '''Objet : Relance - [Nom du projet]

Salut [Prenom],

Je me permets de revenir vers toi suite a mon precedent message.

Si le timing n'est pas bon, pas de souci - je reste dispo quand tu veux.

Si tu preferes, je peux aussi faire une proposition plus legere pour commencer.

Bonne semaine,
[Mon nom]'''

pdf.email_block('3. Relance (J+7)', 'RELANCE', content)

content = '''Objet : Suivi projet [Nom du projet]

Salut [Prenom du client passe],

Ca fait [X mois] qu'on a bosse ensemble sur [projet].

Est-ce que tout fonctionne bien de ton cote ?

Si tu as des collegues ou connaissances qui cherchent un developpeur, je suis preneur de recommandations. Et si toi-meme tu as un nouveau projet, je reste disponible.

Merci d'avance,
[Mon nom]'''

pdf.email_block('4. Recommandation', 'RECO', content)

content = '''Objet : Compte-rendu audit + proposition

Bonjour [Prenom],

Suite a notre echange, voici ce que j'ai repere :

Points forts : [point 1], [point 2]
Points d'amelioration :
  - [Point 1] - impact : fort/moyen/faible
  - [Point 2] - impact : fort/moyen/faible
  - [Point 3] - impact : fort/moyen/faible

Je peux corriger tout ca en [X] jours pour [X]EUR.

Tu veux qu'on en discute ?
[Mon nom]'''

pdf.email_block('5. Proposition apres audit', 'AUDIT', content)

# ---- Section 3: Routine Quotidienne ----
pdf.add_page()
pdf.section_title(3, 'Routine Quotidienne')

pdf.body_text(
    'Voici la routine qui fait tourner les freelances a 5 000 EUR/mois. '
    'Pas de secret : des blocks de deep work, des pauses, et une vraie fin de journee.'
)

pdf.sub_title('Matin (7h - 9h30)')
pdf.table(
    ['Horaire', 'Action'],
    [
        ['7h00 - 7h30', 'Reveil, douche froide, pas de telephone'],
        ['7h30 - 8h00', 'Planification du jour - 3 priorites'],
        ['8h00 - 9h00', 'Deep work #1 : tache la plus importante'],
        ['9h00 - 9h30', 'Pause, petit-dejeuner'],
    ],
    [35, 155]
)

pdf.sub_title('Mi-journee (9h30 - 12h30)')
pdf.table(
    ['Horaire', 'Action'],
    [
        ['9h30 - 11h00', 'Deep work #2 : developpement / livraison client'],
        ['11h00 - 11h15', 'Pause'],
        ['11h15 - 12h30', 'Administration : devis, factures, mails clients'],
    ],
    [35, 155]
)

pdf.sub_title('Apres-midi (14h - 17h)')
pdf.table(
    ['Horaire', 'Action'],
    [
        ['12h30 - 14h00', 'Pause dejeuner - vrai break, pas devant l\'ecran'],
        ['14h00 - 15h30', 'Prospection / networking / LinkedIn'],
        ['15h30 - 16h30', 'Deep work #3 : projet perso ou formation'],
        ['16h30 - 17h00', 'Bilan du jour + preparation du lendemain'],
    ],
    [35, 155]
)

pdf.sub_title('Soir')
pdf.bullet('17h00 : FINI. Pas de travail apres.')
pdf.bullet('Sport 3x / semaine')
pdf.bullet('Lecture 20 min / jour (technique ou business)')

pdf.sub_title('Regles d\'or')
pdf.body_text(
    '1. Pas de reseaux sociaux avant 12h - le matin est pour produire\n'
    '2. Journaling 5 min chaque soir : "Qu\'est-ce que j\'ai appris aujourd\'hui ?"\n'
    '3. Un seul client a la fois en deep work - pas de multitache\n'
    '4. Relance clients tous les jeudi matin (30 min chrono)\n'
    '5. Un jour par mois sans ecran - creativite et repos'
)

# ---- Section 4: Checklist 30 Jours ----
pdf.add_page()
pdf.section_title(4, 'Checklist 30 Jours')
pdf.body_text('Coche chaque jour. A la fin du mois, t\'auras une machine freelance qui tourne.')

pdf.sub_title('Semaine 1 - Fondations')
pdf.checkbox_list([
    'Definir son offre (quoi, pour qui, combien)',
    'Creer son profil LinkedIn optimise',
    'Preparer son portfolio (3 projets minimum)',
    'Fixer ses tarifs (utilise la grille section 1)',
    'Creer un calendrier de prospection',
    'Preparer ses templates d\'emails (section 2)',
    'Bilan semaine : peaufiner l\'offre',
])

pdf.sub_title('Semaine 2 - Prospection')
pdf.checkbox_list([
    'Envoyer 5 emails froids (template 1)',
    'Contacter 3 agences (template 2)',
    'Relancer les non-reponses (template 3)',
    'Poster 1 contenu LinkedIn (conseil dev)',
    'Contacter 5 anciens collegues / connaissances',
    'Preparer un audit gratuit pour une cible',
    'Bilan semaine : 3 echanges telephoniques minimum',
])

pdf.sub_title('Semaine 3 - Conversion')
pdf.checkbox_list([
    'Transformer un echange en devis',
    'Envoyer 2 propositions personnalisees',
    'Relance client interesse (template 4)',
    'Preparer un argumentaire anti-objections',
    'Soigner son follow-up (merci + prochaines etapes)',
    'Demander 1 recommandation',
    'Bilan semaine : 1 devis signe minimum',
])

pdf.sub_title('Semaine 4 - Acceleration')
pdf.checkbox_list([
    'Livrer un premier resultat client',
    'Demander un temoignage / avis',
    'Automatiser sa prospection (reseau, alertes)',
    'Creer un call-to-action sur LinkedIn',
    'Se former 2h (outil, stack, business)',
    'Preparer le mois suivant',
    'Bilan mensuel : CA, lecons, objectifs M2',
])

pdf.sub_title('Bonus')
pdf.checkbox_list([
    'Configurer Stripe pour paiement en ligne',
    'Creer un contrat-type freelance',
    'Ouvrir un compte pro (Qonto, Shine)',
    'Rejoindre 2 communautes freelance (Discord, Slack)',
    'Installer un tracker de temps (Toggl, Clockify)',
])

# Save
output_path = os.path.join(os.path.dirname(__file__), 'guide-freelance.pdf')
pdf.output(output_path)
print(f'PDF cree : {output_path}')
