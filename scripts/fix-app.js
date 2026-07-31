const fs = require('fs');

let content = fs.readFileSync('app.html', 'utf8');

// The donation div starts around line 426
const donationRegex = /<div[\s\S]*?Did PhotoSplit save you hours of work\?[\s\S]*?☕ Buy me a coffee<\/a\s*>\s*<\/div>/;

if (donationRegex.test(content)) {
  const match = content.match(donationRegex)[0];
  content = content.replace(match, '');
  
  // Insert it before the #splits-panel
  content = content.replace('<section id="splits-panel">', match + '\n          <section id="splits-panel">');
  
  fs.writeFileSync('app.html', content, 'utf8');
  console.log('Moved donation button in app.html');
} else {
  console.log('Could not find donation button in app.html');
}
