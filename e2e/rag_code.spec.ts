
import { test, expect } from '@playwright/test';
import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'path';
import fs from 'fs';

let electronApp: ElectronApplication;

// Create a dummy file to index
const TEST_FILE_PATH = path.join(__dirname, '../src/test_rag_dummy.ts');
const TEST_CONTENT = `
export function secretFunctionForRAG() {
    // console.log("The eagle has landed at midnight.");
    return 42;
}
`;

test.beforeAll(async () => {
    // Write dummy file
    fs.writeFileSync(TEST_FILE_PATH, TEST_CONTENT);

    electronApp = await electron.launch({
        args: [path.join(__dirname, '../dist/stage/main/index.js')],
        timeout: 30000,
        env: { ...process.env, NODE_ENV: 'test' }
    });
});

test.afterAll(async () => {
    await electronApp.close();
    // Cleanup
    if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
});

test('Synaptic Expansion: Deep RAG & Code Search', async () => {
    // 1. Wait for Window & Stage API
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
    }, { timeout: 20000 }).toBeTruthy();

    if (!window) throw new Error('Main Window not found');

    // 2. Trigger Indexing of the src folder (where our dummy file lives)
    // console.log('Triggering Synapse Indexing...');
    // We point specifically to the file or just src
    // Since synapse crawls src recursively, it should pick up src/test_rag_dummy.ts
    const srcDir = path.dirname(TEST_FILE_PATH); 
    const indexResponse = await window.evaluate((dir) => window.stage.orchestra.code.index(dir), srcDir);
    expect(indexResponse).toContain('Indexing Started');

    // 3. Wait for Indexing (It's async and depends on Brain/Ollama speed)
    // We pool for search results. Initial indexing might take a few seconds.
    // console.log('Waiting for Embedding/Indexing...');
    
    await expect.poll(async () => {
        const results = await window.evaluate(() => window.stage.orchestra.code.search('eagle landed midnight'));
        // console.log('Search Results:', results.length);
        if (results.length > 0) {
            const first = results[0];
            // Verify content match
            return first.content.includes('secretFunctionForRAG') && first.filePath.includes('test_rag_dummy.ts');
        }
        return false;
    }, {
        timeout: 45000, // Give enough time for embedding generation (Ollama can be slow on first run)
        intervals: [2000, 5000, 5000]
    }).toBeTruthy();
});
