const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const blogDir = path.join(rootDir, 'blog');

// 1. passport.html
let passport = fs.readFileSync('passport.html', 'utf8');
passport = passport.replace('<span class="flag">????</span><span class="cname">USA</span>', '<span class="flag">🇺🇸</span><span class="cname">USA</span>');
passport = passport.replace('<span class="flag">????</span><span class="cname">UK</span>', '<span class="flag">🇬🇧</span><span class="cname">UK</span>');
passport = passport.replace('<span class="flag">????</span><span class="cname">EU Visa</span>', '<span class="flag">🇪🇺</span><span class="cname">EU Visa</span>');
passport = passport.replace('<span class="flag">????</span><span class="cname">Canada</span>', '<span class="flag">🇨🇦</span><span class="cname">Canada</span>');
passport = passport.replace('<div style="font-size: 2.5rem">??</div>', '<div style="font-size: 2.5rem">🖼️</div>');
passport = passport.replace('??? Create Print Sheet', '🖨️ Create Print Sheet');
fs.writeFileSync('passport.html', passport, 'utf8');

// 2. convert.html
let convert = fs.readFileSync('convert.html', 'utf8');
convert = convert.replace('<div class="drop-icon">??</div>', '<div class="drop-icon">📂</div>');
convert = convert.replace('??? ZIP All', '🗜️ ZIP All');
fs.writeFileSync('convert.html', convert, 'utf8');

// 3. crop.html
let crop = fs.readFileSync('crop.html', 'utf8');
crop = crop.replace('<div style="font-size: 2.5rem">??</div>', '<div style="font-size: 2.5rem">✂️</div>');
fs.writeFileSync('crop.html', crop, 'utf8');

// 4. blog posts CTA and index.html
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
blogFiles.forEach(file => {
  let content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  if (file === 'index.html') {
    content = content.replace(/<span>\? (\d+) min read<\/span>/g, '<span>⏱️ $1 min read</span>');
  } else {
    content = content.replace(/(\s*)>\?\?\? (Open PhotoSplit App — Free|Launch PhotoSplit Studio — Free)</g, '$1>🚀 $2<');
  }
  fs.writeFileSync(path.join(blogDir, file), content, 'utf8');
});

console.log('Fixed encoding issues');
