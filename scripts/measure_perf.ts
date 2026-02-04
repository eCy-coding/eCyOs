
import { performance } from 'perf_hooks';

console.log('🚀 Starting Performance Baseline Measurement...');

const measureLoad = (name: string, requireFn: () => void) => {
    const start = performance.now();
    requireFn();
    const end = performance.now();
    console.log(`⏱️  [Load] ${name}: ${(end - start).toFixed(2)}ms`);
};

// Measure Core Modules
measureLoad('Orchestra (Brain)', () => require('../src/orchestra/brain'));
measureLoad('Python Adapter', () => require('../src/orchestra/adapters/PythonAdapter'));
measureLoad('VSCode Bridge', () => require('../src/vscode/src/bridge'));
measureLoad('Safe FS', () => require('../src/orchestra/safe_fs'));

console.log('✅ Baseline Measurement Complete.');
