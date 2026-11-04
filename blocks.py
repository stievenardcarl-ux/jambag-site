"""Blocs réutilisables de la V4 (médiator, logos, carte des mariages, technique)."""
import math
import numpy as np
from PIL import Image

import os; SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")


def img_attr(name):
    rel = name if "." in name else name + ".webp"
    w, h = Image.open(f"{SITE}/img/{rel}").size
    return f'src="img/{rel}" width="{w}" height="{h}"'


LOGO_LIST = [("ingram-micro", "Ingram Micro"), ("barriere", "Groupe Barrière"), ("club-med", "Club Med"),
             ("printemps", "Printemps"), ("studios-lamy", "Studios Lamy"), ("preset", "PRESET"), ("argenx", "argenx"),
             ("lesaffre", "Lesaffre"), ("jaecoo", "Jaecoo"), ("assurance-maladie", "L'Assurance Maladie"),
             ("sagarmatha", "Sagarmatha"), ("like-event", "Like Event"), ("martin-prod", "Martin Prod"),
             ("kombustache", "Kombustache")]


def logo_h(path):
    """Hauteur d'affichage pour que chaque logo ait le même poids visuel."""
    a = np.asarray(Image.open(path).convert("RGBA").getchannel("A"))
    ys, xs = np.where(a > 40)
    w, h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
    ink = (a > 40).mean()
    area = 5200 * (0.36 / max(ink, 0.12)) ** 0.35
    return max(22, min(64, math.sqrt(area / (w / h))))


def LOGOS(folder="logos-brun", title="Ils nous ont fait confiance"):
    imgs = ""
    for i, (f, alt) in enumerate(LOGO_LIST):
        h = logo_h(f"{SITE}/img/{folder}/{f}.png")
        imgs += f'<img {img_attr(folder + "/" + f + ".png")} alt="{alt}" loading="lazy" style="--h:{h:.0f}px;--d:{i % 5};--z:{((i*37)%5-2)*18}px" data-reveal>'
    return (f'<div class="logos-block"><p class="logos-k" data-reveal>{title}</p>'
            f'<div class="logo-row">{imgs}</div></div>')


def LOCKUP_INNER():
    return ('<div class="lockup"><span class="tag top">Pop-Rock Band</span><span class="mask">'
            f'<img {img_attr("jambag-logo.png")} alt=""></span><span class="tag bottom">Timeless hits</span></div>')


def PICK():
    edges = "".join(f'<i class="pk-edge" style="--z:{-z}"></i>' for z in range(1, 7))
    return ('<div class="pick3d" aria-hidden="true"><div class="pk-body">'
            f'<i class="pk-edge back" style="--z:-7"></i>{edges}'
            f'<div class="pk-face"><div class="pk-in">{LOCKUP_INNER()}</div><i class="pk-shine"></i></div>'
            '</div><div class="pk-shadow"></div></div>')


MOMENT_ROWS = [
    ("Cérémonie", "vers 16 h", "Laïque ou religieuse, entièrement personnalisable : entrée, échange des alliances, sortie. Nous apprenons les chansons qui vous ressemblent.", "Solo ou duo acoustique"),
    ("Vin d'honneur", "vers 17 h", "Une ambiance chaleureuse, lounge ou déjà festive, qui laisse respirer les conversations puis fait se lever les premiers danseurs.", "Duo ou trio"),
    ("Soirée dansante", "vers 22 h", "Le quartet prend la piste. Deux heures de live où trois générations chantent les mêmes refrains.", "Quartet"),
    ("Jusqu'au bout de la nuit", "après le live", "Nos DJs partenaires prennent le relais, sans temps mort.", "Option DJ"),
]


def MOMENTS(head="La carte"):
    out = f'<div class="carte-stage" data-reveal><div class="carte"><p class="carte-h">{head}</p>'
    for n, w, d, f in MOMENT_ROWS:
        out += (f'<article class="mom"><div class="mom-top"><h3>{n}</h3><span class="dots" aria-hidden="true"></span>'
                f'<span class="f">{f}</span></div><span class="when">{w}</span><p>{d}</p></article>')
    return out + '</div></div>'


def TECH(cid="production"):
    return f"""<section class="sec night prod grain" id="{cid}" data-chapter="La technique">
  <div class="beams" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap">
    <div class="split-head">
      <h2 class="title" data-split><span class="light">Un vrai son de concert,</span><span class="heavy">Partout</span></h2>
      <p class="lead" data-reveal>Un groupe n'est jamais meilleur que le son qui le porte. Trois façons d'y arriver.</p>
    </div>
    <div class="tech">
      <article class="tcard rec" data-reveal><div class="tph"><img {img_attr("scene-projecteur")} alt="Une grande scène éclairée par les projecteurs" loading="lazy"><span class="badge">Recommandé</span><span class="tnum">1</span></div><div class="ttx"><h3>La technique du lieu</h3><p class="sub">Votre lieu ou votre agence a son prestataire.</p><p>Il installe le son et la lumière selon notre fiche technique. Nous arrivons, nous jouons : c'est là que le show donne le meilleur de lui-même.</p></div></article>
      <article class="tcard" data-reveal style="--d:1"><div class="tph"><img {img_attr("scene-salut")} alt="Le groupe salue sur une scène équipée de lumières" loading="lazy"><span class="tnum">2</span></div><div class="ttx"><h3>Notre partenaire technique</h3><p class="sub">Rien n'est prévu sur place ?</p><p>Nous faisons venir notre prestataire : scène, son, lumières et technicien. Une production complète, chiffrée à part.</p></div></article>
      <article class="tcard" data-reveal style="--d:2"><div class="tph"><img {img_attr("jour-chateau-2")} alt="Le trio joue en plein air avec sa propre sonorisation" loading="lazy"><span class="tnum">3</span></div><div class="ttx"><h3>En autonomie</h3><p class="sub">Pour les formats plus légers.</p><p>Nous venons avec notre sonorisation et un éclairage d'appoint. Idéal pour une cérémonie, un cocktail ou un petit comité.</p></div></article>
    </div>
    <div class="dl" data-reveal><p class="dl-k">Fiches techniques</p><div class="dl-row">""" + "".join(f'<a href="fiches/jambag-fiche-technique-{s}.pdf" target="_blank" rel="noopener">{n}<span aria-hidden="true">↓</span></a>' for s, n in [("solo","Solo"),("duo","Duo"),("trio-cajon","Trio cajon"),("trio-batterie","Trio batterie"),("quartet","Quartet"),("grande-formation","Grande formation")]) + """</div></div>
  </div>
</section>"""


ARTISTS = [("queen", "Queen"), ("bruno-mars", "Bruno Mars"), ("maneskin", "Måneskin"), ("celine-dion", "Céline Dion"),
           ("stevie-wonder", "Stevie Wonder"), ("clara-luciani", "Clara Luciani"), ("ed-sheeran", "Ed Sheeran"),
           ("telephone", "Téléphone"), ("michael-jackson", "Michael Jackson"), ("juliette-armanet", "Juliette Armanet"),
           ("red-hot-chili-peppers", "Red Hot Chili Peppers"), ("gims", "Gims")]


def ARTISTS_BLOCK():
    tiers = [["Queen", "Bruno Mars", "Måneskin"],
             ["Céline Dion", "Stevie Wonder", "Clara Luciani", "Ed Sheeran"],
             ["Téléphone", "Michael Jackson", "Juliette Armanet", "Red Hot Chili Peppers", "Gims", "Earth, Wind & Fire", "Gloria Gaynor", "Coldplay"]]
    out = '<div class="lineup">'
    for t, names in enumerate(tiers):
        out += f'<p class="lu lu{t+1}" data-reveal style="--d:{t}">' + '<i aria-hidden="true">·</i>'.join(f'<span>{n.replace("&", "&amp;")}</span>' for n in names) + '</p>'
    return out + '<p class="lu-more" data-reveal style="--d:3">et bien d\'autres, des années 70 à aujourd\'hui</p></div>'

def LIVETONIGHT():
    return f"""<aside class="lt" data-reveal aria-labelledby="lt-t">
  <div class="lt-ph"><img {img_attr("clarisse-livetonight")} alt="Clarisse, notre contact chez Live Tonight" loading="lazy"><span class="lt-cap">Clarisse, notre contact chez Live Tonight</span></div>
  <div class="lt-tx">
    <p class="lt-k">Notre producteur</p>
    <h3 class="lt-h" id="lt-t">Live Tonight, en coulisses</h3>
    <p>En France, un musicien intermittent doit être salarié par une société de production pour chaque concert. Pour JamBag, ce rôle est tenu par Live Tonight.</p>
    <p>Même quand vous nous réservez en direct, votre date passe par eux : fiches de paie, déclarations et cadre légal du spectacle. Leur commission, d'environ 10 %, finance ce travail.</p>
    <ul class="lt-l"><li>Des musiciens déclarés</li><li>Un salaire juste</li><li>Un concert dans les règles</li></ul>
  </div>
</aside>"""
