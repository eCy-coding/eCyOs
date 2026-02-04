
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Efficiency Protocol: Hybrid Intelligence', () => {
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

  // Test Cloud Intelligence (API Key)
  test('Cloud Brain: Should return response from OpenRouter', async () => {
    const response = await window.evaluate(async () => {
        return await window.stage.ai.ask('What is 2+2?', 'cloud');
    });
    
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(0);
    expect(response).not.toContain('Brain Freeze');
  });

  // Test Local Brain Fallback (Since download might heavily load or not be ready)
  test('Local Brain: Should attempt local or fallback', async () => {
    const response = await window.evaluate(async () => {
        return await window.stage.ai.ask('Hello from E2E', 'local');
    });

    // We expect *some* response.
    // If Ollama is downloading, isReady() might be false -> Fallback to Cloud.
    // If Ollama is ready (previous models?), it might answer.
    // Key is robustness: It shouldn't crash.
    expect(response).toBeTruthy();
    // console.log('Local/Hybrid Response:', response);
  });
});
