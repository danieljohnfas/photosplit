const AMAZON_TAG = 'photoid03-20';

let AMAZON_PRODUCTS = [
  { asin: 'B07DLX26BB', title: 'Epson FastFoto FF-680W', desc: 'The world\'s fastest personal photo scanner. Scan thousands of photos.', badge: 'Top Pick', btnClass: 'btn-primary', img: 'https://images.unsplash.com/photo-1590483736622-398541c49b6b?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B08GTYFC37', title: 'SanDisk 2TB Portable SSD', desc: 'Backup your precious digitized memories securely and fast.', badge: 'Storage', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B00009R6TQ', title: 'Kodak Slide N Scan', desc: 'Digitize your old film negatives and slides in high resolution.', badge: 'Negatives', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B002K6P168', title: 'Pioneer Photo Albums', desc: 'Store your physical originals safely in archival quality sleeves.', badge: 'Archival', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1518133527749-e58f01c70e0b?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B0050R67U0', title: 'SanDisk 128GB SDXC', desc: 'Ultra high-speed storage card for modern mirrorless cameras.', badge: 'Essential', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1624467026045-81423405b0be?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B015AHE5FA', title: 'Lens Cleaning Kit', desc: 'Keep your scanner glass spotless for the clearest digitized photos.', badge: 'Cleaning', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1582216091047-975a5eefcba2?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B085KV7LHQ', title: 'Aura Digital Frame', desc: 'Display your freshly digitized photos on a beautiful smart frame.', badge: 'Display', btnClass: 'btn-primary', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B07V22XVDM', title: 'WD 4TB My Passport', desc: 'Massive portable storage for your entire digitized family photo history.', badge: 'Storage', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1620245053156-55e1c8b3f271?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B09TVF9SNT', title: 'Plustek ePhoto Z300', desc: 'Easy and intuitive photo scanner for quick memory preservation.', badge: 'Scanner', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1588701974720-6d45e54613c2?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B07M631GZD', title: 'White Cotton Gloves', desc: 'Handle delicate film and printed photos without leaving fingerprints.', badge: 'Archival', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1584988719266-9b5cc5a96eb2?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B01M0R0C1Q', title: 'Anti-Static Brush', desc: 'Remove dust from negatives safely before scanning them in high resolution.', badge: 'Cleaning', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1518113166827-2eb13b30bdce?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B07P7M6SBD', title: 'Samsung T7 1TB SSD', desc: 'Lightning-fast solid state drive for transferring huge photo libraries.', badge: 'Storage', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1634863625482-aa0b18121eb2?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B08F22KGBJ', title: 'Film Carrier MK1', desc: 'Professional level tool for scanning film quickly with a digital camera.', badge: 'Pro Gear', btnClass: 'btn-primary', img: 'https://images.unsplash.com/photo-1617005082833-1eb585741066?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B00009R6TQ', title: 'Epson Perfection V850', desc: 'The gold standard for professional flatbed film and photo scanning.', badge: 'Pro Scanner', btnClass: 'btn-primary', img: 'https://images.unsplash.com/photo-1563207153-f40879fbd338?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B002K6P168', title: 'Acid-Free Storage Box', desc: 'Museum-quality storage boxes for preserving your original photo prints.', badge: 'Archival', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1605389640417-6ff09230676b?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B08N5LL54Z', title: 'Giottos Rocket Air', desc: 'The most effective way to safely blow dust off your scanner glass and film.', badge: 'Cleaning', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B015AHE5FA', title: 'Microfiber Cloths', desc: 'Ultra-soft cloths for wiping down scanner beds and camera lenses.', badge: 'Cleaning', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1603513492211-1da01dfb0cb6?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B085KV7LHQ', title: 'Nixplay Smart Frame', desc: 'Share your scanned photos instantly with family members far away.', badge: 'Display', btnClass: 'btn-primary', img: 'https://images.unsplash.com/photo-1551690940-d9961db6e1ad?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B07M631GZD', title: 'Light Pad A4', desc: 'Perfect illumination for viewing and sorting old film negatives and slides.', badge: 'Viewing', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1536767784013-1b913ff7f77f?q=80&w=400&auto=format&fit=crop' },
  { asin: 'B09TVF9SNT', title: 'Film Sorter Tray', desc: 'Organize your loose slides efficiently before sending them through the scanner.', badge: 'Organize', btnClass: 'btn-secondary', img: 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=400&auto=format&fit=crop' }
];

// Shuffle the array immediately so each page load gets a random selection
AMAZON_PRODUCTS = AMAZON_PRODUCTS.sort(() => 0.5 - Math.random());

function getAmazonLink(asin) {
  return `https://www.amazon.com/dp/${asin}/?tag=${AMAZON_TAG}`;
}

function getAmazonImageUrl(asin) {
  // We now define images directly in the AMAZON_PRODUCTS array for maximum reliability,
  // bypassing ad blockers and handling legacy ASINs that don't have .01 variants.
  const product = AMAZON_PRODUCTS.find(p => p.asin === asin);
  return product && product.img ? product.img : `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
}

function getTrackingPixel(asin) {
  // We omit the ir-na tracking pixel because aggressive ad blockers 
  // sometimes hide the entire parent container if they detect it.
  // The affiliate ?tag= parameter on the link is sufficient for tracking.
  return '';
}

function renderSidebarWidgets() {
  const container = document.getElementById('amazon-widget-sidebar');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(3, 5); // 2 products
  let html = '<div class="ad-sidebar-sticky">';
  
  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const pixel = getTrackingPixel(product.asin);
    const badgeBg = product.badge === 'Top Pick' ? 'var(--accent-grad)' : 'var(--bg-surface-2)';
    const badgeColor = product.badge === 'Top Pick' ? '#fff' : 'var(--text-primary)';
    const badgeBorder = product.badge === 'Top Pick' ? 'none' : '1px solid var(--border-strong)';
    const badgeShadow = product.badge === 'Top Pick' ? '0 4px 12px var(--accent-glow)' : 'none';

    html += `
      <div style="margin-bottom: 24px; position: relative;">
        <div style="position: absolute; top: -10px; left: 16px; background: ${badgeBg}; color: ${badgeColor}; border: ${badgeBorder}; padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; z-index: 10; box-shadow: ${badgeShadow};">${product.badge}</div>
        <div class="glass-ad-panel" style="padding: 24px 16px 16px; border: 1px solid var(--border-strong); border-radius: var(--radius-lg); text-align: center; background: var(--bg-surface); box-shadow: var(--shadow-sm);">
          <a href="${link}" target="_blank" rel="nofollow noopener" style="display:block; text-decoration:none; color:inherit; outline:none;">
            <div style="background: white; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; display:flex; justify-content:center; align-items:center; min-height:160px;">
              <img src="${img}" alt="${product.title}" style="width:100%; object-fit: contain; max-height: 140px; border: none;">
            </div>
            <h4 style="font-weight: 800; font-size: 1.05rem; margin: 0 0 8px; color: var(--text-primary);">${product.title}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 16px; line-height: 1.4;">${product.desc}</p>
            <span class="btn ${product.btnClass}" style="display: flex; justify-content: center; width: 100%; border-radius: 99px; font-weight: 700; padding: 10px;">
              View on Amazon
            </span>
            ${pixel}
          </a>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function renderTopBanner() {
  const container = document.getElementById('amazon-widget-top');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(0, 3); // 3 products
  let html = `
    <div class="ad-container ad-banner-top" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; margin-bottom: 24px; position: relative;">
      <span style="background:var(--bg-surface-2); border: 1px solid var(--border-strong); color:var(--text-primary); padding: 4px 16px; border-radius: 99px; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 20px; box-shadow: var(--shadow-sm);">Featured Gear</span>
      <div style="display:flex; gap: 24px; align-items:stretch; justify-content:center; flex-wrap:wrap; width: 100%; max-width: 1200px;">
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const pixel = getTrackingPixel(product.asin);

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 280px; display:flex; align-items:center; text-decoration:none; color:inherit; background:var(--bg-surface); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-strong); gap: 16px; box-shadow: var(--shadow-sm); outline:none; position:relative;">
        <div style="background: white; border-radius: var(--radius-sm); padding: 8px; flex-shrink: 0; width: 90px; height: 90px; display:flex; justify-content:center; align-items:center;">
          <img src="${img}" alt="${product.title}" style="max-height: 100%; max-width: 100%; object-fit: contain; border: none;">
        </div>
        <div style="text-align:left; flex: 1;">
          <h4 style="font-weight:800; font-size: 1rem; margin: 0 0 6px; color: var(--text-primary);">${product.title}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 12px; line-height: 1.3;">${product.desc}</p>
          <span class="btn ${product.btnClass} btn-sm" style="font-size:0.75rem; padding:6px 12px; border-radius: 99px; width: fit-content;">View on Amazon</span>
        </div>
        ${pixel}
      </a>
    `;
  });

  html += `
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderBottomBanner() {
  const container = document.getElementById('amazon-widget-bottom');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(5, 7); // 2 products
  
  let html = `
    <div class="ad-container ad-banner-bottom ad-wrap-bottom glass-ad-panel" id="sticky-bottom-banner" style="margin: 0; border-radius: 0; text-align: center; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); background: var(--bg-surface); padding: 16px 0; border-top: 1px solid var(--border-strong); display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 2rem;">
      <span class="ad-label" style="font-size: 0.65rem; position:absolute; top: -20px; background: var(--bg-surface-2); border: 1px solid var(--border-strong); border-bottom: none; color: var(--text-primary); padding: 4px 12px; border-radius: 8px 8px 0 0; right: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">You Might Also Like</span>
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const pixel = getTrackingPixel(product.asin);

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" style="display:flex; align-items:center; text-decoration:none; color:inherit; gap: 16px; background: var(--bg-surface-2); padding: 8px 16px; border-radius: 99px; border: 1px solid var(--border);">
        <div style="background: white; border-radius: 50%; padding: 4px; width: 48px; height: 48px; display:flex; justify-content:center; align-items:center;">
          <img src="${img}" alt="${product.title}" style="height:36px; max-width: 36px; object-fit: contain; border: none;">
        </div>
        <div style="text-align:left;">
          <p style="font-weight:700; font-size: 0.9em; margin: 0 0 2px;">${product.title}</p>
          <p style="font-size: 0.75em; color:var(--text-secondary); margin:0;">${product.badge}</p>
        </div>
        <span class="btn ${product.btnClass} btn-sm" style="font-size:0.75em; padding:4px 12px; border-radius:99px; margin-left: 8px;">View</span>
        ${pixel}
      </a>
    `;
  });

  html += `
      <button onclick="document.getElementById('sticky-bottom-banner').style.display='none'; document.body.style.paddingBottom='0';" style="position:absolute; right: 24px; top: 12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem;">&times;</button>
      <style>
          body { padding-bottom: 90px !important; }
      </style>
    </div>
  `;
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarWidgets();
  renderTopBanner();
  renderBottomBanner();
});
