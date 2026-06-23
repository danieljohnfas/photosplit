const fs = require('fs');
const path = require('path');

const DIR = __dirname;

const toolFiles = ['app.html', 'convert.html', 'crop.html', 'resize.html', 'passport.html', 'transcribe.html'];

toolFiles.forEach(file => {
  const filePath = path.join(DIR, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Change layout wrapper
    content = content.replace(/<div class="page-with-sidebar">/gi, '<div class="tool-workspace" style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">');
    
    // Remove the entire sidebar and its injected content
    content = content.replace(/<aside class="page-sidebar">[\s\S]*?<\/aside>\s*/gi, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated layout for tool page: ${file}`);
  }
});
