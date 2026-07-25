const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const toolPages = ['app.html', 'convert.html', 'crop.html', 'resize.html', 'passport.html', 'transcribe.html'];

const adSnippet = `<script>
  atOptions = {
    'key' : '1616e9416e1938ab8fa16f0ac161a303',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/1616e9416e1938ab8fa16f0ac161a303/invoke.js"></script>`;

toolPages.forEach(file => {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Find <div id="ad-sidebar" ...> ... </div> and inject the ad
  content = content.replace(/(<div\s+id="ad-sidebar"[^>]*>)\s*<\/div>/gi, `$1\n${adSnippet}\n</div>`);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected sidebar ad into ${file}`);
  }
});
