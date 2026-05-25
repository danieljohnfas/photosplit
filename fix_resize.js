const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resize.html');
let content = fs.readFileSync(filePath, 'utf8');

const headTarget = `<meta content="summary_large_image" name="twitter:card"/>
<link href="/assets/images/logo.png" rel="icon" type="image/png"/>`;

const headReplacement = `<meta content="summary_large_image" name="twitter:card"/>
<!-- ═══ STRUCTURED DATA ═════════════════════════════════════════════════ -->
<script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PhotoSplit Studio Image Resizer",
      "url": "https://photosplitstudio.com/resize",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "description": "Free browser-based tool to resize images for social media platforms like Instagram, TikTok, and YouTube. Processing is local and 100% private.",
      "browserRequirements": "Requires a modern web browser with JavaScript and Canvas support.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": [
        "Resize photos for Instagram, TikTok, YouTube, Twitter/X, Facebook, and LinkedIn",
        "Multiple fit modes: Letterbox (Fit), Crop (Fill), and Stretch",
        "100% private local processing \\u2014 photos never leave your device",
        "Support for JPEG, PNG, BMP, and WebP"
      ]
    }
  ]
</script>
<link href="/assets/images/logo.png" rel="icon" type="image/png"/>`;

const scriptTarget = `      fileInput.addEventListener('change', e => loadFile(e.target.files[0]));

      document.getElementById('platform-picker').querySelectorAll('.plat-btn').forEach(btn => {`;

const scriptReplacement = `      fileInput.addEventListener('change', e => loadFile(e.target.files[0]));

      drop.addEventListener('dragover', (e) => {
        e.preventDefault();
        drop.classList.add('drag-over');
      });
      drop.addEventListener('dragleave', (e) => {
        e.preventDefault();
        drop.classList.remove('drag-over');
      });
      drop.addEventListener('drop', (e) => {
        e.preventDefault();
        drop.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          loadFile(e.dataTransfer.files[0]);
        }
      });

      document.getElementById('platform-picker').querySelectorAll('.plat-btn').forEach(btn => {`;

// Normalize line endings to avoid \r\n vs \n mismatch
const normalize = str => str.replace(/\r\n/g, '\n');

content = normalize(content);
const normalizedHeadTarget = normalize(headTarget);
const normalizedScriptTarget = normalize(scriptTarget);

if (content.includes(normalizedHeadTarget)) {
    content = content.replace(normalizedHeadTarget, headReplacement);
    console.log("Replaced head content.");
} else {
    console.log("Could not find head target.");
}

if (content.includes(normalizedScriptTarget)) {
    content = content.replace(normalizedScriptTarget, scriptReplacement);
    console.log("Replaced script content.");
} else {
    console.log("Could not find script target.");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done updating resize.html");
