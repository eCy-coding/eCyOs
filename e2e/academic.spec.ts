import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Academic Engine (The Dynamicist)', () => {
    let app: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        app = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { ...process.env, NODE_ENV: 'test' }
        });
        window = await app.firstWindow();
        await window.waitForLoadState('domcontentloaded');
    });

    test.afterAll(async () => {
        await app.close();
    });

    test('should run the Dynamicist Loop (Plan -> Critique -> Refine)', async () => {
        test.setTimeout(60000); // Allow time for 3x mock LLM calls

        const problem = "Optimize the Antigravity IPC Bridge for lower latency.";
        
        const result = await window.evaluate(async (prob) => {
            // @ts-ignore
            return await window.api.python.execute('ACADEMIC_LOOP', { problem_statement: prob });
        }, problem);

        // console.log('Dynamicist Result:', result);

        expect(result.status).toBe('success');
        expect(result.cycle).toBeDefined();
        
        // Check for the three stages
        expect(result.cycle.initial_plan).toBeDefined();
        expect(result.cycle.critique).toBeDefined();
        expect(result.cycle.final_solution).toBeDefined();

        // Verify content (Mocked LLM usually returns strings starting with [Mock])
        // If real LLM is active, it returns real text.
        // We check for non-empty strings.
        expect(result.cycle.initial_plan.response.length).toBeGreaterThan(10);
        expect(result.cycle.critique.response.length).toBeGreaterThan(10);
        expect(result.cycle.final_solution.response.length).toBeGreaterThan(10);
    });

    test('should analyze a research paper', async () => {
        const fakePaper = "Title: Advanced IPC Patterns. Abstract: We propose a zero-copy mechanism...";
        
        const result = await window.evaluate(async (paper) => {
            // @ts-ignore
            return await window.api.python.execute('ACADEMIC_ANALYZE', { content: paper });
        }, fakePaper);
        
        expect(result.status).toBe('success');
        expect(result.analysis).toBeDefined();
        if (result.analysis.response) {
             expect(result.analysis.response.length).toBeGreaterThan(10);
        }
    });
});
