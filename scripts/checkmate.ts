
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

// The Checkmate: Strict TDD Enforcer
// "No Code without a Failing Test"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query + ' ', resolve));
};

async function main() {
    console.log('\x1b[36m%s\x1b[0m', '♟ THE CHECKMATE PROTOCOL ♟');
    console.log('You are attempting to create a new feature.');
    
    // 1. Define Feature
    const featureName = await ask('Feature Name (e.g. quantum-logger):');
    if (!featureName) process.exit(1);

    const testPath = path.join(process.cwd(), 'e2e', `${featureName}.spec.ts`);
    const implPath = path.join(process.cwd(), 'src', 'features', `${featureName}.ts`); // Generic structure

    // 2. Check if Test Exists
    if (fs.existsSync(testPath)) {
        console.log('Test file found. Verifying failure...');
        try {
            execSync(`npm run test:electron ${testPath}`, { stdio: 'pipe' });
            console.log('\x1b[31m%s\x1b[0m', 'VIOLATION: Test passed! You must write a FAILING test first.');
            process.exit(1);
        } catch (e) {
            console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: Test failed. You are authorized to code.');
            process.exit(0);
        }
    } else {
        console.log('\x1b[33m%s\x1b[0m', 'No test file found.');
        const confirm = await ask(`Create scaffold for ${featureName}.spec.ts? (y/n)`);
        if (confirm.toLowerCase() === 'y') {
            const scaffold = `
import { test, expect } from '@playwright/test';

test('${featureName} should work', async () => {
    // Write your failing test here
    expect(true).toBe(false); // Default failure
});
            `;
            fs.writeFileSync(testPath, scaffold);
            console.log(`Created ${testPath}.`);
            console.log('Please IMPLEMENT the test logic to fail meaningfully, then run this check again.');
        } else {
            console.log('Aborted.');
        }
        process.exit(1);
    }
}

main();
