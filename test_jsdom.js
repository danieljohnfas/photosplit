const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('app.html', 'utf-8');
const js = fs.readFileSync('js/app.js', 'utf-8');

const dom = new JSDOM(html, { runScripts: "outside-only" });

// Polyfill things that JSDOM might not have
dom.window.matchMedia = () => ({ matches: false });
dom.window.AudioContext = class { state = 'suspended'; resume(){} };

try {
  dom.window.eval(js);
  
  // Call init
  dom.window.eval(`
    try {
      init();
    } catch (e) {
      console.error(e.stack);
    }
  `);
} catch (e) {
  console.error(e.stack);
}
