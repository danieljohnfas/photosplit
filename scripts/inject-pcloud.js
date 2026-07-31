const fs = require('fs');
let content = fs.readFileSync('js/amazon-products.js', 'utf8');

const pCloudProducts = `
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
  },`;

if (!content.includes('pcloud.com')) {
  content = content.replace('let AMAZON_PRODUCTS = [', 'let AMAZON_PRODUCTS = [\n' + pCloudProducts);
  fs.writeFileSync('js/amazon-products.js', content, 'utf8');
  console.log('Added pCloud to amazon-products.js');
} else {
  console.log('pCloud already exists');
}
