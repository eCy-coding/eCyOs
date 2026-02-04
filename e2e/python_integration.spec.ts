import { expect, test } from '@playwright/test';
import { PythonAdapter } from '../src/orchestra/adapters/PythonAdapter';

test.describe('Python Cortex Integration', () => {
    const adapter = new PythonAdapter();

    test.afterAll(() => {
        adapter.stop();
    });

    test('should communicate via IO streams (PING/PONG)', async () => {
        const response = await adapter.execute('PING');
        expect(response.status).toBe('ok');
        expect(response.result).toBe('PONG');
    });

    test('should delegate heavy math to Python', async () => {
        const matrix = [
            [1.0, 2.0],
            [3.0, 4.0]
        ];
        const response = await adapter.execute('MATH_HEAVY', { matrix });
        expect(response.status).toBe('ok');
        // Sum: 1+2+3+4 = 10
        expect(response.result.sum).toBe(10);
        expect(response.result.engine).toBe('python-native');
    });

    test('should analyze system logs via Python NLP', async () => {
        const logs = "System started. Error: Connection failed. Warning: Low memory.";
        const response = await adapter.execute('ANALYZE_TEXT', { text: logs });
        
        expect(response.status).toBe('ok');
        // "Error" and "failed" both trigger the regex, so count is 2.
        expect(response.result.error_count).toBe(2);
        expect(response.result.warning_count).toBe(1);
        expect(response.result.health_score).toBeLessThan(100);
    });

    test('should predict trends via Python Data Science', async () => {
        // Dataset: 10, 20, 30, 40 (Slope = 10)
        const data = [10.0, 20.0, 30.0, 40.0];
        const response = await adapter.execute('PREDICT_TREND', { data });
        
        expect(response.status).toBe('ok');
        expect(response.result.trend).toBe('increasing');
        expect(response.result.next_predicted_value).toBeCloseTo(50.0);
    });
});
