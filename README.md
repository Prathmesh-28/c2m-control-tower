# C2M Control Tower

Working React prototype of **Factory Direct** for the Meesho DICE Challenge S3 Business Track, in four screens: an overview of the model, the manufacturer's app (from an open requirement to payment, then the price check, demand brief, batch and WhatsApp tools), the Factory Node (shared inventory, where a node goes, and the node's inventory screen), and Meesho's prediction model (the Demand Console and how each manufacturer's share of demand is set). The price check and batch cash use the same model and inputs as the deck (`src/lib/factoryDirect.js`, inputs in `src/config.js`); a test fails if they drift apart.

**Live:** https://meesho-dice-c2m-iitb.vercel.app/
(mirror: https://prathmesh-28.github.io/c2m-control-tower/)

## Deploy

Every push to `main` updates both sites. Each one runs the model tests first, so a failing
model never goes live:

- **Vercel** (`vercel.json`): the Vercel project `meesho-dice-c2m-iitb` is connected to this
  GitHub repo and builds on every push.
- **GitHub Pages** (`.github/workflows/deploy.yml`): the Actions workflow builds and publishes.

To update the live sites, commit and push. There is no backend: the whole model runs in the
browser, so there is nothing else to host.

The page carries a `noindex` tag so search engines skip it until judging is over. Remove the
`robots` meta tag in `index.html` to allow indexing.

## Run

From this folder:

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. For a production build, run `npm run build`. For an offline, single HTML demo, run `npm run build:single` and open `dist-single/index.html`. Run the model checks with `npm test`.

## Demo path

1. **Overview:** what Factory Direct is, in plain words: the problem, the solution map (information and goods flows), what we build, what changes for the factory owner, and who gains. The full deck opens from the bottom of the page.
2. **Manufacturer app:** the eight-step journey from an open requirement to payment, with the app and WhatsApp side by side (press Play or use the ← → keys), what the factory profile is used for, and what happens when plans change. Below it, the research toolkit: at the default ₹80 making cost, *Ship myself* shows **Not yet** (7.2% below the ₹209 buyers pay) and *Factory Node* shows **Qualifies** (8.5%); then view the demand brief and commit this week's batch (469 pre-orders + 15% = 539 packs), and commit with one tap on WhatsApp.
3. **Factory Node:** how stock is split between the factory and the node (four rules: target stock, weekly top-up, emergency pickup, ownership and ageing), where a node goes (India cluster map, cluster scores, and the Tiruppur site comparison), and the node's inventory screen by category, with Today and History.
4. **Prediction:** the data Meesho reads and how next week's demand is predicted, the Demand Console (press **Run** to step through the week; change a rule under ⚙ Rules and every number recalculates), and the four indexes that decide each manufacturer's share of demand.

All sellers, prices, demand, orders, and outcomes are **synthetic, fixed-seed demonstration data**. The model is self-contained in the browser and does not connect to Meesho or WhatsApp. The displayed batch commitment, callback request, and payment are simulations; no external action occurs. Change proposal assumptions in `src/config.js`.

## Deck screenshots

Full-page captures at 2× resolution are in `screenshots/`, numbered in demo order:

| File | Shows |
|---|---|
| `01_overview.png` | The overview (an earlier design; recapture after the redesign) |
| `06_manufacturer_price_check.png` | Price check before listing and the four-route table |
| `07_manufacturer_demand_brief.png` | Top 12 districts and the suggested batch |
| `08_manufacturer_batch_committed.png` | This week's batch, sized from demand, with its dated timeline and cash |
| `09_whatsapp_brief.png` | WhatsApp demand brief, one-tap commit and the node top-up the owner approves |

To recapture after changing the model, rebuild with `npm run build:single` and screenshot each `#/` route.
