import { lyd } from './lyd.js';
import { PREMIERE, MAMMA, MEDVIRKENDE, statsFor, STATS, AKTER, RISALAMANDE, TJEKLISTE } from './data.js';
import { initRegnskab } from './regnskab.js';
import { startPakkeleg } from './pakkeleg.js';
import { startBillet } from './billet.js';
import * as regn from './regn.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const roligt = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobil = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
const finPeger = matchMedia('(pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

let scene = null;
let snemand = false;
let aktueltTema = 'sne';

console.log('%cJULEFROKOST 2026', 'font: 900 42px Cinzel, serif; color: #e7b95c; text-shadow: 0 2px 0 #7a0e1a');
console.log('%cDu kigger i kildekoden. Mamma ser dig.', 'font: italic 16px Georgia; color: #c9bea9');

// ---------- Indhold ----------

const GLAS = `<svg viewBox="0 0 26 40" aria-hidden="true"><path d="M3 2h20l-3 24c-.3 2-2 3-4 3h-6c-2 0-3.7-1-4-3z" fill="rgba(251,230,166,.12)" stroke="#e7b95c" stroke-width="1.5"/><path d="M5.5 12h15l-1.8 13.5c-.2 1.3-1.2 2-2.5 2h-6.4c-1.3 0-2.3-.7-2.5-2z" fill="rgba(251,230,166,.45)"/><path d="M13 29v8M7 38h12" stroke="#e7b95c" stroke-width="1.5"/></svg>`;

const statsHTML = (liste) => `<span class="stats">${liste.map(([navn, v]) => `
  <span class="stat"><span class="stat__navn">${navn}</span><span class="stat__tal">${v}</span>
  <span class="stat__bar"><span class="stat__fyld" style="--v:${v / 100}"></span></span></span>`).join('')}</span>`;

const delOp = (tekst) => tekst.split(' ').map((ord) =>
  `<span class="ord">${[...ord].map((b) => `<span class="bogstav">${b}</span>`).join('')}</span>`).join(' ');

function retHTML(ret, nr) {
  return `
  <article class="ret" id="ret-${nr}">
    <div class="ret__grid">
      <p class="ret__nr" aria-hidden="true">${String(nr).padStart(2, '0')}</p>
      <div class="ret__hoved">
        <p class="ret__taeller">Ret ${nr} af 14</p>
        <h3 class="ret__navn" aria-label="${ret.navn}" style="--ord:${Math.max(...ret.navn.split(' ').map((o) => o.length))}"><span aria-hidden="true">${delOp(ret.navn)}</span></h3>
        ${ret.med ? `<p class="ret__med">${ret.med}</p>` : ''}
      </div>
      <div class="ret__panel">
        <h4>Sommelierens note</h4>
        <p class="ret__note">${ret.note}</p>
        ${statsHTML(STATS.map((n, i) => [n, ret.stats[i]]))}
        <div class="ret__snaps">${GLAS}<p><strong>Anbefalet ledsager</strong>${ret.snaps}</p></div>
        ${ret.frikadelle ? '<div class="ret__ekstra"><button class="knap knap--diskret" data-frikadelleregn>Udløs frikadelleregn</button></div>' : ''}
      </div>
    </div>
  </article>`;
}

function bygIndhold() {
  const segl = $('.segl').outerHTML.replaceAll('seglbue', 'seglbue2').replaceAll('seglguld', 'seglguld2').replace('class="segl"', 'class="mamma-kort__segl"');
  $('#mamma').innerHTML = `
    <article class="mamma-kort">
      <div class="mamma-kort__portraet">
        <img src="assets/cast/mamma.jpg" alt="Mamma" width="480" height="600" loading="lazy">
        ${segl}
      </div>
      <div>
        <p class="mamma-kort__rolle">${MAMMA.rolle}</p>
        <h3 class="mamma-kort__navn guldtekst">${MAMMA.navn}</h3>
        <p class="mamma-kort__replik">“${MAMMA.replik}”</p>
        <p class="mamma-kort__evne">Særlig evne: ${MAMMA.evne}</p>
        ${statsHTML(Object.entries(MAMMA.stats))}
      </div>
    </article>`;

  $('#rolleliste').innerHTML = MEDVIRKENDE.map((p) => `
    <article class="kort" data-id="${p.id}">
      <button class="kort__inder" type="button" aria-pressed="false">
        <span class="kort__for">
          <img src="assets/cast/${p.id}.jpg" alt="" width="480" height="600" loading="lazy">
          <span class="kort__hint" aria-hidden="true">Vend ↻</span>
          <span class="kort__tekst"><span class="kort__navn">${p.navn}</span><span class="kort__rolle">${p.rolle}</span></span>
        </span>
        <span class="kort__bag">
          <span class="kort__navn">${p.navn}</span>
          <span class="kort__replik">“${p.replik}”</span>
          <span class="kort__evne">Særlig evne: ${p.evne}</span>
          ${statsHTML(statsFor(p.statsFra || p.id))}
        </span>
      </button>
    </article>`).join('');

  let nr = 0;
  $('#akter').innerHTML = AKTER.map((akt) => `
    <section class="akt" id="akt-${akt.id}" data-tema="${akt.tema}" data-scene="Akt ${akt.nr}: ${akt.navn}">
      <div class="akt__titel">
        <p class="akt__nr">Akt ${akt.nr}</p>
        <h2 class="akt__navn guldtekst" style="--tegn:${akt.navn.length}">${akt.navn}</h2>
        <p class="akt__under">${akt.undertitel}</p>
      </div>
      ${akt.retter.map((r) => retHTML(r, ++nr)).join('')}
    </section>`).join('');
  $('#finaleret').innerHTML = retHTML(RISALAMANDE, 14);
  $('#finale .akt__navn').style.setProperty('--tegn', RISALAMANDE.navn.length);

  nr = 0;
  $('#programliste').innerHTML = AKTER.map((akt) => `
    <div class="menukort__akt"><h3>Akt ${akt.nr}: ${akt.navn}</h3>
      <ol>${akt.retter.map((r) => `<li><a href="#ret-${++nr}">${r.navn}</a></li>`).join('')}</ol></div>`).join('') + `
    <div class="menukort__akt"><h3>Finale</h3><ol><li><a href="#ret-14">${RISALAMANDE.navn}</a></li></ol></div>
    <div class="menukort__akt"><h3>Efter desserten</h3><ol><li><a href="#pakkeleg">Pakkelegen</a></li></ol>
      <p class="menukort__pakke">Medbring én pakke til 50 kr. Må gerne overskrides.</p></div>`;

  $('#tjekliste').innerHTML = TJEKLISTE.map(([tekst, klar], i) => `
    <li><label><input type="checkbox" data-i="${i}" ${klar ? 'checked' : ''}><span>${tekst}</span></label></li>`).join('');

  const rulle = [
    ['<img src="assets/per-logo.png" alt="" width="90" height="90"><p class="rulle__note">En Per Susgaard produktion</p>'],
    ['<p class="rulle__stor guldtekst">Julefrokost 2026</p>'],
    ['Medvirkende', [['Executive Producer', 'Mamma'], ...MEDVIRKENDE.map((p) => [p.rolle, p.navn])]],
    ['Bag kameraet', [['Instruktør', 'Per Susgaard'], ['Location', 'Gudenåvej 106, Herning'], ['Catering', 'Slagter Lange'], ['Lyddesign', 'En browser'], ['Visuelle effekter', 'Unødvendigt mange'], ['Budget', '3.770 kr']]],
    ['Retterne', [['Silden', 'Sig selv'], ['Frikadellerne', 'Små, hjemmelavede'], ['Sylten', 'Kontroversiel'], ['Grønlangkålen', 'Som salat'], ['Pakkerne', 'Mindst 50 kr stykket']]],
    ['Tak til', [['Statskassen', 'For 754 kr i moms'], ['Rugbrødet', 'For fundamentet'], ['Dig', 'For at blive siddende']]],
    ['<p class="rulle__note">Ingen sild kom til skade under produktionen af denne hjemmeside. Det kommer de til den 7. november.</p>'],
  ];
  $('#rulle').innerHTML = rulle.map(([a, linjer]) => linjer
    ? `<div class="rulle__blok"><p class="rulle__overskrift">${a}</p>${linjer.map(([r, n]) => `<p class="rulle__linje"><span>${r}</span><span>${n}</span></p>`).join('')}</div>`
    : `<div class="rulle__blok">${a}</div>`).join('');
}

// ---------- Toast ----------

let toastTimer;
function toast(tekst) {
  const t = $('#toast');
  t.textContent = tekst;
  t.classList.add('vis');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('vis'), 3200);
}

// ---------- Smooth scroll ----------

let lenis = null;
if (!roligt && Lenis) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const rulTil = (maal) => {
  if (lenis) lenis.scrollTo(maal, { duration: 2.2, offset: typeof maal === 'number' ? 0 : -10 });
  else (typeof maal === 'number' ? scrollTo({ top: maal }) : $(maal).scrollIntoView());
};

// ---------- Indlæsning og tæppet ----------

const STATUS = ['Varmer frikadellerne', 'Marinerer sildene', 'Polerer guldet', 'Køler snapsen', 'Stryger dugen', 'Glaserer hamburgerryggen'];

function indlaes() {
  const startKnap = $('#start'), status = $('#status');
  const opgaver = [
    import('./scene3d.js')
      .then((m) => m.startScene($('#scene3d'), { mobil, roligt }))
      .then((s) => { scene = s; })
      .catch((e) => { console.warn('WebGL er ikke tilgængelig', e); document.body.classList.add('uden-webgl'); }),
    document.fonts.ready,
    ...['assets/crew-1280.jpg', 'assets/per-logo.png', 'assets/cast/mamma.jpg'].map((src) => new Promise((ok) => {
      const i = new Image(); i.onload = i.onerror = ok; i.src = src;
    })),
  ];
  let faerdige = 0, vist = 0, klar = false;
  opgaver.forEach((p) => p.then(() => { faerdige++; }));
  const tael = () => {
    const maal = (faerdige / opgaver.length) * 100;
    vist += Math.max(0.4, (maal - vist) * 0.08);
    vist = Math.min(vist, maal);
    const p = Math.floor(vist);
    if (p >= 100 || klar) {
      klar = true;
      status.textContent = 'Alt er klar · 100 %';
      startKnap.disabled = false;
      return;
    }
    status.textContent = `${STATUS[Math.min(STATUS.length - 1, Math.floor(p / 17))]} · ${p} %`;
    requestAnimationFrame(tael);
  };
  tael();
  // Nødudgang, hvis et CDN driller
  setTimeout(() => { klar = true; }, 12000);
  startKnap.addEventListener('click', () => {
    lyd.start();
    // iOS kræver tilladelse til bevægelsessensorer fra et tryk
    try { window.DeviceOrientationEvent?.requestPermission?.().catch(() => {}); } catch {}
    try { window.DeviceMotionEvent?.requestPermission?.().catch(() => {}); } catch {}
    koerIntro();
  }, { once: true });
}

// ---------- Introen ----------

let introTl = null, introSlut = false;

function titelInd() {
  const o = { p: 0 };
  gsap.to(o, { p: 1, duration: roligt ? 0.01 : 2.8, ease: 'elastic.out(1, 0.55)', onUpdate: () => scene?.saetIntro(o.p) });
  gsap.from('.hero__bund > *', { opacity: 0, y: 30, stagger: 0.18, duration: 1.2, delay: 0.6, ease: 'expo.out' });
}

function afslutIntro() {
  if (introSlut) return;
  introSlut = true;
  $('#gate').style.display = 'none';
  $('#intro').classList.remove('aktiv');
  document.body.classList.remove('indlaeser', 'intro-koerer');
  document.body.classList.add('klar');
  lenis?.start();
  ScrollTrigger.refresh();
  lyd.startMusik();
}

function koerIntro() {
  const intro = $('#intro');
  intro.classList.add('aktiv');
  document.body.classList.replace('indlaeser', 'intro-koerer');

  if (roligt) {
    gsap.to('#gate', { opacity: 0, duration: 0.4, onComplete: () => { afslutIntro(); titelInd(); } });
    return;
  }

  const tl = introTl = gsap.timeline({ onComplete: () => { afslutIntro(); } });
  tl.add(() => { lyd.whoosh(2.2); lyd.bjelder(2.4, 0.7); })
    .to('.gate__indhold', { opacity: 0, scale: 0.92, duration: 0.5, ease: 'power2.in' })
    .to('.taeppe--v', { xPercent: -100, scaleX: 0.5, duration: 2.3, ease: 'power3.inOut' }, '<0.1')
    .to('.taeppe--h', { xPercent: 100, scaleX: 0.5, duration: 2.3, ease: 'power3.inOut' }, '<')
    .to('.kappe', { yPercent: -110, duration: 1.3, ease: 'power2.in' }, '<1')
    .set('#gate', { display: 'none' })

    // Slagter Lange Pictures
    .add(() => { lyd.slag(0.9); lyd.fanfare(); }, '-=0.6')
    .to('.logo--lange', { opacity: 1, duration: 0.6 }, '<')
    .from('.lange__navn', { scale: 1.5, opacity: 0, duration: 1.8, ease: 'expo.out' }, '<')
    .from('.lange__pictures', { letterSpacing: '1.6em', opacity: 0, duration: 1.6, ease: 'expo.out' }, '<0.3')
    .to('.logo--lange', { opacity: 0, duration: 0.6 }, '+=1.1')

    // En Per Susgaard produktion
    .add(() => lyd.klokkespil([1046.5, 1568, 2093, 2637], 0.14, 0.9))
    .to('.logo--per', { opacity: 1, duration: 0.5 }, '<')
    .from('.logo--per img', { scale: 0.5, rotate: -25, opacity: 0, filter: 'blur(14px)', duration: 1.3, ease: 'expo.out' }, '<')
    .from('.logo--per p', { y: 24, opacity: 0, duration: 1 }, '<0.4')
    .to('.logo--per', { opacity: 0, duration: 0.5 }, '+=1')

    // Mamma Entertainment
    .set('.logo--mamma', { opacity: 1 })
    .from('.segl', { scale: 3.4, rotate: -40, opacity: 0, duration: 0.42, ease: 'power4.in' })
    .add(() => { lyd.slag(1.3); gsap.fromTo('#intro', { x: -14 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2, .2)' }); })
    .from('.logo--mamma p', { opacity: 0, y: 16, duration: 0.6 })
    .to('.logo--mamma', { opacity: 0, duration: 0.5 }, '+=1.1');

  // Trailerteksterne
  $$('.trailer p').forEach((p, i, alle) => {
    const sidste = i === alle.length - 1;
    tl.add(() => lyd.mumlen(sidste ? 2.2 : 1.5))
      .to(p, { opacity: 1, duration: 0.45 }, '<')
      .fromTo(p, { scale: 1.08 }, { scale: 1, duration: sidste ? 2 : 1.5, ease: 'none' }, '<')
      .to(p, { opacity: 0, duration: 0.35 }, sidste ? '+=0.1' : '-=0.35');
  });

  // BRAAAM
  tl.to('.blitz', { opacity: 1, duration: 0.06 })
    .add(() => { lyd.braam(1); titelInd(); })
    .set('#intro', { background: 'transparent' })
    .set(['.logo', '.trailer'], { display: 'none' })
    .to('.blitz', { opacity: 0, duration: 1.6, ease: 'power2.out' });

  $('#spring').addEventListener('click', springOver, { once: true });
}

function springOver() {
  if (!introTl || introSlut) return;
  introTl.progress(1, true).kill();
  $('#gate').style.display = 'none';
  lyd.braam(0.8);
  titelInd();
  afslutIntro();
}

// ---------- Scroll-scener ----------

function opsaetScener() {
  // Kameraflugt gennem titlen
  let whooshet = false;
  ScrollTrigger.create({
    trigger: '#premiere', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (s) => {
      scene?.saetScroll(s.progress);
      if (s.progress > 0.5 && !whooshet && s.direction > 0) { whooshet = true; lyd.whoosh(1.4); }
      if (s.progress < 0.2) whooshet = false;
    },
  });
  gsap.to('.hero__bund', { opacity: 0, y: -50, ease: 'none', scrollTrigger: { trigger: '#premiere', start: 'top top', end: '25% top', scrub: true } });
  gsap.to('.hero__fallback', { opacity: 0, scale: 1.6, ease: 'none', scrollTrigger: { trigger: '#premiere', start: 'top top', end: 'bottom bottom', scrub: true } });

  // Filmstrimmel
  gsap.to('.filmstrimmel__fyld', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // Tema og sceneskilt
  const scener = $$('[data-scene]');
  scener.forEach((sek, i) => {
    ScrollTrigger.create({
      trigger: sek, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => {
        if (!s.isActive) return;
        aktueltTema = sek.dataset.tema || 'sne';
        if (!snemand) scene?.saetTema(aktueltTema);
        $('#scene-nr').textContent = `Scene ${i + 1}`;
        $('#scene-navn').textContent = sek.dataset.scene;
        gsap.fromTo('.scene-skilt span', { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'expo.out' });
      },
    });
  });

  // Baseret på en sand historie
  const mm = gsap.matchMedia();
  const historieTl = (portraet) => {
    const img = $('.historie__billede img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#historien', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } });
    tl.to('.letterbox', { height: portraet ? '14%' : '11%', duration: 0.3, ease: 'power2.inOut' }, 0);
    if (portraet) tl.fromTo(img, { x: 0 }, { x: () => -(img.offsetWidth - innerWidth), duration: 1, ease: 'none' }, 0.1);
    else tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.1, ease: 'none' }, 0);
    tl.fromTo('.historie__tekst > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.25 }, 0.25)
      .fromTo('.historie__tekst', { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0.95);
  };
  mm.add('(orientation: portrait)', () => historieTl(true));
  mm.add('(orientation: landscape)', () => historieTl(false));
  ScrollTrigger.create({ trigger: '#historien', start: 'top 60%', once: true, onEnter: () => lyd.whoosh(1.6) });

  // Medvirkende
  ScrollTrigger.create({
    trigger: '.mamma-kort', start: 'top 75%', once: true,
    onEnter: () => {
      lyd.slag(0.7); lyd.klokkespil([784, 1046.5, 1318.5, 1568], 0.12, 0.8);
      gsap.from('.mamma-kort__portraet', { rotateY: -60, x: -80, opacity: 0, duration: 1.6, ease: 'expo.out' });
      gsap.from('.mamma-kort > div:last-child > *', { opacity: 0, x: 40, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.2 });
      setTimeout(() => $('.mamma-kort .stats').classList.add('fyldt'), 600);
    },
  });
  gsap.set('.kort', { opacity: 0, y: 90, rotateX: -30 });
  ScrollTrigger.batch('.kort', {
    start: 'top 92%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, rotateX: 0, stagger: 0.09, duration: 1.2, ease: 'expo.out' }),
  });

  // Menukortet
  gsap.fromTo('#menukort', { rotateX: 38, y: 140, opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '#program', start: 'top 90%', end: 'top 20%', scrub: 1 } });

  // Akttitler
  $$('.akt__titel').forEach((t) => {
    const navn = $('.akt__navn', t);
    gsap.fromTo(navn, { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: t, start: 'top 90%', end: 'center 55%', scrub: 1 } });
    gsap.fromTo([$('.akt__nr', t), $('.akt__under', t)], { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: t, start: 'top 40%', end: 'center 50%', scrub: 1 } });
    ScrollTrigger.create({ trigger: t, start: 'top 45%', once: true, onEnter: () => lyd.braam(0.45) });
  });

  // Retter
  $$('.ret').forEach((ret) => {
    const bogstaver = $$('.bogstav', ret), panel = $('.ret__panel', ret), stats = $('.ret__panel .stats', ret);
    gsap.fromTo($('.ret__nr', ret), { yPercent: -25 }, { yPercent: 25, ease: 'none', scrollTrigger: { trigger: ret, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (roligt) { stats.classList.add('fyldt'); return; }
    gsap.set(bogstaver, { yPercent: 110, opacity: 0, rotateX: -80 });
    gsap.set([$('.ret__taeller', ret), $('.ret__med', ret)].filter(Boolean), { opacity: 0, y: 20 });
    gsap.set(panel, { opacity: 0, x: mobil ? 0 : 60, y: mobil ? 40 : 0 });
    ScrollTrigger.create({
      trigger: ret, start: 'top 68%', once: true,
      onEnter: () => {
        lyd.slag(0.32);
        gsap.to(bogstaver, { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.022, duration: 0.9, ease: 'expo.out' });
        gsap.to([$('.ret__taeller', ret), $('.ret__med', ret)].filter(Boolean), { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'expo.out' });
        gsap.to(panel, { opacity: 1, x: 0, y: 0, duration: 1.3, delay: 0.25, ease: 'expo.out', onStart: () => setTimeout(() => stats.classList.add('fyldt'), 300) });
      },
    });
  });

  // Rulletekster
  const rulle = $('#rulle');
  gsap.to(rulle, {
    y: () => -(rulle.offsetHeight + innerHeight), ease: 'none',
    scrollTrigger: { trigger: '#rulletekster', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  });
  ScrollTrigger.create({
    trigger: '#efterscene', start: 'top 50%', once: true,
    onEnter: () => {
      lyd.braam(0.7);
      gsap.from('.efterscene__titel', { scale: 0.4, opacity: 0, duration: 1.8, ease: 'expo.out' });
    },
  });
}

// ---------- Kortene ----------

function opsaetKort() {
  let marcusTryk = 0, marcusTimer;
  $$('.kort').forEach((kort) => {
    const knap = $('.kort__inder', kort);
    knap.addEventListener('click', () => {
      const vendt = kort.classList.toggle('vendt');
      knap.setAttribute('aria-pressed', vendt);
      lyd.whoosh(0.5);
      if (vendt) { lyd.klokkespil([1568, 2093], 0.06, 0.5); setTimeout(() => $('.stats', kort).classList.add('fyldt'), 350); }
      if (kort.dataset.id === 'marcus') {
        marcusTryk++;
        clearTimeout(marcusTimer);
        marcusTimer = setTimeout(() => { marcusTryk = 0; }, 2500);
        if (marcusTryk >= 5) { marcusTryk = 0; skiftSnemand(); }
      }
    });
    if (!finPeger || roligt) return;
    kort.addEventListener('pointermove', (e) => {
      const r = kort.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      kort.style.setProperty('--ry', `${(px - 0.5) * 18}deg`);
      kort.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
      kort.style.setProperty('--gx', `${px * 100}%`);
      kort.style.setProperty('--gy', `${py * 100}%`);
      kort.style.setProperty('--glans', 1);
      knap.style.transition = 'transform .15s ease-out';
    });
    kort.addEventListener('pointerleave', () => {
      knap.style.transition = '';
      for (const v of ['--ry', '--rx', '--glans']) kort.style.removeProperty(v);
    });
  });
}

// ---------- Nedtælling, tjekliste og kalender ----------

function opsaetNedtaelling() {
  const felter = ['d', 't', 'm', 's'].map((k) => $(`#ur-${k}`));
  const cifre = (n) => String(n).padStart(2, '0').split('').map((c) => `<span class="ciffer">${c}</span>`).join('');
  let synlig = false;
  ScrollTrigger.create({ trigger: '#nedtaelling', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { synlig = s.isActive; } });
  const opdater = () => {
    const rest = PREMIERE - Date.now();
    if (rest <= 0) {
      felter.forEach((f) => { f.innerHTML = cifre(0); });
      $('#ur-tekst').textContent = rest > -12 * 3600e3 ? 'Vi er i gang. Skål!' : 'Tak for i år. Mamma er allerede i gang med 2027.';
      return;
    }
    const s = Math.floor(rest / 1000);
    const vaerdier = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    felter.forEach((f, i) => { f.innerHTML = cifre(vaerdier[i]); });
    if (synlig) lyd.tik();
  };
  opdater();
  setInterval(opdater, 1000);

  let gemt = {};
  try { gemt = JSON.parse(localStorage.getItem('jf26-tjek') || '{}'); } catch {}
  $$('#tjekliste input').forEach((cb) => {
    if (cb.dataset.i in gemt) cb.checked = gemt[cb.dataset.i];
    cb.addEventListener('change', () => {
      gemt[cb.dataset.i] = cb.checked;
      try { localStorage.setItem('jf26-tjek', JSON.stringify(gemt)); } catch {}
      lyd.klokkespil([cb.checked ? 1568 : 784], 0.1, 0.6);
      if ($$('#tjekliste input').every((c) => c.checked)) {
        lyd.fanfare();
        regn.konfetti(innerWidth / 2, innerHeight * 0.6, 200);
        toast('Alle systemer klar. Opsendelse godkendt.');
      }
    });
  });

  $('#kalender').addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//persusgaard.dk//Julefrokost 2026//DA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:julefrokost-2026@persusgaard.dk', 'DTSTAMP:20261021T120000Z',
      'DTSTART:20261107T130000Z', 'DTEND:20261108T010000Z', 'SUMMARY:Julefrokost 2026',
      'LOCATION:Gudenåvej 106\\, 7400 Herning',
      'DESCRIPTION:Fjorten retter. Elleve gæster. Ingen nåde. Husk en pakke til pakkelegen (50 kr\\, må gerne overskrides). https://persusgaard.dk/julefrokost2026/',
      'URL:https://persusgaard.dk/julefrokost2026/', 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'julefrokost-2026.ics' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    lyd.klokkespil([1318.5, 1568], 0.1, 0.7);
  });
}

// ---------- Påskeæg ----------

function skiftSnemand() {
  snemand = !snemand;
  document.body.classList.toggle('snemand', snemand);
  scene?.saetTema(snemand ? 'snemand' : aktueltTema);
  lyd.bjelder(2.4, 1);
  if (snemand) lyd.fanfare();
  toast(snemand ? 'Snemandstilstand aktiveret' : 'Snemandstilstand slået fra');
}

function opsaetPaaskeaeg() {
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', (e) => {
    pos = e.key === KONAMI[pos] ? pos + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (pos === KONAMI.length) { pos = 0; skiftSnemand(); }
  });

  const frikadelleregn = () => {
    regn.frikadeller(mobil ? 50 : 80);
    lyd.slag(0.5);
    setTimeout(() => lyd.slag(0.3), 500);
    toast('Det regner med frikadeller');
  };
  document.addEventListener('click', (e) => { if (e.target.closest('[data-frikadelleregn]')) frikadelleregn(); });

  // Ryst telefonen
  let sidst = 0, forrige = null;
  addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    if (forrige) {
      const delta = Math.abs(a.x - forrige.x) + Math.abs(a.y - forrige.y) + Math.abs(a.z - forrige.z);
      const nu = Date.now();
      if (delta > 32 && nu - sidst > 5000 && document.body.classList.contains('klar')) { sidst = nu; frikadelleregn(); }
    }
    forrige = { x: a.x, y: a.y, z: a.z };
  });
}

// ---------- Markør ----------

function opsaetMarkoer() {
  if (!finPeger || roligt) return;
  document.body.classList.add('har-markoer');
  const prik = $('.markoer__prik'), ring = $('.markoer__ring'), m = $('.markoer');
  const px = gsap.quickTo(prik, 'x', { duration: 0.08 }), py = gsap.quickTo(prik, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    px(e.clientX); py(e.clientY); rx(e.clientX); ry(e.clientY);
    m.classList.toggle('over', !!e.target.closest('a, button, input, label, .kort'));
  });
}

// ---------- Lyd-knap og links ----------

function opsaetKontroller() {
  const knap = $('#lyd'), tekst = $('.hud__lydtekst');
  const vis = () => { knap.setAttribute('aria-pressed', !lyd.slukket); tekst.textContent = lyd.slukket ? 'Lyd fra' : 'Lyd til'; };
  vis();
  knap.addEventListener('click', () => { lyd.start(); lyd.saetSlukket(!lyd.slukket); vis(); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    lyd.whoosh(1.2);
    rulTil(a.getAttribute('href'));
  });
  $('#forfra').addEventListener('click', () => { lyd.whoosh(2); rulTil(0); });
}

// ---------- Start ----------

history.scrollRestoration = 'manual';
scrollTo(0, 0);
bygIndhold();
opsaetKontroller();
opsaetKort();
opsaetScener();
opsaetNedtaelling();
opsaetPaaskeaeg();
opsaetMarkoer();
initRegnskab({ gsap, ScrollTrigger, lyd });
startPakkeleg({ gsap, lyd, regn, toast });
startBillet({ gsap, lyd, toast });
indlaes();
