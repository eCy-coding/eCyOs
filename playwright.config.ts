import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false, // Electron tests usually require sequential execution due to app state
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Run sequentially for Electron
  reporter: 'line',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    headless: false, // Electron usually runs headed
  },
});
