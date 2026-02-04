import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Math Engine Integration', () => {
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

    test('should execute Native Math functions', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('MATH_EXEC', {
                library: 'math',
                function: 'sqrt',
                args: [16]
            });
        });
        expect(result.status).toBe('success');
        expect(result.result).toBe(4);
    });

    test('should execute Native Statistics functions', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('MATH_EXEC', {
                library: 'statistics',
                function: 'mean',
                args: [[1, 2, 3, 4, 5]]
            });
        });
        expect(result.status).toBe('success');
        expect(result.result).toBe(3);
    });

    test('should execute (or simulate) Numpy functions', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('MATH_EXEC', {
                library: 'numpy',
                function: 'mean',
                args: [[10, 20, 30]]
            });
        });
        
        expect(result.status).toBe('success');
        if (result.mode === 'simulated') {
            expect(result.result).toContain('Simulated numpy.mean');
        } else {
            expect(result.result).toBe(20);
        }
    });

    test('should execute (or simulate) Scipy functions', async () => {
         const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('MATH_EXEC', {
                library: 'scipy',
                function: 'optimize.minimize', // Advanced routing check
                args: ['x^2', 0] // Dummy args for simulation check
            });
        });
        expect(result.status).toBe('success');
        if (result.mode === 'simulated') {
             expect(result.result).toContain('Simulated scipy.optimize.minimize');
        }
    });

    test('should simulate unsupported/extended libraries (e.g., TensorFlow)', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('MATH_EXEC', {
                library: 'tensorflow',
                function: 'constant',
                args: [42]
            });
        });
        expect(result.status).toBe('success');
        expect(result.mode).toBe('simulated');
        expect(result.result).toContain('Simulated tensorflow.constant');
    });
});
