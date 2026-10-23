# Bella Molisana · Semplice e naturale

Nuovo sito di **Bella Molisana**, il caseificio di Campochiaro (CB) alle falde del Matese (Idal Srl). Sostituisce il vecchio sito WordPress di bellamolisana.it e ne riprende tutti i testi, le foto e le 24 schede prodotto, in una sola pagina.

| Sezione | Cosa succede |
|---|---|
| **Apertura** | L'emblema e il motto "Fresca tradizione casearia", poi un velo di latte che sale e scopre la pagina. Solo alla prima visita della sessione |
| **Home** | "Semplice e naturale." Il titolo sale riga per riga, due vetrine ad arco (la ragazza nel campo e le sorgenti) si aprono dal basso, le mozzarelle e il sigillo "solo latte · sale · caglio · fermenti lattici vivi" seguono il mouse |
| **Nastro** | Latte · Sale · Caglio · Fermenti lattici vivi · Acqua del Matese: scorre e accelera quando scorri |
| **La storia in breve** | Il testo della home del vecchio sito, i tre punti (ricetta naturale, mozzarella slow, lavorazione tradizionale) e un collage di foto in parallasse |
| **Le 16 ore** | La sezione si ferma e, scorrendo, si attraversano le 9 fasi della lavorazione: latte, fermenti, taglio a nocciola, riposo, filatura a 85 °C, formatura, tuffo nell'acqua del Matese, vaschetta, viaggio. Un orologio si riempie da 0 a 16 ore |
| **I numeri** | 30.000 mozzarelle al giorno, 20.000 litri, 16 ore, 12 ore per 300 km, con un contatore dal vivo: "da quando sei qui si sono tuffate X mozzarelle" |
| **Ricetta bella sana** | L'etichetta corta disegnata come un'etichetta vera (i 4 ingredienti entrano uno alla volta) e le 5 schede: etichetta corta, fermenti, latte fresco, meno lattosio, amata dai bimbi |
| **Prodotti** | Le quattro famiglie della home, poi il catalogo dei 24 formati: filtri per famiglia, scaffale frigo o banco gastronomia, senza lattosio. Sulle card la confezione, al passaggio il prodotto |
| **Scheda prodotto** | Descrizione, ingredienti, valori nutrizionali, foto di confezione e prodotto; frecce ← → per sfogliare. Ogni scheda ha un link diretto, ad esempio `#p/nodini-vaschetta-250g` |
| **Il Matese** | Una mappa che segue il racconto: Campochiaro e il massiccio del Matese, il tratturo Pescasseroli–Candela, Altilia (Saepinum), l'Oasi WWF di Guardiaregia e, alla fine, il raggio di 300 km raggiunto in 12 ore |
| **Qualità** | "È la qualità che spiega il gusto": filatura a 85°, le due anime del caseificio, i mastri casari |
| **Certificazioni** | Il sigillo ISO 22000:2018 che ruota e il testo della pagina Certificazioni |
| **Contatti** | Numero verde 800 01 01 88; "Cerca negozio" (CAP o località) e "Scrivici" preparano un'email già scritta per info@bellamolisana.it; mappa Google caricata solo su richiesta |

In più: scrivendo **mozzarella** sulla tastiera, cliccando 5 volte il logo o premendo "Non tuffare le mozzarelle" nel footer, le mozzarelle si tuffano.

Niente framework e niente build: HTML, CSS e JavaScript puri. Funziona da telefono, con la tastiera, con `prefers-reduced-motion` e anche senza JavaScript (`assets/css/nojs.css`).

## Sicurezza e velocità

Stesse regole del sito IDAL:

- **Content Security Policy** rigida nel `<meta>` di `index.html`: script, stili, font e immagini solo dal sito; nessuno script o stile inline; nessun modulo inviato all'esterno. Unica eccezione l'iframe di Google Maps, caricato solo se lo si chiede, in `sandbox`.
- **Nessuna richiesta a terze parti** all'apertura: i font sono serviti dal sito. Nessun cookie e nessun tracciamento, per questo non serve il banner dei cookie.
- I moduli non spediscono dati: aprono il programma di posta con il messaggio già scritto.
- Tutto il testo inserito nella pagina passa da `esc()`. Ogni parte del sito si avvia da sola: se una si rompe, le altre continuano a funzionare.
- Animazioni continue in pausa quando non si vedono, un solo gestore di scroll, immagini WebP in due misure (`s/` per le griglie). In tutto circa 4 MB, caricati man mano.
- Dopo una modifica a CSS o JS, aumentare il numero `?v=` in `index.html`.

## Struttura

```
index.html
404.html
assets/css/style.css     stile del sito (nojs.css senza JavaScript, 404.css per la pagina d'errore)
assets/js/main.js        logica del sito
assets/js/prodotti.js    le 24 schede prodotto (testi, ingredienti, valori nutrizionali)
assets/js/mappa.js       confini regionali semplificati per la mappa
assets/img/foto/         foto del vecchio sito, ottimizzate
assets/img/prodotti/     prodotti scontornati (+ miniature in s/)
assets/img/confezioni/   le confezioni (+ miniature in s/)
assets/fonts/            Cormorant e Manrope, serviti dal sito
tools/                   script usati per estrarre testi e immagini dal vecchio sito
```

## Aggiornare i prodotti

Le schede sono in `assets/js/prodotti.js`, una per riga:

```js
{"id":"nodini-vaschetta-250g","n":"Nodini","f":"250 g · 4 pezzi","k":"annodata","w":"scaffale","d":["…"],"i":"Latte pastorizzato, sale, caglio, fermenti lattici","v":[["Energia","799 kJ / 192 kcal","10%"],…],"p":1}
```

- `id` nome dei file immagine · `n` nome · `f` formato · `k` famiglia (`mozzarella`, `annodata`, `sfoglia`, `scamorza`, `ricotta`, `burro`) · `w` dove si trova (`scaffale` o `banco`) · `d` paragrafi della descrizione · `i` ingredienti · `v` valori nutrizionali per 100 g · `sl:1` senza lattosio · `p:1` c'è anche la foto della confezione
- Immagini: `assets/img/prodotti/<id>.webp` (max 640 px) e la miniatura in `prodotti/s/` (360 px); se `p:1`, lo stesso in `confezioni/` e `confezioni/s/`.

Per rifare tutto dal vecchio sito: salvare le pagine prodotto in una cartella e le immagini originali in un'altra, poi lanciare `tools/prodotti.py`, `tools/catalogo.py` e `tools/assets.py` (le istruzioni sono in testa a ogni script).

**Da verificare con l'azienda:** sul vecchio sito, nella tabella del burro mancano i grammi di carboidrati, zuccheri e proteine (ci sono solo le percentuali): nel sito compaiono come "—". Il tracciato del tratturo sulla mappa è indicativo. L'area professionale del vecchio sito (Catalogo, Eventi e Fiere, Marketing) e la versione inglese non sono state riportate.

## Pubblicare

Ambiente di prova: **https://bellamolisana.alessandropiedimonte.dev** (GitHub Pages dietro Cloudflare), con `noindex` nelle pagine e nell'intestazione `X-Robots-Tag`. Quando il sito andrà su bellamolisana.it: cambiare il file `CNAME`, togliere il `<meta name="robots">` da `index.html` e `404.html`, e prevedere i reindirizzamenti dalle vecchie pagine (ad esempio `/prodotti/la-mozzarella/` → `/#prodotti`).

### 1. DNS su Cloudflare
- Record **CNAME** `bellamolisana` → `alepiedi.github.io`, all'inizio **solo DNS** (nuvola grigia).
- Su GitHub, Settings → Pages: pubblicare da `main`, dominio `bellamolisana.alessandropiedimonte.dev`, attendere il certificato, poi spuntare **Enforce HTTPS**.
- Tornare su Cloudflare e attivare il **proxy** (nuvola arancione).
- Rules → **Configuration Rules** → nuova regola con `Hostname` uguale a `bellamolisana.alessandropiedimonte.dev` → **SSL: Full (strict)**.

### 2. Intestazioni di sicurezza
Cloudflare → Rules → **Transform Rules** → *Modify Response Header* → nuova regola con `Hostname` uguale a `bellamolisana.alessandropiedimonte.dev`, poi **Set static** per ognuna:

| Intestazione | Valore |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src https://www.google.com; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'; upgrade-insecure-requests; frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Robots-Tag` | `noindex, nofollow` |

La CSP nell'intestazione è la stessa del `<meta>` più `frame-ancestors 'none'`: se si cambia una, cambiare anche l'altra.

### 3. Cache (facoltativo)
Rules → **Cache Rules**: per `URI Path` che inizia con `/assets/fonts/` o `/assets/img/`, *Browser TTL* 7 giorni.

---

Testi, foto e schede prodotto: dal sito bellamolisana.it. Confini regionali: [openpolis/geojson-italy](https://github.com/openpolis/geojson-italy) (CC BY 4.0). Font: Cormorant e Manrope (SIL Open Font License), serviti dal sito.
