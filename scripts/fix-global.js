const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add Crop to Nav
  // The nav typically looks like:
  // <a href="/convert.html" title="Batch Image Converter">Convert</a>
  // <a href="/passport.html" title="Passport Photo Maker">Passport</a>
  // Let's insert Crop before Convert.
  if (content.includes('<a href="/convert.html"')) {
    if (!content.includes('<a href="/crop.html"')) {
      content = content.replace(
        '<a href="/convert.html"',
        '<a href="/crop.html" title="Image Cropper">Crop</a>\n        <a href="/convert.html"'
      );
    }
  }

  // 2. Remove ads from Trust Pages (about.html, contact.html, terms.html, privacy-policy.html)
  if (['about.html', 'contact.html', 'terms.html', 'privacy-policy.html'].includes(file)) {
    // Remove amazon-widget-featured
    content = content.replace(/<!-- FEATURED AD STRIP -->[\s\S]*?<!-- END FEATURED AD STRIP -->/g, '');
    // Remove amazon-widget-inline
    content = content.replace(/<div id="amazon-widget-inline"><\/div>/g, '');
    // Remove amazon-widget-grid
    content = content.replace(/<div id="amazon-widget-grid"><\/div>/g, '');
    // Remove inline products from tips.html (but tips is not in the array so this is skipped)
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Processed root html files');
