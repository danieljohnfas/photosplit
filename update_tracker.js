const fs = require('fs');
const files = [
  'index.html', 'app.html', 'tips.html', 'privacy.html', 
  'terms.html', 'resize.html', 'crop.html', 'convert.html', 'passport.html', 
  'blog/index.html', 'blog/how-to-digitize-photo-album.html', 
  'blog/best-scanner-settings-for-photos.html'
];

const oldPixelPart = 'localStorage.getItem("ps_counted")';
const newPixel = '  <!-- Hit Tracker (Unique Visitors Only) -->\n  <script>\n    if (!localStorage.getItem("ps_counted")) {\n      localStorage.setItem("ps_counted", "true");\n      new Image().src = "https://hitscounter.dev/api/hit?url=https%3A%2F%2Fphotosplitstudio.com&label=Visits&color=%23002d72&style=flat-square&tz=UTC";\n    }\n  </script>\n';

files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    // Find the existing script block
    const startIdx = c.indexOf('<!-- Hit Tracker');
    if (startIdx !== -1) {
      const endIdx = c.indexOf('</script>', startIdx) + 9;
      if (endIdx > 9) {
        const oldContent = c.substring(startIdx, endIdx);
        c = c.replace(oldContent, newPixel);
        fs.writeFileSync(f, c);
        console.log('Updated ' + f);
      }
    } else {
      console.log('Not found in ' + f);
    }
  } catch(e) {
    console.log('Error ' + f + ': ' + e.message);
  }
});
