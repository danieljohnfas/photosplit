const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const BLOG_DIR = path.join(DIR, 'blog');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add loading="lazy" to <img> tags if not present, except logos
  content = content.replace(/<img([^>]+)>/gi, (match, p1) => {
    if (p1.includes('loading="lazy"') || p1.includes('logo')) {
      return match;
    }
    return `<img loading="lazy"${p1}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Lazy-loaded: ${filePath}`);
  }
}

fs.readdirSync(DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(DIR, f)));
if (fs.existsSync(BLOG_DIR)) {
  fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html')).forEach(f => processFile(path.join(BLOG_DIR, f)));
}
console.log("Lazy loading optimization complete.");
