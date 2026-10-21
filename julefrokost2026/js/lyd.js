// Al lyd syntetiseres i browseren med Web Audio. Ingen lydfiler, ingen rettigheder.

class Lyd {
  constructor() {
    this.ctx = null;
    this.slukket = false;
    try { this.slukket = localStorage.getItem('jf26-lyd') === 'fra'; } catch {}
  }

  // Skal kaldes fra et klik/tryk, ellers blokerer iOS lyden
  start() {
    if (this.ctx) return this.ctx.resume();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = this.slukket ? 0 : 0.9;
    const komp = ctx.createDynamicsCompressor();
    komp.threshold.value = -14; komp.ratio.value = 4;
    this.master.connect(komp).connect(ctx.destination);

    this.rum = ctx.createConvolver();
    this.rum.buffer = this.#impuls(3.2);
    this.rumSend = ctx.createGain();
    this.rumSend.gain.value = 0.35;
    this.rumSend.connect(this.rum).connect(this.master);

    this.stoej = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.stoej.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // iOS: spil en tom buffer for at låse op
    const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start();
  }

  get klar() { return !!this.ctx && !this.slukket; }

  saetSlukket(fra) {
    this.slukket = fra;
    try { localStorage.setItem('jf26-lyd', fra ? 'fra' : 'til'); } catch {}
    if (this.ctx) this.master.gain.setTargetAtTime(fra ? 0 : 0.9, this.ctx.currentTime, 0.08);
  }

  #impuls(sek) {
    const { ctx } = this, n = ctx.sampleRate * sek, b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let k = 0; k < 2; k++) {
      const d = b.getChannelData(k);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
    }
    return b;
  }

  #ud(node, vaad = 0.3) {
    node.connect(this.master);
    if (vaad) { const g = this.ctx.createGain(); g.gain.value = vaad; node.connect(g).connect(this.rumSend); }
  }

  #env(gain, t, a, peak, dec) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }

  #stoejKilde(t, dur) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.stoej; s.loop = true;
    s.start(t, Math.random()); s.stop(t + dur);
    return s;
  }

  // Det store filmtrailer-horn
  braam(styrke = 1) {
    if (!this.klar) return;
    const { ctx } = this, t = ctx.currentTime;
    const g = ctx.createGain(); this.#env(g, t, 0.06, 0.55 * styrke, 4.2);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
    lp.frequency.setValueAtTime(180, t);
    lp.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
    lp.frequency.exponentialRampToValueAtTime(260, t + 3.5);
    const ws = ctx.createWaveShaper(); ws.curve = forvraeng(18);
    lp.connect(ws).connect(g); this.#ud(g, 0.5);
    for (const [f, det] of [[36.7, 0], [36.7, 9], [55, -7], [73.4, 5], [110, -4]]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + 4.5);
    }
    const sub = ctx.createOscillator(), sg = ctx.createGain();
    sub.frequency.setValueAtTime(70, t); sub.frequency.exponentialRampToValueAtTime(32, t + 1.2);
    this.#env(sg, t, 0.02, 0.9 * styrke, 3); sub.connect(sg); this.#ud(sg, 0); sub.start(t); sub.stop(t + 3.2);
    navigator.vibrate?.([120, 60, 400]);
  }

  // Kort, tungt slag
  slag(styrke = 1) {
    if (!this.klar) return;
    const { ctx } = this, t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
    this.#env(g, t, 0.005, 0.8 * styrke, 0.9); o.connect(g); this.#ud(g, 0.4); o.start(t); o.stop(t + 1);
    const n = this.#stoejKilde(t, 0.4), ng = ctx.createGain(), bp = ctx.createBiquadFilter();
    bp.type = 'lowpass'; bp.frequency.value = 2400;
    this.#env(ng, t, 0.002, 0.5 * styrke, 0.3); n.connect(bp).connect(ng); this.#ud(ng, 0.6);
  }

  whoosh(dur = 1.2) {
    if (!this.klar) return;
    const { ctx } = this, t = ctx.currentTime;
    const n = this.#stoejKilde(t, dur + 0.1), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(250, t); bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.7);
    bp.frequency.exponentialRampToValueAtTime(900, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g); this.#ud(g, 0.4);
  }

  // Kaneklokker
  bjelder(dur = 1.6, styrke = 1) {
    if (!this.klar) return;
    const { ctx } = this, t0 = ctx.currentTime;
    for (let i = 0; i < dur * 14; i++) {
      const t = t0 + i / 14 + Math.random() * 0.03;
      const g = ctx.createGain(); this.#env(g, t, 0.002, 0.08 * styrke, 0.18);
      for (const f of [2637, 3520, 4186 + Math.random() * 600]) {
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
        o.connect(g); o.start(t); o.stop(t + 0.25);
      }
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
      const n = this.#stoejKilde(t, 0.08); n.connect(hp).connect(g);
      this.#ud(g, 0.5);
    }
  }

  klokkespil(toner = [1318.5, 1568, 2093], afstand = 0.12, styrke = 1) {
    if (!this.klar) return;
    const { ctx } = this, t0 = ctx.currentTime;
    toner.forEach((f, i) => {
      const t = t0 + i * afstand, g = ctx.createGain();
      this.#env(g, t, 0.004, 0.22 * styrke, 1.6);
      for (const [m, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f * m; og.gain.value = a;
        o.connect(og).connect(g); o.start(t); o.stop(t + 1.8);
      }
      this.#ud(g, 0.6);
    });
  }

  // Messing-fanfare (C-dur op til det høje C)
  fanfare() {
    if (!this.klar) return;
    const { ctx } = this, t0 = ctx.currentTime;
    const noder = [[0, 261.6, 0.18], [0.18, 329.6, 0.18], [0.36, 392, 0.18], [0.54, 523.3, 1.6]];
    for (const [dt, f, dur] of noder) {
      const t = t0 + dt, g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(600, t); lp.frequency.linearRampToValueAtTime(3200, t + 0.08);
      this.#env(g, t, 0.03, 0.18, dur);
      for (const [m, det] of [[1, -6], [1, 6], [1.5, 0], [0.5, 0]]) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * m; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
      }
      lp.connect(g); this.#ud(g, 0.5);
    }
    this.bjelder(1.8, 0.8);
  }

  tik() {
    if (!this.klar) return;
    const { ctx } = this, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 1800; this.#env(g, t, 0.001, 0.05, 0.03);
    o.connect(g); this.#ud(g, 0.1); o.start(t); o.stop(t + 0.06);
  }

  mumlen(dur = 1.4) {
    if (!this.klar) return;
    const { ctx } = this, t = ctx.currentTime;
    const n = this.#stoejKilde(t, dur), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 140;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(lp).connect(g); this.#ud(g, 0.3);
  }

  // Episk baggrundsflade: Dm, B♭, F, C
  startMusik() {
    if (!this.ctx || this.musik) return;
    const { ctx } = this;
    const bus = ctx.createGain(); bus.gain.value = 0;
    bus.gain.setTargetAtTime(0.07, ctx.currentTime, 2);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.7;
    bus.connect(lp); this.#ud(lp, 0.8);
    const akkorder = [[146.8, 174.6, 220, 293.7], [116.5, 174.6, 233.1, 293.7], [174.6, 220, 261.6, 349.2], [130.8, 196, 261.6, 329.6]];
    const stemmer = [0, 1, 2, 3].map(() => {
      const g = ctx.createGain(); g.gain.value = 0.25; g.connect(bus);
      const oscs = [-7, 7].map((det) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = det; o.connect(g); o.start(); return o;
      });
      return oscs;
    });
    let i = 0;
    const skift = () => {
      const a = akkorder[i++ % akkorder.length], t = ctx.currentTime;
      stemmer.forEach((oscs, k) => oscs.forEach((o) => o.frequency.setTargetAtTime(a[k], t, 0.4)));
      if (Math.random() < 0.6) setTimeout(() => this.bjelder(0.8, 0.35), 900);
    };
    skift();
    this.musik = { bus, timer: setInterval(skift, 4200) };
  }
}

function forvraeng(k) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  return c;
}

export const lyd = new Lyd();
