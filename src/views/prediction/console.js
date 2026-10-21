// The Demand Console: one week of the prediction loop, its rules, and the data diagram. Publishes window.MC and window.mcGo for indexes.js.
// Kept as plain DOM code; Prediction.jsx runs it on a fresh copy of the markup each time the tab opens.
export function initConsole() {
  /* ================= data ================= */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(4307);
  var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
  var pct = function (x, d) { return (x > 0 ? '+' : '') + (x * 100).toFixed(d || 0) + '%'; };
  var r10 = function (x) { return Math.round(x / 10) * 10; };
  var DIST = ['Nagpur', 'Prayagraj', 'Gaya', 'Patna', 'Bareilly', 'Varanasi', 'Muzaffarpur', 'Guwahati', 'Indore', 'Jabalpur', 'Meerut', 'Raipur'];
  var PROD = [
    { id: 'BRF3', n: 'Men’s cotton briefs · pack of 3', cat: 'Hosiery', med: 209, base: 15630, gr: .018, st: 1.04, season: 1, real: .97, sizes: [['S', .08, -.08], ['M', .20, -.07], ['L', .34, -.09], ['XL', .25, -.01], ['XXL', .13, .24]], ret: .08 },
    { id: 'SCK5', n: 'Ankle socks · pack of 5', cat: 'Hosiery', med: 128, base: 9200, gr: .01, st: .96, season: 1, real: .78, sizes: [['Free size', 1, 0]], ret: .04 },
    { id: 'VST2', n: 'Men’s vests · pack of 2', cat: 'Hosiery', med: 189, base: 6100, gr: .006, st: 1.0, season: 1, real: 1.04, sizes: [['M', .30, .02], ['L', .42, -.03], ['XL', .28, .05]], ret: .07 },
    { id: 'BED2', n: 'Double bedsheet + 2 covers', cat: 'Home textiles', med: 325, base: 9840, gr: .025, st: 1.09, season: 1.10, real: 1.22, sizes: [['Single', .10, .05], ['Double', .62, .02], ['King', .28, .06]], ret: .06 },
    { id: 'TWL1', n: 'Cotton bath towel', cat: 'Home textiles', med: 227, base: 7300, gr: .012, st: 1.02, season: 1.04, real: 1.02, sizes: [['Regular', .70, 0], ['Large', .30, .04]], ret: .03 },
    { id: 'GLS6', n: 'Steel glasses · set of 6', cat: 'Steel kitchenware', med: 262, base: 6420, gr: .015, st: 1.03, season: 1.05, real: .95, sizes: [['250 ml', .22, 0], ['300 ml', .51, 0], ['350 ml', .27, 0]], ret: .03 }
  ];
  var PI = {}; PROD.forEach(function (p, i) { PI[p.id] = p; });
  PROD.forEach(function (p) {
    var w = DIST.map(function () { return .45 + R() * 1.1; }); var s = w.reduce(function (a, b) { return a + b; }, 0);
    w = w.map(function (x) { return x / s; }).sort(function (a, b) { return b - a; });
    var order = DIST.map(function (d, i) { return i; }).sort(function () { return R() - .5; });
    p.dw = DIST.map(function () { return 0; }); order.forEach(function (di, k) { p.dw[di] = w[k]; });
    p.hist = []; p.srch = [];
    for (var wk = 0; wk < 8; wk++) {
      var tot = p.base * Math.pow(1 + p.gr, wk - 7) * (1 + .04 * (R() * 2 - 1));
      var row = DIST.map(function (d, di) { return Math.round(tot * p.dw[di] * (1 + .06 * (R() * 2 - 1))); });
      p.hist.push(row);
      var so = row.reduce(function (a, b) { return a + b; }, 0);
      p.srch.push(Math.round(so * 3.3 * (wk >= 6 ? p.st : 1) * (1 + .02 * (R() * 2 - 1))));
    }
    p.fill = R(); p.dn = R();
    /* same weeks last year (W35-W43): smaller base, with last year's festival lift in W43 */
    var lyBase = p.base * .82;
    p.ly = []; for (var k = 0; k < 9; k++) p.ly.push(Math.round(lyBase * Math.pow(1 + p.gr * .8, k - 8) * (1 + .03 * (R() * 2 - 1)) * (k === 8 ? p.season : 1)));
    var lyNorm = (p.ly[5] + p.ly[6] + p.ly[7]) / 3;
    p.seasonLY = Math.min(1.25, Math.max(.9, p.ly[8] / lyNorm));
    p.yoy = (p.hist[7].reduce(function (a, b) { return a + b; }, 0)) / p.ly[7] - 1;
  });
  var FAC = [
    { id: 'TPR-0001', n: 'Kavin Knit Mills', cl: 'Tiruppur', cap: 3000, cost: { BRF3: 80, VST2: 72 }, sig: [95, 88, 92, 94, 90], health: 0, stg: 'new', node: 1, retx: 1.0, days: 7 },
    { id: 'TPR-0016', n: 'Velan Hosiery', cl: 'Tiruppur', cap: 4200, cost: { BRF3: 78, SCK5: 44 }, sig: [98, 99, 97, 98, 96], health: 0, stg: 'graduated', node: 1, retx: .9, days: 5 },
    { id: 'TPR-0007', n: 'Thangam Hosiery', cl: 'Tiruppur', cap: 2000, cost: { SCK5: 47 }, sig: [70, 45, 62, 58, 72], health: 0, stg: 'remedy', node: 1, retx: 1.3, days: 6 },
    { id: 'LDH-0104', n: 'Annapurna Knitwear', cl: 'Ludhiana', cap: 5000, cost: { BRF3: 79, VST2: 70 }, sig: [96, 94, 95, 96, 92], health: 0, stg: 'new', node: 0, retx: 1.0, days: 6 },
    { id: 'DEL-0311', n: 'Moti Traders', cl: 'Delhi', cap: 3000, cost: { BRF3: 118 }, sig: [40, 98, 95, 96, 100], health: 0, stg: 'new', node: 1, retx: 1.1, days: 4, trader: 1 },
    { id: 'PNP-0122', n: 'Singla Home Textiles', cl: 'Panipat', cap: 3400, cost: { BED2: 128, TWL1: 92 }, sig: [90, 93, 94, 92, 90], health: 0, stg: 'graduated', node: 1, retx: .9, days: 6 },
    { id: 'PNP-0119', n: 'Mittal Home Textiles', cl: 'Panipat', cap: 2200, cost: { BED2: 132 }, sig: [99, 99, 98, 99, 100], health: 0, stg: 'graduated', node: 1, retx: .8, days: 7 },
    { id: 'PNP-0124', n: 'Hari Home Textiles', cl: 'Panipat', cap: 1800, cost: { BED2: 130, TWL1: 95 }, sig: [52, 30, 18, 40, 55], health: 0, stg: 'review', node: 1, retx: 1.7, days: 8 },
    { id: 'PNP-0105', n: 'Garg Towel Mills', cl: 'Panipat', cap: 2600, cost: { TWL1: 88 }, sig: [95, 96, 94, 95, 93], health: 0, stg: 'graduated', node: 1, retx: .9, days: 5 },
    { id: 'JGD-0102', n: 'Jagadhri Steelware', cl: 'Jagadhri', cap: 2200, cost: { GLS6: 104 }, sig: [92, 88, 90, 90, 88], health: 0, stg: 'new', node: 0, retx: 1.0, days: 6 }
  ];
  var SIGW = [.30, .25, .20, .15, .10], SIGN = ['Price edge', 'Order pace', 'Returns', 'On-time', 'In stock'];
  FAC.forEach(function (f) { f.health = Math.round(f.sig.reduce(function (a, v, i) { return a + v * SIGW[i]; }, 0)); });
  var STEPS = [['Collect signals', 'searches, carts, orders, returns'], ['Forecast demand', 'by product, district, size'], ['Match & allocate', 'screen factories, split demand'], ['Send briefs', 'app and WhatsApp'], ['Lock pre-orders', 'confirmed + buffer'], ['Review sales', 'brief vs sold, rules fire']];
  var TABS = [['week', '🗓️', 'This week'], ['demand', '🛒', 'Buyer demand'], ['catalog', '🏭', 'Factory catalogue'], ['forecast', '📈', 'Forecast & allocate'], ['briefs', '💬', 'Briefs & pre-orders'], ['review', '✅', 'Accuracy & checks'], ['matrix', '🧮', 'Seller behaviour matrix']];
  var SCHED = ['Nightly 02:00', 'Mon 06:00', 'Mon 06:10', 'Mon 09:00', 'Thu 23:59', 'Delivery + 7 days'];
  var S = { done: 1, tab: 'week', prod: 'BRF3', fsel: null, setOpen: false, set: { gate: 8, band: 15, buf: 15, sNew: 6, sGrad: 9 } };

  /* ================= model ================= */
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function model() {
    var st = S.set, M = { prods: {}, fps: [] };
    PROD.forEach(function (p) {
      var h = p.hist, s = p.srch, trend = Math.min(1.15, Math.max(.9, (s[6] + s[7]) / (s[4] + s[5])));
      var rows = DIST.map(function (d, di) {
        var level = .5 * h[7][di] + .3 * h[6][di] + .2 * h[5][di];
        var last4 = [h[4][di], h[5][di], h[6][di], h[7][di]], m = sum(last4) / 4, sd = Math.sqrt(sum(last4.map(function (x) { return (x - m) * (x - m); })) / 3);
        var f = level * (1 + (trend - 1) * .6) * p.seasonLY, band = Math.max(.06, 1.6 * sd / m);
        return { d: d, di: di, last: h[7][di], f: Math.round(f), lo: Math.round(f * (1 - band)), hi: Math.round(f * (1 + band)), spark: h.map(function (r) { return r[di]; }) };
      }).sort(function (a, b) { return b.f - a.f; });
      var F = sum(rows.map(function (r) { return r.f; }));
      var top = p.sizes.slice().sort(function (a, b) { return b[1] - a[1]; })[0][0];
      M.prods[p.id] = { p: p, season: p.seasonLY, rows: rows, F: F, lo: sum(rows.map(function (r) { return r.lo; })), hi: sum(rows.map(function (r) { return r.hi; })), trend: trend, D14: 2 * F, gateP: p.med * (1 - st.gate / 100), pre: Math.floor(p.med * (1 - st.gate / 100)) - 10, top: top, lastWk: sum(h[7]), prevWk: sum(h[6]) };
    });
    FAC.forEach(function (f, fi) {
      Object.keys(f.cost).forEach(function (pid) {
        var P = M.prods[pid], p = P.p, v = Math.round((f.cost[pid] + .40 * p.med) / .91), gap = (p.med - v) / p.med, st2, why;
        if (f.trader) { st2 = 'screened'; why = 'Udyam and GST show trading, not manufacturing'; }
        else if (gap * 100 < st.gate) { st2 = 'nobadge'; why = 'Lowest price only ' + (gap * 100).toFixed(1) + '% under the median'; }
        else if (f.health < 40) { st2 = 'held'; why = 'Health score under review'; }
        else if (!f.node) { st2 = 'waits'; why = 'No Factory Node in ' + f.cl + ' yet'; }
        else { st2 = 'ok'; why = f.stg === 'remedy' ? 'Eligible, half share while a fix runs' : 'Eligible'; }
        var share = f.stg === 'graduated' ? st.sGrad : f.stg === 'remedy' ? st.sNew / 2 : st.sNew;
        M.fps.push({ f: f, fi: fi, pid: pid, P: P, v: v, gap: gap, status: st2, why: why, share: st2 === 'ok' ? share / 100 : 0, batch: 0 });
      });
    });
    /* allocation */
    PROD.forEach(function (p) {
      var P = M.prods[p.id], el = M.fps.filter(function (x) { return x.pid === p.id && x.status === 'ok'; });
      el.forEach(function (x) { x.batch = x.share * P.D14; });
      var tot = sum(el.map(function (x) { return x.batch; })), cap = .2 * P.D14;
      P.capped = tot > cap; if (P.capped) el.forEach(function (x) { x.batch *= cap / tot; });
    });
    FAC.forEach(function (f) {
      var mine = M.fps.filter(function (x) { return x.f === f && x.batch > 0; }), tot = sum(mine.map(function (x) { return x.batch; }));
      if (tot > f.cap) mine.forEach(function (x) { x.batch *= f.cap / tot; x.capLim = 1; });
    });
    M.fps.forEach(function (x, k) {
      x.batch = r10(x.batch);
      var p = x.P.p, rr = rng(900 + k);
      x.fill = Math.min(.98, Math.max(.2, .55 * p.real * (1 + .1 * (rr() - .5))));
      x.conf = Math.round(x.batch * x.fill); x.make = Math.round(x.conf * (1 + st.buf / 100));
      x.demand = Math.round(x.batch * p.real * (1 + .05 * (rr() - .5)));
      x.err = x.batch ? x.demand / x.batch - 1 : 0;
      x.left = x.make > x.demand ? (x.make - x.demand) / x.make : 0; x.topup = Math.max(0, x.demand - x.make);
      x.sizes = p.sizes.map(function (s) { var b = Math.round(x.batch * s[1]), sold = Math.round(b * p.real * (1 + s[2])); return { s: s[0], b: b, sold: sold, g: b ? sold / b - 1 : 0, rel: b ? (sold / b) / (p.real) - 1 : 0 }; });
      var top5 = x.P.rows.slice(0, 5), t5 = sum(top5.map(function (r) { return r.f; }));
      x.dists = top5.map(function (r) { return [r.d, Math.round(x.batch * r.f / t5)]; });
    });
    M.ok = M.fps.filter(function (x) { return x.status === 'ok' && x.batch > 0; });
    return M;
  }

  /* ================= helpers ================= */
  function chip(kind, txt) { var ic = { good: '✓', warn: '!', bad: '✕', neu: '•', brand: '★' }[kind]; return '<span class="mc-chip ' + kind + '"><i aria-hidden="true">' + ic + '</i>' + txt + '</span>'; }
  var STAT = { ok: ['good', 'Eligible'], nobadge: ['bad', 'Fails price check'], screened: ['bad', 'Screened out'], held: ['warn', 'Held'], waits: ['neu', 'Waits for node'] };
  function spark(v) { var mx = Math.max.apply(null, v), mn = Math.min.apply(null, v), W = 80, H = 22; var pts = v.map(function (x, i) { return (i * W / (v.length - 1)).toFixed(1) + ',' + (H - 2 - (x - mn) / ((mx - mn) || 1) * (H - 4)).toFixed(1); }); return '<svg class="mc-spark" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><polyline points="' + pts.join(' ') + '"/><circle cx="' + W + '" cy="' + pts[pts.length - 1].split(',')[1] + '" r="2.2"/></svg>'; }
  function trendTxt(x) { return x > .02 ? '<span class="mc-trend up">↑ ' + pct(x) + '</span>' : x < -.02 ? '<span class="mc-trend dn">↓ ' + pct(x) + '</span>' : '<span class="mc-trend fl">→ flat</span>'; }
  function prodSel() { return '<select class="mc-sel" id="mc-prod" aria-label="Product">' + PROD.map(function (p) { return '<option value="' + p.id + '"' + (p.id === S.prod ? ' selected' : '') + '>' + p.n + '</option>'; }).join('') + '</select>'; }
  function empty(step, msg) { return '<div class="mc-empty"><b>' + msg + '</b><span>This screen fills in once the week reaches “' + STEPS[step][0] + '”.</span><button type="button" class="mc-run" data-step="' + step + '">Run to “' + STEPS[step][0] + '” →</button></div>'; }
  function lineChart(id, hist, fc, ly) {
    var W = 640, H = 230, pl = 52, pr = 16, pt = 14, pb = 28, all = hist.concat(fc ? [fc.hi] : [], ly || []), mx = Math.max.apply(null, all) * 1.12, n = hist.length + (fc ? 1 : 0);
    var X = function (i) { return pl + i * (W - pl - pr) / (n - 1); }, Y = function (v) { return pt + (1 - v / mx) * (H - pt - pb); }, g = '';
    var step = Math.pow(10, Math.floor(Math.log10(mx / 3))), tk = Math.ceil(mx / 3 / step) * step;
    for (var v = 0; v <= mx; v += tk) g += '<line class="gl" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (pl - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v) + '</text>';
    for (var i = 0; i < n; i++) g += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle"' + (fc && i === n - 1 ? ' style="fill:var(--ink);font-weight:700"' : '') + '>' + (fc && i === n - 1 ? 'W43' : 'W' + (35 + i)) + '</text>';
    if (fc) { var li = n - 2; g += '<polygon class="rng" points="' + X(li) + ',' + Y(hist[li]) + ' ' + X(n - 1) + ',' + Y(fc.hi) + ' ' + X(n - 1) + ',' + Y(fc.lo) + '"/><polyline class="fc" points="' + X(li) + ',' + Y(hist[li]) + ' ' + X(n - 1) + ',' + Y(fc.f) + '"/>'; }
    if (ly) { g += '<polyline class="lyl" points="' + ly.map(function (v, i) { return X(i) + ',' + Y(v); }).join(' ') + '"/>'; ly.forEach(function (v, i) { g += '<circle class="lyd" cx="' + X(i) + '" cy="' + Y(v) + '" r="3"/>'; }); }
    g += '<polyline class="ln" points="' + hist.map(function (v, i) { return X(i) + ',' + Y(v); }).join(' ') + '"/>';
    hist.forEach(function (v, i) { g += '<circle class="dt" cx="' + X(i) + '" cy="' + Y(v) + '" r="4"/>'; });
    if (fc) g += '<circle class="dt f" cx="' + X(n - 1) + '" cy="' + Y(fc.f) + '" r="5"/>';
    g += '<line class="cross" y1="' + pt + '" y2="' + (H - pb) + '" style="display:none"/>';
    var tips = hist.map(function (v, i) { return ['Week ' + (35 + i), fmt(v) + ' orders' + (ly ? '<br>last year ' + fmt(ly[i]) : '')]; }); if (fc) tips.push(['Week 43 · forecast', fmt(fc.f) + ' orders<br>likely ' + fmt(fc.lo) + ' – ' + fmt(fc.hi) + (ly ? '<br>last year ' + fmt(ly[n - 1]) : '')]);
    for (i = 0; i < n; i++) { var w = (W - pl - pr) / (n - 1); g += '<rect class="hit" x="' + (X(i) - w / 2) + '" y="' + pt + '" width="' + w + '" height="' + (H - pt - pb) + '" data-x="' + X(i) + '" data-t="' + tips[i][0] + '" data-v="' + tips[i][1] + '"/>'; }
    return '<div class="mc-cw" id="' + id + '"><svg class="mc-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Weekly orders">' + g + '</svg><div class="mc-tip"></div></div>';
  }
  function wireChart(id) {
    var w = document.getElementById(id); if (!w) return; var svg = w.querySelector('svg'), tip = w.querySelector('.mc-tip'), cr = svg.querySelector('.cross');
    svg.addEventListener('mousemove', function (e) { var r = e.target.closest('.hit'); if (!r) { tip.style.display = 'none'; cr.style.display = 'none'; return; }
      cr.setAttribute('x1', r.dataset.x); cr.setAttribute('x2', r.dataset.x); cr.style.display = '';
      tip.innerHTML = '<b>' + r.dataset.t + '</b>' + r.dataset.v; tip.style.display = 'block'; var b = w.getBoundingClientRect(), lx = e.clientX - b.left + 12; if (lx + 170 > b.width) lx -= 190; tip.style.left = lx + 'px'; tip.style.top = (e.clientY - b.top - 10) + 'px'; });
    svg.addEventListener('mouseleave', function () { tip.style.display = 'none'; cr.style.display = 'none'; });
  }

  /* ================= views ================= */
  function vWeek(M) {
    var allLast = sum(PROD.map(function (p) { return M.prods[p.id].lastWk; })), allPrev = sum(PROD.map(function (p) { return M.prods[p.id].prevWk; }));
    var F = sum(PROD.map(function (p) { return M.prods[p.id].F; })), sug = sum(M.ok.map(function (x) { return x.batch; })), conf = sum(M.ok.map(function (x) { return x.conf; })), dem = sum(M.ok.map(function (x) { return x.demand; }));
    var t = function (lbl, val, note, on) { return '<div class="mc-tile' + (on ? '' : ' dim') + '"><span>' + lbl + '</span><b>' + (on ? val : '—') + '</b><small>' + note + '</small></div>'; };
    var h = '<div><h3>Week 43 at a glance</h3><div class="sub">' + (S.done < 6 ? 'Next step: <b>' + STEPS[S.done][0] + '</b> (' + SCHED[S.done] + '). Press Run, or click any step above. ' : 'The week is complete. ') + 'Tiles fill in as each step runs.</div></div>';
    h += '<div class="mc-tiles">' + t('Buyer orders, last week', fmt(allLast), trendTxt(allLast / allPrev - 1) + ' vs week before', 1) + t('Products tracked', PROD.length, '12 districts each', 1) + t('Factories in catalogue', FAC.length, M.fps.length + ' factory-product pairs', 1) +
      t('Forecast, next week', fmt(F), 'orders across all products', S.done >= 2) + t('Eligible factory-products', M.ok.length, 'after the screens', S.done >= 3) + t('Suggested batch, total', fmt(sug), 'units in this week’s briefs', S.done >= 4) +
      t('Confirmed pre-orders', fmt(conf), Math.round(conf / sug * 100) + '% of suggested', S.done >= 5) + t('Sold vs brief', pct(dem / sug - 1), 'target within ±' + S.set.band + '%', S.done >= 6) + '</div>';
    var al = [];
    M.fps.forEach(function (x) {
      if (x.status === 'screened' && !al.some(function (a) { return a[1] === x.f.n + ' screened out'; })) al.push(['bad', x.f.n + ' screened out', x.why]);
      if (x.status === 'nobadge') al.push(['bad', x.f.n + ' fails the price check on ' + x.P.p.n, x.why + '; the gate needs ' + S.set.gate + '%']);
      if (x.status === 'held' && !al.some(function (a) { return a[1] === x.f.n + ' held this week'; })) al.push(['warn', x.f.n + ' held this week', x.why + ' (score ' + x.f.health + ')']);
    });
    var waits = M.fps.filter(function (x) { return x.status === 'waits'; }); if (waits.length) al.push(['neu', waits.length + ' factory-products waiting for a node', waits.map(function (x) { return x.f.n; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') + ': demand is tracked; briefs start when the node opens']);
    if (S.done >= 3) PROD.forEach(function (p) { if (M.prods[p.id].capped) al.push(['warn', p.n + ': badge reach capped', 'Eligible factories would exceed 20% of demand; shares were scaled down']); });
    if (S.done >= 5) M.ok.forEach(function (x) { if (x.fill < .5) al.push(['warn', x.f.n + ' · ' + x.P.p.n + ': pre-orders under half', Math.round(x.fill * 100) + '% of the suggested batch confirmed']); });
    if (S.done >= 6) M.ok.forEach(function (x) { if (Math.abs(x.err) * 100 > S.set.band) al.push([x.err < 0 ? 'bad' : 'warn', x.f.n + ' · ' + x.P.p.n + ': ' + (x.err < 0 ? 'over-forecast' : 'under-forecast'), 'Sold ' + pct(x.err) + ' vs the brief']); });
    h += '<div class="mc-grid32"><div class="mc-card"><h4>Needs attention (' + al.length + ')</h4><div class="mc-alerts">' + al.map(function (a) { return '<div class="mc-alert">' + chip(a[0], a[0] === 'bad' ? 'Fail' : a[0] === 'warn' ? 'Watch' : 'Info') + '<div><b>' + a[1] + '</b><span class="d">' + a[2] + '</span></div></div>'; }).join('') + '</div></div>';
    h += '<div class="mc-card"><h4>Activity log</h4><div class="mc-log" id="mc-log">' + logLines(M).join('<br>') + '</div></div></div>';
    return h;
  }
  function logLines(M) {
    var L = ['<span class="k">Mon 06:00</span> signals loaded · ' + PROD.length + ' products · 8 weeks · 12 districts'];
    if (S.done >= 2) L.push('<span class="k">Mon 06:05</span> forecast built · ' + fmt(sum(PROD.map(function (p) { return M.prods[p.id].F; }))) + ' orders expected next week');
    if (S.done >= 3) { L.push('<span class="k">Mon 06:10</span> ' + M.fps.length + ' factory-products screened · <span class="g">' + M.ok.length + ' eligible</span>'); var seen = {}; M.fps.forEach(function (x) { if (x.status !== 'ok' && !seen[x.f.id + x.status] && (seen[x.f.id + x.status] = 1)) L.push('<span class="k">Mon 06:10</span> <span class="' + (x.status === 'waits' ? 'y' : 'r') + '">' + x.f.n + '</span> · ' + x.why.toLowerCase()); }); }
    if (S.done >= 4) L.push('<span class="k">Mon 09:00</span> <span class="g">' + M.ok.length + ' briefs sent</span> on app and WhatsApp · pre-order window open');
    if (S.done >= 5) { L.push('<span class="k">Thu 23:59</span> cut-off · batches locked at confirmed + ' + S.set.buf + '%'); M.ok.forEach(function (x) { if (x.fill < .5) L.push('<span class="k">Thu 23:59</span> <span class="y">' + x.f.n + '</span> pre-orders ' + Math.round(x.fill * 100) + '% · next brief will be smaller'); }); }
    if (S.done >= 6) M.ok.forEach(function (x) { var o = Math.abs(x.err) * 100 <= S.set.band; L.push('<span class="k">+7 days</span> ' + x.f.n + ' · ' + x.pid + ' sold ' + pct(x.err) + ' vs brief · <span class="' + (o ? 'g">on target' : 'r">' + (x.err < 0 ? 'cut next brief' : 'raise next brief')) + '</span>'); });
    return L;
  }
  function vDemand(M) {
    var P = M.prods[S.prod], p = P.p, totals = p.hist.map(sum);
    var h = '<div class="mc-row between"><div><h3>Buyer demand</h3><div class="sub">What Meesho’s buyers searched for, ordered and returned, added up by district. Pin codes are trimmed to districts; no buyer is identifiable.</div></div>' + prodSel() + '</div>';
    h += '<div class="mc-tiles"><div class="mc-tile"><span>Orders last week</span><b>' + fmt(P.lastWk) + '</b><small>' + trendTxt(P.lastWk / P.prevWk - 1) + '</small></div><div class="mc-tile"><span>Searches last week</span><b>' + fmt(p.srch[7]) + '</b><small>search trend ' + trendTxt(P.trend - 1) + '</small></div><div class="mc-tile"><span>Median price paid</span><b>₹' + p.med + '</b><small>delivered orders, comparable set</small></div><div class="mc-tile"><span>Return rate</span><b>' + Math.round(p.ret * 100) + '%</b><small>' + (p.id === 'BRF3' ? 'top reason: size too small' : 'within category norm') + '</small></div></div>';
    h += '<div class="mc-card"><div class="mc-row between"><h4 style="margin:0">Weekly orders, last 8 weeks</h4><div class="mc-legend"><span><i class="a"></i>This year</span><span><i class="ly"></i>Same weeks last year</span></div></div>' + lineChart('mc-c1', totals, null, p.ly.slice(0, 8)) + '<div class="sub" style="margin-top:6px">This year runs <b>' + pct(p.yoy) + '</b> above last year. Last year’s week 43 was <b>×' + p.seasonLY.toFixed(2) + '</b> its usual level' + (p.seasonLY > 1.03 ? ' (pre-Diwali lift)' : '') + ', so the forecast uses the same factor.</div></div>';
    h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>District</th><th class="num">Orders last week</th><th>8 weeks</th><th>vs week before</th><th class="num">Share</th></tr></thead><tbody>' +
      DIST.map(function (d, di) { return { d: d, di: di, v: p.hist[7][di] }; }).sort(function (a, b) { return b.v - a.v; }).map(function (r) { return '<tr><td><b>' + r.d + '</b></td><td class="num">' + fmt(r.v) + '</td><td>' + spark(p.hist.map(function (w) { return w[r.di]; })) + '</td><td>' + trendTxt(r.v / p.hist[6][r.di] - 1) + '</td><td class="num">' + Math.round(r.v / P.lastWk * 100) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div class="mc-card"><h4>Size or variant mix, last 4 weeks</h4><div style="display:flex;gap:2px;height:26px;border-radius:6px;overflow:hidden">' + p.sizes.map(function (s, i) { return '<div style="flex:' + s[1] + ';background:' + (i % 2 ? '#5b98e3' : 'var(--s1)') + ';color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center" title="' + s[0] + ': ' + Math.round(s[1] * 100) + '%">' + (s[1] >= .08 ? s[0] + ' ' + Math.round(s[1] * 100) + '%' : '') + '</div>'; }).join('') + '</div></div>';
    return h;
  }
  function vCatalog(M) {
    var h = '<div><h3>Factory catalogue</h3><div class="sub">Every factory’s products, capacity and making cost, from its onboarding profile. Meesho turns making cost into the lowest price it can sell at, and checks it against what buyers pay. Click a row for details.</div></div>';
    h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>Factory</th><th>Product</th><th class="num">Capacity / wk</th><th class="num">Making cost</th><th class="num">Lowest price</th><th class="num">Below median</th><th>Health</th><th>Node</th><th>Status</th></tr></thead><tbody>' +
      M.fps.map(function (x, k) { var s = STAT[x.status]; return '<tr class="click' + (S.fsel === k ? ' sel' : '') + '" data-fp="' + k + '"><td><b>' + x.f.n + '</b><small>' + x.f.id + ' · ' + x.f.cl + '</small></td><td>' + x.P.p.n + '</td><td class="num">' + fmt(x.f.cap) + '</td><td class="num">₹' + x.f.cost[x.pid] + '</td><td class="num">₹' + x.v + '</td><td class="num" style="font-weight:650;color:' + (x.gap * 100 >= S.set.gate ? 'var(--good-ink)' : 'var(--critical)') + '">' + pct(x.gap, 1).replace('+', '') + '</td><td>' + (x.f.health >= 80 ? chip('good', x.f.health) : x.f.health >= 40 ? chip('warn', x.f.health) : chip('bad', x.f.health)) + '</td><td>' + (x.f.node ? chip('good', 'Live') : chip('neu', 'Not yet')) + '</td><td>' + chip(s[0], s[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    if (typeof S.fsel === 'number' && M.fps[S.fsel]) {
      var x = M.fps[S.fsel], p = x.P.p;
      h += '<div class="mc-detail"><div class="mc-row between"><div><b>' + x.f.n + ' · ' + p.n + '</b><div class="sub">' + x.why + '</div></div>' + chip(STAT[x.status][0], STAT[x.status][1]) + '</div>' +
        '<div class="g"><div><span>Lowest viable price</span><b>₹' + x.v + '</b></div><div><span>Price gate (' + S.set.gate + '% under ₹' + p.med + ')</span><b>₹' + Math.floor(x.P.gateP) + '</b></div><div><span>Time to make a batch</span><b>' + x.f.days + ' days</b></div><div><span>Returns vs category</span><b>' + x.f.retx.toFixed(1) + '×</b></div></div>' +
        '<div class="mc-formula" style="margin-top:10px">lowest price = (making cost ₹' + x.f.cost[x.pid] + ' + node, freight, returns ≈ ₹' + Math.round(.4 * p.med) + ') ÷ (1 − 9% margin) = ₹' + x.v + '</div></div>';
    }
    return h;
  }
  function vForecast(M) {
    var P = M.prods[S.prod], p = P.p;
    var h = '<div class="mc-row between"><div><h3>Forecast & allocate</h3><div class="sub">Next week’s orders by district, then the share each eligible factory gets.</div></div>' + prodSel() + '</div>';
    if (S.done < 2) return h + empty(1, 'No forecast yet');
    h += '<div class="mc-tiles"><div class="mc-tile"><span>Forecast, week 43</span><b>' + fmt(P.F) + '</b><small>likely ' + fmt(P.lo) + ' – ' + fmt(P.hi) + '</small></div><div class="mc-tile"><span>Search trend applied</span><b>' + pct(P.trend - 1) + '</b><small>last 2 weeks vs 2 before</small></div><div class="mc-tile"><span>Season, from last year</span><b>×' + P.season.toFixed(2) + '</b><small>W43 last year vs W40–42 · ' + (P.season > 1.03 ? 'pre-Diwali lift' : 'no festival effect') + '</small></div><div class="mc-tile"><span>Price band that sells</span><b>₹' + p.med + '–' + Math.round(p.med * 1.1 / 10) * 10 + '</b><small>pre-order price ₹' + P.pre + '</small></div></div>';
    h += '<div class="mc-card"><div class="mc-row between"><h4 style="margin:0">Orders, 8 weeks and the forecast</h4><div class="mc-legend"><span><i class="a"></i>Actual</span><span><i class="f"></i>Forecast</span><span><i class="r"></i>Likely range</span><span><i class="ly"></i>Last year</span></div></div>' + lineChart('mc-c2', p.hist.map(sum), { f: P.F, lo: P.lo, hi: P.hi }, p.ly) + '</div>';
    h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>District</th><th class="num">Last week</th><th class="num">Forecast</th><th class="num">Likely range</th><th>Top size</th></tr></thead><tbody>' + P.rows.map(function (r) { return '<tr><td><b>' + r.d + '</b></td><td class="num">' + fmt(r.last) + '</td><td class="num"><b>' + fmt(r.f) + '</b></td><td class="num">' + fmt(r.lo) + ' – ' + fmt(r.hi) + '</td><td>' + P.top + '</td></tr>'; }).join('') + '<tr class="tot"><td>All 12 districts</td><td class="num">' + fmt(P.lastWk) + '</td><td class="num">' + fmt(P.F) + '</td><td class="num">' + fmt(P.lo) + ' – ' + fmt(P.hi) + '</td><td></td></tr></tbody></table></div>';
    h += '<div id="mc-alloc"><h3 style="font-size:16px">Allocation</h3><div class="sub">14 days of demand: <b>' + fmt(P.D14) + '</b>. New factories get ' + S.set.sNew + '%, graduated ' + S.set.sGrad + '%, factories under a fix half of the new share. Badged factories together never exceed 20%.</div></div>';
    if (S.done < 3) return h + empty(2, 'Factories not matched yet');
    var fps = M.fps.filter(function (x) { return x.pid === p.id; }), badged = sum(fps.map(function (x) { return x.batch; }));
    h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>Factory</th><th>Status</th><th class="num">Share</th><th style="min-width:160px">Suggested batch</th><th class="num">Units</th></tr></thead><tbody>' + fps.map(function (x) { var s = STAT[x.status]; return '<tr><td><b>' + x.f.n + '</b><small>' + x.f.cl + ' · ' + x.f.stg + '</small></td><td>' + chip(s[0], s[1]) + '<small>' + x.why + (x.capLim ? '; limited by capacity' : '') + '</small></td><td class="num">' + (x.batch ? (x.batch / P.D14 * 100).toFixed(1) + '%' : '—') + '</td><td><div class="mc-bar"><i style="width:' + (x.batch / (P.D14 * .2) * 100) + '%"></i></div></td><td class="num"><b>' + (x.batch ? fmt(x.batch) : '—') + '</b></td></tr>'; }).join('') +
      '<tr class="tot"><td>Badged total</td><td>' + (P.capped ? chip('warn', 'Scaled to the 20% cap') : chip('good', 'Under the 20% cap')) + '</td><td class="num">' + (badged / P.D14 * 100).toFixed(1) + '%</td><td><div class="mc-bar"><i style="width:' + (badged / (P.D14 * .2) * 100) + '%"></i></div></td><td class="num">' + fmt(badged) + '</td></tr><tr><td colspan="5" class="sub">Bars are drawn against the 20% cap (' + fmt(P.D14 * .2) + ' units). The other ' + fmt(P.D14 - badged) + ' units of demand stay with existing sellers.</td></tr></tbody></table></div>';
    return h;
  }
  function vBriefs(M) {
    var h = '<div><h3>Briefs & pre-orders</h3><div class="sub">One brief per eligible factory-product. After the Thursday cut-off, each batch is locked at confirmed pre-orders plus a ' + S.set.buf + '% buffer.</div></div>';
    if (S.done < 3) return h + empty(2, 'No factories matched yet');
    h += '<div class="mc-briefs">' + M.ok.map(function (x) {
      var p = x.P.p, sent = S.done >= 4, locked = S.done >= 5;
      var msg = '📊 Demand brief · week 43\n' + p.n + '\nTop districts: ' + x.dists.map(function (d) { return d[0]; }).join(', ') + '\nSells at ₹' + p.med + '–' + Math.round(p.med * 1.1 / 10) * 10 + ' · your pre-order price ₹' + x.P.pre + '\nSizes: ' + x.sizes.map(function (s) { return s.s + ' ' + fmt(s.b); }).join(' · ') + '\nSuggested batch: ' + fmt(x.batch) + '\nReply 1 to commit · 2 sizes · 3 call';
      var c = '<div class="mc-bcard"><div class="h"><div><b>' + x.f.n + '</b><small>' + p.n + '</small></div>' + (locked ? chip(x.fill < .5 ? 'warn' : 'good', 'Locked') : sent ? chip('brand', 'Sent') : chip('neu', 'Draft')) + '</div>';
      c += '<div class="mc-wa"><div class="in">' + msg + '<i>Mon 09:00</i></div>' + (sent ? '<div class="out">1<i>09:14 ✓✓</i></div>' : '') + '</div>';
      if (locked) {
        c += '<div class="mc-pre"><div class="pb"><i class="a" style="width:' + (x.conf / x.batch * 100) + '%"></i><i class="b" style="width:' + ((x.make - x.conf) / x.batch * 100) + '%"></i></div><div class="lg"><span><i style="background:var(--s1)"></i>Confirmed ' + fmt(x.conf) + '</span><span><i style="background:#9ec5f4"></i>Buffer ' + fmt(x.make - x.conf) + '</span><span>of ' + fmt(x.batch) + ' suggested</span></div></div>';
        c += '<div class="mc-kv"><div><span>Pre-order fill</span><b>' + Math.round(x.fill * 100) + '%</b></div><div><span>+ buffer</span><b>' + fmt(x.make - x.conf) + '</b></div><div class="eq"><span>Batch to make</span><b>' + fmt(x.make) + '</b></div></div>';
        if (x.fill < .5) c += chip('warn', 'Under half the batch: next brief will be smaller');
      } else if (sent) c += '<div class="sub">Pre-order window open. Batch locks Thursday night.</div>';
      return c + '</div>';
    }).join('') + '</div>';
    if (S.done < 4) h += empty(3, 'Briefs are drafted, not sent');
    else if (S.done < 5) h += empty(4, 'Pre-order window is open');
    return h;
  }
  function vReview(M) {
    var h = '<div><h3>Accuracy & checks</h3><div class="sub">After delivery, what sold is compared with the brief. Inside ±' + S.set.band + '% is on target; outside it, a rule fires.</div></div>';
    if (S.done < 6) {
      h += empty(5, 'Sales are not in yet');
    } else {
      var sel = typeof S.fsel === 'number' && M.ok.indexOf(M.fps[S.fsel]) > -1 ? M.fps[S.fsel] : M.ok[0];
      h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>Factory · product</th><th class="num">Brief</th><th class="num">Pre-orders</th><th class="num">Made</th><th class="num">Demand</th><th class="num">vs brief</th><th>Result</th><th>Rule fired</th></tr></thead><tbody>' + M.ok.map(function (x) {
        var on = Math.abs(x.err) * 100 <= S.set.band, act = on ? (x.left > .05 ? 'Buffer trimmed next week' : 'Share can grow') : x.err < 0 ? 'Cut next brief; size mix from last 4 weeks' : 'Raise next brief; restock nudge';
        return '<tr class="click' + (x === sel ? ' sel' : '') + '" data-fp="' + M.fps.indexOf(x) + '"><td><b>' + x.f.n + '</b><small>' + x.P.p.n + '</small></td><td class="num">' + fmt(x.batch) + '</td><td class="num">' + fmt(x.conf) + '</td><td class="num">' + fmt(x.make) + '</td><td class="num">' + fmt(x.demand) + '</td><td class="num"><b>' + pct(x.err) + '</b></td><td>' + (on ? chip('good', 'On target') : x.err < 0 ? chip('bad', 'Over-forecast') : chip('warn', 'Under-forecast')) + '</td><td style="font-size:12px">' + act + (x.topup ? '<small>' + fmt(x.topup) + ' units topped up from factory stock</small>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
      h += '<div class="mc-grid2"><div class="mc-card"><h4>Brief vs demand by size · ' + sel.f.n + ', ' + sel.P.p.n + '</h4><table class="mc-t"><thead><tr><th>Size</th><th class="num">Brief</th><th class="num">Demand</th><th class="num">Gap</th><th class="num">vs overall</th><th></th></tr></thead><tbody>' + sel.sizes.map(function (s) { var o = sel.sizes.length < 2 || Math.abs(s.rel) * 100 <= S.set.band; return '<tr><td>' + s.s + '</td><td class="num">' + fmt(s.b) + '</td><td class="num">' + fmt(s.sold) + '</td><td class="num"><b>' + pct(s.g) + '</b></td><td class="num">' + pct(s.rel) + '</td><td>' + (o ? chip('good', 'Mix OK') : chip('warn', 'Shift mix')) + '</td></tr>'; }).join('') + '</tbody></table><div class="sub" style="margin-top:6px">Click another row above to see its sizes.</div></div>';
      h += '<div class="mc-card"><h4>What changes next week</h4><div class="mc-log">' + M.ok.map(function (x) { var on = Math.abs(x.err) * 100 <= S.set.band; return '<span class="k">' + x.f.n + '</span> · ' + x.pid + ': ' + (on ? '<span class="g">keep</span>' : x.err < 0 ? '<span class="r">brief −' + Math.round(-x.err * 100) + '%</span>' : '<span class="y">brief +' + Math.round(x.err * 100) + '%</span>') + x.sizes.filter(function (s) { return x.sizes.length > 1 && Math.abs(s.rel) * 100 > S.set.band; }).map(function (s) { return ' · size ' + s.s + (s.rel > 0 ? ' share up' : ' share down'); }).join(''); }).join('<br>') + '</div></div></div>';
    }
    /* checks matrix: always shown */
    h += '<div><h3 style="font-size:16px">Checks on every factory</h3><div class="sub">Price, demand, health, returns and documents. These run every day; the demand column fills in after review.</div></div>';
    var byF = FAC.map(function (f) { var mine = M.fps.filter(function (x) { return x.f === f; }); return { f: f, mine: mine }; });
    h += '<div class="mc-tw"><table class="mc-t mc-checks"><thead><tr><th>Factory</th><th class="c">Documents</th><th class="c">Price check</th><th class="c">Demand accuracy</th><th class="c">Health score</th><th class="c">Returns</th><th>Automatic action</th></tr></thead><tbody>' + byF.map(function (o) {
      var f = o.f, doc = f.trader ? chip('bad', 'Trader') : chip('good', 'Maker');
      var minGap = Math.min.apply(null, o.mine.map(function (x) { return x.gap; })), price = minGap * 100 >= S.set.gate ? chip('good', pct(minGap).replace('+', '')) : minGap * 100 >= 4 ? chip('warn', pct(minGap).replace('+', '')) : chip('bad', pct(minGap).replace('+', ''));
      var okm = o.mine.filter(function (x) { return M.ok.indexOf(x) > -1; }), acc = S.done < 6 || !okm.length ? chip('neu', S.done < 6 ? 'Pending' : 'n/a') : (function () { var worst = okm.reduce(function (a, b) { return Math.abs(b.err) > Math.abs(a.err) ? b : a; }); return Math.abs(worst.err) * 100 <= S.set.band ? chip('good', pct(worst.err)) : chip(worst.err < 0 ? 'bad' : 'warn', pct(worst.err)); })();
      var hl = f.health >= 80 ? chip('good', f.health) : f.health >= 40 ? chip('warn', f.health) : chip('bad', f.health);
      var rt = f.retx > 1.5 ? chip('bad', f.retx.toFixed(1) + '×') : f.retx > 1.15 ? chip('warn', f.retx.toFixed(1) + '×') : chip('good', f.retx.toFixed(1) + '×');
      var act = f.trader ? 'Screened out' : f.retx > 1.5 ? 'QC hold at the node' : f.health < 40 ? 'One human review' : minGap * 100 < S.set.gate ? 'No badge until price improves' : f.stg === 'remedy' ? 'Automated fix running' : !f.node ? 'Waits for node' : f.health >= 80 && f.stg === 'graduated' ? 'Prepaid batches unlocked' : 'Monitored daily';
      return '<tr><td><b>' + f.n + '</b><small>' + f.id + '</small></td><td class="c">' + doc + '</td><td class="c">' + price + '</td><td class="c">' + acc + '</td><td class="c">' + hl + '</td><td class="c">' + rt + '</td><td style="font-size:12px">' + act + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    return h;
  }

  /* ================= render ================= */
  function vMatrix(M) {
    var heat = function (v) { var c = v >= 90 ? '#1f8a5b' : v >= 80 ? '#5fb88c' : v >= 60 ? '#e8b84a' : v >= 40 ? '#e98b4e' : '#d03b3b'; return '<td class="mx-c"><span style="background:' + c + '">' + v + '</span></td>'; };
    var STG = { new: ['neu', 'Allocate'], graduated: ['good', 'Graduated'], remedy: ['warn', 'Remedy'], review: ['bad', 'Human review'] };
    var rows = FAC.map(function (f, fi) {
      var mine = M.fps.filter(function (x) { return x.f === f; }), okm = mine.filter(function (x) { return M.ok.indexOf(x) > -1; });
      var best = mine.reduce(function (a, b) { return b.gap > a.gap ? b : a; });
      var share = okm.length ? okm.map(function (x) { return '<span class="mx-sh">' + x.P.p.n.split(' ·')[0].replace('Men’s ', '') + ' <b>' + (x.batch / x.P.D14 * 100).toFixed(1) + '%</b></span>'; }).join('') : '—';
      var acc = S.done < 6 || !okm.length ? '<span class="mx-pend">' + (S.done < 6 ? 'after review' : 'n/a') + '</span>' : (function () { var w = okm.reduce(function (a, b) { return Math.abs(b.err) > Math.abs(a.err) ? b : a; }); return Math.abs(w.err) * 100 <= S.set.band ? chip('good', pct(w.err)) : chip(w.err < 0 ? 'bad' : 'warn', pct(w.err)); })();
      var act = f.trader ? 'Screened out: trader, not a maker' : f.health < 40 ? 'Held; one review by a category manager' : f.stg === 'remedy' ? 'Fix running: half share, ' + SIGN[f.sig.indexOf(Math.min.apply(null, f.sig))].toLowerCase() + ' is weakest' : best.gap * 100 < S.set.gate ? 'No badge until the price edge returns' : !f.node ? 'Eligible, waits for its node' : f.stg === 'graduated' ? 'Full share; prepaid batches unlocked' : 'Starter share; grows after 30 days at 80+';
      return { f: f, fi: fi, best: best, share: share, acc: acc, act: act };
    }).sort(function (a, b) { return b.f.health - a.f.health; });
    var h = '<div><h3>Seller behaviour matrix</h3><div class="sub">How Meesho reads each manufacturer, every day. Five behaviour signals (0–100) make the Health Score; with the price check and forecast accuracy, they decide each factory’s share of demand. Click a row for the working.</div></div>';
    h += '<div class="mx-key"><span>Weights:</span>' + SIGN.map(function (n, i) { return '<span><b>' + n + '</b> ' + Math.round(SIGW[i] * 100) + '%</span>'; }).join('') + '<span class="sw"><i style="background:#d03b3b"></i>&lt;40 <i style="background:#e98b4e"></i>40–59 <i style="background:#e8b84a"></i>60–79 <i style="background:#5fb88c"></i>80–89 <i style="background:#1f8a5b"></i>90+</span></div>';
    h += '<div class="mc-tw"><table class="mc-t mx-t"><thead><tr><th>Manufacturer</th>' + SIGN.map(function (n) { return '<th class="c">' + n + '</th>'; }).join('') + '<th class="c">Health</th><th>Stage</th><th class="num">Price vs median</th><th class="c">Forecast accuracy</th><th class="num">Share of demand</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var f = r.f, sel = S.fsel === 'm' + r.fi, g = STG[f.stg] || STG.new;
        var out = '<tr class="click' + (sel ? ' sel' : '') + '" data-fp="m' + r.fi + '"><td><b>' + f.n + '</b><small>' + f.id + ' · ' + f.cl + '</small></td>' + f.sig.map(heat).join('') + '<td class="c"><b class="mx-h">' + f.health + '</b></td><td>' + chip(g[0], g[1]) + '</td><td class="num" style="color:' + (r.best.gap * 100 >= S.set.gate ? 'var(--good-ink)' : 'var(--critical)') + ';font-weight:650">' + Math.abs(r.best.gap * 100).toFixed(1) + (r.best.gap < 0 ? '% above' : '% below') + '</td><td class="c">' + r.acc + '</td><td class="num">' + r.share + '</td></tr>';
        if (sel) out += '<tr class="mx-open"><td colspan="12"><div class="mx-why"><div><b>Health = </b>' + f.sig.map(function (v, i) { return v + ' × ' + SIGW[i].toFixed(2); }).join(' + ') + ' = <b>' + f.health + '</b></div><div><b>Price check:</b> lowest viable ₹' + r.best.v + ' vs median ₹' + r.best.P.p.med + ' for ' + r.best.P.p.n + ' (gate ' + S.set.gate + '%)</div><div><b>What the system does:</b> ' + r.act + '</div></div></td></tr>';
        return out;
      }).join('') + '</tbody></table></div>';
    h += '<div class="mx-legend2"><div><b>Allocate</b> days 0–14, starter impressions</div><div><b>Remedy</b> a signal dropped; one automatic fix at a time</div><div><b>Graduated</b> 80+ for 30 days; bigger share, prepaid batches</div><div><b>Human review</b> still under 40 after a fix</div></div>';
    return h;
  }
  function renderSet() {
    var s = S.set, el = document.getElementById('mc-set');
    var f = function (k, lbl, min, max, unit) { return '<label>' + lbl + '<b id="mcv-' + k + '">' + s[k] + unit + '</b><input type="range" min="' + min + '" max="' + max + '" value="' + s[k] + '" data-k="' + k + '" data-u="' + unit + '"></label>'; };
    el.innerHTML = '<div class="g">' + f('gate', 'Price gate: below median', 4, 15, '%') + f('band', 'Accuracy band', 5, 30, '±%') + f('buf', 'Pre-order buffer', 0, 30, '%') + f('sNew', 'Share, new factory', 2, 12, '%') + f('sGrad', 'Share, graduated', 4, 15, '%') + '</div><div class="note">These are the rules from the deck. Change one and every screen recalculates.</div>';
    el.classList.toggle('open', S.setOpen);
  }
  function render() {
    var M = model();
    document.getElementById('mc-runner').innerHTML = STEPS.map(function (s, i) { var c = i < S.done ? 'done' : i === S.done ? 'next' : ''; return '<button type="button" class="mc-st ' + c + '" data-step="' + i + '" title="' + (i < S.done ? 'Done · open its screen' : 'Run the week up to this step') + '" aria-label="Step ' + (i + 1) + ': ' + s[0] + (i < S.done ? ', done' : '') + '"><span class="n">' + (i < S.done ? '✓' : i + 1) + '</span><span class="tx"><b>' + s[0] + '</b><span>' + SCHED[i] + '</span></span></button>'; }).join('') +
      (S.done >= 6 ? '<button type="button" class="mc-run reset" data-reset="1">↺ Start week 44</button>' : '<button type="button" class="mc-run" data-step="' + S.done + '">Run: ' + STEPS[S.done][0] + ' →</button>');
    document.getElementById('mc-nav').innerHTML = TABS.map(function (t) { return '<button type="button" data-tab="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '"><i aria-hidden="true">' + t[1] + '</i>' + t[2] + '</button>'; }).join('') + '<div class="sep"></div><div class="hint">Press <b>Run</b> or click a step above to move the week. Change the rules with ⚙.</div>';
    var v = { week: vWeek, demand: vDemand, catalog: vCatalog, forecast: vForecast, briefs: vBriefs, review: vReview, matrix: vMatrix }[S.tab](M);
    var main = document.getElementById('mc-main'); main.innerHTML = v;
    wireChart('mc-c1'); wireChart('mc-c2');
  }
  var GOTO = { 1: 'forecast', 2: 'forecast', 3: 'briefs', 4: 'briefs', 5: 'review' };
  var STEPTAB = ['demand', 'forecast', 'forecast', 'briefs', 'briefs', 'review'];
  document.getElementById('console').addEventListener('click', function (e) {
    var t = e.target.closest('[data-reset],[data-tab],[data-fp],[data-step]'); if (!t) return;
    if (t.dataset.step) {
      var k = +t.dataset.step;
      /* not run yet: run the week up to this step. Already done: open the screen where its result shows. */
      if (k >= S.done) S.done = k + 1;
      S.tab = STEPTAB[k]; S.fsel = null; render();
      if (k === 2) { var al = document.getElementById('mc-alloc'); if (al) al.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    if (t.dataset.reset) { S.done = 1; S.tab = 'week'; S.fsel = null; render(); return; }
    if (t.dataset.tab) { S.tab = t.dataset.tab; if (S.tab !== 'catalog' && S.tab !== 'review' && S.tab !== 'matrix') S.fsel = null; render(); return; }
    if (t.dataset.fp) { var k = t.dataset.fp.charAt(0) === 'm' ? t.dataset.fp : +t.dataset.fp; S.fsel = S.fsel === k && (S.tab === 'catalog' || S.tab === 'matrix') ? null : k; render(); }
  });
  document.getElementById('console').addEventListener('change', function (e) { if (e.target.id === 'mc-prod') { S.prod = e.target.value; render(); } });
  document.getElementById('mc-set').addEventListener('input', function (e) { var k = e.target.dataset.k; if (!k) return; S.set[k] = +e.target.value; document.getElementById('mcv-' + k).textContent = S.set[k] + e.target.dataset.u; render(); if (window.apCalc) window.apCalc(); });
  document.getElementById('mc-setbtn').onclick = function () { S.setOpen = !S.setOpen; this.setAttribute('aria-expanded', S.setOpen); document.getElementById('mc-set').classList.toggle('open', S.setOpen); };
  document.getElementById('mc-reset').onclick = function () { S.done = 1; S.tab = 'week'; S.fsel = null; render(); };
  window.mcGo = function (tab) { S.tab = tab; render(); document.getElementById('console').scrollIntoView({ behavior: 'smooth' }); };
  window.MC = { model: model, PROD: PROD, DIST: DIST, FAC: FAC, SIGW: SIGW, SIGN: SIGN, S: S, refresh: function () { render(); } };
  renderSet(); render();
}
