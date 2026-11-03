"""Version anglaise : traduit les pages françaises construites et les écrit dans site/en/."""
import os, re, json, html as H
ROOT = os.path.dirname(os.path.abspath(__file__)); SITE = ROOT + "/site"; OUT = SITE + "/en"
os.makedirs(OUT, exist_ok=True)

SRC = json.load(open(ROOT + "/i18n-src.json", encoding="utf-8"))
ns = {}; exec(open(ROOT + "/i18n-en.py", encoding="utf-8").read(), ns); EN = ns["EN"]
ns2 = {}; exec(open(ROOT + "/i18n-extra.py", encoding="utf-8").read(), ns2); EXTRA = ns2["EXTRA"]
D = dict(zip(SRC, EN)); D.update(EXTRA)
DU = {H.unescape(k): v for k, v in D.items()}

PAGES = {
 "index.html": ("JamBag | Live band from France for weddings and events worldwide",
                "JamBag, a live pop-rock band from France. Solo, duo, trio, quartet or full band for weddings, parties and corporate events across Europe and beyond."),
 "mariages.html": ("Live wedding band from France, across Europe | JamBag",
                "Ceremony, drinks reception, dance party: JamBag, a live wedding band from France, plays your day from the first glass to the last song, wherever you celebrate."),
 "entreprises.html": ("Live band for corporate events in France and Europe | JamBag",
                "Pop-rock show, corporate jam, live music quiz: JamBag, a band from France, gives your teams a standout moment wherever your event takes place."),
 "groupe.html": ("The JamBag musicians | Live pop-rock band from France",
                "Carl, Quentin, Simon, Stanley and the JamBag family: professional musicians from northern France who trained together."),
 "repertoire.html": ("Repertoire of pop-rock covers | JamBag",
                "JamBag's setlists: dance party, acoustic cocktail, ceremony, a French set and a Latin bonus. Timeless hits from the 70s to today."),
 "mentions-legales.html": ("Legal notice | JamBag", "Legal notice for jambag.fr."),
}

FR_ARTISTS = {"Téléphone","Axelle Red","Clara Luciani","Eddy Mitchell","Gilbert Montagné","Amel Bent","Gims","Juliette Armanet",
 "Corneille","Disiz","Christophe Maé","Sinsemilia","De Palmas","Calogero","Un monstre à Paris","BB Brunes","Jean-Jacques Goldman",
 "Cookie Dingler","Véronique Sanson","La Compagnie Créole","Hugues Aufray","La Reine des neiges","Johnny Hallyday","Michel Delpech",
 "Mylène Farmer","Michel Fugain","Dalida"}
FR_TITLES = {"Pour que tu m&#x27;aimes encore","J&#x27;irai où tu iras","Dans les yeux d&#x27;Émilie"}
SWAP = {"Clara Luciani":"Elton John","Téléphone":"The Beatles","Juliette Armanet":"Pharrell Williams","Gims":"Oasis",
        "Eddy Mitchell":"Michael Jackson","Axelle Red":"Coldplay","Amel Bent":"Billie Eilish","Gilbert Montagné":"Charles Aznavour"}

def is_fr(li):
    t = re.search(r"<b>(.*?)</b>", li).group(1); a = re.search(r"<span>(.*?)</span>", li).group(1)
    return a in FR_ARTISTS or t in FR_TITLES

def rework_repertoire(s):
    french = []; seen = set()
    def panel(m):
        ul = m.group(0)
        items = re.findall(r'<li data-s=.*?</li>', ul)
        keep = []
        for li in items:
            if is_fr(li):
                k = re.sub(r' class="[^"]*"', "", li)
                if k not in seen: seen.add(k); french.append(k)
            else: keep.append(li)
        empty = re.search(r'<li class="empty".*?</li>', ul).group(0)
        return '<ul class="setlist">' + "".join(keep) + empty + "</ul>"
    s = re.sub(r'<ul class="setlist">.*?</ul>', panel, s, flags=re.S)
    # recount tabs
    def count_for(pid):
        m = re.search(r'id="' + pid + r'".*?<ul class="setlist">(.*?)</ul>', s, re.S)
        return len(re.findall(r"<li data-s", m.group(1)))
    for pid in re.findall(r'aria-controls="(p-[a-z]+)"', s):
        n = count_for(pid)
        s = re.sub(r'(aria-controls="' + pid + r'" type="button">[^<]*<small>)\d+(</small>)', lambda m: m.group(1) + str(n) + m.group(2), s)
    # French set tab + panel
    empty = '<li class="empty" hidden>No matching song. Just ask: if a song means a lot to you, we\'ll learn it for you.</li>'
    tab = f'<button class="tab" role="tab" id="t-francais" aria-controls="p-francais" type="button">French set<small>{len(french)}</small></button>'
    s = re.sub(r'(<button class="tab" role="tab" id="t-latino".*?</button>)', lambda m: tab + m.group(1), s, count=1, flags=re.S)
    pan = ('<div class="rep-panel" id="p-francais" role="tabpanel" aria-labelledby="t-francais" hidden><p class="panel-desc">'
           'A touch of Paris: the French songs your French-speaking guests will sing word for word, in pop-rock versions.</p>'
           '<ul class="setlist">' + "".join(french) + empty + "</ul></div>")
    s = s.replace('<div class="rep-panel" id="p-latino"', pan + '<div class="rep-panel" id="p-latino"', 1)
    for a, b in SWAP.items():
        s = s.replace(f"<span>{a}</span><i", f"<span>{b}</span><i").replace(f"<span>{a}</span></p>", f"<span>{b}</span></p>")
    return s

def rework_index(s):
    for a, b in SWAP.items():
        s = s.replace(f"<li>{a}</li>", f"<li>{b}</li>")
    return s

missing = set()

def tr_text(m):
    raw = m.group(1); s = raw.strip()
    if not s: return m.group(0)
    if s in D: out = D[s]
    elif H.unescape(s) in DU: out = DU[H.unescape(s)]
    else:
        if re.search(r"[a-zA-Zà-ÿ]{3}", s): missing.add(s)
        return m.group(0)
    lead = raw[:len(raw) - len(raw.lstrip())]; trail = raw[len(raw.rstrip()):]
    return ">" + lead + out + trail + "<"

ATTRS = r'(alt|aria-label|placeholder|title|value|data-chapter|data-label|data-s)'
def tr_attr(m):
    k, v = m.group(1), m.group(2)
    if v in D: return f'{k}="{D[v].replace(chr(34), "&quot;")}"'
    if H.unescape(v) in DU: return f'{k}="{DU[H.unescape(v)].replace(chr(34), "&quot;")}"'
    if k != "data-s" and re.search(r"[a-zA-Zà-ÿ]{3}", v) and not v.startswith(("http", "#")): missing.add("@" + v)
    return m.group(0)

PAGE_LINK = re.compile(r'^(\./(#.*)?|[\w-]+\.html(#.*)?|blog/([\w-]+\.html)?)$')
def fix_path(m):
    k, v = m.group(1), m.group(2)
    if k == "data-srcs": return f'{k}="' + " ".join("../" + x for x in v.split()) + '"'
    if re.match(r'^(https?:|mailto:|tel:|#|/|data:|\.\./)', v) or PAGE_LINK.match(v): return m.group(0)
    return f'{k}="../{v}"'

def tr_ld(m):
    obj = json.loads(m.group(1))
    def walk(o):
        if isinstance(o, dict): return {k: walk(v) for k, v in o.items()}
        if isinstance(o, list): return [walk(x) for x in o]
        if isinstance(o, str):
            if o in DU: return DU[o]
            if o in D: return D[o]
            return EXTRA.get("LD:" + o, o)
        return o
    obj = walk(obj)
    if obj.get("@type") == "WebSite": obj["inLanguage"] = "en"; obj["url"] = "https://jambag.fr/en/"
    if obj.get("@type") == "BreadcrumbList":
        for it in obj["itemListElement"]:
            it["item"] = it["item"].replace("https://jambag.fr/", "https://jambag.fr/en/")
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + "</script>"

for name, (title, desc) in PAGES.items():
    s = open(f"{SITE}/{name}", encoding="utf-8").read()
    head, body = s.split("</head>", 1)
    # head
    head = head.replace('<html lang="fr">', '<html lang="en">')
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head)
    head = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*', lambda m: m.group(1) + desc.replace('"', "&quot;"), head)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + title, head)
    head = head.replace('content="fr_FR"', 'content="en_GB"')
    head = re.sub(r'(rel="canonical" href="https://jambag\.fr/)', r"\1en/", head)
    head = re.sub(r'(property="og:url" content="https://jambag\.fr/)', r"\1en/", head)
    head = re.sub(r'<script type="application/ld\+json">(.*?)</script>', tr_ld, head, flags=re.S)
    head = re.sub(r'<base href="/">', '<base href="/en/">', head)
    body = re.sub(r"(<li data-s[^>]*>.*?</li>)", lambda m: m.group(1).replace(" et ", " &amp; "), body)
    parts = re.split(r"(<script\b.*?</script>|<ul class=\"setlist\">.*?</ul>)", body, flags=re.S)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r">([^<>]+)<", tr_text, parts[i])
        parts[i] = re.sub(ATTRS + r'="([^"]*)"', tr_attr, parts[i])
    for i in range(1, len(parts), 2):
        if parts[i].startswith("<ul"):
            parts[i] = re.sub(r'(<li class="empty" hidden>)(.*?)(</li>)', lambda m: m.group(1) + D.get(m.group(2), m.group(2)) + m.group(3), parts[i])
            parts[i] = parts[i].replace("<span>traditionnel</span>", "<span>traditional</span>")
    body = "".join(parts)
    s = head + "</head>" + body
    # language switch: FR <-> EN
    fr_target = "../" + ("" if name == "index.html" else name)
    s = s.replace('class="lang" href="en/' + ("" if name == "index.html" else name) + '"', 'class="lang" href="' + fr_target + '"')
    s = s.replace('hreflang="en" lang="en">EN</a>', 'hreflang="fr" lang="fr">FR</a>')
    # paths
    if name != "404.html":
        s = re.sub(r'(src|href|poster|data-srcs|action)="([^"]*)"', fix_path, s)
    s = s.replace("jambag-kit-entreprise.pdf", "jambag-company-kit.pdf")
    if name == "repertoire.html": s = rework_repertoire(s)
    if name == "index.html": s = rework_index(s)
    open(f"{OUT}/{name}", "w", encoding="utf-8").write(s)

if missing:
    print("NON TRADUIT :", len(missing))
    for x in sorted(missing): print("  ", x[:120])
print("en ok")
