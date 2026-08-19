const AMAZON_TAG = 'photoid03-20';

let AMAZON_PRODUCTS = [
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
  },
  {
    asin: "B07CRG94G3",
    title: "Seagate 2TB Portable Hard Drive | USB 3.0 (STGX...",
    desc: "4.6 ⭐ $129.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UY218_.jpg"
  },
  {
    asin: "B08D9W2KDW",
    title: "Fantom Drives Extreme 2TB External SSD - 2800MB...",
    desc: "4.4 ⭐ $338.35. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71oINOBjxSL._AC_UY218_.jpg"
  },
  {
    asin: "B07CRG94G3",
    title: "Seagate 2TB Portable Hard Drive | USB 3.0 (STGX...",
    desc: "4.6 ⭐ $129.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UY218_.jpg"
  },
  {
    asin: "B01N7QFZLQ",
    title: "LaCie Rugged USB-C 2TB External Hard Drive Port...",
    desc: "4.7 ⭐ $149.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71k9PA7B3nL._AC_UY218_.jpg"
  },
  {
    asin: "B07VTFN6HM",
    title: "WD 2TB My Passport, Portable External Hard Driv...",
    desc: "4.6 ⭐ $142.00. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/510+J06fz0L._AC_UY218_.jpg"
  },
  {
    asin: "B07CRGSR16",
    title: "Seagate Portable 4TB External Hard Drive HDD – ...",
    desc: "4.6 ⭐ $189.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UY218_.jpg"
  },
  {
    asin: "B0FV8GKG5T",
    title: "UnionSine 2TB Ultra Slim Portable External Hard...",
    desc: "4.4 ⭐ $148.53. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61XbnUE8ipL._AC_UY218_.jpg"
  },
  {
    asin: "B06W55K9N6",
    title: "WD 2TB Elements Portable External Hard Drive fo...",
    desc: "4.7 ⭐ $142.00. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/6136gJAGRbL._AC_UY218_.jpg"
  },
  {
    asin: "B07VS8QCXC",
    title: "Seagate Portable 5TB External Hard Drive HDD – ...",
    desc: "4.6 ⭐ $219.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UY218_.jpg"
  },
  {
    asin: "B0BQX6NNVC",
    title: "Toshiba Canvio Basics 2TB Portable External Har...",
    desc: "4.6 ⭐ $146.65. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91e-WNUpH0L._AC_UY218_.jpg"
  },
  {
    asin: "B08HN37XC1",
    title: "SANDISK 2TB Extreme Portable SSD (Old Model) - ...",
    desc: "4.6 ⭐ $306.50. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61zuR3UMnWL._AC_UY218_.jpg"
  },
  {
    asin: "B0B9MRHDRP",
    title: "iDiskk MFi Certified 2TB External Hard Drive fo...",
    desc: "4.2 ⭐ $179.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61LeQjpJs5L._AC_UY218_.jpg"
  },
  {
    asin: "B0G56476HZ",
    title: "Avolusion M3 Series 2TB USB 3.0 Portable Extern...",
    desc: "3.4 ⭐ $99.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/51TKXUgWylL._AC_UY218_.jpg"
  },
  {
    asin: "B0744NCY4K",
    title: "ADATA HD710 Pro - 2 TB External Hard Drive - Sh...",
    desc: "4.6 ⭐ $126.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71DI8ShgwTL._AC_UY218_.jpg"
  },
  {
    asin: "B0BGXZRKQN",
    title: "Toshiba Canvio Partner 2TB Portable 2.5’’ Exter...",
    desc: "4.5 ⭐ $128.30. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/817eP8ZuvrL._AC_UY218_.jpg"
  },
  {
    asin: "B01MSSJ32J",
    title: "LaCie Rugged USB-C, 4TB, Portable External Hard...",
    desc: "4.4 ⭐ $209.54. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91bati0rB3L._AC_UY218_.jpg"
  },
  {
    asin: "B0FJRK328F",
    title: "2TB External Hard Drive, Up to 2100MB/s, USB 3....",
    desc: "4.2 ⭐ $269.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/619a3cNxf6L._AC_UY218_.jpg"
  },
  {
    asin: "B08JKGG97R",
    title: "Toshiba Canvio Advance 2TB Portable External Ha...",
    desc: "4.6 ⭐ $139.00. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81EFDYBAkyL._AC_UY218_.jpg"
  },
  {
    asin: "B0C5JNWF58",
    title: "SANDISK 2TB Portable SSD - Up to 800MB/s, USB-C...",
    desc: "4.5 ⭐ $279.95. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71bBCTIvIIL._AC_UY218_.jpg"
  },
  {
    asin: "B0874XWW23",
    title: "Samsung T7 Portable SSD 2TB Titan Gray, USB 3.2...",
    desc: "4.7 ⭐ $391.86. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91YfRIy7kYL._AC_UY218_.jpg"
  },
  {
    asin: "B07CRG7BBH",
    title: "Seagate Portable 1TB External Hard Drive HDD – ...",
    desc: "4.6 ⭐ $119.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UY218_.jpg"
  },
  {
    asin: "B0DT31KYBR",
    title: "ThePhotoStick® Omni 32GB Photo Backup for iPhon...",
    desc: "4.1 ⭐ $44.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61DZ6LWGs3L._AC_UY218_.jpg"
  },
  {
    asin: "B07CRG94G3",
    title: "Seagate 2TB Portable Hard Drive | USB 3.0 (STGX...",
    desc: "4.6 ⭐ $129.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/41MuI-7iHIL._AC_UL320_.jpg"
  },
  {
    asin: "B0B9MRHDRP",
    title: "iDiskk MFi Certified 2TB External Hard Drive fo...",
    desc: "4.2 ⭐ $179.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61LeQjpJs5L._AC_UL320_.jpg"
  },
  {
    asin: "B0GSDNJ9HD",
    title: "iDiskk App-le Certified 500GB External Hard Dri...",
    desc: "4 ⭐ $94.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61PMXOqjqkL._AC_UL320_.jpg"
  },
  {
    asin: "B0B9MXQGMT",
    title: "iDiskk App-le Certified 2TB External Hard Drive...",
    desc: "4.3 ⭐ $179.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61Ujauxsp8L._AC_UL320_.jpg"
  },
  {
    asin: "B0GCGSKMMP",
    title: "2TB Magnetic Portable SSD, Up to 2000MB/s – Ext...",
    desc: "4.2 ⭐ $269.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71fp55ghXML._AC_UL320_.jpg"
  }
];

// Deduplicate by asin just in case
(function dedupeProducts() {
  const seen = new Set();
  AMAZON_PRODUCTS = AMAZON_PRODUCTS.filter(p => {
    if (seen.has(p.asin)) return false;
    seen.add(p.asin);
    return true;
  });
})();

// Enhanced contextual shuffle algorithm
function getContextualProducts() {
  let products = [...AMAZON_PRODUCTS];

  // URL Context matching
  const url = window.location.href.toLowerCase();
  let boostKeyword = '';

  if (url.includes('convert') || url.includes('transcribe')) boostKeyword = 'storage';
  else if (url.includes('crop') || url.includes('resize') || url.includes('passport')) boostKeyword = 'frame';
  else if (url.includes('app')) boostKeyword = 'scanner';
  else if (url.includes('blog')) boostKeyword = 'pcloud';

  // Shuffle randomly first
  products = products.sort(() => 0.5 - Math.random());

  // Boost matching products to the front
  if (boostKeyword) {
    products.sort((a, b) => {
      const aMatch = (a.title + ' ' + a.desc + ' ' + a.badge).toLowerCase().includes(boostKeyword);
      const bMatch = (b.title + ' ' + b.desc + ' ' + b.badge).toLowerCase().includes(boostKeyword);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  return products;
}

AMAZON_PRODUCTS = getContextualProducts();

function getAmazonLink(asin) {
  if (asin.startsWith('http')) return asin;
  return `https://www.amazon.com/dp/${asin}/?tag=${AMAZON_TAG}`;
}

function getAmazonImageUrl(asin) {
  const product = AMAZON_PRODUCTS.find(p => p.asin === asin);
  return product && product.img ? product.img : `https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop`;
}

function trackAdClick(asin, slot) {
  if (typeof gtag === 'function') {
    gtag('event', 'ad_click', { event_category: 'AmazonAds', event_label: asin, ad_slot: slot });
  }
  try {
    let clicks = JSON.parse(localStorage.getItem('photosplit_ad_clicks') || '{}');
    if (!clicks[slot]) clicks[slot] = 0;
    clicks[slot]++;
    localStorage.setItem('photosplit_ad_clicks', JSON.stringify(clicks));
  } catch (e) {}
}

function renderSidebarWidgets() {
  const container = document.getElementById('amazon-widget-sidebar');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(4, 5); // 1 product
  let html = '<div class="ad-sidebar-sticky">';

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const btnText = product.asin.startsWith('http') ? 'View Details' : 'View on Amazon';
    const badgeBg = product.badge === 'Top Pick' ? 'var(--accent-grad)' : 'var(--bg-surface-2)';
    const badgeColor = product.badge === 'Top Pick' ? '#fff' : 'var(--text-primary)';
    const badgeBorder = product.badge === 'Top Pick' ? 'none' : '1px solid var(--border-strong)';
    const badgeShadow = product.badge === 'Top Pick' ? '0 4px 12px var(--accent-glow)' : 'none';

    html += `
      <div style="margin-bottom: 24px; position: relative;">
        <div style="position: absolute; top: -10px; left: 16px; background: ${badgeBg}; color: ${badgeColor}; border: ${badgeBorder}; padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; z-index: 10; box-shadow: ${badgeShadow};">${product.badge}</div>
        <div class="glass-ad-panel" style="padding: 24px 16px 16px; border: 1px solid var(--border-strong); border-radius: var(--radius-lg); text-align: center; background: var(--bg-surface); box-shadow: var(--shadow-sm);">
          <a href="${link}" target="_blank" rel="nofollow noopener" onclick="trackAdClick('${product.asin}', 'sidebar')" style="display:block; text-decoration:none; color:inherit; outline:none;">
            <div style="background: white; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; display:flex; justify-content:center; align-items:center; min-height:160px;">
              <img src="${img}" loading="lazy" alt="${product.title}" style="width:100%; object-fit: contain; max-height: 140px; border: none;">
            </div>
            <h4 style="font-weight: 800; font-size: 1.05rem; margin: 0 0 8px; color: var(--text-primary);">${product.title}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 16px; line-height: 1.4;">${product.desc}</p>
            <span class="btn ${product.btnClass}" style="display: flex; justify-content: center; width: 100%; border-radius: 99px; font-weight: 700; padding: 10px;">
              ${btnText}
            </span>
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

  const products = AMAZON_PRODUCTS.slice(0, 4); // 4 products
  let html = `
    <div class="ad-container ad-banner-top" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; margin-bottom: 24px; position: relative;">
      <span style="background:var(--bg-surface-2); border: 1px solid var(--border-strong); color:var(--text-primary); padding: 4px 16px; border-radius: 99px; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 20px; box-shadow: var(--shadow-sm);">Featured</span>
      <div style="display:flex; gap: 24px; align-items:stretch; justify-content:center; flex-wrap:wrap; width: 100%; max-width: 1200px;">
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);
    const btnText = product.asin.startsWith('http') ? 'View Details' : 'View on Amazon';

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" onclick="trackAdClick('${product.asin}', 'top')" style="flex: 1; min-width: 250px; display:flex; align-items:center; text-decoration:none; color:inherit; background:var(--bg-surface); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-strong); gap: 16px; box-shadow: var(--shadow-sm); outline:none; position:relative;">
        <div style="background: white; border-radius: var(--radius-sm); padding: 8px; flex-shrink: 0; width: 90px; height: 90px; display:flex; justify-content:center; align-items:center;">
          <img src="${img}" loading="lazy" alt="${product.title}" style="max-height: 100%; max-width: 100%; object-fit: contain; border: none;">
        </div>
        <div style="text-align:left; flex: 1;">
          <h4 style="font-weight:800; font-size: 1rem; margin: 0 0 6px; color: var(--text-primary);">${product.title}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 12px; line-height: 1.3;">${product.desc}</p>
          <span class="btn ${product.btnClass} btn-sm" style="font-size:0.75rem; padding:6px 12px; border-radius: 99px; width: fit-content;">${btnText}</span>
        </div>
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

  const products = AMAZON_PRODUCTS.slice(7, 10); // 3 products

  let html = `
    <div class="ad-container ad-banner-bottom ad-wrap-bottom glass-ad-panel" id="sticky-bottom-banner" style="margin: 0; border-radius: 0; text-align: center; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); background: var(--bg-surface); padding: 16px 0; border-top: 1px solid var(--border-strong); display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 2rem; position: relative;">
      <span class="ad-label" style="font-size: 0.65rem; position:absolute; top: -20px; background: var(--bg-surface-2); border: 1px solid var(--border-strong); border-bottom: none; color: var(--text-primary); padding: 4px 12px; border-radius: 8px 8px 0 0; right: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">You Might Also Like</span>
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" onclick="trackAdClick('${product.asin}', 'bottom')" style="display:flex; align-items:center; text-decoration:none; color:inherit; gap: 16px; background: var(--bg-surface-2); padding: 8px 16px; border-radius: 99px; border: 1px solid var(--border-strong);">
        <div style="background: white; border-radius: 50%; padding: 4px; width: 48px; height: 48px; display:flex; justify-content:center; align-items:center;">
          <img src="${img}" loading="lazy" alt="${product.title}" style="height:36px; max-width: 36px; object-fit: contain; border: none;">
        </div>
        <div style="text-align:left;">
          <p style="font-weight:700; font-size: 0.9em; margin: 0 0 2px;">${product.title}</p>
          <p style="font-size: 0.75em; color:var(--text-secondary); margin:0;">${product.badge}</p>
        </div>
        <span class="btn ${product.btnClass} btn-sm" style="font-size:0.75em; padding:4px 12px; border-radius:99px; margin-left: 8px;">View</span>
      </a>
    `;
  });

  html += `
      <button onclick="document.getElementById('sticky-bottom-banner').style.display='none'; document.body.style.paddingBottom='0';" style="position:absolute; right: 24px; top: 12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem;">&times;</button>
    </div>
  `;
  container.innerHTML = html;
}

function renderInlineBanner() {
  const container = document.getElementById('amazon-widget-inline');
  if (!container) return;
  const products = AMAZON_PRODUCTS.slice(10, 12);
  let html = `<div class="ad-container ad-banner-inline" style="display:flex; flex-wrap:wrap; gap:16px; margin:24px 0;">`;
  products.forEach(p => {
    const link = getAmazonLink(p.asin);
    const img = getAmazonImageUrl(p.asin);
    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" onclick="trackAdClick('${p.asin}', 'inline')" style="flex:1; min-width:250px; display:flex; align-items:center; background:var(--bg-surface); padding:12px; border-radius:var(--radius-lg); border:1px solid var(--border-strong); box-shadow:var(--shadow-sm); text-decoration:none; color:inherit;">
        <img src="${img}" loading="lazy" style="width:60px; height:60px; object-fit:contain; background:white; padding:4px; border-radius:var(--radius-sm); margin-right:16px;" alt="${p.title}">
        <div>
          <h4 style="margin:0 0 4px; font-size:0.9rem; font-weight:800; color:var(--text-primary);">${p.title}</h4>
          <p style="margin:0 0 6px; font-size:0.78rem; color:var(--text-secondary);">${p.desc}</p>
          <span class="btn ${p.btnClass} btn-sm" style="font-size:0.7rem; padding:4px 10px;">View</span>
        </div>
      </a>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderGridWidget() {
  const container = document.getElementById('amazon-widget-grid');
  if (!container) return;
  const products = AMAZON_PRODUCTS.slice(12, 16);
  let html = `<div class="ad-container ad-widget-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin:24px 0;">`;
  products.forEach(p => {
    const link = getAmazonLink(p.asin);
    const img = getAmazonImageUrl(p.asin);
    const btnText = p.asin.startsWith('http') ? 'View Details' : 'View on Amazon';
    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" onclick="trackAdClick('${p.asin}', 'grid')" style="display:flex; flex-direction:column; align-items:center; background:var(--bg-surface); padding:16px; border-radius:var(--radius-lg); border:1px solid var(--border-strong); box-shadow:var(--shadow-sm); text-decoration:none; color:inherit; text-align:center;">
        <img src="${img}" loading="lazy" style="width:100px; height:100px; object-fit:contain; background:white; padding:8px; border-radius:var(--radius-md); margin-bottom:12px;" alt="${p.title}">
        <h4 style="margin:0 0 8px; font-size:0.85rem; font-weight:700; color:var(--text-primary);">${p.title}</h4>
        <p style="margin:0 0 8px; font-size:0.75rem; color:var(--text-secondary); line-height:1.3;">${p.desc}</p>
        <span class="btn ${p.btnClass} btn-sm" style="font-size:0.75rem; padding:6px 12px;">${btnText}</span>
      </a>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('#site-header .main-nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/') || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  renderSidebarWidgets();
  renderTopBanner();

  // Delay sticky bottom banner by 10 seconds to avoid popup friction on load
  setTimeout(() => {
    renderBottomBanner();
  }, 10000);

  renderInlineBanner();
  renderGridWidget();
});
