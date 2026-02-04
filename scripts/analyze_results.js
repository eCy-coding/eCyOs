const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../e2e/artifacts');
const REPORT_FILE = path.join(__dirname, '../REPORTS/webpage_analysis.md');
const REPORT_DIR = path.dirname(REPORT_FILE);

if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Ensure artifacts dir exists
if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.error('Artifacts directory not found. Run E2E tests first.');
    process.exit(1);
}

const metricsParams = ['loadTime'];
const sites = [];

// Read artifacts
const metricsDir = path.join(ARTIFACTS_DIR, 'metrics');
if (fs.existsSync(metricsDir)) {
    const files = fs.readdirSync(metricsDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        const siteKey = file.replace('.json', '');
        const metricData = JSON.parse(fs.readFileSync(path.join(metricsDir, file), 'utf8'));
        
        // Content
        let contentData = {};
        const contentFile = path.join(ARTIFACTS_DIR, 'content', file);
        if (fs.existsSync(contentFile)) {
            contentData = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
        }

        // Accessibility
        let a11yData = {};
        const a11yFile = path.join(ARTIFACTS_DIR, 'accessibility', file);
        if (fs.existsSync(a11yFile)) {
            a11yData = JSON.parse(fs.readFileSync(a11yFile, 'utf8'));
        }

        sites.push({
            name: siteKey,
            url: metricData.url,
            loadTime: metricData.loadTime,
            title: contentData.header ? contentData.header.slice(0, 50).replace(/\n/g, ' ') : 'N/A',
            violations: a11yData.violations ? a11yData.violations.length : 0,
            score: a11yData.violations ? (100 - (a11yData.violations.length * 5)) : 100 // Arbitrary scoring
        });
    });
}

// Generate Markdown
let md = `# E2E Web Page Analysis Report\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;

md += `## Executive Summary\n`;
md += `Analyzed ${sites.length} web pages for performance, accessibility, and content structure.\n\n`;

md += `## Performance & Accessibility Matrix\n`;
md += `| Site | Load Time (ms) | A11y Violations | Custom Score | Title |\n`;
md += `|------|----------------|-----------------|--------------|-------|\n`;

sites.sort((a, b) => a.loadTime - b.loadTime);

sites.forEach(site => {
    md += `| ${site.name} | ${site.loadTime} | ${site.violations} | ${site.score} | ${site.title} |\n`;
});

md += `\n## Detailed Insights\n`;
sites.forEach(site => {
    md += `### ${site.name}\n`;
    md += `- **URL**: ${site.url}\n`;
    md += `- **Load Time**: ${site.loadTime}ms\n`;
    md += `- **Header**: ${site.title}\n`;
    md += `- **Accessibility**: ${site.violations} violation(s) detected.\n`;
    md += `\n`;
});

md += `\n## Recommendations\n`;
md += `- Sites with load time > 2000ms should optimized images or lazy load scripts.\n`;
md += `- Sites with A11y violations should be reviewed against WCAG 2.1 guidelines.\n`;

fs.writeFileSync(REPORT_FILE, md);
console.log(`Report generated at ${REPORT_FILE}`);
