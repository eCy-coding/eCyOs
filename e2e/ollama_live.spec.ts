
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import * as path from 'path';

test.describe('Phase 48: Local Intelligence Ubiquity', () => {
    let electronApp;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: {
                ...process.env,
                NODE_ENV: 'test',
                AI_LIVE_MODE: 'true' // Activate Phase 48 Logic
            }
        });
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('Brain should use Real Ollama Intelligence in Live Mode', async () => {
        const window = await electronApp.firstWindow();
        
        // We trigger an AI request via the exposed API
        // Assuming window.api.ai.ask exists or we simulate it via Python/Main bridge
        // Based on Brain.ts, we can access it if exposed. 
        // If not directly exposed, we can trigger via "Vision" or "Automator" if they use Brain.ask
        
        // Actually, let's verify if we can access internal Brain via IPC "ai:ask" or similar.
        // Looking at preload/main, usually there is 'ai:ask' or 'brain:ask'.
        
        // Let's assume we can use the 'PYTHON_EXECUTE' bridge if that routes to AI, 
        // OR we check if there is a direct `ipcRenderer.invoke('ai:ask', ...)`
        
        // Allow the test to inspect the logic: 
        // We will assert that the response is NOT one of the Mocks.
        
        const prompt = "What is 20 + 20? Reply with just the number.";
        
        // Using evaluate to call exposed API
        const response = await window.evaluate(async (p) => {
            // Check established IPC channels
            // Note: In previous steps we saw 'orchestra:task:dependency:add', maybe 'brain:ask'?
            // Let's try to access the known 'ai:ask' or trigger it via a UI interaction if needed.
            // For now, let's try a standard channel if available, if not we might need to add one or use an existing feature.
            
            // Fallback: Use the 'automator' command which uses Brain.ask
            // But Automator has its own JXA logic in Brain.ts.
            // We need a path that hits `Brain.ask` without being intercepted by "JXA" checks.
            
            // 'orchestrator:ask' or similar?
            // Let's try to define a clean test that invokes via `ipcRenderer` if possible.
            // If not, we will rely on `window.api.ask` if it exists.
             
             // @ts-ignore
             if (window.api && window.api.ask) return await window.api.ask(p);
             // @ts-ignore
             if (window.stage && window.stage.ai && window.stage.ai.ask) return await window.stage.ai.ask(p);
             
             // Debug info
             // @ts-ignore
             const keys = Object.keys(window);
             return `API_NOT_FOUND. Keys: ${keys.join(',')}`;
        }, prompt);
        
        // console.log('Real AI Response:', response);
        
        if (response === "API_NOT_FOUND") {
            // Skip asserting result if we can't call it, but fail the test to signal we need to expose it.
            throw new Error("Could not find window.api.ask to trigger Brain.");
        }

        expect(response).not.toContain("Mock Response");
        expect(response).toContain("40");
    });
});
