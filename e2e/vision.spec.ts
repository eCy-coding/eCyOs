
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Vision Protocol: The Eye', () => {
  let electronApp: unknown;
  let window: unknown;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js')],
      env: { NODE_ENV: 'test' }
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('Should navigate to example.com and extract title', async () => {
    test.setTimeout(60000);
    
    // Capture Renderer Console Logs
    window.on('console', (msg) => { /* // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`[Renderer]: ${msg.text()}`) */ });
    window.on('pageerror', (err) => { /* // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`[Renderer Error]: ${err.message}`) */ });

    const result = await window.evaluate(async () => {
        // @ts-ignore
        // console.log('Available Stage Keys:', Object.keys(window.stage));
        // @ts-ignore
        // console.log('Vision Object:', window.stage.vision);
        // @ts-ignore
        return await window.stage.vision.browse('https://example.com');
    });

    // console.log('Vision Result:', result);

    expect(result.title).toBe('Example Domain');
    expect(result.text).toContain('documentation examples');
  });
});
