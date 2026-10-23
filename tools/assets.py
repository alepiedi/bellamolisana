"""Prepara le immagini del sito dalle originali del vecchio sito.
Uso: python3 tools/assets.py <cartella con le immagini scaricate> <sku.json da tools/prodotti.py>"""
import sys, os, json
from PIL import Image
R, SKU = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
def load(f): return Image.open(os.path.join(R, f.replace('/', '_'))).convert('RGBA')
def save(im, path, w, q=78):
    im = im.copy()
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if im.getchannel('A').getextrema()[0] == 255: im = im.convert('RGB')
    im.save(os.path.join(OUT, path), 'WEBP', quality=q, method=6)
    return im.size

# foto: nome -> (file, ritaglio facoltativo in frazioni l,t,r,b, larghezza max)
FOTO = {
 'hero-donna':   ('2019_10_storia-copia.jpg', (.30, 0, .78, 1), 900),
 'hero-ruscello':('2020_04_slide-ruscello.jpg', (.15, .05, .85, .95), 700),
 'campi':        ('2020_04_slide-bella-molisana.jpg', None, 900),
 'matese':       ('2020_04_slide-molise.jpg', None, 1920),
 'ruscello':     ('2020_04_slide-ruscello.jpg', None, 900),
 'altilia':      ('2019_10_bellamolisana_storia_molisana11.jpeg', None, 800),
 'donna-arco':   ('2019_10_bellamolisana_storia_molisana9.jpeg', None, 800),
 'caseificio':   ('2019_10_bellamolisana-il-nostro-caseificio.jpg', None, 800),
 'lago':         ('2019_10_bellamolisana_ricetta_bella_sana8.jpeg', None, 800),
 # le fasi delle 16 ore
 'f-latte':      ('2019_10_bellamolisana_ricetta_bella_sana13.jpeg', None, 800),
 'f-fermenti':   ('2019_10_fermenti.jpg', None, 800),
 'f-cagliata':   ('2019_10_lattosio.jpg', None, 800),
 'f-riposo':     ('2019_10_bellamolisana-artigianalita-nella-lavorazione.jpg', None, 800),
 'f-filatura':   ('2019_10_bellamolisana_ricetta_bella_sana16.jpeg', None, 800),
 'f-formatura':  ('2019_07_DSC07188.jpg', None, 800),
 'f-tuffo':      ('2019_10_bellamolisana_ricetta_bella_sana4.jpeg', None, 800),
 'f-vaschetta':  ('2019_10_bellamolisana_ricetta_bella_sana5.jpeg', None, 800),
 'f-viaggio':    ('2019_10_Bellamolisana_logistica_10.jpeg', None, 800),
 # ricetta bella sana
 'r-etichetta':  ('2019_10_etichetta-corta-1.jpg', None, 800),
 'r-fermenti':   ('2019_10_bellamolisana_ricetta_bella_sana19.jpeg', None, 800),
 'r-latte':      ('2019_10_latte.jpg', None, 800),
 'r-lattosio':   ('2019_10_bellamolisana_ricetta_bella_sana18.jpeg', None, 800),
 'r-bimbi':      ('2019_10_bambini.jpg', None, 800),
 # qualità e persone
 'casaro':       ('2019_10_bellamolisana-i-nostri-maestri-casari.jpg', None, 800),
 'mani':         ('2019_10_bellamolisana_qualita_che_spiega_gusto5.jpeg', None, 800),
 'controllo':    ('2019_10_bellamolisana_certificazioni4.jpeg', None, 800),
 'banco':        ('2019_10_gastronomia-folder.jpg', None, 1200),
}
os.makedirs(os.path.join(OUT, 'foto'), exist_ok=True)
for n, (f, crop, w) in FOTO.items():
    im = load(f)
    if crop: W, H = im.size; im = im.crop((round(crop[0]*W), round(crop[1]*H), round(crop[2]*W), round(crop[3]*H)))
    print('foto', n, save(im, f'foto/{n}.webp', w, 74 if w <= 1000 else 62))
    if w > 1000: save(im, f'foto/{n}-m.webp', 900, 72)

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    return im.crop(bb)
for p in json.load(open(SKU)):
    for key in ('img', 'pack'):
        if not p.get(key): continue
        im = trim(load(p[key]))
        folder = 'prodotti' if key == 'img' else 'confezioni'
        print(folder, p['slug'], save(im, f'{folder}/{p["slug"]}.webp', 640, 80))
        save(im, f'{folder}/s/{p["slug"]}.webp', 360, 78)
# loghi e dettagli
logo = trim(load('2019_07_logo-bm.png')); save(logo, 'logo.webp', 520, 90)
logo = trim(load('2019_07_logo-bianco.png')); save(logo, 'logo-bianco.webp', 520, 90)
em = load('2019_07_new-home-molisana.png'); save(trim(em), 'emblema.webp', 460, 88)
