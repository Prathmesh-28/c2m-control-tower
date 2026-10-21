// Data → engines → decisions diagram, the demand equation, the four indexes and the demand split. Reads window.MC from console.js.
// Kept as plain DOM code; Prediction.jsx runs it on a fresh copy of the markup each time the tab opens.
export function initIndexes() {
  var MC = window.MC, fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
  var pct = function (x, d) { return (x > 0 ? '+' : '') + (x * 100).toFixed(d || 0) + '%'; };

  /* ---------- 1. data → engines → decisions ---------- */
  var G = { b: ['Buyers today', '#1d5aa6', '#eef4fc'], h: ['Past sales', '#11704d', '#e7f5ee'], m: ['Manufacturers', '#8a4a0c', '#fff1e3'] };
  var SRC = [
    ['b', 'Searches', 'what buyers look for'], ['b', 'Views and carts', 'interest before buying'], ['b', 'Orders', 'price paid, district, size'], ['b', 'Returns', 'with reasons, by size'], ['b', 'Pre-orders', 'paid before the batch is made'],
    ['h', 'Last 8 weeks of orders', 'the recent level'], ['h', 'Same week last year', 'season and festivals'], ['h', 'Past sales by product', 'what has sold for years'],
    ['m', 'Catalogue and making cost', 'what it makes, at what cost'], ['m', 'Capacity and lead time', 'how much, how fast'], ['m', 'Location and node', 'how close to a node'], ['m', 'Delivery and returns record', 'how reliable it has been']
  ];
  var ENG = [['Demand forecast', 'next week, by district and size'], ['Price Truth Index', 'is it really cheaper?'], ['Seller Health Score', 'does it keep its promises?'], ['Allocation', 'who makes how much']];
  var DEC = [['What to make', 'product, sizes, districts'], ['How many', 'suggested and locked batch'], ['Who makes it', 'which manufacturers get a share'], ['At what price', 'badge and pre-order price'], ['Fix or reward', 'nudges, holds, prepaid batches']];
  var E1 = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 0], [3, 2], [4, 3], [4, 0], [5, 0], [6, 0], [7, 0], [7, 1], [8, 1], [8, 3], [9, 3], [10, 3], [11, 2]];
  var E2 = [[0, 0], [0, 1], [1, 3], [1, 2], [2, 2], [2, 4], [3, 1], [3, 2]];
  var svg = document.getElementById('pr-svg');
  var sy = [], gy = {}, y = 18;
  SRC.forEach(function (s, i) { if (!gy[s[0]]) { gy[s[0]] = y; y += 24; } sy.push(y); y += 46; if (SRC[i + 1] && SRC[i + 1][0] !== s[0]) y += 10; });
  var ey = [110, 250, 390, 530], dy = [80, 205, 330, 455, 580];
  var LX = 10, LW = 260, EX = 440, EW = 240, DX = 850, DW = 260;
  var g = '';
  E1.forEach(function (e) { var x1 = LX + LW, y1 = sy[e[0]] + 20, x2 = EX, y2 = ey[e[1]] + 30; g += '<path class="pr-e" data-s="' + e[0] + '" data-e="' + e[1] + '" d="M' + x1 + ',' + y1 + ' C' + (x1 + 90) + ',' + y1 + ' ' + (x2 - 90) + ',' + y2 + ' ' + x2 + ',' + y2 + '" stroke="' + G[SRC[e[0]][0]][1] + '"/>'; });
  E2.forEach(function (e) { var x1 = EX + EW, y1 = ey[e[0]] + 30, x2 = DX, y2 = dy[e[1]] + 24; g += '<path class="pr-e e2" data-e="' + e[0] + '" data-d="' + e[1] + '" d="M' + x1 + ',' + y1 + ' C' + (x1 + 80) + ',' + y1 + ' ' + (x2 - 80) + ',' + y2 + ' ' + x2 + ',' + y2 + '" stroke="var(--plum-2)"/>'; });
  Object.keys(gy).forEach(function (k) { g += '<text x="' + LX + '" y="' + (gy[k] + 12) + '" class="pr-gl" style="fill:' + G[k][1] + '">' + G[k][0].toUpperCase() + '</text>'; });
  SRC.forEach(function (s, i) { var c = G[s[0]]; g += '<g class="pr-n" data-s="' + i + '" tabindex="0"><rect x="' + LX + '" y="' + sy[i] + '" width="' + LW + '" height="40" rx="8" fill="' + c[2] + '" stroke="' + c[1] + '" stroke-opacity=".35"/><text x="' + (LX + 12) + '" y="' + (sy[i] + 17) + '" class="pr-t">' + s[1] + '</text><text x="' + (LX + 12) + '" y="' + (sy[i] + 32) + '" class="pr-s">' + s[2] + '</text></g>'; });
  ENG.forEach(function (e, i) { g += '<g class="pr-n" data-e="' + i + '" tabindex="0"><rect x="' + EX + '" y="' + ey[i] + '" width="' + EW + '" height="60" rx="12" fill="var(--plum)"/><text x="' + (EX + EW / 2) + '" y="' + (ey[i] + 27) + '" text-anchor="middle" class="pr-et">' + e[0] + '</text><text x="' + (EX + EW / 2) + '" y="' + (ey[i] + 45) + '" text-anchor="middle" class="pr-es">' + e[1] + '</text></g>'; });
  DEC.forEach(function (d, i) { g += '<g class="pr-n" data-d="' + i + '" tabindex="0"><rect x="' + DX + '" y="' + dy[i] + '" width="' + DW + '" height="48" rx="10" fill="#fff6e8" stroke="var(--accent)" stroke-opacity=".5"/><text x="' + (DX + 14) + '" y="' + (dy[i] + 21) + '" class="pr-t" style="fill:var(--plum)">' + d[0] + '</text><text x="' + (DX + 14) + '" y="' + (dy[i] + 38) + '" class="pr-s">' + d[1] + '</text></g>'; });
  g += '<path d="M' + (DX + DW / 2) + ',' + (dy[4] + 52) + ' C' + (DX + DW / 2) + ',' + 676 + ' ' + (LX + LW / 2) + ',' + 676 + ' ' + (LX + LW / 2) + ',' + (sy[11] + 44) + '" class="pr-loop"/><text x="' + 560 + '" y="' + 700 + '" text-anchor="middle" class="pr-s" style="fill:var(--plum-2);font-weight:700">↺ every week’s sales, returns and accuracy become next week’s past data</text>';
  svg.innerHTML = g;
  function hl(kind, idx) {
    var keepS = {}, keepE = {}, keepD = {};
    if (kind === 's') { keepS[idx] = 1; E1.forEach(function (e) { if (e[0] == idx) keepE[e[1]] = 1; }); E2.forEach(function (e) { if (keepE[e[0]]) keepD[e[1]] = 1; }); }
    if (kind === 'e') { keepE[idx] = 1; E1.forEach(function (e) { if (e[1] == idx) keepS[e[0]] = 1; }); E2.forEach(function (e) { if (e[0] == idx) keepD[e[1]] = 1; }); }
    if (kind === 'd') { keepD[idx] = 1; E2.forEach(function (e) { if (e[1] == idx) keepE[e[0]] = 1; }); E1.forEach(function (e) { if (keepE[e[1]]) keepS[e[0]] = 1; }); }
    svg.classList.add('hl');
    svg.querySelectorAll('.pr-n').forEach(function (n) { var on = n.dataset.s !== undefined ? keepS[n.dataset.s] : n.dataset.e !== undefined ? keepE[n.dataset.e] : keepD[n.dataset.d]; n.classList.toggle('on', !!on); });
    svg.querySelectorAll('.pr-e').forEach(function (p) { var on = p.classList.contains('e2') ? keepE[p.dataset.e] && keepD[p.dataset.d] : keepS[p.dataset.s] && keepE[p.dataset.e]; p.classList.toggle('on', !!on); });
  }
  function clear() { svg.classList.remove('hl'); }
  svg.querySelectorAll('.pr-n').forEach(function (n) {
    var k = n.dataset.s !== undefined ? ['s', n.dataset.s] : n.dataset.e !== undefined ? ['e', n.dataset.e] : ['d', n.dataset.d];
    n.addEventListener('mouseenter', function () { hl(k[0], k[1]); }); n.addEventListener('focus', function () { hl(k[0], k[1]); });
    n.addEventListener('mouseleave', clear); n.addEventListener('blur', clear);
  });
  /* phone version: one card per engine */
  document.getElementById('pr-list').innerHTML = ENG.map(function (e, i) {
    var ins = E1.filter(function (x) { return x[1] === i; }).map(function (x) { var s = SRC[x[0]]; return '<span style="background:' + G[s[0]][2] + ';color:' + G[s[0]][1] + '">' + s[1] + '</span>'; }).join('');
    var outs = E2.filter(function (x) { return x[0] === i; }).map(function (x) { return '<span class="o">' + DEC[x[1]][0] + '</span>'; }).join('');
    return '<div class="pr-li"><div class="ins">' + ins + '</div><div class="eng"><b>' + e[0] + '</b><small>' + e[1] + '</small></div><div class="outs">' + outs + '</div></div>';
  }).join('');

  /* ---------- 1b. the forecast equation, live ---------- */
  var ps = document.getElementById('pr-p'), ds = document.getElementById('pr-d'), cur = { p: 'BRF3', d: 'Nagpur' };
  ps.innerHTML = MC.PROD.map(function (p) { return '<option value="' + p.id + '">' + p.n + '</option>'; }).join('');
  ds.innerHTML = MC.DIST.map(function (d) { return '<option>' + d + '</option>'; }).join(''); ds.value = cur.d;
  function eq() {
    var M = MC.model(), P = M.prods[cur.p], p = P.p, di = MC.DIST.indexOf(cur.d), h = p.hist, s = p.srch;
    var level = .5 * h[7][di] + .3 * h[6][di] + .2 * h[5][di], adj = 1 + (P.trend - 1) * .6, row = P.rows.filter(function (r) { return r.di === di; })[0];
    var term = function (cls, tag, title, val, how) { return '<div class="pr-term ' + cls + '"><span class="tg">' + tag + '</span><b>' + title + '</b><em>' + val + '</em><small>' + how + '</small></div>'; };
    document.getElementById('pr-eq').innerHTML =
      term('h', 'Past sales', 'Recent level', fmt(level), '50% of last week (' + fmt(h[7][di]) + ') + 30% the week before (' + fmt(h[6][di]) + ') + 20% the one before (' + fmt(h[5][di]) + ')') + '<span class="op">×</span>' +
      term('b', 'Buyers today', 'Search trend', '×' + adj.toFixed(3), 'searches, last 2 weeks vs the 2 before: ' + pct(P.trend - 1, 1) + ', counted at 60%') + '<span class="op">×</span>' +
      term('h', 'Same week last year', 'Season', '×' + P.season.toFixed(2), P.season > 1.03 ? 'last year this week sold ' + pct(P.season - 1) + ' above normal (pre-Diwali)' : 'last year this week was a normal week') + '<span class="op">=</span>' +
      term('r', 'Forecast', 'Next week · ' + cur.d, fmt(row.f), 'likely ' + fmt(row.lo) + ' – ' + fmt(row.hi) + '; the range is wider where weeks swing more') + '<span class="op">→</span>' +
      term('b', 'Buyers confirm', 'Pre-orders', 'fix the batch', 'the batch is locked at real pre-orders + 15%, so a wrong forecast never becomes unsold stock');
  }
  ps.onchange = function () { cur.p = ps.value; eq(); }; ds.onchange = function () { cur.d = ds.value; eq(); };
  eq();

  /* ---------- 3. PTI mini visual + who gets how much ---------- */
  function pti() {
    var M = MC.model(), x = M.fps.filter(function (f) { return f.f.n === 'Kavin Knit Mills' && f.pid === 'BRF3'; })[0], med = x.P.p.med, gate = med * (1 - MC.S.set.gate / 100), mx = med * 1.15;
    var bar = function (lbl, v, cls) { return '<div class="r"><span>' + lbl + '</span><div class="t"><i class="' + cls + '" style="width:' + (v / mx * 100) + '%"></i></div><b>₹' + Math.round(v) + '</b></div>'; };
    document.getElementById('pr-pti').innerHTML = '<div class="pr-bars">' + bar('Median buyers paid', med, 'm') + bar('Badge line (−' + MC.S.set.gate + '%)', gate, 'g') + bar('Kavin’s lowest viable', x.v, 'k') + '</div><small>Kavin Knit Mills, men’s briefs: ' + (x.gap * 100).toFixed(1) + '% below the median → ' + (x.gap * 100 >= MC.S.set.gate ? 'badge on' : 'no badge') + '</small>';
  }
  pti();
  var fs = document.getElementById('pr-f');
  fs.innerHTML = MC.FAC.map(function (f, i) { return '<option value="' + i + '">' + f.n + '</option>'; }).join('');
  function flow() {
    var M = MC.model(), f = MC.FAC[+fs.value], mine = M.fps.filter(function (x) { return x.f === f; }), x = mine.filter(function (y) { return y.status === 'ok'; })[0] || mine[0], st = MC.S.set;
    var best = x;
    var gates = [['Is it a real maker?', !f.trader, f.trader ? 'Udyam and GST show trading' : 'Udyam and GST show manufacturing'], ['Is it really cheaper?', best.gap * 100 >= st.gate, x.P.p.n + ': ' + Math.abs(best.gap * 100).toFixed(1) + (best.gap < 0 ? '% above' : '% below') + ' the median (needs ' + st.gate + '% below)'], ['Is it reliable?', f.health >= 40, 'Health Score ' + f.health + ' (needs 40)'], ['Is a node close by?', !!f.node, f.node ? 'Factory Node live in ' + f.cl : 'No node in ' + f.cl + ' yet']];
    var fail = gates.filter(function (g) { return !g[1]; })[0];
    var h = '<div class="st"><span class="n">1</span><b>Pass four gates</b><ul>' + gates.map(function (g) { return '<li class="' + (g[1] ? 'y' : 'x') + '"><i>' + (g[1] ? '✓' : '✕') + '</i><div>' + g[0] + '<small>' + g[2] + '</small></div></li>'; }).join('') + '</ul></div>';
    if (fail) { h += '<div class="st stop"><b>Stops here</b><p>' + f.n + ' gets no share this week: ' + fail[2].toLowerCase() + '. Demand is still tracked, so it can start the week it passes.</p></div>'; document.getElementById('pr-flow').innerHTML = h; return; }
    var shareP = f.stg === 'graduated' ? st.sGrad : f.stg === 'remedy' ? st.sNew / 2 : st.sNew, stg = { new: 'new', graduated: 'graduated', remedy: 'a fix is running', review: 'review' }[f.stg];
    h += '<span class="ar">→</span><div class="st"><span class="n">2</span><b>Share by stage</b><div class="big">' + shareP + '%</div><small>' + f.n.split(' ')[0] + ' is ' + stg + ' · new 6%, graduated 9%, during a fix 3%</small></div>';
    h += '<span class="ar">→</span><div class="st"><span class="n">3</span><b>Of 14 days’ demand, within caps</b><div class="big">' + fmt(x.batch) + '</div><small>' + shareP + '% × ' + fmt(x.P.D14) + ' for ' + x.P.p.n + (x.capLim ? ', cut to its capacity' : '') + (x.P.capped ? ', scaled to the 20% badge cap' : '') + '</small></div>';
    h += '<span class="ar">→</span><div class="st"><span class="n">4</span><b>Buyers confirm it</b><div class="big">' + fmt(x.make) + '</div><small>' + fmt(x.conf) + ' pre-orders + ' + st.buf + '% buffer = the batch it actually makes</small></div>';
    document.getElementById('pr-flow').innerHTML = h;
  }
  fs.onchange = flow; flow();
  document.getElementById('pr-idx').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b && window.mcGo) window.mcGo(b.dataset.go); });
  /* keep live examples in step with ⚙ Rules */
  var set = document.getElementById('mc-set'); if (set) set.addEventListener('input', function () { eq(); flow(); pti(); });
}
