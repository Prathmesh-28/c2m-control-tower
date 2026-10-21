// Click, input and change handlers, then the first render.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* =====================================================================
   EVENTS
   ===================================================================== */
function goTo(sub) { S.sub = sub; save(); render(); }
const ACT = {
  startReg() { S.screen = 'reg'; S.step = 0; UI.errors = {}; save(); render(); },
  sample() { loadSampleFactory(); save(); render(); toast('Loaded the sample factory'); },
  regBack() { UI.errors = {}; if (S.step === 0) S.screen = 'welcome'; else S.step -= 1; save(); render(); },
  goStep(a) { S.step = +a; UI.errors = {}; render(); },
  regNext() {
    const p = S.profile;
    if (S.step === 0 && !p.verified) {
      if (!RX.phone.test(p.phone)) { UI.errors = { phone: 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.' }; return render(); }
      if (!p.otpSent) { p.otpSent = true; UI.errors = {}; save(); render(); toast(`Code sent to +91 ${p.phone}`); return focusEl('otp0'); }
      if (!/^\d{4}$/.test(p.otp)) { UI.errors = { otp: 'Enter all 4 digits of the code.' }; return render(); }
      p.verified = true; UI.errors = {}; save(); render(); return;
    }
    if (!validateStep(S.step)) { render(); const k = Object.keys(UI.errors)[0]; return focusEl(k); }
    if (S.step === 6) return startVerification();
    S.step += 1; save(); render();
  },
  resend() { Object.assign(S.profile, { otpSent: false, otp: '', verified: false }); render(); focusEl('phone'); },
  fillSample() {
    const s = sampleProfile(), p = S.profile, st = S.step;
    const keys = [['phone', 'otp', 'verified', 'otpSent'], ['firm', 'owner', 'email', 'years'], ['state', 'city', 'pin', 'address'], ['segments', 'levers', 'channels'], ['skus', 'monthly', 'lead'], ['whatsappSame', 'altName', 'altPhone', 'lang', 'gstin', 'udyam', 'upi', 'consent'], []][st];
    s.otpSent = true;
    keys.forEach(k => p[k] = JSON.parse(JSON.stringify(s[k])));
    if (st === 4 && !p.segments.includes('hosiery')) p.segments.push('hosiery');
    if (st === 5 && p.state && STATES[p.state]) p.gstin = STATES[p.state].code + p.gstin.slice(2);
    UI.errors = {}; save(); render();
  },
  sheet(a) { UI.sheet = { type: a }; if (a === 'feed') S.seen = 1; render(); },
  closeSheet() { UI.sheet = null; UI.skuErr = null; render(); },
  pickState(a) { if (S.profile.state !== a) { S.profile.state = a; S.profile.city = ''; } UI.sheet = { type: 'city' }; delete UI.errors.state; save(); render(); },
  pickCity(a) { S.profile.city = a; UI.sheet = null; delete UI.errors.city; save(); render(); },
  pickLang(a) { S.profile.lang = a; UI.sheet = null; save(); render(); },
  toggleSeg(a) { const s = S.profile.segments; const i = s.indexOf(a); if (i >= 0) s.splice(i, 1); else if (s.length < 3) s.push(a); else toast('You can pick up to 3 segments.'); delete UI.errors.segments; save(); render(); },
  toggleChan(a) { const s = S.profile.channels; const i = s.indexOf(a); if (i >= 0) s.splice(i, 1); else s.push(a); save(); render(); },
  lead(a) { S.profile.lead = Math.max(1, Math.min(30, (+S.profile.lead || 5) + +a)); save(); render(); },
  addSku() { UI.sheet = { type: 'sku', d: { id: 's' + uid(), typeId: '', cost: '', moq: 500, variants: [], photo: '' } }; render(); },
  editSku(a) { const k = S.profile.skus.find(x => x.id === a); UI.sheet = { type: 'sku', d: JSON.parse(JSON.stringify(k)) }; render(); },
  delSku(a) { S.profile.skus = S.profile.skus.filter(x => x.id !== a); save(); render(); toast('Product removed'); },
  pickType(a) { const d = UI.sheet.d; d.typeId = a; const c = CAT[TYPE[a].cat]; const vals = Object.values(c.axes)[0]; if (!d.variants.length) d.variants = vals.slice(1, -1).length ? vals.slice(1, -1) : vals.slice(); render(); focusEl('skuCost'); },
  skuChangeType() { UI.sheet.d.typeId = ''; UI.sheet.d.variants = []; render(); },
  skuVar(a) { const v = UI.sheet.d.variants; const i = v.indexOf(a); if (i >= 0) v.splice(i, 1); else v.push(a); render(); },
  saveSku() {
    const d = UI.sheet.d;
    if (!(+d.cost > 0)) { UI.skuErr = 'Enter the making cost per unit.'; return render(); }
    if (!(+d.moq > 0)) { UI.skuErr = 'Enter your minimum batch size.'; return render(); }
    if (!d.variants.length) { UI.skuErr = 'Pick at least one option you make.'; return render(); }
    d.cost = +d.cost; d.moq = +d.moq;
    const i = S.profile.skus.findIndex(x => x.id === d.id);
    if (i >= 0) S.profile.skus[i] = d; else S.profile.skus.push(d);
    if (!S.profile.segments.includes(TYPE[d.typeId].cat)) S.profile.segments.push(TYPE[d.typeId].cat);
    UI.sheet = null; UI.skuErr = null; delete UI.errors.skus; save(); render(); toast(i >= 0 ? 'Product saved' : 'Product added');
  },
  enterApp() { S.screen = 'app'; S.tab = 'demand'; S.seen = 0; save(); render(); },
  tab(a) { S.tab = a; S.sub = null; save(); render(); },
  back() { const s = S.sub; if (s?.type === 'bid') goTo({ type: 'opp', id: s.id }); else goTo(null); },
  dfilter(a) { S.demandFilter = a; save(); render(); },
  openOpp(a) { goTo({ type: 'opp', id: a }); },
  openBid(a) { draft = null; goTo({ type: 'bid', id: a }); },
  openBidView(a) { goTo({ type: 'bidView', id: a }); },
  openBatch(a) { goTo({ type: 'batch', id: a }); },
  dstep(a) { const [k, d] = a.split(':'); draft[k] = Math.max(1, (+draft[k] || 0) + +d); const el = document.getElementById('b' + k); if (el) el.value = draft[k]; updateBidLive(); },
  dqty(a) { draft.qty = +a; render(); },
  dhand(a) { draft.handover = a; render(); },
  submitBid(a) {
    const o = oppById(a), msg = bidValid(o);
    if (msg) return toast(msg);
    const b = { id: 'b-' + uid(), oppId: o.id, typeId: o.typeId, cost: +draft.cost, min: +draft.min, max: +draft.max, qty: +draft.qty, handover: draft.handover, status: 'review', createdAt: Date.now(), checks: reviewChecks() };
    S.bids.unshift(b); feed('bid', `Bid sent: ${TYPE[o.typeId].name} at ${inr(b.min)}–${inr(b.max)}.`);
    draft = null; S.sub = { type: 'bidView', id: b.id }; save(); render(); runReview(b.id);
  },
  acceptCounter(a) {
    const b = S.bids.find(x => x.id === a); b.status = 'approved'; b.agreed = b.counter; b.note = `You accepted Meesho's price of ${inr(b.counter)}. Pre-orders are open.`;
    b.checks.forEach(c => c.state = 'done');
    const bt = newBatch(b); S.batches.unshift(bt); feed('check', `Counter accepted: ${TYPE[b.typeId].name} at ${inr(b.agreed)}.`);
    S.sub = { type: 'batch', id: bt.id }; save(); render(); toast('Accepted. Pre-orders are open.');
  },
  declineCounter(a) { const b = S.bids.find(x => x.id === a); b.status = 'declined'; b.note = `You declined Meesho's counter-offer of ${inr(b.counter)}. You can bid again while the brief is open.`; save(); render(); },
  withdraw(a) { const b = S.bids.find(x => x.id === a); clearInterval(reviewTimers[a]); b.status = 'withdrawn'; b.note = 'You withdrew this bid.'; save(); render(); },
  bDay(a) { const b = S.batches.find(x => x.id === a); batchAdvanceDay(b); save(); render(); },
  bTask(a) { const [id, i] = a.split(':'); const b = S.batches.find(x => x.id === id); b.tasks[+i] = !b.tasks[+i]; save(); render(); },
  bReady(a) { const b = S.batches.find(x => x.id === a); b.stage = 3; save(); render(); },
  bSlot(a) { const [id, k] = a.split('|'); const b = S.batches.find(x => x.id === id); b.slot = k; save(); render(); },
  bHand(a) { const b = S.batches.find(x => x.id === a); batchHandover(b); save(); render(); },
  bShip(a) { const b = S.batches.find(x => x.id === a); batchShip(b); save(); render(); },
  bSettle(a) { const b = S.batches.find(x => x.id === a); batchSettle(b); save(); render(); },
  askReset() { UI.confirmReset = true; render(); },
  cancelReset() { UI.confirmReset = false; render(); },
  reset() { try { localStorage.removeItem(KEY); } catch (e) {} S = fresh(); UI = { sheet: null, toast: null, errors: {} }; draft = null; render(); },
};
function focusEl(id) { setTimeout(() => document.getElementById(id)?.focus(), 30); }
function updateBidLive() { const o = oppById(S.sub?.id); const el = document.getElementById('bidLive'); if (o && el) el.innerHTML = bidLive(o); }

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el.dataset.arg); }
});
app.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card.tap')) { e.preventDefault(); e.target.click(); }
  if (e.key === 'Escape' && UI.sheet) ACT.closeSheet();
  if (e.key === 'Backspace' && e.target.dataset.otp && !e.target.value) { const i = +e.target.dataset.otp; if (i > 0) focusEl('otp' + (i - 1)); }
});
app.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.bind) {
    let v = t.value; if (t.dataset.upper) { v = v.toUpperCase(); t.value = v; }
    if (['profile.phone', 'profile.pin', 'profile.altPhone', 'profile.whatsapp'].includes(t.dataset.bind)) { v = v.replace(/\D/g, ''); t.value = v; }
    setPath(t.dataset.bind, v);
    if (t.dataset.bind === 'profile.phone' && S.profile.verified) { S.profile.verified = false; S.profile.otpSent = false; S.profile.otp = ''; }
    if (UI.errors[t.id]) { delete UI.errors[t.id]; t.classList.remove('bad'); t.closest('.input-group')?.classList.remove('bad'); document.getElementById('err-' + t.id)?.remove(); }
    save();
  }
  if (t.dataset.otp) {
    const i = +t.dataset.otp; const d = t.value.replace(/\D/g, '').slice(-1); t.value = d;
    const arr = (S.profile.otp || '').padEnd(4, ' ').split(''); arr[i] = d || ' '; S.profile.otp = arr.join('').trimEnd();
    if (d && i < 3) focusEl('otp' + (i + 1));
    if (/^\d{4}$/.test(S.profile.otp)) { S.profile.verified = true; UI.errors = {}; save(); render(); toast('Number verified'); }
  }
  if (t.dataset.draft) { draft[t.dataset.draft] = t.value; updateBidLive(); }
  if (t.dataset.skud) { UI.sheet.d[t.dataset.skud] = t.value; const el = document.getElementById('skuLive'); if (el) el.innerHTML = skuLive(UI.sheet.d); }
  if (t.dataset.sheetq) { UI.sheet.q = t.value; const pos = t.selectionStart; render(); const n = document.getElementById('sq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
});
app.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.dataset.bindcheck) { setPath(t.dataset.bindcheck, t.checked); delete UI.errors.consent; save(); render(); }
  if (t.dataset.lever) { const l = S.profile.levers, i = l.indexOf(t.dataset.lever); if (t.checked && i < 0) l.push(t.dataset.lever); if (!t.checked && i >= 0) l.splice(i, 1); save(); }
  if (t.dataset.photo || t.dataset.skuphoto) {
    const f = t.files?.[0]; if (!f) return;
    if (!f.type.startsWith('image/')) return toast('Choose an image file (JPG or PNG).');
    try {
      const url = await shrink(f);
      if (t.dataset.photo) setPath(t.dataset.photo, url); else UI.sheet.d.photo = url;
      save(); render();
    } catch (err) { toast("That photo couldn't be read. Try another one."); }
  }
});
function shrink(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => {
      const m = 320, s = Math.min(1, m / Math.max(img.width, img.height)); const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.82)); }; img.src = r.result; };
    r.readAsDataURL(file);
  });
}

/* resume any timers left mid-flight by a reload */
if (S.screen === 'verify' && S.status === 'verifying') startVerification();
S.bids.filter(b => b.status === 'review').forEach(b => { b.checks = reviewChecks(); runReview(b.id); });
render();
