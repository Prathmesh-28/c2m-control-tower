// Inline SVG icons and the score ring.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* ---------- icons ---------- */
const P = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  demand: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  bid: '<path d="M14 4l6 6M9 9l6 6M12 6l6 6-4 4-6-6z"/><path d="M8 14l-5 5"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 5l7 7-7 7"/>', down: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  truck: '<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  factory: '<path d="M2 21V10l6 4V10l6 4V6h4l2 15z"/><path d="M6 18h2M11 18h2M16 18h2"/>',
  rupee: '<path d="M7 4h10M7 8h10M7 4c6 0 6 8 0 8l8 8"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>', play: '<path d="M7 5l12 7-12 7z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
};
const ico = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra} aria-hidden="true">${P[n]}</svg>`;
const SEG_ICON = {
  hosiery: '<path d="M8 3h7v9l3 4a3 3 0 01-4 4l-6-6z"/><path d="M8 7h7"/>',
  hometex: '<path d="M3 8h18v4H3zM3 12h18v4H3zM3 16h18v4H3z"/><path d="M6 4h12v4H6z"/>',
  dressmat: '<path d="M4 6l8-3 8 3v14H4z"/><path d="M4 10h16M9 3v7"/>',
  plastics: '<path d="M5 8h14l-1.5 12h-11z"/><path d="M4 8h16V5H4z"/>',
  jewellery: '<circle cx="12" cy="15" r="6"/><path d="M9 4h6l-3 5z"/>',
  steel: '<path d="M3 11h18v2a7 7 0 01-7 7h-4a7 7 0 01-7-7z"/><path d="M1 11h2M21 11h2M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
  footwear: '<path d="M3 16c0-3 1-9 3-9 3 0 3 4 6 5l7 2a2 2 0 011 2v2H3z"/>',
  brass: '<path d="M4 14c2 4 14 4 16 0z"/><path d="M12 13c-2-2-1-5 0-8 1 3 2 6 0 8z"/>',
  bags: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
};
const segIco = (id) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SEG_ICON[id]}</svg>`;
function ring(v, label) {
  const r = 30, c = 2 * Math.PI * r, f = v == null ? 0 : Math.max(0, Math.min(100, v)) / 100;
  return `<svg class="ring" viewBox="0 0 76 76" role="img" aria-label="${label}"><circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/>
  <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--marigold)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 38 38)"/>
  <text x="38" y="${v == null ? 42 : 44}" text-anchor="middle" font-size="${v == null ? 12 : 20}">${v == null ? 'New' : Math.round(v)}</text></svg>`;
}
