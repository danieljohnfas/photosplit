const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

// 1. Remove text truncation
css = css.replace(/\.file-chip-name {[\s\S]*?}/, `.file-chip-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: normal;
  word-break: break-word;
  flex: 1;
}`);

css = css.replace(/white-space: nowrap;/g, '/* white-space: nowrap removed */');
css = css.replace(/\/\* white-space: nowrap removed \*\//, 'white-space: nowrap;'); // Put it back on the logo just in case (the first match usually)

// 2. Cookie consent position
css = css.replace(/#cookie-consent {[\s\S]*?position: fixed;[\s\S]*?}/, `#cookie-consent {
  position: static;
  background: var(--surface-light);
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  z-index: 1000;
  margin-top: 2rem;
}`);

// 3. Zoom controls position
css = css.replace(/#zoom-controls {[\s\S]*?position: fixed;[\s\S]*?}/, `#zoom-controls {
  position: static;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  margin: 1rem auto;
  width: fit-content;
}`);

// 4. Centralize layout containers
css += `\n
/* --- UI STANDARDIZATION --- */
.main-content, .tool-container, main {
  margin: 0 auto !important;
  max-width: 1200px !important;
}
.hero, .empty-state, .split-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
}
`;

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('CSS updated');
