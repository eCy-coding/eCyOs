import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Cortex UI Integration', () => {
  let electronApp;

  test.beforeEach(async () => {
    // Launch the app using the built main process
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js'), '--enable-logging', '--v=1'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    const window = await electronApp.firstWindow();
    window.on('console', msg => { /* // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`[Renderer] ${msg.type()}: ${msg.text()}`) */ });
    window.on('pageerror', err => console.error(`[Renderer] Error: ${err.message}`));

    // console.log('Waiting for DOM content loaded...');
    await window.waitForLoadState('domcontentloaded');
    // console.log('DOM loaded. Checking content...');
    
    // Debug: Print body HTML if selector fails
    // console.log('Window Title:', await window.title());
    // console.log('Window URL:', window.url());
    try {
        await window.waitForSelector('text=Serpent Cortex', { timeout: 20000 });
    } catch (e) {
        // console.log('Main Content:', await window.content());
        throw e;
    }
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should trigger Python Cortex Actions (NLP, Prediction, Audit) from UI', async () => {
    const window = await electronApp.firstWindow();
    // Dashboard loaded (handled in beforeEach)
    
    // 1. Test NLP
    await window.click('text=Analyze Logs');
    await window.waitForSelector('text=Health Score');
    expect(await window.textContent('text=Health Score')).toContain('Health Score');
    
    // 2. Test Prediction
    await window.click('text=Predict Trend');
    await window.waitForSelector('text=Next');
    expect(await window.textContent('text=Next')).toContain('Next');

    // 3. Test Self-Audit (The Universal Loop)
    await window.click('text=Run System Audit');
    // Wait for result (might take 1-2s)
    await window.waitForSelector('text=Files:', { timeout: 10000 });
    
    // Assertion: Should show file count and errors
    const filesText = await window.textContent('text=Files:');
    expect(filesText).toContain('Files:');
    
    const errorsText = await window.locator('text=Errors:').textContent();
    // We expect some errors (28 found in Phase 39)
    // console.log('UI Audit Result:', errorsText);
    expect(errorsText).not.toBe('Errors: 0'); 
  });
});
