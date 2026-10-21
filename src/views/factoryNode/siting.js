// Choosing the node: India map of clusters, the cluster score table and the Tiruppur site comparison.
// Kept as plain DOM code; FactoryNode.jsx runs it on a fresh copy of the markup each time the tab opens.
export function initSiting() {
  var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
  /* ---------- 1 India map ---------- */
  var CL = [
    { n: 'Tiruppur', la: 11.11, lo: 77.34, c: 1980, cat: 'Hosiery & innerwear', w: 'p', s: [5, 5, 4, 4, 5], dx: 14, dy: 14 },
    { n: 'Panipat', la: 29.39, lo: 76.97, c: 1410, cat: 'Home textiles', w: 'p', s: [5, 4, 5, 4, 4], dx: -58, dy: 10 },
    { n: 'Ludhiana', la: 30.90, lo: 75.85, c: 1320, cat: 'Hosiery, knitwear', w: 'w2', s: [4, 3, 4, 4, 4], dx: -66 },
    { n: 'Rajkot', la: 22.30, lo: 70.80, c: 1240, cat: 'Plastics, jewellery', w: 'w2', s: [4, 3, 5, 3, 3] },
    { n: 'Erode', la: 11.34, lo: 77.72, c: 960, cat: 'Saree & dress material', w: 'w2', dx: 12, dy: -14 },
    { n: 'Bhiwandi', la: 19.30, lo: 73.06, c: 1050, cat: 'Saree & dress material', w: 'w3' },
    { n: 'Solapur', la: 17.66, lo: 75.91, c: 620, cat: 'Home textiles', w: 'w3' },
    { n: 'Coimbatore', la: 11.02, lo: 76.96, c: 880, cat: 'Imitation jewellery', w: 'w3', dx: -82, dy: 6 },
    { n: 'Agra', la: 27.18, lo: 78.01, c: 760, cat: 'Basic footwear', w: 'w3' },
    { n: 'Jagadhri', la: 30.17, lo: 77.30, c: 430, cat: 'Steel kitchenware', w: 'w3', dx: 10, dy: -10 },
    { n: 'Moradabad', la: 28.84, lo: 78.77, c: 590, cat: 'Brass décor', w: 'w3' },
    { n: 'Daman', la: 20.40, lo: 72.83, c: 405, cat: 'Moulded plastics', w: 'w3', dx: -48, dy: 12 },
    { n: 'Surat', la: 21.17, lo: 72.83, c: 0, cat: 'Ethnic wear', w: 'nn', s: [2, 5, 2, 5, 3], dx: -40, dy: 2 }
  ];
  var WT = [.338, .256, .179, .144, .083], WN = ['Cost ownership', 'Demand on Meesho', 'Returns band', 'Node feasibility', 'Institutional partner'];
  var WAVE = { p: 'Pilot', w2: 'Wave 2', w3: 'Wave 3', nn: 'Not now' };
  CL.forEach(function (c) { if (c.s) c.score = c.s.reduce(function (a, r, i) { return a + r * WT[i]; }, 0); });
  var sel = 'Tiruppur', map = document.getElementById('sx-map');
  function px(c) { return { x: (c.lo - 68.1) / (97.4 - 68.1) * 100, y: (1012 - 26.6 * c.la) / 836 * 100 }; }
  var mxC = 1980;
  map.insertAdjacentHTML('beforeend', CL.map(function (c, i) {
    var p = px(c), r = c.c ? 9 + 15 * Math.sqrt(c.c / mxC) : 9;
    return '<button type="button" class="sx-b ' + c.w + '" data-i="' + i + '" style="left:' + p.x + '%;top:' + p.y + '%;width:' + r + 'px;height:' + r + 'px" aria-label="' + c.n + ', ' + (c.c ? fmt(c.c) + ' manufacturers' : 'screened') + ', ' + WAVE[c.w] + '"></button><span class="sx-l" style="left:calc(' + p.x + '% + ' + (c.dx || 10) + 'px);top:calc(' + p.y + '% + ' + ((c.dy || 0) - 7) + 'px)">' + c.n + '</span>';
  }).join(''));
  
  function drawPick() {
    var c = CL.filter(function (x) { return x.n === sel; })[0], p = px(c);
    map.querySelectorAll('.sx-b').forEach(function (b) { b.classList.toggle('on', CL[+b.dataset.i].n === sel); });
    var pop = document.getElementById('sx-info');
    pop.innerHTML = '<div><b>' + c.n + '</b><span>' + c.cat + '</span></div><div><span>Manufacturers</span><b>' + (c.c ? fmt(c.c) : '—') + '</b></div><div><span>Score</span><b>' + (c.score ? c.score.toFixed(2) : 'in model') + '</b></div><span class="w ' + c.w + '">' + WAVE[c.w] + '</span>' + (c.c ? '' : '<p>Largest textile turnover in India, but factories don’t own their costs: scale is the wrong signal.</p>');
    document.querySelectorAll('#sx-tb tr').forEach(function (tr) { tr.classList.toggle('sel', tr.dataset.n === sel); });
    var pk = document.getElementById('sx-pick');
    pk.innerHTML = c.score ? '<b>' + c.n + ':</b> ' + c.s.map(function (r, i) { return r + ' × ' + WT[i].toFixed(2); }).join(' + ') + ' = <b>' + c.score.toFixed(2) + '</b> · ' + WAVE[c.w] : '<b>' + c.n + ':</b> ' + fmt(c.c) + ' manufacturers, ' + c.cat.toLowerCase() + '. Scored in the full 12-cluster model; opens in <b>' + WAVE[c.w] + '</b>.';
  }
  map.addEventListener('click', function (e) { var b = e.target.closest('.sx-b'); if (b) { sel = CL[+b.dataset.i].n; drawPick(); } });
  /* ---------- 2 criteria + score table ---------- */
  document.getElementById('sx-crit').innerHTML = WN.map(function (n, i) { return '<div><span>' + n + '</span><div class="tr"><i style="width:' + (WT[i] / WT[0] * 100) + '%"></i></div><b>' + (WT[i] * 100).toFixed(1) + '%</b></div>'; }).join('');
  document.getElementById('sx-tb').innerHTML = CL.filter(function (c) { return c.score; }).sort(function (a, b) { return b.score - a.score; }).map(function (c, k) {
    return '<tr class="click" data-n="' + c.n + '"><td><b>' + (k + 1) + ' · ' + c.n + '</b><small>' + c.cat + '</small></td>' + c.s.map(function (r) { return '<td class="num">' + r + '</td>'; }).join('') + '<td class="num"><span class="sx-sc ' + c.w + '">' + c.score.toFixed(2) + '</span></td></tr>';
  }).join('');
  document.getElementById('sx-tb').addEventListener('click', function (e) { var tr = e.target.closest('tr'); if (tr) { sel = tr.dataset.n; drawPick(); } });
  drawPick();

  /* ---------- 3 site inside the cluster ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(77), KM = .1; /* 1 px = 0.1 km */
  function gauss() { return Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(2 * Math.PI * R()); }
  var HUBS = [['Tiruppur town', 305, 205, 46, 120], ['Avinashi', 215, 135, 28, 34], ['Palladam', 235, 290, 30, 30], ['Perundurai', 485, 105, 30, 26], ['Uthukuli', 400, 160, 22, 18], ['Kangeyam', 430, 300, 24, 14]];
  var F = [];
  HUBS.forEach(function (h) { for (var k = 0; k < h[4]; k++) { var x = h[1] + gauss() * h[3], y = h[2] + gauss() * h[3] * .8; if (x > 8 && x < 592 && y > 8 && y < 372) F.push([x, y]); } });
  var CAND = [
    { id: 'A', n: 'Tiruppur–Avinashi Road', x: 290, y: 190, hw: 1.2, rent: 'Medium' },
    { id: 'B', n: 'Palladam', x: 240, y: 285, hw: 3.5, rent: 'Low' },
    { id: 'C', n: 'Perundurai SIPCOT', x: 475, y: 110, hw: 0.8, rent: 'Low' }
  ];
  CAND.forEach(function (c) {
    var d = F.map(function (f) { return Math.hypot(f[0] - c.x, f[1] - c.y) * KM; });
    c.w15 = d.filter(function (v) { return v <= 15; }).length; c.avg = d.reduce(function (a, b) { return a + b; }, 0) / d.length; c.max = Math.max.apply(null, d);
  });
  var best = CAND.slice().sort(function (a, b) { return b.w15 - a.w15 || a.avg - b.avg; })[0], cur = best.id;
  /* density grid: 5 km = 50 px */
  var G = 50, cells = [];
  for (var gx = 0; gx < 600; gx += G) for (var gy = 0; gy < 380; gy += G) { var n = F.filter(function (f) { return f[0] >= gx && f[0] < gx + G && f[1] >= gy && f[1] < gy + G; }).length; if (n) cells.push([gx, gy, n]); }
  var mx = Math.max.apply(null, cells.map(function (c) { return c[2]; }));
  var RAMP = ['#f4ecf1', '#e6cfdd', '#d2a9c3', '#b97aa5', '#9a4d8a', '#7b2a64'];
  function drawSite() {
    var c = CAND.filter(function (x) { return x.id === cur; })[0], g = '';
    g += '<rect width="600" height="380" fill="#fbfaf8"/>';
    cells.forEach(function (k) { var i = Math.min(RAMP.length - 1, Math.floor(k[2] / mx * RAMP.length)); g += '<rect x="' + k[0] + '" y="' + k[1] + '" width="' + G + '" height="' + G + '" fill="' + RAMP[i] + '" opacity=".75"/>'; });
    for (var x = 0; x <= 600; x += G) g += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="380" stroke="#fff" stroke-width="1"/>';
    for (var y = 0; y <= 380; y += G) g += '<line x1="0" x2="600" y1="' + y + '" y2="' + y + '" stroke="#fff" stroke-width="1"/>';
    g += '<polyline points="0,95 215,135 290,190 400,160 600,70" fill="none" stroke="#c9b8a6" stroke-width="5" stroke-linecap="round"/><text x="12" y="88" style="font-size:10px;fill:#8a7a6a;font-weight:700">NH 544 → Coimbatore</text><text x="596" y="46" text-anchor="end" style="font-size:10px;fill:#8a7a6a;font-weight:700">→ Salem, Valmo hub</text>';
    g += '<polyline points="290,190 235,290 230,380" fill="none" stroke="#ddd0c2" stroke-width="3"/>';
    F.forEach(function (f) { var inR = Math.hypot(f[0] - c.x, f[1] - c.y) * KM <= 15; g += '<circle cx="' + f[0].toFixed(1) + '" cy="' + f[1].toFixed(1) + '" r="2.4" fill="' + (inR ? 'var(--accent)' : '#8f8a86') + '" opacity="' + (inR ? .95 : .55) + '"/>'; });
    g += '<circle cx="' + c.x + '" cy="' + c.y + '" r="150" fill="var(--accent)" fill-opacity=".07" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 5"/>';
    HUBS.forEach(function (h) { g += '<text x="' + h[1] + '" y="' + (h[2] - h[3] - 6) + '" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--ink-2);paint-order:stroke;stroke:#fff;stroke-width:3px">' + h[0] + '</text>'; });
    CAND.forEach(function (k) { var on = k.id === cur; g += '<g class="sx-cand" data-c="' + k.id + '" style="cursor:pointer"><circle cx="' + k.x + '" cy="' + k.y + '" r="' + (on ? 14 : 11) + '" fill="' + (on ? 'var(--plum)' : '#fff') + '" stroke="var(--plum)" stroke-width="2.5"/><text x="' + k.x + '" y="' + (k.y + 4.5) + '" text-anchor="middle" style="font-size:12px;font-weight:800;fill:' + (on ? '#fff' : 'var(--plum)') + '">' + k.id + '</text></g>'; });
    g += '<g transform="translate(470,350)"><line x1="0" x2="100" y1="0" y2="0" stroke="var(--ink-2)" stroke-width="2"/><line x1="0" x2="0" y1="-4" y2="4" stroke="var(--ink-2)" stroke-width="2"/><line x1="100" x2="100" y1="-4" y2="4" stroke="var(--ink-2)" stroke-width="2"/><text x="50" y="-7" text-anchor="middle" style="font-size:10px;fill:var(--ink-2);font-weight:700">10 km</text></g>';
    document.getElementById('sx-svg').innerHTML = g;
    document.getElementById('sx-cands').innerHTML = CAND.map(function (k) { return '<button type="button" role="tab" data-c="' + k.id + '" class="' + (k.id === cur ? 'on' : '') + '" aria-selected="' + (k.id === cur) + '"><span>' + k.id + '</span>' + k.n + (k === best ? '<em>Chosen</em>' : '') + '</button>'; }).join('');
    var row = function (lbl, f, better) { return '<tr><td>' + lbl + '</td>' + CAND.map(function (k) { var v = f(k), b = better(k); return '<td class="num' + (k.id === cur ? ' cur' : '') + '">' + (b ? '<b class="best">' + v + '</b>' : v) + '</td>'; }).join('') + '</tr>'; };
    var mw = Math.max.apply(null, CAND.map(function (k) { return k.w15; })), ma = Math.min.apply(null, CAND.map(function (k) { return k.avg; })), mh = Math.min.apply(null, CAND.map(function (k) { return k.hw; }));
    document.getElementById('sx-cmp').innerHTML = '<div class="mc-tw"><table class="mc-t sx-cmp"><thead><tr><th></th>' + CAND.map(function (k) { return '<th class="num' + (k.id === cur ? ' cur' : '') + '">' + k.id + '</th>'; }).join('') + '</tr></thead><tbody>' +
      row('Manufacturers within 15 km', function (k) { return k.w15 + ' of ' + F.length; }, function (k) { return k.w15 === mw; }) +
      row('Average trip from a factory', function (k) { return k.avg.toFixed(1) + ' km'; }, function (k) { return k.avg === ma; }) +
      row('Farthest factory', function (k) { return k.max.toFixed(0) + ' km'; }, function () { return false; }) +
      row('To the highway', function (k) { return k.hw + ' km'; }, function (k) { return k.hw === mh; }) +
      row('Rent', function (k) { return k.rent; }, function () { return false; }) + '</tbody></table></div>' +
      '<div class="sx-verdict"><b>Site ' + best.id + ' · ' + best.n + '</b> has the most manufacturers within 15 km (' + best.w15 + ' of ' + F.length + ') and the shortest average trip (' + best.avg.toFixed(1) + ' km). Perundurai becomes the second site once ' + best.id + ' runs above 70% full.</div>';
  }
  document.querySelector('.sx-site').addEventListener('click', function (e) { var t = e.target.closest('[data-c]'); if (t) { cur = t.dataset.c; drawSite(); } });
  drawSite();
}
