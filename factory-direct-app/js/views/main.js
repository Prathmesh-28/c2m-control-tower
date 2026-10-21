// Main app: home, demand, bid, bids, batches and profile screens.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* ---------- app shell ---------- */
function vApp() {
  if (S.sub?.type === 'opp') return vOppDetail(S.sub.id);
  if (S.sub?.type === 'bid') return vBidForm(S.sub.id);
  if (S.sub?.type === 'bidView') return vBidView(S.sub.id);
  if (S.sub?.type === 'batch') return vBatch(S.sub.id);
  const tabs = [['home', 'Home', 'home'], ['demand', 'Demand', 'demand'], ['bids', 'Bids', 'bid'], ['batches', 'Batches', 'box'], ['profile', 'Profile', 'user']];
  const counts = { bids: S.bids.filter(b => b.status === 'counter').length, batches: S.batches.filter(b => b.stage < 6 && needsAction(b)).length };
  const body = { home: vHome, demand: vDemand, bids: vBids, batches: vBatches, profile: vProfile }[S.tab]();
  return `${body}<nav class="tabs" aria-label="Main">${tabs.map(([id, l, ic]) => `<button class="tab${S.tab === id ? ' on' : ''}" data-act="tab" data-arg="${id}" ${S.tab === id ? 'aria-current="page"' : ''}>${ico(ic)}<span>${l}</span>${counts[id] ? `<span class="badge">${counts[id]}</span>` : ''}</button>`).join('')}</nav>`;
}
const needsAction = (b) => [1, 2, 3, 5].includes(b.stage);
function appTop(title, eyebrow, back) {
  return `<div class="topbar">${back ? `<button class="icon-btn" data-act="back" aria-label="Back">${ico('back')}</button>` : ''}
    <div class="t">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h3>${title}</h3></div>
    ${back ? '' : `<button class="icon-btn" data-act="sheet" data-arg="feed" aria-label="Notifications">${ico('bell')}${S.seen ? '' : '<span class="dot"></span>'}</button>`}</div>`;
}

/* ---------- home ---------- */
function vHome() {
  const p = S.profile, opps = myOpps(), node = NODE_OF[p.city] || ['Factory Node', 'Live', 0];
  const active = S.batches.filter(b => b.stage < 6);
  const received = S.wallet.reduce((s, w) => s + w.amount, 0);
  const due = active.reduce((s, b) => { const c = batchCash({ confirmed: b.confirmed || Math.round(b.qty * 0.6), price: b.price, typeId: b.typeId }); return s + (b.stage >= 4 ? c.payout - b.advancePaid : c.payout); }, 0);
  const done = S.batches.filter(b => b.stage === 6).length;
  const score = done ? Math.min(96, 78 + done * 6) : (active.length ? 72 : null);
  const top = opps[0];
  const counter = S.bids.find(b => b.status === 'counter');
  return `<div class="scroll">
    <div class="band">
      <div class="row"><div class="avatar">${p.photo ? `<img src="${p.photo}" alt="">` : initials(p.firm)}</div>
        <div class="grow"><p class="muted small">${({ 'தமிழ்': 'Vanakkam', 'ગુજરાતી': 'Kem cho', 'ਪੰਜਾਬੀ': 'Sat Sri Akal', 'বাংলা': 'Nomoskar' })[p.lang] || 'Namaste'}${p.owner ? ', ' + esc(p.owner.split(' ').at(-1)) : ''}</p><h2 style="color:var(--on-plum)">${esc(p.firm)}</h2></div>
        <button class="icon-btn" data-act="sheet" data-arg="feed" aria-label="Notifications">${ico('bell')}${S.seen ? '' : '<span class="dot"></span>'}</button></div>
      <div class="row small"><span class="pill gold">${ico('shield', 'style="width:13px;height:13px"')} Verified manufacturer</span><span class="muted">${esc(p.city)} · ${node[0]}</span></div>
      <div class="band-stats">
        <div><div class="v">${opps.length}</div><div class="k">Demand this week</div></div>
        <div><div class="v">${active.length}</div><div class="k">Active batches</div></div>
        <div><div class="v">${received ? inr(received) : '₹0'}</div><div class="k">Paid to you</div></div>
      </div>
    </div>
    <div class="pad">
      ${counter ? `<div class="card tap" data-act="openBidView" data-arg="${counter.id}" tabindex="0" role="button" style="border-color:var(--marigold)"><div class="row"><span class="pill warn">Needs your answer</span><span class="grow"></span>${ico('chev', 'style="width:18px;height:18px"')}</div>
        <p><b>Counter-offer on ${esc(TYPE[counter.typeId].name)}</b></p><p class="small muted">You bid ${inr(counter.min)}–${inr(counter.max)}. Meesho offers <b class="num" style="color:var(--ink)">${inr(counter.counter)}</b>.</p></div>` : ''}
      ${top ? `<div class="card tap" data-act="openOpp" data-arg="${top.id}" tabindex="0" role="button">
        <div class="row"><p class="eyebrow grow">Week ${WEEK} Demand Brief · top for you</p><span class="pill neutral">${top.confidence}% sure</span></div>
        <div class="opp-top"><div class="grow"><b>${esc(TYPE[top.typeId].name)}</b><p class="small muted">Meesho needs it by ${fmtDate(top.deliverBy)} · target ${inr(top.band[0])}–${inr(top.band[1])}</p></div>
          <div style="text-align:right"><div class="big-q num">${nfmt(top.need)}</div><span class="tiny muted">${CAT[TYPE[top.typeId].cat].unit}s</span></div></div>
        <div class="row"><span class="small muted grow">${top.rows.slice(0, 3).map(r => r.district).join(' · ')} lead demand</span><span class="btn sm primary">View & bid</span></div></div>` : ''}
      ${active.map(b => `<div class="card tap" data-act="openBatch" data-arg="${b.id}" tabindex="0" role="button">
        <div class="row"><p class="eyebrow grow">Batch ${b.id}</p>${needsAction(b) ? '<span class="pill warn">Your move</span>' : '<span class="pill neutral">With node</span>'}</div>
        <b>${esc(TYPE[b.typeId].name)} · <span class="num">${inr(b.price)}</span></b>
        ${stagesBar(b)}<p class="small muted">${nextStep(b)}</p></div>`).join('')}
      <div class="card"><div class="row"><div class="grow stack" style="gap:4px"><h3>Factory score</h3><p class="small muted">${score == null ? 'Starts after your first batch. It tracks price gap, order pace, returns, on-time handover and stock.' : 'Above 80 for 30 days unlocks bigger prepaid batches.'}</p></div>${ring(score, 'Factory score')}</div>
        ${score != null ? `<dl class="kv small"><dt>Price gap held</dt><dd>${active.length || done ? 'Yes' : '—'}</dd><dt>Handover on time</dt><dd>${done ? '100%' : 'Pending'}</dd><dt>Payout due (est.)</dt><dd class="money">${inr(due)}</dd></dl>` : ''}</div>
      <div class="card"><div class="row"><h3 class="grow">Recent</h3><button class="btn text sm" data-act="sheet" data-arg="feed">See all</button></div>
        ${S.feed.slice(0, 3).map(feedItem).join('') || '<p class="small muted">Nothing yet.</p>'}</div>
    </div></div>`;
}
function feedItem(f) { return `<div class="feed-item"><div class="feed-ic">${ico(f.icon)}</div><div class="stack" style="gap:2px"><span class="small">${esc(f.text)}</span><span class="when">${ago(f.at)}</span></div></div>`; }
function stagesBar(b) { return `<div class="stages" aria-label="Stage ${Math.min(b.stage, 6)} of 6">${STAGES.map((s, i) => `<div class="${i < b.stage ? 'done' : i === b.stage ? 'cur' : ''}"><i></i>${s}</div>`).join('')}</div>`; }
function nextStep(b) {
  return [
    '', `Pre-order window open: ${nfmt(b.confirmed)} of ${nfmt(b.qty)} buyers have prepaid. Closes in ${3 - b.day} day${3 - b.day === 1 ? '' : 's'}.`,
    `Make ${nfmt(b.make)} units (${nfmt(b.confirmed)} prepaid + 15%). ${b.tasks.filter(Boolean).length} of ${TASKS.length} steps done.`,
    `Book a truck slot at the node. ${inr(b.confirmed * b.price * FD.advance)} is paid at handover.`,
    `Node is packing and shipping each order. Mark deliveries when the node reports them.`,
    `All orders delivered. Confirm to settle the balance.`, 'Paid in full.',
  ][b.stage];
}

/* ---------- demand ---------- */
function vDemand() {
  const opps = myOpps(), f = S.demandFilter;
  const list = f === 'mine' ? opps.filter(o => !o.isNew) : f === 'new' ? opps.filter(o => o.isNew) : opps.filter(o => bidFor(o.id));
  return `${appTop(`Week ${WEEK} Demand Brief`, `Meesho forecast · refreshed every Monday`)}
  <div class="scroll"><div class="pad">
    <p class="small muted">Meesho's model reads the last 8 weeks of searches, orders and returns by pin code and forecasts the next 14 days. Each card is the quantity Meesho wants from you, and the price band buyers will accept.</p>
    <div class="seg-tabs" role="tablist">${[['mine', 'My products'], ['new', 'New for you'], ['bid', 'Bid placed']].map(([k, l]) => `<button role="tab" aria-selected="${f === k}" class="${f === k ? 'on' : ''}" data-act="dfilter" data-arg="${k}">${l}</button>`).join('')}</div>
    ${list.map(oppCard).join('') || `<div class="empty">${ico('demand')}<b style="color:var(--ink)">Nothing here yet</b><span class="small">${f === 'bid' ? 'Bids you place show up here.' : 'Add products in your profile to get their demand.'}</span></div>`}
  </div></div>`;
}
function oppCard(o) {
  const t = TYPE[o.typeId], bid = bidFor(o.id);
  return `<div class="card tap opp" data-act="openOpp" data-arg="${o.id}" tabindex="0" role="button">
    <div class="row"><div class="thumb" style="width:40px;height:40px;border-radius:10px;background:var(--plum-soft);display:grid;place-items:center;flex:none">${segIco(t.cat).replace('<svg', '<svg style="width:22px;height:22px"')}</div>
      <div class="grow"><b>${esc(t.name)}</b><p class="tiny muted">${CAT[t.cat].name}${o.isNew ? ' · not in your catalogue' : ''}</p></div>
      ${bid ? statusPill(bid) : o.isNew ? '<span class="pill neutral">New</span>' : `<span class="pill warn">Closes in ${o.closes}d</span>`}</div>
    <div class="row top"><div class="grow stack" style="gap:2px"><span class="eyebrow">Meesho needs</span><span class="big-q num">${nfmt(o.need)}</span><span class="tiny muted">${CAT[t.cat].unit}s by ${fmtDate(o.deliverBy)}</span></div>
      <div class="grow stack" style="gap:2px"><span class="eyebrow">Target price</span><span class="num" style="font-size:18px">${inr(o.band[0])}–${inr(o.band[1])}</span><span class="tiny muted">buyers pay ${inr(o.median)} today</span></div></div>
    <div class="meta-row"><span><b>${nfmt(o.weekly)}</b> orders/week in top 8 districts</span><span>Forecast confidence <b>${o.confidence}%</b></span></div></div>`;
}
function statusPill(b) {
  return { review: '<span class="pill neutral">In review</span>', approved: '<span class="pill good">Approved</span>', counter: '<span class="pill warn">Counter-offer</span>', declined: '<span class="pill bad">Declined</span>', withdrawn: '<span class="pill neutral">Withdrawn</span>' }[b.status];
}
function priceRuler(o, cost, bidMin, bidMax) {
  const floor = cost ? batchFloor(o.typeId, cost) : null;
  const lo = Math.min(o.band[0], floor ?? Infinity, bidMin || Infinity) * 0.94, hi = Math.max(o.median, bidMax || 0) * 1.03;
  const x = (v) => ((v - lo) / (hi - lo)) * 100;
  const ticksHtml = rulerTicks([[x(o.band[1]), 'Ceiling', o.band[1]], [x(o.median), 'Buyers pay', o.median], ...(floor ? [[x(floor), 'Your break-even', floor]] : [])]);
  return `<div class="ruler${ticksHtml.includes('below2') ? ' tall' : ''}" aria-hidden="true"><div class="base"></div>
    <div class="band-z" style="left:${x(o.band[0])}%;width:${x(o.band[1]) - x(o.band[0])}%"></div>
    ${bidMin && bidMax ? `<div class="bid-z" style="left:${x(bidMin)}%;width:${Math.max(1.5, x(bidMax) - x(bidMin))}%"></div>` : ''}
    ${ticksHtml}
  </div><div class="legend"><span><i style="background:var(--good)"></i>Meesho's band</span>${bidMin ? '<span><i style="border:2px solid var(--marigold);background:transparent"></i>Your bid</span>' : ''}<span>Ceiling = 8% under what buyers pay</span></div>`;
}
// Place labels above or below the bar so neighbours never overlap.
function rulerTicks(ticks) {
  const rows = { up: [], down: [], down2: [] }, gap = 30;
  return ticks.map(([xv, label, v], i) => {
    const pref = i === 0 ? ['up', 'down'] : ['down', 'up'];
    const row = pref.find(r => rows[r].every(o => Math.abs(o - xv) > gap)) || 'down2';
    rows[row].push(xv);
    return `<div class="tick${row === 'down' ? ' below' : row === 'down2' ? ' below below2' : ''}" style="left:${xv}%">${row !== 'up' ? `<span class="v">${inr(v)}</span><span>${label}</span>` : `<span>${label}</span><span class="v">${inr(v)}</span>`}</div>`;
  }).join('');
}
function vOppDetail(id) {
  const o = oppById(id); if (!o) { S.sub = null; return vApp(); }
  const t = TYPE[o.typeId], c = CAT[t.cat], bid = bidFor(o.id), max = Math.max(...o.rows.map(r => r.weekly)), smax = Math.max(...o.split.map(s => s.u));
  const cost = o.sku?.cost;
  return `${appTop(esc(t.name), `Demand Brief · Week ${WEEK}`, true)}
  <div class="scroll"><div class="pad">
    <div class="card"><div class="row top"><div class="grow stack" style="gap:2px"><span class="eyebrow">Meesho needs from you</span><span class="big-q num" style="font-size:34px">${nfmt(o.need)}</span><span class="small muted">${c.unit}s, handed over by ${fmtDay(o.deliverBy)}</span></div>
      <span class="pill neutral">${o.confidence}% confidence</span></div>
      <p class="small muted">That is ${pct(o.need / o.forecast14, 0)} of the ${nfmt(o.forecast14)} orders forecast in the next 14 days across the top 8 districts. Buyers prepay first, so you only make what is confirmed, plus 15%.</p></div>
    <div class="card"><h3>Price band</h3>${priceRuler(o, cost)}
      ${cost ? `<p class="small">At your making cost of <b class="num">${inr(cost)}</b>, you break even at <b class="num">${inr(batchFloor(o.typeId, cost))}</b> with a 9% margin, after the ${inr(FD.fees.nodeFee)} node fee, delivery, returns and working capital.</p>` : `<p class="small muted">This product is not in your catalogue yet. You'll enter its making cost when you bid.</p>`}</div>
    <div class="card"><div class="row"><h3 class="grow">Where it sells</h3><span class="tiny muted">orders / week</span></div>
      <div class="bars">${o.rows.map(r => `<div class="bar-row"><span class="lbl">${r.district} <span class="tiny muted">${r.pin}</span></span><span class="track"><i style="width:${(r.weekly / max) * 100}%"></i></span><span class="v">${nfmt(r.weekly)}</span></div>`).join('')}</div>
      <p class="tiny muted">District totals only. No buyer can be identified.</p></div>
    <div class="card"><div class="row"><h3 class="grow">Suggested split by ${o.axis.toLowerCase()}</h3><span class="tiny muted">${c.unit}s</span></div>
      <div class="sizes">${o.split.map(s => `<div><span class="u">${nfmt(s.u)}</span><span class="col" style="height:${Math.max(6, (s.u / smax) * 70)}px"></span><b>${s.v}</b></div>`).join('')}</div>
      ${o.secondAxis ? `<p class="small muted">Top ${o.secondAxis[0].toLowerCase()}: ${o.secondAxis[1].slice(0, 2).join(' and ')}</p>` : ''}</div>
    <div class="card flat"><div class="row top">${ico('info', 'style="width:18px;height:18px;flex:none;color:var(--muted)"')}<p class="small muted">How this is forecast: weekly searches, add-to-carts, delivered orders and returns for this product, by pin code, from the last 8 weeks. The band is set from the price buyers paid on delivered orders, not list prices.</p></div></div>
  </div></div>
  <div class="footer-bar">${bid ? `<button class="btn ghost" data-act="openBidView" data-arg="${bid.id}">View my bid · ${{ review: 'in review', approved: 'approved', counter: 'counter-offer' }[bid.status]}</button>` : `<button class="btn primary" data-act="openBid" data-arg="${o.id}">Bid on this demand</button>`}</div>`;
}

/* ---------- bid form ---------- */
let draft = null;
function vBidForm(oppId) {
  const o = oppById(oppId); if (!o) { S.sub = null; return vApp(); }
  if (!draft || draft.oppId !== oppId) draft = { oppId, cost: o.sku?.cost ?? '', min: o.band[0], max: o.band[1], qty: o.need, handover: null };
  const t = TYPE[o.typeId], c = CAT[t.cat], p = S.profile;
  const lead = +p.lead || 5, opts = [0, 1, 2].map(i => addDays(TODAY, 3 + lead + i * 2));
  if (!draft.handover) draft.handover = opts[0].toISOString();
  return `${appTop('Your bid', esc(t.name), true)}
  <div class="scroll"><div class="pad">
    <p class="small muted">Propose the price range you can sell at. Meesho approves the highest price in your range that stays inside its band, or sends a counter-offer.</p>
    ${o.sku ? '' : `<div class="field"><label for="bcost">Your making cost per ${c.unit}</label><div class="input-group"><span class="addon">₹</span><input id="bcost" type="number" inputmode="numeric" data-draft="cost" value="${esc(draft.cost)}" placeholder="e.g. 85"></div><p class="hint">Raw material, labour and power for one ${c.unit}. We use it to show your margin.</p></div>`}
    <div class="grid2">
      <div class="field"><label for="bmin">Lowest price</label><div class="stepper"><button type="button" data-act="dstep" data-arg="min:-1" aria-label="Lower">−</button><input id="bmin" type="number" inputmode="numeric" data-draft="min" value="${draft.min}"><button type="button" data-act="dstep" data-arg="min:1" aria-label="Higher">+</button></div></div>
      <div class="field"><label for="bmax">Highest price</label><div class="stepper"><button type="button" data-act="dstep" data-arg="max:-1" aria-label="Lower">−</button><input id="bmax" type="number" inputmode="numeric" data-draft="max" value="${draft.max}"><button type="button" data-act="dstep" data-arg="max:1" aria-label="Higher">+</button></div></div>
    </div>
    <div class="card" id="bidLive">${bidLive(o)}</div>
    <div class="field"><label for="bqty">Quantity you can make</label><div class="input-group"><input id="bqty" type="number" inputmode="numeric" data-draft="qty" value="${draft.qty}"><span class="addon r">${c.unit}s</span></div>
      <div class="chips">${[0.5, 0.75, 1].map(f => `<button type="button" class="chip${draft.qty === round50(o.need * f) ? ' on' : ''}" data-act="dqty" data-arg="${round50(o.need * f)}">${f === 1 ? 'All' : f * 100 + '%'} · ${nfmt(round50(o.need * f))}</button>`).join('')}</div>
      <p class="hint">Your monthly capacity is ${nfmt(p.monthly)}. Meesho asked for ${nfmt(o.need)}.</p></div>
    <div class="field"><span class="label">Handover at ${(NODE_OF[p.city] || ['the Factory Node'])[0]}</span>
      <div class="slots">${opts.map((d, i) => `<button type="button" class="slot${draft.handover === d.toISOString() ? ' on' : ''}" data-act="dhand" data-arg="${d.toISOString()}"><b>${fmtDay(d)}</b><span>${i === 0 ? 'Earliest' : `+${i * 2} days`}</span></button>`).join('')}</div>
      <p class="hint">3-day pre-order window + your ${lead} days to make.</p></div>
  </div></div>
  <div class="footer-bar"><button class="btn primary" data-act="submitBid" data-arg="${o.id}" id="bidSubmit">Send bid to Meesho</button></div>`;
}
function bidLive(o) {
  const t = TYPE[o.typeId], unit = CAT[t.cat].unit, cost = +draft.cost, mn = +draft.min, mx = +draft.max, qty = +draft.qty;
  if (!(cost > 0)) return `<p class="small muted">Enter your making cost to see your margin and where your bid sits.</p>${priceRuler(o, null, mn, mx)}`;
  const floor = batchFloor(o.typeId, cost), kept = costPerKept(o.typeId, cost), gate = Math.floor(priceGate(o.typeId));
  const per = (pr) => pr - kept, agreed = mn <= gate ? Math.max(mn, Math.min(mx, gate)) : null;
  let v;
  if (!(mn > 0 && mx > 0) || mn > mx) v = `<div class="verdict bad">${ico('warn')}<span>The lowest price must be at or below the highest price.</span></div>`;
  else if (mn < floor) v = `<div class="verdict bad">${ico('warn')}<span><b>${inr(mn)} is under your break-even of ${inr(floor)}.</b> Raise your lowest price, or Meesho may lock a price that loses you money.</span></div>`;
  else if (mn > gate) v = gate >= floor ? `<div class="verdict warn">${ico('info')}<span><b>Above Meesho's ceiling of ${inr(gate)}.</b> Expect a counter-offer at ${inr(gate)}, which still clears your break-even.</span></div>` : `<div class="verdict bad">${ico('warn')}<span><b>Your break-even is above Meesho's ceiling (${inr(gate)}).</b> This bid will be declined unless the making cost comes down.</span></div>`;
  else v = `<div class="verdict good">${ico('check')}<span><b>Likely approved at ${inr(agreed)}.</b> That is the highest price in your range inside Meesho's band.</span></div>`;
  const price = agreed ?? mx, conf = Math.round((qty || 0) * 0.6), cash = batchCash({ confirmed: conf, price, typeId: o.typeId });
  return `${priceRuler(o, cost, mn, mx)}${v}
    <dl class="kv small"><dt>You keep per ${unit}</dt><dd>${inr1(per(mn))} – ${inr1(per(mx))}</dd>
    <dt>Margin on price</dt><dd>${pct(per(mn) / mn)} – ${pct(per(mx) / mx)}</dd>
    <dt>If ~60% of ${nfmt(qty)} prepay</dt><dd>${nfmt(conf)} orders</dd>
    <dt>Advance at handover (30%)</dt><dd class="money">${inr(cash.advance)}</dd>
    <dt class="total">Total payout (est.)</dt><dd class="total money">${inr(cash.payout)}</dd></dl>`;
}
function bidValid(o) {
  const cost = +draft.cost, mn = +draft.min, mx = +draft.max, qty = +draft.qty;
  if (!(cost > 0)) return 'Enter your making cost.';
  if (!(mn > 0 && mx >= mn)) return 'Check your price range.';
  if (mn < batchFloor(o.typeId, cost)) return 'Your lowest price is under your break-even.';
  if (!(qty >= 50)) return 'Quantity must be at least 50.';
  if (+S.profile.monthly && qty > +S.profile.monthly) return `Quantity is above your monthly capacity of ${nfmt(S.profile.monthly)}.`;
  return '';
}

/* ---------- bids tab ---------- */
function vBids() {
  const order = { counter: 0, review: 1, approved: 2, declined: 3, withdrawn: 4 };
  const list = S.bids.slice().sort((a, b) => order[a.status] - order[b.status] || b.createdAt - a.createdAt);
  return `${appTop('My bids', `${S.bids.length} placed`)}
  <div class="scroll"><div class="pad">
    ${list.map(b => { const t = TYPE[b.typeId]; return `<div class="card tap" data-act="openBidView" data-arg="${b.id}" tabindex="0" role="button">
      <div class="row"><b class="grow">${esc(t.name)}</b>${statusPill(b)}</div>
      <div class="meta-row"><span>Bid <b class="num">${inr(b.min)}–${inr(b.max)}</b></span><span><b class="num">${nfmt(b.qty)}</b> ${CAT[t.cat].unit}s</span><span>Handover <b>${fmtDate(b.handover)}</b></span></div>
      ${b.status === 'approved' ? `<p class="small">Locked at <b class="num">${inr(b.agreed)}</b></p>` : b.status === 'counter' ? `<p class="small">Meesho offers <b class="num">${inr(b.counter)}</b>. Tap to answer.</p>` : b.status === 'review' ? `<p class="small muted">Meesho is checking it now.</p>` : ''}</div>`; }).join('') ||
      `<div class="empty">${ico('bid')}<b style="color:var(--ink)">No bids yet</b><span class="small">Open a product in Demand and bid your price range.</span><button class="btn primary sm" data-act="tab" data-arg="demand">See demand</button></div>`}
  </div></div>`;
}
function vBidView(id) {
  const b = S.bids.find(x => x.id === id); if (!b) { S.sub = null; return vApp(); }
  const t = TYPE[b.typeId], o = oppById(b.oppId), batch = S.batches.find(x => x.bidId === b.id);
  return `${appTop(esc(t.name), 'Bid', true)}
  <div class="scroll"><div class="pad">
    <div class="row"><h2 class="grow">${inr(b.min)}–${inr(b.max)}</h2>${statusPill(b)}</div>
    <dl class="kv small"><dt>Quantity</dt><dd>${nfmt(b.qty)} ${CAT[t.cat].unit}s</dd><dt>Making cost</dt><dd>${inr(b.cost)}</dd><dt>Handover</dt><dd>${fmtDay(b.handover)}</dd><dt>Sent</dt><dd>${ago(b.createdAt)}</dd></dl>
    <div class="card"><h3>Meesho's checks</h3><div class="checks">${b.checks.map(c => `<div class="check-item">${ciIcon(c.state)}<div class="stack" style="gap:1px"><b>${c.title}</b><span class="small muted">${checkDetail(b, c)}</span></div></div>`).join('')}</div></div>
    ${b.note ? `<div class="verdict ${b.status === 'approved' ? 'good' : b.status === 'counter' ? 'warn' : 'bad'}">${ico(b.status === 'approved' ? 'check' : 'info')}<span>${esc(b.note)}</span></div>` : ''}
    ${o ? `<div class="card"><h3>Where your bid sits</h3>${priceRuler(o, b.cost, b.min, b.max)}</div>` : ''}
    ${b.status === 'counter' ? `<div class="card"><h3>Accept ${inr(b.counter)}?</h3><p class="small muted">At ${inr(b.counter)} you keep ${inr1(b.counter - costPerKept(b.typeId, b.cost))} a ${CAT[t.cat].unit} (${pct((b.counter - costPerKept(b.typeId, b.cost)) / b.counter)} margin). Accepting opens pre-orders today.</p></div>` : ''}
  </div></div>
  ${b.status === 'counter' ? `<div class="footer-bar"><button class="btn ghost" data-act="declineCounter" data-arg="${b.id}">Decline</button><button class="btn gold" data-act="acceptCounter" data-arg="${b.id}">Accept ${inr(b.counter)}</button></div>`
    : b.status === 'approved' && batch ? `<div class="footer-bar"><button class="btn primary" data-act="openBatch" data-arg="${batch.id}">Open batch ${batch.id}</button></div>`
    : b.status === 'review' ? `<div class="footer-bar"><button class="btn ghost" data-act="withdraw" data-arg="${b.id}">Withdraw bid</button></div>`
    : b.status === 'declined' || b.status === 'withdrawn' ? `<div class="footer-bar"><button class="btn primary" data-act="openBid" data-arg="${b.oppId}">Bid again</button></div>` : ''}`;
}
function checkDetail(b, c) {
  if (c.state === 'wait') return 'Waiting'; if (c.state === 'run') return 'Checking…';
  const gate = Math.floor(priceGate(b.typeId));
  return {
    price: c.state === 'done' ? `Your range reaches ${inr(gate)} or less: at least 8% under the ${inr(marketMedian(b.typeId))} buyers pay.` : c.state === 'warn' ? `Your lowest price is above the ${inr(gate)} ceiling.` : `Your break-even is above the ${inr(gate)} ceiling.`,
    cap: `${nfmt(b.qty)} is within your ${nfmt(S.profile.monthly)} a month.`,
    quality: S.batches.some(x => x.stage === 6) ? 'Returns within the category norm on past batches.' : 'New factory: first batch gets a QC sample check at the node.',
    node: `Slot free at ${(NODE_OF[S.profile.city] || ['the node'])[0]} on ${fmtDate(b.handover)}.`,
  }[c.id];
}

/* ---------- batches ---------- */
function vBatches() {
  const list = S.batches;
  const received = S.wallet.reduce((s, w) => s + w.amount, 0);
  return `${appTop('Batches & payouts', `${list.filter(b => b.stage < 6).length} active`)}
  <div class="scroll"><div class="pad">
    <div class="card"><div class="row"><div class="grow"><span class="eyebrow">Paid to ${esc(S.profile.upi || 'your UPI')}</span><div class="big-q num money">${inr(received)}</div></div>${ico('wallet', 'style="width:28px;height:28px;color:var(--muted)"')}</div>
      ${S.wallet.slice(0, 4).map(w => `<div class="row between small"><span class="grow">${esc(w.label)}<br><span class="tiny muted">${ago(w.at)}</span></span><span class="num money">+${inr(w.amount)}</span></div>`).join('') || '<p class="small muted">Your 30% advance arrives at the first handover.</p>'}</div>
    ${list.map(b => `<div class="card tap" data-act="openBatch" data-arg="${b.id}" tabindex="0" role="button">
      <div class="row"><p class="eyebrow grow">${b.id}</p>${b.stage === 6 ? '<span class="pill good">Paid</span>' : needsAction(b) ? '<span class="pill warn">Your move</span>' : '<span class="pill neutral">With node</span>'}</div>
      <b>${esc(TYPE[b.typeId].name)} · <span class="num">${inr(b.price)}</span></b>${stagesBar(b)}<p class="small muted">${nextStep(b)}</p></div>`).join('') ||
      `<div class="empty">${ico('box')}<b style="color:var(--ink)">No batches yet</b><span class="small">A batch starts when Meesho approves a bid.</span></div>`}
  </div></div>`;
}
function vBatch(id) {
  const b = S.batches.find(x => x.id === id); if (!b) { S.sub = null; return vApp(); }
  const t = TYPE[b.typeId], unit = CAT[t.cat].unit, node = (NODE_OF[S.profile.city] || ['Factory Node'])[0];
  const cash = b.confirmed ? batchCash({ confirmed: b.confirmed, price: b.price, typeId: b.typeId }) : null;
  let panel = '', foot = '';
  if (b.stage === 1) {
    panel = `<div class="card"><div class="row"><h3 class="grow">Buyers are prepaying</h3><span class="pill warn">Day ${b.day} of 3</span></div>
      <p class="small muted">Your product is live as "ships in 7–8 days, ${inr(FD.preorderDiscount)} off". Nothing is made until the window closes.</p>
      <div class="meter"><i style="width:${(b.confirmed / b.qty) * 100}%"></i></div>
      <div class="row between small"><span><b class="num">${nfmt(b.confirmed)}</b> prepaid</span><span class="muted">asked for ${nfmt(b.qty)}</span></div></div>
      <div class="bubble"><b>WhatsApp · Meesho C2M</b>\n${nfmt(b.confirmed)} buyers have prepaid for ${t.name}. Window closes in ${3 - b.day} day${3 - b.day === 1 ? '' : 's'}.</div>`;
    foot = `<button class="btn primary" data-act="bDay" data-arg="${b.id}">${ico('play')} Simulate next day</button>`;
  } else if (b.stage === 2) {
    const n = b.tasks.filter(Boolean).length;
    panel = `<div class="card"><div class="row"><h3 class="grow">Make ${nfmt(b.make)} ${unit}s</h3><span class="pill neutral">${n}/${TASKS.length}</span></div>
      <dl class="kv small"><dt>Prepaid orders</dt><dd>${nfmt(b.confirmed)}</dd><dt>Buffer (+15%)</dt><dd>${nfmt(b.make - b.confirmed)}</dd><dt class="total">To make</dt><dd class="total">${nfmt(b.make)}</dd></dl>
      <div class="stack">${TASKS.map((tk, i) => `<button type="button" class="task${b.tasks[i] ? ' on' : ''}" data-act="bTask" data-arg="${b.id}:${i}" aria-pressed="${b.tasks[i]}"><span class="box">${b.tasks[i] ? ico('check') : ''}</span><span class="t">${tk}</span></button>`).join('')}</div></div>
      ${sizeSplitCard(b)}`;
    foot = `<button class="btn primary" data-act="bReady" data-arg="${b.id}" ${n === TASKS.length ? '' : 'disabled'}>Ready for handover</button>`;
  } else if (b.stage === 3) {
    const slots = [0, 1, 2].map(i => addDays(TODAY, i + 1));
    panel = `<div class="card"><h3>Book your truck at ${node}</h3><p class="small muted">One drop for the whole batch. The node counts, QC-samples and stores it. You keep ownership of the stock until each order is delivered.</p>
      <div class="slots">${slots.map((d, i) => { const k = d.toISOString(); return `<button type="button" class="slot${b.slot === k ? ' on' : ''}" data-act="bSlot" data-arg="${b.id}|${k}"><b>${fmtDay(d)}</b><span>${['9–11 am', '2–4 pm', '10 am–12'][i]}</span></button>`; }).join('')}</div>
      <dl class="kv small"><dt>Units to hand over</dt><dd>${nfmt(b.make)}</dd><dt>Advance at handover</dt><dd class="money">${inr(cash.advance)}</dd></dl>
      <p class="tiny muted">The advance is 30% of prepaid order value (${nfmt(b.confirmed)} × ${inr(b.price)}), paid by Meesho's NBFC partner and repaid from your payout.</p></div>`;
    foot = `<button class="btn gold" data-act="bHand" data-arg="${b.id}" ${b.slot ? '' : 'disabled'}>${ico('truck')} Confirm handover</button>`;
  } else if (b.stage === 4) {
    panel = `<div class="card"><h3>The node is shipping</h3><p class="small muted">${node} picks, packs and labels each order. Valmo delivers it. Returns come back to the node, not to you.</p>
      <dl class="kv small"><dt>Advance received</dt><dd class="money">${inr(b.advancePaid)}</dd><dt>Orders to deliver</dt><dd>${nfmt(b.confirmed)}</dd><dt>Spare units at node</dt><dd>${nfmt(b.make - b.confirmed)}</dd></dl></div>`;
    foot = `<button class="btn primary" data-act="bShip" data-arg="${b.id}">${ico('play')} Simulate deliveries</button>`;
  } else if (b.stage >= 5) {
    const c = b.shipped;
    panel = `<div class="card"><h3>${b.stage === 6 ? 'Settled' : 'Delivered: settle the balance'}</h3>
      <dl class="kv small"><dt>Delivered</dt><dd>${nfmt(c.delivered)}</dd><dt>Failed delivery</dt><dd>${nfmt(c.failed)}</dd><dt>Returned to node</dt><dd>${nfmt(c.returns)}</dd><dt>Kept by buyers</dt><dd>${nfmt(c.kept)}</dd></dl>
      <div class="divider"></div>
      <dl class="kv small"><dt>Revenue on kept orders</dt><dd>${inr(c.revenue)}</dd><dt>Delivery (${inr(FD.fees.nodeFwd)} each)</dt><dd>−${inr(c.fees.forward)}</dd><dt>Node fee (${inr(FD.fees.nodeFee)} each)</dt><dd>−${inr(c.fees.node)}</dd><dt>Returns (${inr(FD.returnFee)} each)</dt><dd>−${inr(c.fees.returns)}</dd>
      <dt class="total">Payout</dt><dd class="total">${inr(c.payout)}</dd><dt>Less advance already paid</dt><dd>−${inr(c.advance)}</dd><dt class="total">Balance ${b.stage === 6 ? 'paid' : 'to pay'}</dt><dd class="total money">${inr(c.balance)}</dd></dl>
      <p class="small">After making cost (${nfmt(b.make)} × ${inr(b.cost)}), this batch earns you <b class="num money">${inr(c.payout - b.make * b.cost)}</b>. ${nfmt(b.make - b.confirmed)} spare units stay at the node for the next batch.</p></div>`;
    foot = b.stage === 5 ? `<button class="btn gold" data-act="bSettle" data-arg="${b.id}">Settle ${inr(c.balance)}</button>` : `<button class="btn ghost" data-act="tab" data-arg="demand">Find the next batch</button>`;
  }
  return `${appTop(esc(t.name), `Batch ${b.id} · ${inr(b.price)} a ${unit}`, true)}
  <div class="scroll"><div class="pad">${stagesBar(b)}${panel}
    ${b.stage < 6 && [1, 4].includes(b.stage) ? `<div class="demo-note">${ico('info')}<span>Prototype: the simulate button stands in for buyers and the node. In the live app this updates on its own.</span></div>` : ''}
  </div></div>${foot ? `<div class="footer-bar">${foot}</div>` : ''}`;
}
function sizeSplitCard(b) {
  const o = demandFor(b.typeId, 0), tot = o.split.reduce((s, x) => s + x.u, 0);
  const rows = o.split.map(s => ({ v: s.v, u: Math.round(b.make * s.u / tot) }));
  const mx = Math.max(...rows.map(r => r.u));
  return `<div class="card"><div class="row"><h3 class="grow">Cut by ${o.axis.toLowerCase()}</h3><span class="tiny muted">from prepaid orders</span></div>
    <div class="sizes">${rows.map(s => `<div><span class="u">${nfmt(s.u)}</span><span class="col" style="height:${Math.max(6, (s.u / mx) * 70)}px"></span><b>${s.v}</b></div>`).join('')}</div></div>`;
}

/* ---------- profile ---------- */
function vProfile() {
  const p = S.profile, node = NODE_OF[p.city] || ['—', '', 0];
  return `${appTop('Profile', 'Verified manufacturer')}
  <div class="scroll"><div class="pad">
    <div class="row"><label for="f-photo2" style="cursor:pointer"><div class="avatar lg">${p.photo ? `<img src="${p.photo}" alt="">` : initials(p.firm)}</div></label>
      <input class="sr" type="file" accept="image/*" id="f-photo2" data-photo="profile.photo">
      <div class="stack" style="gap:2px"><h2>${esc(p.firm)}</h2><span class="muted">${esc(p.owner)}</span><label for="f-photo2" class="btn text sm" style="align-self:flex-start;padding-left:0">Change photo</label></div></div>
    <div class="card"><div class="row"><h3 class="grow">Products · ${p.skus.length}</h3><button class="btn ghost sm" data-act="addSku">${ico('plus')} Add</button></div>
      ${p.skus.map(s => skuRow(s)).join('')}</div>
    <div class="card"><h3>Factory</h3><dl class="kv small">
      <dt>Location</dt><dd style="font-family:var(--f-body)">${esc(p.city)}, ${esc(p.state)} ${esc(p.pin)}</dd>
      <dt>Factory Node</dt><dd style="font-family:var(--f-body)">${node[0]}</dd>
      <dt>Segments</dt><dd style="font-family:var(--f-body)">${p.segments.map(s => CAT[s].name).join(', ')}</dd>
      <dt>Cost levers</dt><dd>${p.levers.length} of 4</dd>
      <dt>Capacity</dt><dd>${nfmt(p.monthly)} / month</dd>
      <dt>Batch lead time</dt><dd>${p.lead} days</dd></dl></div>
    <div class="card"><h3>Contact & payouts</h3><dl class="kv small">
      <dt>Mobile</dt><dd>+91 ${esc(p.phone)}</dd><dt>WhatsApp</dt><dd>+91 ${esc(p.whatsappSame ? p.phone : p.whatsapp)}</dd>
      ${p.altName ? `<dt>${esc(p.altName)}</dt><dd>+91 ${esc(p.altPhone)}</dd>` : ''}
      <dt>GSTIN</dt><dd>${esc(p.gstin)}</dd><dt>Udyam</dt><dd>${esc(p.udyam)}</dd><dt>Payout UPI</dt><dd>${esc(p.upi)}</dd></dl>
      ${selectBtn({ id: 'lang2', label: 'Language for briefs', value: p.lang, act: 'sheet', arg: 'lang' })}</div>
    <div class="card flat"><h3>Restart the demo</h3><p class="small muted">Clears this prototype's saved profile, bids and batches from this browser.</p>
      ${UI.confirmReset ? `<div class="row"><button class="btn danger sm" data-act="reset">Yes, clear everything</button><button class="btn ghost sm" data-act="cancelReset">Keep it</button></div>` : `<button class="btn ghost sm" data-act="askReset" style="align-self:flex-start">Sign out and restart</button>`}</div>
  </div></div>`;
}
