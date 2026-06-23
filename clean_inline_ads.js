const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const BLOG_DIR = path.join(DIR, 'blog');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Strip all inline Adsterra / Ezoic ad items
  content = content.replace(/<div class="ad-item">[\s\S]*?atOptions[\s\S]*?<\/script>\s*<\/div>/gi, '');
  
  // Strip empty ad wrappers
  content = content.replace(/<div class="ad-wrap[^"]*">\s*<\/div>/gi, '');
  content = content.replace(/<div class="about-ad-wrap">\s*<\/div>/gi, '');
  content = content.replace(/<div class="ad-wrap-md">\s*<\/div>/gi, '');
  
  // Also strip the old Ezoic comments
  content = content.replace(/<!-- Ezoic Ad[^>]*-->/gi, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned inline ads in ${filePath}`);
  }
}

// Process root HTML files
fs.readdirSync(DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(DIR, f)));

// Process blog HTML files
if (fs.existsSync(BLOG_DIR)) {
  fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(BLOG_DIR, f)));
}

console.log("Inline ad cleanup complete.");
