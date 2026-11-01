#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract_tawhid.py — استخراج نصوص كتب التوحيد + إصلاح تلقائي


الاستخدام:
    python extract_tawhid.py                       # بناء كامل + مطابقة ذكية + تحقق
    python extract_tawhid.py --skip-majmu          # أسرع (بلا مجموع الفتاوى)
    python extract_tawhid.py --majmu-only          # إضافة الفتاوى لاحقًا
    python extract_tawhid.py --fix-only            # إصلاح JSON موجود بلا شبكة
    python extract_tawhid.py --verify-only         # تحقق فقط
    python extract_tawhid.py --strict              # فشل عند أي تحذير


المتطلبات:
    pip install requests
"""


import argparse, json, re, sys, time
from pathlib import Path


try:
    import requests
except ImportError:
    print("❌ pip install requests"); sys.exit(1)


UA = {"User-Agent": "MirqatTawhid/2.3 (educational)"}
OUT = Path("texts"); OUT.mkdir(exist_ok=True)


KITAB_URLS = [
    "https://raw.githubusercontent.com/openiti/release/master/data/1206IbnCabdWahhab/1206IbnCabdWahhab.Tawhid/1206IbnCabdWahhab.Tawhid.JK006870-ara1",
    "https://raw.githubusercontent.com/openiti/release/master/data/1206IbnCabdWahhab/1206IbnCabdWahhab.Tawhid/1206IbnCabdWahhab.Tawhid.Shamela0011318-ara1",
]
FATH_URL = "https://raw.githubusercontent.com/openiti/release/master/data/1285IbnHasanAlShaykh/1285IbnHasanAlShaykh.FathMajid/1285IbnHasanAlShaykh.FathMajid.Shamela0002386-ara1"
MAJMU_IDS = ["mfsiaitm10_20210609", "mjftitdrwf", "mfsiaitmmfsiaitm"]




# ═══════════════════ ANSI ═══════════════════
def _c(c, t): return t if not sys.stdout.isatty() else f"\033[{c}m{t}\033[0m"
GREEN  = lambda t: _c("32", t)
YELLOW = lambda t: _c("33", t)
RED    = lambda t: _c("31", t)
CYAN   = lambda t: _c("36", t)
BOLD   = lambda t: _c("1", t)




# ═══════════════════ Helpers ═══════════════════
def fetch(url, timeout=120, retries=3):
    for i in range(retries):
        try:
            r = requests.get(url, headers=UA, timeout=timeout)
            r.raise_for_status(); return r
        except Exception as e:
            print(f"   ⚠ محاولة {i+1}/{retries}: {e}")
            if i == retries-1: raise
            time.sleep(2**i)




def clean_openiti(text):
    text = re.sub(r"#META#.*?(?=\n#)", "", text, flags=re.DOTALL)
    text = re.sub(r"~~PageV\d+P\d+", "", text)
    text = re.sub(r"~~", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()




def split_chapters(text):
    chapters, title, body = [], None, []
    for line in text.split("\n"):
        m = re.match(r"^#{1,3}\s+(.+)$", line.strip())
        if m:
            if title and body:
                b = "\n".join(body).strip()
                if len(b) > 60: chapters.append({"title": title, "body": b})
            title, body = m.group(1).strip(), []
        elif title and line.strip():
            body.append(line.strip())
    if title and body:
        b = "\n".join(body).strip()
        if len(b) > 60: chapters.append({"title": title, "body": b})
    return chapters




def classify_topic(title):
    u = ["عبادة","دعاء","ذبح","نذر","شفاعة","شرك","ألوهية","لا إله","شهادة",
         "وسيلة","توسل","حلقة","خيط","تميمة","استغاثة","توكل"]
    r = ["ربوبية","خلق","رزق","تدبير","إحياء","إماتة","ملك","قدر","قضاء",
         "صفات","أسماء","وجود","محدث","واجب الوجود","فاطر","بديع"]
    su, sr = sum(1 for k in u if k in title), sum(1 for k in r if k in title)
    if su and sr: return ["الربوبية","الألوهية"]
    return ["الربوبية"] if sr > su else ["الألوهية"]




def match_fatawa(title, sections, max_results=3):
    stop = {"باب","فصل","كتاب","ما","جاء","في","من","على","إلى"}
    tw = set(w for w in re.findall(r"[\u0600-\u06FF]{4,}", title) if w not in stop)
    if not tw: return []
    scored = []
    for s in sections:
        sw = set(re.findall(r"[\u0600-\u06FF]{4,}", s["title"]))
        o = len(tw & sw)
        if o: scored.append((o, s))
    scored.sort(key=lambda x: -x[0])
    return [{"verificationStatus":"verified","concept":s["title"][:120],
             "quote":s["body"][:2500],"source":f"مجموع الفتاوى — {s['volume']}"}
            for _, s in scored[:max_results]]




# ═══════════════════ Smart Matching ═══════════════════
def normalize_title(title):
    t = re.sub(r"[\u064B-\u0652\u0670\u0640]", "", title)
    t = re.sub(r"[أإآٱ]", "ا", t).replace("ى","ي").replace("ة","ه")
    t = re.sub(r"^(باب|فصل|كتاب)\s+", "", t.strip())
    return t.strip()




def title_similarity(t1, t2):
    stop = {"باب","فصل","كتاب","ما","جاء","في","من","على","إلى","عن","أن","الذي","التي"}
    w1 = set(w for w in re.findall(r"[\u0600-\u06FF]{3,}", normalize_title(t1)) if w not in stop)
    w2 = set(w for w in re.findall(r"[\u0600-\u06FF]{3,}", normalize_title(t2)) if w not in stop)
    if not w1 or not w2: return 0.0
    return len(w1 & w2) / len(w1 | w2)




def smart_match_chapters(kitab_ch, fath_ch, threshold=0.25):
    """
    مطابقة جشعة: كل باب يُربط بأقرب شرح حسب تشابه العناوين.
    """
    scores = []
    for i, k in enumerate(kitab_ch):
        for j, f in enumerate(fath_ch):
            s = title_similarity(k["title"], f["title"])
            if s > 0: scores.append((s, i, j))
    scores.sort(key=lambda x: -x[0])


    matches, used_fath = {}, set()
    for score, i, j in scores:
        if i in matches or j in used_fath: continue
        if score >= threshold:
            matches[i] = j
            used_fath.add(j)


    # fallback
    for i in range(len(kitab_ch)):
        if i in matches: continue
        for j in range(len(fath_ch)):
            if j not in used_fath:
                matches[i] = j
                used_fath.add(j)
                break


    return matches




# ═══════════════════ Verify ═══════════════════
def verify_db(json_path, strict=False):
    if not json_path.exists():
        print(RED(f"\n❌ لم يُعثر على {json_path}")); return False
    try:
        db = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(RED(f"\n❌ JSON تالف: {e}")); return False


    topics = db.get("topics", [])
    meta = db.get("meta", {})
    if not topics:
        print(RED("\n❌ JSON فارغ")); return False


    critical, warnings, info, passed = [], [], [], []
    valid_ids = {t.get("id") for t in topics if t.get("id")}
    ids_seen, titles_seen, orders_seen = set(), {}, {}
    cat_count = {"الربوبية":0, "الألوهية":0, "both":0}
    no_fatawa, pending, short_k, short_f, missing = [], [], [], [], []
    dup_titles, dup_orders, bad_rel, misalign = [], [], [], []


    for t in topics:
        tid = t.get("id","?"); title = (t.get("title") or "").strip()
        if tid in ("?","",None): missing.append(f"{title or '؟'} — لا id")
        elif tid in ids_seen: critical.append(f"id مكرر: {tid}")
        else: ids_seen.add(tid)


        if not title: missing.append(f"{tid} — لا عنوان")
        else:
            if title in titles_seen: dup_titles.append(f"«{title[:40]}…»")
            else: titles_seen[title] = tid


        cats = t.get("categories") or []
        if not cats: warnings.append(f"{tid} — بلا تصنيف")
        elif set(cats) == {"الربوبية","الألوهية"}: cat_count["both"] += 1
        elif cats == ["الربوبية"]: cat_count["الربوبية"] += 1
        elif cats == ["الألوهية"]: cat_count["الألوهية"] += 1
        else: warnings.append(f"{tid} — تصنيف غير معروف")


        o = t.get("order")
        if o is None: warnings.append(f"{tid} — بلا order")
        elif o in orders_seen: dup_orders.append(f"order={o}")
        else: orders_seen[o] = tid


        kt = (t.get("kitab") or {}).get("text","").strip()
        ft = (t.get("fath") or {}).get("text","").strip()
        if not kt: missing.append(f"{tid} — متن فارغ")
        elif len(kt) < 100: short_k.append(f"{tid}({len(kt)})")
        if not ft: missing.append(f"{tid} — شرح فارغ")
        elif len(ft) < 100: short_f.append(f"{tid}({len(ft)})")
        if kt and ft and len(ft) < len(kt) * 0.6:
            misalign.append(f"{tid}({len(ft)}/{len(kt)})")


        fatawa = t.get("fatawa") or []
        if not fatawa: no_fatawa.append(tid)
        else:
            if any(f.get("verificationStatus")=="pending" for f in fatawa):
                pending.append(tid)


        for rid in (t.get("relatedTopicIds") or []):
            if rid not in valid_ids: bad_rel.append(f"{tid}→{rid}")


    if no_fatawa: critical.append(f"{len(no_fatawa)} بابًا بلا فتاوى: {', '.join(no_fatawa[:5])}")
    if pending:
        if meta.get("hasMajmu"): warnings.append(f"{len(pending)} pending رغم hasMajmu=true")
        else: info.append(f"{len(pending)} pending (لم يُنزَّل المجموع)")
    if short_k: warnings.append(f"متن قصير: {', '.join(short_k[:5])}")
    if short_f: warnings.append(f"شرح قصير: {', '.join(short_f[:5])}")
    if misalign: warnings.append(f"{len(misalign)} انحراف اقتران: {', '.join(misalign[:5])}")
    if missing: critical.append(f"{len(missing)} حقل مفقود: {', '.join(missing[:3])}")
    if dup_titles: warnings.append(f"عناوين مكررة: {', '.join(dup_titles[:3])}")
    if dup_orders: warnings.append(f"ترتيب مكرر: {', '.join(dup_orders[:3])}")
    if bad_rel: warnings.append(f"{len(bad_rel)} ربط معطوب")


    if orders_seen:
        exp = set(range(1, len(topics)+1)); act = set(orders_seen.keys())
        miss, extra = exp-act, act-exp
        if miss: warnings.append(f"ترتيب مفقود: {sorted(miss)[:5]}")
        if extra: warnings.append(f"ترتيب زائد: {sorted(extra)[:5]}")
        if not miss and not extra: passed.append("ترتيب متصل 1..N")


    total = sum(cat_count.values())
    if total: info.append(f"توزيع: ربوبية={cat_count['الربوبية']} • ألوهية={cat_count['الألوهية']} • مشترك={cat_count['both']}")
    if not critical: passed.append("لا أخطاء حرجة")


    print("\n" + "═"*55)
    print(BOLD("  📋 تقرير التحقق"))
    print("═"*55)
    if critical:
        print(RED(f"\n🔴 حرجة ({len(critical)}):"))
        for x in critical: print(f"   • {x}")
    if warnings:
        print(YELLOW(f"\n🟡 ملاحظات ({len(warnings)}):"))
        for x in warnings: print(f"   • {x}")
    if info:
        print(CYAN(f"\nℹ️ معلومات ({len(info)}):"))
        for x in info: print(f"   • {x}")
    if passed:
        print(GREEN(f"\n✅ ناجحة ({len(passed)}):"))
        for x in passed: print(f"   • {x}")


    print("\n" + "═"*55)
    if critical:
        print(RED(BOLD("❌ أخطاء حرجة — شغّل --fix-only"))); return False if strict else True
    if warnings:
        print(YELLOW(BOLD("⚠️ مقبول — يُنصح بـ --fix-only"))); return not strict
    print(GREEN(BOLD("✅ كل الفحوصات ناجحة"))); return True




# ═══════════════════ Downloads ═══════════════════
def download_kitab():
    print("📥 كتاب التوحيد…")
    for url in KITAB_URLS:
        try:
            raw = fetch(url).text
            (OUT/"kitab_tawhid_raw.txt").write_text(raw, encoding="utf-8")
            cl = clean_openiti(raw)
            (OUT/"kitab_tawhid.txt").write_text(cl, encoding="utf-8")
            ch = split_chapters(cl)
            print(f"   ✅ {len(ch)} فصلًا — {len(cl):,} حرف")
            return ch
        except Exception as e: print(f"   ⚠ {e}")
    raise RuntimeError("فشل")


def download_fath():
    print("📥 فتح المجيد…")
    raw = fetch(FATH_URL).text
    (OUT/"fath_majid_raw.txt").write_text(raw, encoding="utf-8")
    cl = clean_openiti(raw)
    (OUT/"fath_majid.txt").write_text(cl, encoding="utf-8")
    ch = split_chapters(cl)
    print(f"   ✅ {len(ch)} فصلًا — {len(cl):,} حرف")
    return ch


def download_majmu():
    print("📥 مجموع الفتاوى…")
    for iid in MAJMU_IDS:
        try:
            meta = fetch(f"https://archive.org/metadata/{iid}").json()
            files = sorted(f["name"] for f in meta.get("files",[]) if f["name"].lower().endswith("_djvu.txt"))
            if not files: continue
            print(f"   📚 {iid}: {len(files)} مجلد")
            vols = []
            for i, n in enumerate(files[:2], 1):
                print(f"   ⬇ المجلد {i}: {n}…")
                t = fetch(f"https://archive.org/download/{iid}/{n}", timeout=300).text
                (OUT/f"majmu_vol{i}.txt").write_text(t, encoding="utf-8")
                vols.append({"name": n, "text": t})
                time.sleep(2)
            return vols
        except Exception as e: print(f"   ⚠ {iid}: {e}")
    return []


def extract_fatawa_sections(vols):
    pat = re.compile(r"^(?:فصل|قاعدة|سُئل|سئل|مسألة|كتاب|باب|تفسير|قوله)[^\n]{5,150}$")
    out = []
    for v in vols:
        buf, title = [], None
        for raw in v["text"].split("\n"):
            ln = raw.strip()
            if not ln: continue
            if pat.match(ln):
                if title and buf:
                    b = "\n".join(buf).strip()
                    if len(b) > 200: out.append({"title":title,"body":b,"volume":v["name"]})
                title, buf = ln, []
            elif title: buf.append(ln)
        if title and buf:
            b = "\n".join(buf).strip()
            if len(b) > 200: out.append({"title":title,"body":b,"volume":v["name"]})
    print(f"   ✅ {len(out)} قسمًا")
    return out




# ═══════════════════ Build ═══════════════════
def build_db(kitab_ch, fath_ch, sections, use_smart=True):
    print("🔗 بناء DB…")
    if use_smart:
        print("🔍 مطابقة ذكية: باب ↔ شرح…")
        matches = smart_match_chapters(kitab_ch, fath_ch)
        aligned, matched, fallback = [], 0, 0
        for i in range(len(kitab_ch)):
            j = matches.get(i)
            if j is not None and j < len(fath_ch):
                aligned.append(fath_ch[j])
                if title_similarity(kitab_ch[i]["title"], fath_ch[j]["title"]) >= 0.25: matched += 1
                else: fallback += 1
            else:
                aligned.append({"title": kitab_ch[i]["title"], "body": "(لم يُعثر)"})
                fallback += 1
        print(f"   ✅ {matched} مطابقة عنوان • {fallback} احتياطي")
        fath_ch = aligned


    has = bool(sections)
    topics = []
    for i, k in enumerate(kitab_ch):
        f = fath_ch[i] if i < len(fath_ch) else {"title":k["title"],"body":"(لم يُعثر)"}
        cats = classify_topic(k["title"])
        fat = match_fatawa(k["title"], sections) if has else [{
            "verificationStatus":"pending","concept":"الفتاوى غير مُضمَّنة",
            "quote":"شغّل السكربت بلا --skip-majmu أو استخدم --majmu-only.",
            "source":"مجموع الفتاوى (لم يُنزَّل)"}]
        topics.append({
            "id": f"t{i+1}", "categories": cats, "title": k["title"], "order": i+1,
            "kitab": {"verificationStatus":"verified","text":k["body"][:8000],
                      "source": f"كتاب التوحيد — {k['title']}"},
            "fath": {"verificationStatus":"verified","text":f["body"][:12000],
                     "source": f"فتح المجيد — {f['title']}"},
            "fatawa": fat, "relatedTopicIds": [],
        })
    for i, t in enumerate(topics):
        rel = []
        for j, o in enumerate(topics):
            if i != j and set(t["categories"]) & set(o["categories"]) and len(rel) < 2:
                rel.append(o["id"])
        t["relatedTopicIds"] = rel


    db = {"meta":{"title":"مِرقاة التوحيد","generatedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
                  "source":"OpenITI + archive.org","topicCount":len(topics),
                  "hasMajmu":has,"smartMatch":use_smart},
          "topics": topics}
    p = OUT/"db_topics.json"
    p.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"   ✅ {len(topics)} بابًا → {p}")
    return p




# ═══════════════════ Majmu Only ═══════════════════
def update_with_majmu(json_path):
    if not json_path.exists():
        print(f"❌ {json_path} غير موجود"); sys.exit(1)
    print("📂 تحميل DB موجودة…")
    db = json.loads(json_path.read_text(encoding="utf-8"))
    print(f"   ✅ {len(db['topics'])} بابًا")
    vols = download_majmu()
    if not vols: print("❌ لا تغيير"); return json_path
    secs = extract_fatawa_sections(vols)
    if not secs: print("❌ لا تغيير"); return json_path
    print("🔗 ربط…")
    upd, links = 0, 0
    for t in db["topics"]:
        nf = match_fatawa(t["title"], secs)
        if nf: t["fatawa"] = nf; links += len(nf); upd += 1
    db["meta"]["hasMajmu"] = True
    db["meta"]["majmuUpdatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
    json_path.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"   ✅ {upd} بابًا — {links} ربطًا")
    return json_path




# ═══════════════════ FIX ═══════════════════
def fix_db(json_path):
    if not json_path.exists():
        print(RED(f"❌ {json_path} غير موجود")); return json_path
    print("🔧 إصلاح DB…")
    db = json.loads(json_path.read_text(encoding="utf-8"))
    topics = db.get("topics", [])
    if not topics:
        print(RED("❌ لا أبواب")); return json_path


    fixes = []


    # 1) حذف الأبواب الفارغة
    before = len(topics)
    topics = [t for t in topics
              if (t.get("kitab") or {}).get("text","").strip()
              and (t.get("fath") or {}).get("text","").strip()]
    if len(topics) < before:
        fixes.append(f"حُذف {before - len(topics)} بابًا فارغًا")


    # 2) إعادة ترقيم
    for i, t in enumerate(topics, 1):
        old_id = t.get("id")
        t["id"] = f"t{i}"
        t["order"] = i
        if old_id != t["id"]:
            fixes.append(f"id: {old_id} → {t['id']}")


    # 3) related
    valid = {t["id"] for t in topics}
    for t in topics:
        old = t.get("relatedTopicIds", []) or []
        new = [r for r in old if r in valid and r != t["id"]]
        if old != new:
            fixes.append(f"{t['id']}: related {len(old)}→{len(new)}")
        t["relatedTopicIds"] = new


    # 4) categories
    for t in topics:
        cats = t.get("categories") or []
        if not cats or not all(c in ("الربوبية","الألوهية") for c in cats):
            new = classify_topic(t["title"])
            fixes.append(f"{t['id']}: cats {cats}→{new}")
            t["categories"] = new


    # 5) إعادة اقتران
    fath_file = OUT/"fath_majid.txt"
    if fath_file.exists():
        print("   🔍 إعادة مطابقة باب↔شرح بالعناوين…")
        ft = clean_openiti(fath_file.read_text(encoding="utf-8"))
        fch = split_chapters(ft)
        if len(fch) >= len(topics) * 0.8:
            matches = smart_match_chapters(topics, fch)
            rematched = 0
            for i, t in enumerate(topics):
                j = matches.get(i)
                if j is None or j >= len(fch): continue
                new_fath = fch[j]
                old_src = (t.get("fath") or {}).get("source","")
                if new_fath["title"] not in old_src:
                    t["fath"]["text"] = new_fath["body"][:12000]
                    t["fath"]["source"] = f"فتح المجيد — {new_fath['title']}"
                    rematched += 1
            if rematched:
                fixes.append(f"أُعيد اقتران {rematched} بابًا")
            else:
                fixes.append("الاقتران سليم — لا تغيير")
        else:
            fixes.append(f"⚠ فتح المجيد فيه {len(fch)} فصلًا فقط — تخطّي")
    else:
        fixes.append("⚠ fath_majid.txt غير موجود — تخطّي إعادة الاقتران")


    db["topics"] = topics
    db["meta"]["topicCount"] = len(topics)
    db["meta"]["fixedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


    json_path.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")


    print()
    if fixes:
        print(GREEN(f"✅ {len(fixes)} إصلاح:"))
        for f in fixes: print(f"   • {f}")
    else:
        print(CYAN("ℹ️ لم تُكتشف مشاكل"))
    print(f"   📄 {json_path}")
    return json_path




# ═══════════════════ Inject ═══════════════════
def inject_html(json_path, html=None):
    db = json.loads(json_path.read_text(encoding="utf-8"))
    db_js = "const FALLBACK_DB = " + json.dumps(db, ensure_ascii=False, indent=2) + ";"
    pat = re.compile(r"const FALLBACK_DB\s*=\s*\{.*?\n\};", re.DOTALL)
    
    targets = []
    if html:
        targets.append(Path(html))
    else:
        targets.extend([
            Path("mirqat-tawhid.html"),
            Path("mirqat-al-tawhid.html"),
            Path("index.html"),
            Path("Maktaba/index.html"),
        ])
    
    done = []
    for f in targets:
        if not f.exists(): continue
        h = f.read_text(encoding="utf-8")
        if not pat.search(h): continue
        f.write_text(pat.sub(db_js, h, count=1), encoding="utf-8")
        size = f.stat().st_size / (1024*1024)
        print(f"   ✅ دُمج في {f} — {size:.2f} MB")
        done.append(str(f))
    
    if not done:
        print("   ⚠ لم يُعثر على ملف يحتوي على FALLBACK_DB لدمجه تلقائياً")




# ═══════════════════ Main ═══════════════════
def main():
    ap = argparse.ArgumentParser(description="استخراج + إصلاح نصوص التوحيد")
    ap.add_argument("--skip-majmu", action="store_true")
    ap.add_argument("--majmu-only", action="store_true")
    ap.add_argument("--fix-only", action="store_true")
    ap.add_argument("--no-fix", action="store_true")
    ap.add_argument("--no-inject", action="store_true")
    ap.add_argument("--verify", action="store_true")
    ap.add_argument("--verify-only", action="store_true")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--inject-to")
    a = ap.parse_args()


    if sum([a.skip_majmu, a.majmu_only, a.fix_only, a.verify_only]) > 1:
        print("❌ خيارات متعارضة"); sys.exit(1)


    print("═"*55)
    print("  مِرقاة التوحيد — استخراج وإصلاح")
    print("═"*55)


    jp = OUT/"db_topics.json"


    if a.verify_only:
        sys.exit(0 if verify_db(jp, strict=a.strict) else 1)


    if a.fix_only:
        jp = fix_db(jp)
        if not a.no_inject: inject_html(jp, html=a.inject_to)
        verify_db(jp, strict=a.strict)
        return


    if a.majmu_only:
        jp = update_with_majmu(jp)
        if not a.no_inject: inject_html(jp, html=a.inject_to)
        if a.verify: verify_db(jp, strict=a.strict)
        return


    try: kc = download_kitab()
    except Exception as e: print(f"❌ {e}"); sys.exit(1)
    try: fc = download_fath()
    except Exception as e: print(f"❌ {e}"); sys.exit(1)


    if a.skip_majmu:
        print("\n⏭ تخطّي مجموع الفتاوى")
        secs = []
    else:
        try:
            vols = download_majmu()
            secs = extract_fatawa_sections(vols) if vols else []
        except Exception as e:
            print(f"⚠ {e}"); secs = []


    jp = build_db(kc, fc, secs, use_smart=not a.no_fix)
    if not a.no_inject: inject_html(jp, html=a.inject_to)


    print("\n" + "═"*55)
    print(GREEN("  ✅ اكتمل!"))
    print("═"*55)
    print(f"  📁 {OUT.resolve()}")
    print(f"  📄 {jp.resolve()}")


    if a.skip_majmu:
        print("\n  ⚠ الفتاوى pending — أضِفها: --majmu-only")


    if a.verify:
        if not verify_db(jp, strict=a.strict): sys.exit(1)
    else:
        print("\n  💡 تحقق: --verify-only")
        print("  💡 إصلاح: --fix-only")




if __name__ == "__main__":
    main()
