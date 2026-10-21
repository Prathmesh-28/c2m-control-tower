import { useEffect, useRef } from 'react';
import markup from './prediction/markup.html?raw';
import { initConsole } from './prediction/console.js';
import { initIndexes } from './prediction/indexes.js';
import imgBuyer from '../assets/overview/buyer.webp';
import imgMeesho from '../assets/overview/meesho.webp';
import imgFactory from '../assets/overview/factory.webp';

// Prediction model: what Meesho reads, the Demand Console, and how each manufacturer's share of demand is set.
// Plain HTML driven by plain DOM scripts, rebuilt from the markup on every mount (as in FactoryNode.jsx).
const HTML = markup
  .replace('%%IMG_BUYER%%', imgBuyer)
  .replace('%%IMG_MEESHO%%', imgMeesho)
  .replace('%%IMG_FACTORY%%', imgFactory);

export default function Prediction() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // A fresh copy each time, so the scripts never bind twice to the same elements.
    el.innerHTML = HTML;
    initConsole(); // publishes window.MC and window.mcGo, which initIndexes reads
    initIndexes();
    return () => {
      el.innerHTML = '';
      delete window.MC;
      delete window.mcGo;
    };
  }, []);

  return <div className="ms" ref={ref} />;
}
