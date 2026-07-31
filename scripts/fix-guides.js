const fs = require('fs');

// 1. transcribe.html: Remove the Related Guides block entirely.
let transcribe = fs.readFileSync('transcribe.html', 'utf8');
const guidesRegex = /<section id="related-guides">[\s\S]*?<\/section>/;
transcribe = transcribe.replace(guidesRegex, '');
fs.writeFileSync('transcribe.html', transcribe, 'utf8');

// The new "Common Scanning Mistakes" block we want to swap in
const commonMistakesHTML = `
          <a href="/blog/common-scanning-mistakes.html" class="guide-card">
            <h4>Common Scanning Mistakes</h4>
            <p>Don't let these simple errors ruin your digital archive.</p>
          </a>`;

const waterDamageRegex = /<a href="\/blog\/restore-water-damaged-photos\.html" class="guide-card">[\s\S]*?<\/a>/;

// 2. passport.html, convert.html, crop.html, resize.html
const filesToUpdate = ['passport.html', 'convert.html', 'crop.html', 'resize.html'];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(waterDamageRegex, commonMistakesHTML);
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed Related Guides');
