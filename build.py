import os, re, json, shutil
from blocks import LOGOS, PICK, MOMENTS, TECH, ARTISTS_BLOCK
from PIL import Image
import os; ROOT=os.path.dirname(os.path.abspath(__file__)); SITE=ROOT+"/site"; PAGES=ROOT+"/pages"

def img_attr(name):
    # name: "jour-chateau" -> img/jour-chateau.webp ; "cut/carl" ; "logos/preset.png" ; "mediator.png"
    rel = name if "." in name else name+".webp"
    p=f"{SITE}/img/{rel}"
    w,h=Image.open(p).size
    return f'src="img/{rel}" width="{w}" height="{h}"'

STAR='<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z"/></svg>'
STARS='<span class="stars" role="img" aria-label="5 étoiles sur 5">'+STAR*5+'</span>'
ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'

NAV=[("formules.html","Formules"),("mariages.html","Mariages"),("entreprises.html","Entreprises"),("videos.html","Vidéos"),("repertoire.html","Répertoire"),("groupe.html","Le groupe"),("blog/","Blog")]
TEL='<a href="tel:+33661579154">06 61 57 91 54</a>'
CALL_PICK=lambda: f'''<aside class="callpick" aria-label="Appeler Carl" hidden>
  <button class="cp-open" type="button" aria-expanded="false" aria-controls="cp-card"><span class="cp-pick"><img {img_attr("carl-call.png")} alt="" loading="lazy"></span><span class="cp-l">Une question ?</span></button>
  <div class="cp-card" id="cp-card" hidden>
    <button class="cp-x" type="button" aria-label="Fermer">×</button>
    <p class="cp-h">Une question ?<br><b>Carl vous répond.</b></p>
    <p class="cp-p">Du lundi au samedi, de 9 h à 21 h.</p>
    <a class="btn btn-ember" href="tel:+33661579154">Appeler Carl</a>
    <a class="cp-alt" href="devis.html">Ou composez votre événement</a>
  </div>
</aside>'''


def head(title, desc, canon, extra="", og="jambag-partage.jpg"):
    url=f"https://jambag.fr/{canon}"
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
{"" if 'name="robots"' in extra else '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="fr" href="https://jambag.fr/{canon}">
<link rel="alternate" hreflang="en" href="https://jambag.fr/en/{canon}">
<link rel="alternate" hreflang="x-default" href="https://jambag.fr/{canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="JamBag">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://jambag.fr/img/{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#22130D">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="favicon.png">
<link rel="preload" href="fonts/archivo.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="fonts/barlow-Light.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="css/site.css">
{extra}
</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
'''

def header(cur):
    links="".join(f'<a href="{h}"{" aria-current=\"page\"" if h==cur else ""}>{t}</a>' for h,t in NAV)
    mlinks="".join(f'<a href="{h}">{t}</a>' for h,t in NAV)
    return f'''<header class="site-header">
  <div class="bar">
    <a class="brand" href="./" aria-label="JamBag, accueil"><img {img_attr("jambag-logo.png")} alt="JamBag"></a>
    <nav class="nav" aria-label="Navigation principale">{links}</nav>
    <div class="bar-right">
      <a class="lang" href="{{{{LANGHREF}}}}" hreflang="en" lang="en">EN</a>
      <a class="btn btn-cream" href="devis.html">Demander un devis</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><i></i></button>
    </div>
  </div>
</header>
<nav class="menu" id="menu" aria-label="Menu">
  {mlinks}<a href="devis.html">Demander un devis</a><a class="lang" href="{{{{LANGHREF}}}}" hreflang="en" lang="en">EN</a>
  <div class="menu-foot"><a href="mailto:hello@jambag.fr">hello@jambag.fr</a><br><a href="tel:+33661579154">06 61 57 91 54</a></div>
</nav>
'''

LOCKUP=lambda: f'''<div class="lockup" role="img" aria-label="JamBag, Pop-Rock Band, Timeless hits"><span class="tag top" aria-hidden="true">Pop-Rock Band</span><span class="mask"><img {img_attr("jambag-logo.png")} alt=""></span><span class="tag bottom" aria-hidden="true">Timeless hits</span></div>'''

def footer():
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="foot">
      <div>
        {LOCKUP()}
        <p>Groupe pop-rock live basé à Lille. Mariages, réceptions, événements d'entreprise et grandes scènes, en France et à l'international.</p>
      </div>
      <nav aria-label="Le site"><h4>Le site</h4>{"".join(f'<a href="{h}">{t}</a>' for h,t in NAV)}<a href="technique.html">Technique et fiches</a><a href="devis.html">Composer mon événement</a></nav>
      <nav aria-label="Contact"><h4>Contact</h4><a href="mailto:hello@jambag.fr">hello@jambag.fr</a><a href="tel:+33661579154">06 61 57 91 54</a><a href="https://www.instagram.com/jambagmusic/" target="_blank" rel="noopener">Instagram @jambagmusic</a></nav>
      <div><h4>Basés à Lille</h4><p style="margin:0">Hauts-de-France, Paris, Belgique, Côte d'Opale, partout en France et à l'international.</p></div>
    </div>
    <div class="legal">
      <span>© <span id="year">2026</span> JamBag. <a href="mentions-legales.html">Mentions légales</a></span>
      <details class="credits"><summary>Crédits photo</summary><ul><li>Scènes et concerts : One Clap Studio</li><li>Cocktail en extérieur : Paul Sauvage</li><li>Portrait acoustique : Benoît Dechy</li><li>Mariage en salle : Julien Briche</li><li>Mariage d'Alix et Charles : Marie Guillaume</li></ul></details>
    </div>
    <div class="foot-mark" aria-hidden="true"><img {img_attr("jambag-logo.png")} alt="" loading="lazy"></div>
  </div>
</footer>
<div class="vmodal" role="dialog" aria-modal="true" aria-label="Vidéo"><button class="close" type="button" aria-label="Fermer la vidéo">×</button><div class="box"></div><p class="alt">La vidéo ne s'affiche pas ? <a href="#" target="_blank" rel="noopener">Ouvrir sur YouTube</a></p></div>
{CALL_PICK()}
<script src="js/site.js" defer></script>
</body>
</html>
'''

def render(name, title, desc, canon, cur, extra_head="", og="jambag-partage.jpg"):
    body=open(f"{PAGES}/{name}",encoding="utf-8").read()
    body=re.sub(r"\{\{img:([^}]+)\}\}", lambda m: img_attr(m.group(1)), body)
    body=body.replace("{{STARS}}",STARS).replace("{{ARROW}}",ARROW).replace("{{LOCKUP}}",LOCKUP())
    body=body.replace("{{PICK}}",PICK()).replace("{{LOGOS}}",LOGOS()).replace("{{MOMENTS}}",MOMENTS()).replace("{{TECH}}",TECH()).replace("{{ARTISTS}}",ARTISTS_BLOCK())
    html=head(title,desc,canon,extra_head,og)+header(cur)+body+footer()
    html=html.replace("{{LANGHREF}}","en/"+("" if name in ("index.html","404.html") else name))
    assert "{{" not in html, name
    open(f"{SITE}/{name}","w",encoding="utf-8").write(html)

if __name__=="__main__":
    ld=json.load(open(ROOT+"/ld.json",encoding="utf-8"))
    J=lambda obj: '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False)+'</script>'
    def crumbs(name,path): return J({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Accueil","item":"https://jambag.fr/"},
        {"@type":"ListItem","position":2,"name":name,"item":"https://jambag.fr/"+path}]})
    G=J(ld["group"])
    render("index.html","JamBag | Groupe de musique live à Lille, mariages et événements",
           "JamBag, groupe pop-rock live basé à Lille. Solo, duo, trio, quartet ou grande formation pour mariages, soirées et événements d'entreprise, partout en France.",
           "","./",G+J(ld["website"])+J(ld["faq"])+'<link rel="preload" as="image" href="video/fond-1.jpg" fetchpriority="high">')
    render("mariages.html","Groupe de musique pour mariage à Lille et dans le Nord | JamBag",
           "Cérémonie, vin d'honneur, soirée dansante : JamBag, groupe live pour mariage basé à Lille, accompagne votre journée du premier verre au dernier morceau.",
           "mariages.html","mariages.html",G+J(ld["service_mariage"])+J(ld["faq_mariage"])+crumbs("Mariages","mariages.html"),og="partage-mariages.jpg")
    render("entreprises.html","Groupe live pour soirée d'entreprise à Lille | JamBag",
           "Show pop-rock, jam d'entreprise, blind test live : JamBag, groupe basé à Lille, fait vivre un moment fort à vos équipes, en France et à l'international.",
           "entreprises.html","entreprises.html",G+J(ld["service_entreprise"])+crumbs("Entreprises","entreprises.html"),og="partage-entreprises.jpg")
    render("groupe.html","Les musiciens de JamBag | Groupe pop-rock à Lille",
           "Carl, Quentin, Simon, Stanley et la famille JamBag : des musiciens professionnels de la région lilloise, formés ensemble à Tourcoing.",
           "groupe.html","groupe.html",G+crumbs("Le groupe","groupe.html"),og="partage-groupe.jpg")
    render("formules.html","Formules et tarifs : solo, duo, trio, quartet | JamBag",
           "Chanteur guitare-voix, duo acoustique, trio ou quartet pop-rock : les formules et tarifs de JamBag, groupe live basé à Lille, pour mariages et événements.",
           "formules.html","formules.html",G+crumbs("Formules","formules.html"))
    render("videos.html","Vidéos live de JamBag | Groupe pop-rock à Lille",
           "Le quartet, le trio, le duo et les solos de JamBag en vidéo : mariages, soirées, grandes scènes. Montez le son.",
           "videos.html","videos.html",G+crumbs("Vidéos","videos.html"))
    render("technique.html","Technique et fiches techniques | JamBag",
           "Son, lumière, installation : comment JamBag s'adapte à votre lieu. Téléchargez les fiches techniques du solo, du duo, du trio et du quartet.",
           "technique.html","technique.html",G+crumbs("Technique","technique.html"))
    render("devis.html","Demander un devis | JamBag, groupe live à Lille",
           "Composez votre événement en deux minutes : date, lieu, ambiance, formule. Carl vous rappelle très vite avec une proposition sur mesure.",
           "devis.html","devis.html",G+crumbs("Demander un devis","devis.html"))
    render("repertoire.html","Répertoire de reprises pop-rock et variété | JamBag",
           "Les setlists de JamBag : soirée dansante, cocktail acoustique, cérémonie et bonus latino. Des tubes intemporels, des années 70 à aujourd'hui.",
           "repertoire.html","repertoire.html",G+crumbs("Répertoire","repertoire.html"))
    print("ok")

render("mentions-legales.html","Mentions légales | JamBag","Mentions légales du site jambag.fr.","mentions-legales.html","",'<meta name="robots" content="noindex, follow">')

render("404.html","Page introuvable | JamBag","Cette page n'existe pas ou plus.","404.html","",'<base href="/"><meta name="robots" content="noindex">')
