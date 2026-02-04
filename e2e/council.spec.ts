
import { test, expect, _electron as electron } from '@playwright/test';

test.describe('The Council: Consensus Protocol', () => {
  let app: unknown;
  let window: unknown;

  test.beforeAll(async () => {
    app = await electron.launch({ 
      args: ['dist/stage/main/index.js'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await app.close();
  });

  test('Should perform a multi-agent debate', async () => {
    test.setTimeout(180000); // 3 mins for debate
    
    // Check if API exposed
    const exposed = await window.evaluate(() => {
        // @ts-ignore
        return !!window.stage.orchestra.council;
    });
    expect(exposed).toBe(true);

    // Register Agents for Debate Quorum (Required in Test Mode since default agents are skipped)
    await window.evaluate(async () => {
        // @ts-ignore
        await window.stage.orchestra.swarm.spawn('ElectronFan', 'Tech Advocate', 'You love Electron.');
        // @ts-ignore
        await window.stage.orchestra.swarm.spawn('TauriFan', 'Rust Advocate', 'You love Tauri.');
        
        // @ts-ignore
        await window.stage.orchestra.council.registerAgent('ElectronFan', 'Tech Advocate');
        // @ts-ignore
        await window.stage.orchestra.council.registerAgent('TauriFan', 'Rust Advocate');
    });

    // Summon Council on a simple topic
    const debate = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.orchestra.council.summon('Is Electron better than Tauri?');
    });

    // console.log('Debate Result:', debate);
    
    expect(debate.topic).toContain('Electron');
    expect(debate.participants).toContain('Brain');
    expect(debate.participants).toContain('Skeptic');
    expect(debate.participants).toContain('Gemini');
    
    // Verify Minutes (Action Log)
    expect(debate.minutes.length).toBeGreaterThan(0);
    
    // Verify Phases occurred
    const logs = debate.minutes.map((m: unknown) => m.message).join(' ');
    expect(logs).toContain('Divergence');
    expect(logs).toContain('Deliberation');
    expect(logs).toContain('Convergence');
    
    // Verify Final Result
    expect(debate.result.length).toBeGreaterThan(10);
  });
});
