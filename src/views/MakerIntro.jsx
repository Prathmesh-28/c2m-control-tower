import { useEffect, useRef, useState } from 'react';
import imgMeesho from '../assets/overview/meesho.webp';
import imgFactory from '../assets/overview/factory.webp';
import imgMaking from '../assets/overview/factory-big.webp';
import imgNode from '../assets/overview/node.webp';
import imgHandover from '../assets/maker/handover.webp';
import imgBoxes from '../assets/maker/boxes.webp';

// How the manufacturer app works, in plain words: what we ask the factory, the eight-step journey from an open
// requirement to payment (app and WhatsApp side by side), what happens when plans change, and a lead-in to the
// research toolkit (the price check, demand, batch and WhatsApp screens below it).

const USES = [
  { id: 'show', t: 'Show the right requirements', d: 'Only products this factory makes, from buyers it can reach.' },
  { id: 'size', t: 'Size each batch', d: 'Quantities that fit spare capacity and minimum run size.' },
  { id: 'route', t: 'Pick the nearest Factory Node', d: 'One short truck trip, and a delivery date we can promise buyers.' },
  { id: 'price', t: 'Check the bid price', d: 'Compare the bid with the factory’s own cost range and what buyers pay.' },
  { id: 'pay', t: 'Pay quickly and safely', d: 'Advance and balance go to a verified account.' },
];

const FIELDS = [
  { ic: '📍', t: 'Location and cluster', s: 'e.g. Tiruppur, Tamil Nadu', u: ['show', 'route'] },
  { ic: '🧵', t: 'Products and categories', s: 'e.g. men’s innerwear, socks', u: ['show', 'price'] },
  { ic: '🏭', t: 'Capacity per week', s: 'How many units the looms can make', u: ['size', 'show'] },
  { ic: '📦', t: 'Minimum batch size', s: 'Smallest run worth starting', u: ['size'] },
  { ic: '⏱️', t: 'Time to make a batch', s: 'Days from approval to ready', u: ['route', 'size'] },
  { ic: '🧶', t: 'Raw material on hand', s: 'Fabric, yarn, packaging', u: ['size'] },
  { ic: '💲', t: 'Cost and price range', s: 'Making cost per product', u: ['price'] },
  { ic: '📄', t: 'GST, Udyam and bank', s: 'Proves it is a real manufacturer', u: ['price', 'pay'] },
  { ic: '🔎', t: 'Quality standards', s: 'Checks done, past buyer ratings', u: ['show', 'price'] },
  { ic: '💬', t: 'WhatsApp and language', s: 'Where the weekly brief arrives', u: ['show'] },
];

// Small building blocks for the phone screens.
const Pc = ({ t, rows, sel }) => (
  <div className={`mo-pc${sel ? ' sel' : ''}`}>
    {t && <div className="t">{t}</div>}
    {rows.map(([k, v]) => <div className="r" key={k}><span>{k}</span><b>{v}</b></div>)}
  </div>
);
const Chk = ({ t, s, wait }) => (
  <div className="mo-chk">
    <span className={`c${wait ? ' w' : ''}`}>{wait ? '…' : '✓'}</span>
    <div><b>{t}</b><span>{s}</span></div>
  </div>
);
const Inp = ({ l, v, h }) => (
  <div className="mo-in-f"><label>{l}</label><div>{v}{h && <i>{h}</i>}</div></div>
);
const Chips = ({ items }) => (
  <div className="mo-chips">{items.map(([x, o]) => <span key={x} className={o ? 'o' : undefined}>{x}</span>)}</div>
);

const STEPS = [
  {
    ic: '📋', lbl: 'See requirements', who: 's', whoT: 'Meesho',
    title: 'Meesho posts what buyers need',
    lead: 'Every week, Meesho turns its demand prediction into a list of open requirements: which product, in what sizes, how many, and by when.',
    m: ['Opens the app (or the WhatsApp brief) on Monday', 'Sees only requirements that match its products and capacity'],
    s: ['Predicts demand by product, district and size', 'Splits it into requirements a factory can make'],
    why: ['Why it matters', 'The factory never has to guess what will sell.'], img: imgMeesho,
    wa: 'This week for you:\n1. Men’s cotton briefs, pack of 3 · 1,200 packs\n2. Ankle socks, pack of 5 · 800 packs\nReply 1 or 2 to bid.',
    reply: { q: ['1 · Bid on briefs', '2 · Bid on socks'], r: '1', ack: 'Great. Send quantity, price per pack and ready day.' },
    screen: () => (
      <>
        <h5>Open requirements</h5>
        <Chips items={[['Hosiery'], ['Near Tiruppur'], ['This week', true]]} />
        <Pc t="Men’s cotton briefs, pack of 3" rows={[['Quantity', '1,200 packs'], ['Sizes', 'S to XXL'], ['Ready by', 'Thursday']]} sel />
        <Pc t="Ankle socks, pack of 5" rows={[['Quantity', '800 packs'], ['Sizes', 'Free size'], ['Ready by', 'Friday']]} />
        <Pc t="Vests, pack of 2" rows={[['Quantity', '600 packs'], ['Sizes', 'M to XL'], ['Ready by', 'Next Monday']]} />
        <div className="mo-btn">Bid on briefs →</div>
      </>
    ),
  },
  {
    ic: '✋', lbl: 'Place a bid', who: 'm', whoT: 'Factory',
    title: 'The manufacturer bids on what it can make',
    lead: 'The owner picks a requirement and says how many units it can make, at what price per unit, and when they will be ready.',
    m: ['Enters quantity, price per unit and ready date', 'Confirms raw material is in hand'],
    s: ['Pre-fills sizes and packaging from the requirement', 'Lets the owner bid for part of the quantity'],
    why: ['Why it matters', 'The factory sets its own price. Meesho never pushes it down.'], img: imgFactory,
    wa: 'Reply with: quantity, price per pack, ready day\ne.g. “1200, 178, Thu”',
    reply: { q: [], r: '1200, 178, Thu', ack: 'Bid received ✓ We are checking it now.' },
    screen: () => (
      <>
        <h5>Your bid</h5>
        <Pc t="Men’s cotton briefs, pack of 3" rows={[['Asked', '1,200 packs'], ['Ready by', 'Thursday']]} sel />
        <Inp l="How many can you make?" v="1,200" h="packs" />
        <Inp l="Your price per pack" v="₹178" h="incl. packing" />
        <Inp l="Ready on" v="Thursday" />
        <Chips items={[['Fabric in stock ✓'], ['Size split S–XXL']]} />
        <div className="mo-btn o">Submit bid</div>
      </>
    ),
  },
  {
    ic: '🔍', lbl: 'Price check', who: 's', whoT: 'Meesho',
    title: 'Meesho verifies the price range',
    lead: 'Within minutes, the bid is checked automatically: is the price inside the accepted range, is it clearly below what buyers pay today, and can this factory really make it?',
    m: ['Waits; nothing to do', 'If the price is too high, sees the range and can rebid'],
    s: ['Compares the bid with the accepted price range', 'Checks capacity, profile and past quality'],
    why: ['Why it matters', 'Only bids that are really cheaper get the “sold by the manufacturer” badge.'], img: imgMeesho,
    wa: 'Checking your bid… ✓ price in range ✓ capacity OK\nWe’ll confirm shortly.',
    reply: { q: [], r: '👍', ack: '' },
    screen: () => (
      <>
        <h5>Checking your bid</h5>
        <span className="sm">Usually takes a few minutes</span>
        <div className="mo-pc">
          <div className="t">Price range for this product</div>
          <div className="mo-range"><div className="tr" /><div className="mk" /></div>
          <div className="mo-range-l"><span>Too low</span><span>Accepted range</span><span>Too high</span></div>
        </div>
        <div className="mo-pc">
          <Chk t="Price is inside the range" s="Matches your own cost range" />
          <Chk t="Below what buyers pay today" s="Qualifies for the badge" />
          <Chk t="Fits your weekly capacity" s="Based on your profile" />
          <Chk t="Final approval" s="In progress" wait />
        </div>
      </>
    ),
  },
  {
    ic: '✅', lbl: 'Get approved', who: 's', whoT: 'Meesho',
    title: 'The bid is approved and the batch is locked',
    lead: 'Once approved, buyers can pre-order at the factory price, the batch size is locked, and a Factory Node is assigned for handover.',
    m: ['Gets the approval with batch details', 'Taps “Start production”'],
    s: ['Opens pre-orders to buyers', 'Reserves space at the nearest node and lines up the advance'],
    why: ['Why it matters', 'The factory only starts cutting fabric once the order is confirmed.'], img: imgNode,
    wa: '✅ Bid approved!\nMake 1,200 packs by Thursday.\nHandover: Tiruppur Factory Node.\nReply 1 to start production.',
    reply: { q: ['1 · Start production', '2 · Ask a question'], r: '1', ack: 'Production started ✓ We’ll ask for updates.' },
    screen: () => (
      <>
        <div className="mo-big"><span className="c">✓</span><div><b>Bid approved</b><span>Men’s cotton briefs, pack of 3</span></div></div>
        <Pc t="Your batch" rows={[['Make', '1,200 packs'], ['Ready by', 'Thursday'], ['Hand over at', 'Tiruppur Node'], ['Advance', 'Paid at handover']]} />
        <Chips items={[['Pre-orders now open'], ['Badge on', true]]} />
        <div className="mo-btn">Start production</div>
      </>
    ),
  },
  {
    ic: '🧵', lbl: 'Make the batch', who: 'm', whoT: 'Factory',
    title: 'The factory makes the products',
    lead: 'The factory makes only the approved quantity. The owner can tap to update progress, so Meesho can keep buyers informed.',
    m: ['Cuts, stitches and packs the batch', 'Updates progress with one tap'],
    s: ['Tracks progress against the ready date', 'Tells buyers if the date moves'],
    why: ['Why it matters', 'No stock is made on guesswork, so nothing is left unsold.'], img: imgMaking,
    wa: 'How is the batch going?\n1 · Cutting done\n2 · Stitching done\n3 · Packed and ready',
    reply: { q: ['1 · Cutting done', '2 · Stitching done', '3 · Packed'], r: '2', ack: 'Thanks! Buyers are on track for Thursday.' },
    screen: () => (
      <>
        <h5>Production</h5>
        <span className="sm">Men’s cotton briefs · ready by Thursday</span>
        <div className="mo-pc">
          <div className="mo-prog">
            <div className="ok"><span className="d">✓</span><b>Fabric cut</b><em>Mon</em></div>
            <div className="ok"><span className="d">✓</span><b>Stitching</b><em>Tue</em></div>
            <div className="now"><span className="d" /><b>Packing</b><em>today</em></div>
            <div><span className="d" /><b>Ready</b><em>Thu</em></div>
          </div>
        </div>
        <div className="mo-pc">
          <div className="r"><span>Overall</span><b>About three-quarters done</b></div>
          <div className="mo-bar"><i style={{ width: '72%' }} /></div>
        </div>
        <div className="mo-btn ghost">Update progress</div>
      </>
    ),
  },
  {
    ic: '📣', lbl: 'Mark it ready', who: 'm', whoT: 'Factory',
    title: 'The owner tells the app the batch is made',
    lead: 'When the batch is packed, the owner uploads a few photos, confirms the count and taps “Batch ready”. A truck pickup to the node is booked.',
    m: ['Uploads photos and confirms the final count', 'Taps “Notify Meesho: batch ready”'],
    s: ['Books a truck slot to the Factory Node', 'Checks the photos before pickup'],
    why: ['Why it matters', 'One notification replaces calls, follow-ups and paperwork.'], img: imgBoxes,
    wa: 'Batch ready? Send 3 photos and reply READY.\nPickup booked: tomorrow morning.',
    reply: { q: [], r: '📷 📷 📷  READY', ack: 'Photos look good ✓ Truck booked for tomorrow morning.' },
    screen: () => (
      <>
        <h5>Is your batch ready?</h5>
        <Inp l="Packs made" v="1,200" h="confirmed" />
        <div className="mo-in-f"><label>Photos of the packed batch</label></div>
        <div className="mo-photos"><div>📦</div><div>📦</div><div className="add">＋</div></div>
        <Pc t="Truck pickup" rows={[['To', 'Tiruppur Node'], ['Slot', 'Tomorrow, morning']]} />
        <div className="mo-btn o">Notify Meesho: batch ready</div>
      </>
    ),
  },
  {
    ic: '🚚', lbl: 'Hand over', who: 's', whoT: 'Node',
    title: 'One truck to the Factory Node',
    lead: 'The whole batch goes to the node in one trip. The node counts it, checks quality samples and puts it into stock. From here, the node ships every order.',
    m: ['Loads one truck. That’s it.', 'Sees “received” and “quality passed” in the app'],
    s: ['Node scans, counts and checks samples', 'Lender releases the advance at handover'],
    why: ['Why it matters', 'No packing team, no courier calls, no returns at the factory door.'], img: imgNode,
    wa: 'Received at Tiruppur Node ✓\nQuality check passed ✓\nAdvance sent to your account.',
    reply: { q: [], r: '👍 Thank you', ack: '' },
    screen: () => (
      <>
        <h5>Handover</h5>
        <div className="mo-pc">
          <Chk t="Received at the node" s="All packs scanned and counted" />
          <Chk t="Quality samples passed" s="Batch is now live for shipping" />
          <Chk t="Stock still yours" s="You keep ownership until sold" />
        </div>
        <div className="mo-notif"><b>Advance credited</b> · part of the batch value paid to your account at handover</div>
        <span className="sm">The node now picks, packs and ships each order. Returns come back to the node.</span>
      </>
    ),
  },
  {
    ic: '💰', lbl: 'Get paid', who: 's', whoT: 'Meesho',
    title: 'Payment, and the next requirement',
    lead: 'The advance arrives at handover. The balance follows shortly after the orders are delivered. Then next week’s requirements are already waiting.',
    m: ['Sees each payment in the app', 'Bids again on next week’s list'],
    s: ['Settles the balance after delivery, net of fees', 'Updates the factory’s health score'],
    why: ['Why it matters', 'Cash comes back in days, not the long credit cycles of wholesale.'], img: imgHandover,
    wa: 'Balance paid ✓ Thank you!\nNext week’s requirements are ready.\nReply 1 to see them.',
    reply: { q: ['1 · See next week', '2 · Payment details'], r: '1', ack: 'Here are next week’s requirements →' },
    screen: () => (
      <>
        <h5>Payments</h5>
        <div className="mo-pc">
          <Chk t="Advance at handover" s="Paid" />
          <Chk t="Balance after delivery" s="Paid" />
        </div>
        <Pc t="This batch" rows={[['Packs delivered', 'All shipped by the node'], ['Returns', 'Handled at the node'], ['Health score', 'Good ↑']]} />
        <div className="mo-btn">See next week’s requirements →</div>
      </>
    ),
  },
];

const EXCEPTIONS = [
  ['Bid is above the range', 'The app shows the accepted range. The owner can lower the price and bid again.'],
  ['Can only make part of it', 'Partial bids are fine. The rest of the requirement goes to another factory.'],
  ['Production is running late', 'The owner updates the ready date. Buyers who pre-ordered are told the new date.'],
  ['Quality check fails at the node', 'The batch is held, not shipped. The factory fixes it and sends it again.'],
];

const RESEARCH = [
  ['1', 'Price check', 'Will I make money at the price buyers pay?'],
  ['2', 'Demand', 'Which districts, sizes and price bands sell?'],
  ['3', 'Batch', 'How many to make, and what happens next?'],
  ['4', 'WhatsApp', 'Get the same brief without the app'],
];

function Title({ k, title, children }) {
  return (
    <div className="mo-title">
      <span className="k">{k}</span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

// A: hover or tap a profile field to light up what it drives.
function Profile() {
  const [hover, setHover] = useState(null);
  const [picked, setPicked] = useState(null);
  const active = hover ?? picked;
  const on = active === null ? null : FIELDS[active].u;
  return (
    <section>
      <Title k="A · Onboarding" title="What we ask the manufacturer, and why">
        A one-time factory profile, filled in at a cluster camp or on the phone. It lets Meesho show each factory only the
        requirements it can actually make. Tap any item to see how it is used.
      </Title>
      <div className="mo-profile">
        <div className="mo-col">
          <h4>Factory profile<span>What the owner tells us</span></h4>
          <div className="mo-fields" onMouseLeave={() => setHover(null)}>
            {FIELDS.map((f, i) => (
              <button
                type="button" key={f.t}
                className={`mo-field${active === i ? ' on' : ''}${active !== null && active !== i ? ' dim' : ''}`}
                onMouseOver={() => setHover(i)}
                onClick={() => setPicked(picked === i ? null : i)}
              >
                <span className="ic" aria-hidden>{f.ic}</span>
                <span><b>{f.t}</b><small>{f.s}</small></span>
              </button>
            ))}
          </div>
        </div>
        <div className="mo-flow-ar" aria-hidden>→</div>
        <div className="mo-engine">
          <img src={imgMeesho} alt="" />
          <b>Matching engine</b>
          <span>Combines the profile with Meesho’s demand prediction</span>
          <div className="lst"><i>Buyer demand by district</i><i>Sizes and price band</i><i>Factory capacity</i><i>Nearest node</i></div>
        </div>
        <div className="mo-flow-ar" aria-hidden>→</div>
        <div className="mo-col">
          <h4>What it lets us do<span>So the estimate fits this factory</span></h4>
          <div className="mo-uses">
            {USES.map((u) => {
              const hit = on && on.includes(u.id);
              return (
                <div key={u.id} className={`mo-use${hit ? ' on' : ''}${on && !hit ? ' dim' : ''}`}>
                  <b>{u.t}</b><span>{u.d}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mo-hint">Hover or tap a profile item to highlight what it drives.</div>
    </section>
  );
}

// B: the eight steps, with the app screen, the explanation and the same step on WhatsApp.
function Journey() {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const last = STEPS.length - 1;
  const go = (i) => setCur((i + STEPS.length) % STEPS.length);
  const pick = (i) => { setPlaying(false); go(i); };

  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => setCur((c) => {
      if (c >= last) { setPlaying(false); return c; }
      return c + 1;
    }), 4500);
    return () => clearInterval(t);
  }, [playing, last]);

  // Arrow keys move through the steps while the journey is on screen.
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const box = ref.current?.getBoundingClientRect();
      if (!box || box.bottom < 0 || box.top > window.innerHeight) return;
      if (e.key === 'ArrowRight') { setPlaying(false); setCur((c) => (c + 1) % STEPS.length); }
      else if (e.key === 'ArrowLeft') { setPlaying(false); setCur((c) => (c - 1 + STEPS.length) % STEPS.length); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const s = STEPS[cur];
  const rp = s.reply;
  const play = () => {
    if (playing) { setPlaying(false); return; }
    if (cur === last) setCur(0);
    setPlaying(true);
  };

  return (
    <section>
      <Title k="B · The journey" title="How a manufacturer uses the app, step by step">
        Click a step, use the arrows, or press Play to walk through it like a presentation.
      </Title>
      <div className="mo-journey" ref={ref}>
        <ol className="mo-track">
          <span className="bar" style={{ width: `${(88 * cur) / last}%` }} />
          {STEPS.map((st, i) => (
            <li key={st.lbl} className={i === cur ? 'on' : i < cur ? 'done' : undefined}>
              <button type="button" onClick={() => pick(i)} aria-label={`Step ${i + 1}: ${st.lbl}`}>
                <span className="dot" aria-hidden>{st.ic}</span>
                <span className="lbl">{i + 1}. {st.lbl}</span>
                <span className={`who ${st.who}`}>{st.whoT}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mo-stage">
          <div className="mo-phone" aria-live="polite">
            <div className="mo-scr">
              <div className="mo-sb"><span>9:41</span><span>4G ▮▮▮</span></div>
              <div className="mo-ph"><span className="lg">m</span><div><b>Kavin Knit Mills</b><span>Tiruppur · Hosiery · Factory Direct</span></div></div>
              <div className="mo-pb" key={`scr-${cur}`}>{s.screen()}</div>
            </div>
          </div>
          <div>
            <div className="mo-detail" key={`det-${cur}`}>
              <div>
                <div className="stepno">Step {cur + 1} of {STEPS.length} · {s.whoT}</div>
                <h3>{s.title}</h3>
                <p className="lead">{s.lead}</p>
              </div>
              <div className="mo-roles">
                <div className="mo-role m"><div className="h">🏭 The manufacturer</div><ul>{s.m.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="mo-role s"><div className="h">Ⓜ Meesho and partners</div><ul>{s.s.map((x) => <li key={x}>{x}</li>)}</ul></div>
              </div>
              <div className="mo-why"><img src={s.img} alt="" /><div><b>{s.why[0]}</b><span>{s.why[1]}</span></div></div>
            </div>
            <div className="mo-ctrl" style={{ marginTop: 14 }}>
              <button type="button" onClick={() => pick(cur - 1)} disabled={cur === 0}>← Back</button>
              <button type="button" className="pri" onClick={() => pick(cur + 1)}>{cur === last ? 'Start again ↺' : 'Next →'}</button>
              <button type="button" onClick={play}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
              <span className="kb">Tip: use ← → keys</span>
            </div>
          </div>
          <div className="mo-phone mo-waphone">
            <div className="mo-wacap">Same step on WhatsApp · no app needed</div>
            <div className="mo-scr">
              <div className="mo-sb"><span>9:41</span><span>4G ▮▮▮</span></div>
              <div className="mo-wah"><span className="av">m</span><div><b>Meesho Factory Direct</b><span>Business account · replies instantly</span></div></div>
              <div className="mo-wab" key={`wa-${cur}`}>
                <div className="day">Today</div>
                <div className="in">{s.wa}<i>9:30</i></div>
                {rp.q.length > 0 && <div className="qr">{rp.q.map((q) => <span key={q}>{q}</span>)}</div>}
                <div className="out">{rp.r}<i>9:31 ✓✓</i></div>
                {rp.ack && <div className="in">{rp.ack}<i>9:31</i></div>}
              </div>
              <div className="mo-wain"><span>Type a reply</span><i>➤</i></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MakerIntro() {
  return (
    <div className="mo-in" aria-label="How the manufacturer app works">
      <div className="mo-hero">
        <div>
          <div className="ey">Overview · The manufacturer’s side</div>
          <h2>From an <em>open requirement</em> to <em>money in the bank</em>, in eight steps</h2>
          <p>
            Meesho posts what buyers need. The factory bids on what it can make. Meesho checks the price, approves the bid,
            and the factory makes only that batch, hands it to the Factory Node and gets paid. Everything happens in one
            simple app, or on WhatsApp.
          </p>
        </div>
        <div className="mo-hero-steps">
          <div><b>📋</b>See requirements</div>
          <div><b>✋</b>Place a bid</div>
          <div><b>✅</b>Get approved</div>
          <div><b>💰</b>Make, ship, get paid</div>
        </div>
      </div>

      <Profile />
      <Journey />

      <section>
        <Title k="C · When plans change" title="What the app does if something doesn’t go to plan" />
        <div className="mo-ex">
          {EXCEPTIONS.map(([q, a]) => <div key={q}><div className="q">{q}</div><div className="a">{a}</div></div>)}
        </div>
      </section>

      <section className="mo-res">
        <Title k="D · Research before you bid" title="The manufacturer’s research toolkit">
          Before placing a bid in step 2, the owner can research the requirement: will it pay at Meesho prices, where is the
          demand, and how big a batch makes sense. The tools below are the same screens the factory sees in the app.
        </Title>
        <div className="mo-res-flow">
          {RESEARCH.map(([n, b, small]) => [
            <div className="r" key={b}><span className="n">{n}</span><b>{b}</b><small>{small}</small></div>,
            <div className="ar" aria-hidden key={`${b}-ar`}>→</div>,
          ])}
          <div className="r go"><span className="n">✋</span><b>Place the bid</b><small>With price and quantity already worked out</small></div>
        </div>
        <div className="mo-divider">Research toolkit ↓</div>
      </section>
    </div>
  );
}
