// App state, saving to the browser, helpers.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* =====================================================================
   STATE
   ===================================================================== */
const KEY = 'factory-direct-app-v1';
const blankProfile = () => ({
  phone: '', otp: '', verified: false, firm: '', owner: '', email: '', years: '', photo: '', factoryPhoto: '',
  state: '', city: '', pin: '', address: '', segments: [], levers: [], channels: [], skus: [],
  monthly: '', lead: 5, whatsappSame: true, whatsapp: '', altName: '', altPhone: '', lang: 'English',
  gstin: '', udyam: '', upi: '', consent: false,
});
const fresh = () => ({ screen: 'welcome', step: 0, tab: 'home', profile: blankProfile(), status: 'draft', verifySteps: [], bids: [], batches: [], wallet: [], feed: [], seen: 0, demandFilter: 'mine', sub: null });
let S = load() || fresh();
let UI = { sheet: null, toast: null, errors: {}, scrollKey: null };
function load() { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { try { const lite = JSON.parse(JSON.stringify(S)); lite.profile.photo = ''; lite.profile.factoryPhoto = ''; lite.profile.skus.forEach(s => s.photo = ''); localStorage.setItem(KEY, JSON.stringify(lite)); } catch (e2) {} } }

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const inr1 = (n) => '₹' + (Math.round(n * 10) / 10).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const nfmt = (n) => Math.round(n).toLocaleString('en-IN');
const pct = (x, d = 1) => (x * 100).toFixed(d) + '%';
const uid = () => Math.random().toString(36).slice(2, 8);
const initials = (s) => (s || 'F').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const getPath = (path) => path.split('.').reduce((o, k) => o?.[k], S);
function setPath(path, v) { const ks = path.split('.'); let o = S; ks.slice(0, -1).forEach(k => o = o[k]); o[ks.at(-1)] = v; }
function feed(icon, text) { S.feed.unshift({ id: uid(), icon, text, at: Date.now() }); }
function ago(t) { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; }
