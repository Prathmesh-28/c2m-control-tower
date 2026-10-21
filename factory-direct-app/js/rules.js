// Validation, sample factory, verification, bid review and the batch lifecycle.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* =====================================================================
   VALIDATION
   ===================================================================== */
const RX = {
  phone: /^[6-9]\d{9}$/, pin: /^[1-9]\d{5}$/, email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, udyam: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/, upi: /^[\w.\-]{2,}@[A-Za-z]{2,}$/,
};
const STEPS = ['Mobile', 'Business', 'Location', 'Segment', 'Products', 'Contact & KYC', 'Review'];
function validateStep(step) {
  const p = S.profile, e = {};
  if (step === 0) {
    if (!RX.phone.test(p.phone)) e.phone = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
    else if (!p.verified) e.otp = 'Enter the 4-digit code to verify this number.';
  }
  if (step === 1) {
    if (p.firm.trim().length < 3) e.firm = 'Enter your factory or business name.';
    if (p.owner.trim().length < 3) e.owner = "Enter the owner's full name.";
    if (p.email && !RX.email.test(p.email)) e.email = 'This email looks incomplete. Check for a missing @ or domain.';
  }
  if (step === 2) {
    if (!p.state) e.state = 'Choose the state your factory is in.';
    if (!p.city) e.city = 'Choose your manufacturing cluster or city.';
    if (!RX.pin.test(p.pin)) e.pin = 'Pin codes have 6 digits and do not start with 0.';
    if (p.address.trim().length < 8) e.address = 'Add the street address so the node truck can find you.';
  }
  if (step === 3) {
    if (!p.segments.length) e.segments = 'Pick at least one segment you manufacture in.';
  }
  if (step === 4) {
    if (!p.skus.length) e.skus = 'Add at least one product you make.';
    if (!(+p.monthly > 0)) e.monthly = 'Enter how many units you can make in a month, across all products.';
  }
  if (step === 5) {
    if (!p.whatsappSame && !RX.phone.test(p.whatsapp)) e.whatsapp = 'Enter a valid 10-digit WhatsApp number.';
    if (p.altPhone && !RX.phone.test(p.altPhone)) e.altPhone = 'Enter a valid 10-digit number or leave it blank.';
    if (!RX.gstin.test(p.gstin)) e.gstin = 'GSTIN has 15 characters, like 33AABCK1234F1Z5.';
    else if (p.state && STATES[p.state] && p.gstin.slice(0, 2) !== STATES[p.state].code) e.gstin = `GSTIN starts with ${p.gstin.slice(0, 2)}, but ${p.state} uses ${STATES[p.state].code}. Use the GSTIN for this factory.`;
    if (!RX.udyam.test(p.udyam)) e.udyam = 'Udyam number looks like UDYAM-TN-33-0012345.';
    if (!RX.upi.test(p.upi)) e.upi = 'Enter the UPI ID payouts should go to, like name@okaxis.';
    if (!p.consent) e.consent = 'Tick the box to agree before continuing.';
  }
  UI.errors = e;
  return Object.keys(e).length === 0;
}

/* =====================================================================
   SAMPLE DATA (clearly marked)
   ===================================================================== */
function sampleProfile() {
  return {
    ...blankProfile(), phone: '9876543210', otp: '4821', verified: true, firm: 'Kavin Knit Mills', owner: 'K. Senthil', email: 'kavinknit@example.in', years: '14',
    state: 'Tamil Nadu', city: 'Tiruppur', pin: '641604', address: 'Plot 22, SIDCO Industrial Estate, Mudalipalayam',
    segments: ['hosiery'], levers: ['make', 'scale', 'auto'], channels: ['Wholesalers', 'Export buyers'],
    skus: [
      { id: 'k1', typeId: 'briefs3', cost: 80, moq: 500, variants: ['S','M','L','XL','XXL'], photo: '' },
      { id: 'k2', typeId: 'vests2', cost: 102, moq: 500, variants: ['M','L','XL'], photo: '' },
      { id: 'k3', typeId: 'leggings', cost: 92, moq: 300, variants: ['M','L','XL'], photo: '' },
    ],
    monthly: '12000', lead: 5, whatsappSame: true, altName: 'S. Arun (son)', altPhone: '9123456780', lang: 'தமிழ்',
    gstin: '33AABCK1234F1Z5', udyam: 'UDYAM-TN-33-0012345', upi: 'kavinknit@okaxis', consent: true,
  };
}
function loadSampleFactory() {
  S = fresh();
  S.profile = sampleProfile();
  S.status = 'approved'; S.screen = 'app'; S.tab = 'home';
  S.verifySteps = verifyPlan().map(v => ({ ...v, state: v.result }));
  const o1 = demandFor('briefs3', 12000);
  const b1 = { id: 'b-' + uid(), oppId: o1.id, typeId: 'briefs3', cost: 80, min: 182, max: 190, qty: Math.min(o1.need, 1900), handover: addDays(TODAY, 4).toISOString(), status: 'approved', agreed: 190, createdAt: Date.now() - 86400000 * 6, checks: reviewChecks().map(c => ({ ...c, state: 'done' })), note: 'Inside the target band. Price locked at ₹190 a pack.' };
  const batch = newBatch(b1); batch.stage = 2; batch.day = 3; batch.confirmed = Math.round(b1.qty * 0.58); batch.make = Math.round(batch.confirmed * (1 + FD.buffer)); batch.tasks = [true, true, true, false, false];
  const o2 = demandFor('vests2', 12000);
  const b2 = { id: 'b-' + uid(), oppId: o2.id, typeId: 'vests2', cost: 102, min: 222, max: 236, qty: Math.min(o2.need, 900), handover: addDays(TODAY, 8).toISOString(), status: 'counter', counter: Math.floor(priceGate('vests2')), createdAt: Date.now() - 3600000 * 5, checks: reviewChecks().map(c => ({ ...c, state: c.id === 'price' ? 'warn' : 'done' })), note: `Your lowest price ₹222 is above Meesho's ceiling for this product. Meesho offers ₹${Math.floor(priceGate('vests2'))}.` };
  S.bids = [b2, b1]; S.batches = [batch];
  S.wallet = [];
  S.feed = [
    { id: uid(), icon: 'bid', text: `Counter-offer on Cotton vests: ${inr(b2.counter)} a pack. Accept or decline in Bids.`, at: Date.now() - 3600000 * 4 },
    { id: uid(), icon: 'box', text: `Batch locked: ${nfmt(batch.confirmed)} buyers prepaid for briefs. Make ${nfmt(batch.make)} packs.`, at: Date.now() - 86400000 * 2 },
    { id: uid(), icon: 'demand', text: `Week ${WEEK} Demand Brief is ready: ${myOpps().length} products need factories.`, at: Date.now() - 86400000 * 1 },
    { id: uid(), icon: 'shield', text: 'Profile verified. 2 of 3 products clear the factory-price gate.', at: Date.now() - 86400000 * 9 },
  ];
  S.seen = 1;
}

/* =====================================================================
   REGISTRATION VERIFICATION (simulated, rules visible)
   ===================================================================== */
function skuCheck(s) {
  const floor = batchFloor(s.typeId, +s.cost), med = marketMedian(s.typeId), gap = (med - floor) / med;
  return { floor, med, gap, ok: gap >= FD.gate, self: selfFloor(s.typeId, +s.cost) };
}
function verifyPlan() {
  const p = S.profile;
  const node = NODE_OF[p.city] || ['Nearest live node', 'Live', 0];
  const checks = p.skus.map(skuCheck), pass = checks.filter(c => c.ok).length;
  return [
    { id: 'mobile', title: 'Mobile number verified', detail: `+91 ${p.phone}`, result: 'done' },
    { id: 'gst', title: 'GSTIN is active', detail: `${p.gstin} · state code ${p.gstin.slice(0, 2)} matches ${p.state}`, result: 'done' },
    { id: 'udyam', title: 'Udyam shows a manufacturing activity', detail: `${p.udyam} · NIC code under manufacturing, not trading`, result: 'done' },
    { id: 'levers', title: 'Cost ownership', detail: `${p.levers.length} of 4 cost levers in-house${p.levers.length >= 3 ? '' : ' (3+ gets priority in briefs)'}`, result: p.levers.length >= 3 ? 'done' : 'warn' },
    { id: 'price', title: 'Factory-price check on your products', detail: `${pass} of ${p.skus.length} products can sell 8% under what buyers pay today`, result: pass ? 'done' : 'warn' },
    { id: 'node', title: 'Factory Node assigned', detail: `${node[0]} · ${node[2]} km · ${node[1] === 'Live' ? 'live now' : 'opens in ' + node[1]}`, result: 'done' },
  ];
}
let verifyTimer = null;
function startVerification() {
  S.status = 'verifying'; S.screen = 'verify';
  const plan = verifyPlan();
  S.verifySteps = plan.map(v => ({ ...v, state: 'wait' }));
  save(); render();
  let i = 0;
  clearInterval(verifyTimer);
  verifyTimer = setInterval(() => {
    if (i > 0) S.verifySteps[i - 1].state = plan[i - 1].result;
    if (i < plan.length) S.verifySteps[i].state = 'run';
    else { clearInterval(verifyTimer); S.status = 'approved'; feed('shield', 'Profile verified. You can now bid on Meesho demand.'); feed('demand', `Week ${WEEK} Demand Brief is ready for your products.`); }
    i++; save(); if (S.screen === 'verify') render();
  }, 750);
}

/* =====================================================================
   BIDDING + MEESHO REVIEW
   ===================================================================== */
function myOpps() {
  const p = S.profile, cap = +p.monthly || 0;
  const mine = p.skus.map(s => ({ ...demandFor(s.typeId, cap), sku: s }));
  const listed = new Set(p.skus.map(s => s.typeId));
  const extra = p.segments.flatMap(id => CAT[id].types).filter(t => !listed.has(t.id)).slice(0, 2).map(t => ({ ...demandFor(t.id, cap), sku: null, isNew: true }));
  return [...mine, ...extra];
}
const oppById = (id) => myOpps().find(o => o.id === id);
const bidFor = (oppId) => S.bids.find(b => b.oppId === oppId && ['review', 'approved', 'counter'].includes(b.status));
function reviewChecks() {
  return [
    { id: 'price', title: 'Price against what buyers pay', state: 'wait' },
    { id: 'cap', title: 'Quantity against your capacity', state: 'wait' },
    { id: 'quality', title: 'Quality and returns history', state: 'wait' },
    { id: 'node', title: 'Node slot on your handover date', state: 'wait' },
  ];
}
function decide(bid) {
  const gate = Math.floor(priceGate(bid.typeId)), floor = batchFloor(bid.typeId, bid.cost);
  if (bid.min <= gate) {
    const agreed = Math.max(bid.min, Math.min(bid.max, gate));
    return { status: 'approved', agreed, note: `Inside Meesho's band. Price locked at ${inr(agreed)} a ${CAT[TYPE[bid.typeId].cat].unit}: the highest price in your range that stays 8% under what buyers pay.`, price: 'done' };
  }
  if (gate >= floor) return { status: 'counter', counter: gate, note: `Your lowest price ${inr(bid.min)} is above Meesho's ceiling of ${inr(gate)}. At ${inr(gate)} you still clear your break-even of ${inr(floor)}.`, price: 'warn' };
  return { status: 'declined', note: `At your making cost of ${inr(bid.cost)}, your break-even (${inr(floor)}) sits above Meesho's ceiling of ${inr(gate)}. Lower the making cost or bid on another product.`, price: 'fail' };
}
const reviewTimers = {};
function runReview(bidId) {
  const bid = S.bids.find(b => b.id === bidId); if (!bid) return;
  let i = 0; const d = decide(bid);
  clearInterval(reviewTimers[bidId]);
  reviewTimers[bidId] = setInterval(() => {
    const b = S.bids.find(x => x.id === bidId);
    if (!b) return clearInterval(reviewTimers[bidId]);
    if (i > 0) b.checks[i - 1].state = b.checks[i - 1].id === 'price' ? d.price : 'done';
    if (i < b.checks.length) b.checks[i].state = 'run';
    else {
      clearInterval(reviewTimers[bidId]);
      Object.assign(b, { status: d.status, agreed: d.agreed, counter: d.counter, note: d.note });
      const nm = TYPE[b.typeId].name;
      if (d.status === 'approved') { const bt = newBatch(b); S.batches.unshift(bt); feed('check', `Bid approved: ${nm} at ${inr(b.agreed)}. Pre-orders are open.`); toast(`Approved at ${inr(b.agreed)}. Pre-orders are open.`); }
      if (d.status === 'counter') { feed('bid', `Counter-offer on ${nm}: ${inr(b.counter)}. Accept or decline in Bids.`); toast(`Meesho sent a counter-offer: ${inr(b.counter)}`); }
      if (d.status === 'declined') { feed('x', `Bid declined on ${nm}. See why in Bids.`); toast('Bid declined. Open it to see why.'); }
      S.seen = 0;
    }
    i++; save(); render();
  }, 900);
}
function newBatch(bid) {
  return { id: 'B' + (1040 + S.batches.length + 1) + '-' + uid().slice(0, 3).toUpperCase(), bidId: bid.id, typeId: bid.typeId, price: bid.agreed, qty: bid.qty, cost: bid.cost,
    stage: 1, day: 0, confirmed: 0, make: 0, tasks: [false, false, false, false, false], slot: null, advancePaid: 0, shipped: null, paid: false, created: Date.now() };
}

/* =====================================================================
   BATCH LIFECYCLE
   ===================================================================== */
const STAGES = ['Price locked', 'Buyers prepay', 'Make', 'Handover', 'Node ships', 'Paid'];
const TASKS = ['Raw material in stock', 'Production run started', 'Production complete', 'QC sample checked (AQL 2.5)', 'Packed & labelled by size'];
function batchAdvanceDay(b) {
  const rng = makeRng(hashSeed(b.id, b.day));
  b.day += 1;
  const target = Math.round(b.qty * (0.55 + 0.17 * makeRng(hashSeed(b.id)).next()));
  b.confirmed = b.day >= 3 ? target : Math.min(target, Math.round(target * (b.day / 3) * rng.uniform(0.9, 1.05)));
  if (b.day >= 3) { b.make = Math.round(b.confirmed * (1 + FD.buffer)); b.stage = 2; feed('box', `Pre-order window closed: ${nfmt(b.confirmed)} buyers prepaid. Make ${nfmt(b.make)} (confirmed + 15%).`); toast(`Batch locked. Make ${nfmt(b.make)} units.`); }
}
function batchHandover(b) {
  const cash = batchCash({ confirmed: b.confirmed, price: b.price, typeId: b.typeId });
  b.advancePaid = cash.advance; b.stage = 4;
  S.wallet.unshift({ id: uid(), at: Date.now(), amount: cash.advance, label: `30% advance · ${b.id}`, kind: 'advance' });
  feed('rupee', `${inr(cash.advance)} advance paid for ${b.id} at handover.`);
  toast(`${inr(cash.advance)} advance sent to ${S.profile.upi || 'your UPI'}`);
}
function batchShip(b) { const c = batchCash({ confirmed: b.confirmed, price: b.price, typeId: b.typeId }); b.shipped = c; b.stage = 5; feed('truck', `${b.id}: ${nfmt(c.delivered)} delivered, ${nfmt(c.returns)} returned at the node.`); }
function batchSettle(b) {
  const c = b.shipped; b.paid = true; b.stage = 6;
  S.wallet.unshift({ id: uid(), at: Date.now(), amount: c.balance, label: `Balance · ${b.id}`, kind: 'balance' });
  feed('rupee', `${inr(c.balance)} balance settled for ${b.id}.`); toast(`${inr(c.balance)} balance settled`);
}
