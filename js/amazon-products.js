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
    asin: "B084NVRHYQ",
    title: "KODAK Slide N Scan Film & Slide Scanner, 22MP, ...",
    desc: "4.3 ⭐ $189.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81RdTfBiqfL._AC_UY218_.jpg"
  },
  {
    asin: "B0B786237W",
    title: "KODAK REELS 8mm & Super 8 Film Digitizer, 1080p...",
    desc: "4.1 ⭐ $419.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/717Fm6hVbYL._AC_UY218_.jpg"
  },
  {
    asin: "B084NVRHYQ",
    title: "KODAK Slide N Scan Film & Slide Scanner, 22MP, ...",
    desc: "4.3 ⭐ $189.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81RdTfBiqfL._AC_UY218_.jpg"
  },
  {
    asin: "B086DX4253",
    title: "Magnasonic All-in-One 24MP Film Scanner with La...",
    desc: "4.3 ⭐ $129.98. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61BV-3K26RL._AC_UY218_.jpg"
  },
  {
    asin: "B0B3F6KJJ2",
    title: "KODAK Slide N Scan Max Film Scanner, Slide Scan...",
    desc: "4.1 ⭐ $209.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61wezHCZynL._AC_UY218_.jpg"
  },
  {
    asin: "B07MTKNTPK",
    title: "KODAK Mobile Film Scanner, 35mm Negative Scanne...",
    desc: "3.7 ⭐ $39.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71z8cGgjj-L._AC_UY218_.jpg"
  },
  {
    asin: "B0GJSBC2MR",
    title: "PORTTA Film Scanner with 5\" LCD Screen, 22MP Sl...",
    desc: "3.9 ⭐ $139.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61CCPl4oZnL._AC_UY218_.jpg"
  },
  {
    asin: "B0FHDDP3P2",
    title: "BEONEGLOBAL ClearScan MINI Film Scanner 16MP Sl...",
    desc: "4.1 ⭐ $69.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61g7AsjFetL._AC_UY218_.jpg"
  },
  {
    asin: "B00O2BU8PK",
    title: "KODAK SCANZA Film & Slide Scanner, 3.5\" LCD, 35...",
    desc: "4.2 ⭐ $159.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71EndQiuq-L._AC_UY218_.jpg"
  },
  {
    asin: "B008ASJ2Z8",
    title: "Plustek OpticFilm 8200i SE , 35mm Film & Slide ...",
    desc: "4 ⭐ $399.00. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/816yvfCOXwL._AC_UY218_.jpg"
  },
  {
    asin: "B0FHH8DP53",
    title: "22MP Film & Slide Scanner with 5\" LCD, Converts...",
    desc: "4.3 ⭐ $99.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61+NqReSr7L._AC_UY218_.jpg"
  },
  {
    asin: "B084NVRHYQ",
    title: "KODAK Slide N Scan Film & Slide Scanner, 22MP, ...",
    desc: "4.3 ⭐ $189.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81RdTfBiqfL._AC_UL320_.jpg"
  },
  {
    asin: "B008ASJ2Z8",
    title: "Plustek OpticFilm 8200i SE , 35mm Film & Slide ...",
    desc: "4 ⭐ $399.00. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/816yvfCOXwL._AC_UL320_.jpg"
  },
  {
    asin: "B0FHDDP3P2",
    title: "BEONEGLOBAL ClearScan MINI Film Scanner 16MP Sl...",
    desc: "4.1 ⭐ $69.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61g7AsjFetL._AC_UL320_.jpg"
  },
  {
    asin: "B07ZXZRR24",
    title: "Plustek OpticFilm 135i - Automatic Film & Slide...",
    desc: "4.1 ⭐ $529.00. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81iOWstYVUL._AC_UL320_.jpg"
  },
  {
    asin: "B0B786237W",
    title: "KODAK REELS 8mm & Super 8 Film Digitizer, 1080p...",
    desc: "4.1 ⭐ $419.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/717Fm6hVbYL._AC_UL320_.jpg"
  },
  {
    asin: "B0H22NVFVQ",
    title: "Memory Vault Box Negative Scanner, Converts 135...",
    desc: "3.4 ⭐ $150.00. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61qhUDRqIWL._AC_UY218_.jpg"
  },
  {
    asin: "B07ZXZRR24",
    title: "Plustek OpticFilm 135i - Automatic Film & Slide...",
    desc: "4.1 ⭐ $529.00. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81iOWstYVUL._AC_UY218_.jpg"
  },
  {
    asin: "B0FPMR96X6",
    title: "HP Film & Slide Scanner, Photo Scanner, 7\" Touc...",
    desc: "3.9 ⭐ $259.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71xaLbJk3+L._AC_UY218_.jpg"
  },
  {
    asin: "B0B786237W",
    title: "KODAK REELS 8mm & Super 8 Film Digitizer, 1080p...",
    desc: "4.1 ⭐ $419.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/717Fm6hVbYL._AC_UY218_.jpg"
  },
  {
    asin: "B0F8D5LXQ3",
    title: "HP Film & Slide Scanner HPFS500, Negative Scann...",
    desc: "4.2 ⭐ $229.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71ZFXQmDFDL._AC_UY218_.jpg"
  },
  {
    asin: "B009PHCWL4",
    title: "Plustek OpticFilm 8100-35mm Negative Film/Slide...",
    desc: "4 ⭐ $349.00. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71f3zQ5hn+L._AC_UY218_.jpg"
  },
  {
    asin: "B09L7NDNFG",
    title: "Plustek OpticFilm 8300i Ai Film Scanner - Ai St...",
    desc: "4 ⭐ $539.00. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81hYLRFLDwL._AC_UY218_.jpg"
  },
  {
    asin: "B09MHK6Q7D",
    title: "Plustek OpticFilm 8300i SE - 35mm Negative Film...",
    desc: "4 ⭐ $429.00. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81n6vOWEzNL._AC_UY218_.jpg"
  },
  {
    asin: "B07JJBGG1D",
    title: "KODAK Mini Digital Film & Slide Scanner, 35mm, ...",
    desc: "4.2 ⭐ $139.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71VVcLrr-jL._AC_UY218_.jpg"
  },
  {
    asin: "B008DLXAFA",
    title: "Kodak ScanMate i940 Scanner - 1960988",
    desc: "3.7 ⭐ $229.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71LcsahhKrS._AC_UY218_.jpg"
  },
  {
    asin: "B008ASJ2Z8",
    title: "Plustek OpticFilm 8200i SE , 35mm Film & Slide ...",
    desc: "4 ⭐ $399.00. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/816yvfCOXwL._AC_UY218_.jpg"
  },
  {
    asin: "B009PHCWL4",
    title: "Plustek OpticFilm 8100-35mm Negative Film/Slide...",
    desc: "4 ⭐ $349.00. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71f3zQ5hn+L._AC_UL320_.jpg"
  },
  {
    asin: "B07ZXZRR24",
    title: "Plustek OpticFilm 135i - Automatic Film & Slide...",
    desc: "4.1 ⭐ $529.00. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81iOWstYVUL._AC_UL320_.jpg"
  },
  {
    asin: "B09L7NDNFG",
    title: "Plustek OpticFilm 8300i Ai Film Scanner - Ai St...",
    desc: "4 ⭐ $539.00. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81hYLRFLDwL._AC_UL320_.jpg"
  },
  {
    asin: "B0B786237W",
    title: "KODAK REELS 8mm & Super 8 Film Digitizer, 1080p...",
    desc: "4.1 ⭐ $419.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/717Fm6hVbYL._AC_UL320_.jpg"
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
