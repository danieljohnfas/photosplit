const fs = require('fs');

const JS_FILE = 'js/amazon-products.js';
const RAINFOREST_API_KEY = '27B62A167713461DBA9D2C7423CE8BF8';

const SEARCH_TERMS = [
  'photo scanner',
  'external hard drive 2tb',
  'sd card 128gb',
  'digital photo frame',
  'film scanner',
  'photo album',
  'portable ssd',
  'usb flash drive',
  'camera cleaning kit'
];

async function run() {
  console.log('Starting daily product rotation job...');

  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  console.log(`Selected search term: "${term}"`);

  const rfUrl = `https://api.rainforestapi.com/request?api_key=${RAINFOREST_API_KEY}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(term)}`;
  
  let data;
  try {
    const response = await fetch(rfUrl);
    data = await response.json();
  } catch (error) {
    console.error('❌ Error fetching from Rainforest API:', error);
    process.exit(1);
  }

  if (!data || !data.search_results || data.search_results.length === 0) {
    console.error('❌ No search results found or API error.');
    process.exit(1);
  }

  const results = data.search_results;
  console.log(`Fetched ${results.length} products from Rainforest API.`);

  // Create the new AMAZON_PRODUCTS array (up to 50 products)
  const newProducts = [];
  for (let i = 0; i < Math.min(results.length, 50); i++) {
    const p = results[i];
    if (!p.asin || !p.title || !p.image) continue;
    
    // Assign random badges to some
    const badges = ['Top Pick', 'Storage', 'Essential', 'Pro Choice', 'Deal', 'Popular'];
    const badge = badges[Math.floor(Math.random() * badges.length)];
    const btnClass = Math.random() > 0.5 ? 'btn-primary' : 'btn-secondary';
    
    // Default description based on price and rating
    const price = p.price ? p.price.raw : '';
    const rating = p.rating ? `${p.rating} ⭐` : '';
    const desc = `${rating} ${price}. Get the best gear for your photography workflow.`.trim();

    newProducts.push({
      asin: p.asin,
      title: p.title.length > 50 ? p.title.substring(0, 47) + '...' : p.title,
      desc: desc,
      badge: badge,
      btnClass: btnClass,
      img: p.image
    });
  }

  // Inject pCloud products
  const pCloudProducts = [
    {
      asin: "https://www.pcloud.com/",
      title: "pCloud - Secure Cloud Storage",
      desc: "Swiss data protection. Store, share and access all your files.",
      badge: "Storage",
      btnClass: "btn-primary",
      img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/home.png"
    },
    {
      asin: "https://www.pcloud.com/family",
      title: "pCloud Family Plan",
      desc: "Share up to 2TB with up to 5 family members. Lifetime access.",
      badge: "Family",
      btnClass: "btn-secondary",
      img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/family.png"
    },
    {
      asin: "https://www.pcloud.com/crypto",
      title: "pCloud Crypto",
      desc: "Unbreakable client-side encryption for your most sensitive files.",
      badge: "Security",
      btnClass: "btn-secondary",
      img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/crypto.png"
    }
  ];
  newProducts.unshift(...pCloudProducts);
  if (newProducts.length < 10) {
    console.error('❌ Not enough valid products found.');
    process.exit(1);
  }

  console.log(`Generated ${newProducts.length} formatted products.`);

  // Read existing file
  const content = fs.readFileSync(JS_FILE, 'utf8');
  
  // Extract the AMAZON_PRODUCTS array using regex
  const match = content.match(/let AMAZON_PRODUCTS = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find AMAZON_PRODUCTS array in ' + JS_FILE);
    process.exit(1);
  }

  // Rewrite the file
  const newArrayString = JSON.stringify(newProducts, null, 2)
    .replace(/"([^"]+)":/g, '$1:'); // Remove quotes from keys

  const newContent = content.replace(match[1], newArrayString);
  fs.writeFileSync(JS_FILE, newContent, 'utf8');
  console.log(`Successfully updated ${JS_FILE} with 50 new products!`);
}

run();
