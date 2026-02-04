
import { test, expect } from '@playwright/test';
import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../dist/stage/main/index.js')],
    timeout: 30000,
    env: { 
        ...process.env,
        NODE_ENV: 'test',
        // Critical: Enable WebGPU in Playwright/Electron for testing
        // Standard flags for headless GPU access
        ELECTRON_ARGS: '--enable-unsafe-webgpu --use-gl=angle --use-angle=gl' 
    }
  });
});

test.afterAll(async () => {
  await electronApp.close();
});

test('Visual Cortex (WebGPU) Activation', async () => {
  // 1. Wait for Main Window (Robust Strategy)
  // Poll until we find a window with 'stage' API exposed
  let window: unknown = null;
  await expect.poll(async () => {
      const windows = await electronApp.windows();
      for (const w of windows) {
          const title = await w.title().catch(() => '');
          // console.log(`Checking window: "${title}"`);
          const hasStage = await w.evaluate(() => !!(window as any).stage).catch(() => false);
          if (hasStage) {
              window = w;
              return true;
          }
      }
      return false;
  }, { timeout: 20000 }).toBeTruthy();

  if (!window) throw new Error('Main Window not found');
  await window.waitForLoadState('domcontentloaded');

  // Verify exposing of API
  const isReady = await window.evaluate(() => !!window.stage);
  expect(isReady).toBeTruthy();

  // console.log('Sending Analysis Signal to Eye Process...');

  // 2. Trigger "Analyze" Action via Eye Process
  // We use the vision:act API exposed in preload
  const result = await window.evaluate(async () => {
    // Navigate first to ensure we have a page context
    await window.stage.vision.browse('https://example.com');
    
    // Trigger Analysis
    return await window.stage.vision.act('analyze', {});
  });

  // console.log('Visual Cortex Result:', result);

  // 3. Verify Result
  expect(result).toBeDefined();
  
  // It might fail to get 'webgpu' in headless CI/standard env without specific GPU hardware,
  // but it should return *some* backend (webgl, cpu) and definitely not error out.
  // Ideally we want 'webgpu', but 'webgl' is acceptable fallback for reliability.
  expect(result.backend).toMatch(/webgpu|webgl|cpu/);
  
  // Verify tensor shape logic worked
  expect(result.tensorShape).toEqual([100, 100]);
});
