const AMAZON_TAG = 'photoid03-20';

const AMAZON_PRODUCTS = [
  // Product 1 (Top Banner 1)
  {
    asin: 'B07DLX26BB',
    title: 'Epson FastFoto FF-680W',
    desc: 'The world\'s fastest personal photo scanner. Scan thousands of photos.',
    badge: 'Top Pick',
    btnClass: 'btn-primary'
  },
  // Product 2 (Top Banner 2)
  {
    asin: 'B08GTYFC37',
    title: 'SanDisk 2TB Portable SSD',
    desc: 'Backup your precious digitized memories securely and fast.',
    badge: 'Storage',
    btnClass: 'btn-secondary'
  },
  // Product 3 (Top Banner 3)
  {
    asin: 'B00009R6TQ',
    title: 'Kodak Slide N Scan',
    desc: 'Digitize your old film negatives and slides in high resolution.',
    badge: 'Negatives',
    btnClass: 'btn-secondary'
  },
  // Product 4 (Sidebar 1)
  {
    asin: 'B002K6P168',
    title: 'Pioneer Photo Albums',
    desc: 'Store your physical originals safely in archival quality sleeves.',
    badge: 'Archival',
    btnClass: 'btn-secondary'
  },
  // Product 5 (Sidebar 2)
  {
    asin: 'B0050R67U0',
    title: 'SanDisk 128GB SDXC',
    desc: 'Ultra high-speed storage card for modern mirrorless cameras.',
    badge: 'Essential',
    btnClass: 'btn-secondary'
  },
  // Product 6 (Bottom Banner 1)
  {
    asin: 'B015AHE5FA',
    title: 'Lens Cleaning Kit',
    desc: 'Keep your scanner glass spotless for the clearest digitized photos.',
    badge: 'Cleaning',
    btnClass: 'btn-secondary'
  },
  // Product 7 (Bottom Banner 2)
  {
    asin: 'B085KV7LHQ',
    title: 'Aura Digital Frame',
    desc: 'Display your freshly digitized photos on a beautiful smart frame.',
    badge: 'Display',
    btnClass: 'btn-primary'
  }
];

function getAmazonLink(asin) {
  return `https://www.amazon.com/dp/${asin}/?tag=${AMAZON_TAG}`;
}

function getAmazonImageUrl(asin) {
  // Use the standard Amazon product image URL which is not blocked by ad blockers
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
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
        <div class="glass-ad-panel" style="padding: 24px 16px 16px; border: 1px solid var(--border-strong); border-radius: var(--radius-lg); text-align: center; background: var(--bg-surface); box-shadow: var(--shadow-sm); transition: transform 0.3s ease, box-shadow 0.3s ease;">
          <a href="${link}" target="_blank" rel="nofollow noopener" style="display:block; text-decoration:none; color:inherit; outline:none;" onmouseover="this.parentElement.style.transform='translateY(-4px)'; this.parentElement.style.boxShadow='var(--shadow-md)';" onmouseout="this.parentElement.style.transform='translateY(0)'; this.parentElement.style.boxShadow='var(--shadow-sm)';">
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
      <a href="${link}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 280px; display:flex; align-items:center; text-decoration:none; color:inherit; background:var(--bg-surface); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-strong); gap: 16px; box-shadow: var(--shadow-sm); transition: transform 0.3s ease, box-shadow 0.3s ease; outline:none; position:relative;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';">
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
    <div class="ad-container ad-banner-bottom ad-wrap-bottom glass-ad-panel" id="sticky-bottom-banner" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; margin: 0; border-radius: 0; text-align: center; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); background: var(--bg-surface); padding: 16px 0; border-top: 1px solid var(--border-strong); display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap;">
      <span class="ad-label" style="font-size: 0.65rem; position:absolute; top: -20px; background: var(--bg-surface-2); border: 1px solid var(--border-strong); border-bottom: none; color: var(--text-primary); padding: 4px 12px; border-radius: 8px 8px 0 0; right: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">You Might Also Like</span>
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const pixel = getTrackingPixel(product.asin);

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" style="display:flex; align-items:center; text-decoration:none; color:inherit; gap: 16px; background: var(--bg-surface-2); padding: 8px 16px; border-radius: 99px; border: 1px solid var(--border); transition: border-color 0.2s ease, transform 0.2s ease;" onmouseover="this.style.borderColor='var(--accent)'; this.style.transform='scale(1.02)';" onmouseout="this.style.borderColor='var(--border)'; this.style.transform='scale(1)';">
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
      <button onclick="document.getElementById('sticky-bottom-banner').style.display='none'; document.body.style.paddingBottom='0';" style="position:absolute; right: 24px; top: 12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem; transition: color 0.2s ease;" onmouseover="this.style.color='var(--accent)';" onmouseout="this.style.color='var(--text-muted)';">&times;</button>
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
