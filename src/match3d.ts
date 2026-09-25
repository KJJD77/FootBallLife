import * as THREE from 'three';
import type { HighlightType } from './types';

export interface HighlightOpts {
  type: HighlightType; name: string; number: number; skin: string;
  team: [string, string]; opp: [string, string]; caption: string;
}

type Key = { t: number; x: number; z: number; y?: number; arc?: number };

interface Script {
  duration: number; goalAt: number | null; ball: Key[];
  hero: Key[]; mate?: Key[]; foe?: Key[]; keeperDive?: { t: number; z: number };
  label: string;
}

function scriptFor(type: HighlightType): Script {
  switch (type) {
    case 'goal': return {
      duration: 6.8, goalAt: 4.3, label: 'GOAL!',
      mate: [{ t: 0, x: 4, z: -12 }, { t: 1.4, x: 12, z: -8 }, { t: 6.8, x: 24, z: -2 }],
      hero: [{ t: 0, x: 14, z: 10 }, { t: 1.2, x: 21, z: 6 }, { t: 3.3, x: 35, z: 2 }, { t: 4.4, x: 38, z: 3 }, { t: 6.8, x: 45, z: 24 }],
      foe: [{ t: 0, x: 26, z: 4 }, { t: 2.4, x: 32, z: 6 }, { t: 3.6, x: 35, z: 4.5 }, { t: 6.8, x: 33, z: 6 }],
      ball: [{ t: 0, x: 4.5, z: -11.5 }, { t: 1.2, x: 21.5, z: 5.8, arc: 0.6 }, { t: 2.3, x: 28, z: 4 }, { t: 3.3, x: 35.8, z: 1.8 }, { t: 4.3, x: 52.6, z: -2.6, y: 0.9, arc: 0.8 }, { t: 6.8, x: 53.4, z: -2.8 }],
      keeperDive: { t: 3.6, z: 2.2 },
    };
    case 'longshot': return {
      duration: 6.4, goalAt: 4.2, label: '世界波！',
      mate: [{ t: 0, x: 10, z: 14 }, { t: 6.4, x: 20, z: 12 }],
      hero: [{ t: 0, x: 18, z: -4 }, { t: 1.4, x: 22, z: -1 }, { t: 2.8, x: 27, z: 0 }, { t: 6.4, x: 38, z: -20 }],
      foe: [{ t: 0, x: 34, z: -2 }, { t: 2.8, x: 31, z: 0 }, { t: 6.4, x: 32, z: -2 }],
      ball: [{ t: 0, x: 10.5, z: 13.5 }, { t: 1.4, x: 22.5, z: -1, arc: 1.2 }, { t: 2.8, x: 27.8, z: 0 }, { t: 4.2, x: 52.6, z: 3.1, y: 2.2, arc: 3.2 }, { t: 6.4, x: 53.4, z: 3.1 }],
      keeperDive: { t: 3.7, z: 2.6 },
    };
    case 'freekick': return {
      duration: 6, goalAt: 3.6, label: '直接任意球！',
      hero: [{ t: 0, x: 25, z: 8 }, { t: 2.2, x: 29.2, z: 3.8 }, { t: 2.6, x: 30.4, z: 3.1 }, { t: 6, x: 38, z: 22 }],
      foe: [{ t: 0, x: 39, z: 0.6 }, { t: 6, x: 39, z: 0.6 }],
      ball: [{ t: 0, x: 30, z: 3 }, { t: 2.4, x: 30, z: 3 }, { t: 3.0, x: 41, z: 1.2, y: 3.1, arc: 0.6 }, { t: 3.6, x: 52.6, z: -2.9, y: 2.1, arc: 0.3 }, { t: 6, x: 53.4, z: -2.9 }],
      keeperDive: { t: 3.2, z: -1.2 },
    };
    case 'assist': return {
      duration: 6.8, goalAt: 4.6, label: '妙传助攻！',
      hero: [{ t: 0, x: 16, z: 26 }, { t: 2.6, x: 40, z: 28 }, { t: 3.2, x: 42, z: 27 }, { t: 6.8, x: 46, z: 12 }],
      mate: [{ t: 0, x: 30, z: 4 }, { t: 3.6, x: 46, z: 1 }, { t: 6.8, x: 44, z: 20 }],
      foe: [{ t: 0, x: 30, z: 20 }, { t: 2.6, x: 38, z: 24 }, { t: 6.8, x: 40, z: 22 }],
      ball: [{ t: 0, x: 16.8, z: 25.8 }, { t: 1.3, x: 28, z: 27 }, { t: 2.6, x: 40.8, z: 27.8 }, { t: 3.9, x: 46.4, z: 1, y: 1.8, arc: 4.5 }, { t: 4.6, x: 52.6, z: -1.8, y: 0.8, arc: 0.3 }, { t: 6.8, x: 53.4, z: -2 }],
      keeperDive: { t: 4.1, z: 2 },
    };
    case 'header': return {
      duration: 6.4, goalAt: 4.1, label: '头球破门！',
      mate: [{ t: 0, x: 52, z: 33 }, { t: 6.4, x: 50, z: 30 }],
      hero: [{ t: 0, x: 38, z: -4 }, { t: 3.2, x: 46.6, z: 0.4 }, { t: 3.4, x: 46.6, z: 0.4, y: 0.8 }, { t: 3.8, x: 46.8, z: 0.5 }, { t: 6.4, x: 40, z: -20 }],
      foe: [{ t: 0, x: 44, z: 2 }, { t: 3.3, x: 46, z: 1.6 }, { t: 6.4, x: 46, z: 2 }],
      ball: [{ t: 0, x: 52.2, z: 33.2 }, { t: 1.2, x: 52.2, z: 33.2 }, { t: 3.4, x: 46.8, z: 0.5, y: 2.3, arc: 7 }, { t: 4.1, x: 52.6, z: 2.4, y: 1.6, arc: 0.2 }, { t: 6.4, x: 53.4, z: 2.4 }],
      keeperDive: { t: 3.6, z: -1 },
    };
    case 'tackle': return {
      duration: 5.6, goalAt: null, label: '关键拦截！',
      hero: [{ t: 0, x: -18, z: 12 }, { t: 2.6, x: -31, z: 3.4 }, { t: 3.0, x: -33, z: 2.2, y: -0.4 }, { t: 3.6, x: -33.6, z: 2 }, { t: 5.6, x: -30, z: 6 }],
      foe: [{ t: 0, x: -12, z: 6 }, { t: 2.8, x: -32, z: 2 }, { t: 3.4, x: -34, z: 1 }, { t: 5.6, x: -34, z: 0 }],
      mate: [{ t: 0, x: -40, z: -8 }, { t: 5.6, x: -26, z: 14 }],
      ball: [{ t: 0, x: -12.8, z: 6 }, { t: 1.4, x: -22.5, z: 4 }, { t: 2.8, x: -32.6, z: 2 }, { t: 3.1, x: -32.6, z: 2 }, { t: 4.4, x: -24, z: 14, arc: 1.5 }, { t: 5.6, x: -20, z: 16 }],
    };
  }
}

const ease = (s: number) => s * s * (3 - 2 * s);
function sample(keys: Key[], t: number): THREE.Vector3 {
  if (t <= keys[0].t) return new THREE.Vector3(keys[0].x, keys[0].y ?? 0, keys[0].z);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const s = (t - a.t) / Math.max(0.0001, b.t - a.t), e = b.arc !== undefined ? s : ease(s);
      const y = (a.y ?? 0) + ((b.y ?? 0) - (a.y ?? 0)) * s + (b.arc ?? 0) * 4 * s * (1 - s);
      return new THREE.Vector3(a.x + (b.x - a.x) * e, y, a.z + (b.z - a.z) * e);
    }
  }
  const l = keys[keys.length - 1];
  return new THREE.Vector3(l.x, l.y ?? 0, l.z);
}

function pitchTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
  const x = c.getContext('2d')!;
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#2f8f3a' : '#39a346'; x.fillRect(i * 75, 0, 75, 800); }
  const m = (v: number) => v * 10;
  x.strokeStyle = '#f4f4f4'; x.lineWidth = 3;
  const ox = 75, oz = 60;
  x.strokeRect(ox, oz, m(105), m(68));
  x.beginPath(); x.moveTo(600, oz); x.lineTo(600, oz + m(68)); x.stroke();
  x.beginPath(); x.arc(600, 400, m(9.15), 0, Math.PI * 2); x.stroke();
  for (const side of [0, 1]) {
    const bx = side ? ox + m(105) - m(16.5) : ox, gx = side ? ox + m(105) - m(5.5) : ox;
    x.strokeRect(bx, 400 - m(20.16), m(16.5), m(40.32));
    x.strokeRect(gx, 400 - m(9.16), m(5.5), m(18.32));
    x.beginPath(); x.arc(side ? ox + m(105) - m(11) : ox + m(11), 400, 3, 0, Math.PI * 2); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelSprite(text: string, color: string): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(0,0,0,.65)'; x.beginPath(); x.roundRect(8, 8, 240, 48, 14); x.fill();
  x.fillStyle = color; x.fillRect(8, 8, 10, 48);
  x.font = 'bold 28px sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 134, 33);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  s.scale.set(4, 1, 1);
  return s;
}

function makePlayer(c1: string, c2: string, skin: string): THREE.Group {
  const g = new THREE.Group();
  const shirt = new THREE.MeshStandardMaterial({ color: c1, roughness: 0.6 });
  const shorts = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.7 });
  const sk = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 4, 10), shirt); body.position.y = 1.15;
  const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 4, 8), shorts); legs.position.y = 0.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), sk); head.position.y = 1.75;
  [body, legs, head].forEach(m => { m.castShadow = true; g.add(m); });
  return g;
}

export function playHighlight(host: HTMLElement, o: HighlightOpts): { replay: () => void; dispose: () => void } {
  const W = host.clientWidth || 640, H = host.clientHeight || 300;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a1a2e');
  scene.fog = new THREE.Fog('#0a1a2e', 90, 180);
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 400);

  scene.add(new THREE.HemisphereLight(0xdfefff, 0x224422, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(20, 60, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50 });
  scene.add(sun);

  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.MeshStandardMaterial({ map: pitchTexture(), roughness: 0.95 }));
  pitch.rotation.x = -Math.PI / 2; pitch.receiveShadow = true; scene.add(pitch);

  // 看台 + 观众
  const standMat = new THREE.MeshStandardMaterial({ color: '#263238' });
  const crowdGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
  const crowdMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  const palette = [o.team[0], o.team[1], o.opp[0], '#fafafa', '#ffd54f', '#90a4ae'].map(c => new THREE.Color(c));
  const seats: THREE.Matrix4[] = [];
  const stands: [number, number, number, number][] = [[0, -46, 124, 0], [0, 46, 124, Math.PI], [-66, 0, 84, Math.PI / 2], [66, 0, 84, -Math.PI / 2]];
  for (const [sx, sz, len, rot] of stands) {
    for (let row = 0; row < 8; row++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(len, 1, 1.4), standMat);
      const off = row * 1.4;
      step.position.set(sz ? sx : sx + Math.sign(sx) * off, row * 0.9 + 0.5, sz ? sz + Math.sign(sz) * off : 0);
      step.rotation.y = rot; scene.add(step);
      for (let i = 0; i < len / 1.1; i++) {
        if (Math.random() < 0.18) continue;
        const along = -len / 2 + i * 1.1 + 0.5;
        const m = new THREE.Matrix4();
        const px = sz ? along : step.position.x, pz = sz ? step.position.z : along;
        m.makeTranslation(px + (Math.random() - 0.5) * 0.2, row * 0.9 + 1.35, pz);
        seats.push(m);
      }
    }
  }
  const crowd = new THREE.InstancedMesh(crowdGeo, crowdMat, seats.length);
  seats.forEach((m, i) => { crowd.setMatrixAt(i, m); crowd.setColorAt(i, palette[Math.floor(Math.random() * palette.length)]); });
  scene.add(crowd);

  // 球门
  const white = new THREE.MeshStandardMaterial({ color: '#ffffff' });
  const nets: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const gx = side * 52.5;
    for (const z of [-3.66, 3.66]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.44), white); post.position.set(gx, 1.22, z); post.castShadow = true; scene.add(post); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.32), white); bar.rotation.x = Math.PI / 2; bar.position.set(gx, 2.44, 0); scene.add(bar);
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32, 6, 6, 14), new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.35 }));
    net.position.set(gx + side * 1, 1.22, 0); scene.add(net); nets.push(net);
  }
  const oppNet = nets[1];

  // 球员
  const s = scriptFor(o.type);
  const hero = makePlayer(o.team[0], o.team[1], o.skin);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.85, 32), new THREE.MeshBasicMaterial({ color: '#ffd54f', side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; hero.add(ring);
  const tag = labelSprite(`${o.number} ${o.name}`, o.team[0]); tag.position.y = 2.8; hero.add(tag);
  scene.add(hero);
  const mate = makePlayer(o.team[0], o.team[1], '#c68642'); scene.add(mate);
  const foe = makePlayer(o.opp[0], o.opp[1], '#e0ac69'); scene.add(foe);
  const keeper = makePlayer('#ffeb3b', '#222222', '#d1a176'); keeper.position.set(51.6, 0, 0); scene.add(keeper);
  const ourKeeper = makePlayer('#00e676', '#222222', '#a8764f'); ourKeeper.position.set(-51.6, 0, 0); scene.add(ourKeeper);
  const extras: { g: THREE.Group; base: THREE.Vector3 }[] = [];
  const formation = [[-35, -15], [-35, 15], [-38, -5], [-38, 5], [-15, -20], [-15, 0], [-15, 20], [5, -10], [5, 12]];
  formation.forEach(([x, z], i) => {
    const g1 = makePlayer(o.team[0], o.team[1], i % 2 ? '#f1c27d' : '#8d5524');
    const b1 = new THREE.Vector3(x + 20, 0, z); g1.position.copy(b1); scene.add(g1); extras.push({ g: g1, base: b1 });
    const g2 = makePlayer(o.opp[0], o.opp[1], i % 2 ? '#ffdbac' : '#c68642');
    const b2 = new THREE.Vector3(-x + 10, 0, -z * 0.9); g2.position.copy(b2); scene.add(g2); extras.push({ g: g2, base: b2 });
  });

  // 足球
  const bc = document.createElement('canvas'); bc.width = 128; bc.height = 64;
  const bx = bc.getContext('2d')!; bx.fillStyle = '#fff'; bx.fillRect(0, 0, 128, 64); bx.fillStyle = '#111';
  for (let i = 0; i < 10; i++) { bx.beginPath(); bx.arc((i * 29) % 128, (i * 17) % 64, 7, 0, Math.PI * 2); bx.fill(); }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(bc), roughness: 0.4 }));
  ball.castShadow = true; scene.add(ball);

  // 覆盖层
  const overlay = document.createElement('div'); overlay.className = 'hl-overlay';
  overlay.innerHTML = `<div class="hl-caption">${o.caption}</div><div class="hl-big"></div>`;
  host.appendChild(overlay);
  const big = overlay.querySelector('.hl-big') as HTMLElement;

  const camPos = new THREE.Vector3(0, 16, 30), camLook = new THREE.Vector3();
  let start = performance.now(), raf = 0, shown = false;
  const face = (g: THREE.Group, prev: THREE.Vector3, cur: THREE.Vector3) => {
    const dx = cur.x - prev.x, dz = cur.z - prev.z;
    if (dx * dx + dz * dz > 1e-5) g.rotation.y = Math.atan2(dx, dz);
  };
  let lastHero = new THREE.Vector3();

  const tick = () => {
    const t = Math.min((performance.now() - start) / 1000, s.duration + 1.2);
    const bp = sample(s.ball, t);
    ball.position.set(bp.x, bp.y + 0.22, bp.z);
    ball.rotation.z -= 0.15; ball.rotation.x += 0.07;
    const hp = sample(s.hero, t);
    face(hero, lastHero, hp); lastHero = hp.clone();
    hero.position.set(hp.x, Math.max(0, hp.y), hp.z);
    hero.rotation.x = hp.y < 0 ? -1.1 : 0; // 铲球
    ring.visible = hp.y >= 0;
    if (s.mate) mate.position.copy(sample(s.mate, t)); else mate.visible = false;
    if (s.foe) foe.position.copy(sample(s.foe, t)); else foe.visible = false;
    if (o.type === 'freekick') { foe.visible = true; }
    // 门将
    if (s.keeperDive && t > s.keeperDive.t) {
      const k = Math.min(1, (t - s.keeperDive.t) / 0.35);
      keeper.position.z = s.keeperDive.z * k; keeper.position.y = 0.6 * Math.sin(k * Math.PI);
      keeper.rotation.x = -Math.sign(s.keeperDive.z) * k * 1.3;
    } else { keeper.position.z = THREE.MathUtils.clamp(bp.z * 0.12, -2.5, 2.5); keeper.position.y = 0; keeper.rotation.x = 0; }
    // 其他球员向球移动
    extras.forEach(({ g: e, base }, i) => {
      const target = base.clone().lerp(new THREE.Vector3(bp.x, 0, bp.z), 0.25 + (i % 3) * 0.05);
      const prev = e.position.clone();
      e.position.lerp(target, 0.02);
      face(e, prev, e.position);
    });
    // 进球
    if (s.goalAt !== null && t >= s.goalAt) {
      const k = t - s.goalAt;
      oppNet.scale.set(1 + Math.sin(k * 20) * 0.08 * Math.exp(-k * 2), 1, 1);
      if (!shown) { shown = true; big.textContent = s.label; big.classList.add('show'); }
    } else if (s.goalAt === null && t >= 3.1 && !shown) { shown = true; big.textContent = s.label; big.classList.add('show'); }
    // 镜头
    const focus = new THREE.Vector3(bp.x * 0.7 + hp.x * 0.3, 0, bp.z * 0.7 + hp.z * 0.3);
    const want = new THREE.Vector3(focus.x - 10, 13, focus.z + 22);
    if (s.goalAt !== null && t > s.goalAt + 0.3) want.set(hp.x - 6, 6, hp.z + 12);
    camPos.lerp(want, 0.05); camLook.lerp(focus, 0.08);
    camera.position.copy(camPos); camera.lookAt(camLook);
    renderer.render(scene, camera);
    if (t < s.duration + 1.2) raf = requestAnimationFrame(tick);
  };

  const replay = () => {
    cancelAnimationFrame(raf);
    start = performance.now(); shown = false; big.classList.remove('show');
    lastHero = sample(s.hero, 0);
    const b0 = sample(s.ball, 0);
    camPos.set(b0.x - 10, 13, b0.z + 22); camLook.copy(b0);
    extras.forEach(({ g: e, base }) => e.position.copy(base));
    raf = requestAnimationFrame(tick);
  };
  replay();

  const ro = new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  });
  ro.observe(host);

  return {
    replay,
    dispose: () => {
      cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse(obj => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach(mt => { (mt as THREE.MeshStandardMaterial).map?.dispose(); mt.dispose(); });
      });
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); overlay.remove();
    },
  };
}
