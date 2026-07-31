const fs = require('fs'); 
const path = require('path'); 

function walk(dir) { 
  let results = []; 
  const list = fs.readdirSync(dir); 
  list.forEach(file => { 
    file = path.resolve(dir, file); 
    const stat = fs.statSync(file); 
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
      results = results.concat(walk(file)); 
    } else if (file.endsWith('.html')) { 
      results.push(file); 
    } 
  }); 
  return results; 
} 

walk('.').forEach(file => { 
  let content = fs.readFileSync(file, 'utf8'); 
  let matches = content.match(/<div id="amazon-widget-top"><\/div>/g); 
  if (matches && matches.length > 1) { 
    let first = true; 
    content = content.replace(/<div id="amazon-widget-top"><\/div>/g, () => { 
      if (first) { 
        first = false; 
        return '<div id="amazon-widget-top"></div>'; 
      } 
      return ''; 
    }); 
    fs.writeFileSync(file, content, 'utf8'); 
    console.log('Fixed ' + file); 
  } 
});
