import { useEffect, useRef } from 'react';
import markup from './factoryNode/markup.html?raw';
import { initSiting } from './factoryNode/siting.js';
import { initInventory } from './factoryNode/inventory.js';
import imgFactory from '../assets/overview/factory.webp';
import imgNode from '../assets/overview/node.webp';
import imgBuyer from '../assets/maker/handover.webp';
import imgMap from '../assets/node/india-map.webp';

// Factory Node: shared inventory between factory and node, where a node goes, and the node's inventory screen.
// The sections are plain HTML driven by plain DOM scripts, so the page is rebuilt from the markup on every mount.
const HTML = markup
  .replace('%%IMG_FACTORY%%', imgFactory)
  .replace('%%IMG_NODE%%', imgNode)
  .replace('%%IMG_BUYER%%', imgBuyer)
  .replace('%%IMG_MAP%%', imgMap);

export default function FactoryNode() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // A fresh copy each time, so the scripts never bind twice to the same elements.
    el.innerHTML = HTML;
    initSiting();
    initInventory();

    // In-page links (#sx-h) would otherwise be read as a route by the hash router.
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').startsWith('#/')) return;
      e.preventDefault();
      el.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }, []);

  return <div className="ms" ref={ref} />;
}
