// Static data: segments, products, clusters, Factory Nodes, districts.
// Loaded as a classic script: top-level names are shared with the other files.
// Load order is set in index.html.

/* =====================================================================
   DATA: categories, clusters, nodes, cost model (ported from the team's
   prototype: src/config.js + src/lib/factoryDirect.js)
   ===================================================================== */
const CATS = [
  { id: 'hosiery', name: 'Hosiery & innerwear', clusters: 'Tiruppur · Ludhiana', ret: 0.08, rto: 0.14, perDay: 1.6, unit: 'pack',
    axes: { Size: ['S','M','L','XL','XXL'], Colour: ['Dark mix','Light mix','Black','Navy'] },
    types: [ { id: 'briefs3', name: "Men's cotton briefs, pack of 3", ref: 249 }, { id: 'socks5', name: 'Ankle socks, pack of 5', ref: 199 }, { id: 'vests2', name: 'Cotton vests, pack of 2', ref: 269 }, { id: 'leggings', name: "Women's cotton leggings", ref: 229 } ] },
  { id: 'hometex', name: 'Home textiles', clusters: 'Panipat · Solapur', ret: 0.05, rto: 0.13, perDay: 1.2, unit: 'piece',
    axes: { Size: ['Single','Double','King'], Colour: ['Floral','Geometric','Solid','Kids print'] },
    types: [ { id: 'bedsheet', name: 'Double bedsheet + 2 pillow covers', ref: 379 }, { id: 'bathtowel', name: 'Cotton bath towel', ref: 229 }, { id: 'handtowel4', name: 'Hand towels, pack of 4', ref: 199 }, { id: 'chaddar', name: 'Solapur chaddar, single', ref: 259 } ] },
  { id: 'dressmat', name: 'Saree & dress material', clusters: 'Erode · Bhiwandi', ret: 0.12, rto: 0.18, perDay: 1.0, unit: 'piece',
    axes: { Fabric: ['Cotton','Cotton blend','Synthetic'], Colour: ['Pastel','Bright','Dark','Printed'] },
    types: [ { id: 'dm3', name: 'Cotton dress material, 3-piece', ref: 449 }, { id: 'sareesyn', name: 'Printed synthetic saree', ref: 389 }, { id: 'sareecot', name: 'Cotton saree with blouse piece', ref: 549 } ] },
  { id: 'plastics', name: 'Plastic housewares', clusters: 'Rajkot · Daman', ret: 0.04, rto: 0.12, perDay: 1.4, unit: 'set',
    axes: { Size: ['Small','Medium','Large'], Colour: ['Transparent','Blue','Red','Green'] },
    types: [ { id: 'cont6', name: 'Kitchen containers, set of 6', ref: 259 }, { id: 'bucket', name: 'Bucket with mug, 20 L', ref: 219 }, { id: 'rack', name: 'Kitchen storage rack, 3-tier', ref: 329 } ] },
  { id: 'jewellery', name: 'Imitation jewellery', clusters: 'Rajkot · Coimbatore', ret: 0.10, rto: 0.17, perDay: 1.3, unit: 'set',
    axes: { Finish: ['Gold-tone','Oxidised','Kundan','Pearl'], Occasion: ['Daily wear','Festive','Bridal'] },
    types: [ { id: 'necklace', name: 'Necklace set with earrings', ref: 229 }, { id: 'earrings3', name: 'Earrings, pack of 3', ref: 149 }, { id: 'bangles', name: 'Bangle set', ref: 179 } ] },
  { id: 'steel', name: 'Steel kitchenware', clusters: 'Jagadhri · Wazirpur', ret: 0.04, rto: 0.12, perDay: 0.9, unit: 'set',
    axes: { Size: ['Small','Medium','Large'], Finish: ['Mirror','Matt','Hammered'] },
    types: [ { id: 'patila3', name: 'Steel patila, set of 3', ref: 449 }, { id: 'tumbler6', name: 'Steel tumblers, set of 6', ref: 279 }, { id: 'kadai', name: 'Steel kadai with lid', ref: 399 } ] },
  { id: 'footwear', name: 'Basic footwear', clusters: 'Agra · Bahadurgarh', ret: 0.16, rto: 0.19, perDay: 1.1, unit: 'pair',
    axes: { Size: ['UK 6','UK 7','UK 8','UK 9','UK 10'], Colour: ['Black','Brown','Navy','Grey'] },
    types: [ { id: 'eva', name: 'EVA flip-flops', ref: 199 }, { id: 'pusandal', name: 'PU sandals', ref: 299 }, { id: 'school', name: "Kids' school shoes", ref: 349 } ] },
  { id: 'brass', name: 'Brass décor', clusters: 'Moradabad', ret: 0.07, rto: 0.15, perDay: 0.7, unit: 'piece',
    axes: { Size: ['Small','Medium','Large'], Finish: ['Antique','Polished','Enamel'] },
    types: [ { id: 'diya2', name: 'Brass diya, pair', ref: 299 }, { id: 'urli', name: 'Decorative urli bowl', ref: 549 }, { id: 'hanging', name: 'Brass wall hanging', ref: 399 } ] },
  { id: 'bags', name: 'Bags & school bags', clusters: 'Nangloi · Kolkata', ret: 0.09, rto: 0.15, perDay: 1.0, unit: 'piece',
    axes: { Capacity: ['15 L','25 L','35 L'], Colour: ['Black','Navy','Grey','Printed'] },
    types: [ { id: 'schoolbag', name: 'School backpack', ref: 399 }, { id: 'tote', name: 'Canvas tote bag', ref: 249 }, { id: 'laptopbag', name: 'Laptop backpack', ref: 499 } ] },
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const TYPE = Object.fromEntries(CATS.flatMap(c => c.types.map(t => [t.id, { ...t, cat: c.id }])));
// What buyers actually paid on meesho.com (team teardown, 2 Oct 2026).
const TEARDOWN = { briefs3: 209, socks5: 128, bedsheet: 325, bathtowel: 227, tumbler6: 262 };

const STATES = {
  'Tamil Nadu': { code: '33', cities: ['Tiruppur','Erode','Coimbatore','Salem','Madurai'] },
  'Haryana': { code: '06', cities: ['Panipat','Jagadhri','Bahadurgarh','Faridabad'] },
  'Punjab': { code: '03', cities: ['Ludhiana','Amritsar','Jalandhar'] },
  'Gujarat': { code: '24', cities: ['Rajkot','Surat','Ahmedabad','Morbi'] },
  'Maharashtra': { code: '27', cities: ['Bhiwandi','Solapur','Mumbai','Ichalkaranji'] },
  'Uttar Pradesh': { code: '09', cities: ['Agra','Moradabad','Kanpur','Varanasi'] },
  'Delhi': { code: '07', cities: ['Nangloi','Wazirpur','Okhla'] },
  'West Bengal': { code: '19', cities: ['Kolkata','Howrah','Asansol'] },
  'Dadra & Nagar Haveli and Daman & Diu': { code: '26', cities: ['Daman','Silvassa'] },
  'Karnataka': { code: '29', cities: ['Bengaluru','Hubballi'] },
};
// Factory Node per cluster: wave from the team's AHP cluster score.
const NODE_OF = {
  Tiruppur: ['Tiruppur Factory Node', 'Live', 8], Erode: ['Tiruppur Factory Node', 'Live', 52], Coimbatore: ['Tiruppur Factory Node', 'Live', 48],
  Salem: ['Tiruppur Factory Node', 'Live', 110], Madurai: ['Tiruppur Factory Node', 'Live', 190],
  Panipat: ['Panipat Factory Node', 'Live', 6], Jagadhri: ['Panipat Factory Node', 'Live', 120], Bahadurgarh: ['Panipat Factory Node', 'Live', 72], Faridabad: ['Panipat Factory Node', 'Live', 115],
  Ludhiana: ['Ludhiana Factory Node', 'Wave 2', 9], Amritsar: ['Ludhiana Factory Node', 'Wave 2', 140], Jalandhar: ['Ludhiana Factory Node', 'Wave 2', 60],
  Rajkot: ['Rajkot Factory Node', 'Wave 2', 7], Morbi: ['Rajkot Factory Node', 'Wave 2', 65], Surat: ['Rajkot Factory Node', 'Wave 2', 380], Ahmedabad: ['Rajkot Factory Node', 'Wave 2', 215],
  Bhiwandi: ['Bhiwandi Factory Node', 'Wave 3', 6], Mumbai: ['Bhiwandi Factory Node', 'Wave 3', 32], Solapur: ['Solapur Factory Node', 'Wave 3', 8], Ichalkaranji: ['Solapur Factory Node', 'Wave 3', 230],
  Agra: ['Agra Factory Node', 'Wave 3', 10], Moradabad: ['Moradabad Factory Node', 'Wave 3', 7], Kanpur: ['Agra Factory Node', 'Wave 3', 280], Varanasi: ['Agra Factory Node', 'Wave 3', 600],
  Nangloi: ['Panipat Factory Node', 'Live', 85], Wazirpur: ['Panipat Factory Node', 'Live', 80], Okhla: ['Panipat Factory Node', 'Live', 105],
  Kolkata: ['Kolkata Factory Node', 'Wave 3', 12], Howrah: ['Kolkata Factory Node', 'Wave 3', 8], Asansol: ['Kolkata Factory Node', 'Wave 3', 210],
  Daman: ['Daman Factory Node', 'Wave 3', 5], Silvassa: ['Daman Factory Node', 'Wave 3', 28],
  Bengaluru: ['Tiruppur Factory Node', 'Live', 330], Hubballi: ['Tiruppur Factory Node', 'Live', 650],
};
const DISTRICTS = [
  ['Lucknow','226',1.0],['Kanpur','208',0.8],['Varanasi','221',0.7],['Gorakhpur','273',0.75],['Prayagraj','211',0.7],['Bareilly','243',0.55],
  ['Meerut','250',0.55],['Patna','800',0.95],['Gaya','823',0.5],['Muzaffarpur','842',0.6],['Ranchi','834',0.6],['Indore','452',0.7],
  ['Jabalpur','482',0.5],['Jaipur','302',0.8],['Jodhpur','342',0.5],['Nagpur','440',0.6],['Nashik','422',0.5],['Raipur','492',0.55],
  ['Bhubaneswar','751',0.55],['Guwahati','781',0.6],['Madurai','625',0.5],['Vijayawada','520',0.5],['Dehradun','248',0.4],['Amritsar','143',0.45],
];
const LEVERS = [
  ['raw', 'Own raw material', 'Yarn, granules or sheet bought or made in-house'],
  ['make', 'Production in-house', 'Knitting, moulding, weaving or forging on your floor'],
  ['scale', 'Runs of 500+ units', 'You already make in large batches'],
  ['auto', 'Automated lines', 'Machines do most of the work, not hand labour'],
];
const CHANNELS = ['Wholesalers', 'Distributors', 'Export buyers', 'Brand job-work', 'Meesho', 'Other online', 'Local shops'];
const LANGS = ['English', 'हिन्दी', 'தமிழ்', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'मराठी', 'বাংলা', 'తెలుగు'];
