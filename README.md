# jambag.fr

Site du groupe JamBag.

- `pages/` : contenu des pages françaises
- `blog_posts.py` / `blog_posts_en.py` : articles du blog (un article apparaît en ligne à partir de sa `date`)
- `site/` : images, polices, styles, scripts et fichiers fixes ; les pages HTML y sont reconstruites
- Construction : `python build_blog.py` (reconstruit les pages FR, EN et le blog)

À chaque modification de `main`, et chaque matin, GitHub reconstruit le site et le publie sur la branche `deploy`.
OVH met en ligne le contenu de `deploy` dans le dossier `www`.
