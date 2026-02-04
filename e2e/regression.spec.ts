
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Phase 16: System Regression Checks', () => {
    let electronApp: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { NODE_ENV: 'test' }
        });
        
        // Wait for Splash to pass (1.5s delay in main)
        // We can wait for the first window to appear, but splash might be first.
        // Let's wait for a window that has title 'Antigravity Stage 🎭' or content we expect.
        
        // Wait for Splash to pass (2.5s total wait to be safe)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // After splash closes, handle should be invalid or we find the right one.
        // Get all windows
        const windows = await electronApp.windows();
        // console.log(`Open Windows: ${windows.length}`);
        
        // Assume the last one is the main window if multiple, or the only one.
        // Or filter by content/title.
        for (const w of windows) {
             const title = await w.title(); // Might be empty
             // console.log(`Window Title: ${title}`);
             window = w; // Pick the last one which persists
        } 
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    // 1. Performance / Splash Verification
    test('System Startup: Should display Main Window after Splash', async () => {
        // We can't easily capture the splash window in Playwright as it might be separate.
        // But we can verify the Main verification loaded.
        const title = await window.title();
        // Default title or HTML title
        // In index.html, we don't have a title set in the file I saw, but let's check content.
        const content = await window.content();
        expect(content).toContain('Antigravity Stage');
    });

    // 2. Accessibility Verification
    test('Accessibility: Interactive elements should have ARIA labels', async () => {
        const addBtn = await window.locator('button[aria-label="Add new task"]');
        await expect(addBtn).toBeVisible();

        const permBtn = await window.locator('button[aria-label="Request system permissions"]');
        await expect(permBtn).toBeVisible();
    });

    // 3. AI Safety (Rate Limiting) verification
    test('AI Safety: Should rate limit rapid requests', async () => {
        // First Request - Should S succeed (mocked or real)
        // We use 'local' to avoid hitting external API limits if possible, or Mock.
        // But the rate limiter is in Main process, wrapper around askBrain.
        
        // Fire concurrent requests to ensure we hit the 2000ms rate limit
        // The first one should succeed (or start), the second should fail immediately.
        const responses = await window.evaluate(async () => {
            const p1 = window.stage.ai.ask('Hello 1', 'local');
            const p2 = window.stage.ai.ask('Hello 2', 'local');
            // We await both. The first one finishes whenever (slow), the second should be fast rejection.
            return await Promise.all([p1, p2]);
        });
        
        // console.log('Responses:', responses);
        const [r1, r2] = responses;

        // One of them MUST be the rate limit message. Usually the second one initiated.
        expect(r2).toBe("I'm thinking... please wait a moment.");
    });
    
});
