/* =========================================================
   Bella Molisana · semplice e naturale
   HTML, CSS e JavaScript puri. Ogni parte si avvia da sola:
   se una si rompe, le altre continuano a funzionare.
   ========================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const fmt = (n, d = 0) => n.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* navigazione privata */ } }
};

/* Un solo gestore di scroll per tutto il sito */
const onScroll = (() => {
  const fns = []; let ticking = false;
  const run = () => { ticking = false; const y = scrollY; fns.forEach(f => f(y)); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(run), { passive: true });
  return fn => { fns.push(fn); fn(scrollY); };
})();

const io = (els, cb, opt = {}) => {
  const o = new IntersectionObserver(entries => entries.forEach(e => cb(e, o)), opt);
  [].concat(els).forEach(el => el && o.observe(el));
  return o;
};

const PRODOTTI = Array.isArray(window.BM_PRODOTTI) ? window.BM_PRODOTTI : [];
const BY_ID = Object.fromEntries(PRODOTTI.map(p => [p.id, p]));
const imgP = id => `assets/img/prodotti/${id}.webp`;
const imgS = id => `assets/img/prodotti/s/${id}.webp`;
const imgC = id => `assets/img/confezioni/${id}.webp`;
const imgCS = id => `assets/img/confezioni/s/${id}.webp`;
// la foto principale è la confezione, come la si trova in negozio; poi il prodotto
const pics = p => p.p ? [imgC(p.id), imgP(p.id)] : [imgP(p.id)];

const FAMIGLIE = [
  { k: 'mozzarella', n: 'Mozzarella', pl: 'Mozzarelle' },
  { k: 'annodata', n: 'Mozzarella annodata', pl: 'Nodini e treccine' },
  { k: 'sfoglia', n: 'Sfoglia di mozzarella', pl: 'Sfoglia' },
  { k: 'scamorza', n: 'Scamorza appassita', pl: 'Scamorze' },
  { k: 'ricotta', n: 'Ricotta', pl: 'Ricotta' },
  { k: 'burro', n: 'Burro di panna', pl: 'Burro' }
];
const FAM = Object.fromEntries(FAMIGLIE.map(f => [f.k, f]));
const DOVE = { scaffale: 'Scaffale frigo', banco: 'Banco gastronomia' };

/* =========================================================
   APERTURA (solo alla prima visita della sessione)
   ========================================================= */
function ready() { document.documentElement.classList.add('is-ready'); }

function loader() {
  const el = $('#loader');
  if (!el || RM || session.get('bm-visto')) {
    document.documentElement.classList.add('no-loader');
    ready();
    return;
  }
  session.set('bm-visto', '1');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(ready, 450);
    setTimeout(() => { el.classList.add('is-gone'); document.body.style.overflow = ''; }, 1000);
    setTimeout(() => el.remove(), 1700);
  }, 1900);
}

/* =========================================================
   HEADER
   ========================================================= */
function nav() {
  const bar = $('#nav'), burger = $('#burger'), menu = $('#navMenu');
  let last = 0;
  onScroll(y => {
    bar.classList.toggle('is-scrolled', y > 30);
    const open = bar.classList.contains('is-open');
    bar.classList.toggle('is-hidden', !open && y > 700 && y > last + 4);
    if (y < last - 4 || y < 700) bar.classList.remove('is-hidden');
    last = y;
  });
  const setOpen = v => {
    bar.classList.toggle('is-open', v);
    burger.setAttribute('aria-expanded', v);
    burger.setAttribute('aria-label', v ? 'Chiudi il menu' : 'Apri il menu');
    document.body.style.overflow = v ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!bar.classList.contains('is-open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('is-open')) { setOpen(false); burger.focus(); } });

  const links = $$('[data-nav]');
  const map = {};
  links.forEach(a => { map[a.dataset.nav] = a; });
  io(links.map(a => document.getElementById(a.dataset.nav)), e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('is-active', a === map[e.target.id]));
  }, { rootMargin: '-45% 0px -50% 0px' });
}

/* =========================================================
   HERO: le vetrine ad arco si muovono appena con il mouse
   ========================================================= */
function hero() {
  const art = $('#heroArt'); if (!art || RM) return;
  const layers = $$('[data-depth]', art);
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, sy = 0;
  const loop = () => {
    cx = lerp(cx, tx, .06); cy = lerp(cy, ty, .06);
    layers.forEach(l => {
      const d = +l.dataset.depth;
      l.style.translate = `${(cx * d).toFixed(2)}px ${(cy * d - sy * d * .012).toFixed(2)}px`;
    });
    raf = Math.abs(cx - tx) + Math.abs(cy - ty) > .001 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  if (FINE) addEventListener('pointermove', e => {
    if (scrollY > innerHeight) return;
    tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); kick();
  }, { passive: true });
  onScroll(y => { if (y < innerHeight * 1.2) { sy = y; kick(); } });
}

/* =========================================================
   NASTRO degli ingredienti: scorre e accelera con lo scroll
   ========================================================= */
function ribbon() {
  const t = $('#ribbon'); if (!t) return;
  t.innerHTML += t.innerHTML + t.innerHTML;
  if (RM) return;
  let x = 0, v = 0, lastY = scrollY, vis = false, raf = 0;
  const step = () => {
    const w = t.scrollWidth / 3;
    x -= .45 + v; v *= .92;
    if (-x >= w) x += w;
    t.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    raf = vis && !document.hidden ? requestAnimationFrame(step) : 0;
  };
  onScroll(y => { v = clamp(v + Math.abs(y - lastY) * .04, 0, 9); lastY = y; });
  io(t, e => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(step); });
  document.addEventListener('visibilitychange', () => { if (vis && !document.hidden && !raf) raf = requestAnimationFrame(step); });
}

/* =========================================================
   LE 16 ORE: scorrendo, l'orologio si riempie e le fasi cambiano
   ========================================================= */
const FASI = [
  { img: 'f-latte', t: 'Partiamo dal <em>latte fresco</em>', p: 'Latte pastorizzato da filiera controllata e interamente tracciabile, selezionato dai nostri mastri casari: non OGM e certificato, per la massima sicurezza.' },
  { img: 'f-fermenti', t: 'I <em>fermenti lattici vivi</em>', p: 'Lasciamo riposare il latte il tempo necessario: la maturazione è naturale, solo con fermenti lattici vivi, molto più lenta di quella con acido citrico o lattico.' },
  { img: 'f-cagliata', t: 'Il taglio <em>a nocciola</em>', p: 'Ottenuta la cagliata, la rompiamo con la “lira” o lo “spino”, come si è sempre fatto, e la separiamo dal siero.' },
  { img: 'f-riposo', t: 'Ore di <em>riposo</em>', p: 'La cagliata riposa per ore nelle vasche di drenaggio, finché raggiunge il pH giusto. Intanto i fermenti consumano parte del lattosio: la mozzarella sarà più delicata e digeribile.' },
  { img: 'f-filatura', t: 'La filatura <em>a 85 °C</em>', p: 'Non la decide una macchina: è il casaro che fonde la cagliata nell’acqua calda e la stira in un nastro setoso, lucido e morbido.' },
  { img: 'f-formatura', t: 'Trecce, nodini, <em>testine</em>', p: 'Le mani dei mastri casari formano le mozzarelle, intrecciano le treccine, annodano i nodini e modellano la testina della scamorza appassita.' },
  { img: 'f-tuffo', t: 'Il tuffo nell’<em>acqua del Matese</em>', p: 'Calde calde, le mozzarelle vengono tuffate nell’acqua sorgiva che scende dal massiccio del Matese, dove si consolidano e si raffreddano.' },
  { img: 'f-vaschetta', t: 'In <em>vaschetta</em>, all’alba', p: 'La produzione parte di notte, ben prima dell’alba. La vaschetta porta la mozzarella integra e incontaminata dalla linea fino alla tavola.' },
  { img: 'f-viaggio', t: 'E poi, <em>in viaggio</em>', p: 'Sedici ore dopo il latte, le prime mozzarelle partono il giorno stesso e raggiungono i punti vendita in un raggio di 300 km entro 12 ore.' }
];

function hours() {
  const sec = $('#sedici-ore'), stage = $('#hoursStage'), photos = $('#hoursPhotos'), list = $('#hoursSteps');
  if (!stage) return;
  const N = FASI.length;
  photos.innerHTML = FASI.map((f, i) => `<img src="assets/img/foto/${f.img}.webp" alt="" width="800" height="533" ${i ? 'loading="lazy"' : ''} decoding="async">`).join('');
  list.innerHTML = FASI.map((f, i) => `<li class="hstep" id="fase-${i + 1}"><span class="hstep__n">Fase ${String(i + 1).padStart(2, '0')} di ${String(N).padStart(2, '0')}</span><h3>${f.t}</h3><p>${f.p}</p></li>`).join('');
  const dots = document.createElement('div');
  dots.className = 'hours__dots';
  dots.innerHTML = FASI.map((f, i) => `<button type="button" aria-label="Vai alla fase ${i + 1}"></button>`).join('');
  list.parentElement.appendChild(dots);

  // tacche delle 16 ore
  const ticks = $('#clockTicks');
  for (let h = 0; h < 16; h++) {
    const a = h / 16 * Math.PI * 2;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 60 + Math.cos(a) * 44); l.setAttribute('y1', 60 + Math.sin(a) * 44);
    l.setAttribute('x2', 60 + Math.cos(a) * 47); l.setAttribute('y2', 60 + Math.sin(a) * 47);
    ticks.appendChild(l);
  }

  const imgs = $$('img', photos), steps = $$('.hstep', list), btns = $$('button', dots);
  const fill = $('#clockFill'), hh = $('#clockH');
  let cur = -1;
  const show = i => {
    if (i === cur) return; cur = i;
    imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
    steps.forEach((s, j) => { s.classList.toggle('is-on', j === i); s.classList.toggle('is-past', j < i); });
    btns.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-current', j === i ? 'step' : 'false'); });
  };
  const range = () => {
    const r = stage.getBoundingClientRect();
    return { top: r.top + scrollY, len: stage.offsetHeight - innerHeight };
  };
  onScroll(y => {
    const { top, len } = range();
    const p = clamp((y - top) / len, 0, 1);
    show(Math.min(N - 1, Math.floor(p * N)));
    // l'ultima fase è il viaggio: l'orologio arriva a 16 con la vaschetta
    const h = clamp(p * N / (N - 1), 0, 1);
    fill.style.strokeDashoffset = (100 - h * 100).toFixed(2);
    hh.textContent = Math.round(h * 16);
  });
  btns.forEach((b, i) => b.addEventListener('click', () => {
    const { top, len } = range();
    scrollTo({ top: top + len * (i + .5) / N, behavior: RM ? 'auto' : 'smooth' });
  }));
  sec.classList.remove('hours--static');
}

/* =========================================================
   NUMERI
   ========================================================= */
function numbers() {
  io($$('[data-count]'), (e, o) => {
    if (!e.isIntersecting) return;
    o.unobserve(e.target);
    const el = e.target, end = +el.dataset.count;
    if (RM) { el.textContent = fmt(end); return; }
    const t0 = performance.now(), dur = 1800;
    const tick = t => {
      const k = clamp((t - t0) / dur, 0, 1), ease = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(end * ease));
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  }, { threshold: .6 });

  // 30.000 mozzarelle al giorno: quante da quando sei sulla pagina
  const out = $('#liveN'); if (!out) return;
  const t0 = Date.now(), perMs = 30000 / 86400000;
  const upd = () => { out.textContent = fmt(Math.floor((Date.now() - t0) * perMs)); };
  setInterval(() => { if (!document.hidden) upd(); }, 1000);
}

/* =========================================================
   RICETTA BELLA SANA
   ========================================================= */
const RICETTA = [
  { k: 'Etichetta corta', img: 'r-etichetta', t: 'Un’etichetta <em>super corta</em>', p: [
    'I prodotti Bella Molisana sono semplici e naturali, come gli ingredienti scelti accuratamente: <strong>latte, sale (solo il giusto!), caglio e fermenti lattici</strong>. E l’acqua del Matese, dove le mozzarelle appena fatte vengono tuffate.',
    'La mozzarella da noi si fa così, come si faceva secoli fa: dall’alchimia di quattro componenti naturali, nulla di più.'] },
  { k: 'Fermenti', img: 'r-fermenti', t: 'Il ruolo dei <em>fermenti lattici</em>', p: [
    'Preferiamo da sempre la <strong>maturazione naturale</strong> della cagliata, esclusivamente con fermenti lattici vivi: è ben più lunga di quella con acido citrico o lattico, che in etichetta comparirebbe come correttore di acidità.',
    'Una mozzarella così è naturalmente più povera di lattosio, più digeribile e saporita, e chiede solo un po’ di sale: per questo è particolarmente adatta a bambini e anziani.'] },
  { k: 'Latte fresco', img: 'r-latte', t: 'Partiamo dal <em>latte fresco</em>', p: [
    'Il latte è uno degli alimenti più completi: ricco di calcio e vitamina D, di vitamine del gruppo B e A, con tutti gli aminoacidi che servono all’organismo.',
    'Il nostro è selezionato dai mastri casari, ricco e squisito, da <strong>filiera controllata</strong> interamente tracciabile, <strong>non OGM e certificato</strong>. Insieme a fermenti, caglio e sale dà vita alla mozzarella fresca Bella Molisana, il nostro orgoglio.'] },
  { k: 'Meno lattosio', img: 'r-lattosio', t: 'Naturalmente <em>meno lattosio</em>', p: [
    'Come tutte le mozzarelle vaccine a lenta lavorazione, Bella Molisana ha un contenuto ridotto di lattosio: i fermenti lattici trasformano lo zucchero del latte in acido lattico mentre la cagliata riposa.',
    'Produciamo solo così, <strong>lentamente</strong>. Il risultato è una mozzarella delicata e digeribile, che non rinuncia a gusto e sapore. E per chi non può proprio, ci sono le versioni <strong>senza lattosio</strong>.'] },
  { k: 'Amata dai bimbi', img: 'r-bimbi', t: 'Ci preferiscono <em>i bambini</em>', p: [
    'Oltre metà di chi sceglie Bella Molisana sono genitori che la comprano per i loro figli piccoli. La lavorazione slow la rende più digeribile e delicata, l’etichetta corta è sinonimo di salubrità, la logistica la porta fresca fresca.',
    'Un ricco secondo con un’insalatina e qualche pomodoro d’estate, con le verdure ripassate d’inverno, o al tegamino: semplice per i genitori, gustosissima per i bimbi.'] }
];

function recipe() {
  const tabs = $('#recipeTabs'), panel = $('#recipePanel'); if (!tabs) return;
  tabs.innerHTML = RICETTA.map((r, i) => `<button type="button" role="tab" id="rt${i}" aria-controls="recipePanel" aria-selected="${!i}" tabindex="${i ? -1 : 0}">${r.k}</button>`).join('');
  const btns = $$('button', tabs);
  const show = (i, focus) => {
    const r = RICETTA[i];
    btns.forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    if (focus) btns[i].focus();
    panel.setAttribute('aria-labelledby', 'rt' + i);
    panel.innerHTML = `<div class="rpanel"><figure><img src="assets/img/foto/${r.img}.webp" alt="" width="800" height="533"></figure><h3>${r.t}</h3>${r.p.map(p => `<p>${p}</p>`).join('')}</div>`;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  tabs.addEventListener('keydown', e => {
    const i = btns.indexOf(document.activeElement); if (i < 0) return;
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
    if (n === null) return;
    e.preventDefault(); show((n + btns.length) % btns.length, true);
  });
  show(0);
  io($('#label'), (e, o) => { if (e.isIntersecting) { e.target.classList.add('is-in'); o.disconnect(); } }, { threshold: .4 });
}

/* =========================================================
   PRODOTTI: famiglie, catalogo e scheda
   ========================================================= */
const VETRINA = [
  { k: 'mozzarella', id: 'mozzarelline-vaschetta-200g', t: 'La mozzarella', p: 'Il nostro fiore all’occhiello: ricca di latte e saporita, ma leggera perché fatta con fermenti lattici vivi. Prodotta all’alba, arriva subito in tavola.' },
  { k: 'scamorza', id: 'scamorza-appassita-sottovuoto-300g', t: 'La scamorza appassita', p: 'Una mozzarella con meno acqua: ecco il segreto del suo sapore. Meno acqua, più gusto, naturale e affumicata.' },
  { k: 'ricotta', id: 'ricotta-250g', t: 'La ricotta', p: 'Una squisitezza freschissima dalle proteine del siero di latte, dal sapore dolce e delicato.' },
  { k: 'burro', id: 'burro-panetto-250g', t: 'Il burro di panna', p: 'Prodotto per affioramento: solo crema di latte, squisita e delicata.' }
];
const cat = { k: '', w: '', sl: false, view: [] };

function catalog() {
  const fam = $('#families'), chips = $('#famChips'), grid = $('#grid'), count = $('#catCount');
  if (!grid || !PRODOTTI.length) return;

  fam.innerHTML = VETRINA.map(v => `
    <button type="button" class="fam reveal" data-k="${v.k}">
      <span class="fam__img"><img src="${imgS(v.id)}" alt="" loading="lazy" width="360" height="280"></span>
      <h3>${esc(v.t)}</h3><p>${esc(v.p)}</p>
      <span class="fam__more">${PRODOTTI.filter(p => p.k === v.k).length} formati →</span>
    </button>`).join('');

  const countK = k => PRODOTTI.filter(p => !k || p.k === k).length;
  chips.innerHTML = [{ k: '', pl: 'Tutti' }, ...FAMIGLIE].map(f => `<button type="button" data-k="${f.k}" aria-pressed="${!f.k}">${esc(f.pl)} <small>${countK(f.k)}</small></button>`).join('');

  const render = () => {
    cat.view = PRODOTTI.filter(p => (!cat.k || p.k === cat.k) && (!cat.w || p.w === cat.w) && (!cat.sl || p.sl));
    $$('button', chips).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === cat.k));
    $$('#whereSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.w === cat.w));
    count.textContent = cat.view.length === 1 ? '1 prodotto' : `${cat.view.length} prodotti`;
    grid.innerHTML = cat.view.length ? cat.view.map((p, i) => `
      <li class="card is-new">
        <button type="button" data-id="${esc(p.id)}" aria-label="${esc(p.n)}, ${esc(p.f)}: apri la scheda">
          <span class="card__img">${(p.p ? [imgCS(p.id), imgS(p.id)] : [imgS(p.id)]).map(s => `<img src="${s}" alt="" loading="lazy" decoding="async" width="360" height="270">`).join('')}</span>
          <span class="card__body">
            <span class="card__k">${esc(FAM[p.k].n)}</span>
            <span class="card__n">${esc(p.n)}</span>
            <span class="card__f">${esc(p.f)}</span>
            <span class="card__tags">${tags(p)}</span>
          </span>
        </button>
      </li>`).join('') : '<li class="grid__empty">Nessun prodotto con questi filtri.</li>';
    $$('.card', grid).forEach((c, i) => { c.style.animationDelay = `${Math.min(i, 12) * 40}ms`; });
  };

  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cat.k = b.dataset.k; render(); } });
  $('#whereSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cat.w = b.dataset.w; render(); } });
  $('#slToggle').addEventListener('change', e => { cat.sl = e.target.checked; render(); });
  fam.addEventListener('click', e => {
    const b = e.target.closest('.fam'); if (!b) return;
    cat.k = b.dataset.k; cat.w = ''; cat.sl = false; $('#slToggle').checked = false; render();
    $('#catalogo').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
  });
  grid.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) openProduct(b.dataset.id, b); });
  render();
}

const tags = p => [
  p.sl ? '<span class="tag tag--sl">Senza lattosio</span>' : '',
  `<span class="tag ${p.w === 'banco' ? 'tag--banco' : ''}">${DOVE[p.w]}</span>`
].join('');

let modalApi = null;
function modal() {
  const dlg = $('#modal'); if (!dlg) return;
  const hasDialog = typeof dlg.showModal === 'function';
  if (!hasDialog) dlg.classList.add('is-fallback');
  let list = [], idx = 0, opener = null;

  const fill = () => {
    const p = list[idx];
    $('#mKicker').textContent = FAM[p.k].n;
    $('#mTitle').textContent = p.n;
    $('#mFmt').textContent = p.f;
    $('#mTags').innerHTML = tags(p);
    $('#mDesc').innerHTML = p.d.map(t => `<p>${esc(t)}</p>`).join('');
    $('#mIngr').textContent = p.i;
    $('#mNutri tbody').innerHTML = p.v.map(([k, a, b]) => `<tr class="${k.startsWith('di cui') ? 'sub' : ''}"><td>${esc(k)}</td><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');
    const ph = pics(p);
    const main = $('#mImg');
    main.src = ph[0]; main.alt = `${p.n} Bella Molisana`;
    $('#mThumbs').innerHTML = ph.length > 1 ? ph.map((s, i) => `<button type="button" data-src="${s}" aria-pressed="${!i}" aria-label="${i ? 'Prodotto' : 'Confezione'}"><img src="${s}" alt=""></button>`).join('') : '';
    $('#mPos').textContent = `${idx + 1} di ${list.length}`;
    $('.modal__body', dlg).scrollTop = 0;
    try { history.replaceState(null, '', '#p/' + p.id); } catch { /* file:// */ }
  };
  const go = d => { idx = (idx + d + list.length) % list.length; fill(); };
  const close = () => {
    if (hasDialog) dlg.close(); else dlg.removeAttribute('open');
  };
  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* file:// */ }
    if (opener && document.contains(opener)) opener.focus();
  });
  $('#mClose').addEventListener('click', close);
  $('#mPrev').addEventListener('click', () => go(-1));
  $('#mNext').addEventListener('click', () => go(1));
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'Escape' && !hasDialog) close();
  });
  $('#mThumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('#mImg').src = b.dataset.src;
    $$('#mThumbs button').forEach(x => x.setAttribute('aria-pressed', x === b));
  });

  modalApi = (id, from) => {
    const p = BY_ID[id]; if (!p) return;
    list = cat.view.includes(p) ? cat.view : PRODOTTI;
    idx = list.indexOf(p); opener = from || null;
    fill();
    if (!dlg.open) { if (hasDialog) dlg.showModal(); else dlg.setAttribute('open', ''); }
    document.body.style.overflow = 'hidden';
  };

  // link diretto a una scheda: #p/nodini-vaschetta-250g
  const m = location.hash.match(/^#p\/([\w-]+)$/);
  if (m && BY_ID[m[1]]) setTimeout(() => modalApi(m[1]), 300);
}
const openProduct = (id, from) => modalApi && modalApi(id, from);

/* =========================================================
   MAPPA DEL TERRITORIO
   ========================================================= */
const G = window.BM_GEO;
const NS = 'http://www.w3.org/2000/svg';
const proj = (lon, lat) => [(lon - G.proj[0]) * G.proj[2], (G.proj[1] - lat) * G.proj[3]];
const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

const LUOGHI = {
  campochiaro: [14.5068, 41.4475], altilia: [14.6170, 41.4330], guardiaregia: [14.5440, 41.4340],
  campobasso: [14.6594, 41.5603], isernia: [14.2333, 41.5960], boiano: [14.4740, 41.4830],
  roma: [12.4964, 41.9028], napoli: [14.2681, 40.8518], bari: [16.8719, 41.1171], pescara: [14.2141, 42.4618],
  foggia: [15.5443, 41.4622], salerno: [14.7681, 40.6824], potenza: [15.8055, 40.6404], benevento: [14.7819, 41.1298]
};
// tracciato indicativo del tratturo Pescasseroli–Candela
const TRATTURO = [[13.788, 41.806], [14.035, 41.735], [14.233, 41.596], [14.39, 41.52], [14.474, 41.483], [14.617, 41.433], [14.73, 41.39], [14.81, 41.35], [14.88, 41.31], [14.98, 41.22], [15.18, 41.23], [15.515, 41.137]];
const MATESE = [[14.13, 41.43], [14.2, 41.5], [14.33, 41.54], [14.47, 41.5], [14.56, 41.45], [14.55, 41.38], [14.42, 41.33], [14.25, 41.34], [14.15, 41.38]];

function landMap() {
  const svg = $('#landMap'), cap = $('#mapCap'); if (!G || !svg) return;
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const vp = svgEl('g', { class: 'vp' }, svg);
  G.regions.forEach(r => svgEl('path', { d: r.d, class: 'reg' + (r.n === 'Molise' ? ' is-mol' : '') }, vp));

  const P = k => proj(...LUOGHI[k]);
  const poly = pts => pts.map(p => proj(...p).map(v => v.toFixed(1)).join(',')).join(' ');
  const R300 = 300 / 111.2 * G.proj[3];
  const [cx, cy] = P('campochiaro');

  // strati: ognuno si accende in uno step del racconto
  const L = {};
  ['regioni', 'matese', 'tratturo', 'altilia', 'oasi', 'raggio', 'citta'].forEach(n => { L[n] = svgEl('g', { class: 'map-layer' }, vp); });
  svgEl('circle', { cx, cy, r: R300, class: 'map-radius', 'vector-effect': 'non-scaling-stroke' }, L.raggio);
  svgEl('polygon', { points: poly(MATESE), class: 'map-matese', 'vector-effect': 'non-scaling-stroke' }, L.matese);
  svgEl('polyline', { points: poly(TRATTURO), class: 'map-trat', 'vector-effect': 'non-scaling-stroke' }, L.tratturo);
  const [gx, gy] = P('guardiaregia');
  svgEl('ellipse', { cx: gx - 1, cy: gy, rx: 5.5, ry: 3.6, class: 'map-matese', 'vector-effect': 'non-scaling-stroke' }, L.oasi);

  // etichette e puntini: scalati a ogni fotogramma per restare della stessa misura
  const marks = [];
  const mark = (layer, x, y, text, o = {}) => {
    const g = svgEl('g', {}, layer);
    if (o.dot !== false) svgEl('circle', { r: o.r || 3, fill: '#5D685F' }, g);
    if (text) svgEl('text', { x: o.dx ?? 7, y: o.dy ?? 4, class: o.cls || 'map-name', 'text-anchor': o.anchor || 'start' }, g).textContent = text;
    marks.push({ g, x, y });
    return g;
  };
  const reg = { Molise: [14.62, 41.68], Abruzzo: [13.9, 42.15], Campania: [14.85, 40.95], Puglia: [15.95, 41.25], Lazio: [13.15, 41.75], Basilicata: [16.05, 40.55] };
  Object.entries(reg).forEach(([n, c]) => mark(L.regioni, ...proj(...c), n, { dot: false, cls: 'map-reg', anchor: 'middle', dx: 0 }));
  ['campobasso', 'isernia'].forEach(k => mark(L.regioni, ...P(k), k[0].toUpperCase() + k.slice(1)));
  mark(L.matese, ...proj(14.3, 41.43), 'Massiccio del Matese', { dot: false, cls: 'map-label', anchor: 'middle', dx: 0 });
  mark(L.tratturo, ...proj(...TRATTURO[0]), 'Pescasseroli', { r: 2.4 });
  mark(L.tratturo, ...proj(...TRATTURO[TRATTURO.length - 1]), 'Candela', { r: 2.4 });
  mark(L.tratturo, ...proj(14.95, 41.27), 'tracciato indicativo', { dot: false, cls: 'map-label', dy: 14 });
  mark(L.altilia, ...P('altilia'), 'Altilia · Saepinum', { r: 3 });
  mark(L.oasi, gx, gy + 6, 'Oasi WWF di Guardiaregia', { dot: false, cls: 'map-label', anchor: 'middle', dx: 0, dy: 10 });
  ['roma', 'napoli', 'bari', 'pescara', 'foggia', 'salerno', 'potenza', 'benevento'].forEach(k => mark(L.citta, ...P(k), k[0].toUpperCase() + k.slice(1)));
  mark(L.raggio, cx, cy - R300, '300 km', { dot: false, cls: 'map-label', anchor: 'middle', dx: 0, dy: -8 });
  // Campochiaro sempre sopra
  const pinG = svgEl('g', {}, vp);
  const ring = svgEl('circle', { r: 7, class: 'map-ring' }, pinG);
  if (!RM) {
    svgEl('animate', { attributeName: 'r', values: '5;18', dur: '2s', repeatCount: 'indefinite' }, ring);
    svgEl('animate', { attributeName: 'opacity', values: '1;0', dur: '2s', repeatCount: 'indefinite' }, ring);
  }
  svgEl('circle', { r: 5, class: 'map-pin' }, pinG);
  svgEl('text', { x: 10, y: -8, class: 'map-name' }, pinG).textContent = 'Campochiaro';
  marks.push({ g: pinG, x: cx, y: cy });

  // inquadrature: [centro lon, centro lat, larghezza in unità della mappa]
  const SCENE = {
    campochiaro: { c: [14.45, 41.5], w: 120, on: ['regioni', 'matese'], cap: 'Campochiaro (CB), alle falde del Matese' },
    tratturo: { c: [14.65, 41.47], w: 230, on: ['regioni', 'matese', 'tratturo', 'altilia'], cap: 'Il tratturo Pescasseroli–Candela' },
    altilia: { c: [14.56, 41.45], w: 60, on: ['regioni', 'matese', 'tratturo', 'altilia'], cap: 'Altilia, l’antica Saepinum' },
    oasi: { c: [14.5, 41.44], w: 56, on: ['regioni', 'matese', 'oasi', 'altilia'], cap: 'Oasi WWF di Guardiaregia' },
    raggio: { c: [14.75, 41.4], w: 720, on: ['raggio', 'citta'], cap: '300 km in 12 ore' }
  };

  let vb = null, anim = 0;
  const box = $('#mapBox');
  const apply = v => {
    const W = box.clientWidth || 600, H = box.clientHeight || 600;
    const h = v.w * H / W;
    svg.setAttribute('viewBox', `${(v.x - v.w / 2).toFixed(2)} ${(v.y - h / 2).toFixed(2)} ${v.w.toFixed(2)} ${h.toFixed(2)}`);
    const k = v.w / W * (W < 600 ? .95 : 1.15);
    marks.forEach(m => m.g.setAttribute('transform', `translate(${m.x.toFixed(2)} ${m.y.toFixed(2)}) scale(${k.toFixed(4)})`));
  };
  const goTo = name => {
    const s = SCENE[name]; if (!s) return;
    const [x, y] = proj(...s.c);
    const to = { x, y, w: s.w };
    Object.entries(L).forEach(([n, g]) => g.classList.toggle('is-on', s.on.includes(n)));
    cap.textContent = s.cap;
    if (!vb || RM) { vb = to; apply(vb); return; }
    const from = { ...vb }, t0 = performance.now(), dur = 1400;
    cancelAnimationFrame(anim);
    const step = t => {
      const q = clamp((t - t0) / dur, 0, 1), e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      // lo zoom avviene in scala logaritmica: più naturale
      vb = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e), w: Math.exp(lerp(Math.log(from.w), Math.log(to.w), e)) };
      apply(vb);
      if (q < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };
  goTo('campochiaro');
  addEventListener('resize', () => vb && apply(vb), { passive: true });

  const stories = $$('.story[data-place]');
  io(stories, e => {
    if (!e.isIntersecting) return;
    stories.forEach(s => s.classList.toggle('is-on', s === e.target));
    goTo(e.target.dataset.place);
  }, { rootMargin: '-40% 0px -45% 0px' });
  pauseOffscreen(svg, box);
}

function pauseOffscreen(svg, watch) {
  if (!svg.pauseAnimations) return;
  svg.pauseAnimations();
  let vis = false;
  const sync = () => (vis && !document.hidden ? svg.unpauseAnimations() : svg.pauseAnimations());
  io(watch, e => { vis = e.isIntersecting; sync(); });
  document.addEventListener('visibilitychange', sync);
}

/* =========================================================
   CONTATTI: i moduli preparano un'email, nessun dato al sito
   ========================================================= */
const MAIL = 'info@bellamolisana.it';
function contact() {
  const tabs = $$('#formSeg [role="tab"]');
  const show = t => tabs.forEach(b => {
    const on = b === t;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
    document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach(b => b.addEventListener('click', () => show(b)));
  $('#formSeg').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const n = tabs[(i + 1) % 2]; show(n); n.focus();
  });
  tabs.forEach(b => { b.tabIndex = b.getAttribute('aria-selected') === 'true' ? 0 : -1; });

  const send = (form, build) => form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', form).filter(i => !i.value.trim());
    $$('input, textarea', form).forEach(i => i.setAttribute('aria-invalid', bad.includes(i)));
    if (bad.length) { bad[0].focus(); toast('Compila i campi richiesti'); return; }
    const [subject, body] = build(Object.fromEntries(new FormData(form)));
    location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('Si apre il programma di posta…');
  });
  send($('#fShop'), d => ['Dove trovo Bella Molisana?', `Buongiorno,\nvorrei sapere dove acquistare i prodotti Bella Molisana vicino a: ${d.cap.trim()}.${d.cosa.trim() ? `\nCerco in particolare: ${d.cosa.trim()}.` : ''}\n\nGrazie!`]);
  send($('#fMsg'), d => [`Messaggio dal sito, da ${d.nome.trim()}`, `${d.msg.trim()}\n\n${d.nome.trim()}`]);

  $('#gmapBtn').addEventListener('click', () => {
    const box = $('#gmap');
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Via Don Giuseppe Mucciardi 1, 86020 Campochiaro CB') + '&output=embed';
    f.title = 'Mappa: Bella Molisana a Campochiaro';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    box.replaceChildren(f);
    box.classList.add('is-loaded');
  });
}

function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-on'), 2600);
}

/* =========================================================
   EFFETTI DI SCROLL
   ========================================================= */
function reveals() {
  const els = $$('.reveal');
  if (RM || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
  io(els, (e, o) => { if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); } }, { rootMargin: '0px 0px -8% 0px' });
  // le card delle famiglie sono create dopo
  setTimeout(() => io($$('.reveal:not(.is-in)'), (e, o) => { if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); } }), 0);
}

function parallax() {
  if (RM) return;
  const els = $$('.parallax');
  onScroll(() => {
    const vh = innerHeight;
    els.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const off = (r.top + r.height / 2 - vh / 2) * +el.dataset.speed;
      el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    });
  });
}

function progress() {
  const bar = $('#progress'); if (!bar) return;
  onScroll(y => { bar.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - innerHeight || 1), 0, 1)})`; });
}

function magnetic() {
  if (!FINE || RM) return;
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* =========================================================
   Le mozzarelle che si tuffano: scrivi "mozzarella",
   clicca 5 volte il logo o premi il pulsante nel footer
   ========================================================= */
function splash() {
  let busy = false;
  const go = () => {
    if (busy || RM) { if (RM) toast('Splash! (in silenzio, con le animazioni ridotte)'); return; }
    busy = true;
    const box = document.createElement('div');
    box.className = 'splash'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<div class="splash__water"></div>';
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-on'));
    const ids = ['mozzarelline-vaschetta-200g', 'nodini-vaschetta-250g', 'treccine-vaschetta-250g', 'bocconcini-vaschetta-250g', 'ciliegine-vaschetta-250g', 'scamorza-appassita-sottovuoto-300g'];
    const n = 16, H = innerHeight;
    for (let i = 0; i < n; i++) {
      const im = new Image();
      im.src = imgS(ids[i % ids.length]); im.alt = '';
      const x = Math.random() * (innerWidth - 110);
      im.style.left = x + 'px';
      box.appendChild(im);
      const delay = i * 140 + Math.random() * 200, rot = (Math.random() - .5) * 120;
      const a = im.animate([
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: `translateY(${H + 40}px) rotate(${rot}deg)`, offset: .82 },
        { transform: `translateY(${H + 160}px) rotate(${rot * 1.2}deg)`, opacity: 0 }
      ], { duration: 1500, delay, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'both' });
      setTimeout(() => {
        const r = document.createElement('i');
        r.className = 'splash__ring'; r.style.left = (x + 45) + 'px';
        box.appendChild(r);
      }, delay + 1230);
      if (i === n - 1) a.onfinish = () => { box.classList.remove('is-on'); setTimeout(() => { box.remove(); busy = false; }, 700); };
    }
    toast('Splash! Proprio come nelle vasche del Matese');
  };
  $('#eggBtn')?.addEventListener('click', go);
  let clicks = 0, t = 0;
  $('#logoBtn')?.addEventListener('click', () => { clicks++; clearTimeout(t); t = setTimeout(() => { clicks = 0; }, 1500); if (clicks >= 5) { clicks = 0; go(); } });
  let buf = '';
  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-10);
    if (buf === 'mozzarella') { buf = ''; go(); }
  });
}

/* =========================================================
   AVVIO
   ========================================================= */
const safe = fn => { try { fn(); } catch (e) { console.error('[Bella Molisana]', fn.name, e); } };
safe(loader);
[nav, hero, ribbon, hours, numbers, recipe, catalog, modal, landMap, contact, reveals, parallax, progress, magnetic, splash].forEach(safe);
// rete di sicurezza: se qualcosa non parte, i contenuti diventano comunque visibili
setTimeout(() => { ready(); $$('.reveal').forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-in'); }); }, 4000);
