
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

const cliPath = path.resolve(__dirname, '../dist/cli.js');

function runCliJson(command: string): { stdout: string, stderr: string, code: number } {
  try {
    // We intentionally use --json to verify the protocol
    // Pass NODE_ENV=test to ensure Brain uses deterministic mocks
    const output = execSync(`node ${cliPath} --json ${command}`, { 
        encoding: 'utf-8',
        env: { ...process.env, NODE_ENV: 'test' }
    });
    return JSON.parse(output);
  } catch (e: unknown) {
    // If the CLI crashes or returns non-zero, execSync throws.
    // But our CLI should handle errors gracefully and print JSON even on failure (exit 1).
    // If execSync throws, it means the process exited with non-zero.
    // The stdout should STILL be JSON if our protocol holds.
    if (e.stdout) {
      try {
        const outStr = e.stdout.toString();
        // Sometimes stdout might be empty if it crashed hard before printing
        if (!outStr) throw new Error(`CLI failed with empty stdout. Stderr: ${e.stderr?.toString()}`);
        return JSON.parse(outStr);
      } catch (jsonErr) {
        throw new Error(`Critical: CLI failed and output was not JSON. Output: ${e.stdout}`);
      }
    }
    throw new Error(`Critical: CLI failed with no stdout. Error: ${e.message}`);
  }
}

test.describe('Ankara Protocol Verification', () => {

  test('Determinism: Echo should always return input', () => {
    for (let i = 0; i < 20; i++) {
        const res = runCliJson('"echo AnkaraProtocol"');
        expect(res.code).toBe(0);
        expect(res.stdout).toContain('AnkaraProtocol');
        expect(res.stderr).toBe('');
    }
  });

  test('Isolation: Environment variables should not leak', () => {
    // We try to access a variable that shouldn't exist in the isolated env
    // HOST_VAR is not whitelisted in run_command.sh
    process.env.HOST_VAR = 'Confidential_Data';
    const res = runCliJson('"env"');
    expect(res.code).toBe(0);
    expect(res.stdout).not.toContain('Confidential_Data');
    expect(res.stdout).toContain('PATH='); // Should have PATH
  });

  test('Error Handling: Invalid command should return 127', () => {
    const res = runCliJson('"invalid_command_xyz"');
    // bash returns 127 for command not found
    expect(res.code).toBe(127); 
    expect(res.stderr).toBe(''); // stderr is mixed into stdout in our current run_command.sh implementation
    expect(res.stdout).toContain('command not found');
  });

  test('Strict JSON: ASCII art should be valid JSON', () => {
    // A command that outputs quotes and special chars
    const res = runCliJson(`"echo '{\\"nested\\": \\"json\\"}'"`);
    expect(res.code).toBe(0);
    // The stdout content itself should be parsable string
    expect(JSON.parse(res.stdout)).toEqual({ nested: 'json' });
  });

  test('Answer Engine: Deterministic Capital', () => {
    const res = runCliJson('ask "Türkiye\'nin başkenti neresidir?"');
    expect(res.code).toBe(0);
    expect(res.stdout).toBe('Ankara');
  });

});
