
import { workerData, parentPort, isMainThread, Worker } from 'worker_threads';
import { fork } from 'child_process';
import path from 'path';

// This script benchmarks Memory & Startup Time for Worker vs Fork
// Usage: npx ts-node scripts/benchmark_threads.ts

const ITERATIONS = 10;

if (isMainThread) {
    (async () => {
        console.log(`Running Benchmark (${ITERATIONS} iterations)...`);
        
        // 1. Benchmark Workers
        console.log('\n--- Benchmarking Worker Threads ---');
        let workerStartAvg = 0;
        let workerMemAvg = 0;

        for (let i = 0; i < ITERATIONS; i++) {
            const start = performance.now();
            await new Promise<void>((resolve) => {
                // Point to THIS file, it will run the 'else' block
                const w = new Worker(__filename, { workerData: { mode: 'child' } });
                w.on('message', (mem) => {
                    workerMemAvg += mem;
                    w.terminate();
                    resolve();
                });
            });
            workerStartAvg += (performance.now() - start);
        }
        
        console.log(`Worker Avg Startup: ${(workerStartAvg / ITERATIONS).toFixed(2)}ms`);
        console.log(`Worker Avg Heap Used: ${(workerMemAvg / ITERATIONS / 1024 / 1024).toFixed(2)} MB`);


        // 2. Benchmark Fork (Process)
        console.log('\n--- Benchmarking Fork (Child Process) ---');
        let forkStartAvg = 0;
        let forkMemAvg = 0;

        for (let i = 0; i < ITERATIONS; i++) {
            const start = performance.now();
             await new Promise<void>((resolve) => {
                // Fork THIS file
                const p = fork(__filename, [], { env: { ...process.env, MODE: 'child' } });
                p.on('message', (mem: any) => {
                    forkMemAvg += mem;
                    p.kill();
                    resolve();
                });
            });
            forkStartAvg += (performance.now() - start);
        }
        
        console.log(`Fork Avg Startup: ${(forkStartAvg / ITERATIONS).toFixed(2)}ms`);
        console.log(`Fork Avg Heap Used: ${(forkMemAvg / ITERATIONS / 1024 / 1024).toFixed(2)} MB`);

        console.log('\n--- Summary ---');
        const speedup = forkStartAvg / workerStartAvg;
        console.log(`Worker is ${speedup.toFixed(2)}x faster to start.`);
        
    })();
} else {
    // WORKER THREAD LOGIC
    if (workerData && workerData.mode === 'child') {
        const used = process.memoryUsage().heapUsed;
        parentPort?.postMessage(used);
    }
}

// FORK PROCESS LOGIC
if (process.env.MODE === 'child') {
    const used = process.memoryUsage().heapUsed;
    if (process.send) process.send(used);
}
