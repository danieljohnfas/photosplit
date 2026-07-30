const fs = require('fs');
const puppeteer = require('puppeteer');

const JS_FILE = 'js/amazon-products.js';

async function run() {
  console.log('Starting product update job...');

  // 1. Read existing file
  const content = fs.readFileSync(JS_FILE, 'utf8');
  
  // Extract the AMAZON_PRODUCTS array using regex
  const match = content.match(/let AMAZON_PRODUCTS = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find AMAZON_PRODUCTS array in ' + JS_FILE);
    process.exit(1);
  }

  // Parse the array
  let products;
  try {
    products = eval(match[1]);
  } catch (e) {
    console.error('Error parsing products:', e);
    process.exit(1);
  }

  // 2. Setup Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  let updatedCount = 0;
  let deadCount = 0;
  let activeProducts = [];

  const RAINFOREST_API_KEY = '27B62A167713461DBA9D2C7423CE8BF8';

  // 3. Process each product
  for (const p of products) {
    const isAmazon = !p.asin.startsWith('http');
    
    if (isAmazon) {
      console.log(`\nChecking Amazon API for: ${p.title}`);
      try {
        const rfUrl = `https://api.rainforestapi.com/request?api_key=${RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.com&asin=${p.asin}`;
        const response = await fetch(rfUrl);
        const data = await response.json();
        
        if (data && data.product && data.product.main_image && data.product.main_image.link) {
          const imageUrl = data.product.main_image.link;
          console.log(`   Found new Amazon image: ${imageUrl}`);
          if (p.img !== imageUrl) {
            p.img = imageUrl;
            updatedCount++;
          }
        } else {
          console.log(`   No new image found from API, keeping existing.`);
        }
        activeProducts.push(p);
      } catch (error) {
        console.log(`❌ Error fetching from Rainforest API: ${error.message}`);
        activeProducts.push(p);
      }
    } else {
      const url = p.asin;
      console.log(`\nChecking external link: ${p.title} (${url})`);
      
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const status = response ? response.status() : null;

        if (status === 404 || status === 410) {
          console.log(`❌ DEAD LINK (${status}). Removing product.`);
          deadCount++;
          continue; 
        }
        
        console.log(`✅ Alive (${status}). Extracting image...`);
        
        const imageUrl = await page.evaluate(() => {
          const ogImage = document.querySelector('meta[property="og:image"]');
          if (ogImage) return ogImage.content;
          return null; 
        });

        if (imageUrl && imageUrl.startsWith('http')) {
          console.log(`   Found new image: ${imageUrl}`);
          if (p.img !== imageUrl) {
            p.img = imageUrl;
            updatedCount++;
          }
        } else {
          console.log(`   No new image found, keeping existing.`);
        }

        activeProducts.push(p);

      } catch (error) {
        console.log(`❌ Error visiting ${url}: ${error.message}`);
        console.log('   Keeping product but skipping update.');
        activeProducts.push(p);
      }
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  console.log(`\nJob complete. Active: ${activeProducts.length}, Dead removed: ${deadCount}, Images updated: ${updatedCount}`);

  // 4. Rewrite the file
  if (deadCount > 0 || updatedCount > 0) {
    const newArrayString = JSON.stringify(activeProducts, null, 2)
      .replace(/"([^"]+)":/g, '$1:'); // Remove quotes from keys

    const newContent = content.replace(match[1], newArrayString);
    fs.writeFileSync(JS_FILE, newContent, 'utf8');
    console.log(`Updated ${JS_FILE}.`);
  } else {
    console.log('No changes needed.');
  }
}

run();
