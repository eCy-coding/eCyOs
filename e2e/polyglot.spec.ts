import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Polyglot Engine Showcase', () => {
    let app: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        // Launch Electron app
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

    test('should execute Python code via Polyglot Bridge', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('POLYGLOT_EXEC', {
                language: 'python',
                code: 'print("Hello from Python")'
            });
        });
        // console.log('Python Result:', result);
        expect(result.status).toBe('success');
        expect(result.output).toContain('Hello from Python');
    });

    test('should execute JavaScript code via Polyglot Bridge', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('POLYGLOT_EXEC', {
                language: 'javascript',
                code: '// // // // // // // // // // // // console.log("Hello from JS")'
            });
        });
        // console.log('JS Result:', result);
        expect(result.status).toBe('success');
        expect(result.output).toContain('Hello from JS');
    });

    test('should execute Bash code via Polyglot Bridge', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('POLYGLOT_EXEC', {
                language: 'bash',
                code: 'echo "Hello from Bash"'
            });
        });
        // console.log('Bash Result:', result);
        expect(result.status).toBe('success');
        expect(result.output).toContain('Hello from Bash');
    });

    test('should execute (or simulate) Rust code', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('POLYGLOT_EXEC', {
                language: 'rust',
                code: 'fn main() { println!("Hello from Rust"); }'
            });
        });
        // console.log('Rust Result:', result);
        // Might be native or simulated depending on environment
        expect(result.status).toBe('success');
        // Output might be "Hello from Rust" (Native) or "[Simulated Output] ..." (Simulation)
        if (result.mode === 'native') {
             expect(result.output).toContain('Hello from Rust');
        } else {
             expect(result.output).toContain('Simulated');
        }
    });
    
    test('should execute (or simulate) Go code', async () => {
        const result = await window.evaluate(async () => {
            // @ts-ignore
            return await window.api.python.execute('POLYGLOT_EXEC', {
                language: 'go',
                code: 'package main\nimport "fmt"\nfunc main() { fmt.Println("Hello from Go") }'
            });
        });
        // console.log('Go Result:', result);
        expect(result.status).toBe('success');
    });
});
