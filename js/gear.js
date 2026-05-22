/**
 * PhotoSplit Studio — gear.js
 * Dynamic Amazon Associates affiliate product system.
 *
 * Features:
 *  - 30+ curated products across 8 categories
 *  - Page-specific product pools (different products per tool page)
 *  - Daily rotation: seeded RNG from date + page slug → 6 fresh picks/day
 *  - Zero server calls — all deterministic from client date
 */

'use strict';

/* ─── PRODUCT CATALOG ──────────────────────────────────────────────────────
   Each entry: { id, badge, title, desc, asin, img, categories[] }
   Categories: 'scanner','storage','printing','preservation','cleaning',
               'display','passport','film','camera'
────────────────────────────────────────────────────────────────────────── */
const GEAR_CATALOG = [

  /* ── SCANNERS ────────────────────────────────────────────────────────── */
  {
    id: 'epson-v600',
    badge: 'Best Overall',
    title: 'Epson Perfection V600 Photo Scanner',
    desc: 'The gold standard for home photo archiving. Ultra-high 6400 DPI resolution, Digital ICE dust removal, and film negative holders included.',
    asin: 'B002OEBMRU',
    img: '/assets/images/epson-v600.png',
    categories: ['scanner', 'film'],
  },
  {
    id: 'canon-lide400',
    badge: 'Budget Pick',
    title: 'Canon CanoScan LiDE 400',
    desc: 'Incredibly thin USB-powered flatbed scanner. 4800 DPI, auto-scan button, and a contact image sensor for fast, quiet operation.',
    asin: 'B07G5X1N1H',
    img: '/assets/images/canon-lide400.png',
    categories: ['scanner'],
  },
  {
    id: 'epson-v39',
    badge: 'Entry-Level',
    title: 'Epson Perfection V39 Flatbed Scanner',
    desc: 'Compact 4800×4800 DPI flatbed ideal for scanning prints and documents. One-touch scanning and LED-lit sensor for accurate colors.',
    asin: 'B01LXVTXKI',
    img: '/assets/images/cat_scanner.png',
    categories: ['scanner'],
  },
  {
    id: 'fujitsu-scansnap',
    badge: 'High-Speed',
    title: 'Fujitsu ScanSnap iX1600',
    desc: 'Scan 40 pages per minute with WiFi and ADF. The ultimate sheet-fed scanner for bulk document and photo digitisation.',
    asin: 'B08PH5Q51P',
    img: '/assets/images/cat_scanner.png',
    categories: ['scanner'],
  },
  {
    id: 'plustek-opticfilm',
    badge: 'For Film & Negatives',
    title: 'Plustek OpticFilm 8200i SE',
    desc: '7200 DPI dedicated film scanner with infrared dust and scratch removal. Ideal for 35mm negatives, slides, and medium format film.',
    asin: 'B00971XU8Q',
    img: '/assets/images/plustek-opticfilm.png',
    categories: ['scanner', 'film'],
  },
  {
    id: 'kodak-scanza',
    badge: 'Standalone',
    title: 'Kodak SCANZA Film Scanner',
    desc: 'Convert 35mm, 126, 110 and Super 8 film to JPEG with no computer needed. Built-in SD card slot and 3.5" LCD preview screen.',
    asin: 'B075T63KRS',
    img: '/assets/images/cat_scanner.png',
    categories: ['scanner', 'film'],
  },

  /* ── STORAGE & BACKUP ─────────────────────────────────────────────────── */
  {
    id: 'wd-my-passport',
    badge: 'Best Backup HDD',
    title: 'WD 4TB My Passport Portable Drive',
    desc: 'Slim 4TB portable drive holds over 400,000 high-res scans. Hardware AES-256 encryption and USB-C connectivity for modern laptops.',
    asin: 'B07VTW2LPX',
    img: '/assets/images/wd-my-passport.png',
    categories: ['storage'],
  },
  {
    id: 'samsung-t7',
    badge: 'Fastest Portable SSD',
    title: 'Samsung T7 Portable SSD 2TB',
    desc: 'Up to 1,050 MB/s transfer speed. Shock-resistant metal body, pocket-sized for off-site backups and fast on-the-go access.',
    asin: 'B0874XWW23',
    img: '/assets/images/samsung-t7.png',
    categories: ['storage'],
  },
  {
    id: 'seagate-expansion',
    badge: 'High Capacity',
    title: 'Seagate Expansion 8TB Desktop Drive',
    desc: '8TB of desktop storage perfect for a complete family photo archive. Plug-and-play with USB 3.0 for fast transfers.',
    asin: 'B00TKFEEAS',
    img: '/assets/images/cat_storage.png',
    categories: ['storage'],
  },
  {
    id: 'sandisk-extreme-ssd',
    badge: 'Weather-Resistant',
    title: 'SanDisk 2TB Extreme Portable SSD',
    desc: 'IP55 water/dust resistance and 1,050 MB/s read speeds. Drop protection up to 2m — perfect for photographers on the move.',
    asin: 'B08HN38TTG',
    img: '/assets/images/cat_storage.png',
    categories: ['storage'],
  },
  {
    id: 'samsung-sdxc',
    badge: 'High-Speed SD Card',
    title: 'Samsung Pro Plus 256GB SD Card',
    desc: '180 MB/s read speed for 4K capture. UHS-I U3 V30 rated — reliable for cameras, scanners, and direct card-to-drive transfers.',
    asin: 'B09CBLJ7JV',
    img: '/assets/images/cat_storage.png',
    categories: ['storage'],
  },
  {
    id: 'usb-hub',
    badge: 'Multi-Port Hub',
    title: 'Anker 10-Port USB 3.0 Hub',
    desc: 'Connect your scanner, drives, card readers and more simultaneously. Individual power switches for each port and a 60W power adapter.',
    asin: 'B00VDVCQ84',
    img: '/assets/images/cat_storage.png',
    categories: ['storage'],
  },

  /* ── PHOTO PRINTING ───────────────────────────────────────────────────── */
  {
    id: 'canon-selphy',
    badge: 'Best Compact Printer',
    title: 'Canon SELPHY CP1500 Photo Printer',
    desc: 'Dye-sublimation prints at 300×300 DPI with a WiFi connection. Perfect for passport photos and 4×6 prints — with a 108-sheet paper pack.',
    asin: 'B09G4MLKBY',
    img: '/assets/images/cat_printing.png',
    categories: ['printing', 'passport'],
  },
  {
    id: 'epson-ecotank',
    badge: 'Ink Tank Printer',
    title: 'Epson EcoTank ET-2803 All-In-One',
    desc: 'Supertank inkjet with 2 years of ink included. Print 4×6 borderless photos at home for pennies each — no cartridge costs.',
    asin: 'B09RNY7YWB',
    img: '/assets/images/cat_printing.png',
    categories: ['printing'],
  },
  {
    id: 'canon-mg3620',
    badge: 'All-in-One',
    title: 'Canon PIXMA MG3620 Wireless Printer',
    desc: 'Wireless all-in-one inkjet with borderless photo printing. AirPrint and Google Cloud Print support for easy mobile printing.',
    asin: 'B01GKQDO64',
    img: '/assets/images/cat_printing.png',
    categories: ['printing'],
  },
  {
    id: 'hp-sprocket',
    badge: 'Pocket Printer',
    title: 'HP Sprocket Portable Photo Printer',
    desc: 'Bluetooth pocket printer that uses Zink zero-ink paper. Great for instant 2×3" prints from your phone — no ink cartridges.',
    asin: 'B07BNQHCPG',
    img: '/assets/images/cat_printing.png',
    categories: ['printing'],
  },

  /* ── PHOTO PRESERVATION ───────────────────────────────────────────────── */
  {
    id: 'photo-albums',
    badge: 'Archival Quality',
    title: 'Kodak Photo Album — Acid-Free 4×6',
    desc: 'Holds 360 photos in acid-free, lignin-free sleeves. PVC-free pages that won\'t yellow or damage your prints over decades.',
    asin: 'B001018M5OA',
    img: '/assets/images/cat_preservation.png',
    categories: ['preservation', 'display'],
  },
  {
    id: 'archival-sleeves',
    badge: 'Museum-Grade',
    title: 'Print File Archival Polypropylene Sleeves (100-Pack)',
    desc: 'Crystal-clear, anti-static polypropylene sleeves. Used by professional archivists and museums to protect prints for 100+ years.',
    asin: 'B001018M5OA',
    img: '/assets/images/cat_preservation.png',
    categories: ['preservation'],
  },
  {
    id: 'photo-boxes',
    badge: 'Organiser',
    title: 'Iris USA Photo Storage Box (6-Pack)',
    desc: 'Stackable, airtight photo boxes with index card dividers. Fits 1,600 4×6 prints — perfect for sorting by year or event.',
    asin: 'B003BWCLME',
    img: '/assets/images/cat_preservation.png',
    categories: ['preservation'],
  },
  {
    id: 'humidity-monitor',
    badge: 'Climate Control',
    title: 'Govee Humidity & Temperature Monitor',
    desc: 'Protect your archive room from humidity spikes. Real-time alerts and 2-year data logging via the Govee app.',
    asin: 'B08L4RZCFW',
    img: '/assets/images/cat_preservation.png',
    categories: ['preservation'],
  },

  /* ── CLEANING & MAINTENANCE ───────────────────────────────────────────── */
  {
    id: 'giottos-blower',
    badge: 'Essential',
    title: 'Giottos Rocket Air Blower',
    desc: 'Safely removes dust from scanner glass and photos without touching the surface. The #1 tool before every scanning session.',
    asin: 'B00017LSPI',
    img: '/assets/images/giottos-blower.png',
    categories: ['cleaning'],
  },
  {
    id: 'magicfiber-cloth',
    badge: 'Glass Cleaning',
    title: 'MagicFiber Microfiber Cleaning Cloths (6-Pack)',
    desc: 'Ultra-fine 400 GSM cloths for streak-free scanner platen cleaning. Safe on glass, lenses, and LCD screens.',
    asin: 'B0050R67U0',
    img: '/assets/images/cat_cleaning.png',
    categories: ['cleaning'],
  },
  {
    id: 'compressed-air',
    badge: 'Dust Removal',
    title: 'Falcon Dust-Off Compressed Air (4-Pack)',
    desc: 'HFC-free compressed air to blast dust from film negatives, scanner beds, and optical components. 10 oz cans with flexible straw.',
    asin: 'B00DZYAYES',
    img: '/assets/images/cat_cleaning.png',
    categories: ['cleaning'],
  },
  {
    id: 'sensor-swabs',
    badge: 'Pro Cleaning',
    title: 'Photographic Solutions Sensor Swabs',
    desc: 'Pre-moistened sensor swabs for professional cleaning of scanner CCDs and optical elements. Lint-free and anti-static.',
    asin: 'B002YALOX8',
    img: '/assets/images/cat_cleaning.png',
    categories: ['cleaning'],
  },

  /* ── DISPLAY & FRAMES ────────────────────────────────────────────────── */
  {
    id: 'digital-frame',
    badge: 'Top-Rated',
    title: 'Aura Carver Digital Photo Frame',
    desc: '10.1" HD display with WiFi and free unlimited cloud storage. Share photos directly from your digitized archive — the best digital frame available.',
    asin: 'B08HWXCJHV',
    img: '/assets/images/cat_display.png',
    categories: ['display'],
  },
  {
    id: 'nixplay-frame',
    badge: 'Smart Frame',
    title: 'Nixplay 10.1" Smart Digital Frame',
    desc: 'Motion sensor, 1280×800 IPS display, and an app for sharing photos from anywhere. Pairs perfectly with PhotoSplit Studio exports.',
    asin: 'B01L01UE2W',
    img: '/assets/images/cat_display.png',
    categories: ['display'],
  },
  {
    id: 'shadow-box',
    badge: 'Keepsake',
    title: 'Rustic Farmhouse Shadow Box Frame Set',
    desc: 'Set of 3 shadow box frames for creating photo collage displays with mementos. Makes a beautiful gift from digitized family archives.',
    asin: 'B076CGLK14',
    img: '/assets/images/cat_display.png',
    categories: ['display'],
  },

  /* ── PASSPORT & ID TOOLS ──────────────────────────────────────────────── */
  {
    id: 'passport-wallet',
    badge: 'Travel Essential',
    title: 'Zero Grid Travel Passport Wallet',
    desc: 'RFID-blocking passport organizer fits your passport, cards, and boarding passes. Matches perfectly with a fresh passport photo print.',
    asin: 'B01LPQEPEC',
    img: '/assets/images/cat_passport.png',
    categories: ['passport'wallet.png',
    categories: ['passport'],
  },
  {
    id: 'photo-paper-4x6',
    badge: 'Best Photo Paper',
    title: 'HP Everyday Photo Paper 4×6 (100 Sheets)',
    desc: 'Instant-dry glossy 200g photo paper for vivid, professional-quality prints. Works with all inkjet printers including Canon SELPHY.',
    asin: 'B00004TT48',
    img: '/assets/images/cat_passport.png',
    categories: ['passport', 'printing'],
  },
  {
    id: 'id-card-holder',
    badge: 'Protection',
    title: 'Card Sleeve RFID Blocking Wallet (12-Pack)',
    desc: 'Ultra-thin RFID blocking card sleeves to protect ID cards and passport cards. Works with any wallet.',
    asin: 'B07W8RZ5TF',
    img: '/assets/images/cat_passport.png',
    categories: ['passport'],
  },

  /* ── CAMERAS (for "scan with phone" flow) ────────────────────────────── */
  {
    id: 'phone-stand',
    badge: 'Copy Stand',
    title: 'Neewer Overhead Camera Stand',
    desc: 'Adjustable overhead copy stand for flat-lay photo scanning with your phone. Copy old photos without a flatbed scanner.',
    asin: 'B07YKPMQC7',
    img: '/assets/images/cat_camera.png',
    categories: ['camera', 'scanner'],
  },
  {
    id: 'led-light-panel',
    badge: 'Even Lighting',
    title: 'Elgato Key Light Air LED Panel',
    desc: 'Dimmable 1400 lm LED panel for shadow-free scanning. App-controlled color temperature (2900–7000K) for perfect photo capture lighting.',
    asin: 'B08TG9XNRQ',
    img: '/assets/images/cat_camera.png',
    categories: ['camera'],
  },
];

/* ─── PAGE-TYPE PRODUCT POOLS ──────────────────────────────────────────────
   Maps URL path patterns to weighted category lists.
   Products are picked from these categories during daily rotation.
────────────────────────────────────────────────────────────────────────── */
const PAGE_POOLS = {
  // Main photo-splitting app — heavy on scanners, storage
  app:        ['scanner', 'scanner', 'storage', 'storage', 'cleaning', 'film'],
  // Social media resizer — printing and display
  resize:     ['printing', 'printing', 'display', 'storage', 'scanner', 'cleaning'],
  // Image cropper — general preservation and display
  crop:       ['display', 'display', 'preservation', 'printing', 'storage', 'cleaning'],
  // Bulk converter — storage-heavy
  convert:    ['storage', 'storage', 'storage', 'scanner', 'cleaning', 'display'],
  // Passport photo maker — passport-specific, printing
  passport:   ['passport', 'passport', 'passport', 'printing', 'printing', 'storage'],
  // Scanning tips editorial — cleaning, scanner gear
  tips:       ['cleaning', 'cleaning', 'scanner', 'scanner', 'preservation', 'film'],
  // Blog — preservation, storage, scanners
  blog:       ['scanner', 'preservation', 'storage', 'cleaning', 'film', 'display'],
  // About/Contact/generic
  default:    ['scanner', 'storage', 'cleaning', 'preservation', 'printing', 'display'],
};

/* ─── UTILITY: SEEDED LCG RANDOM NUMBER GENERATOR ─────────────────────────
   Deterministic shuffle — same seed always produces the same order.
   Seed = dayOfYear × 1000 + pageIndex so each day AND each page differs.
────────────────────────────────────────────────────────────────────────── */
function createSeededRng(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    // Marsaglia xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function getDaySeed() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay); // 1–366
}

function fisherYatesShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── PAGE TYPE DETECTION ───────────────────────────────────────────────── */
const PAGE_TYPE_MAP = [
  { pattern: /\/app\b/,      type: 'app'      },
  { pattern: /\/resize\b/,   type: 'resize'   },
  { pattern: /\/crop\b/,     type: 'crop'     },
  { pattern: /\/convert\b/,  type: 'convert'  },
  { pattern: /\/passport\b/, type: 'passport' },
  { pattern: /\/tips\b/,     type: 'tips'     },
  { pattern: /\/blog/,       type: 'blog'     },
];

function detectPageType() {
  const path = window.location.pathname;
  for (const { pattern, type } of PAGE_TYPE_MAP) {
    if (pattern.test(path)) return type;
  }
  return 'default';
}

/* ─── PRODUCT SELECTION ─────────────────────────────────────────────────── */
function pickDailyProducts(pageType, count = 6) {
  const pool = PAGE_POOLS[pageType] || PAGE_POOLS.default;
  const daySeed = getDaySeed();

  // Each page type gets a unique offset so pages differ even on the same day
  const pageOffset = Object.keys(PAGE_POOLS).indexOf(pageType) * 97;
  const rng = createSeededRng(daySeed * 1000 + pageOffset);

  // Build a list of candidate product IDs matching the pool categories
  // Use the pool list as a weighted category draw
  const shuffledPool = fisherYatesShuffle(pool, rng);

  const picked = [];
  const usedIds = new Set();

  for (const category of shuffledPool) {
    if (picked.length >= count) break;

    // Get all products in this category, shuffle them, pick first unused
    const candidates = GEAR_CATALOG.filter(
      p => p.categories.includes(category) && !usedIds.has(p.id)
    );
    const shuffled = fisherYatesShuffle(candidates, createSeededRng(daySeed + pageOffset + picked.length));
    if (shuffled.length > 0) {
      picked.push(shuffled[0]);
      usedIds.add(shuffled[0].id);
    }
  }

  // Fallback: if we still need more, fill from the full catalog
  if (picked.length < count) {
    const remaining = fisherYatesShuffle(
      GEAR_CATALOG.filter(p => !usedIds.has(p.id)),
      createSeededRng(daySeed + pageOffset + 999)
    );
    for (const prod of remaining) {
      if (picked.length >= count) break;
      picked.push(prod);
    }
  }

  return picked.slice(0, count);
}

/* ─── RENDER ────────────────────────────────────────────────────────────── */
function buildProductCard(prod) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <span class="product-badge">${prod.badge}</span>
    <img src="${prod.img}" alt="${prod.title}" loading="lazy" onerror="this.style.display='none'" />
    <div class="product-info">
      <h3 class="product-title">${prod.title}</h3>
      <p>${prod.desc}</p>
      <a class="buy-btn"
         href="https://www.amazon.com/s?k=${encodeURIComponent(prod.title)}&tag=photoid03-20"
         target="_blank"
         rel="sponsored noopener">View on Amazon →</a>
    </div>
  `;
  return card;
}

function renderGearGrids() {
  const grids = document.querySelectorAll('.gear-cards-grid');
  if (!grids.length) return;

  const pageType = detectPageType();

  grids.forEach((grid, gridIndex) => {
    // Allow a per-grid page type override via data attribute
    const overrideType = grid.getAttribute('data-page-type');
    const effectiveType = overrideType || pageType;

    // Allow a per-grid count override (default 6)
    const count = parseInt(grid.getAttribute('data-count') || '6', 10);

    // Use a slightly different seed per grid on the same page
    const daySeed = getDaySeed();
    const pageOffset = Object.keys(PAGE_POOLS).indexOf(effectiveType) * 97;
    const gridSeed = daySeed * 1000 + pageOffset + gridIndex * 31;

    const products = pickDailyProducts(effectiveType, count);

    grid.innerHTML = '';
    products.forEach(prod => grid.appendChild(buildProductCard(prod)));
  });
}

/* ─── INIT ──────────────────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGearGrids);
} else {
  renderGearGrids();
}
