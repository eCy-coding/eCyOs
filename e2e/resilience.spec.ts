
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Universal Resilience: The Heartbeat', () => {
    
    // Helper to get the main window after splash logic
    async function getMainReadyWindow(electronApp) {
        // Wait ample time for splash to check and close
        await new Promise(r => setTimeout(r, 2000));
        
        // Polling loop for main window presence
        const startTime = Date.now();
        while (Date.now() - startTime < 30000) { // Increased to 30s
            const windows = await electronApp.windows();
            // console.log(`[E2E] Window Check: Found ${windows.length} windows.`);
            
            for (const [i, w] of windows.entries()) {
                try {
                    const url = w.url();
                    const title = await w.title();
                    // console.log(`[E2E] Window ${i}: Title="${title}", URL="${url}"`);
                    
                    const isReady = await w.evaluate(() => {
                        // @ts-ignore
                        return !!window.stage && !!window.stage.ai;
                    });
                    // console.log(`[E2E] Window ${i} Ready? ${isReady}`);
                    
                    if (isReady) return w;
                } catch (e) {
                    // console.log(`[E2E] Window ${i} access failed: ${e}`);
                }
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error("No Main Window with 'stage' API found after 30s.");
    }

    test.setTimeout(90000); // Resilience takes time (heartbeat is 30s)

    test('Brain Process Auto-Recovery', async () => {
        const electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { NODE_ENV: 'test' }
        });
        
        const window = await getMainReadyWindow(electronApp);
        
        // 1. Verify Brain is Alive
        await expect.poll(async () => {
             return await window.evaluate(() => window.stage.ai.status());
        }, { timeout: 20000 }).toMatchObject({ brain: true });

        // 2. Assassinate Brain Process (Simulate Crash)
        // We added a special API for this test: stage.orchestra.system.killBrain()
        // console.log('Injecting Kill Command...');
        await window.evaluate(() => {
            // @ts-ignore
            return window.stage.orchestra.system.killBrain();
        });

        // 3. Verify Brain is Dead
        const statusDead = await window.evaluate(() => window.stage.ai.status());
        // Status might timeout or return false/timeout
        // console.log('Post-Kill Status:', statusDead);
        expect(statusDead.brain).toBeFalsy(); 

        // 4. Wait for Heartbeat (30s interval + margin)
        // console.log('Waiting for Heartbeat recovery (approx 30s)...');
        
        // We poll for RECOVERY
        await expect.poll(async () => {
            // console.log('Checking pulse...');
            const s = await window.evaluate(() => window.stage.ai.status());
            return s;
        }, {
            timeout: 45000, // Wait longer than heartbeat 
            intervals: [5000] 
        }).toMatchObject({ brain: true });
        
        // console.log('Brain Restored!');

        await electronApp.close();
    });

});
