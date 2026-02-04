
import { writeHeapSnapshot } from 'v8';
import * as path from 'path';
import * as fs from 'fs';

console.log('🛡️  Starting Memory Sentinel...');

const SNAPSHOT_DIR = path.join(process.cwd(), 'snapshots');
if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR);
}

// 1. Initial Snapshot
const snapshot1 = path.join(SNAPSHOT_DIR, `heap-${Date.now()}-1.heapsnapshot`);
console.log(`📸 Taking Baseline Snapshot: ${snapshot1}`);
writeHeapSnapshot(snapshot1);

// 2. Simulate Load (Allocation Stress)
console.log('🔥 Simulating High Memory Load...');
const leakSimulation: any[] = [];
for (let i = 0; i < 10000; i++) {
    leakSimulation.push({ id: i, data: new Array(100).fill('x') });
}

// 3. Cleanup (Simulate Garbage Collection opportunity)
// In a real leak scenario, we wouldn't clear this array, or references would persist.
// Here we clear it to verify GC *can* work. 
// If we wanted to test leak detection, we would keep it.
// Let's keep a small "leak" to verify the concept, then clear majority.
const intentionalLeak = leakSimulation.slice(0, 100); 
leakSimulation.length = 0;

if (global.gc) {
    console.log('🧹 Forcing Garbage Collection...');
    global.gc();
} else {
    console.log('⚠️  GC not exposed. Run with --expose-gc for accurate results.');
}

// 4. Post-Load Snapshot
const snapshot2 = path.join(SNAPSHOT_DIR, `heap-${Date.now()}-2.heapsnapshot`);
console.log(`📸 Taking Post-Load Snapshot: ${snapshot2}`);
writeHeapSnapshot(snapshot2);

const usage = process.memoryUsage();
console.log('\n📊 Memory Usage Report:');
console.log(`   RSS: ${Math.round(usage.rss / 1024 / 1024)} MB`);
console.log(`   Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
console.log(`   Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)} MB`);

// 5. Assertions (Simple Threshold)
const HEAP_LIMIT_MB = 200; // Strict limit for this specific test script
if (usage.heapUsed / 1024 / 1024 > HEAP_LIMIT_MB) {
    console.error(`❌ MEMORY LEAK DETECTED: Heap Used > ${HEAP_LIMIT_MB}MB`);
    process.exit(1);
} else {
    console.log(`✅ Memory usage within safe limits (<${HEAP_LIMIT_MB}MB).`);
    // Cleanup snapshots to be polite
    fs.unlinkSync(snapshot1);
    fs.unlinkSync(snapshot2);
    fs.rmdirSync(SNAPSHOT_DIR);
    console.log('🧹 Snapshots cleaned up.');
    process.exit(0);
}
