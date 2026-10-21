// Pop-up sheets: state, cluster, language, notifications, add product.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* ---------- sheets ---------- */
function sheetHead(title) { return `<div class="grab"></div><div class="sh-head"><h2>${title}</h2><button class="icon-btn" data-act="closeSheet" aria-label="Close">${ico('x')}</button></div>`; }
function vSheet() {
  const s = UI.sheet, p = S.profile;
  if (s.type === 'state') {
    const q = (s.q || '').toLowerCase();
    return `${sheetHead('Choose state')}<div class="sh-body"><div class="search">${ico('search')}<input class="input" id="sq" data-sheetq="1" placeholder="Search states" value="${esc(s.q || '')}"></div>
      <div>${Object.keys(STATES).filter(k => k.toLowerCase().includes(q)).map(k => `<button class="list-opt${p.state === k ? ' on' : ''}" data-act="pickState" data-arg="${esc(k)}"><span class="radio"></span><span class="grow">${esc(k)}<span>${STATES[k].cities.slice(0, 3).join(', ')}</span></span></button>`).join('')}</div></div>`;
  }
  if (s.type === 'city') {
    if (!p.state) return `${sheetHead('Choose cluster')}<div class="sh-body"><p class="muted">Choose a state first.</p></div>`;
    return `${sheetHead(`Clusters in ${esc(p.state)}`)}<div class="sh-body"><div>${STATES[p.state].cities.map(c => { const n = NODE_OF[c]; return `<button class="list-opt${p.city === c ? ' on' : ''}" data-act="pickCity" data-arg="${esc(c)}"><span class="radio"></span><span class="grow">${esc(c)}<span>${n ? `${n[0]} · ${n[2]} km` : ''}</span></span>${n ? `<span class="pill ${n[1] === 'Live' ? 'good' : 'warn'}">${n[1]}</span>` : ''}</button>`; }).join('')}</div></div>`;
  }
  if (s.type === 'lang') {
    return `${sheetHead('Language')}<div class="sh-body"><div>${LANGS.map(l => `<button class="list-opt${p.lang === l ? ' on' : ''}" data-act="pickLang" data-arg="${esc(l)}"><span class="radio"></span><span class="grow">${l}</span></button>`).join('')}</div>
      <p class="tiny muted">Weekly briefs and calls use this language. The prototype screens stay in English.</p></div>`;
  }
  if (s.type === 'feed') {
    return `${sheetHead('Notifications')}<div class="sh-body">${S.feed.map(feedItem).join('') || '<p class="muted">Nothing yet.</p>'}</div>`;
  }
  if (s.type === 'sku') {
    const d = s.d, types = p.segments.flatMap(id => CAT[id].types.map(t => ({ ...t, cat: id })));
    if (!d.typeId) {
      return `${sheetHead('Which product?')}<div class="sh-body">${p.segments.map(id => `<div class="stack"><span class="eyebrow">${CAT[id].name}</span>
        ${CAT[id].types.map(t => { const has = p.skus.some(k => k.typeId === t.id && k.id !== d.id); return `<button class="list-opt" data-act="pickType" data-arg="${t.id}" ${has ? 'disabled style="opacity:.45"' : ''}><span class="thumb" style="width:36px;height:36px;border-radius:9px;background:var(--plum-soft);display:grid;place-items:center">${segIco(id).replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow">${esc(t.name)}<span>${has ? 'Already added' : `Buyers pay about ${inr(marketMedian(t.id))}`}</span></span>${ico('chev', 'style="width:18px;height:18px;color:var(--muted)"')}</button>`; }).join('')}</div>`).join('')}</div>`;
    }
    const t = TYPE[d.typeId], c = CAT[t.cat], [axis, vals] = Object.entries(c.axes)[0];
    return `${sheetHead(esc(t.name))}<div class="sh-body">
      <button class="btn text sm" data-act="skuChangeType" style="align-self:flex-start;padding-left:0">${ico('back')} Change product</button>
      <div class="photo-pick"><label for="f-sku"><div class="photo-tile sq">${d.photo ? `<img src="${d.photo}" alt="">` : ico('cam')}</div></label><div class="stack"><b>Product photo</b><span class="small muted">A plain shot on a table is enough.</span></div>
        <input class="sr" type="file" accept="image/*" id="f-sku" data-skuphoto="1"></div>
      <div class="grid2"><div class="field"><label for="skuCost">Making cost per ${c.unit}</label><div class="input-group"><span class="addon">₹</span><input id="skuCost" type="number" inputmode="numeric" data-skud="cost" value="${esc(d.cost)}" placeholder="80"></div></div>
        <div class="field"><label for="skuMoq">Min batch</label><div class="input-group"><input id="skuMoq" type="number" inputmode="numeric" data-skud="moq" value="${esc(d.moq)}" placeholder="500"><span class="addon r">${c.unit}s</span></div></div></div>
      <div class="field"><span class="label">${axis}s you make</span><div class="chips">${vals.map(v => `<button type="button" class="chip${d.variants.includes(v) ? ' on' : ''}" data-act="skuVar" data-arg="${esc(v)}" aria-pressed="${d.variants.includes(v)}">${v}</button>`).join('')}</div></div>
      <div class="card flat" id="skuLive">${skuLive(d)}</div>
      ${UI.skuErr ? `<p class="err">${esc(UI.skuErr)}</p>` : ''}</div>
      <div class="footer-bar"><button class="btn primary" data-act="saveSku">${d.id && p.skus.some(k => k.id === d.id) ? 'Save product' : 'Add product'}</button></div>`;
  }
  return '';
}
function skuLive(d) {
  if (!(+d.cost > 0)) return `<p class="small muted">Enter the making cost to see the lowest price you can sell at.</p>`;
  const c = skuCheck({ typeId: d.typeId, cost: +d.cost });
  return `<div class="row"><span class="grow small">Lowest price via prepaid node batches</span><b class="num">${inr(c.floor)}</b></div>
    <div class="row"><span class="grow small">Buyers pay today</span><b class="num">${inr(c.med)}</b></div>
    <div class="verdict ${c.ok ? 'good' : 'warn'}" style="padding:8px 10px">${ico(c.ok ? 'check' : 'info')}<span>${c.ok ? `${pct(c.gap)} under market: earns the factory-price badge.` : `${pct(c.gap)} under market. The badge needs 8%. A making cost of ${inr(maxCost(d.typeId))} or less clears it.`}</span></div>`;
}
function maxCost(typeId) { const g = priceGate(typeId); let lo = 1, hi = 2000; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (batchFloor(typeId, m) <= g) lo = m; else hi = m; } return Math.floor(lo); }
