"""Blog FR (site/blog/) et EN (site/en/blog/), plan du site."""
import os, re, json, sys, io, contextlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B
from blog_posts import POSTS as FR_POSTS
from blog_posts_en import POSTS as EN_POSTS
import datetime, shutil
from zoneinfo import ZoneInfo
# Publication programmée : un article n'apparaît qu'à partir de sa date (heure de Paris).
TODAY = os.environ.get("JB_TODAY") or datetime.datetime.now(ZoneInfo("Europe/Paris")).date().isoformat()
_FR_DATE = {p["slug"]: p["date"] for p in FR_POSTS}
for _p in EN_POSTS: _p["date"] = _FR_DATE[_p["fr"]]
def _published(posts):
    live = [p for p in posts if p["date"] <= TODAY]
    return sorted(live, key=lambda p: p["date"], reverse=True)
FR_POSTS = _published(FR_POSTS); EN_POSTS = _published(EN_POSTS)
_LIVE = {p["slug"] for p in FR_POSTS} | {p["slug"] for p in EN_POSTS}
_ALL = set(_FR_DATE) | {p["slug"] for p in __import__("blog_posts_en").POSTS}
_HIDDEN = _ALL - _LIVE
def unlink_hidden(html):
    """Retire les liens vers les articles pas encore publiés (le texte reste)."""
    for slug in _HIDDEN:
        html = re.sub(r'<a href="[^"]*blog/' + re.escape(slug) + r'\.html">(.*?)</a>', r"\1", html)
    return html
with contextlib.redirect_stdout(io.StringIO()):
    import build_en as E          # reconstruit aussi les pages EN, et fournit les fonctions de traduction

OUT_FR = B.SITE + "/blog"; OUT_EN = B.SITE + "/en/blog"
for _d in (OUT_FR, OUT_EN): shutil.rmtree(_d, ignore_errors=True)
os.makedirs(OUT_FR, exist_ok=True); os.makedirs(OUT_EN, exist_ok=True)
EN_OF = {p["fr"]: p["slug"] for p in EN_POSTS}; FR_OF = {p["slug"]: p["fr"] for p in EN_POSTS}
MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
def fdate(d, en=False):
    y, m, j = d.split("-")
    return f"{int(j)} {MONTHS[int(m)-1]} {y}" if en else f"{int(j)} {MOIS[int(m)-1]} {y}"

T = {
 "fr": dict(blog="Le blog", read="de lecture", more="Lire l'article", also_l="À lire", also_h="Aussi", sign="Carl, pour JamBag",
            cta_l="Et pour votre", cta_h="Événement ?", cta_p="Racontez-nous votre projet, Carl vous rappelle.", cta_b="Composer mon événement",
            idx_title="Blog musique de mariage et d'événement | JamBag",
            idx_desc="Conseils pour la musique de votre mariage ou de votre événement d'entreprise : timing, chansons, technique, groupe ou DJ. Par le groupe live JamBag.",
            idx_h1=('Le blog', 'JamBag', " : conseils musique de mariage et d'événement"),
            idx_lead="Musique de mariage, événements d'entreprise, coulisses du live : ce que nous avons appris en plus de 300 concerts."),
 "en": dict(blog="The blog", read="read", more="Read the article", also_l="Keep", also_h="Reading", sign="Carl, for JamBag",
            cta_l="And for your", cta_h="Event?", cta_p="Tell us about your project, and Carl will call you back.", cta_b="Plan my event",
            idx_title="Wedding and event music blog | JamBag",
            idx_desc="Advice on music for your wedding or corporate event: timing, songs, sound, band or DJ. By the live band JamBag.",
            idx_h1=('The blog', 'JamBag', ": wedding and event music advice"),
            idx_lead="Wedding music, corporate events, life behind the stage: what we have learned in more than 300 concerts."),
}

def cta(L):
    return f'''<section class="sec orange cta-band grain">
  <div class="wrap">
    <h2 class="title" data-split><span class="light">{L["cta_l"]}</span><span class="heavy">{L["cta_h"]}</span></h2>
    <p class="lead" data-reveal>{L["cta_p"]}</p>
    <a class="btn btn-cream" href="devis.html" data-reveal>{L["cta_b"]}</a>
  </div>
</section>'''

def card(p, L, en):
    return (f'<a class="post-card" href="blog/{p["slug"]}.html" data-reveal><div class="pc-img"><img {{{{img:{p["img"]}}}}} alt="" loading="lazy"></div>'
            f'<div class="pc-txt"><span class="pc-meta">{fdate(p["date"], en)} · {p["read"]}</span><h2>{p["title"]}</h2><p>{p["desc"]}</p><span class="pc-more">{L["more"]}</span></div></a>')

ASSET = re.compile(r'^(img|css|js|fonts|video|fiches)/|^favicon')
def paths(html, en):
    def fix(m):
        k, v = m.group(1), m.group(2)
        if re.match(r'^(https?:|mailto:|tel:|#|/|data:|\.\./)', v): return m.group(0)
        if en and ASSET.match(v): return f'{k}="../../{v}"'
        if k == "data-srcs": return f'{k}="' + " ".join(("../../" if en else "../") + x for x in v.split()) + '"'
        return f'{k}="../{v}"'
    return re.sub(r'(src|href|poster|data-srcs|action)="([^"]*)"', fix, html)

def alternates(fr_path, en_path):
    return (f'<link rel="alternate" hreflang="fr" href="https://jambag.fr/{fr_path}">\n'
            f'<link rel="alternate" hreflang="en" href="https://jambag.fr/{en_path}">\n'
            f'<link rel="alternate" hreflang="x-default" href="https://jambag.fr/{fr_path}">\n')

def build_page(lang, path, title, desc, body, ld, fr_path, en_path, switch_href):
    en = lang == "en"
    h = B.head(title, desc, path, ld, "jambag-partage.jpg")
    h = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n)+', alternates(fr_path, en_path), h)
    html = h + B.header("blog/") + body + B.footer()
    html = re.sub(r"\{\{img:([^}]+)\}\}", lambda m: B.img_attr(m.group(1)), html)
    html = html.replace("{{LANGHREF}}", "SWITCH")
    if en:
        head, rest = html.split("</head>", 1)
        head = head.replace('<html lang="fr">', '<html lang="en">').replace('content="fr_FR"', 'content="en_GB"')
        parts = re.split(r"(<script\b.*?</script>)", rest, flags=re.S)
        for i in range(0, len(parts), 2):
            parts[i] = re.sub(r">([^<>]+)<", E.tr_text, parts[i])
            parts[i] = re.sub(E.ATTRS + r'="([^"]*)"', E.tr_attr, parts[i])
        html = head + "</head>" + "".join(parts)
        html = html.replace('hreflang="en" lang="en">EN</a>', 'hreflang="fr" lang="fr">FR</a>')
        html = html.replace("jambag-kit-entreprise.pdf", "jambag-company-kit.pdf")
    html = paths(html, en)
    html = re.sub(r'class="lang" href="[^"]*"', f'class="lang" href="{switch_href}"', html)
    assert "{{" not in html
    return unlink_hidden(html)

def build_lang(lang, posts, out):
    en = lang == "en"; L = T[lang]
    for i, p in enumerate(posts):
        others = [posts[(i + k) % len(posts)] for k in (1, 2, 3)]
        body = f'''<main id="main">
<section class="page-hero post-hero grain">
  <img {{{{img:{p["img"]}}}}} alt="" fetchpriority="high">
  <div class="shade"></div>
  <div class="wrap">
    <p class="post-kicker"><a href="blog/">{L["blog"]}</a> · {fdate(p["date"], en)} · {p["read"]} {L["read"]}</p>
    <h1 class="post-title">{p["title"]}</h1>
  </div>
</section>
<article class="sec post">
  <div class="wrap">
    <div class="post-body">
      <p class="post-lead">{p["lead"]}</p>
      {p["body"].strip()}
      <p class="post-sign">{L["sign"]}</p>
    </div>
  </div>
</article>
<section class="sec sand post-more">
  <div class="wrap">
    <h2 class="title sm"><span class="light">{L["also_l"]}</span><span class="heavy">{L["also_h"]}</span></h2>
    <div class="post-grid">{"".join(card(q, L, en) for q in others)}</div>
  </div>
</section>
{cta(L)}
</main>
'''
        if en: fr_path, en_path, switch = f"blog/{p['fr']}.html", f"en/blog/{p['slug']}.html", f"../../blog/{p['fr']}.html"
        else:  fr_path, en_path, switch = f"blog/{p['slug']}.html", f"en/blog/{EN_OF[p['slug']]}.html", f"../en/blog/{EN_OF[p['slug']]}.html"
        path = en_path if en else fr_path
        ld = '<script type="application/ld+json">' + json.dumps({
            "@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["desc"],
            "datePublished": p["date"], "dateModified": p["date"], "inLanguage": "en" if en else "fr-FR",
            "image": f"https://jambag.fr/img/{p['img']}.webp",
            "author": {"@type": "Person", "name": "Carl Stievenard"},
            "publisher": {"@id": "https://jambag.fr/#groupe"},
            "mainEntityOfPage": f"https://jambag.fr/{path}"}, ensure_ascii=False) + "</script>"
        html = build_page(lang, path, p["seo"], p["desc"], body, ld, fr_path, en_path, switch)
        open(f"{out}/{p['slug']}.html", "w", encoding="utf-8").write(html)
    h1 = L["idx_h1"]
    idx = f'''<main id="main">
<section class="sec night grain blog-head">
  <div class="wrap">
    <h1 class="title" data-split><span class="light">{h1[0]}</span><span class="heavy">{h1[1]}</span><span class="sr-only">{h1[2]}</span></h1>
    <p class="lead" data-reveal>{L["idx_lead"]}</p>
  </div>
</section>
<section class="sec">
  <div class="wrap"><div class="post-grid">{"".join(card(q, L, en) for q in posts)}</div></div>
</section>
{cta(L)}
</main>
'''
    switch = "../../blog/" if en else "../en/blog/"
    html = build_page(lang, "en/blog/" if en else "blog/", L["idx_title"], L["idx_desc"], idx, "", "blog/", "en/blog/", switch)
    open(f"{out}/index.html", "w", encoding="utf-8").write(html)

build_lang("fr", FR_POSTS, OUT_FR)
build_lang("en", EN_POSTS, OUT_EN)

# plan du site
pairs = [(u, "en/" + u) for u in ["", "formules.html", "mariages.html", "entreprises.html", "videos.html", "repertoire.html", "groupe.html", "technique.html", "devis.html", "blog/"]]
pairs = [(fr, en, "2026-10-21") for fr, en in pairs]
pairs += [(f"blog/{p['fr']}.html", f"en/blog/{p['slug']}.html", p["date"]) for p in EN_POSTS]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
for fr, en, mod in pairs:
    alt = f'<xhtml:link rel="alternate" hreflang="fr" href="https://jambag.fr/{fr}"/><xhtml:link rel="alternate" hreflang="en" href="https://jambag.fr/{en}"/>'
    for u in (fr, en):
        sm += f'  <url><loc>https://jambag.fr/{u}</loc><lastmod>{mod}</lastmod>{alt}</url>\n'
open(B.SITE + "/sitemap.xml", "w").write(sm + "</urlset>\n")
# llms.txt : sans les articles pas encore publiés
_llms = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "llms-src.txt"), encoding="utf-8").read().splitlines()
_llms = [l for l in _llms if not any(f"blog/{h}.html" in l for h in _HIDDEN)]
open(B.SITE + "/llms.txt", "w", encoding="utf-8").write("\n".join(_llms) + "\n")
print("blog ok", len(FR_POSTS), len(EN_POSTS))
