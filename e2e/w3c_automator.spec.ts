import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('W3C Automator', () => {
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

    test('should run a W3C compliance scan on localhost routes', async () => {
        test.setTimeout(45000); // Allow time for multiple simulated fetches

        const result = await window.evaluate(async () => {
             // @ts-ignore
            return await window.api.python.execute('W3C_SCAN', { base_url: 'http://localhost:3000' });
        });

        // console.log('W3C Scan Result:', result);

        expect(result.status).toBe('success');
        expect(result.scanned_routes).toBeGreaterThan(0);
        expect(result.report_content).toContain('# W3C Compliance Report');
        expect(result.results.length).toBeGreaterThan(0);
        
        // Use details from the first route to verify structure
        const firstRoute = result.results[0];
        expect(firstRoute.route).toBeDefined();
        expect(firstRoute.status).toMatch(/PASS|WARN|ERROR/);
    });
});
