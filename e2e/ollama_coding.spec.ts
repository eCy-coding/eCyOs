
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import * as path from 'path';

test.describe('Phase 49: Ollama Coding Station', () => {
    let electronApp;
    let window;

    test.beforeAll(async () => {
        electronApp = await electron.launch({
            args: [path.join(__dirname, '../dist/stage/main/index.js')],
            env: {
                ...process.env,
                NODE_ENV: 'test',
                AI_LIVE_MODE: 'true' // Vital for Live Inference
            }
        });
        window = await electronApp.firstWindow();
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    const askBrain = async (prompt) => {
        // console.log(`[Coding] Asking: "${prompt}"`);
        const start = Date.now();
        const response = await window.evaluate(async (p) => {
            // @ts-ignore
            if (window.stage && window.stage.ai && window.stage.ai.ask) return await window.stage.ai.ask(p);
            // @ts-ignore
            if (window.api && window.api.ask) return await window.api.ask(p);
            return "API_NOT_FOUND";
        }, prompt);
        const duration = Date.now() - start;
        // console.log(`[Coding] Answered in ${duration}ms.\nResponse Preview:\n${response.substring(0, 100)}...`);
        return response;
    };

    test('Should generate valid Python code (Factorial)', async () => {
        test.setTimeout(90000);
        const prompt = "Write a Python function to calculate the factorial of a number using recursion. Include type hints.";
        const response = await askBrain(prompt);

        expect(response).not.toBe("API_NOT_FOUND");
        expect(response).not.toContain("Mock Response");
        
        // Validation
        expect(response).toContain("def factorial");
        expect(response).toContain("return");
        expect(response).toContain("```python");
        expect(response).toContain("```");
    });

    test('Should generate valid TypeScript Component (React)', async () => {
        test.setTimeout(90000);
        const prompt = "Create a simple React Functional Component in TypeScript named 'UserCard' that takes 'name' and 'age' props.";
        const response = await askBrain(prompt);

        expect(response).not.toBe("API_NOT_FOUND");
        expect(response).not.toContain("Mock Response");

        // Validation
        expect(response).toContain("interface");
        expect(response).toContain(": React.FC");
        expect(response).toMatch(/export (const|default) UserCard/);
        expect(response.toLowerCase()).toContain("```typescript") || expect(response.toLowerCase()).toContain("```tsx");
    });

    test('Should generate valid Bash Script (System Check)', async () => {
        test.setTimeout(90000);
        const prompt = "Write a bash script to check if a directory exists, and if not, create it. Use strict mode.";
        const response = await askBrain(prompt);

        expect(response).not.toBe("API_NOT_FOUND");
        expect(response).not.toContain("Mock Response");

        // Validation
        expect(response).toContain("#!/bin/bash");
        expect(response).toContain("set -euo pipefail"); // Strict mode check
        expect(response).toContain("mkdir");
        expect(response).toContain("```bash");
    });

    test('Should explain code logic (Code -> Text)', async () => {
        test.setTimeout(90000);
        const prompt = "Explain what this regex does: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
        const response = await askBrain(prompt);

        expect(response).not.toBe("API_NOT_FOUND");
        expect(response).not.toContain("Mock Response");

        // Validation
        expect(response.toLowerCase()).toContain("email");
        expect(response.toLowerCase()).toContain("domain");
        expect(response.toLowerCase()).toContain("match");
    });

});
