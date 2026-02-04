
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import * as path from 'path';

test.describe('Phase 48: Ollama Stress Test Gauntlet', () => {
    let electronApp;
    let window;

    // 40 Prompts across 4 Categories
    const SUITE = {
        MIN: [
            "2 + 2", "Capital of France", "Reverse 'hello'", "Type of animal is a dog?", "10 minus 5",
            "Color of a lemon", "3 * 3", "First letter of 'Alpha'", "Is fire hot?", "Write the number 1"
        ],
        MID: [
            "Write a JavaScript function to add two numbers.",
            "Explain what an API is in one sentence.",
            "Sort this array: [5, 1, 3] and show result.",
            "Convert 'hello world' to uppercase code example.",
            "Summarize: The quick brown fox jumps over the lazy dog.",
            "What is the boiling point of water in Celsius?",
            "Write a Python print statement.",
            "Explain the difference between let and const.",
            "What does HTTP stand for?",
            "Create a JSON object with one key 'id'."
        ],
        MAX: [
            "Explain the Theory of Relativity in simple terms.",
            "Write a React component for a counter with a button.",
            "Describe the water cycle in detail.",
            "Write a SQL query to select all users from a table named 'users' where age is > 18.",
            "Explain how a blockchain works.",
            "Write a primitive bubble sort algorithm in TypeScript.",
            "Analyze the sentiment of: 'I absolutely love this new feature, it is fantastic!'",
            "Explain the concept of Object Oriented Programming.",
            "Write a prompt to generate a picture of a cat.",
            "Compare TCP vs UDP protocols."
        ],
        HARD: [
            "Write a haiku about a recursive algorithm.",
            "Solve this riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            "Refactor this code to be functional: `let x = 0; for(let i=0; i<5; i++) x+=i;`",
            "Explain the ethical implications of AGI.",
            "Write a short story about a robot discovering emotion (max 3 sentences).",
            "Explain the difference between a process and a thread in OS theory.",
            "Write a regular expression to validate an email address.",
            "Debug this: `while(true) { // // // // // // console.log('loop') }` - explain the issue.",
            "Explain the concept of 'Closure' in JavaScript with a non-trivial example.",
            "Translate 'The early bird catches the worm' into a JSON representation of its meaning."
        ]
    };

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

    const runPrompt = async (prompt, category) => {
        // console.log(`[${category}] Asking: "${prompt}"`);
        const start = Date.now();
        const response = await window.evaluate(async (p) => {
             // @ts-ignore
             if (window.stage && window.stage.ai && window.stage.ai.ask) return await window.stage.ai.ask(p);
             // @ts-ignore
             if (window.api && window.api.ask) return await window.api.ask(p);
             return "API_NOT_FOUND";
        }, prompt);
        const duration = Date.now() - start;
        // console.log(`[${category}] Answered in ${duration}ms: "${response.substring(0, 50)}..."`);
        
        expect(response).not.toBe("API_NOT_FOUND");
        expect(response).not.toContain("Mock Response");
        expect(response.length).toBeGreaterThan(0);
        return { duration, response };
    };

    // Generate Tests Dynamically
    for (const [category, prompts] of Object.entries(SUITE)) {
        test.describe(`${category} Level Tests`, () => {
            for (const [i, prompt] of prompts.entries()) {
                test(`(${category}) Test ${i + 1}: ${prompt.substring(0, 20)}...`, async () => {
                   test.setTimeout(60000); // 60s per test for slow local LLMs
                   await runPrompt(prompt, category);
                });
            }
        });
    }
});
