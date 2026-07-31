const fs = require('fs');
const path = require('path');

const files = ['convert.html', 'crop.html', 'resize.html', 'transcribe.html', 'passport.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the top banner block
  const topBannerRegex = /<!-- TOP AD BANNER -->\s*<div id="amazon-widget-top"><\/div>\s*<!-- END TOP AD BANNER -->/;
  
  if (topBannerRegex.test(content)) {
    // Remove it from its current location
    content = content.replace(topBannerRegex, '');
    
    // Insert it after the tool-workspace but before page-main-content starts.
    // Actually, a better place is right below the <div class="tool-workspace"> block, but tool-workspace contains the tool.
    // Let's insert it right after the closing </div> of tool-workspace. Wait, that's hard to find.
    // Let's insert it before <div id="amazon-widget-grid"></div> if possible, but that's at the bottom.
    // What if we insert it right after <div class="page-main-content">?
    // Wait, the user said "move it below the tool workspace". Let's insert it right after <div class="page-main-content">.
    if (content.includes('<div class="page-main-content">')) {
      content = content.replace(
        '<div class="page-main-content">',
        '<div class="page-main-content">\n<!-- TOP AD BANNER -->\n<div id="amazon-widget-top"></div>\n<!-- END TOP AD BANNER -->\n'
      );
    }
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed top ad banner in ' + file);
});
