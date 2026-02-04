
import { test, expect } from '@playwright/test';
import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;

test.beforeAll(async () => {
    electronApp = await electron.launch({
        args: [path.join(__dirname, '../dist/stage/main/index.js')],
        timeout: 120000,
        env: { ...process.env, NODE_ENV: 'test' }
    });
});

test.afterAll(async () => {
    await electronApp.close();
});

test('Swarm Intelligence: Multi-Agent Debate', async () => {
    // 1. Wait for Main Window
    let window: unknown = null;
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

    // 2. Spawn Agents
    // console.log('Spawning The Optimist...');
    await window.evaluate(() => window.stage.orchestra.swarm.spawn(
        'Optimist', 
        'The Optimist', 
        'You are The Optimist. You believe everything will turn out for the best. You are cheerful and hopeful.'
    ));
    
    // console.log('Spawning The Pessimist...');
    await window.evaluate(() => window.stage.orchestra.swarm.spawn(
        'Pessimist', 
        'The Pessimist', 
        'You are The Pessimist. You believe everything is doomed to fail. You are cautious and critical.'
    ));

    // 3. Register Agents to Council
    // console.log('Seating Councilors...');
    await window.evaluate(() => window.stage.orchestra.council.registerAgent('Optimist', 'The Optimist'));
    await window.evaluate(() => window.stage.orchestra.council.registerAgent('Pessimist', 'The Pessimist'));

    // 4. Summon Council (Consensus Protocol)
    // console.log('Summoning Council: "Is AI dangerous?"');
    const debate = await window.evaluate(() => window.stage.orchestra.council.summon('Is Artificial Intelligence dangerous for humanity?'));

    // console.log('Debate Concluded.');
    // console.log('Result:', JSON.stringify(debate, null, 2));

    expect(debate).toHaveProperty('result');
    expect(debate.participants).toContain('Optimist');
    expect(debate.participants).toContain('Pessimist');
    expect(debate.result.length).toBeGreaterThan(10);
    
    // Check if minutes logged interactions
    expect(debate.minutes.length).toBeGreaterThan(0);
});
