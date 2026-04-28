const fs = require('fs');
const files = [
  'index.html', 'app.html', 'tips.html', 'privacy.html', 
  'terms.html', 'resize.html', 'crop.html', 'convert.html', 'passport.html', 
  'blog/index.html', 'blog/how-to-digitize-photo-album.html', 
  'blog/best-scanner-settings-for-photos.html'
];
const pixel = '\n  <!-- Hit Tracker -->\n  <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fphotosplitstudio.com&count_bg=%2310B981&title_bg=%231F2937&icon=&icon_color=%23E7E7E7&title=Total+Visits&edge_flat=true" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;" alt="" aria-hidden="true" />\n</body>';

files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    if (!c.includes('hits.seeyoufarm.com')) {
      c = c.replace('</body>', pixel);
      fs.writeFileSync(f, c);
      console.log('Updated ' + f);
    }
  } catch(e) {
    console.log('Error ' + f + ': ' + e.message);
  }
});
