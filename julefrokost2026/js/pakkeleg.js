// Pakkelegen: slå en sekser, tag en pakke. Elleve pakker på bordet, én pr. gæst.

const ANTAL = 11;
const FARVER = [
  ['#7a0e1a', '#e7b95c'], ['#1f5a35', '#f3e9d2'], ['#1d3f8f', '#fbe6a6'], ['#e7b95c', '#7a0e1a'], ['#f3e9d2', '#b01c2e'],
  ['#5b1a3a', '#e7b95c'], ['#b01c2e', '#f6f0e4'], ['#2f4a2c', '#e7b95c'], ['#8e5e1e', '#f6f0e4'], ['#0d2a3a', '#e7b95c'], ['#e7b95c', '#1f5a35'],
];
const INDHOLD = [
  'Spiselige trusser med ris a la mande-smag', 'Glidecreme i juleedition. Kanel og nelliker.',
  'En pebermølle formet som en pik', 'Kondomer med smag af sylte', 'Et pornoblad fra 1994 med klistrede sider',
  'En butt plug med julestjerne på', 'Håndjern i rød plys med bjælder', 'Bøjgaards underbukser. Han smed dem tidligere.',
  'Pikformede lakridser i gaveæske', 'En oppustelig nissepige, der allerede er punkteret',
  'Et gavekort til “massage” i en baggård i Ikast', 'Ti fingre. Til røven. Du ved hvorfor.', 'En vibrator uden batterier. Ligesom Rasmus efter kl. 22.',
];
// Øjnenes placering i et 3×3-gitter for hver side
const OEJNE = { 1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
// Kubens rotation, der vender en given side mod beskueren
const VEND = { 1: [0, 0], 2: [90, 0], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 6: [0, 180] };

const pakkeSVG = ([papir, baand]) => `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="94" rx="36" ry="4" fill="rgba(0,0,0,.45)"/>
  <g class="pakke__krop">
    <rect x="16" y="40" width="68" height="52" rx="3" fill="${papir}"/>
    <rect x="16" y="40" width="68" height="52" rx="3" fill="url(#pakkeglans)"/>
    <rect x="45" y="40" width="10" height="52" fill="${baand}"/>
  </g>
  <g class="pakke__laag">
    <rect x="11" y="28" width="78" height="15" rx="3" fill="${papir}"/>
    <rect x="11" y="28" width="78" height="15" rx="3" fill="url(#pakkeglans)"/>
    <rect x="45" y="28" width="10" height="15" fill="${baand}"/>
    <path d="M50 28 C38 10 22 16 30 26 C34 30 44 29 50 28 C56 29 66 30 70 26 C78 16 62 10 50 28Z" fill="${baand}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
  </g>
</svg>`;

export function startPakkeleg({ gsap, lyd, regn, toast }) {
  const terning = document.getElementById('terning');
  const knap = document.getElementById('slaa');
  const bord = document.getElementById('pakkebord');
  const status = document.getElementById('pakke-status');
  const score = document.getElementById('pakke-score');
  const vundet = document.getElementById('vundet');

  terning.innerHTML = [1, 2, 3, 4, 5, 6].map((n) => `
    <span class="terning__side terning__side--${n}">${Array.from({ length: 9 }, (_, i) => `<i${OEJNE[n].includes(i) ? ' class="oeje"' : ''}></i>`).join('')}</span>`).join('');

  bord.insertAdjacentHTML('beforebegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="pakkeglans" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  </defs></svg>`);

  let pakker = [], slag = 0, seksere = 0, ruller = false, rx = 0, ry = 0, puljen = [];

  function laegFrem() {
    bord.innerHTML = FARVER.slice(0, ANTAL).map((f, i) => `<div class="pakke" data-i="${i}">${pakkeSVG(f)}</div>`).join('');
    pakker = [...bord.children];
    vundet.innerHTML = '';
    puljen = [...INDHOLD].sort(() => Math.random() - 0.5);
    gsap.from(pakker, { y: -40, opacity: 0, rotate: () => (Math.random() - 0.5) * 30, stagger: 0.05, duration: 0.8, ease: 'bounce.out' });
  }
  laegFrem();

  async function slaa() {
    if (ruller) return;
    if (!pakker.some((p) => !p.classList.contains('taget'))) {
      laegFrem();
      knap.textContent = 'Slå med terningen';
      status.textContent = 'Pakkerne ligger klar igen. Slå en sekser for at tage en.';
      return;
    }
    ruller = true;
    knap.disabled = true;
    slag++;
    const tal = 1 + Math.floor(Math.random() * 6);
    const [vx, vy] = VEND[tal];
    // Mindst to hele omgange, og altid frem til en vinkel, der viser det rigtige tal
    const naeste = (nu, maal) => maal + 360 * Math.ceil((nu + 720 - maal) / 360);
    rx = naeste(rx, vx); ry = naeste(ry, vy);
    status.textContent = 'Terningen ruller …';
    const tik = setInterval(() => lyd.tik(), 90);
    await gsap.timeline()
      .to(terning, { y: -70, duration: 0.35, ease: 'power2.out' })
      .to(terning, { rotationX: rx, rotationY: ry, duration: 1.1, ease: 'power3.out' }, 0)
      .to(terning, { y: 0, duration: 0.55, ease: 'bounce.out' }, 0.35);
    clearInterval(tik);
    lyd.slag(0.4);

    if (tal === 6) {
      seksere++;
      const ledige = pakker.filter((p) => !p.classList.contains('taget'));
      const pakke = ledige[Math.floor(Math.random() * ledige.length)];
      const indhold = puljen.pop() || 'Endnu en pakke kondomer med sylte-smag';
      pakke.classList.add('taget');
      lyd.fanfare();
      const r = pakke.getBoundingClientRect();
      regn.konfetti(r.left + r.width / 2, r.top + r.height / 3, 160);
      await gsap.timeline()
        .to(pakke, { y: -30, rotate: -6, scale: 1.15, duration: 0.3, ease: 'power2.out' })
        .to(pakke.querySelector('.pakke__laag'), { y: -40, rotate: 25, opacity: 0, transformOrigin: '50% 100%', duration: 0.5, ease: 'power2.out' })
        .to(pakke, { y: 0, rotate: 0, scale: 1, opacity: 0.28, duration: 0.6, ease: 'power2.inOut' });
      const li = document.createElement('li');
      li.textContent = indhold;
      vundet.prepend(li);
      gsap.from(li, { opacity: 0, y: -12, duration: 0.6, ease: 'expo.out' });
      status.textContent = `Sekser! Du åbnede: ${indhold}.`;
      toast('Sekser! Tag en pakke');
    } else {
      status.textContent = `Du slog ${tal}. Send terningen videre.`;
    }
    score.textContent = `Slag: ${slag} · Seksere: ${seksere}`;
    if (!pakker.some((p) => !p.classList.contains('taget'))) {
      status.textContent = 'Alle pakker er taget. Nu begynder den del, hvor man må stjæle.';
      knap.textContent = 'Læg pakkerne frem igen';
    }
    knap.disabled = false;
    ruller = false;
  }

  knap.addEventListener('click', slaa);
  terning.addEventListener('click', slaa);
}
