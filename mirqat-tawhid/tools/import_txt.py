#!/usr/bin/env python3
"""
Importe un livre exporté en .txt (par ex. depuis l'application Shamela) et le découpe
PAR CHAPITRE en repérant les titres du sommaire (data/toc.json).
Sortie au format du lecteur : [ {"chapter": n, "text": "..."} ]   (n = 0 : مقدمة فتح المجيد)

Usage :
    python tools/import_txt.py --book kitab --input kitab_raw.txt
    python tools/import_txt.py --book fath  --input fath_raw.txt --skip-until "مقدمة الشارح"

Sécurités :
  * le texte n'est jamais réécrit : il est seulement découpé aux titres trouvés ;
  * les 67 titres doivent être trouvés, dans l'ordre, sinon rien n'est écrit ;
  * un rapport (report_<livre>.txt) montre pour chaque chapitre la ligne de titre trouvée et
    la longueur du texte : relisez-le avant de publier ;
  * si votre fichier commence par un index (liste des titres), utilisez --skip-until avec
    une phrase qui n'apparaît qu'au début du corps du livre.
"""
import argparse, json, os, re, sys

TASHKEEL = re.compile(r"[\u064B-\u065F\u0670\u0640\u06D6-\u06ED{}()\[\]\u00AB\u00BB\uFD3E\uFD3F:\u060C\u061B,;\"']")
MAP = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ة": "ه"})


def norm_with_map(s):
    out, idx = [], []
    for i, ch in enumerate(s):
        if TASHKEEL.match(ch):
            continue
        out.append(ch.translate(MAP))
        idx.append(i)
    return "".join(out), idx


def key_of(title):
    """Clé de recherche : début du titre sans « باب » ni signes, normalisé."""
    t = re.sub(r"^\s*باب\s*", "", title)
    t = " ".join(norm_with_map(t)[0].split())
    return t[:28].strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--book", choices=["kitab", "fath"], required=True)
    ap.add_argument("--input", required=True)
    ap.add_argument("--skip-until", help="expression à repérer : la recherche des titres commence après elle")
    ap.add_argument("--min-chars", type=int, default=120, help="longueur minimale suspecte d'un chapitre")
    ap.add_argument("--data-dir", default=os.path.join(os.path.dirname(__file__), "..", "data"))
    a = ap.parse_args()

    toc = json.load(open(os.path.join(a.data_dir, "toc.json"), encoding="utf-8"))
    raw = open(a.input, encoding="utf-8").read()
    ntext, idx = norm_with_map(raw)
    # espaces normalisés pour tolérer les retours à la ligne au milieu d'un titre
    flat = re.sub(r"\s+", " ", ntext)
    # table de correspondance flat -> original
    flat_idx, j = [], 0
    prev_space = False
    for k, ch in enumerate(ntext):
        if ch.isspace():
            if prev_space:
                continue
            prev_space = True
        else:
            prev_space = False
        flat_idx.append(idx[k])
    assert len(flat_idx) == len(flat)

    pos = 0
    if a.skip_until:
        k = flat.find(" ".join(norm_with_map(a.skip_until)[0].split()))
        if k < 0:
            sys.exit(f"[x] --skip-until introuvable : {a.skip_until!r}")
        pos = k

    chapters = [c for c in toc["chapters"]]
    found = []
    for c in chapters:
        key = key_of(c["title"])
        if c["n"] == 1:
            key = "كتاب التوحيد"
        k = flat.find(key, pos)
        if k < 0:
            sys.exit(f"[x] Titre du chapitre {c['n']} introuvable (clé « {key} »). Rien n'a été écrit.\n"
                     "    Vérifiez le fichier, ou utilisez --skip-until si un index précède le corps du livre.")
        found.append((c["n"], flat_idx[k], key))
        pos = k + len(key)

    out, report = [], []
    if a.book == "fath":
        intro = raw[: found[0][1]].strip()
        if intro:
            out.append({"chapter": 0, "text": intro})
            report.append(f"0\tمقدمة\t{len(intro)} car.")
    for i, (n, start, key) in enumerate(found):
        end = found[i + 1][1] if i + 1 < len(found) else len(raw)
        text = raw[start:end].strip()
        out.append({"chapter": n, "text": text})
        first = text.split("\n", 1)[0][:70]
        flag = "   <-- SUSPECT (court)" if len(text) < a.min_chars else ""
        report.append(f"{n}\t{first}\t{len(text)} car.{flag}")

    rep = f"report_{a.book}.txt"
    open(rep, "w", encoding="utf-8").write("\n".join(report) + "\n")
    suspects = sum("SUSPECT" in r for r in report)
    outp = os.path.join(a.data_dir, f"{a.book}.json")
    if suspects:
        print(f"[x] {suspects} chapitre(s) suspects (voir {rep}). Rien n'a été écrit. Corrigez --skip-until ou le fichier, puis relancez.")
        sys.exit(2)
    json.dump(out, open(outp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"[+] {len(out)} blocs écrits dans {outp}. Relisez {rep} avant de publier.")


if __name__ == "__main__":
    main()
