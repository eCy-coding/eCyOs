
import { performance } from 'perf_hooks';
import * as path from 'path';
import * as fs from 'fs';

console.log('🏎️  Starting Silicon Engine Benchmark...');

// 1. Load WASM Module
const wasmPath = path.resolve(__dirname, '../src/native/pkg');
let wasm: any;
try {
    wasm = require(wasmPath);
    console.log('✅ WASM Module Loaded.');
} catch (e) {
    console.error('❌ Failed to load WASM module:', e);
    process.exit(1);
}

// 2. JS Implementations
function jsFibonacci(n: number): number {
    if (n <= 1) return n;
    return jsFibonacci(n - 1) + jsFibonacci(n - 2);
}

function jsVectorSum(data: Float64Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    return sum;
}

// 3. Benchmarking Function
function benchmark(name: string, runs: number, fn: () => void) {
    const start = performance.now();
    for (let i = 0; i < runs; i++) {
        fn();
    }
    const end = performance.now();
    const duration = end - start;
    const avg = duration / runs;
    console.log(`   🔸 ${name}: Total ${duration.toFixed(2)}ms | Avg ${avg.toFixed(4)}ms`);
    return duration;
}

// 4. Run Benchmarks
console.log('\n--- 🧬 Fibonacci (Recursive) ---');
const fibN = 30; // 30 is good for recursion stress
console.log(`Calculating Fib(${fibN}) x 10 runs`);

const jsFibTime = benchmark('JavaScript', 10, () => jsFibonacci(fibN));
const wasmFibTime = benchmark('Rust/WASM ', 10, () => wasm.fast_fibonacci(fibN));

console.log(`   Speedup: ${(jsFibTime / wasmFibTime).toFixed(2)}x`);


console.log('\n--- 📊 Vector Sum (Data Processing) ---');
const vectorSize = 1000000;
const vector = new Float64Array(vectorSize).fill(1.5);
console.log(`Summing ${vectorSize} floats x 100 runs`);

const jsVecTime = benchmark('JavaScript', 100, () => jsVectorSum(vector));
const wasmVecTime = benchmark('Rust/WASM ', 100, () => wasm.fast_vector_sum(vector));

console.log(`   Speedup: ${(jsVecTime / wasmVecTime).toFixed(2)}x`);


console.log('\n✅ Benchmark Complete.');
