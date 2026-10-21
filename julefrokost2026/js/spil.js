// Kampen om mandelgaven: følg mandlen, mens ti skåle blandes.

const ANTAL = 10;

const DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="porcelaen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9ecf2"/><stop offset="1" stop-color="#b9c0cf"/>
    </linearGradient>
    <radialGradient id="ris" cx=".4" cy=".35" r=".8">
      <stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#eadfc6"/>
    </radialGradient>
    <linearGradient id="kirsebaer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b3172b"/><stop offset="1" stop-color="#5b0712"/>
    </linearGradient>
  </defs>
</svg>`;

const SKAAL = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="90" rx="34" ry="5" fill="rgba(0,0,0,.45)"/>
  <path d="M7 46 Q9 86 50 88 Q91 86 93 46 Z" fill="url(#porcelaen)"/>
  <path d="M12 58 Q20 64 28 58 T44 58 T60 58 T76 58 T90 58" fill="none" stroke="#1d3f8f" stroke-width="2.2"/>
  <path d="M18 70 q4 -6 8 0 M40 74 q4 -6 8 0 M62 72 q4 -6 8 0" fill="none" stroke="#1d3f8f" stroke-width="1.6"/>
  <ellipse cx="50" cy="46" rx="43" ry="12" fill="#1d3f8f"/>
  <ellipse cx="50" cy="45.5" rx="40" ry="10" fill="url(#ris)"/>
  <path d="M30 44 q8 -7 20 -4 q14 -5 22 3 q-6 6 -20 5 q-14 3 -22 -4z" fill="url(#kirsebaer)"/>
  <g class="mandel"><ellipse cx="64" cy="40" rx="8" ry="4.6" transform="rotate(-18 64 40)" fill="#e9cc9c" stroke="#9a6c3c" stroke-width="1.2"/>
  <path d="M58 41 q6 -4 12 -3" stroke="#b58a58" stroke-width=".8" fill="none"/></g>
</svg>`;

export function startSpil({ gsap, lyd, regn, toast }) {
  const spil = document.getElementById('spil');
  const bord = document.getElementById('spil-bord');
  const knap = document.getElementById('spil-start');
  const instruks = document.getElementById('spil-instruks');
  const score = document.getElementById('spil-score');

  bord.insertAdjacentHTML('beforebegin', DEFS);
  const skaale = Array.from({ length: ANTAL }, (_, i) => {
    const b = document.createElement('button');
    b.className = 'skaal';
    b.type = 'button';
    b.setAttribute('aria-label', `Skål ${i + 1}`);
    b.innerHTML = SKAAL;
    bord.appendChild(b);
    return b;
  });

  // plads[i] er den position, skål i står på lige nu
  const plads = skaale.map((_, i) => i);
  const xy = (p) => ({ xPercent: (p % 5) * 100, yPercent: Math.floor(p / 5) * 160 });
  skaale.forEach((b, i) => gsap.set(b, xy(plads[i])));

  let mandel = -1, tilstand = 'klar', forsoeg = 0, vundet = 0;

  function opdaterLabels() {
    skaale.forEach((b, i) => b.setAttribute('aria-label', `Skål på plads ${plads[i] + 1}`));
  }
  opdaterLabels();

  knap.addEventListener('click', async () => {
    if (tilstand === 'blander') return;
    tilstand = 'blander';
    knap.disabled = true;
    spil.classList.remove('vaelg');
    skaale.forEach((b) => { b.classList.remove('vis-mandel'); gsap.set(b.querySelector('svg'), { clearProps: 'filter' }); });

    mandel = Math.floor(Math.random() * ANTAL);
    instruks.textContent = 'Se godt efter. Mandlen ryger i …';
    const m = skaale[mandel];
    m.classList.add('vis-mandel');
    const mEl = m.querySelector('.mandel');
    await gsap.fromTo(mEl, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'bounce.out' });
    lyd.klokkespil([1568, 2093], 0.08, 0.7);
    await gsap.to({}, { duration: 0.8 });
    instruks.textContent = 'Nu bliver der blandet!';
    m.classList.remove('vis-mandel');

    const runder = 14;
    for (let r = 0; r < runder; r++) {
      const a = Math.floor(Math.random() * ANTAL);
      let b = Math.floor(Math.random() * (ANTAL - 1)); if (b >= a) b++;
      [plads[a], plads[b]] = [plads[b], plads[a]];
      const varighed = Math.max(0.2, 0.55 - r * 0.028);
      lyd.tik();
      const pa = xy(plads[a]), pb = xy(plads[b]);
      await Promise.all([
        gsap.to(skaale[a], { keyframes: [{ yPercent: (pa.yPercent + xy(plads[b]).yPercent) / 2 - 45, xPercent: (pa.xPercent + pb.xPercent) / 2, duration: varighed / 2, ease: 'power1.out' }, { ...pa, duration: varighed / 2, ease: 'power1.in' }] }),
        gsap.to(skaale[b], { keyframes: [{ yPercent: (pa.yPercent + pb.yPercent) / 2 + 30, xPercent: (pa.xPercent + pb.xPercent) / 2, duration: varighed / 2, ease: 'power1.out' }, { ...pb, duration: varighed / 2, ease: 'power1.in' }] }),
      ]);
    }
    opdaterLabels();
    tilstand = 'vaelg';
    spil.classList.add('vaelg');
    instruks.textContent = 'Hvor er mandlen? Tryk på en skål.';
    skaale[0].focus({ preventScroll: true });
  });

  skaale.forEach((b, i) => b.addEventListener('click', () => {
    if (tilstand !== 'vaelg') return;
    tilstand = 'klar';
    spil.classList.remove('vaelg');
    forsoeg++;
    const rigtig = skaale[mandel];
    rigtig.classList.add('vis-mandel');
    gsap.fromTo(rigtig.querySelector('.mandel'), { scale: 0.2, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
    gsap.to(rigtig.querySelector('svg'), { filter: 'drop-shadow(0 0 18px rgba(251,230,166,.9))', duration: 0.4 });

    if (i === mandel) {
      vundet++;
      lyd.fanfare();
      const r = b.getBoundingClientRect();
      regn.konfetti(r.left + r.width / 2, r.top + r.height / 3, 220);
      instruks.textContent = 'Mandelgaven er din! Mamma har noteret det.';
      toast('Mandelgaven er din!');
      gsap.fromTo(b, { rotate: -8 }, { rotate: 0, duration: 1, ease: 'elastic.out(1, .3)' });
    } else {
      lyd.slag(0.35);
      instruks.textContent = 'Kun ris. Mandlen lå i den skål, der lyser.';
      gsap.fromTo(b, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, .2)' });
    }
    score.textContent = `Forsøg: ${forsoeg} · Mandelgaver: ${vundet}`;
    knap.textContent = 'Bland igen';
    knap.disabled = false;
  }));
}
