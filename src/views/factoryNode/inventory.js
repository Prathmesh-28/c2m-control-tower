// The node inventory screen: categories, products, today and history.
// Kept as plain DOM code; FactoryNode.jsx runs it on a fresh copy of the markup each time the tab opens.
export function initInventory() {
  var TODAY = 10, DOWN = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  function label(d) { var dt = 16 + d, m = 'Oct'; if (dt > 31) { dt -= 31; m = 'Nov'; } return DOWN[((d % 7) + 7) % 7] + ', ' + dt + ' ' + m; }
  function short(d) { var dt = 16 + d; return dt > 31 ? dt - 31 : dt; }
  function nextDow(d, dow) { for (var k = d; k < d + 8; k++) if (((k % 7) + 7) % 7 === dow) return k; return d; }
  var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- catalogue ---------- */
  var CATS = [
    { id: 'hos', n: 'Hosiery & innerwear', ic: '👕', cl: 'Tiruppur', truck: 3, items: [
      ['Men’s cotton briefs · pack of 3', 'Kavin Knit Mills', 67, 192], ['Ankle socks · pack of 5', 'Velan Hosiery', 110, 128], ['Men’s vests · pack of 2', 'Sri Murugan Hosiery', 30, 189], ['Women’s cotton leggings', 'Thangam Hosiery', 25, 239]] },
    { id: 'sar', n: 'Saree & dress material', ic: '🥻', cl: 'Erode', truck: 4, items: [
      ['Cotton saree with blouse piece', 'Bhavani Handlooms', 18, 449], ['Dress material · 3-piece', 'Kongu Weaves', 22, 389], ['Printed cotton dupatta', 'Erode Prints', 15, 149]] },
    { id: 'hom', n: 'Home textiles', ic: '🛏️', cl: 'Karur', truck: 2, items: [
      ['Double bedsheet + 2 covers', 'Karur Home Linen', 40, 325], ['Cotton bath towel', 'Amaravathi Towels', 35, 227], ['Kitchen towels · set of 4', 'Karur Home Linen', 28, 159]] },
    { id: 'jew', n: 'Imitation jewellery', ic: '💍', cl: 'Coimbatore', truck: 3, items: [
      ['Oxidised jhumka earrings', 'Kovai Ornaments', 45, 119], ['Gold-plated necklace set', 'Kovai Ornaments', 20, 349, { slow: 1 }], ['Glass bangles · set of 12', 'Sri Lakshmi Bangles', 30, 179]] },
    { id: 'bag', n: 'Bags', ic: '👜', cl: 'Coimbatore', truck: 5, items: [
      ['Canvas tote bag', 'Kovai Bag Works', 25, 199], ['Laptop backpack · 15.6″', 'Kovai Bag Works', 15, 499, { spike: 6, x: 2.1 }], ['Jute shopping bag', 'Green Jute Co.', 20, 149]] },
    { id: 'sta', n: 'Stationery', ic: '📒', cl: 'Sivakasi', truck: 2, extra: 1, items: [
      ['Ruled notebooks · pack of 6', 'Sivakasi Paper Products', 35, 199], ['Long notebooks · pack of 12', 'Sivakasi Paper Products', 20, 299, { spike: 4, x: 1.6 }], ['Drawing books · pack of 4', 'Arasan Printers', 18, 129]] },
    { id: 'foo', n: 'Basic footwear', ic: '🩴', cl: 'Ambur', truck: 6, items: [
      ['Men’s flip-flops', 'Ambur Footcraft', 40, 179], ['Women’s flat sandals', 'Vaniyambadi Leathers', 22, 299]] }
  ];
  var CAP = 9000;

  /* ---------- simulation: one product, day by day ---------- */
  function sim(cat, it, seed) {
    var R = rng(seed), r = it[2], o = it[4] || {}, avail = Math.round(r * 6), resv = 0, back = Math.round(r * .9 * 4), H = {};
    for (var d = -21; d <= TODAY; d++) {
      var dow = ((d % 7) + 7) % 7, mult = o.slow ? .45 : (o.spike !== undefined && d >= o.spike ? o.x : 1);
      var rec = { d: d, start: avail + resv, truck: 0, tpre: 0, tsell: 0, ret: 0, pre: 0, ship: 0, missed: 0 };
      if (dow === cat.truck) { var pq = back, buf = Math.round(pq * .15), top = Math.max(0, Math.round(10 * r - (avail - r) - buf)); back = 0; resv += pq; avail += buf + top; rec.truck = pq + buf + top; rec.tpre = pq; rec.tsell = buf + top; }
      var rt = Math.round(r * mult * .05 * (.6 + .8 * R())); avail += rt; rec.ret = rt;
      if (dow === (cat.truck + 1) % 7) { rec.pre = resv; resv = 0; }
      var want = Math.round(r * mult * (.85 + .3 * R())), got = Math.min(avail, want); avail -= got; rec.ship = got; rec.missed = want - got;
      back += Math.round(r * .9 * mult * (.85 + .3 * R()));
      rec.end = avail + resv; rec.avail = avail; rec.resv = resv; rec.rate = r * mult;
      if (d >= 0) H[d] = rec;
    }
    return H;
  }
  var P = [];
  CATS.forEach(function (c, ci) { c.prods = c.items.map(function (it, k) { var p = { cat: c, n: it[0], f: it[1], r: it[2], price: it[3], o: it[4] || {}, H: sim(c, it, 101 + ci * 17 + k * 5) }; P.push(p); return p; }); });

  function status(p, d) {
    var h = p.H[d], left = h.avail / Math.max(1, h.rate);
    if (h.avail === 0) return ['bad', 'Sold out', left];
    if (left < 2) return ['warn', 'Running low', left];
    if (left > 14) return ['neu', 'Slow seller', left];
    return ['good', 'OK', left];
  }
  function chip(k, t) { var ic = { good: '✓', warn: '!', bad: '✕', neu: '•' }[k]; return '<span class="mc-chip ' + k + '"><i aria-hidden="true">' + ic + '</i>' + t + '</span>'; }

  /* sums for a set of products on a day */
  function agg(prods, d) {
    var o = { start: 0, avail: 0, resv: 0, sAvail: 0, sResv: 0, truck: 0, ret: 0, pre: 0, ship: 0, end: 0, trucks: {}, pres: {}, ships: {}, rets: {} };
    prods.forEach(function (p) {
      var h = p.H[d], prev = d > 0 ? p.H[d - 1] : null, c = p.cat.n;
      o.start += h.start; o.end += h.end; o.truck += h.truck; o.ret += h.ret; o.pre += h.pre; o.ship += h.ship;
      if (prev) { o.sAvail += prev.avail; o.sResv += prev.resv; } else { o.sAvail += h.start; }
      if (h.truck) { o.trucks[c] = o.trucks[c] || { q: 0, pre: 0, sell: 0, f: {} }; o.trucks[c].q += h.truck; o.trucks[c].pre += h.tpre; o.trucks[c].sell += h.tsell; o.trucks[c].f[p.f] = 1; }
      if (h.pre) o.pres[c] = (o.pres[c] || 0) + h.pre;
      if (h.ship) o.ships[c] = (o.ships[c] || 0) + h.ship;
      if (h.ret) o.rets[c] = (o.rets[c] || 0) + h.ret;
    });
    o.inn = o.truck + o.ret; o.out = o.pre + o.ship;
    return o;
  }
  function chips(map) { var k = Object.keys(map); return k.length > 1 ? '<div class="fy-by">' + k.map(function (c) { return '<span>' + c + ' ' + fmt(map[c]) + '</span>'; }).join('') + '</div>' : ''; }
  function row(tm, what, q, extra) { return '<li><span class="tm">' + tm + '</span><div><b>' + what + '</b>' + (extra || '') + '</div><span class="q">' + fmt(q) + '</span></li>'; }

  function three(prods, d, scope) {
    var o = agg(prods, d), past = d < TODAY, cap = scope ? null : CAP, h = '<div class="fy-three">';
    h += '<article class="fy-card stock"><div class="fy-k"><span class="ic" aria-hidden="true">📦</span>In stock at the start of ' + (past ? 'that' : 'the') + ' day</div><div class="fy-big">' + fmt(o.start) + '<small>packs</small></div>' +
      (cap ? '<div class="fy-cap"><div class="tr"><i style="width:' + Math.min(100, o.start / cap * 100) + '%"></i></div><span>' + Math.round(o.start / cap * 100) + '% of ' + fmt(cap) + ' capacity</span></div>' : '') +
      '<ul class="fy-list">' + row('', 'Remaining to sell', o.sAvail, '<small>ships as buyers order</small>') + row('', 'Reserved for pre-order buyers', o.sResv, '<small>dispatched the day after the truck</small>') + '</ul></article>';
    var ins = Object.keys(o.trucks).map(function (c) { var t = o.trucks[c]; return row('06:00', 'Truck · ' + c, t.q, '<small>' + Object.keys(t.f).join(', ') + '</small><small>' + fmt(t.pre) + ' for pre-orders · ' + fmt(t.sell) + ' to sell</small>'); });
    if (o.ret) ins.push(row('15:00', 'Returns from Valmo, fit to sell', o.ret, chips(o.rets)));
    h += '<article class="fy-card in"><div class="fy-k"><span class="ic" aria-hidden="true">⬇</span>' + (past ? 'Came in' : 'Coming in today') + '</div><div class="fy-big">+' + fmt(o.inn) + '<small>packs</small></div><ul class="fy-list">' + (ins.length ? ins.join('') : '<li class="none">Nothing arriving</li>') + '</ul></article>';
    var outs = [];
    if (o.pre) outs.push(row('11:00', 'Pre-orders to buyers', o.pre, '<small>Valmo pickup</small>' + chips(o.pres)));
    if (o.ship) outs.push(row('All day', 'Orders from stock', o.ship, '<small>packed as buyers order · Valmo pickup 18:00</small>' + chips(o.ships)));
    h += '<article class="fy-card out"><div class="fy-k"><span class="ic" aria-hidden="true">⬆</span>' + (past ? 'Went out' : 'Going out today') + '</div><div class="fy-big">−' + fmt(o.out) + '<small>packs</small></div><ul class="fy-list">' + (outs.length ? outs.join('') : '<li class="none">Nothing leaving</li>') + '</ul></article></div>';
    h += '<div class="fy-eq"><span><b>' + fmt(o.start) + '</b> in stock</span><i>+</i><span><b>' + fmt(o.inn) + '</b> in</span><i>−</i><span><b>' + fmt(o.out) + '</b> out</span><i>=</i><span class="end"><b>' + fmt(o.end) + '</b> in stock ' + (past ? 'at close' : 'tonight') + '</span></div>';
    return h;
  }

  var S = { tab: 'today', cat: null, open: null, hcat: 'all', hd: null };
  function crumbs() {
    var c = S.cat && CATS.filter(function (x) { return x.id === S.cat; })[0];
    return '<nav class="fz-crumb" aria-label="Breadcrumb"><button type="button" data-cat=""' + (c ? '' : ' aria-current="page"') + '>All categories</button>' + (c ? '<span>›</span><b>' + c.ic + ' ' + c.n + '</b>' : '') + '</nav>';
  }
  function vToday() {
    var h = '<div class="fy-date"><div><span class="lbl">Today</span><h3>' + label(TODAY) + ' 2026</h3></div><span class="fy-live"><i></i>Live · updated 6:00 pm</span></div>' + crumbs();
    if (!S.cat) {
      h += three(P, TODAY, false);
      h += '<div class="fz-head"><h4>Categories</h4><span>Click a category to see its products</span></div><div class="fz-grid">' + CATS.map(function (c) {
        var o = agg(c.prods, TODAY), sts = c.prods.map(function (p) { return status(p, TODAY)[0]; }), bad = sts.filter(function (s) { return s === 'bad' || s === 'warn'; }).length, slow = sts.filter(function (s) { return s === 'neu'; }).length;
        var nt = nextDow(TODAY, c.truck);
        return '<button type="button" class="fz-cat" data-cat="' + c.id + '"><div class="t"><span class="ic" aria-hidden="true">' + c.ic + '</span><div><b>' + c.n + '</b><small>' + c.cl + ' · ' + c.prods.length + ' products' + (c.extra ? ' · added' : '') + '</small></div></div>' +
          '<div class="nums"><div><span>In stock</span><b>' + fmt(o.start) + '</b></div><div class="in"><span>In today</span><b>+' + fmt(o.inn) + '</b></div><div class="out"><span>Out today</span><b>−' + fmt(o.out) + '</b></div></div>' +
          '<div class="tn">' + fmt(o.start) + ' + ' + fmt(o.inn) + ' − ' + fmt(o.out) + ' = <b>' + fmt(o.end) + ' tonight</b></div><div class="ft">' + (bad ? chip('warn', bad + ' running low') : slow ? chip('neu', slow + ' slow seller') : chip('good', 'All products OK')) + '<span>' + (nt === TODAY ? '🚚 truck today' : 'next truck ' + label(nt).split(',')[0]) + '</span></div></button>';
      }).join('') + '</div>';
      return h;
    }
    var c = CATS.filter(function (x) { return x.id === S.cat; })[0];
    h += three(c.prods, TODAY, true);
    var nt = nextDow(TODAY + 1, c.truck);
    h += '<div class="fz-head"><h4>' + c.prods.length + ' products in ' + c.n + '</h4><span>Weekly truck from ' + c.cl + ' arrives on ' + ['Fridays','Saturdays','Sundays','Mondays','Tuesdays','Wednesdays','Thursdays'][c.truck] + ' · click a product for its last 7 days</span></div>';
    h += '<div class="mc-tw"><table class="mc-t fz-t"><thead><tr><th>Product</th><th class="num">Remaining to sell</th><th class="num">Reserved for buyers</th><th class="num">Coming in today</th><th class="num">Going out today</th><th class="num">In stock tonight</th><th class="num">Days left</th><th>Status</th></tr><tr class="fz-sub"><th></th><th class="num" colspan="2">at the start of the day</th><th colspan="5"></th></tr></thead><tbody>' +
      c.prods.map(function (p, k) {
        var h0 = p.H[TODAY], st = status(p, TODAY), open = S.open === k, prev = p.H[TODAY - 1];
        var r = '<tr class="click' + (open ? ' sel' : '') + '" data-p="' + k + '"><td><b>' + p.n + '</b><small>' + p.f + ' · ₹' + p.price + '</small></td><td class="num"><b>' + fmt(prev.avail) + '</b></td><td class="num">' + fmt(prev.resv) + '</td><td class="num" style="color:#11704d">' + (h0.truck + h0.ret ? '+' + fmt(h0.truck + h0.ret) : '—') + '</td><td class="num" style="color:#b0461a">' + (h0.pre + h0.ship ? '−' + fmt(h0.pre + h0.ship) : '—') + '</td><td class="num"><b>' + fmt(h0.end) + '</b></td><td class="num">' + st[2].toFixed(1) + '</td><td>' + chip(st[0], st[1]) + '</td></tr>';
        if (open) {
          var days = []; for (var d = TODAY - 6; d <= TODAY; d++) days.push(p.H[d]);
          var mx = Math.max.apply(null, days.map(function (x) { return Math.max(x.end, x.truck + x.ret, x.pre + x.ship); })) || 1;
          var next = st[0] === 'warn' || st[0] === 'bad' ? 'Emergency pickup from ' + p.f + ' booked for tomorrow' : st[0] === 'neu' ? 'No top-up on the next truck; packs over 30 days get marked down' : 'Top-up on the ' + label(nt) + ' truck';
          r += '<tr class="fz-open"><td colspan="8"><div class="fz-mini">' + days.map(function (x) { return '<div><div class="bars"><i class="e" style="height:' + (x.end / mx * 100) + '%" title="In stock ' + fmt(x.end) + '"></i><i class="i" style="height:' + ((x.truck + x.ret) / mx * 100) + '%" title="In ' + fmt(x.truck + x.ret) + '"></i><i class="o" style="height:' + ((x.pre + x.ship) / mx * 100) + '%" title="Out ' + fmt(x.pre + x.ship) + '"></i></div><span>' + short(x.d) + '</span></div>'; }).join('') + '</div>' +
            '<div class="fz-info"><div class="mc-legend"><span><i style="width:10px;height:10px;background:var(--s1);border-radius:2px"></i>In stock at close</span><span><i style="width:10px;height:10px;background:var(--s3);border-radius:2px"></i>Came in</span><span><i style="width:10px;height:10px;background:var(--s2);border-radius:2px"></i>Went out</span></div>' +
            '<div class="fz-kv"><span>Sold a day, last 7 days <b>' + fmt(days.reduce(function (a, x) { return a + x.ship; }, 0) / 7) + '</b></span><span>Planned <b>' + p.r + '</b> a day</span><span>Next <b>' + next + '</b></span></div></div></td></tr>';
        }
        return r;
      }).join('') + (function () { var o = agg(c.prods, TODAY); return '<tr class="tot"><td>All ' + c.prods.length + ' products</td><td class="num">' + fmt(o.sAvail) + '</td><td class="num">' + fmt(o.sResv) + '</td><td class="num" style="color:#11704d">+' + fmt(o.inn) + '</td><td class="num" style="color:#b0461a">−' + fmt(o.out) + '</td><td class="num">' + fmt(o.end) + '</td><td></td><td></td></tr>'; })() + '</tbody></table></div>';
    return h;
  }

  function vHist() {
    var prods = S.hcat === 'all' ? P : CATS.filter(function (c) { return c.id === S.hcat; })[0].prods;
    var rows = []; for (var d = 0; d < TODAY; d++) { var o = agg(prods, d); o.d = d; rows.push(o); }
    var W = 680, H = 230, pl = 54, pr = 12, pt = 14, pb = 28, n = rows.length;
    var mx = Math.max.apply(null, rows.map(function (r) { return Math.max(r.end, r.inn, r.out); })) * 1.12;
    var X = function (i) { return pl + (i + .5) * (W - pl - pr) / n; }, bw = (W - pl - pr) / n / 3 - 2, Y = function (v) { return pt + (1 - v / mx) * (H - pt - pb); }, g = '';
    var stp = Math.pow(10, Math.floor(Math.log10(mx / 3))); stp = Math.ceil(mx / 4 / stp) * stp;
    for (var v = 0; v <= mx; v += stp) g += '<line class="gl" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (pl - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v) + '</text>';
    rows.forEach(function (r, i) { var x = X(i);
      g += '<rect x="' + (x - bw - 1) + '" y="' + Y(r.inn) + '" width="' + bw + '" height="' + (Y(0) - Y(r.inn)) + '" rx="2" fill="var(--s3)"/><rect x="' + (x + 1) + '" y="' + Y(r.out) + '" width="' + bw + '" height="' + (Y(0) - Y(r.out)) + '" rx="2" fill="var(--s2)"/>';
      g += '<text x="' + x + '" y="' + (H - 8) + '" text-anchor="middle"' + (S.hd === r.d ? ' style="fill:var(--plum);font-weight:800"' : '') + '>' + short(r.d) + '</text>'; });
    g += '<polyline fill="none" stroke="var(--s1)" stroke-width="2" points="' + rows.map(function (r, i) { return X(i) + ',' + Y(r.end); }).join(' ') + '"/>';
    rows.forEach(function (r, i) { g += '<circle cx="' + X(i) + '" cy="' + Y(r.end) + '" r="' + (S.hd === r.d ? 6 : 4) + '" fill="var(--s1)" stroke="#fff" stroke-width="2"/>'; });
    rows.forEach(function (r, i) { var w = (W - pl - pr) / n; g += '<rect class="hit" x="' + (X(i) - w / 2) + '" y="' + pt + '" width="' + w + '" height="' + (H - pt - pb) + '" data-d="' + r.d + '"/>'; });
    var h = '<div class="fy-date"><div><span class="lbl">History</span><h3>' + label(0) + ' – ' + label(TODAY - 1) + '</h3></div><select class="mc-sel" id="fz-hc" aria-label="Category"><option value="all">All categories</option>' + CATS.map(function (c) { return '<option value="' + c.id + '"' + (S.hcat === c.id ? ' selected' : '') + '>' + c.n + '</option>'; }).join('') + '</select></div>';
    h += '<div class="mc-card"><div class="mc-legend" style="margin-bottom:4px"><span><i style="width:16px;height:2px;background:var(--s1)"></i>In stock at end of day</span><span><i style="width:10px;height:10px;background:var(--s3);border-radius:2px"></i>Came in</span><span><i style="width:10px;height:10px;background:var(--s2);border-radius:2px"></i>Went out</span><span style="margin-left:auto">Click a day for its three numbers</span></div><div class="mc-cw" id="fy-c"><svg class="mc-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Daily stock, in and out">' + g + '</svg><div class="mc-tip"></div></div></div>';
    if (S.hd !== null) h += '<div class="fy-detail"><div class="fy-date" style="margin:0"><div><span class="lbl">Selected day</span><h3>' + label(S.hd) + '</h3></div><button type="button" class="fy-x" data-close="1">Close ✕</button></div>' + three(prods, S.hd, S.hcat !== 'all') + '</div>';
    h += '<div class="mc-tw"><table class="mc-t"><thead><tr><th>Day</th><th class="num">In stock at start</th><th class="num">Came in</th><th class="num">Went out</th><th class="num">In stock at end</th><th>Trucks that arrived</th></tr></thead><tbody>' + rows.slice().reverse().map(function (r) {
      var tk = Object.keys(r.trucks); return '<tr class="click' + (S.hd === r.d ? ' sel' : '') + '" data-d="' + r.d + '"><td><b>' + label(r.d) + '</b></td><td class="num">' + fmt(r.start) + '</td><td class="num" style="color:#11704d">+' + fmt(r.inn) + '</td><td class="num" style="color:#b0461a">−' + fmt(r.out) + '</td><td class="num"><b>' + fmt(r.end) + '</b></td><td style="font-size:12px;color:var(--ink-2)">' + (tk.length ? '🚚 ' + tk.join(', ') : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }

  function render() {
    document.querySelectorAll('#fy-tabs button').forEach(function (b) { var on = b.dataset.t === S.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    document.getElementById('fy-main').innerHTML = S.tab === 'today' ? vToday() : vHist();
    var w = document.getElementById('fy-c'); if (!w) return;
    var svg = w.querySelector('svg'), tip = w.querySelector('.mc-tip'), prods = S.hcat === 'all' ? P : CATS.filter(function (c) { return c.id === S.hcat; })[0].prods;
    svg.addEventListener('mousemove', function (e) { var r = e.target.closest('.hit'); if (!r) { tip.style.display = 'none'; return; } var o = agg(prods, +r.dataset.d);
      tip.innerHTML = '<b>' + label(+r.dataset.d) + '</b>Start ' + fmt(o.start) + '<br>In +' + fmt(o.inn) + ' · Out −' + fmt(o.out) + '<br>End ' + fmt(o.end); tip.style.display = 'block';
      var bx = w.getBoundingClientRect(), lx = e.clientX - bx.left + 12; if (lx + 170 > bx.width) lx -= 190; tip.style.left = lx + 'px'; tip.style.top = (e.clientY - bx.top - 10) + 'px'; });
    svg.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
  }
  var root = document.getElementById('fn');
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-t],[data-cat],[data-p],[data-d],[data-close]'); if (!t) return;
    if (t.dataset.t) { S.tab = t.dataset.t; render(); return; }
    if (t.dataset.cat !== undefined) { S.cat = t.dataset.cat || null; S.open = null; render(); root.querySelector('.fz-crumb').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (t.dataset.p !== undefined) { var k = +t.dataset.p; S.open = S.open === k ? null : k; render(); return; }
    if (t.dataset.close) { S.hd = null; render(); return; }
    if (t.dataset.d !== undefined) { S.hd = +t.dataset.d; render(); }
  });
  root.addEventListener('change', function (e) { if (e.target.id === 'fz-hc') { S.hcat = e.target.value; S.hd = null; render(); } });
  render();
}
