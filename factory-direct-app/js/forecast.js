// Seeded randomness, dates and Meesho's demand forecast (the Demand Brief).
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* ---------- seeded randomness (same as prototype rng.js) ---------- */
function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = { next, uniform: (lo, hi) => lo + (hi - lo) * next(), int: (lo, hi) => Math.floor(lo + (hi - lo + 1) * next()),
    normal: (m = 0, sd = 1) => { const u = Math.max(next(), 1e-12), v = next(); return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); } };
  r.lognormal = (med, s) => med * Math.exp(r.normal(0, s));
  return r;
}
function hashSeed(...parts) { let h = 2166136261; for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- dates ---------- */
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
function isoWeek(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 86400000 + 1) / 7); }
const WEEK = isoWeek(TODAY);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

/* ---------- Meesho's predictability model (Demand Brief) ---------- */
const round50 = (x) => Math.max(50, Math.round(x / 50) * 50);
const end9 = (x) => Math.max(9, Math.round((x + 1) / 10) * 10 - 1);
function bell(n) { const m = (n - 1) / 2; return Array.from({ length: n }, (_, i) => Math.exp(-((i - m) ** 2) / Math.max(1, n / 2))); }
function demandFor(typeId, capacity) {
  const t = TYPE[typeId], c = CAT[t.cat], med = marketMedian(typeId);
  const base = 900 * c.perDay;
  const rows = DISTRICTS.map(([district, pin, w]) => {
    const rng = makeRng(hashSeed(district, typeId, WEEK));
    return { district, pin, weekly: Math.round(base * w * rng.lognormal(1, 0.35)), band: [end9(med * rng.uniform(0.84, 0.88)), end9(med * rng.uniform(0.93, 0.97))], growth: rng.normal(0.04, 0.06) };
  }).sort((a, b) => b.weekly - a.weekly).slice(0, 8);
  const weekly = rows.reduce((s, r) => s + r.weekly, 0);
  const forecast14 = weekly * 2;
  const rng = makeRng(hashSeed('opp', typeId, WEEK));
  const cap = capacity ? Math.max(200, capacity * 0.6) : Infinity;
  const need = round50(Math.min(forecast14 * FD.newSellerShare * rng.uniform(0.9, 1.15), cap));
  const [axis, values] = Object.entries(c.axes)[0];
  const w = bell(values.length).map((x) => x * rng.uniform(0.85, 1.15)); const ws = w.reduce((a, b) => a + b, 0);
  let assigned = 0;
  const split = values.map((v, i) => { const u = i === values.length - 1 ? need - assigned : Math.round((need * w[i]) / ws / 10) * 10; assigned += u; return { v, u }; });
  const gate = med * (1 - FD.gate);
  return {
    id: `${typeId}-w${WEEK}`, typeId, need, weekly, forecast14, rows, axis, split, median: med,
    band: [Math.round(gate * 0.95), Math.floor(gate)], confidence: Math.round(rng.uniform(71, 89)),
    closes: rng.int(2, 5), deliverBy: addDays(TODAY, rng.int(9, 13)).toISOString(),
    secondAxis: Object.entries(c.axes)[1],
  };
}
