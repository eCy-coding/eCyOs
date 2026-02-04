
import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import { join } from 'path';

let electronApp: ElectronApplication;
let window: Page;

test.describe('Electron IPC & E2E Verification', () => {

  test.beforeAll(async () => {
    // Launch the Electron App
    // We assume the main entry point is correctly built at dist/stage/main/index.js
    // Adjust logic to find the entry point if needed. 
    // Usually via 'package.json' main or explicit path.
    const mainScript = join(__dirname, '../dist/stage/main/index.js');
    // console.log('Launching Electron with:', mainScript);

    // Disable nodeCliInspect fuses if necessary, but here we just launch
    electronApp = await electron.launch({
      args: [mainScript],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    // Get the first window
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('Application Startup', async () => {
    const title = await window.title();
    // console.log('Window Title:', title);
    // Depending on index.html, title might be empty or specific. 
    // We just verify the window exists.
    expect(window).toBeTruthy();
    
    // Check if the strict CSP is applied (from main process logic)
    // We can evaluate in main process to check session headers or just check console for violations if we could.
    // For now, simple startup check.
    const appPath = await electronApp.evaluate(async ({ app }) => {
        return app.getAppPath();
    });
    // console.log('App Path:', appPath);
    expect(appPath).toBeTruthy();
  });

  test('IPC: orchestra:execute (Secure Command Execution)', async () => {
    // Note: Command must match /^[a-zA-Z0-9\s\-_]+$/ (No quotes allowed)
    const result = await window.evaluate(async () => {
        // @ts-ignore
        const response = await window.stage.orchestra.execute('echo Ankara Protocol Verified');
        return response;
    });

    // console.log('Execute Result:', result);

    expect(result.status).toBe('success');
    // Verify stdout contains our string
    // The CLI output is typically JSON if --json was added in main process, but we shell see
    // In main/index.ts: const args = ['--json', ...command.split(' ')...];
    
    // If successful, result.output should be the JSON string from CLI
    let innerOutput;
    try {
        innerOutput = JSON.parse(result.output);
    } catch {
        innerOutput = { stdout: result.output };
    }
    
    // The echo command simply gets executed. 
    // echo Ankara Protocol Verified -> stdout: "Ankara Protocol Verified\n"
    expect(innerOutput.stdout || innerOutput).toContain('Ankara Protocol Verified');
  });

  test('IPC: orchestra:task:add (Task Management)', async () => {
    // Task interface: { name, command, icon } (id is omitted in add)
    const task = { name: 'Test Task', command: 'echo test', icon: '🧪' };
    
    const addedTask = await window.evaluate(async (t) => {
        // @ts-ignore
        return await window.stage.orchestra.task.add(t);
    }, task);

    // TaskManager returns the created Task object directly
    expect(addedTask.id).toBeTruthy();
    expect(addedTask.name).toBe('Test Task');
    
    const taskId = addedTask.id;

    // Verify list contains it
    const tasks = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.orchestra.task.list();
    });

    expect(Array.isArray(tasks)).toBe(true);
    const found = tasks.find((x: unknown) => x.id === taskId);
    expect(found).toBeTruthy();
    expect(found.name).toBe('Test Task');
  });

  test('Security: Invalid Command Injection', async () => {
     const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.orchestra.execute('rm -rf /; echo "Hacked"');
     });

     // The main process regex /^[a-zA-Z0-9\s\-_]+$/ should reject this
     expect(result.status).toBe('error');
     expect(result.output).toContain('Security Breach');
  });

});
