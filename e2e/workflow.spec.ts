
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Workflow Protocol: The Hierarchy', () => {
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

  test('Should execute a high-level goal command', async () => {
    test.setTimeout(60000);

    // This test simulates eCy (User) saying: "Go to example.com"
    // The Conductor should ask Brain, Brain says "Browse", Conductor asks Eye.
    
    // Mocking the Brain response to ensure deterministic test?
    // In e2e/brain.spec.ts we tested real brain.
    // Ideally we rely on real Qwen logic, but prompt engineering is fragile in raw LLM.
    // For this verification, we hope "Go to example.com" is simple enough for Qwen 7B.
    
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.orchestra.workflow.execute('Go to https://example.com');
    });

    // console.log('Workflow Result:', result);

    expect(result).toContain('Browsed https://example.com');
    expect(result).toContain('Example Domain');
  });
});
