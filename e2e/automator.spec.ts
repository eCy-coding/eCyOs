
import { test, expect } from '@playwright/test';
import { spawnSync } from 'child_process';
import path from 'path';

test.describe('Terminal Symbiosis (Automator)', () => {

    test('CLI: automate command triggers JXA generation and execution', () => {
        // Arrange
        const cliPath = path.resolve(__dirname, '../dist/cli.js');
        const command = "Open Safari"; // In test mode Brain ignores this and returns Finder activation
        
        // Act
        // We use NODE_ENV=test to trigger the Brain mock
        const result = spawnSync('node', [cliPath, 'automate', command], {
            env: { ...process.env, NODE_ENV: 'test' },
            encoding: 'utf-8'
        });

        // Assert
        if (result.error) console.error(result.error);
        
        // The mock Brain returns: "Application('Finder').activate(); // Mocked JXA for Testing"
        // The Automator executes this.
        // osascript usually returns empty string for 'activate()' or undefined.
        // Automator returns stdout.
        
        // console.log('CLI STDOUT:', result.stdout);
        // console.log('CLI STDERR:', result.stderr);

        expect(result.status).toBe(0);
        
        // Check if logs indicate Automator ran
        // The CLI suppresses logs unless we pipe them. spawnSync captures them.
        // Automator class logs: [Automator] Generated Script: ...
        // We should see that in stdout or stderr depending on how console.log is handled.
        // console.log usually goes to stdout.
        
        const out = result.stdout;
        const isMock = out.includes('Action performed successfully (Mock Execution)');
        const isReal = out.includes("Application('Finder').activate()");
        
        if (!isMock && !isReal) {
            // console.log('CLI STDOUT:', out);
            throw new Error('Automator output did not match Mock or Real expectation');
        }
        expect(true).toBe(true); // Passed check above
    });

});
