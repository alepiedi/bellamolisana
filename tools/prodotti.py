"""Estrae le schede prodotto dalle pagine salvate del vecchio sito (cartella passata come argomento)."""
import re, html, json, sys, os
D = sys.argv[1]
def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
out = []
for f in sorted(os.listdir(D)):
    s = open(os.path.join(D, f)).read()
    s = re.sub(r'(?is)<(script|style|header|footer|nav)[^>]*>.*?</\1>', '', s)
    b = s[s.find('<body'):]
    parts = [l.strip() for l in html.unescape(re.sub(r'<[^>]+>', '\n', b)).split('\n') if l.strip()]
    t = ' | '.join(parts)
    name = re.search(r'Marketing \| (.+?) \|', t).group(1)
    i0 = t.find(name + ' |') + len(name) + 3
    desc = t[i0:t.find('Semplice e Naturale', i0)]
    desc = desc.replace('--> |', '')
    paras = []
    for p in re.split(r'(?<=[.!])\s*\|\s*(?=[A-ZÈÉ“"])', desc):
        p = re.sub(r'\s*\|\s*', ' ', p).strip()
        p = re.sub(r'\s+([,.;:!?])', r'\1', p).replace('“ ', '“').replace(' ”', '”')
        if p: paras.append(p)
    ingr = re.search(r'INGREDIENTI \| (.+?) \|', t)
    nut = {}
    for k in ['Energia', 'Grassi', 'di cui acidi grassi saturi', 'Carboidrati', 'di cui zuccheri', 'Proteine', 'Sale']:
        m = re.search(r'\| ' + re.escape(k) + r' \| ([^|]+?) \| ([^|]+?) \|', t)
        if m: nut[k] = [m.group(1).strip(), m.group(2).strip()]
    og = re.search(r'og:image" content="[^"]*/uploads/([^"]+)"', open(os.path.join(D, f)).read())
    out.append(dict(slug=f[:-5], n=name, d=paras, i=ingr.group(1) if ingr else '', v=nut, img=og.group(1) if og else ''))
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
