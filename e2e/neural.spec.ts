
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Neural DB: Persistence & Vector Search', () => {
    let electronApp: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { NODE_ENV: 'test' }
        });
        
        // Wait for Splash and Brain Readiness
        await new Promise(r => setTimeout(r, 4000));
        
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

    test('Hippocampus should start clean or with existing data', async () => {
        // Just verify we don't crash on start
        expect(window).not.toBeNull();
    });

    test('Remember and Recall', async () => {
        // Poll for readiness
        await expect.poll(async () => {
            return await window.evaluate(() => window.stage.ai.status());
        }).toMatchObject({ hippocampus: true });

        const memoryText = "Project Antigravity uses LanceDB for neural memory.";
        
        // 1. Remember
        await window.evaluate(async (txt) => {
            await window.stage.ai.remember(txt);
        }, memoryText);
        
        // Brief wait for indexing (LanceDB is fast but async)
        await new Promise(r => setTimeout(r, 1000));
        
        // 2. Recall
        const results = await window.evaluate(async () => {
            return await window.stage.ai.recall("What database does Antigravity use?");
        });
        
        // console.log('Recall Results:', results);
        
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        // Check for semantic match
        expect(results[0]).toContain("LanceDB");
    });

});
