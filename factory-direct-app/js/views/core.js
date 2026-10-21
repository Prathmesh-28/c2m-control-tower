// Render loop, welcome, registration and verification screens.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* =====================================================================
   RENDER
   ===================================================================== */
const app = document.getElementById('app');
function render() {
  const sc = app.querySelector('.scroll'); const key = UI.scrollKey; const top = sc ? sc.scrollTop : 0;
  let html = '';
  if (S.screen === 'welcome') html = vWelcome();
  else if (S.screen === 'reg') html = vReg();
  else if (S.screen === 'verify') html = vVerify();
  else html = vApp();
  if (UI.sheet) html += `<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true">${vSheet()}</div>`;
  if (UI.toast) html += `<div class="toast" role="status">${ico('check')}<span>${esc(UI.toast)}</span></div>`;
  app.innerHTML = html;
  const nk = viewKey(); const nsc = app.querySelector('.scroll');
  if (nsc && key === nk) nsc.scrollTop = top;
  UI.scrollKey = nk;
}
const viewKey = () => [S.screen, S.step, S.tab, S.sub?.type, S.sub?.id].join('/');
let toastT;
function toast(msg) { UI.toast = msg; clearTimeout(toastT); toastT = setTimeout(() => { UI.toast = null; render(); }, 2800); }

/* ---------- welcome ---------- */
function vWelcome() {
  return `<div class="welcome">
    <div class="mark"><div class="logo">${ico('factory')}</div><div><b>Factory Direct</b><span>Sell to Meesho buyers at factory price</span></div></div>
    <div class="stack-lg" style="margin-top:8px">
      <h1>Make only what is <em>already sold.</em></h1>
      <p class="lede">Meesho tells you what buyers in 8 districts want this fortnight. You bid your price. Once approved, buyers prepay, you make the batch, and the Factory Node packs, ships and takes returns.</p>
    </div>
    <div class="flow-strip">
      <div><span class="n">1</span><div><b>Register in 6 steps</b><span>Factory, location, segment, products, KYC</span></div></div>
      <div><span class="n">2</span><div><b>See Meesho's demand</b><span>Quantity, sizes, districts and target price, every Monday</span></div></div>
      <div><span class="n">3</span><div><b>Bid a price range</b><span>Meesho checks it and locks a price or sends a counter-offer</span></div></div>
      <div><span class="n">4</span><div><b>Make, hand over, get paid</b><span>30% at handover, balance about a week after delivery</span></div></div>
    </div>
    <div class="stack" style="margin-top:auto;gap:10px">
      <button class="btn gold block" data-act="startReg">Register my factory ${ico('chev')}</button>
      <button class="btn ghost block" data-act="sample">Explore with a sample factory</button>
      <p class="tiny" style="color:var(--on-plum-muted);text-align:center">The sample is Kavin Knit Mills, a fictional Tiruppur hosiery unit, mid-way through its first batch.</p>
    </div>
  </div>`;
}

/* ---------- registration ---------- */
function err(k) { return UI.errors[k] ? `<p class="err" id="err-${k}">${esc(UI.errors[k])}</p>` : ''; }
const bad = (k) => UI.errors[k] ? ' bad' : '';
function inputField({ id, label, path, type = 'text', ph = '', hint = '', mode = '', max = '', upper = false, prefix = '', suffix = '' }) {
  const v = getPath(path) ?? '';
  const attrs = `id="${id}" data-bind="${path}" ${upper ? 'data-upper="1"' : ''} type="${type}" placeholder="${esc(ph)}" value="${esc(v)}" ${mode ? `inputmode="${mode}"` : ''} ${max ? `maxlength="${max}"` : ''} autocomplete="off" ${UI.errors[id] ? `aria-invalid="true" aria-describedby="err-${id}"` : ''}`;
  const control = prefix || suffix
    ? `<div class="input-group${bad(id)}">${prefix ? `<span class="addon">${prefix}</span>` : ''}<input ${attrs}>${suffix ? `<span class="addon r">${suffix}</span>` : ''}</div>`
    : `<input class="input${bad(id)}" ${attrs}>`;
  return `<div class="field"><label for="${id}">${label}</label>${control}${hint ? `<p class="hint">${hint}</p>` : ''}${err(id)}</div>`;
}
function selectBtn({ id, label, value, ph, act, arg = '' }) {
  return `<div class="field"><span class="label" id="lbl-${id}">${label}</span><button type="button" class="select-btn${bad(id)}" data-act="${act}" data-arg="${esc(arg)}" aria-labelledby="lbl-${id}">
    ${value ? `<span>${esc(value)}</span>` : `<span class="ph">${esc(ph)}</span>`}${ico('down')}</button>${err(id)}</div>`;
}
function vReg() {
  const st = S.step, p = S.profile;
  const head = `<div class="topbar">
      <button class="icon-btn" data-act="regBack" aria-label="Back">${ico('back')}</button>
      <div class="t"><p class="eyebrow">Step ${st + 1} of ${STEPS.length} · ${STEPS[st]}</p><h3>${['Verify your mobile', 'Tell us about your factory', 'Where do you manufacture?', 'What do you make?', 'Your products and capacity', 'Contact and payouts', 'Check and submit'][st]}</h3></div>
      <button class="btn text sm" data-act="fillSample" title="Fill this step with sample details">Sample</button>
    </div><div class="progress" aria-hidden="true"><i style="width:${((st + 1) / STEPS.length) * 100}%"></i></div>`;
  const body = [stepMobile, stepBusiness, stepLocation, stepSegment, stepProducts, stepContact, stepReview][st]();
  const nextLabel = st === 6 ? 'Submit for verification' : st === 0 && !p.verified ? (p.otpSent ? 'Verify code' : 'Send code') : 'Continue';
  return `${head}<div class="scroll"><div class="pad">${body}</div></div>
    <div class="footer-bar">${st > 0 ? `<button class="btn ghost" data-act="regBack" style="flex:0 0 auto">Back</button>` : ''}<button class="btn primary" data-act="regNext">${nextLabel}</button></div>`;
}
function stepMobile() {
  const p = S.profile;
  return `<p class="muted">Your mobile number is your login. Demand briefs and approvals also arrive on WhatsApp on this number.</p>
    ${inputField({ id: 'phone', label: 'Mobile number', path: 'profile.phone', type: 'tel', mode: 'numeric', max: 10, ph: '98765 43210', prefix: '+91' })}
    ${p.otpSent ? `<div class="field"><label for="otp0">4-digit code sent to +91 ${esc(p.phone)}</label>
      <div class="otp">${[0, 1, 2, 3].map(i => `<input class="input${bad('otp')}" id="otp${i}" data-otp="${i}" inputmode="numeric" maxlength="1" value="${esc(p.otp[i] || '')}" aria-label="Digit ${i + 1}">`).join('')}</div>
      ${p.verified ? `<p class="hint" style="color:var(--good);font-weight:600">Number verified.</p>` : `<p class="hint">Prototype: any 4 digits work. In the live app the code comes by SMS.</p>`}${err('otp')}
      ${!p.verified ? `<button class="btn text sm" data-act="resend" style="align-self:flex-start">Change number</button>` : ''}</div>` : ''}
    <div class="card flat"><div class="row top">${ico('shield', 'style="width:20px;height:20px;flex:none;color:var(--good)"')}<p class="small">Meesho never asks for your OTP on a call. Your GSTIN and bank details are only used to verify the factory and pay you.</p></div></div>`;
}
function stepBusiness() {
  const p = S.profile;
  const photo = (key, label, sq) => `<div class="photo-pick"><label for="f-${key}"><div class="photo-tile${sq ? ' sq' : ''}">${p[key] ? `<img src="${p[key]}" alt="">` : ico('cam')}</div></label>
    <div class="stack"><b>${label}</b><span class="small muted">${sq ? 'Your shop floor or machines. Buyers see it on the "Sold by the manufacturer" badge.' : 'Shown to Meesho\'s team and on your seller page.'}</span>
    <label class="btn ghost sm" for="f-${key}" style="align-self:flex-start">${p[key] ? 'Change photo' : 'Upload photo'}</label></div>
    <input class="sr" type="file" accept="image/*" id="f-${key}" data-photo="profile.${key}"></div>`;
  return `${photo('photo', 'Profile photo', false)}
    ${inputField({ id: 'firm', label: 'Factory / business name', path: 'profile.firm', ph: 'e.g. Kavin Knit Mills' })}
    ${inputField({ id: 'owner', label: 'Owner name', path: 'profile.owner', ph: 'As on GST registration' })}
    <div class="grid2">${inputField({ id: 'years', label: 'Years running', path: 'profile.years', type: 'number', mode: 'numeric', ph: '12' })}
    ${inputField({ id: 'email', label: 'Email (optional)', path: 'profile.email', type: 'email', ph: 'you@firm.in' })}</div>
    ${photo('factoryPhoto', 'Factory photo (optional)', true)}`;
}
function stepLocation() {
  const p = S.profile, node = NODE_OF[p.city];
  return `<p class="muted">We use this to assign your Factory Node, the hub where you drop each batch in one truck.</p>
    ${selectBtn({ id: 'state', label: 'State', value: p.state, ph: 'Choose state', act: 'sheet', arg: 'state' })}
    ${selectBtn({ id: 'city', label: 'Cluster / city', value: p.city, ph: p.state ? 'Choose your cluster' : 'Choose a state first', act: 'sheet', arg: 'city' })}
    ${inputField({ id: 'pin', label: 'Pin code', path: 'profile.pin', mode: 'numeric', max: 6, ph: '641604' })}
    <div class="field"><label for="address">Factory address</label><textarea class="input${bad('address')}" id="address" rows="2" data-bind="profile.address" placeholder="Plot, street, industrial estate">${esc(p.address)}</textarea>${err('address')}</div>
    ${node ? `<div class="node-card">${ico('truck')}<div class="grow"><b>${node[0]}</b><p class="small">${node[2]} km from ${esc(p.city)} · ${node[1] === 'Live' ? 'Live now' : `Opens in ${node[1]}. Until then, briefs show demand only.`}</p></div>${node[1] === 'Live' ? '<span class="pill good">Live</span>' : `<span class="pill warn">${node[1]}</span>`}</div>` : ''}`;
}
function stepSegment() {
  const p = S.profile;
  return `<p class="muted">Pick up to 3 segments. Each one opens its products and its weekly demand.</p>
    <div class="seg-grid" role="group" aria-label="Segments">${CATS.map(c => `<button type="button" class="seg${p.segments.includes(c.id) ? ' on' : ''}" data-act="toggleSeg" data-arg="${c.id}" aria-pressed="${p.segments.includes(c.id)}">${segIco(c.id)}<span>${c.name}</span><span class="cl">${c.clusters}</span></button>`).join('')}</div>${err('segments')}
    <div class="divider"></div>
    <div class="stack"><h3>What do you do in-house?</h3><p class="small muted">Owning 3 or more of these is what gives a factory its price edge. It decides priority in the Demand Brief.</p></div>
    <div class="stack">${LEVERS.map(([id, t, d]) => `<label class="check"><input type="checkbox" data-lever="${id}" ${p.levers.includes(id) ? 'checked' : ''}><span class="lever"><b>${t}</b><span class="small muted">${d}</span></span></label>`).join('')}</div>
    <div class="divider"></div>
    <div class="stack"><h3>Where do you sell today?</h3><div class="chips">${CHANNELS.map(ch => `<button type="button" class="chip${p.channels.includes(ch) ? ' on' : ''}" data-act="toggleChan" data-arg="${ch}" aria-pressed="${p.channels.includes(ch)}">${ch}</button>`).join('')}</div></div>`;
}
function skuRow(s, editable = true) {
  const t = TYPE[s.typeId], c = skuCheck(s);
  return `<div class="card"><div class="sku"><div class="thumb">${s.photo ? `<img src="${s.photo}" alt="">` : segIco(t.cat)}</div>
    <div class="grow stack" style="gap:2px"><b class="small" style="font-size:14px">${esc(t.name)}</b>
      <span class="tiny muted">Making cost <span class="num">${inr(s.cost)}</span> · min batch <span class="num">${nfmt(s.moq)}</span> · ${esc(s.variants.join(', '))}</span>
      <span class="tiny">${c.ok ? `<span class="pill good">Clears gate</span> lowest price ${inr(c.floor)} vs ${inr(c.med)} buyers pay` : `<span class="pill warn">Not yet</span> lowest price ${inr(c.floor)} vs ${inr(c.med)}`}</span></div>
    ${editable ? `<div class="stack" style="gap:6px"><button class="icon-btn" data-act="editSku" data-arg="${s.id}" aria-label="Edit ${esc(t.name)}">${ico('edit')}</button><button class="icon-btn" data-act="delSku" data-arg="${s.id}" aria-label="Remove ${esc(t.name)}">${ico('trash')}</button></div>` : ''}</div></div>`;
}
function stepProducts() {
  const p = S.profile;
  return `<p class="muted">Add each product you make with its making cost. We use the cost to show the lowest price you can sell at, after node fees, returns and working capital.</p>
    <div class="stack-lg">${p.skus.map(s => skuRow(s)).join('') || `<div class="empty">${ico('box')}<b style="color:var(--ink)">No products yet</b><span class="small">Add the products you make, one at a time.</span></div>`}</div>
    ${err('skus')}
    <button class="btn ghost block" data-act="addSku" ${p.segments.length ? '' : 'disabled'}>${ico('plus')} Add a product</button>
    ${p.segments.length ? '' : '<p class="hint">Pick a segment in the previous step first.</p>'}
    <div class="divider"></div>
    <div class="grid2">${inputField({ id: 'monthly', label: 'Monthly capacity', path: 'profile.monthly', type: 'number', mode: 'numeric', ph: '12000', suffix: 'units' })}
    <div class="field"><label for="lead">Days to make a batch</label><div class="stepper"><button type="button" data-act="lead" data-arg="-1" aria-label="Fewer days">−</button><input id="lead" data-bind="profile.lead" type="number" inputmode="numeric" value="${esc(p.lead)}"><button type="button" data-act="lead" data-arg="1" aria-label="More days">+</button></div></div></div>
    <p class="hint">Capacity caps the quantity Meesho will ask you for. You can change it any time.</p>`;
}
function stepContact() {
  const p = S.profile;
  return `<div class="card flat stack"><div class="toggle-row"><div><b>WhatsApp on +91 ${esc(p.phone || '—')}</b><p class="small muted">Weekly brief and approvals arrive here. Reply 1 to commit.</p></div>
      <label class="switch"><input type="checkbox" id="waSame" data-bindcheck="profile.whatsappSame" ${p.whatsappSame ? 'checked' : ''} aria-label="Use same number for WhatsApp"><span></span></label></div>
      ${p.whatsappSame ? '' : inputField({ id: 'whatsapp', label: 'WhatsApp number', path: 'profile.whatsapp', type: 'tel', mode: 'numeric', max: 10, prefix: '+91' })}</div>
    ${selectBtn({ id: 'lang', label: 'Language for briefs and calls', value: p.lang, act: 'sheet', arg: 'lang' })}
    <div class="grid2">${inputField({ id: 'altName', label: 'Second contact', path: 'profile.altName', ph: 'Manager or family' })}
    ${inputField({ id: 'altPhone', label: 'Their mobile', path: 'profile.altPhone', type: 'tel', mode: 'numeric', max: 10, ph: 'Optional' })}</div>
    <div class="divider"></div>
    <div class="stack"><h3>Verification</h3><p class="small muted">Udyam must show a manufacturing activity. Traders and resellers are not eligible.</p></div>
    ${inputField({ id: 'gstin', label: 'GSTIN', path: 'profile.gstin', ph: '33AABCK1234F1Z5', max: 15, upper: true })}
    ${inputField({ id: 'udyam', label: 'Udyam registration number', path: 'profile.udyam', ph: 'UDYAM-TN-33-0012345', max: 19, upper: true })}
    ${inputField({ id: 'upi', label: 'UPI ID for payouts', path: 'profile.upi', ph: 'name@okaxis', hint: 'Advances and balances are paid here.' })}
    <label class="check"><input type="checkbox" id="consent" data-bindcheck="profile.consent" ${p.consent ? 'checked' : ''}><span>I confirm I manufacture these products myself, and I agree to the Factory Direct terms: quality checks at the node, and a price that stays 8% under what buyers pay.</span></label>${err('consent')}
    <p class="tiny muted">Prototype: use the sample values. Do not enter real ID or payment details here.</p>`;
}
function stepReview() {
  const p = S.profile, node = NODE_OF[p.city];
  const sec = (title, step, rows) => `<div class="card review-sec"><div class="row"><h3>${title}</h3><button class="btn text sm" data-act="goStep" data-arg="${step}">Edit</button></div><dl class="kv">${rows.map(([k, v]) => `<dt>${k}</dt><dd style="font-family:var(--f-body);font-weight:600">${esc(v || '—')}</dd>`).join('')}</dl></div>`;
  return `<div class="row"><div class="avatar lg">${p.photo ? `<img src="${p.photo}" alt="">` : initials(p.firm)}</div><div class="stack" style="gap:2px"><h2>${esc(p.firm)}</h2><span class="muted">${esc(p.owner)} · ${esc(p.city)}, ${esc(p.state)}</span><span class="pill neutral" style="align-self:flex-start">+91 ${esc(p.phone)} verified</span></div></div>
    ${sec('Business', 1, [['Owner', p.owner], ['Years running', p.years], ['Email', p.email]])}
    ${sec('Location', 2, [['Cluster', `${p.city}, ${p.state}`], ['Pin code', p.pin], ['Factory Node', node ? `${node[0]} (${node[1]})` : '']])}
    ${sec('Segment', 3, [['Segments', p.segments.map(s => CAT[s].name).join(', ')], ['In-house', `${p.levers.length} of 4 cost levers`], ['Sells via', p.channels.join(', ')]])}
    <div class="card review-sec"><div class="row"><h3>Products · ${p.skus.length}</h3><button class="btn text sm" data-act="goStep" data-arg="4">Edit</button></div>
      ${p.skus.map(s => { const c = skuCheck(s); return `<div class="row between small"><span class="grow">${esc(TYPE[s.typeId].name)}</span><span class="num">${inr(s.cost)}</span>${c.ok ? '<span class="pill good">Clears</span>' : '<span class="pill warn">Not yet</span>'}</div>`; }).join('')}
      <span class="tiny muted">Capacity ${nfmt(p.monthly)} units a month · ${p.lead} days a batch</span></div>
    ${sec('Contact & KYC', 5, [['WhatsApp', p.whatsappSame ? p.phone : p.whatsapp], ['Language', p.lang], ['GSTIN', p.gstin], ['Udyam', p.udyam], ['Payout UPI', p.upi]])}`;
}

/* ---------- verification screen ---------- */
function ciIcon(state) {
  if (state === 'done') return `<div class="ci done">${ico('check')}</div>`;
  if (state === 'warn') return `<div class="ci warn">${ico('info')}</div>`;
  if (state === 'fail') return `<div class="ci fail">${ico('x')}</div>`;
  if (state === 'run') return `<div class="ci run"></div>`;
  return `<div class="ci"></div>`;
}
function vVerify() {
  const p = S.profile, done = S.status === 'approved';
  const checks = p.skus.map(s => ({ s, c: skuCheck(s) }));
  return `<div class="topbar"><div class="t"><p class="eyebrow">${done ? 'Verified' : 'Checking your details'}</p><h3>${esc(p.firm)}</h3></div></div>
  <div class="scroll"><div class="pad">
    <div class="checks">${S.verifySteps.map(v => `<div class="check-item">${ciIcon(v.state)}<div class="stack" style="gap:1px"><b>${v.title}</b><span class="small muted">${v.state === 'wait' ? 'Waiting' : v.state === 'run' ? 'Checking…' : esc(v.detail)}</span></div></div>`).join('')}</div>
    ${done ? `<div class="card"><div class="row"><h3 class="grow">Your factory-price check</h3><span class="pill good">Approved</span></div>
      <p class="small muted">A product earns the "Sold by the manufacturer" badge when your lowest price is at least 8% under what buyers pay on Meesho today.</p>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="text-align:left;color:var(--muted)"><th style="padding:6px 4px;font-weight:600">Product</th><th style="padding:6px 4px;font-weight:600;text-align:right">You</th><th style="padding:6px 4px;font-weight:600;text-align:right">Buyers pay</th><th style="padding:6px 4px;font-weight:600;text-align:right">Gap</th></tr></thead>
        <tbody>${checks.map(({ s, c }) => `<tr style="border-top:1px solid var(--line)"><td style="padding:8px 4px">${esc(TYPE[s.typeId].name)}</td><td class="num" style="padding:8px 4px;text-align:right">${inr(c.floor)}</td><td class="num" style="padding:8px 4px;text-align:right">${inr(c.med)}</td><td style="padding:8px 4px;text-align:right"><span class="pill ${c.ok ? 'good' : 'warn'}">${pct(c.gap)}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="tiny muted">"You" is the lowest price that keeps your 9% margin when you ship prepaid batches through the node. Shipping each order yourself would cost more: ${checks.map(({ s, c }) => `${esc(TYPE[s.typeId].name.split(',')[0])} ${inr(c.self)}`).join(' · ')}.</p></div>
      ${checks.some(x => !x.c.ok) ? `<div class="verdict warn">${ico('info')}<span>Products marked "Not yet" can still be listed. They get demand briefs, but not the badge until your price clears the gate.</span></div>` : ''}` : ''}
  </div></div>
  ${done ? `<div class="footer-bar"><button class="btn primary" data-act="enterApp">See this week's demand ${ico('chev')}</button></div>` : ''}`;
}
