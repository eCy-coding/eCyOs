
import { test, expect } from '@playwright/test';
import { runJxa, AutoSkills } from '../src/automator_bridge';

// We can unit test the bridge directly in Node context since runJxa uses spawnSync
test.describe('Ankara Protocol: AutoSkills Library', () => {

  test('AutoSkills: Should generate valid Launch App code', () => {
    const code = AutoSkills.launchApp('Terminal');
    expect(code).toContain("Application('Terminal').activate()");
  });

  test('AutoSkills: Should generate valid Volume code', () => {
    const code = AutoSkills.setVolume(50);
    expect(code).toContain("setVolume(outputVolume: 50)");
  });

  test('AutoSkills: Launch Terminal (Live Execution)', () => {
    const code = AutoSkills.launchApp('Terminal');
    // Using runJxa directly from the test
    const jsonRes = runJxa(code);
    const res = JSON.parse(jsonRes);
    
    expect(res.code).toBe(0);
    // JXA activate returns true/false usually, or void
    // checking success code is enough for "2+2=4" verification
  });

});
