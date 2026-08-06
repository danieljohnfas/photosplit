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
    asin: "B0B9G29PJ3",
    title: "Popotop Large Photo Album Self Adhesive 4x6 5x7...",
    desc: "4.6 ⭐ $15.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91kMkWlnoxL._AC_UL320_.jpg"
  },
  {
    asin: "B0BW876C87",
    title: "Popotop Photo Album Self Adhesive Scrapbook Alb...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91mdXUTZ+9L._AC_UL320_.jpg"
  },
  {
    asin: "B0C4F4ZHCT",
    title: "Artfeel Photo Album 4x6 with 300 Pockets,Slip-i...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81olagqUSDL._AC_UL320_.jpg"
  },
  {
    asin: "B0CCD71M4J",
    title: "Artfeel Photo Album Self Adhesive Scrapbook,Lar...",
    desc: "4.7 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81cv-4DCAEL._AC_UL320_.jpg"
  },
  {
    asin: "B07W5F37GZ",
    title: "Ywlake Photo Album 4x6 500 Pockets Photo, Extra...",
    desc: "4.6 ⭐ $15.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61pci7+wR5L._AC_UL320_.jpg"
  },
  {
    asin: "B0CGCWY7ZJ",
    title: "Popotop Photo Album 4x6 200 Pockets for Wedding...",
    desc: "4.4 ⭐ $12.59. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/710a1XchpeL._AC_UL320_.jpg"
  },
  {
    asin: "B0H1PVFWS7",
    title: "2x3 Photo Album for Instax Mini & Polaroid, Hol...",
    desc: "5 ⭐ $9.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/717Ca1VT4xL._AC_UL320_.jpg"
  },
  {
    asin: "B0C4F4ZHCT",
    title: "Artfeel Photo Album 4x6 with 300 Pockets,Slip-i...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81olagqUSDL._AC_UL320_.jpg"
  },
  {
    asin: "B0B9G29PJ3",
    title: "Popotop Large Photo Album Self Adhesive 4x6 5x7...",
    desc: "4.6 ⭐ $15.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91kMkWlnoxL._AC_UL320_.jpg"
  },
  {
    asin: "B0BXDQKD5C",
    title: "Large Photo Album Self Adhesive Scrapbook Album...",
    desc: "4.7 ⭐ $11.89. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81SGTWVrSxL._AC_UL320_.jpg"
  },
  {
    asin: "B09TKN5J3Z",
    title: "Artmag Photo Album 4x6 300 Photos, Extra Large ...",
    desc: "4.7 ⭐ $16.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71CJrvKnQYL._AC_UL320_.jpg"
  },
  {
    asin: "B0956PXVB9",
    title: "Large Photo Album Self Adhesive for 4x6 5x7 8x1...",
    desc: "4.7 ⭐ $14.39. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81EOJjRZW4L._AC_UL320_.jpg"
  },
  {
    asin: "B0BJV2S53N",
    title: "Lanpn Photo Album 4x6 600 Pockets Photos, Linen...",
    desc: "4.7 ⭐ $25.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71GAmlpQl7L._AC_UL320_.jpg"
  },
  {
    asin: "B09TKQQ9JC",
    title: "Artmag Fabric Photo Album 4x6 300 Large Capacit...",
    desc: "4.6 ⭐ $15.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71+jAKiLnLL._AC_UL320_.jpg"
  },
  {
    asin: "B0H718D8NS",
    title: "2Pcs 3Inch Mini Photo Card Binder with 40 Pocke...",
    desc: "$9.39. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/61tHR0WWuZL._AC_UL320_.jpg"
  },
  {
    asin: "B001VGJ4DG",
    title: "3-ring pocket BURGUNDY album for 504 photos - 4...",
    desc: "4.6 ⭐ $13.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81kliYyfuLL._AC_UL320_.jpg"
  },
  {
    asin: "B0FT7YJBFW",
    title: "Popotop 2 Pack Photo Album 4x6 Pictures, Small ...",
    desc: "4.7 ⭐ $5.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/8131DpUU1lL._AC_UL320_.jpg"
  },
  {
    asin: "B003WSWFBY",
    title: "Pioneer Photo Albums Magnetic Self-Stick 3-Ring...",
    desc: "4.6 ⭐ $16.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91pMvmUnanL._AC_UL320_.jpg"
  },
  {
    asin: "B09YY686TV",
    title: "Spbapr Large Photo Album Self Adhesive Linen Co...",
    desc: "4.6 ⭐ $15.98. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91pjfCbQDfL._AC_UL320_.jpg"
  },
  {
    asin: "B08F21W5KH",
    title: "Photo Album 4x6 Pictures, 600 Pockets, Linen Co...",
    desc: "4.7 ⭐ $23.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91-+KhZBfQL._AC_UL320_.jpg"
  },
  {
    asin: "B077N244XL",
    title: "Zoview Self-Adhesive Photo Album, Dust-free, gl...",
    desc: "4.8 ⭐ $26.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81vxPYbGi-L._AC_UL320_.jpg"
  },
  {
    asin: "B087989GKB",
    title: "Black Large Self-Adhesive Photo Album, PU Leath...",
    desc: "4.7 ⭐ $27.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/A15fRWOR31L._AC_UL320_.jpg"
  },
  {
    asin: "B08F21W5KH",
    title: "Photo Album 4x6 Pictures, 600 Pockets, Linen Co...",
    desc: "4.7 ⭐ $23.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91-+KhZBfQL._AC_UL320_.jpg"
  },
  {
    asin: "B09LRK8WLJ",
    title: "Keepsake Baby Memory Book – Timeless Gender Neu...",
    desc: "4.9 ⭐ $29.95. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81E+vxYLd8L._AC_UL320_.jpg"
  },
  {
    asin: "B0BZYQ1MLV",
    title: "Artfeel Photo Album Self Adhesive Scrapbook Alb...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81fRwGeptbL._AC_UL320_.jpg"
  },
  {
    asin: "B001VGH44C",
    title: "Pioneer Photo Albums STC-504 Navy Blue Photo Al...",
    desc: "4.6 ⭐ $11.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81FRcaCf+uL._AC_UL320_.jpg"
  },
  {
    asin: "B0BW876C87",
    title: "Popotop Photo Album Self Adhesive Scrapbook Alb...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91mdXUTZ+9L._AC_UL320_.jpg"
  },
  {
    asin: "B0CSMDS9RQ",
    title: "Photo Album 4x6 300 Photos, Genuine Leather Pho...",
    desc: "4.6 ⭐ $26.98. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71jKdqEobIL._AC_UL320_.jpg"
  },
  {
    asin: "B0CCD71M4J",
    title: "Artfeel Photo Album Self Adhesive Scrapbook,Lar...",
    desc: "4.7 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81cv-4DCAEL._AC_UL320_.jpg"
  },
  {
    asin: "B0BR7SMMBC",
    title: "Popotop Photo Album 4x6-300 Photos Linen Cover ...",
    desc: "4.6 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/7196mkbSS+L._AC_UL320_.jpg"
  },
  {
    asin: "B08Z76J9YT",
    title: "Scrapbook Album 60 Pages (8 x 8 Inch) Brown Pho...",
    desc: "4.6 ⭐ $5.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/811vh6RIoVL._AC_UL320_.jpg"
  },
  {
    asin: "B0FDK2DJJX",
    title: "Holoary Photo Album 4x6 500 Photos 5 Pictures P...",
    desc: "4.8 ⭐ $23.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/61eea+dWBkL._AC_UL320_.jpg"
  },
  {
    asin: "B08LKJ31GT",
    title: "Vienrose 4x6 Photo Album,300 Pockets,Linen Cove...",
    desc: "4.6 ⭐ $12.34. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91EliDDPoOL._AC_UL320_.jpg"
  },
  {
    asin: "B09FHT8TZ8",
    title: "Our Adventure Book Vintage Scrapbook Journal | ...",
    desc: "4.8 ⭐ $19.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/813o3E45ASL._AC_UL320_.jpg"
  },
  {
    asin: "B0D4YYWHJ7",
    title: "Beautiful Linen Photo Album For 4x6 Photos - Ho...",
    desc: "4.7 ⭐ $19.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91Mj-OajSqL._AC_UL320_.jpg"
  },
  {
    asin: "B0D78XY39C",
    title: "Holoary Photo Album 4x6 500 Photos 5 Pictures P...",
    desc: "4.8 ⭐ $23.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81CYuZdhedL._AC_UL320_.jpg"
  },
  {
    asin: "B08F1ND8QD",
    title: "Photo Album 4x6 Pictures, 600 Pockets, Linen Co...",
    desc: "4.7 ⭐ $23.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/91ZfmIileZL._AC_UL320_.jpg"
  },
  {
    asin: "B0C5C5V3PF",
    title: "4x6 Photo Album Holds 240 Photos Writing Space,...",
    desc: "4.6 ⭐ $13.98. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71WxroqTYsL._AC_UL320_.jpg"
  },
  {
    asin: "B0FSL27H7Y",
    title: "4x6 Slip In Photo Album Holds 200 Pockets Cloth...",
    desc: "4.6 ⭐ $9.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81py8wo-FWL._AC_UL320_.jpg"
  },
  {
    asin: "B0FM8S2948",
    title: "Wedding Photo Album 4x6 Pictures & Custom 2026 ...",
    desc: "4.8 ⭐ $37.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/91rkDGIuaoL._AC_UL320_.jpg"
  },
  {
    asin: "B091YKMS28",
    title: "JIMBON Our Adventure Book Scrapbook Photo Album...",
    desc: "4.7 ⭐ $25.99. Get the best gear for your photography workflow.",
    badge: "Top Pick",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/916M9ABLibL._AC_UL320_.jpg"
  },
  {
    asin: "B0956PXVB9",
    title: "Large Photo Album Self Adhesive for 4x6 5x7 8x1...",
    desc: "4.7 ⭐ $14.39. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81EOJjRZW4L._AC_UL320_.jpg"
  },
  {
    asin: "B0CJXNGY4T",
    title: "8\"x8\" Scrapbook Photo Album Linen Cover 20 Shee...",
    desc: "4.7 ⭐ $9.99. Get the best gear for your photography workflow.",
    badge: "Essential",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81yOD7UNG3L._AC_UL320_.jpg"
  },
  {
    asin: "B07L4CNRX7",
    title: "Vienrose Large Self Adhesive Photo Album with W...",
    desc: "4.7 ⭐ $14.99. Get the best gear for your photography workflow.",
    badge: "Pro Choice",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/81ufvD1AGEL._AC_UL320_.jpg"
  },
  {
    asin: "B001AUA5XQ",
    title: "Pioneer Sewn Bonded Leather BookBound Bi-Direct...",
    desc: "4.6 ⭐ $19.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71FvqmoghkL._AC_UL320_.jpg"
  },
  {
    asin: "B0CJ4J8RQY",
    title: "450 Pocket 4x6 Photo Album with Writing Space, ...",
    desc: "4.7 ⭐ $21.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/71Urmt2YuRL._AC_UL320_.jpg"
  },
  {
    asin: "B08BJMBBKV",
    title: "RECUTMS Photo Album 4x6 Pictures 600 Pockets, L...",
    desc: "4.8 ⭐ $22.99. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71cFdeNrrPL._AC_UL320_.jpg"
  },
  {
    asin: "B000S15HWM",
    title: "Fabric Frame Cover Photo Album 200 Pockets Hold...",
    desc: "4.7 ⭐ $15.99. Get the best gear for your photography workflow.",
    badge: "Deal",
    btnClass: "btn-primary",
    img: "https://m.media-amazon.com/images/I/717gyafKd8L._AC_UL320_.jpg"
  },
  {
    asin: "B09T816MTD",
    title: "4x6 Photo Albums - (Set of 8), by Paper Plan, M...",
    desc: "4.7 ⭐ $7.99. Get the best gear for your photography workflow.",
    badge: "Popular",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/81fTVEi0j9L._AC_UL320_.jpg"
  },
  {
    asin: "B0BY5DJKP1",
    title: "Photo Album 4x6 200 Photos Linen Cover Picture ...",
    desc: "4.5 ⭐ $6.49. Get the best gear for your photography workflow.",
    badge: "Storage",
    btnClass: "btn-secondary",
    img: "https://m.media-amazon.com/images/I/71C3cRvatTL._AC_UL320_.jpg"
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
