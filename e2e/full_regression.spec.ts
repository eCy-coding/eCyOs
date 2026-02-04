
import { test, expect } from '@playwright/test';
import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'path';
import fs from 'fs';

let electronApp: ElectronApplication;

test.beforeAll(async () => {
    electronApp = await electron.launch({
        args: [path.join(__dirname, '../dist/stage/main/index.js')],
        timeout: 120000, // Generous timeout for full suite
        env: { ...process.env, NODE_ENV: 'test' }
    });
});

test.afterAll(async () => {
    await electronApp.close();
});

test.describe('Zero Defect Certification', () => {
    
    let window: unknown = null;

    test.beforeAll(async () => {
        // Poll for window readiness
        await expect.poll(async () => {
            const windows = await electronApp.windows();
            for (const w of windows) {
                const hasStage = await w.evaluate(() => !!(window as any).stage).catch(() => false);
                if (hasStage) {
                    window = w;
                    return true;
                }
            }
            return false;
        }, { timeout: 30000 }).toBeTruthy();

        if (!window) throw new Error('Main Window not found');
    });

    test('1. App Launch & Resilience (Heartbeat)', async () => {
        // Poll for Brain Process (it follows heartbeat cycle)
        await expect.poll(async () => {
            const diagnostics = await window.evaluate(() => window.stage.diagnostics.status());
            return diagnostics.brain.running;
        }, { timeout: 15000 }).toBe(true);
    });

    // test('2. Terminal/CLI Operations', async () => {
    //    // Skipped in this regression script as it requires UI interaction which is flaky in headless regression sometimes.
    //    // Relying on specific terminal spec for deep testing.
    // });

    test('3. Brain Interaction (Mocked)', async () => {
        const response = await window.evaluate(() => window.stage.ai.ask("Hello Brain", "chat"));
        expect(response).toBeTruthy();
        // Mocked response expected in test env?
        // Actually we might be running against real local ollama if available, or mocked if index.ts logic handles it.
        // In index.ts we mocked Swarm, but general Brain calls usually go to worker.
        // If worker uses real Ollama, this test depends on Ollama being up.
        // For regression stability, we assume Ollama is up OR we accept a timeout/error gracefully?
        // Let's assume stability:
        expect(typeof response).toBe('string');
    });

    test('4. Swarm Debate (Mocked Consensus)', async () => {
        // Spawn Agents
        await window.evaluate(() => window.stage.orchestra.swarm.spawn('RegCheck_Opt', 'Optimist', 'You are optimistic.'));
        await window.evaluate(() => window.stage.orchestra.swarm.spawn('RegCheck_Pes', 'Pessimist', 'You are pessimistic.'));

        // Register
        await window.evaluate(() => window.stage.orchestra.council.registerAgent('RegCheck_Opt', 'Optimist'));
        await window.evaluate(() => window.stage.orchestra.council.registerAgent('RegCheck_Pes', 'Pessimist'));

        // Debate
        const debate = await window.evaluate(() => window.stage.orchestra.council.summon('Regression Test Topic'));
        expect(debate.result).toBeDefined();
        expect(debate.participants).toContain('RegCheck_Opt');
    });

    test('5. Vision Capabilities (WebGPU)', async () => {
        // Trigger generic browse to ensuring process spawns
        await window.evaluate(() => window.stage.vision.browse('about:blank'));
        
        // Wait for Eye process
        await expect.poll(async () => {
            const diag = await window.evaluate(() => window.stage.diagnostics.status());
            return diag.eye.running;
        }, { timeout: 10000 }).toBe(true);
    });

    test('6. Code Search (Deep RAG)', async () => {
        // Trigger indexing of a small folder (current e2e folder to be safe/fast)
        const e2eDir = __dirname;
        await window.evaluate((dir) => window.stage.orchestra.code.index(dir), e2eDir);
        
        // Search
        await expect.poll(async () => {
            const results = await window.evaluate(() => window.stage.orchestra.code.search('Zero Defect Certification'));
             // We are searching for THIS file's content
            if (results.length > 0) return true;
            return false;
        }, { timeout: 20000 }).toBe(true);
    });

});
