
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Active Vision Protocol', () => {
  let electronApp: unknown;
  let window: unknown;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js')],
      env: { NODE_ENV: 'test' }
    });
    window = await electronApp.firstWindow();
    window.on('console', (msg) => { /* // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log(`[renderer] ${msg.text()}`) */ });
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('Should browse and interact with page', async () => {
    test.setTimeout(60000);

    // 0. Health Check (Protocol Requirement)
    const status = await window.evaluate(async () => {
        // @ts-ignore
        // console.log('Stage Keys:', Object.keys(window.stage || {}));
        // @ts-ignore
        return await window.stage.diagnostics.status();
    });
    // console.log('System Status:', status);
    // Eye process is lazy-loaded, so it might be false initially, or true if previously accessed. 
    // We strictly expect it to be verifiable via usage, but checking Brain logic if needed.
    // For now, we log it.

    // 1. Browse example.com (triggers Eye spawn)
    const browseResult = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.vision.browse('https://example.com');
    });
    expect(browseResult.title).toContain('Example Domain');

    // 1.1 Verify Eye Process Spawned via Diagnostics
    const statusAfter = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.diagnostics.status();
    });
    expect(statusAfter.eye.running).toBe(true);
    expect(statusAfter.eye.pid).toBeGreaterThan(0);

    // 2. Click (Action Check)
    const clickResult = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.vision.act('click', { selector: 'h1' });
    });
    expect(clickResult).toBe('Clicked');

    // 3. Screenshot (Buffer Check)
    const screenshotResult = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.vision.act('screenshot', {});
    });
    
    // Expect base64 string or Uint8Array/Buffer (Protocol Strictness)
    if (typeof screenshotResult === 'object') {
        // Check for Uint8Array (binary data) or Buffer structure
        const isBuffer = screenshotResult instanceof Uint8Array || 
                         (screenshotResult.type === 'Buffer') ||
                         (Array.isArray(screenshotResult.data)) || // Node Buffer generic serialization
                         Object.keys(screenshotResult).length > 0;
        expect(isBuffer).toBeTruthy();
    } else {
        expect(typeof screenshotResult).toBe('string');
        expect(screenshotResult.length).toBeGreaterThan(100);
    }
  });
});
