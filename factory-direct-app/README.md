# Factory Direct: manufacturer app

Clickable prototype of the manufacturer side of Meesho C2M (DICE S3 Business Track, Team 23B0747, IIT Bombay).
A factory registers, sees Meesho's demand forecast, bids a price range, gets approved or a counter-offer,
then runs the batch: buyers prepay, it makes the batch, hands it over at the Factory Node and gets paid.

Plain HTML, CSS and JavaScript. No build step, no installs, no backend.

## Run it

- **Quickest:** double-click `index.html` to open it in Chrome or Edge.
- **With live reload in VS Code:** install the *Live Server* extension (VS Code will suggest it), then
  right-click `index.html` → **Open with Live Server**. The page reloads every time you save.

Progress is saved in the browser (localStorage). To start over, go to **Profile → Sign out and restart**,
or clear the site data.

## Files

| File | What to edit there |
|---|---|
| `index.html` | Page shell and the order the scripts load in |
| `css/styles.css` | All styling. Colours and fonts are the tokens at the top (`:root`), with dark-mode values below them |
| `js/data.js` | Segments, products, reference prices, states and clusters, Factory Node per cluster, districts, cost levers, languages |
| `js/cost-model.js` | Assumptions (`FD`: fees, margin, buffer, advance) and the cost-per-pack and batch-cash maths. Same model as the Control Tower prototype |
| `js/forecast.js` | Seeded random numbers, dates, and `demandFor()`: Meesho's forecast of quantity, price band and size split |
| `js/state.js` | App state, saving, small helpers (`inr`, `nfmt`, `pct`) |
| `js/icons.js` | SVG icons |
| `js/rules.js` | Form validation, the sample factory, verification checks, how Meesho approves a bid (`decide()`), batch stages |
| `js/views/core.js` | Render loop, welcome screen, the 7 registration steps, verification screen |
| `js/views/main.js` | Home, Demand, bid form, Bids, Batches, Profile |
| `js/views/sheets.js` | Pop-ups: state, cluster, language, notifications, add product |
| `js/events.js` | Every button action (`ACT`), input handling, photo upload, first render |

## How the pieces connect

- The files are classic `<script>` tags, not modules, so a name defined in one file (e.g. `FD` or `inr`)
  is available in the files loaded after it. Keep the load order in `index.html`.
- Screens are functions that return HTML strings (`vHome()`, `vBidForm()`, ...). `render()` redraws the app from
  the state object `S`.
- A button runs an action through its `data-act` attribute: `<button data-act="submitBid" data-arg="...">`
  calls `ACT.submitBid(arg)` in `events.js`. To add a button, add the attribute and a matching function in `ACT`.
- Text fields bind to state with `data-bind="profile.firm"`.

## Common edits

- **Change the price gate (8%)** → `FD.gate` in `cost-model.js`
- **Change node fee, delivery fee, return fee** → `FD.fees`, `FD.returnFee`
- **Change the 30% advance or the +15% buffer** → `FD.advance`, `FD.buffer`
- **Add a product** → the `types` list of its segment in `data.js`
- **Use a real meesho.com price** → `TEARDOWN` in `data.js`
- **Change how Meesho approves bids** → `decide()` in `rules.js`
- **Change the forecast** → `demandFor()` in `forecast.js`

All sellers, demand and payouts are sample data. Nothing typed in the app is sent anywhere.
