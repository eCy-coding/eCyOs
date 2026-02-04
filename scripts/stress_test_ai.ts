
import { CloudIntelligence } from '../src/orchestra/cloud_intelligence';

const API_KEY = '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';
const client = new CloudIntelligence(API_KEY);

const TOPICS = [
    "Orchestration (XState)",
    "Task Dependency (DAG)",
    "Local RAG",
    "Fuzzy Matching",
    "IPC Optimization",
    "Data Compression",
    "Local-First Sync (CRDT)",
    "CLI Automation",
    "Electron Performance",
    "Vector Stores",
    "Context Window Sliding",
    "Node.js Worker Threads",
    "Error Handling Patterns",
    "System Architecture",
    "E2E Testing Strategies"
];

async function runTest() {
    console.log("🚀 Starting AI Stress Test (15 Topics, Min/Max Levels)...");
    console.log("-------------------------------------------------------");

    let successCount = 0;
    
    for (const [i, topic] of TOPICS.entries()) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(`\n[${i+1}/15] Topic: ${topic}`);
        
        // MIN Level (Simple Definition)
        try {
            process.stdout.write("  - MIN (Definition): ");
            const minStart = Date.now();
            const minRes = await client.ask(`Define ${topic} in one sentence.`);
            const minTime = Date.now() - minStart;
            console.log(`✅ (${minTime}ms)`);
            // console.log(`    "${minRes.slice(0, 50)}..."`);
        } catch (e: any) {
            console.log(`❌ Error: ${e.message}`);
        }

        // MAX Level (Complex Implementation)
        try {
            process.stdout.write("  - MAX (Implementation Plan): ");
            const maxStart = Date.now();
            const maxRes = await client.ask(
                `Create a detailed implementation plan for ${topic} in a TypeScript Electron app. Include code snippets for the core logic.`,
                "You are a Senior Architect."
            );
            const maxTime = Date.now() - maxStart;
            console.log(`✅ (${maxTime}ms) - Response Length: ${maxRes.length} chars`);
            successCount++;
        } catch (e: any) {
            console.log(`❌ Error: ${e.message}`);
        }
    }

    console.log("\n-------------------------------------------------------");
    console.log(`Test Complete. Successful Topics: ${successCount}/${TOPICS.length}`);
}

runTest().catch(console.error);
