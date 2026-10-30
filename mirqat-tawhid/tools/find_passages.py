#!/usr/bin/env python3
"""
Cherche dans Majmu' al-Fatawa (Shamela, book 7289) les pages où Ibn Taymiyya traite
de tawhid al-Rububiyya et de tawhid al-Uluhiyya (et de leur différence).

Ce script NE CHOISIT PAS à votre place : il télécharge les pages des deux volumes de tawhid,
repère celles qui contiennent les termes-clés et vous donne une liste classée avec des extraits.
Vous relisez, vous gardez ce qui répond à votre question, puis vous complétez volume/page.

Pages Shamela (d'après le sommaire) : vol. 1 « توحيد الألوهية » commence à l'id 3,
vol. 2 « توحيد الربوبية » à l'id 383. La fin du vol. 2 n'est pas connue : réglez --end
(les pages au-delà du vol. 2 seront simplement signalées, regardez le rapport).

Usage :
    python tools/find_passages.py                 # ids 3 à 910
    python tools/find_passages.py --start 3 --end 700 --delay 1.2

Sorties :
    data/fatawa_candidates.json   (NON chargé par l'application ; verified=false)
    passages_report.txt           (à lire : classement + extraits)
"""
import argparse, json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_shamela as fs  # réutilise le téléchargeur et l'extracteur

BOOK_ID = 7289
TASH = re.compile(r"[ً-ٰٟـۖ-ۭ]")
MAP = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ة": "ه"})

RUB = ["توحيد الربوبيه", "الربوبيه", "ربوبيته", "توحيد الربوبيه"]
ULU = ["توحيد الالهيه", "توحيد الالوهيه", "الالهيه", "الالوهيه", "توحيد العباده", "الهيته"]
DIFF = ["الفرق بين", "فرق بين", "لا يصير مسلما", "اقر به المشركون", "اقرار المشركين", "لا يكفي"]
HEAD = re.compile(r"الجزء\s*:?\s*(\d+)\s*[¦|]\s*الصفحة\s*:?\s*(\d+)")
TITLE = re.compile(r"<title>(.*?)</title>", re.S)
TITLE_VP = re.compile(r"ج\s*(\d+)\s*-\s*ص\s*(\d+)")


def norm(s):
    return " ".join(TASH.sub("", s).translate(MAP).split())


def first_hit(ntext, terms):
    best = None
    for t in terms:
        i = ntext.find(t)
        if i >= 0 and (best is None or i < best):
            best = i
    return best


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--start", type=int, default=3)
    ap.add_argument("--end", type=int, default=910)
    ap.add_argument("--delay", type=float, default=1.2)
    ap.add_argument("--raw-dir", default=os.path.join(os.path.dirname(__file__), "..", "raw", "majmu"))
    ap.add_argument("--data-dir", default=os.path.join(os.path.dirname(__file__), "..", "data"))
    a = ap.parse_args()
    os.makedirs(a.raw_dir, exist_ok=True)

    found, empty = [], 0
    for n in range(a.start, a.end + 1):
        cache = os.path.join(a.raw_dir, f"{n}.html")
        if os.path.exists(cache):
            body = open(cache, encoding="utf-8").read()
        else:
            status, body = fs.fetch(f"https://shamela.ws/book/{BOOK_ID}/{n}")
            if status != 200:
                empty += 1
                if empty >= 3:
                    print(f"[!] 3 pages vides à partir de {n}; arrêt.")
                    break
                continue
            open(cache, "w", encoding="utf-8").write(body)
            time.sleep(a.delay)
        empty = 0
        p = fs.NassParser(); p.feed(body)
        if not p.found:
            if n == a.start:
                sys.exit(f"[x] Structure non reconnue (class='nass'). Voir {cache}.")
            continue
        text = fs.clean(p.main)
        nt = norm(text)
        r, u, d = first_hit(nt, RUB), first_hit(nt, ULU), first_hit(nt, DIFF)
        if r is None and u is None:
            continue
        m = HEAD.search(re.sub(r"<[^>]+>", " ", body))
        if not m:
            tm = TITLE.search(body)
            if tm:
                m = TITLE_VP.search(tm.group(1))
        score = (3 if (r is not None and u is not None) else 1) + (2 if d is not None else 0)
        pos = r if r is not None else u
        found.append({"shamela_id": n, "volume": int(m.group(1)) if m else None, "page": int(m.group(2)) if m else None,
                      "score": score, "has_rububiyya": r is not None, "has_uluhiyya": u is not None,
                      "has_difference_cue": d is not None, "snippet": nt[max(0, pos - 80):pos + 260], "text": text})
        if n % 50 == 0:
            print(f"    … id {n}, {len(found)} pages candidates")

    found.sort(key=lambda x: (-x["score"], x["shamela_id"]))
    cands = [{"id": f"cand-{x['shamela_id']}", "verified": False, "volume": x["volume"], "page": x["page"],
              "shamela_id": x["shamela_id"], "title": "", "category": "", "related": [], "text": x["text"]} for x in found]
    json.dump(cands, open(os.path.join(a.data_dir, "fatawa_candidates.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open("passages_report.txt", "w", encoding="utf-8") as f:
        f.write(f"{len(found)} pages contiennent un terme-clé. Classées : (ربوبية+ألوهية) d'abord, puis indice de « فرق ».\n\n")
        for x in found:
            tags = "".join(["R" if x["has_rububiyya"] else "-", "U" if x["has_uluhiyya"] else "-", "D" if x["has_difference_cue"] else "-"])
            f.write(f"[{tags}] id {x['shamela_id']}  م {x['volume'] or '؟'} ص {x['page'] or '؟'}\n    {x['snippet']}\n\n")
    print(f"[+] {len(found)} pages candidates → data/fatawa_candidates.json et passages_report.txt")
    print("[!] Lisez le rapport, gardez les passages pertinents, puis envoyez-moi les identifiants (id) retenus.")


if __name__ == "__main__":
    main()
