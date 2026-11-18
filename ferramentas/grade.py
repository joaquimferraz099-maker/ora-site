"""Tratamento de cor único da ORA para fotos de banco (não se aplica às fotos de produto)."""
from PIL import Image, ImageEnhance

_curva = [min(255, max(0, round(255 * ((v / 255) ** 1.14) * 1.02))) for v in range(256)]
_r = [min(255, round(v * 1.035 + 3)) for v in range(256)]
_b = [round(v * 0.9) for v in range(256)]

def grade(im):
    alfa = im.getchannel('A') if im.mode == 'RGBA' else None
    im = ImageEnhance.Color(im.convert('RGB')).enhance(0.8)
    r, g, b = im.split()
    im = Image.merge('RGB', (r.point(_r), g, b.point(_b))).point(_curva * 3)
    if alfa:
        im.putalpha(alfa)
    return im

def tratar(nome):
    """Fotos de banco recebem o tratamento; embalagem, kit e cartão ficam como estão."""
    return nome.startswith(('px-', 'cel-', 'pausa-', 'drip'))
