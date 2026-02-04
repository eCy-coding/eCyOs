import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

// Resolve the compiled CLI binary correctly
const cliPath = path.resolve(__dirname, '../dist/cli.js');

function runCli(command: string): string {
  try {
    // Pass the command as a single argument to the CLI
    const output = execSync(`node ${cliPath} ${command}`, { encoding: 'utf-8' });
    return output.trim();
  } catch (e: unknown) {
    return e.stdout?.toString().trim() ?? '';
  }
}

test('simple echo command', async () => {
  const result = runCli('"echo hello"'); // quotes are needed for the shell to treat as one argument
  expect(result).toContain('hello');
});

test('answer engine returns Ankara', async () => {
  const result = runCli('ask "Türkiye\'nin başkenti neresidir?"');
  expect(result).toBe('Ankara');
});
