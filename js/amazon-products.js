const AMAZON_TAG = 'photoid03-20';

let AMAZON_PRODUCTS = [
  {
    asin: "B01LZJH63M",
    title: "Plustek Photo Scanner ePhoto Z300, Scans 4x6 in...",
    desc: "4.5 ⭐ $219.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81E0YcY1MQL._AC_UY218_.jpg"
  },
  {
    asin: "B0C364K1SC",
    title: "Epson Perfection V19 II Flatbed Photo Scanner 4...",
    desc: "3.9 ⭐ $89.00. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71iyq3c0OiL._AC_UY218_.jpg"
  },
  {
    asin: "B07DLX26BB",
    title: "Epson FastFoto FF-680W High-Speed Duplex Photo ...",
    desc: "4.5 ⭐ $598.00. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71Ulr9Z9S6L._AC_UY218_.jpg"
  },
  {
    asin: "B07G5XZVLQ",
    title: "Canon Canoscan Lide 300 Scanner (PDF, AUTOSCAN,...",
    desc: "4.2 ⭐ $75.00. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61p8GOXK6IS._AC_UY218_.jpg"
  },
  {
    asin: "B0C35V1CLK",
    title: "Epson Perfection V39 II Flatbed Photo Scanner 4...",
    desc: "3.7 ⭐ $117.00. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71cV59d0gOL._AC_UY218_.jpg"
  },
  {
    asin: "B0FS3BRMB3",
    title: "ScanSnap iX2500 Photo Edition Wireless or USB H...",
    desc: "4.4 ⭐ $474.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61HLpjQQjuL._AC_UY218_.jpg"
  },
  {
    asin: "B0F9B1H5VN",
    title: "ScanSnap iX2500 Wireless or USB High-Speed Docu...",
    desc: "4.4 ⭐ . Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/612vJX1V61L._AC_UY218_.jpg"
  },
  {
    asin: "B07G5YBS1W",
    title: "Canon CanoScan LiDE 400 Slim Scanner, 7.7\" x 14...",
    desc: "4.1 ⭐ $89.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71ZSDHv9NRS._AC_UY218_.jpg"
  },
  {
    asin: "B084NVRHYQ",
    title: "KODAK Slide N Scan Film & Slide Scanner, 22MP, ...",
    desc: "4.4 ⭐ $189.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81RdTfBiqfL._AC_UY218_.jpg"
  },
  {
    asin: "B091MDDQK9",
    title: "Canon imageFORMULA RS40 - Photo and Document Sc...",
    desc: "4 ⭐ $329.00. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/41maiQDzKYL._AC_UY218_.jpg"
  },
  {
    asin: "B0BBVQ2HN5",
    title: "Portable Scanner, Photo Scanner for A4 Document...",
    desc: "3.9 ⭐ $53.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71wQAbEJY0L._AC_UY218_.jpg"
  },
  {
    asin: "B09FX5SRQT",
    title: "ScanSnap iX1300 Wireless or USB Double-Sided Co...",
    desc: "4.2 ⭐ $279.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71oy8z4sajL._AC_UY218_.jpg"
  },
  {
    asin: "B09FX5DWBK",
    title: "ScanSnap iX1300 Wireless or USB Double-Sided Co...",
    desc: "4.2 ⭐ $279.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71-1eaMzjuL._AC_UY218_.jpg"
  },
  {
    asin: "B07KQZWPYN",
    title: "Epson Workforce ES-50 Compact & Lightweight Mob...",
    desc: "4.3 ⭐ $129.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/5186q1u92zL._AC_UY218_.jpg"
  },
  {
    asin: "B0FWGTB3S3",
    title: "ScanSnap iX2400 High-Speed One-Touch Button Col...",
    desc: "4.5 ⭐ $349.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71F4K-EyYNL._AC_UY218_.jpg"
  },
  {
    asin: "B08P3Z4M6Q",
    title: "Epson Workforce ES-500W II Wireless Color Duple...",
    desc: "4.4 ⭐ $349.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71IwejOen7S._AC_UY218_.jpg"
  }
];

// Shuffle the array immediately so each page load gets a random selection
AMAZON_PRODUCTS = AMAZON_PRODUCTS.sort(() => 0.5 - Math.random());

function getAmazonLink(asin) {
  if (asin.startsWith('http')) return asin;
  return `https://www.amazon.com/dp/${asin}/?tag=${AMAZON_TAG}`;
}

function getAmazonImageUrl(asin) {
  const product = AMAZON_PRODUCTS.find(p => p.asin === asin);
  return product && product.img ? product.img : `https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop`;
}

function getTrackingPixel(asin) {
  return '';
}

function renderSidebarWidgets() {
  const container = document.getElementById('amazon-widget-sidebar');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(4, 7); // 3 products
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
          <a href="${link}" target="_blank" rel="nofollow noopener" style="display:block; text-decoration:none; color:inherit; outline:none;">
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
      <a href="${link}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 250px; display:flex; align-items:center; text-decoration:none; color:inherit; background:var(--bg-surface); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-strong); gap: 16px; box-shadow: var(--shadow-sm); outline:none; position:relative;">
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
    <div class="ad-container ad-banner-bottom ad-wrap-bottom glass-ad-panel" id="sticky-bottom-banner" style="margin: 0; border-radius: 0; text-align: center; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); background: var(--bg-surface); padding: 16px 0; border-top: 1px solid var(--border-strong); display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 2rem;">
      <span class="ad-label" style="font-size: 0.65rem; position:absolute; top: -20px; background: var(--bg-surface-2); border: 1px solid var(--border-strong); border-bottom: none; color: var(--text-primary); padding: 4px 12px; border-radius: 8px 8px 0 0; right: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">You Might Also Like</span>
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);

    html += `
      <a href="${link}" target="_blank" rel="nofollow noopener" style="display:flex; align-items:center; text-decoration:none; color:inherit; gap: 16px; background: var(--bg-surface-2); padding: 8px 16px; border-radius: 99px; border: 1px solid var(--border);">
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
    desc: "Secure European cloud storage. The safest place for your digitized memories.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/home.png"
  },
  {
    asin: "https://partner.pcloud.com/dl/mac",
    title: "pCloud Drive (Mac)",
    desc: "Direct download for the pCloud desktop app on Mac to sync photos.",
    badge: "Desktop",
    btnClass: "btn-secondary",
    img: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=400&auto=format&fit=crop"
  },
  {
    asin: "https://www.pcloud.com/pass",
    title: "pCloud Pass",
    desc: "Securely manage your passwords and sensitive data with end-to-end encryption.",
    badge: "Passwords",
    btnClass: "btn-secondary",
    img: "https://images.unsplash.com/photo-1614064641913-6b71a30611bf?q=80&w=400&auto=format&fit=crop"
  },
  {
    asin: "https://www.pcloud.com/Europe",
    title: "pCloud Europe",
    desc: "Cloud storage fully compliant with strict European data privacy laws.",
    badge: "Privacy",
    btnClass: "btn-secondary",
    img: "https://images.unsplash.com/photo-1453227588063-bb302b62f50b?q=80&w=400&auto=format&fit=crop"
  },
  {
    asin: "https://www.pcloud.com/family",
    title: "pCloud Family Plan",
    desc: "Share 2TB of lifetime storage with up to 5 family members for all your photos.",
    badge: "Family",
    btnClass: "btn-primary",
    img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/family.png"
  },
  {
    asin: "https://www.pcloud.com/business-registration.html",
    title: "pCloud Business",
    desc: "Professional cloud storage for photography studios and creative teams.",
    badge: "Business",
    btnClass: "btn-secondary",
    img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/business.png"
  },
  {
    asin: "https://www.pcloud.com/encrypted-cloud-storage.html",
    title: "pCloud Crypto",
    desc: "Military-grade client-side encryption to keep your private photos truly private.",
    badge: "Security",
    btnClass: "btn-secondary",
    img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/crypto.png"
  },
  {
    asin: "https://www.pcloud.com/cloud-storage-pricing-plans.html",
    title: "pCloud Pricing",
    desc: "Flexible storage plans for every need. Never run out of space again.",
    badge: "Plans",
    btnClass: "btn-secondary",
    img: "https://www.pcloud.com/pcdn-www.pcloud.com/ZWa5E/images/social_img/plans.png"
  },
  {
    asin: "https://www.pcloud.com/lifetime",
    title: "pCloud Lifetime",
    desc: "Pay once, keep your photos secure forever. The ultimate digital photo archive.",
    badge: "Lifetime",
    btnClass: "btn-primary",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400&auto=format&fit=crop"
  }
];

// Shuffle the array immediately so each page load gets a random selection
AMAZON_PRODUCTS = AMAZON_PRODUCTS.sort(() => 0.5 - Math.random());

function getAmazonLink(asin) {
  if (asin.startsWith('http')) return asin;
  return `https://www.amazon.com/dp/${asin}/?tag=${AMAZON_TAG}`;
}

function getAmazonImageUrl(asin) {
  const product = AMAZON_PRODUCTS.find(p => p.asin === asin);
  return product && product.img ? product.img : `https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop`;
}

function getTrackingPixel(asin) {
  return '';
}

function renderSidebarWidgets() {
  const container = document.getElementById('amazon-widget-sidebar');
  if (!container) return;

  const products = AMAZON_PRODUCTS.slice(4, 7); // 3 products
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
          <a href="${link}" target="_blank" rel="nofollow noopener" style="display:block; text-decoration:none; color:inherit; outline:none;">
            <div style="background: white; border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px; display:flex; justify-content:center; align-items:center; min-height:160px;">
              <img src="${img}" alt="${product.title}" style="width:100%; object-fit: contain; max-height: 140px; border: none;">
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
      <a href="${link}" target="_blank" rel="nofollow noopener" style="flex: 1; min-width: 250px; display:flex; align-items:center; text-decoration:none; color:inherit; background:var(--bg-surface); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-strong); gap: 16px; box-shadow: var(--shadow-sm); outline:none; position:relative;">
        <div style="background: white; border-radius: var(--radius-sm); padding: 8px; flex-shrink: 0; width: 90px; height: 90px; display:flex; justify-content:center; align-items:center;">
          <img src="${img}" alt="${product.title}" style="max-height: 100%; max-width: 100%; object-fit: contain; border: none;">
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
    <div class="ad-container ad-banner-bottom ad-wrap-bottom glass-ad-panel" id="sticky-bottom-banner" style="margin: 0; border-radius: 0; text-align: center; box-shadow: 0 -8px 32px rgba(0,0,0,0.4); background: var(--bg-surface); padding: 16px 0; border-top: 1px solid var(--border-strong); display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 2rem;">
      <span class="ad-label" style="font-size: 0.65rem; position:absolute; top: -20px; background: var(--bg-surface-2); border: 1px solid var(--border-strong); border-bottom: none; color: var(--text-primary); padding: 4px 12px; border-radius: 8px 8px 0 0; right: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">You Might Also Like</span>
  `;

  products.forEach(product => {
    const link = getAmazonLink(product.asin);
    const img = getAmazonImageUrl(product.asin);

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
      </a>
    `;
  });

  html += `
      <button onclick="document.getElementById('sticky-bottom-banner').style.display='none'; document.body.style.paddingBottom='0';" style="position:absolute; right: 24px; top: 12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem;">&times;</button>
    </div>
  `;
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarWidgets();
  renderTopBanner();
  renderBottomBanner();
  renderInlineBanner();
  renderGridWidget();
});




function renderInlineBanner() {
  const container = document.getElementById('amazon-widget-inline');
  if (!container) return;
  const products = AMAZON_PRODUCTS.slice(10, 12);
  let html = \<div class="ad-container ad-banner-inline" style="display:flex; flex-wrap:wrap; gap:16px; margin:24px 0;">\;
  products.forEach(p => {
    html += \
      <a href="\" target="_blank" rel="nofollow noopener" style="flex:1; min-width:250px; display:flex; align-items:center; background:var(--bg-surface); padding:12px; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); text-decoration:none; color:inherit;">
        <img src="\" loading="lazy" style="width:60px; height:60px; object-fit:contain; background:white; padding:4px; border-radius:var(--radius-sm); margin-right:16px;" alt="\">
        <div>
          <h4 style="margin:0 0 4px; font-size:0.9rem; font-weight:800; color:var(--text-primary);">\</h4>
          <span class="btn \ btn-sm" style="font-size:0.7rem; padding:4px 10px;">View</span>
        </div>
      </a>
    \;
  });
  html += \</div>\;
  container.innerHTML = html;
}

function renderGridWidget() {
  const container = document.getElementById('amazon-widget-grid');
  if (!container) return;
  const products = AMAZON_PRODUCTS.slice(12, 16);
  let html = \<div class="ad-container ad-widget-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin:24px 0;">\;
  products.forEach(p => {
    html += \
      <a href="\" target="_blank" rel="nofollow noopener" style="display:flex; flex-direction:column; align-items:center; background:var(--bg-surface); padding:16px; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); text-decoration:none; color:inherit; text-align:center;">
        <img src="\" loading="lazy" style="width:100px; height:100px; object-fit:contain; background:white; padding:8px; border-radius:var(--radius-md); margin-bottom:12px;" alt="\">
        <h4 style="margin:0 0 8px; font-size:0.85rem; font-weight:700; color:var(--text-primary);">\</h4>
        <span class="btn \ btn-sm" style="font-size:0.75rem; padding:6px 12px;">\</span>
      </a>
    \;
  });
  html += \</div>\;
  container.innerHTML = html;
}
