// Den gyldne 3D-titel og vejret, der skifter med hver akt.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Baggrund, partikelfarve, fart og retning (1 = falder, -1 = stiger) pr. tema
const TEMAER = {
  sne:  { bg: 0x04060b, farve: 0xffffff, fart: 1.0, retning: 1, str: 1.0 },
  hav:  { bg: 0x011522, farve: 0x7cc8ff, fart: 0.5, retning: -1, str: 1.1 },
  glod: { bg: 0x1a0403, farve: 0xff6a1f, fart: 0.9, retning: -1, str: 0.9 },
  guld: { bg: 0x110b03, farve: 0xf3c463, fart: 0.3, retning: 1, str: 0.8 },
  data: { bg: 0x0d0700, farve: 0xffa020, fart: 2.4, retning: 1, str: 0.7 },
  snemand: { bg: 0x5a0610, farve: 0xffffff, fart: 1.6, retning: 1, str: 1.4 },
};

const SNE_VERTEX = /* glsl */`
  attribute vec4 aFroe;
  uniform float uForskyd, uTid, uHoejde, uStr, uPixel;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float fart = 0.55 + aFroe.w * 0.9;
    p.y = mod(p.y - uForskyd * fart + uHoejde * 0.5, uHoejde) - uHoejde * 0.5;
    p.x += sin(uTid * 0.6 + aFroe.w * 40.0) * 0.35;
    p.z += cos(uTid * 0.45 + aFroe.w * 25.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uStr * uPixel * (0.8 + aFroe.w * 2.2) * (30.0 / -mv.z);
    vAlpha = smoothstep(-36.0, -6.0, mv.z) * (1.0 - smoothstep(-1.5, 0.0, mv.z)) * (0.35 + aFroe.w * 0.65);
  }`;

const SNE_FRAGMENT = /* glsl */`
  uniform vec3 uFarve;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uFarve, a * a * vAlpha);
  }`;

export async function startScene(canvas, { mobil, roligt }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobil, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobil ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const bg = new THREE.Color(TEMAER.sne.bg);
  scene.background = bg;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);

  // Lys, der fejer hen over guldet og laver glimt
  const sweep = new THREE.PointLight(0xffe2a8, 22, 30, 1.6);
  const rim = new THREE.PointLight(0xff2a3a, 16, 30, 1.6);
  rim.position.set(0, 2, -4);
  scene.add(sweep, rim, new THREE.AmbientLight(0x402010, 0.6));

  // Titel
  const font = await new FontLoader().loadAsync('assets/cinzel-black.typeface.json');
  const front = new THREE.MeshStandardMaterial({ color: 0xf5c86a, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 });
  const side = new THREE.MeshStandardMaterial({ color: 0xa86c22, metalness: 1, roughness: 0.38, envMapIntensity: 1.2 });
  const titel = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.add(titel);
  scene.add(pivot);

  let titelBredde = 1, titelHoejde = 1, layout = '';
  function bygTitel() {
    const smal = innerWidth / innerHeight < 0.9;
    const ny = smal ? 'smal' : 'bred';
    if (ny === layout) return;
    layout = ny;
    titel.children.forEach((m) => m.geometry.dispose());
    titel.clear();
    const linjer = smal
      ? [['JULE', 1], ['FROKOST', 1], ['2026', 1.25]]
      : [['JULEFROKOST', 1], ['2026', 1.45]];
    let y = 0;
    const meshes = [];
    for (const [tekst, s] of linjer) {
      const geo = new TextGeometry(tekst, {
        font, size: s, height: 0.32 * s, curveSegments: mobil ? 5 : 8,
        bevelEnabled: true, bevelThickness: 0.06 * s, bevelSize: 0.035 * s, bevelSegments: mobil ? 2 : 4,
      });
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      geo.translate(-(bb.max.x + bb.min.x) / 2, 0, -(bb.max.z + bb.min.z) / 2);
      const m = new THREE.Mesh(geo, [front, side]);
      y -= s * 1.22;
      m.position.y = y;
      meshes.push(m);
      titel.add(m);
    }
    const box = new THREE.Box3().setFromObject(titel);
    titel.position.y = -(box.max.y + box.min.y) / 2;
    titelBredde = box.max.x - box.min.x;
    titelHoejde = box.max.y - box.min.y;
  }

  // Sne/partikler i et volumen omkring kameraets rute
  const antal = mobil ? 1400 : 3200;
  const pos = new Float32Array(antal * 3), froe = new Float32Array(antal * 4);
  for (let i = 0; i < antal; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 2] = -34 + Math.random() * 46;
    froe[i * 4 + 3] = Math.random();
  }
  const sneGeo = new THREE.BufferGeometry();
  sneGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sneGeo.setAttribute('aFroe', new THREE.BufferAttribute(froe, 4));
  const sneMat = new THREE.ShaderMaterial({
    vertexShader: SNE_VERTEX, fragmentShader: SNE_FRAGMENT,
    uniforms: {
      uForskyd: { value: 0 }, uTid: { value: 0 }, uHoejde: { value: 26 },
      uStr: { value: 1 }, uPixel: { value: renderer.getPixelRatio() }, uFarve: { value: new THREE.Color(0xffffff) },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const sne = new THREE.Points(sneGeo, sneMat);
  sne.frustumCulled = false;
  scene.add(sne);

  // Efterbehandling: bloom gør guldet varmt og glødende
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.55, 0.84);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const tilstand = {
    fart: 1, retning: 1, maalFart: 1, maalRetning: 1,
    maalBg: new THREE.Color(TEMAER.sne.bg), maalFarve: new THREE.Color(0xffffff), maalStr: 1,
    scroll: 0, intro: 0, mus: new THREE.Vector2(), musGlat: new THREE.Vector2(), forskyd: 0,
  };
  let afstand = 10, loeft = 0;

  function tilpas() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    bygTitel();
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const andelB = camera.aspect < 0.9 ? 0.86 : 0.78;
    // Titlen skal holde sig over dato og tagline, uanset skærmens højde
    const bund = document.querySelector('.hero__bund');
    const oevre = 0.1, nedre = bund ? Math.min(0.75, bund.offsetTop / h - 0.03) : 0.6;
    const andelH = Math.max(0.2, Math.min(0.5, nedre - oevre));
    afstand = Math.max(titelBredde / (andelB * 2 * tan * camera.aspect), titelHoejde / (andelH * 2 * tan)) + 0.4;
    loeft = 2 * afstand * tan * (0.5 - (oevre + nedre) / 2);
    camera.updateProjectionMatrix();
  }
  tilpas();
  addEventListener('resize', tilpas);

  addEventListener('pointermove', (e) => {
    tilstand.mus.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  });
  // Telefonens hældning styrer titlen (tilladelse bedes om ved første tryk på iOS)
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    tilstand.mus.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1));
  });

  const ur = new THREE.Clock();
  let aktiv = true;
  document.addEventListener('visibilitychange', () => { aktiv = !document.hidden; });

  function tegn() {
    requestAnimationFrame(tegn);
    if (!aktiv) return;
    const dt = Math.min(ur.getDelta(), 0.05), t = ur.elapsedTime;
    const k = 1 - Math.pow(0.02, dt);

    tilstand.fart += (tilstand.maalFart - tilstand.fart) * k;
    tilstand.retning += (tilstand.maalRetning - tilstand.retning) * k;
    if (!roligt) tilstand.forskyd += dt * tilstand.fart * tilstand.retning * 1.4;
    sneMat.uniforms.uForskyd.value = tilstand.forskyd;
    sneMat.uniforms.uTid.value = roligt ? 0 : t;
    sneMat.uniforms.uFarve.value.lerp(tilstand.maalFarve, k);
    sneMat.uniforms.uStr.value += (tilstand.maalStr - sneMat.uniforms.uStr.value) * k;
    bg.lerp(tilstand.maalBg, k);

    tilstand.musGlat.lerp(tilstand.mus, 1 - Math.pow(0.05, dt));
    const s = tilstand.scroll, i = tilstand.intro;
    // Kameraet flyver gennem titlen, mens man scroller ud af hero-sektionen
    const z = THREE.MathUtils.lerp(afstand, -3, Math.pow(s, 1.4));
    camera.position.set(tilstand.musGlat.x * 0.6 * (1 - s), -tilstand.musGlat.y * 0.35 * (1 - s) + 0.15, z);
    camera.lookAt(0, 0.15 * (1 - s), z - 10);
    sne.position.z = z - 12;

    pivot.visible = s < 0.995 && i > 0.001;
    pivot.scale.setScalar(0.55 + 0.45 * i);
    pivot.rotation.x = (1 - i) * -1.1 + tilstand.musGlat.y * 0.12;
    pivot.rotation.y = tilstand.musGlat.x * 0.25 + (roligt ? 0 : Math.sin(t * 0.25) * 0.06);
    pivot.position.y = (1 - i) * -3 + loeft;

    sweep.position.set(Math.sin(t * 0.7) * titelBredde * 0.6, loeft + Math.cos(t * 0.5) * 1.2 + 0.5, 4.5);
    sweep.intensity = 22 * i;

    if (pivot.visible) composer.render(dt);
    else renderer.render(scene, camera);
  }
  tegn();

  return {
    saetTema(navn) {
      const tm = TEMAER[navn] || TEMAER.sne;
      tilstand.maalBg.set(tm.bg); tilstand.maalFarve.set(tm.farve);
      tilstand.maalFart = tm.fart; tilstand.maalRetning = tm.retning; tilstand.maalStr = tm.str;
    },
    saetScroll(p) { tilstand.scroll = p; },
    saetIntro(p) { tilstand.intro = p; },
    get tilstand() { return tilstand; },
  };
}
