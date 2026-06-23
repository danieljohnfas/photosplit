const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.html') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/1280px/g, '1400px');
  
  // Also reduce vertical padding on hero in index.html
  if (file.endsWith('index.html')) {
    newContent = newContent.replace(/padding: var\(--space-xl\) 24px;/g, 'padding: var(--space-lg) 24px;');
  }

  // Reduce some CSS spacing
  if (file.endsWith('style.css')) {
    newContent = newContent.replace(/--space-xl: 64px;/g, '--space-xl: 48px;');
    newContent = newContent.replace(/--space-lg: 40px;/g, '--space-lg: 32px;');
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${changed} files.`);
