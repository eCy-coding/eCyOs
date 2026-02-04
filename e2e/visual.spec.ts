
import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Visual Hawks (Visual Regression)', () => {
  test('should match the main window screenshot', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js')],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    const window = await electronApp.firstWindow();
    
    // Smart Assertion: Wait for critical UI element (using a generic selector if specific ID unknown)
    // Assuming 'body' is always there, but waiting for load event is safer.
    await window.waitForLoadState('domcontentloaded');
    
    // Wait for animation or initial render
    // Ideally we wait for a specific element like '#root' or 'h1'
    await window.waitForSelector('body'); 

    // Capture screenshot
    // This will compare against <test-name>-snapshots/main-window-dawin.png
    // First run will generate it (or fail saying it's missing, update with --update-snapshots)
    expect(await window.screenshot()).toMatchSnapshot('main-window.png');

    await electronApp.close();
  });
});
