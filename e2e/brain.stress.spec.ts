
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('OSSC Protocol: Brain Stress & Persona Verification', () => {
    let electronApp: unknown;
    let window: unknown;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: { NODE_ENV: 'test' }
        });
        
        // Wait for Splash
        await new Promise(r => setTimeout(r, 2500));
        
        const windows = await electronApp.windows();
        if (windows.length > 0) {
            window = windows[windows.length - 1];
        } else {
             window = await electronApp.firstWindow();
        }
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('Persona: The Architect (JSON Schema Design)', async () => {
        // We need to wait for rate limit if we just ran regular startup tests...
        await new Promise(r => setTimeout(r, 2000));

        const prompt = "Design a User Profile system.";
        const response = await window.evaluate(async (p: string) => {
             return await window.stage.ai.ask(p, 'local', { persona: 'ARCHITECT' });
        }, prompt);
        
        // console.log('Architect Response:', response);
        // Expect JSON content or schema keywords
        expect(response).toMatch(/json|schema|interface|component/i);
    });

    test('Persona: The Coder (Strict TypeScript)', async () => {
        await new Promise(r => setTimeout(r, 2000));

        const prompt = "Write a function to add two numbers.";
        const response = await window.evaluate(async (p: string) => {
             return await window.stage.ai.ask(p, 'local', { persona: 'CODER' });
        }, prompt);
        
        // console.log('Coder Response:', response);
        // Expect Types / strictness
        expect(response).toContain('number');
        expect(response).toContain('return');
    });

    test('Persona: The Skeptic (Security Audit)', async () => {
         await new Promise(r => setTimeout(r, 2000));
         
         const badCode = "function query(id) { db.exec('SELECT * FROM users WHERE id=' + id); }";
         const response = await window.evaluate(async (c: string) => {
             return await window.stage.ai.ask(`Analyze this code:\n${c}`, 'local', { persona: 'CRITIC' });
         }, badCode);
         
         // console.log('Critic Response:', response);
         expect(response.toLowerCase()).toContain('injection');
    });
});
