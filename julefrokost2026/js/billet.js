// Personlig gylden adgangsbillet, tegnet på canvas og klar til deling.

const PLADSER = ['Plads ved sylten', 'Plads ved snapsen', 'Plads ved Mamma', 'Plads ved frikadellerne', 'Plads tæt på ris a la manden', 'Plads med udsigt til Snemanden'];

function hash(s) {
  let h = 2166136261;
  for (const c of s.toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function tilpasTekst(ctx, tekst, maxB, str, vaegt, familie) {
  let s = str;
  do { ctx.font = `${vaegt} ${s}px ${familie}`; s -= 4; } while (ctx.measureText(tekst).width > maxB && s > 30);
}

export async function tegnBillet(canvas, navn) {
  await Promise.all([
    document.fonts.load('900 80px Cinzel'), document.fonts.load('700 80px Cinzel'),
    document.fonts.load('italic 400 40px "Cormorant Garamond"'),
  ]);
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, h = hash(navn);
  const kuvert = (h % 10) + 1, plads = PLADSER[(h >>> 4) % PLADSER.length];
  const serie = `JF26-${(h % 1e6).toString().padStart(6, '0')}`;
  const stubX = 1200, hak = 46, r = 28;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  // Billetform med halvcirkel-hak og perforering
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(stubX - 24, 0); ctx.arc(stubX, 0, 24, Math.PI, 0, true);
  ctx.lineTo(W - r, 0); ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H / 2 - hak); ctx.arc(W, H / 2, hak, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(W, H - r); ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(stubX + 24, H); ctx.arc(stubX, H, 24, 0, Math.PI, true);
  ctx.lineTo(r, H); ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, H / 2 + hak); ctx.arc(0, H / 2, hak, Math.PI / 2, -Math.PI / 2, true);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#fff1c4'); g.addColorStop(0.28, '#f0c86e'); g.addColorStop(0.5, '#c08a35');
  g.addColorStop(0.66, '#f6d68a'); g.addColorStop(1, '#d9a547');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Guillochemønster som på en pengeseddel
  ctx.lineWidth = 1;
  for (let k = 0; k < 34; k++) {
    ctx.strokeStyle = `rgba(122, 14, 26, ${0.05 + (k % 3) * 0.015})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = H / 2 + Math.sin(x / 70 + k * 0.45) * (60 + k * 7) * Math.cos(x / 400 + k * 0.1);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  // Glans
  const glans = ctx.createLinearGradient(0, 0, W, 0);
  glans.addColorStop(0.25, 'rgba(255,255,255,0)'); glans.addColorStop(0.4, 'rgba(255,255,255,.35)'); glans.addColorStop(0.55, 'rgba(255,255,255,0)');
  ctx.fillStyle = glans; ctx.fillRect(0, 0, W, H);

  // Kanter
  ctx.strokeStyle = 'rgba(43,3,8,.55)'; ctx.lineWidth = 3; ctx.setLineDash([10, 9]);
  ctx.strokeRect(34, 34, stubX - 68, H - 68);
  ctx.beginPath(); ctx.moveTo(stubX, 40); ctx.lineTo(stubX, H - 40); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(stubX + 34, 34, W - stubX - 68, H - 68);

  const ink = '#2b0308', velour = '#7a0e1a';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ink; ctx.textAlign = 'center';
  ctx.font = '700 26px Cinzel';
  ctx.letterSpacing = '10px';
  ctx.fillText('ADGANG FOR ÉN', stubX / 2, 112);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = velour;
  tilpasTekst(ctx, 'JULEFROKOST 2026', stubX - 160, 104, 900, 'Cinzel');
  ctx.fillText('JULEFROKOST 2026', stubX / 2, 228);

  ctx.fillStyle = ink;
  ctx.font = 'italic 400 40px "Cormorant Garamond"';
  ctx.fillText('Premiere lørdag 7. november 2026 kl. 14.00', stubX / 2, 290);
  ctx.font = 'italic 400 32px "Cormorant Garamond"';
  ctx.fillText('Gudenåvej 106, 7400 Herning', stubX / 2, 334);

  ctx.font = '600 24px Cinzel';
  ctx.letterSpacing = '6px';
  ctx.fillText('GÆST', stubX / 2, 392);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = velour;
  tilpasTekst(ctx, navn.toUpperCase(), stubX - 200, 120, 900, 'Cinzel');
  ctx.fillText(navn.toUpperCase(), stubX / 2, 508);

  ctx.fillStyle = ink;
  ctx.font = 'italic 400 38px "Cormorant Garamond"';
  ctx.fillText(`Kuvert ${kuvert} af 10 · ${plads}`, stubX / 2, 580);
  ctx.font = '700 22px Cinzel';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = velour;
  ctx.fillText('HUSK EN PAKKE TIL PAKKELEGEN · 50 KR', stubX / 2, 636);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = ink;

  // Stub
  const sx = stubX + (W - stubX) / 2;
  ctx.font = '700 22px Cinzel';
  ctx.letterSpacing = '6px';
  ctx.fillText('KUVERT', sx, 120);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = velour;
  ctx.font = '900 150px Cinzel';
  ctx.fillText(String(kuvert).padStart(2, '0'), sx, 268);
  ctx.fillStyle = ink;
  // Stregkode
  let bx = stubX + 70;
  const bBredde = W - stubX - 140;
  let n = h;
  while (bx < stubX + 70 + bBredde) {
    n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0;
    const b = 2 + (n % 5);
    if ((n >>> 8) % 3) ctx.fillRect(bx, 330, b, 210);
    bx += b + 2 + ((n >>> 12) % 3);
  }
  ctx.font = '600 26px Cinzel';
  ctx.fillText(serie, sx, 600);
  ctx.restore();
}

export function startBillet({ gsap, lyd, toast }) {
  const form = document.getElementById('billet-form');
  const input = document.getElementById('billet-navn');
  const visning = document.getElementById('billet-visning');
  const canvas = document.getElementById('billet-canvas');
  const del = document.getElementById('billet-del');
  const gem = document.getElementById('billet-gem');
  let navn = '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    navn = input.value.trim().replace(/\s+/g, ' ');
    if (!navn) { input.focus(); return; }
    await tegnBillet(canvas, navn);
    canvas.setAttribute('aria-label', `Billet til julefrokost 2026 for ${navn}`);
    visning.hidden = false;
    lyd.slag(0.6); lyd.klokkespil([1318.5, 1568, 2093, 2637], 0.09, 0.8);
    gsap.fromTo(canvas, { scale: 0.6, rotate: -8, opacity: 0, y: 60 }, { scale: 1, rotate: 0, opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' });
    if (!navigator.canShare) del.hidden = true;
  });

  const tilBlob = () => new Promise((ok) => canvas.toBlob(ok, 'image/png'));
  const filnavn = () => `julefrokost-2026-billet-${navn.toLowerCase().replace(/[^a-z0-9æøå]+/g, '-')}.png`;

  function hent(blob) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filnavn() });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  gem.addEventListener('click', async () => { hent(await tilBlob()); toast('Billetten er gemt'); });
  del.addEventListener('click', async () => {
    const blob = await tilBlob();
    const fil = new File([blob], filnavn(), { type: 'image/png' });
    if (navigator.canShare?.({ files: [fil] })) {
      try { await navigator.share({ files: [fil], title: 'Julefrokost 2026', text: 'Jeg har min billet. persusgaard.dk/julefrokost2026' }); }
      catch { /* brugeren lukkede delingen */ }
    } else {
      hent(blob);
      toast('Deling er ikke understøttet her, så billetten er gemt i stedet');
    }
  });
}
