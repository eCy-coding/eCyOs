
import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';

test('Admin Console Smoke Test', async () => {
  const cliPath = path.resolve(__dirname, '../dist/cli.js');
  
  const adminProcess = spawn('node', [cliPath, 'admin'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'test' }
  });

  let output = '';
  let errorOutput = '';

  adminProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  adminProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Wait for the "System Status: ONLINE" text which indicates the Dashboard is rendered.
  // Ink renders via ANSI codes, but the text should be present.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
        adminProcess.kill();
        reject(new Error(`Timeout waiting for Admin Console. Stdout: ${output} Stderr: ${errorOutput}`));
    }, 10000);

    const checkInterval = setInterval(() => {
        if (output.includes('System Status: ONLINE')) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            adminProcess.kill();
            resolve();
        }
    }, 500);
  });

  expect(output).toContain('System Status: ONLINE');
});
