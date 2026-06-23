const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const BLOG_DIR = path.join(DIR, 'blog');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Strip ANY atOptions block + its invoke.js script that aren't part of the build system components
  // This is a broader regex that catches standalone inline ad scripts
  content = content.replace(
    /<script>\s*atOptions\s*=\s*\{[\s\S]*?\};\s*<\/script>\s*<script src="https:\/\/www\.highperformanceformat\.com\/[^"]+\/invoke\.js"><\/script>/gi,
    ''
  );

  // Clean up empty wrappers left behind
  content = content.replace(/<div class="ad-item">\s*<\/div>/gi, '');
  content = content.replace(/<div class="[^"]*ad[^"]*-wrapper">\s*<\/div>/gi, '');
  content = content.replace(/<div class="ad-mid-wrapper">\s*<\/div>/gi, '');
  content = content.replace(/<div class="ad-wrap[^"]*">\s*<\/div>/gi, '');
  content = content.replace(/<div class="about-ad-wrap">\s*<\/div>/gi, '');
  content = content.replace(/<div class="ad-wrap-md">\s*<\/div>/gi, '');

  // Clean old Ezoic/label comments
  content = content.replace(/<!-- Ezoic[^-]*(?:--)?>/gi, '');
  content = content.replace(/<!-- ezoic[^-]*(?:--)?>/gi, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

fs.readdirSync(DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(DIR, f)));
if (fs.existsSync(BLOG_DIR)) {
  fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(BLOG_DIR, f)));
}
console.log("Done.");
