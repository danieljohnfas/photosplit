const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(blogDir, file), 'utf8');

  // Fix share buttons class
  content = content.replace(/class="share-btn share-twitter"/g, 'class="share-btn share-btn-twitter"');
  content = content.replace(/class="share-btn share-facebook"/g, 'class="share-btn share-btn-facebook"');
  content = content.replace(/class="share-btn share-linkedin"/g, 'class="share-btn share-btn-linkedin"'); // Add to CSS later if missing

  // Add author attribution below the H1 in the hero
  // The hero looks like:
  // <div class="hero hero-violet">
  //   <h1>...</h1>
  //   <p>...</p>
  // Let's insert a Byline after the <p> or </h1>
  
  if (!content.includes('<div class="author-byline"')) {
    // some heroes might have <p> after <h1>
    const h1Regex = /(<h1>[\s\S]*?<\/h1>(\s*<p>[\s\S]*?<\/p>)?)/;
    if (h1Regex.test(content)) {
      content = content.replace(h1Regex, `$1\n      <div class="author-byline" style="margin-top: 12px; font-weight: 600; color: var(--text-secondary);">By The PhotoSplit Team</div>`);
    }
  }
  
  // Fix date in index.html or other files? The audit mentioned broken '?' in dates. 
  // Let's replace any broken characters like 'Jan  2026' with 'Jan 15, 2026'
  content = content.replace(/Jan  2026/g, 'Jan 15, 2026');
  content = content.replace(/Jan \? 2026/g, 'Jan 15, 2026');

  fs.writeFileSync(path.join(blogDir, file), content, 'utf8');
});

console.log('Processed blog files');
