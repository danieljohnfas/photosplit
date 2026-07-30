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

  // 3. Process each product
  for (const p of products) {
    const isAmazon = !p.asin.startsWith('http');
    const url = isAmazon ? `https://www.amazon.com/dp/${p.asin}/` : p.asin;
    
    console.log(`\nChecking: ${p.title} (${url})`);
    
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = response ? response.status() : null;

      // Handle common Amazon bot blocking (503 Service Unavailable) or normal 404s
      if (status === 404 || status === 410) {
        console.log(`❌ DEAD LINK (${status}). Removing product.`);
        deadCount++;
        continue; // Skip adding to activeProducts
      }
      
      if (status === 503 && isAmazon) {
        console.log(`⚠️ Amazon blocked the request (503). Keeping product for now without updating image.`);
        activeProducts.push(p);
        continue;
      }

      console.log(`✅ Alive (${status}). Extracting image...`);
      
      let imageUrl = null;
      if (isAmazon) {
        // Amazon usually uses #landingImage
        imageUrl = await page.evaluate(() => {
          const img = document.querySelector('#landingImage');
          return img ? img.src : null;
        });
      } else {
        // Fallback for pCloud/external sites: Check OpenGraph tags or main images
        imageUrl = await page.evaluate(() => {
          const ogImage = document.querySelector('meta[property="og:image"]');
          if (ogImage) return ogImage.content;
          return null; // fallback to original if not found
        });
      }

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
    
    // Add a small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  console.log(`\nJob complete. Active: ${activeProducts.length}, Dead removed: ${deadCount}, Images updated: ${updatedCount}`);

  // 4. Rewrite the file
  if (deadCount > 0 || updatedCount > 0) {
    const newArrayString = JSON.stringify(activeProducts, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/"/g, "'"); // Use single quotes for consistency

    const newContent = content.replace(match[1], newArrayString);
    fs.writeFileSync(JS_FILE, newContent, 'utf8');
    console.log(`Updated ${JS_FILE}.`);
  } else {
    console.log('No changes needed.');
  }
}

run();
