const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';

console.log(`
${CYAN}==========================================
   ANTIGRAVITY UNIVERSAL BUILDER v1.0   
==========================================${RESET}
`);

const steps = [
    { name: 'Dependencies', cmd: 'npm install', cwd: '.' },
    { name: 'VS Code Ext Deps', cmd: 'npm install', cwd: './src/vscode' },
    { name: 'VS Code Compile', cmd: 'npm run compile', cwd: './src/vscode' },
    { name: 'Embedded System', cmd: 'node scripts/simulate_embedded_build.js', cwd: '.' },
    { name: 'Final Verification', cmd: 'make verify', cwd: '.' }
];

async function runStep(step) {
    process.stdout.write(`[${BLUE}WAIT${RESET}] ${step.name}... `);
    
    try {
        execSync(step.cmd, { cwd: step.cwd, stdio: 'pipe' });
        process.stdout.write(`\r[${GREEN} OK ${RESET}] ${step.name}      \n`);
        return true;
    } catch (e) {
        process.stdout.write(`\r[${RED}FAIL${RESET}] ${step.name}      \n`);
        console.error(`\nError in ${step.name}:\n${e.stdout?.toString() || e.message}\n`);
        if (e.stderr) console.error(e.stderr.toString());
        return false;
    }
}

async function main() {
    const start = Date.now();
    
    for (const step of steps) {
        const success = await runStep(step);
        if (!success) {
            console.log(`\n${RED}Build Failed! Aborting.${RESET}`);
            process.exit(1);
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`
${GREEN}==========================================
   BUILD SUCCESSFUL (${duration}s)   
==========================================${RESET}
    `);
}

main();
