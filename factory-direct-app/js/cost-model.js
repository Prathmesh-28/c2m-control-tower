// Cost model and assumptions, ported from the Control Tower prototype (src/lib/factoryDirect.js).
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

// Assumption register (deck A8-A32, prototype config.js FD)
const FD = {
  margin: 0.09, wholesalerMarkup: 0.15, returnFee: 150, rtoFee: 0,
  fees: { selfFwd: 55, selfPack: 10, nodeFwd: 42, nodeFee: 20 },
  recovery: { self: 0.85, node: 0.9 }, capital: { rate: 0.18, stockDays: 45, batchDays: 10 },
  unsold: { stock: 0.10, batch: 0.02, salvage: 0.5 }, preorderDiscount: 10, gate: 0.08, buffer: 0.15,
  advance: 0.30, prepaid: 0.37, codFailGap: 0.15, newSellerShare: 0.06,
};
const prepaidRto = (r) => r.rto - (1 - FD.prepaid) * FD.codFailGap;
function packCost({ cogs, rates, mode = 'node', stock = 'batch', prepaid = true, margin = FD.margin }) {
  const rRto = prepaid ? prepaidRto(rates) : rates.rto;
  const disp = 100, rto = disp * rRto, delivered = disp - rto, ret = delivered * rates.ret, kept = delivered - ret;
  const rec = FD.recovery[mode === 'node' ? 'node' : 'self'];
  const u = FD.unsold[stock === 'build' ? 'stock' : 'batch'];
  const days = stock === 'build' ? FD.capital.stockDays : FD.capital.batchDays;
  const L = FD.fees, make = disp * cogs;
  const unsold = ((disp * u) / (1 - u)) * cogs * (1 - FD.unsold.salvage);
  const recovered = (rto + ret) * cogs * rec;
  const logistics = mode === 'node' ? delivered * L.nodeFwd + disp * L.nodeFee : delivered * L.selfFwd + disp * L.selfPack;
  const reverse = ret * FD.returnFee + rto * FD.rtoFee;
  const capital = (make * FD.capital.rate * days) / 365;
  const total = make + unsold - recovered + logistics + reverse + capital;
  const k = (x) => x / kept;
  return { goods: k(make - recovered), unsold: k(unsold), logistics: k(logistics), returns: k(reverse), capital: k(capital), cost: k(total), floor: k(total) / (1 - margin) };
}
const ratesOf = (typeId) => { const c = CAT[TYPE[typeId].cat]; return { rto: c.rto, ret: c.ret }; };
const marketMedian = (typeId) => TEARDOWN[typeId] ?? Math.round(TYPE[typeId].ref * 0.88);
const priceGate = (typeId) => marketMedian(typeId) * (1 - FD.gate);
const batchFloor = (typeId, cogs) => packCost({ cogs, rates: ratesOf(typeId) }).floor;
const selfFloor = (typeId, cogs) => packCost({ cogs, rates: ratesOf(typeId), mode: 'self', stock: 'build', prepaid: false }).floor;
const costPerKept = (typeId, cogs) => packCost({ cogs, rates: ratesOf(typeId) }).cost;
function batchCash({ confirmed, price, typeId }) {
  const r = ratesOf(typeId);
  const failed = confirmed * prepaidRto(r), delivered = confirmed - failed, returns = delivered * r.ret, kept = delivered - returns;
  const value = confirmed * price, advance = value * FD.advance, revenue = kept * price;
  const fees = { forward: delivered * FD.fees.nodeFwd, node: confirmed * FD.fees.nodeFee, returns: returns * FD.returnFee };
  const feeTotal = fees.forward + fees.node + fees.returns, payout = revenue - feeTotal;
  return { failed, delivered, returns, kept, value, advance, revenue, fees, feeTotal, payout, balance: payout - advance };
}
