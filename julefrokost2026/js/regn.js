// Frikadelleregn og konfetti på et 2D-lærred over hele siden.

const laerred = document.getElementById('regn');
const ctx = laerred.getContext('2d');
let W = 0, H = 0, partikler = [], koerer = false;

function tilpas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  laerred.width = W * dpr; laerred.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
tilpas();
addEventListener('resize', tilpas);

// Tre frikadelle-varianter tegnes én gang og genbruges
const sprites = [0, 1, 2].map((v) => {
  const s = 96, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.translate(s / 2, s / 2);
  g.scale(1, 0.86 + v * 0.05);
  const grad = g.createRadialGradient(-12, -14, 4, 0, 0, 44);
  grad.addColorStop(0, '#c98a4b'); grad.addColorStop(0.45, '#8a4c22'); grad.addColorStop(1, '#3f1e0c');
  g.fillStyle = grad;
  g.beginPath();
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 12) {
    const r = 42 + Math.sin(a * 5 + v) * 1.8 + Math.cos(a * 3 + v * 2) * 1.4;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.fill();
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 34;
    g.fillStyle = Math.random() < 0.5 ? 'rgba(40,18,6,.55)' : 'rgba(230,170,110,.35)';
    g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 1 + Math.random() * 2.4, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(255,240,210,.35)';
  g.beginPath(); g.ellipse(-14, -18, 12, 6, -0.6, 0, 7); g.fill();
  return c;
});

const KONFETTI_FARVER = ['#fbe6a6', '#e7b95c', '#b01c2e', '#f6f0e4', '#2f6b3a', '#d9a547'];

export function frikadeller(antal = 70) {
  for (let i = 0; i < antal; i++) {
    partikler.push({
      type: 'f', x: Math.random() * W, y: -40 - Math.random() * H * 0.9,
      vx: (Math.random() - 0.5) * 3, vy: Math.random() * 3,
      r: 16 + Math.random() * 18, rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.2,
      sprite: sprites[i % 3], liv: 0, maxLiv: 260 + Math.random() * 80,
    });
  }
  start();
}

export function konfetti(x = W / 2, y = H / 2, antal = 180) {
  for (let i = 0; i < antal; i++) {
    const a = Math.random() * Math.PI * 2, fart = 4 + Math.random() * 11;
    partikler.push({
      type: 'k', x, y, vx: Math.cos(a) * fart, vy: Math.sin(a) * fart - 7,
      w: 6 + Math.random() * 6, h: 10 + Math.random() * 8,
      rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.4, fase: Math.random() * 6.3,
      farve: KONFETTI_FARVER[i % KONFETTI_FARVER.length], liv: 0, maxLiv: 170 + Math.random() * 90,
    });
  }
  start();
}

function start() {
  if (koerer) return;
  koerer = true;
  requestAnimationFrame(trin);
}

function trin() {
  ctx.clearRect(0, 0, W, H);
  partikler = partikler.filter((p) => p.liv < p.maxLiv && p.y < H + 200);
  for (const p of partikler) {
    p.liv++;
    const alpha = Math.min(1, (p.maxLiv - p.liv) / 40);
    if (p.type === 'f') {
      p.vy += 0.42; p.vx *= 0.995;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > H - p.r * 0.8) { p.y = H - p.r * 0.8; p.vy *= -0.42; p.vx *= 0.82; p.vr *= 0.7; }
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.drawImage(p.sprite, -p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    } else {
      p.vy += 0.2; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.fase += 0.18;
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.fase));
      ctx.fillStyle = p.farve; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
  if (partikler.length) requestAnimationFrame(trin);
  else { koerer = false; ctx.clearRect(0, 0, W, H); }
}
