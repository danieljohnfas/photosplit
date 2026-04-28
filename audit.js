const fs = require('fs');
const files = [
  'index.html', 'app.html', 'about.html', 'tips.html', 'privacy.html', 
  'terms.html', 'resize.html', 'crop.html', 'convert.html', 'passport.html', 
  'blog/index.html', 'blog/how-to-digitize-photo-album.html', 
  'blog/best-scanner-settings-for-photos.html'
];
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const cmp = content.includes('fundingchoicesmessages.google.com');
    const adsense = content.includes('pagead2.googlesyndication.com');
    const title = /<title>.*<\/title>/.test(content);
    const desc = /name="description"/.test(content);
    const canon = /rel="canonical"/.test(content);
    const h1 = /<h1/.test(content);
    const viewport = /name="viewport"/.test(content);
    console.log(`${f}:`);
    console.log(`  CMP: ${cmp}, AdSense: ${adsense}, Title: ${title}, Desc: ${desc}, Canon: ${canon}, H1: ${h1}, Viewport: ${viewport}`);
  } catch(e) {
    console.log(`Missing: ${f}`);
  }
}
