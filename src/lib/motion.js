// 3D motion layer: scroll reveals, pointer tilt, floating hero scenes and a scroll progress bar.
// It watches the DOM rather than components, so it covers the React screens and the plain-HTML
// screens (Factory Node, Prediction) alike. Nothing here changes content: if it never runs, the
// page looks exactly as before. Reduced-motion users get none of it.

// What flips into place on scroll, and how.
const REVEAL = [
  ['title', '.fd-sec-title, .ms-title, .mo-title'],
  ['hero', '.fd-hero, .mo-hero, .ms-hero'],
  ['zoom', '.fd-hero-art figure, .ms-join figure, .ms-join .mid, .fd-chain figure, .fd-screens figure, .fd-map'],
  ['swing', '.fd-steps li, .fd-table .r, .sx-steps li, .fy-list li, .mo-hero-steps div, .fd-brain > *, .fd-own > div'],
  [
    'rise',
    '.card, .stat, .fd-panel, .fd-piece, .fd-gain, .fd-q, .fd-loop, .note-box, .mo-profile, .mo-journey, .mo-res-flow, ' +
      '.ms-box, .ms-card, .mc-app, .fn-box, .fn-split, .fn-ex, .fx-flow, .fx-rule, .sx-card, .pr-box, .pr-eq-wrap, ' +
      '.pr-card, .fz-cat, .ex-rule, .ex-flow, .phone, .mo-phone',
  ],
];
const REVEAL_ALL = REVEAL.map(([, s]) => s).join(', ');

// Cards that lean toward the pointer. Big interactive panels (the console, the phones) stay flat.
const TILT =
  '.fd-piece, .fd-gain, .fd-panel, .fd-q, .fd-hero-art, .ms-join, .sx-card, .pr-card, .fx-rule, .ex-rule, ' +
  '.stat, .ms-card, .fd-brain .cell, .mo-hero-steps div, .fd-steps li, .fd-own > div, .fn-ex';
const HEROES = '.fd-hero, .mo-hero, .ms-hero';

// Floating parcels and glass cubes behind each hero: [left %, top %, size px, depth px, kind, seconds].
const CUBES = [
  [62, 8, 46, 120, 'box', 14],
  [88, 62, 64, 40, 'glass', 18],
  [4, 70, 34, 160, 'glass', 12],
  [46, 78, 26, 220, 'box', 10],
  [94, 6, 30, 200, 'glass', 16],
  [30, 4, 22, 260, 'glass', 11],
  [76, 84, 38, 90, 'box', 15],
];

// Content added this long after a page mounts is a live update (a console tick, a new step), not an
// entrance, so if it lands on screen it appears without animating.
const SETTLE_MS = 900;

let pageStart = 0;
const seen = new WeakSet();

function inView(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.width > 0;
}

function variantOf(el) {
  for (const [name, sel] of REVEAL) if (el.matches(sel)) return name;
  return 'rise';
}

const io = new IntersectionObserver(
  (entries) => {
    // Items that come into view together arrive one after another.
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    batch.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    batch.forEach((el, i) => {
      io.unobserve(el);
      el.style.setProperty('--m-delay', `${Math.min(i, 6) * 55}ms`);
      el.dataset.m = 'in';
    });
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);

function onRevealEnd(e) {
  const el = e.target;
  if (el.dataset.m !== 'in' || !e.animationName.startsWith('m-rv-')) return;
  delete el.dataset.m;
  delete el.dataset.mv;
  el.style.removeProperty('--m-delay');
}

function scan(root) {
  if (!(root instanceof Element)) return;
  const live = performance.now() - pageStart > SETTLE_MS;
  const list = root.matches(REVEAL_ALL) ? [root, ...root.querySelectorAll(REVEAL_ALL)] : root.querySelectorAll(REVEAL_ALL);
  for (const el of list) {
    if (seen.has(el)) continue;
    seen.add(el);
    if (live && inView(el)) continue;
    el.dataset.mv = variantOf(el);
    el.dataset.m = 'wait';
    io.observe(el);
  }
  for (const hero of root.matches(HEROES) ? [root] : root.querySelectorAll(HEROES)) addScene(hero);
}

// ---------- hero scenes ----------

function addScene(hero) {
  if (hero.querySelector(':scope > .m-scene')) return;
  const scene = document.createElement('div');
  scene.className = 'm-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = CUBES.map(
    ([x, y, s, z, kind, t], i) =>
      `<div class="m-float" style="--x:${x}%;--y:${y}%;--s:${s}px;--z:${z}px;--t:${t}s;--d:${-i * 1.7}s">` +
      `<div class="m-cube ${kind}">${'<i></i>'.repeat(6)}</div></div>`,
  ).join('');
  hero.appendChild(scene);
  hero.dataset.mHero = '';
}

// ---------- pointer tilt and hero parallax ----------

let tilted = null;
let frame = 0;
let lastEvent = null;

function resetTilt(el) {
  el.style.removeProperty('transform');
  delete el.dataset.mt;
}

function onPointerMove(e) {
  lastEvent = e;
  if (!frame) frame = requestAnimationFrame(applyPointer);
}

function applyPointer() {
  frame = 0;
  const e = lastEvent;
  const target = e.target instanceof Element ? e.target : null;

  const card = target?.closest(TILT);
  if (tilted && tilted !== card) resetTilt(tilted);
  tilted = null;
  // Wait until a card has finished arriving, and never tilt under a held button (sliders, drags).
  if (card && !card.dataset.m && !e.buttons) {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = Math.max(2.5, Math.min(11, 2600 / r.width));
    card.style.transform =
      `perspective(900px) rotateX(${((0.5 - py) * max * 2).toFixed(2)}deg) ` +
      `rotateY(${((px - 0.5) * max * 2).toFixed(2)}deg) translateZ(6px)`;
    card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    card.dataset.mt = '';
    tilted = card;
  }

  const hero = target?.closest(HEROES);
  if (hero) {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    hero.style.setProperty('--hx', `${(px * 100).toFixed(1)}%`);
    hero.style.setProperty('--hy', `${(py * 100).toFixed(1)}%`);
    hero.style.setProperty('--prx', `${((0.5 - py) * 14).toFixed(2)}deg`);
    hero.style.setProperty('--pry', `${((px - 0.5) * 18).toFixed(2)}deg`);
  }
}

// ---------- scroll progress ----------

function addProgress() {
  const bar = document.createElement('div');
  bar.className = 'm-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

// ---------- start ----------

export function startMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.dataset.motion = '';
  pageStart = performance.now();

  new MutationObserver((records) => {
    for (const rec of records) {
      // A new screen: <main> itself was replaced, or a plain-HTML view filled its wrapper.
      const fresh =
        [...rec.addedNodes].some((n) => n.nodeName === 'MAIN') || rec.target.parentElement?.nodeName === 'MAIN';
      if (fresh) pageStart = performance.now();
      rec.addedNodes.forEach(scan);
    }
  }).observe(document.getElementById('root'), { childList: true, subtree: true });
  scan(document.body);

  document.addEventListener('animationend', onRevealEnd);
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    const untilt = () => {
      if (tilted) resetTilt(tilted);
      tilted = null;
    };
    document.documentElement.addEventListener('pointerleave', untilt);
    addEventListener('scroll', untilt, { passive: true });
  }
  addProgress();
}
