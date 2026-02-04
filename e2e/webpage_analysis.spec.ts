// e2e/webpage_analysis.spec.ts
import { test, expect } from '@playwright/test';
import { pages } from './pages.list';
import axe from 'axe-core';
import fs from 'fs';
import path from 'path';
import AxeBuilder from '@axe-core/playwright';

// Helper to write JSON artifact
function writeJson(file: string, data: unknown) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

test.describe('E2E Web Page Analysis', () => {
  test.describe.configure({ mode: 'parallel' }); // Run pages in parallel

  for (const url of pages) {
    const safeName = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
    test(`Analyze ${url}`, async ({ page }) => {
      // Navigation
      const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      expect(response?.status()).toBeLessThan(400);

      // Screenshot (Keep serial for stability)
      const screenshotPath = `e2e/artifacts/screenshots/${safeName}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Parallelize Data Gathering: Metrics + Content in one Go
      const analysis = await page.evaluate(() => {
         // Metrics
         const timingObj = JSON.parse(JSON.stringify(performance.timing));
         const loadTime = timingObj.loadEventEnd - timingObj.navigationStart;
         
         // Content
         const header = document.querySelector('h1, h2, header')?.textContent || '';
         const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
         const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent);
         
         return { 
             metrics: { loadTime }, 
             content: { header, metaDescription, jsonLd } 
         };
      });

      // Accessibility (Independent, and handles injection automatically)
      // await injectAxe(page); // Removed
      const axeResults = await new AxeBuilder({ page }).analyze();

      // Parallelize File I/O
      await Promise.all([
          writeJson(`e2e/artifacts/metrics/${safeName}.json`, { ...analysis.metrics, url }),
          writeJson(`e2e/artifacts/content/${safeName}.json`, analysis.content),
          writeJson(`e2e/artifacts/accessibility/${safeName}.json`, axeResults)
      ]);

    });
  }
});
