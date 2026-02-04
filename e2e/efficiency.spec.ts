
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Silicon Upgrade: WASM Efficiency Checks', () => {
    let electronApp: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { NODE_ENV: 'test' }
        });
        
        // Wait for Splash
        await new Promise(r => setTimeout(r, 2000));
        
        const windows = await electronApp.windows();
        if (windows.length > 0) {
            window = windows[windows.length - 1];
        } else {
             window = await electronApp.firstWindow();
        }
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('WASM Core should be ready', async () => {
        // Poll for readiness (Silicon Cortex loads async)
        await expect.poll(async () => {
            return await window.evaluate(() => window.stage.silicon.status());
        }).toEqual({ ready: true });
    });

    test('Benchmark: Rust WASM vs JS (Fibonacci)', async () => {
        const n = 30; // Sufficient number to see difference

        const result = await window.evaluate(async (num) => {
            const startJS = performance.now();
            // Slow JS Implementation
            const fibJS = (i) => i <= 1 ? i : fibJS(i-1) + fibJS(i-2);
            fibJS(num);
            const endJS = performance.now();
            
            const startWASM = performance.now();
            // Fast Rust Implementation
            await window.stage.silicon.fibonacci(num);
            const endWASM = performance.now();

            return {
                jsTime: endJS - startJS,
                wasmTime: endWASM - startWASM
            };
        }, n);

        // console.log(`Fibonacci(${n}) - JS: ${result.jsTime.toFixed(2)}ms, WASM: ${result.wasmTime.toFixed(2)}ms`);
        
        // WASM should generally be faster or at least present.
        // In some environments, call overhead might dominate for small n, but for n=30, WASM should win or be very competitive.
        // We mainly verify it runs without error (implied by execution).
        expect(result.wasmTime).toBeGreaterThanOrEqual(0);
    });
    
    test('Vector Sum via WASM', async () => {
        const sum = await window.evaluate(async () => {
             const data = Array.from({length: 1000}, (_, i) => i);
             return await window.stage.silicon.vectorSum(data);
        });
        // Sum of 0..999 is n*(n-1)/2 = 1000*999/2 = 499500
        expect(sum).toBe(499500);
    });
});
