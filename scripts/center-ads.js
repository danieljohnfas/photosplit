const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

css += `\n
#amazon-widget-grid, .amazon-widget-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  max-width: 1200px;
}
`;

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('Added centering for amazon grid');
