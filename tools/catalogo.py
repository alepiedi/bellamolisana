"""Unisce le schede estratte (sku.json) con i dati di gamma e scrive assets/js/prodotti.js.
Uso: python3 tools/catalogo.py <sku.json>   (aggiunge anche il campo 'pack' a sku.json per tools/assets.py)"""
import json, sys, os
SKU = sys.argv[1]
# slug: (nome, formato, famiglia, dove, immagine confezione)
META = {
 'mozzarelline-vaschetta-200g':  ('Mozzarelline', '200 g · 2 pezzi', 'mozzarella', 'scaffale', '2019/07/mozzarelline-200-g.png'),
 'mozzarelline-vaschetta-500g':  ('Mozzarelline', '500 g · 5 pezzi', 'mozzarella', 'scaffale', '2019/07/vaschetta-5-mozzarelline-500gr.png'),
 'mozzarelle-vaschetta-400g':    ('Mozzarelle', '400 g · 2 pezzi', 'mozzarella', 'scaffale', '2019/07/vaschetta-2-mozzarelle-400-gr-1.png'),
 'mozzarelle-vaschetta-800g':    ('Mozzarelle', '800 g · 4 pezzi', 'mozzarella', 'scaffale', '2019/07/mozzerella-800-g-1.png'),
 'bocconcini-vaschetta-250g':    ('Bocconcini', '250 g · 5 pezzi', 'mozzarella', 'scaffale', '2019/07/vaschetta-5-bocconcini.png'),
 'ciliegine-vaschetta-250g':     ('Ciliegine', '250 g · 16 pezzi', 'mozzarella', 'scaffale', '2019/07/vaschetta-16-ciliegine.png'),
 'mozzarelline-senza-lattosio-vaschetta-200g': ('Mozzarelline senza lattosio', '200 g · 2 pezzi', 'mozzarella', 'scaffale', '2026/04/Senza-lattosio.jpeg'),
 'nodini-vaschetta-250g':        ('Nodini', '250 g · 4 pezzi', 'annodata', 'scaffale', '2019/07/vaschettina-4-nodini.png'),
 'treccine-vaschetta-250g':      ('Treccine', '250 g · 2 pezzi', 'annodata', 'scaffale', '2019/07/vaschetta-2-treccine-250gr.png'),
 'mozzarella-incartata-100g':    ('Mozzarella incartata', '100 g', 'mozzarella', 'banco', '2019/07/mozzarella-incarto-gastronomia.png'),
 'mozzarella-incartata-200g':    ('Mozzarella incartata', '200 g', 'mozzarella', 'banco', '2019/07/mozzarella-incarto-gastronomia.png'),
 'mozzarella-incartata-300g':    ('Mozzarella incartata', '300 g', 'mozzarella', 'banco', '2019/07/mozzarella-incarto-gastronomia.png'),
 'mozzarella-vaschetta-take-away-200g': ('Mozzarella take away', '200 g in vaschetta', 'mozzarella', 'banco', '2019/07/vaschetta-takeway-200gr.png'),
 'sfoglia-di-mozzarella-1kg':    ('Sfoglia di mozzarella', '1 kg', 'sfoglia', 'banco', '2019/07/sfoglia-pasta-gastronomia.png'),
 'scamorza-appassita-sottovuoto-300g': ('Scamorza appassita', '300 g sottovuoto', 'scamorza', 'scaffale', '2019/07/scamorza-appassita.png'),
 'scamorza-appassita-affumicata-sottovuoto-300g': ('Scamorza appassita affumicata', '300 g sottovuoto', 'scamorza', 'scaffale', '2019/07/scamorza-appassita-affumicata.png'),
 'scamorza-appassita-sottov-200g-senza-lattosio': ('Scamorza appassita senza lattosio', '200 g sottovuoto', 'scamorza', 'scaffale', '2026/10/Scamorza1.png'),
 'scamorza-appassita-300g':      ('Scamorza appassita', '300 g', 'scamorza', 'banco', '2019/07/scamorza-appassita-gastronomia.png'),
 'scamorza-appassita-affumicata-300g': ('Scamorza appassita affumicata', '300 g', 'scamorza', 'banco', '2019/07/vaschetta-scamorza-affumicata.png'),
 'ricotta-250g':                 ('Ricotta', '250 g in fuscella', 'ricotta', 'scaffale', None),
 'ricotta-15kg':                 ('Ricotta', '1,5 kg', 'ricotta', 'banco', None),
 'burro-panetto-125g':           ('Burro di panna', '125 g', 'burro', 'scaffale', '2019/07/DX_burro125.png'),
 'burro-panetto-250g':           ('Burro di panna', '250 g', 'burro', 'scaffale', '2019/07/DX_burro250.png'),
 'burro-senza-lattosio-125g':    ('Burro senza lattosio', '125 g', 'burro', 'scaffale', None),
}
# immagine principale scontornata (dove la scheda usa la confezione)
IMG = {'scamorza-appassita-300g': '2019/07/Scamorza-appassita.png',
       'scamorza-appassita-affumicata-300g': '2019/07/PR_scamorzAffumicata.png',
       'sfoglia-di-mozzarella-1kg': '2019/07/Sfoglia.png',
       'mozzarelline-senza-lattosio-vaschetta-200g': '2019/07/PR_2mozzarelline.png',
       'ricotta-250g': '2020/04/ricotta-440-fuscella-gastronomia-piccola.png'}
sku = json.load(open(SKU))
assert len(sku) == len(META), set(p['slug'] for p in sku) ^ set(META)
order = list(META)
out = []
for p in sorted(sku, key=lambda p: order.index(p['slug'])):
    n, f, k, w, pack = META[p['slug']]
    p['img'] = IMG.get(p['slug'], p['img']); p['pack'] = pack
    v = p['v']
    if k == 'burro':  # sul vecchio sito mancano i grammi di carboidrati, zuccheri e proteine
        for key in ('Carboidrati', 'di cui zuccheri', 'Proteine'):
            pct = v[key][0]; v[key] = ['—', pct]
    v = [[key, a, b if b.endswith('%') else b + '%'] for key, (a, b) in v.items()]
    o = {'id': p['slug'], 'n': n, 'f': f, 'k': k, 'w': w, 'd': p['d'], 'i': p['i'], 'v': v}
    if 'senza lattosio' in n: o['sl'] = 1
    if pack: o['p'] = 1
    out.append(o)
json.dump(sku, open(SKU, 'w'), ensure_ascii=False, indent=1)
dst = os.path.join(os.path.dirname(__file__), '..', 'assets', 'js', 'prodotti.js')
with open(dst, 'w') as fh:
    fh.write('/* Gamma Bella Molisana: testi, ingredienti e valori nutrizionali dalle schede del sito. Rigenerabile con tools/catalogo.py */\n')
    fh.write('window.BM_PRODOTTI = [\n' + ',\n'.join(json.dumps(o, ensure_ascii=False) for o in out) + '\n];\n')
print(len(out), 'prodotti')
