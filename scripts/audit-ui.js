const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE_DIR = path.resolve(__dirname, '..');

async function runAudit() {
  console.log('Starting UI & Product Auditor (JSDOM)...');

  // Find all HTML files in root directory
  const files = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.html'));
  
  let report = '# UI & Product Audit Report\n\n';
  report += `Date: ${new Date().toISOString()}\n\n`;
  
  let allPassed = true;

  for (const file of files) {
    const filePath = path.join(BASE_DIR, file);
    console.log(`Auditing: ${file}...`);
    
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // We need to evaluate the amazon-products.js script in the DOM to populate the widgets
    // First, read the script contents
    const scriptPath = path.join(BASE_DIR, 'js', 'amazon-products.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Initialize JSDOM with execution enabled
    const dom = new JSDOM(htmlContent, {
      url: `file://${filePath}`,
      runScripts: "dangerously"
    });
    
    const window = dom.window;
    const document = window.document;

    // Inject our CSS variables to mock the CSS (since JSDOM doesn't load external CSS well)
    const style = document.createElement('style');
    style.innerHTML = ':root { --bg-surface: #09090b; }';
    document.head.appendChild(style);

    // Execute the amazon script to inject the products
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    // Manually trigger DOMContentLoaded callbacks if they didn't run
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);

    const issues = [];
    let productCount = 0;
    
    // Manually run delayed functions that setTimeout normally handles
    if (typeof window.renderBottomBanner === 'function') {
      window.renderBottomBanner();
    }
    
    // Check each ad slot for rendered products
    const topProducts = document.querySelectorAll('#amazon-widget-top a').length;
    const sidebarProducts = document.querySelectorAll('#amazon-widget-sidebar a').length;
    const bottomProducts = document.querySelectorAll('#amazon-widget-bottom a').length;
    const inlineProducts = document.querySelectorAll('#amazon-widget-inline a').length;
    const gridProducts = document.querySelectorAll('#amazon-widget-grid a').length;
    
    productCount = topProducts + sidebarProducts + bottomProducts + inlineProducts + gridProducts;
    
    let expectedCount = 0;
    if (document.getElementById('amazon-widget-top')) expectedCount += 4;
    if (document.getElementById('amazon-widget-sidebar')) expectedCount += 1;
    if (document.getElementById('amazon-widget-bottom')) expectedCount += 3;
    if (document.getElementById('amazon-widget-inline')) expectedCount += 2;
    if (document.getElementById('amazon-widget-grid')) expectedCount += 4;
    
    // We expect exactly expectedCount products
    if (productCount !== expectedCount) {
      issues.push(`Expected ${expectedCount} products, but found ${productCount}. (Top:${topProducts}, Side:${sidebarProducts}, Bottom:${bottomProducts}, Inline:${inlineProducts}, Grid:${gridProducts})`);
    }
    
    report += `## ${file}\n`;
    report += `- **Products Rendered**: ${productCount}/${expectedCount}\n`;
    
    if (issues.length === 0) {
      report += `- **Status**: ✅ PASS\n\n`;
    } else {
      report += `- **Status**: ❌ FAIL\n`;
      report += `- **Issues**:\n`;
      issues.forEach(issue => report += `  - ${issue}\n`);
      report += `\n`;
      allPassed = false;
    }
  }
  
  // Create reports dir if not exist
  const reportsDir = path.join(BASE_DIR, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  fs.writeFileSync(path.join(reportsDir, 'amazon_audit_report.md'), report, 'utf8');
  
  console.log('Audit complete! Report saved to reports/amazon_audit_report.md');
  
  if (!allPassed) {
    console.error('Audit failed on some pages. Check report.');
    process.exit(1);
  } else {
    console.log('All pages passed!');
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
