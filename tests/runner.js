const { chromium } = require('playwright');
const server = require('./server');
const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');

async function runTests() {
  console.log('Starting local server...');
  await server.start();
  console.log(`Server running at ${server.url}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  const results = {
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    suites: {},
    summary: { passed: 0, failed: 0, warnings: 0 }
  };

  // Run Suites
  try {
    results.suites.pages = await require('./suites/pages')(context, server.url);
    results.suites.ads = await require('./suites/ads')(context, server.url);
    // More suites to be added...
    
    // Calculate summary
    for (const suite in results.suites) {
      const suiteResults = results.suites[suite];
      if (Array.isArray(suiteResults)) {
        suiteResults.forEach(r => {
          if (r.status === 'pass') results.summary.passed++;
          else if (r.status === 'fail') results.summary.failed++;
          else results.summary.warnings++;
        });
      } else {
        if (suiteResults.status === 'pass') results.summary.passed++;
        else if (suiteResults.status === 'fail') results.summary.failed++;
      }
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    results.error = err.toString();
  } finally {
    await browser.close();
    await server.stop();
    console.log('Server stopped.');
  }

  // Save log
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  const logFile = path.join(LOGS_DIR, `${results.date}.json`);
  fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
  console.log(`Test results saved to logs/${results.date}.json`);
  
  if (results.summary.failed > 0) {
    console.error(`${results.summary.failed} tests failed.`);
    process.exit(1);
  } else {
    console.log('All tests passed successfully.');
  }
}

runTests();
