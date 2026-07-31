const fs = require('fs');
let content = fs.readFileSync('js/amazon-products.js', 'utf8');
content = content.replace(/\.\.\.",/g, '",');
fs.writeFileSync('js/amazon-products.js', content, 'utf8');
console.log('Removed ... from amazon titles');
