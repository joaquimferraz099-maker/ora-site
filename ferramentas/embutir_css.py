"""Embute css/ora.css dentro de cada página (evita uma requisição que trava a primeira pintura).

O arquivo-fonte continua sendo css/ora.css. Depois de editar o CSS, rode, de dentro de ~/ORA-site:
    python3 ferramentas/embutir_css.py
"""
import glob, os, re

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
css = open('css/ora.css').read().replace('../assets/', 'assets/')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s*\n\s*', '\n', css).strip()
bloco = f'<style id="ora-css">\n{css}\n</style>'

for f in glob.glob('*.html'):
    s = open(f).read()
    s2 = re.sub(r'<link rel="stylesheet" href="css/ora\.css[^"]*">', lambda m: bloco, s)
    s2 = re.sub(r'<style id="ora-css">.*?</style>', lambda m: bloco, s2, flags=re.S)
    if s2 != s:
        open(f, 'w').write(s2)
        print('ok', f)
