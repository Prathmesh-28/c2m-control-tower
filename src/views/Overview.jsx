import { useState } from 'react';
import imgFactory from '../assets/overview/factory.webp';
import imgFactoryBig from '../assets/overview/factory-big.webp';
import imgNode from '../assets/overview/node.webp';
import imgNodePacking from '../assets/overview/node-packing.webp';
import imgBuyer from '../assets/overview/buyer.webp';
import imgWholesaler from '../assets/overview/wholesaler.webp';
import imgReseller from '../assets/overview/reseller.webp';
import imgOwner from '../assets/overview/owner-thinking.webp';
import imgMeesho from '../assets/overview/meesho.webp';
import imgMeeshoGain from '../assets/overview/meesho-gain.webp';
import imgScreenPrice from '../assets/overview/screen-price.webp';
import imgScreenDemand from '../assets/overview/screen-demand.webp';
import imgScreenBatch from '../assets/overview/screen-batch.webp';
import imgQuoteMill from '../assets/overview/quote-mill.webp';
import imgQuoteMaker from '../assets/overview/quote-maker.webp';
import imgQuoteOwner from '../assets/overview/quote-owner.webp';

// The Round 2 deck, served from public/ so it ships with every build.
const DECK = `${import.meta.env.BASE_URL}factory-direct-deck.pdf`;

// Story-led overview: what Factory Direct is, in plain words and pictures. The numbers live on the other screens.

const CHAIN = [
  [imgFactory, 'Factory', '+ mark-up'],
  [imgWholesaler, 'Wholesaler', '+ mark-up'],
  [imgReseller, 'Reseller', '+ margin'],
  [imgBuyer, 'Buyer'],
];

const STEPS = [
  ['p', 'Buyers shop', 'Searches, orders and pre-orders show what people want.'],
  ['p', 'Meesho predicts', 'A weekly estimate per product, district and size.'],
  ['p', 'Factory sees it', 'On the app or WhatsApp. One tap commits a batch.'],
  ['o', 'Make the batch', 'Only confirmed orders plus a small buffer.'],
  ['o', 'One truck', 'The batch goes in bulk to the Factory Node.'],
  ['o', 'Node packs', 'Each order picked, packed and checked. Returns end here.'],
  ['o', 'Valmo delivers', 'To the buyer’s door. The factory is paid soon after.'],
];

const CHANGES = [
  ['Pack and ship every order yourself', 'The node packs and ships'],
  ['Returns come back to your door', 'Returns end at the node'],
  ['Build stock and hope it sells', 'Make only what buyers pre-ordered'],
  ['No idea what will sell, or where', 'A weekly demand estimate'],
  ['Wait a long time for your money', 'Paid soon after delivery, part in advance'],
  ['Ranked alongside resellers', '“Sold by the manufacturer” badge'],
];

const QUOTES = [
  [imgQuoteMill, '“Make it only after it’s paid, and my looms are in.”', 'Textile mill owner'],
  [imgQuoteMaker, '“If someone else packs and takes returns, I’ll try it next month.”', 'Small home-products maker'],
  [imgQuoteOwner, '“Sold before I cut fabric. It feels like B2B again.”', 'How we want owners to describe it'],
];

const GAINS = [
  [imgBuyer, 'Buyer', 'Lower price, known maker', 'Pays less for the same product and knows it came straight from the factory.'],
  [imgFactory, 'Factory', 'New channel, no new team', 'Fills idle capacity and keeps the margin the middlemen took, with no packing staff or dead stock.'],
  [imgMeeshoGain, 'Meesho', 'Lower prices that last', 'Prices fall because costs fall, so they hold without discounts. Prepaid orders also fail delivery less.'],
];

function SecTitle({ k, title, children }) {
  return (
    <div className="fd-sec-title">
      <span className="k">{k}</span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

// Four players, two flows: information (plum, dashed) and goods (orange).
function SolutionMap() {
  return (
    <svg className="fd-map" viewBox="0 0 1180 590" role="img" aria-label="Factory Direct system diagram">
      <defs>
        <marker id="ah-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#f28c28" /></marker>
        <marker id="ah-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7b2a64" /></marker>
        <filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#5a1646" floodOpacity=".12" /></filter>
      </defs>

      {/* Meesho platform band */}
      <rect x="250" y="16" width="680" height="150" rx="18" fill="#5a1646" />
      <image href={imgMeesho} x="270" y="30" width="110" height="122" preserveAspectRatio="xMidYMid meet" />
      <text x="398" y="56" className="m-k">MEESHO PLATFORM</text>
      <text x="398" y="86" className="m-t">Reads demand, predicts it, tells the factory</text>
      <g className="m-chip"><rect x="398" y="104" width="160" height="40" rx="10" /><text x="478" y="129">② Predict demand</text></g>
      <g className="m-chip"><rect x="568" y="104" width="160" height="40" rx="10" /><text x="648" y="129">Price check</text></g>
      <g className="m-chip"><rect x="738" y="104" width="172" height="40" rx="10" /><text x="824" y="129">Health score</text></g>

      {/* information arrows */}
      <path d="M 1010 352 C 1010 250, 1000 150, 940 110" className="ln-p" markerEnd="url(#ah-p)" />
      <g className="tag-p"><rect x="958" y="190" width="200" height="50" rx="10" /><text x="1058" y="211">① Buyers search,</text><text x="1058" y="230">order &amp; pre-order</text></g>

      <path d="M 260 110 C 190 140, 170 230, 170 352" className="ln-p" markerEnd="url(#ah-p)" />
      <g className="tag-p"><rect x="22" y="184" width="210" height="50" rx="10" /><text x="127" y="205">③ Demand estimate</text><text x="127" y="224">on app or WhatsApp</text></g>

      <path d="M 265 352 C 290 270, 310 215, 340 170" className="ln-p thin" markerEnd="url(#ah-p)" />
      <g className="tag-p lite"><rect x="262" y="250" width="160" height="46" rx="10" /><text x="342" y="269">One tap commits</text><text x="342" y="287">the batch</text></g>

      {/* actor cards */}
      <g filter="url(#sh)">
        <rect x="40" y="356" width="290" height="210" rx="16" className="card" />
        <rect x="445" y="356" width="290" height="210" rx="16" className="card" />
        <rect x="850" y="356" width="290" height="210" rx="16" className="card" />
      </g>
      <rect x="40" y="356" width="290" height="6" rx="3" fill="#f28c28" />
      <rect x="445" y="356" width="290" height="6" rx="3" fill="#f28c28" />
      <rect x="850" y="356" width="290" height="6" rx="3" fill="#7b2a64" />
      <image href={imgFactoryBig} x="70" y="372" width="230" height="120" preserveAspectRatio="xMidYMid meet" />
      <image href={imgNode} x="465" y="380" width="250" height="110" preserveAspectRatio="xMidYMid meet" />
      <image href={imgBuyer} x="935" y="370" width="120" height="124" preserveAspectRatio="xMidYMid meet" />
      <text x="185" y="520" className="a-t">Factory</text><text x="185" y="545" className="a-s">④ Makes only what’s ordered</text>
      <text x="590" y="520" className="a-t">Factory Node</text><text x="590" y="545" className="a-s">⑥ Stores, packs, takes returns</text>
      <text x="995" y="520" className="a-t">Buyer</text><text x="995" y="545" className="a-s">Gets the factory price</text>

      {/* goods arrows */}
      <path d="M 335 432 L 438 432" className="ln-o" markerEnd="url(#ah-o)" />
      <text x="387" y="414" className="g-l">⑤ One truck</text>
      <path d="M 740 432 L 843 432" className="ln-o" markerEnd="url(#ah-o)" />
      <text x="792" y="414" className="g-l">⑦ Valmo</text>
      <path d="M 843 478 L 740 478" className="ln-o dash" markerEnd="url(#ah-o)" />
      <text x="792" y="500" className="g-l sm">returns</text>

      {/* legend */}
      <g className="leg">
        <line x1="40" y1="30" x2="80" y2="30" className="ln-o" /><text x="88" y="35">Goods</text>
        <line x1="40" y1="58" x2="80" y2="58" className="ln-p" /><text x="88" y="63">Information</text>
      </g>
    </svg>
  );
}

export default function Overview() {
  const [showDeck, setShowDeck] = useState(false);

  return (
    <div className="fd-wrap">
      {/* Hero */}
      <section className="fd-hero">
        <div>
          <div className="eyebrow" style={{ color: '#f7c08a' }}>Factory Direct · Meesho DICE S3 · Round 2</div>
          <h2>Let buyers shop <em>straight from the factory</em>, without the factory having to become an online shop.</h2>
          <p>
            Meesho tells the factory what will sell. The factory makes only that. A shared Factory Node near the factory packs,
            ships and handles returns. The buyer gets the factory’s price, because the middlemen and the waste are gone, not
            because anyone pays a discount.
          </p>
        </div>
        <div className="fd-hero-art" aria-label="Factory, then Factory Node, then buyer">
          <figure><img src={imgFactory} alt="Factory" /><figcaption>Factory<span>makes what’s ordered</span></figcaption></figure>
          <div className="ar" aria-hidden>→</div>
          <figure><img src={imgNode} alt="Factory Node warehouse" /><figcaption>Factory Node<span>packs and ships</span></figcaption></figure>
          <div className="ar" aria-hidden>→</div>
          <figure><img src={imgBuyer} alt="Buyer shopping on her phone" /><figcaption>Buyer<span>pays the factory price</span></figcaption></figure>
        </div>
      </section>

      {/* 1. Problem */}
      <section>
        <SecTitle k="1 · The problem" title="Cheap factories stay offline, so buyers pay for the middlemen" />
        <div className="fd-problem">
          <div className="fd-panel">
            <h4>How a product reaches the buyer today</h4>
            <div className="sub">The factory sells in bulk to a wholesaler. The goods change hands again before anyone orders them online.</div>
            <div className="fd-chain">
              {CHAIN.map(([img, label, cut]) => [
                <figure key={label}><img src={img} alt="" /><figcaption>{label}</figcaption></figure>,
                cut && <div className="lnk" key={`${label}-cut`}><b>→</b><span>{cut}</span></div>,
              ])}
            </div>
            <div className="fd-verdict">
              <b>The result:</b> each layer adds its cut, the same product shows up at several prices, and the buyer can’t tell who
              actually made it. Meesho can’t lower prices for good while the makers sit behind this chain.
            </div>
          </div>
          <div className="fd-panel">
            <h4>Why the factory won’t sell online itself</h4>
            <div className="sub">What owners told us in interviews. Every one of these is an operations problem, not a price problem.</div>
            <div className="fd-fears">
              <div className="fd-bubble">Who will pack every single order?</div>
              <div className="fd-bubble">Who takes back the returns?</div>
              <img src={imgOwner} alt="A factory owner thinking" />
              <div className="fd-bubble">What if the stock doesn’t sell?</div>
              <div className="fd-bubble">Will online even give me volume?</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Solution */}
      <section>
        <SecTitle k="2 · Our solution" title="Factory Direct: make online selling feel like a bulk B2B order">
          Four players, two flows. <b style={{ color: 'var(--plum)' }}>Information</b> flows up to Meesho and down to the factory, so it
          knows what to make. <b style={{ color: '#b45f06' }}>Goods</b> flow from the factory, through the node, to the buyer.
        </SecTitle>
        <div className="fd-sol">
          <SolutionMap />
          <ol className="fd-steps">
            {STEPS.map(([lane, t, d], i) => (
              <li key={t}><span className={`n ${lane}`}>{i + 1}</span><div><b>{t}</b><span>{d}</span></div></li>
            ))}
          </ol>
          <div className="fd-sol-foot">
            <div className="fd-loop">
              <span className="ic" aria-hidden>↺</span>
              <div><b>It learns every week.</b> Every order, review and return feeds back into the prediction, so next week’s estimate is sharper.</div>
            </div>
            <div className="fd-own">
              <div><b>Meesho</b><span>owns the data</span></div>
              <div><b>Factory</b><span>owns the stock</span></div>
              <div><b>Node</b><span>owns the parcel</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What we build */}
      <section>
        <SecTitle k="3 · What we build" title="Three pieces that make it work" />
        <div className="fd-build">
          <div className="fd-piece">
            <div className="tag">For the factory owner</div>
            <h4>Manufacturer app</h4>
            <p>Built for owners who run their business on phone calls and WhatsApp. It answers their three questions before they make anything.</p>
            <div className="fd-screens">
              <figure><img src={imgScreenPrice} alt="Price check screen" /><figcaption>Will I make money?</figcaption></figure>
              <figure><img src={imgScreenDemand} alt="Demand estimate screen" /><figcaption>What sells, where?</figcaption></figure>
              <figure><img src={imgScreenBatch} alt="Batch commit screen" /><figcaption>Commit the batch</figcaption></figure>
            </div>
            <ul>
              <li>Price check: is my cost low enough to qualify as factory-direct?</li>
              <li>Demand estimate by district, size and price, refreshed weekly</li>
              <li>Same brief on WhatsApp: reply once to commit, no app or login</li>
            </ul>
          </div>
          <div className="fd-piece">
            <div className="tag">For the factory’s goods</div>
            <h4>Factory Node</h4>
            <div className="art"><img src={imgNodePacking} alt="Workers packing orders at the Factory Node" /></div>
            <p>A shared warehouse near each factory cluster, run by a Meesho partner. Factories drop stock in bulk; the node does the online work.</p>
            <ul>
              <li>Stores the factory’s stock; the factory keeps ownership</li>
              <li>Picks, packs and ships each single order</li>
              <li>Returns come back here, not to the factory</li>
            </ul>
          </div>
          <div className="fd-piece">
            <div className="tag">Meesho’s side</div>
            <h4>Demand prediction</h4>
            <p>Meesho already sees what its buyers want. We turn that into a weekly brief the factory can make a batch from.</p>
            <div className="fd-pred">
              <div className="in">{['Searches', 'Carts', 'Orders', 'Returns', 'Past sales'].map((x) => <span key={x}>{x}</span>)}</div>
              <div className="dn" aria-hidden>↓</div>
              <div className="model"><img src={imgMeesho} alt="" /><div><b>Demand model</b><span>Added up by product, district and size, every week</span></div></div>
              <div className="dn" aria-hidden>↓</div>
              <div className="outp"><b>Demand brief</b><span>Where it sells · which sizes · how many · at what price</span></div>
            </div>
            <ul>
              <li>District totals only: no buyer can be identified</li>
              <li>Pre-orders confirm the estimate before anything is made</li>
            </ul>
          </div>
        </div>
        <div className="fd-brain">
          <div className="lead"><b>Behind all three: Meesho’s engine</b><span>Rules and data, not account managers</span></div>
          <div className="cell"><b>Price check</b><span>Picks factories that are really cheaper, not just big.</span></div>
          <div className="cell"><b>Demand estimate</b><span>Tells each factory what to make, every week.</span></div>
          <div className="cell"><b>Health score</b><span>Watches each seller daily and fixes problems automatically.</span></div>
        </div>
      </section>

      {/* 4. Before / after */}
      <section>
        <SecTitle k="4 · What changes" title="For the factory owner, every fear has a fix" />
        <div className="fd-ba">
          <div className="fd-table" role="table">
            <div className="r h" role="row"><div>Selling online today</div><div className="mid" /><div>With Factory Direct</div></div>
            {CHANGES.map(([before, after]) => (
              <div className="r" role="row" key={before}>
                <div className="old">{before}</div>
                <div className="mid">→</div>
                <div className="new"><b>{after}</b></div>
              </div>
            ))}
          </div>
          <div className="fd-quotes">
            {QUOTES.map(([img, quote, who]) => (
              <div className="fd-q" key={who}>
                <img src={img} alt="" />
                <blockquote>{quote}<cite>{who}</cite></blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Gains */}
      <section>
        <SecTitle k="5 · Who gains" title="Everyone wins, and nobody is subsidised" />
        <div className="fd-gains">
          {GAINS.map(([img, who, head, d]) => (
            <div className="fd-gain" key={who}>
              <img src={img} alt="" />
              <div><div className="who">{who}</div><b>{head}</b><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* The deck */}
      <section className="card">
        <div className="card-head">
          <div>
            <h3>The full deck</h3>
            <div className="sub">Research, personas, solution, KPIs, benchmarks, finance and road map, with all the numbers</div>
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn primary" type="button" onClick={() => setShowDeck((v) => !v)}>{showDeck ? 'Hide deck' : 'View deck here'}</button>
            <a className="btn" href={DECK} download="Factory-Direct-Meesho-DICE-S3.pdf" style={{ textDecoration: 'none' }}>Download</a>
          </div>
        </div>
        {showDeck ? (
          <iframe className="ov-deck" src={DECK} title="Factory Direct deck (PDF)" />
        ) : (
          <p className="ink2" style={{ fontSize: 13 }}>The PDF is large, so it loads only when you ask for it.</p>
        )}
      </section>

      <div className="note-box">The prototype runs on synthetic sellers, prices and orders; Kavin Knit Mills is fictional. The same rules would run unchanged on Meesho’s real data.</div>
    </div>
  );
}
