"""Troca as fontes do Google por arquivos locais (assets/fonts) em todas as páginas.
Rodar uma vez, de dentro de ~/ORA-site: python3 ferramentas/fontes_locais.py"""
import glob, re

FACES = """/* fontes locais (EB Garamond e Lato, licença OFL), só o alfabeto latino */
@font-face{font-family:'EB Garamond';font-style:normal;font-weight:400 500;font-display:swap;src:url(../assets/fonts/garamond.woff2) format('woff2')}
@font-face{font-family:'EB Garamond';font-style:italic;font-weight:400 500;font-display:swap;src:url(../assets/fonts/garamond-italico.woff2) format('woff2')}
@font-face{font-family:'Lato';font-style:normal;font-weight:400;font-display:swap;src:url(../assets/fonts/lato-400.woff2) format('woff2')}
@font-face{font-family:'Lato';font-style:normal;font-weight:700;font-display:swap;src:url(../assets/fonts/lato-700.woff2) format('woff2')}
"""

css = open('css/ora.css').read()
if '@font-face' not in css:
    open('css/ora.css', 'w').write(FACES + css)

PRELOAD = ('<link rel="preload" href="assets/fonts/garamond.woff2" as="font" type="font/woff2" crossorigin>'
           '<link rel="preload" href="assets/fonts/lato-400.woff2" as="font" type="font/woff2" crossorigin>')
for f in glob.glob('*.html'):
    s = open(f).read()
    s2 = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\s*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\s*', '', s)
    s2 = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">', PRELOAD, s2)
    if s2 != s:
        open(f, 'w').write(s2)
        print('ok', f)
