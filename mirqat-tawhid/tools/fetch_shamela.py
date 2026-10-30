#!/usr/bin/env python3
"""
Télécharge un livre de la Maktaba Shamela page par page (https://shamela.ws/book/<id>/<n>)
et écrit data/kitab.json ou data/fath.json au format du lecteur :
    [ {"id": <n>, "text": "...", "footnotes": "..."}, ... ]

Aucune dépendance externe (Python 3.8+, fonctionne dans Termux).

Usage :
    python tools/fetch_shamela.py --book kitab
    python tools/fetch_shamela.py --book fath --delay 1.5

Principes d'intégrité :
  * le texte n'est jamais modifié (seules les balises HTML sont retirées) ;
  * le HTML brut est gardé dans raw/<livre>/<n>.html pour pouvoir vérifier et reprendre ;
  * si la structure de la page n'est pas reconnue, le script S'ARRÊTE au lieu de deviner ;
  * à la fin, il vérifie que toutes les pages de début de chapitre du sommaire sont présentes.
Respectez le site : gardez un délai d'au moins 1 s entre deux requêtes.
"""
import argparse, html, json, os, sys, time, urllib.request, urllib.error
from html.parser import HTMLParser

BOOKS = {"kitab": 11318, "fath": 2386}
BLOCK_TAGS = {"p", "div", "br", "li", "h1", "h2", "h3", "h4", "tr"}
UA = "Mozilla/5.0 (compatible; tawhid-reader-personal-use)"


class NassParser(HTMLParser):
    """Extrait le contenu du premier élément dont la classe contient 'nass'."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0          # profondeur à l'intérieur du conteneur (0 = hors conteneur)
        self.found = False
        self.in_notes = False
        self.main, self.notes = [], []

    def _buf(self):
        return self.notes if self.in_notes else self.main

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class") or ""
        if self.depth == 0:
            if not self.found and "nass" in cls.split():
                self.found, self.depth = True, 1
            return
        if tag == "hr":
            self.in_notes = True
        elif tag in BLOCK_TAGS:
            self._buf().append("\n")
        if tag not in ("br", "hr", "img", "input", "meta", "link"):
            self.depth += 1

    def handle_endtag(self, tag):
        if self.depth == 0:
            return
        if tag in BLOCK_TAGS and tag != "br":
            self._buf().append("\n")
        self.depth -= 1

    def handle_data(self, data):
        if self.depth > 0:
            self._buf().append(data)


def clean(parts):
    text = "".join(parts).replace("\xa0", " ")
    lines = [" ".join(l.split()) for l in text.split("\n")]
    return "\n".join(l for l in lines if l)


def fetch(url, retries=3):
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ar"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, r.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return e.code, ""
            err = f"HTTP {e.code}"
        except Exception as e:  # réseau
            err = str(e)
        time.sleep(2 * (attempt + 1))
    raise SystemExit(f"[x] Échec réseau répété sur {url} ({err}). Relancez : les pages déjà téléchargées sont conservées.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--book", choices=BOOKS, required=True)
    ap.add_argument("--delay", type=float, default=1.2, help="secondes entre requêtes (défaut 1.2)")
    ap.add_argument("--max-id", type=int, default=800, help="limite de sécurité")
    ap.add_argument("--stop-after", type=int, default=3, help="arrêt après N pages vides/404 consécutives")
    ap.add_argument("--data-dir", default=os.path.join(os.path.dirname(__file__), "..", "data"))
    ap.add_argument("--raw-dir", default=os.path.join(os.path.dirname(__file__), "..", "raw"))
    a = ap.parse_args()

    toc = json.load(open(os.path.join(a.data_dir, "toc.json"), encoding="utf-8"))
    required = sorted({c[a.book] for c in toc["chapters"] if c.get(a.book) is not None})
    if a.book == "fath":
        required = sorted(set(required) | {toc.get("fath_intro_start", 1)})
    raw = os.path.join(a.raw_dir, a.book)
    os.makedirs(raw, exist_ok=True)

    pages, empty_run, n = [], 0, 0
    while n < a.max_id:
        n += 1
        cache = os.path.join(raw, f"{n}.html")
        if os.path.exists(cache):
            body = open(cache, encoding="utf-8").read()
            status = 200 if body else 404
        else:
            status, body = fetch(f"https://shamela.ws/book/{BOOKS[a.book]}/{n}")
            if status == 200:
                open(cache, "w", encoding="utf-8").write(body)
            time.sleep(a.delay)
        if status != 200:
            empty_run += 1
            if empty_run >= a.stop_after:
                break
            continue
        p = NassParser()
        p.feed(body)
        if not p.found:
            if n == 1:
                raise SystemExit(
                    "[x] Structure de page non reconnue (aucun élément class='nass').\n"
                    f"    Ouvrez {cache} et envoyez-moi les ~40 premières lignes autour du texte : j'adapte le script.")
            empty_run += 1
            if empty_run >= a.stop_after:
                break
            continue
        text, notes = clean(p.main), clean(p.notes)
        if not text:
            empty_run += 1
            if empty_run >= a.stop_after:
                break
            continue
        empty_run = 0
        entry = {"id": n, "text": text}
        if notes:
            entry["footnotes"] = notes
        pages.append(entry)
        if n % 25 == 0:
            print(f"    … page {n} ({len(pages)} pages utiles)")

    have = {p["id"] for p in pages}
    missing = [r for r in required if r not in have]
    print(f"[+] {len(pages)} pages récupérées (ids {pages[0]['id'] if pages else '-'}–{pages[-1]['id'] if pages else '-'}).")
    if missing:
        print(f"[x] Pages de début de chapitre manquantes : {missing}")
        print("    Rien n'a été écrit. Relancez (les pages en cache sont réutilisées) ou vérifiez raw/.")
        sys.exit(2)
    out = os.path.join(a.data_dir, f"{a.book}.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=1)
    expected = toc["books"][a.book].get("pages")
    print(f"[+] Écrit {out}. (Pages annoncées par la fiche Shamela : {expected}.)")
    print("[!] Vérifiez à l'œil quelques pages contre le site avant de publier.")


if __name__ == "__main__":
    main()
