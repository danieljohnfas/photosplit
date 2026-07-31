const fs = require('fs');
const path = require('path');

const files = ['convert.html', 'crop.html', 'resize.html', 'transcribe.html', 'passport.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove the lumped inline widget at the bottom (usually right before <div id="amazon-widget-grid"></div>)
  content = content.replace(/<div id="amazon-widget-inline"><\/div>\s*<div id="amazon-widget-grid"><\/div>/, '<div id="amazon-widget-grid"></div>');
  
  // Insert the inline widget higher up, right after <div class="page-main-content"> or inside the workspace
  if (content.includes('<div class="page-main-content">')) {
    content = content.replace('<div class="page-main-content">', '<div class="page-main-content">\n<div id="amazon-widget-inline"></div>\n');
  } else if (content.includes('<div class="tool-workspace">')) {
    content = content.replace('<div class="tool-workspace">', '<div class="tool-workspace">\n<div id="amazon-widget-inline"></div>\n');
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
});
