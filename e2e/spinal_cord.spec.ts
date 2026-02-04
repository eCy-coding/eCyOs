
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Efficiency Protocol: Spinal Cord', () => {
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

  test('Should read capabilities from Spinal Cord', async () => {
    // 1. Write to Clipboard (simulating User action in OS)
    await electronApp.evaluate(({ clipboard }) => {
        clipboard.writeText('Ankara Protocol Active');
    });

    // 2. Read via IPC
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.orchestra.system.clipboard();
    });

    expect(result).toBe('Ankara Protocol Active');
  });
});
