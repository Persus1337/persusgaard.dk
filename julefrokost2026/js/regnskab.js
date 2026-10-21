// Årsrapporten: ticker, tællende nøgletal og to diagrammer med hover.
import { REGNSKAB, STEMNING } from './data.js';

const MAD = '#b98a2e', FRAGT = '#c0483e', LINJE = '#e7b95c', FLADE = '#0a0705';
const kr = (v, d = 0) => v.toLocaleString('da-DK', { minimumFractionDigits: d, maximumFractionDigits: d });
const NS = 'http://www.w3.org/2000/svg';

const TICKER = [
  ['FRKDL', '+4,2 %', 1], ['SILD', '−0,3 %', 0], ['SNAPS', '+12,7 %', 1], ['SYLTE', '−2,1 %', 0],
  ['RISALA', '+9,9 %', 1], ['LANGE', '+3,5 %', 1], ['GRØNLK', '+0,8 %', 1], ['MOMS', '754,00', 0],
  ['REMLD', '+1,6 %', 1], ['FLÛTE', '−0,9 %', 0], ['MAMMA', 'AAA', 1], ['ANDBR', '+2,4 %', 1],
];

export function initRegnskab({ gsap, ScrollTrigger, lyd }) {
  const baand = document.getElementById('ticker');
  const enkelt = TICKER.map(([n, v, op]) => `<span>${n} <span class="${op ? 'op' : 'ned'}">${op ? '▲' : '▼'} ${v}</span></span>`).join('');
  baand.innerHTML = enkelt + enkelt;

  // Tællere
  document.querySelectorAll('[data-taeller]').forEach((el) => {
    const maal = parseFloat(el.dataset.taeller), d = +(el.dataset.decimaler || 0), suffiks = el.dataset.suffiks || '';
    el.textContent = kr(maal, d) + suffiks;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        const o = { v: 0 };
        let sidste = 0;
        gsap.to(o, {
          v: maal, duration: 2.4, ease: 'expo.out',
          onUpdate: () => {
            el.textContent = kr(o.v, d) + suffiks;
            const nu = performance.now();
            if (nu - sidste > 70 && o.v < maal * 0.98) { lyd.tik(); sidste = nu; }
          },
        });
      },
    });
  });

  const donut = tegnDonut(document.getElementById('donut'));
  const linje = tegnStemning(document.getElementById('stemning'));
  ScrollTrigger.create({ trigger: '.diagrammer', start: 'top 80%', once: true, onEnter: () => { donut(gsap); linje(gsap); lyd.klokkespil([1046.5, 1318.5, 1568], 0.1, 0.6); } });

  let timer;
  addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { tegnStemning(document.getElementById('stemning'))(null); }, 200);
  });
}

function el(navn, attrs = {}, foraelder) {
  const e = document.createElementNS(NS, navn);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  foraelder?.appendChild(e);
  return e;
}

function tip(fig) {
  let t = fig.querySelector('.vaerktoejstip');
  if (!t) { t = document.createElement('div'); t.className = 'vaerktoejstip'; fig.appendChild(t); }
  return {
    vis(html, x, y) { t.innerHTML = html; t.style.left = `${x}px`; t.style.top = `${y}px`; t.style.opacity = 1; },
    skjul() { t.style.opacity = 0; },
  };
}

function tegnDonut(fig) {
  const { mad, fragt, total } = REGNSKAB;
  const data = [['Maden', mad, MAD], ['Fragten', fragt, FRAGT]];
  fig.innerHTML = `
    <figcaption><h3>Hvor pengene går hen</h3><p>Fordeling af de 3.770 kr inkl. moms.</p></figcaption>`;
  const svg = el('svg', { viewBox: '0 0 240 240', role: 'img', 'aria-label': `Maden koster ${kr(mad)} kr og fragten ${kr(fragt)} kr.` }, fig);
  const r = 88, omkreds = 2 * Math.PI * r, gab = 2 / r; // 2 px gab i radianer
  let start = -Math.PI / 2;
  const buer = data.map(([navn, v, farve]) => {
    const vinkel = (v / total) * Math.PI * 2;
    const laengde = Math.max(0, (vinkel - gab) * r);
    const c = el('circle', {
      cx: 120, cy: 120, r, fill: 'none', stroke: farve, 'stroke-width': 30,
      'stroke-dasharray': `0 ${omkreds}`, transform: `rotate(${((start + gab / 2) * 180) / Math.PI} 120 120)`,
      'data-laengde': laengde, tabindex: 0,
    }, svg);
    start += vinkel;
    const t = tip(fig);
    const pct = Math.round((v / total) * 100);
    const vis = (e) => {
      const b = fig.getBoundingClientRect();
      const x = (e.clientX ?? b.left + b.width / 2) - b.left, y = (e.clientY ?? b.top + b.height / 2) - b.top;
      t.vis(`<strong>${navn}</strong><br>${kr(v)} kr · ${pct} %`, x, y);
      c.setAttribute('stroke-width', 36);
    };
    c.addEventListener('pointermove', vis);
    c.addEventListener('focus', vis);
    const skjul = () => { t.skjul(); c.setAttribute('stroke-width', 30); };
    c.addEventListener('pointerleave', skjul);
    c.addEventListener('blur', skjul);
    return { c, laengde, omkreds };
  });
  el('text', { x: 120, y: 118, 'text-anchor': 'middle', class: 'vaerdi', 'font-size': 30, style: 'font-family:Cinzel;font-weight:900' }, svg).textContent = `${kr(total)} kr`;
  el('text', { x: 120, y: 144, 'text-anchor': 'middle', 'font-size': 17, 'font-style': 'italic' }, svg).textContent = 'i alt';

  const leg = document.createElement('div');
  leg.className = 'legende';
  leg.innerHTML = data.map(([n, v, f]) => `<span><i style="background:${f}"></i>${n}: ${kr(v)} kr (${Math.round((v / total) * 100)} %)</span>`).join('');
  fig.appendChild(leg);
  fig.insertAdjacentHTML('beforeend', `<details><summary>Vis som tabel</summary><table>
    <tr><th>Post</th><th>Beløb</th></tr>
    <tr><td>Maden, 14 retter</td><td>${kr(mad)} kr</td></tr>
    <tr><td>Fragt</td><td>${kr(fragt)} kr</td></tr>
    <tr><td>Total</td><td>${kr(total)} kr</td></tr>
    <tr><td>Heraf moms</td><td>${kr(REGNSKAB.moms)} kr</td></tr>
    <tr><td>Pr. person, delt på ${REGNSKAB.personer}</td><td>${kr(total / REGNSKAB.personer, 2)} kr</td></tr></table></details>`);

  return (gsap) => buer.forEach(({ c, laengde, omkreds: o }, i) => {
    const s = { l: 0 };
    gsap.to(s, { l: laengde, duration: 1.6, delay: i * 0.9, ease: 'expo.out', onUpdate: () => c.setAttribute('stroke-dasharray', `${s.l} ${o}`) });
  });
}

function tegnStemning(fig) {
  if (!fig.dataset.klar) {
    fig.innerHTML = `<figcaption><h3>Forventet stemning</h3><p>Stemningsindeks fra dørene åbner, til taxaen kommer.</p></figcaption><div class="diagram__flade"></div>
      <details><summary>Vis som tabel</summary><table><tr><th>Klokken</th><th>Stemning</th></tr>
      ${STEMNING.map(([t, v, n]) => `<tr><td>${t}${n ? ` (${n})` : ''}</td><td>${v}</td></tr>`).join('')}</table></details>`;
    fig.dataset.klar = '1';
  }
  const holder = fig.querySelector('.diagram__flade');
  holder.innerHTML = '';
  const W = Math.max(280, holder.clientWidth || fig.clientWidth - 40);
  const H = Math.round(Math.max(230, Math.min(320, W * 0.52)));
  const m = { t: 34, r: 14, b: 30, l: 34 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Linjediagram over forventet stemning fra kl. 14 til 02. Toppunkt 100 ved fællessangen kl. 21.30.' }, holder);
  const x = (i) => m.l + (i / (STEMNING.length - 1)) * iw;
  const y = (v) => m.t + ih - (v / 100) * ih;
  const smal = W < 460;

  for (const v of [0, 50, 100]) {
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'akse' }, svg);
    el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 13 }, svg).textContent = v;
  }
  STEMNING.forEach(([t], i) => {
    if (smal && i % 2) return;
    el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 13 }, svg).textContent = t;
  });

  const defs = el('defs', {}, svg);
  const grad = el('linearGradient', { id: 'stemningsflade', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': LINJE, 'stop-opacity': 0.28 }, grad);
  el('stop', { offset: 1, 'stop-color': LINJE, 'stop-opacity': 0 }, grad);

  const pts = STEMNING.map(([, v], i) => [x(i), y(v)]);
  const d = pts.map(([px, py], i) => (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1)).join(' ');
  const flade = el('path', { d: `${d} L${x(STEMNING.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`, fill: 'url(#stemningsflade)' }, svg);
  const sti = el('path', { d, fill: 'none', stroke: LINJE, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);

  // Markører og etiketter kun på de tre øjeblikke, der betyder noget
  const noter = [];
  STEMNING.forEach(([, v, navn], i) => {
    if (!navn) return;
    const g = el('g', {}, svg);
    el('circle', { cx: x(i), cy: y(v), r: 5, fill: LINJE, stroke: FLADE, 'stroke-width': 2 }, g);
    const anchor = i === STEMNING.length - 1 ? 'end' : 'middle';
    const ty = v > 90 ? y(v) - 12 : y(v) + 22;
    el('text', { x: x(i) + (anchor === 'end' ? 6 : 0), y: ty, 'text-anchor': anchor, 'font-size': 14, 'font-style': 'italic', class: 'vaerdi' }, g).textContent = navn;
    noter.push(g);
  });

  // Crosshair og tooltip
  const kryds = el('line', { y1: m.t, y2: m.t + ih, stroke: 'rgba(246,240,228,.35)', 'stroke-width': 1, opacity: 0 }, svg);
  const prik = el('circle', { r: 5, fill: LINJE, stroke: FLADE, 'stroke-width': 2, opacity: 0 }, svg);
  const flade2 = el('rect', { x: m.l, y: 0, width: iw, height: H, fill: 'transparent' }, svg);
  const t = tip(fig);
  const flyt = (e) => {
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(STEMNING.length - 1, Math.round(((sx - m.l) / iw) * (STEMNING.length - 1))));
    const [tid, v, navn] = STEMNING[i];
    kryds.setAttribute('x1', x(i)); kryds.setAttribute('x2', x(i)); kryds.setAttribute('opacity', 1);
    prik.setAttribute('cx', x(i)); prik.setAttribute('cy', y(v)); prik.setAttribute('opacity', 1);
    const fr = fig.getBoundingClientRect();
    t.vis(`<strong>Kl. ${tid}</strong><br>Stemning ${v}${navn ? ` · ${navn}` : ''}`, r.left - fr.left + (x(i) / W) * r.width, r.top - fr.top + (y(v) / H) * r.height);
  };
  flade2.addEventListener('pointermove', flyt);
  flade2.addEventListener('pointerdown', flyt);
  flade2.addEventListener('pointerleave', () => { kryds.setAttribute('opacity', 0); prik.setAttribute('opacity', 0); t.skjul(); });

  return (gsap) => {
    if (!gsap) return;
    const l = sti.getTotalLength();
    gsap.fromTo(sti, { attr: { 'stroke-dasharray': l, 'stroke-dashoffset': l } }, { attr: { 'stroke-dashoffset': 0 }, duration: 2.4, ease: 'power2.inOut' });
    gsap.from(flade, { opacity: 0, duration: 1.2, delay: 1.2 });
    gsap.from(noter, { opacity: 0, y: 8, stagger: 0.5, duration: 0.6, delay: 0.8 });
  };
}
