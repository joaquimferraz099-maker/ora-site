"""Otimiza as fotos do site: gera WebP (até 1600 px) e uma versão de 800 px para celular,
e atualiza as referências nas páginas (srcset, largura e altura, carregamento sob demanda).

Uso, de dentro de ~/ORA-site, com Python que tenha Pillow:
    python3 ferramentas/imagens.py

Para trocar uma foto (por exemplo, a foto real da embalagem): salve a foto nova em
assets/originais/ com o MESMO nome da antiga (ex.: pacote-natural.png) e rode o comando.
Os originais em alta ficam em assets/originais/ e não são carregados pelo site.
"""
import glob, os, re, shutil
from PIL import Image
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from grade import grade, tratar

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
ORIG = 'assets/originais'
os.makedirs(ORIG, exist_ok=True)
MAX, MEIO, PEQ, Q = 1600, 800, 400, 74

# 1. move os originais (jpg/png) para assets/originais
for pasta in ('assets/img', 'assets/video'):
    for f in glob.glob(f'{pasta}/*.jpg') + glob.glob(f'{pasta}/*.jpeg') + glob.glob(f'{pasta}/*.png'):
        destino = os.path.join(ORIG, os.path.relpath(f, 'assets').replace('/', '__'))
        shutil.move(f, destino)

# 2. gera os WebP a partir dos originais (e re-encoda WebP grandes já existentes)
dims = {}
def gera(src, base, tratada=False):
    im = Image.open(src)
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if tratada:  # mesma correção de cor em todas as fotos de banco (ver ferramentas/grade.py)
        im = grade(im)
    w, h = im.size
    for alvo, nome in ((MAX, f'{base}.webp'), (1200, f'{base}-1200.webp'), (MEIO, f'{base}-800.webp'), (PEQ, f'{base}-400.webp')):
        if nome.endswith('-1200.webp') and w <= 1300:
            continue
        k = min(1, alvo / w)
        im.resize((round(w * k), round(h * k)), Image.LANCZOS).save(nome, 'WEBP', quality=Q, method=6)
    k = min(1, MAX / w)
    dims[os.path.basename(base)] = (round(w * k), round(h * k))

for f in sorted(glob.glob(f'{ORIG}/*')):
    pasta, nome = os.path.basename(f).split('__', 1)
    gera(f, os.path.join('assets', pasta, os.path.splitext(nome)[0]), pasta == 'img' and tratar(nome))
for f in glob.glob('assets/img/*.webp'):
    base = f[:-5]
    if base.endswith(('-800', '-400', '-1200')) or os.path.basename(base) in dims:
        continue
    w, h = Image.open(f).size
    dims[os.path.basename(base)] = (w, h)
    if not os.path.exists(base + '-400.webp') or (w > 1300 and not os.path.exists(base + '-1200.webp')):
        gera(f, base + '.tmp')
        os.replace(base + '.tmp.webp', f)
        for suf in ('-1200', '-800', '-400'):
            if os.path.exists(base + '.tmp' + suf + '.webp'):
                os.replace(base + '.tmp' + suf + '.webp', base + suf + '.webp')

# 3. atualiza as referências
SIZES = '(max-width: 760px) 100vw, 60vw'
def img_tag(m):
    tag = m.group(0)
    src = re.search(r'src="(assets/img/([^"]+?)\.webp)"', tag)
    if not src:
        return tag
    base = src.group(2)
    w = dims.get(base, (MAX, 0))[0]
    meio = f'assets/img/{base}-1200.webp 1200w, ' if os.path.exists(f'assets/img/{base}-1200.webp') else ''
    srcset = f'assets/img/{base}-400.webp 400w, assets/img/{base}-800.webp 800w, {meio}assets/img/{base}.webp {w}w'
    if 'srcset=' in tag:
        tag = re.sub(r'srcset="[^"]*"', f'srcset="{srcset}"', tag)
    elif os.path.exists(f'assets/img/{base}-400.webp'):
        tag = tag.replace(src.group(0), f'{src.group(0)} srcset="{srcset}" sizes="{SIZES}"')
    if 'width=' not in tag and base in dims:
        w, h = dims[base]
        tag = tag.replace('<img ', f'<img width="{w}" height="{h}" ', 1)
    if 'loading=' not in tag and 'fetchpriority' not in tag:
        tag = tag.replace('<img ', '<img loading="lazy" ', 1)
    if 'decoding=' not in tag:
        tag = tag.replace('<img ', '<img decoding="async" ', 1)
    return tag

for f in glob.glob('*.html') + glob.glob('js/*.js'):
    s = open(f).read()
    s2 = re.sub(r'(assets/(?:img|video)/[\w-]+)\.(?:jpg|jpeg|png)(?=["\')\s?])', r'\1.webp', s)
    def og(m):  # redes sociais leem melhor JPG: aponta para o original
        pasta, nome = m.group(2), m.group(3)
        achados = glob.glob(f'{ORIG}/{pasta}__{nome}.*')
        return m.group(1) + (f'assets/originais/{os.path.basename(achados[0])}"' if achados else f'assets/{pasta}/{nome}.webp"')
    s2 = re.sub(r'(<meta property="og:image" content="[^"]*?)assets/(img|video)/([\w-]+)\.webp"', og, s2)
    if f.endswith('.html'):
        s2 = re.sub(r'<img\b[^>]*>', img_tag, s2)
    if s2 != s:
        open(f, 'w').write(s2)
        print('atualizado', f)
import json
med = {k: list(v) for k, v in sorted(dims.items()) if os.path.exists(f'assets/img/{k}.webp')}
js = open('js/catalogo.js').read()
js2 = re.sub(r'/\* @medidas \*/.*?/\* @fim \*/', lambda m: '/* @medidas */window.ORA_IMG = ' + json.dumps(med, separators=(',', ':')) + ';/* @fim */', js, flags=re.S)
if js2 != js:
    open('js/catalogo.js', 'w').write(js2)
    print('atualizado js/catalogo.js')
print(len(dims), 'imagens')
