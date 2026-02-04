
import { execSync } from 'child_process';

const chalk = {
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    bold: (text: string) => `\x1b[1m${text}\x1b[0m`
};

const steps = [
    { name: '1. Dead Code Scan (Knip)', cmd: 'npx knip' },
    { name: '2. Style Check (GTS)', cmd: 'npx gts check' },
    { name: '3. Type Check (TSC)', cmd: 'npx tsc --noEmit' },
    { name: '4. Test Fortress (Playwright)', cmd: 'npm run test:electron' }
];

console.log('\n🏰 STARTING TEST FORTRESS SIMULATION (IRON DOME)...\n');

let failed = false;

for (const step of steps) {
    console.log(`\n👉 EXECUTE: ${chalk.blue(chalk.bold(step.name))}`);
    try {
        execSync(step.cmd, { stdio: 'inherit' });
        console.log(`${chalk.green('✅ PASS:')} ${step.name}`);
    } catch (e) {
        console.error(`${chalk.red('❌ FAIL:')} ${step.name}`);
        failed = true;
        break;
    }
}

if (failed) {
    console.error(`\n${chalk.red(chalk.bold('💥 IRON DOME BREACHED. FIX ERRORS IMMEDIATELY.'))}\n`);
    process.exit(1);
} else {
    console.log(`\n${chalk.green(chalk.bold('🛡️  IRON DOME SECURE. SYSTEM IS PRODUCTION-READY.'))}\n`);
    process.exit(0);
}
