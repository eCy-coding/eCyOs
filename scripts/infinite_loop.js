
const { spawn } = require('child_process');
const path = require('path');

console.log("--- PHASE 45: INFINITE LOOP (NATIVE) ---");

// 1. Spawning Python Cortex
const pythonScript = path.join(__dirname, '../src/python/main.py');
console.log(`[LOOP]: Spawning Cortex at ${pythonScript}`);

const cortex = spawn('python3', [pythonScript]);

cortex.stdout.on('data', (data) => {
    console.log(`[CORTEX]: ${data.toString().trim()}`);
});

cortex.stderr.on('data', (data) => {
    console.error(`[STDERR]: ${data.toString().trim()}`);
});

cortex.on('close', (code) => {
    console.log(`[LOOP]: Cortex exited with code ${code}`);
});

// 2. Helper to send JSON command
function send(action, payload) {
    const cmd = JSON.stringify({ action, payload }) + '\n';
    console.log(`[LOOP]: Sending ${action}...`);
    cortex.stdin.write(cmd);
}

// 3. Execution Sequence
setTimeout(() => {
    // Audit First
    send('AUDIT_CODE', { path: path.join(__dirname, '../src') });
}, 2000);

setTimeout(() => {
    // Correct Next
    send('AUTO_CORRECT', { path: path.join(__dirname, '../src') });
}, 8000);

setTimeout(() => {
    // Terminate
    console.log("[LOOP]: Cycle Complete. Killing Cortex.");
    cortex.kill();
    process.exit(0);
}, 15000);
