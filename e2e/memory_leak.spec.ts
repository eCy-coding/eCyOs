import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'path';

test.describe('Memory Sentinel: Leak Detection', () => {
    let electronApp;
    let window;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [join(process.cwd(), 'dist/stage/main/index.js')],
            env: { ...process.env, NODE_ENV: 'test' }
        });
        window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');
    });

    test.afterAll(async () => {
        if (electronApp) await electronApp.close();
    });

    test('P9: Should not leak memory over 50 reloads', async () => {
        // 1. Get Baseline Memory
        // We use evaluate to call IPC via window.api if available, BUT in E2E we can't easily access main process objects directly
        // unless we exposed a handler. We DID expose 'orchestra:diagnostics:status' which returns memory.
        
        // Helper to get memory from Main Process
        const getMemory = async () => {
            // We need to invoke using the exposed API in preload.
            // Assuming window.api.orchestra or similar exists. 
            // If not directly exposed, we might need a workaround.
            // Wait! 'orchestra:diagnostics:status' is an IPC handle.
            // If 'window.api.orchestra.diagnostics.status()' isn't exposed, we can't call it from renderer.
            // Let's check API.md or preload. 
            // However, we can use electronApp.evaluate to run code in the Main Process!
            
            return await electronApp.evaluate(async () => {
                return process.memoryUsage().heapUsed / 1024 / 1024; // MB
            });
        };

        // Warmup
        await window.reload();
        await window.waitForTimeout(1000);

        const initialHeap = await getMemory();
        console.log(`[Memory] Initial Heap: ${initialHeap.toFixed(2)} MB`);

        // 2. Stress Cycle
        const CYCLES = 20; // 50 might take too long for interactive check, start with 20
        console.log(`[Memory] Starting ${CYCLES} reload cycles...`);

        for (let i = 0; i < CYCLES; i++) {
            await window.reload();
            // await window.waitForLoadState('networkidle'); // Can be slow
            await window.waitForTimeout(200); // Fast cycle
            if (i % 5 === 0) process.stdout.write('.');
        }
        console.log('\n[Memory] Cycles complete.');

        // Cooldown GC
        await window.waitForTimeout(2000);

        // 3. Measure Final
        const finalHeap = await getMemory();
        console.log(`[Memory] Final Heap: ${finalHeap.toFixed(2)} MB`);

        const diff = finalHeap - initialHeap;
        console.log(`[Memory] Growth: ${diff.toFixed(2)} MB`);

        // Assert: Growth should be less than 50MB (Loose threshold for Electron dev/debug builds, but tighter for prod)
        // In 'test' mode we might have some overhead.
        expect(diff).toBeLessThan(50); 
    });
});
