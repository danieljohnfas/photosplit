const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.json')).sort().slice(-7); // Last 7 days

if (files.length === 0) {
  console.log("No logs to analyze.");
  process.exit(0);
}

const logs = files.map(f => JSON.parse(fs.readFileSync(path.join(LOGS_DIR, f), 'utf8')));
const latest = logs[logs.length - 1];

let markdown = `# Daily automated test report: ${latest.date}\n\n`;
markdown += `## Summary\n`;
markdown += `- **Passed:** ${latest.summary.passed}\n`;
markdown += `- **Failed:** ${latest.summary.failed}\n`;
markdown += `- **Warnings:** ${latest.summary.warnings}\n\n`;

if (latest.summary.failed > 0) {
  markdown += `> [!WARNING]\n> There are failing tests that need immediate attention.\n\n`;
}

markdown += `## Page Performance\n`;
markdown += `| Page | Load Time (ms) | Status | Errors |\n`;
markdown += `|---|---|---|---|\n`;

if (latest.suites && latest.suites.pages) {
  latest.suites.pages.forEach(p => {
    const errorStr = p.errors.length > 0 ? p.errors.join('<br>') : 'None';
    const statusEmoji = p.status === 'pass' ? '✅' : '❌';
    markdown += `| ${p.page} | ${p.loadMs}ms | ${statusEmoji} | ${errorStr} |\n`;
  });
}

const reportFile = path.join(REPORTS_DIR, `${latest.date}-report.md`);
fs.writeFileSync(reportFile, markdown, 'utf8');

console.log(`Generated report: ${reportFile}`);
