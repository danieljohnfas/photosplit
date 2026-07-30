const https = require('https');

const asins = ['B07DLX26BB','B08GTYFC37','B00009R6TQ','B002K6P168','B0050R67U0','B015AHE5FA','B085KV7LHQ'];

async function fetchImage(asin) {
  return new Promise((resolve) => {
    https.get('https://www.amazon.com/dp/' + asin, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9\-\_]+\.jpg/);
        resolve(match ? match[0] : null);
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  for (const asin of asins) {
    const url = await fetchImage(asin);
    console.log(asin, url);
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
