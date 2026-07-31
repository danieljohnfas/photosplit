const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  
  // 1. Remove Feedback Modal
  const feedbackModalRegex = /<div class="text-modal-backdrop"[\s\S]*?id="feedback-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  content = content.replace(feedbackModalRegex, '');

  // 2. Remove Changelog Modal
  const changelogModalRegex = /<div class="text-modal-backdrop"[\s\S]*?id="changelog-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  content = content.replace(changelogModalRegex, '');
  
  // 3. Update Feedback links (onclick openTextModal('feedback-modal', ...))
  content = content.replace(/onclick="openTextModal\('feedback-modal', event\);?"/g, 'href="/contact.html"');
  
  // 4. Update What's New links (onclick openTextModal('changelog-modal', ...))
  // We can just link to the blog or remove the link entirely. I'll link to /blog/
  content = content.replace(/onclick="openTextModal\('changelog-modal', event\);?"/g, 'href="/blog/"');
  
  fs.writeFileSync(path.join(rootDir, file), content, 'utf8');
});

console.log('Modals removed and links updated');
