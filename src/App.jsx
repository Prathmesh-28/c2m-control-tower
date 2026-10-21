import { useEffect, useMemo } from 'react';
import { GATE, TEAM } from './config.js';
import { generateMarket } from './lib/generate.js';
import { runPTI } from './lib/pti.js';
import { useRoute, href } from './lib/router.js';
import Overview from './views/Overview.jsx';
import Maker from './views/Maker.jsx';
import FactoryNode from './views/FactoryNode.jsx';
import Prediction from './views/Prediction.jsx';
import diceLogo from './assets/dice-s3-logo.png';

const NAV = [
  { path: 'overview', label: 'Overview', num: 1 },
  { path: 'maker', label: 'Manufacturer app', num: 2 },
  { path: 'node', label: 'Factory Node', num: 3 },
  { path: 'prediction', label: 'Prediction', num: 4 },
];

export default function App() {
  const route = useRoute();

  // The Manufacturer app's price check reads category medians from the (synthetic) market.
  const market = useMemo(() => generateMarket(), []);
  const pti = useMemo(() => runPTI(market, GATE), [market]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const shared = { pti, params: route.params };
  const VIEWS = { overview: Overview, maker: Maker, node: FactoryNode, prediction: Prediction };
  // Old links to removed screens land on the Overview.
  const path = VIEWS[route.path] ? route.path : 'overview';
  const View = VIEWS[path];

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <a className="dice-logo" href={href('overview')} title="Meesho DICE Challenge Season 3 entry">
              <img src={diceLogo} alt="Meesho DICE Challenge Season 3" />
            </a>
            <div>
              <h1>C2M Control Tower</h1>
              <p>{TEAM.entry} · {TEAM.team}</p>
            </div>
          </div>
          <div className="spacer" />
          <span className="sample-pill" title="All sellers, prices and orders are synthetic and seeded. Seller names are fictional.">
            Working prototype · synthetic data
          </span>
        </div>
        <nav className="nav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.path} href={href(n.path)} className={path === n.path ? 'active' : ''}>
              {n.num && <span className="num">{n.num}</span>}
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      {/* Keyed by screen so each one plays its entrance (src/motion.css). */}
      <main key={path} className="m-page">
        <View {...shared} />
      </main>
      <footer className="footer">
        Prototype built for the Meesho DICE Challenge S3 by {TEAM.members}. All sellers, prices,
        orders and demand are synthetic and generated from a fixed seed; seller names are fictional. Every assumption
        lives in <code>src/config.js</code>.
      </footer>
    </>
  );
}
