const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Replace the wrapper
content = content.replace(/<div class="page-with-sidebar">/i, '<div class="tool-workspace" style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">');

// Remove the sidebar and its injected content
content = content.replace(/<aside class="page-sidebar">[\s\S]*?<\/aside>\s*/i, '');

fs.writeFileSync(file, content, 'utf8');
console.log('index.html layout updated.');
