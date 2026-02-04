
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';

test.describe('Universal Auto-Correction', () => {
  let electronApp;
  const tempFilePath = path.join(__dirname, 'temp_violation.ts');

  test.beforeEach(async () => {
    // Launch with env test to avoid splash screen/other artifacts
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/stage/main/index.js')],
      env: { ...process.env, NODE_ENV: 'test' }
    });
  });

  test.afterEach(async () => {
    await electronApp.close();
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) { console.error('Cleanup error:', e); }
    }
  });

  test('should detect and fix code violations via Python Cortex', async () => {
    const window = await electronApp.firstWindow();
    
    // Create check file with VIOLATIONS
    // 1. let (should become let)
    // 2. : unknown (should become : unknown)
    // 3. console.log (should be commented out)
    const content = `
    let legacyVar = 'test';
    function doSomething(arg: unknown) {
        // console.log('Debugging');
        return arg;
    }
    `;
    fs.writeFileSync(tempFilePath, content);
    
    // Perform Correction via IPC
    // Pass the DIRECTORY because corrector scans recursively
    await window.evaluate(async (p) => {
        // @ts-ignore
        return await window.api.python.execute('AUTO_CORRECT', { path: p });
    }, path.dirname(tempFilePath));
    
    // Verify the file content
    const fixedContent = fs.readFileSync(tempFilePath, 'utf-8');
    
    // 1. Verify 'let' -> 'let'
    expect(fixedContent).not.toContain('let legacyVar');
    expect(fixedContent).toContain('let legacyVar');

    // 2. Verify 'console.log' is commented out
    expect(fixedContent).toContain('// // console.log(\'Debugging\')');
    
    // 3. Verify ': unknown' -> ': unknown'
    expect(fixedContent).not.toContain(': unknown');
    expect(fixedContent).toContain(': unknown');
  });
});
