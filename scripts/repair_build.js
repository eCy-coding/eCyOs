
const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/stage/main/conductor.ts',
    'src/stage/main/eye.process.ts',
    'src/stage/main/index.ts',
    'src/orchestra/swarm.ts',
    'src/orchestra/synapse.ts',
    'src/orchestra/hippocampus_neural.ts',
    'src/orchestra/HardwareBridge.ts',
    'src/orchestra/brain.ts',
    'src/cli.ts'
];

function fixFile(filePath) {
    const fullPath = path.join(__dirname, '../', filePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix 1: catch (error: unknown) -> catch (error: any)
    content = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)/g, 'catch (error: any)');
    content = content.replace(/catch\s*\(\s*err\s*:\s*unknown\s*\)/g, 'catch (err: any)');
    content = content.replace(/catch\s*\(\s*e\s*:\s*unknown\s*\)/g, 'catch (e: any)');

    // Fix 2: (plan: unknown) -> (plan: any)
    content = content.replace(/plan\s*:\s*unknown/g, 'plan: any');

    // Fix 3: message: unknown -> message: any (IPC handlers)
    content = content.replace(/message\s*:\s*unknown/g, 'message: any');
    content = content.replace(/data\s*:\s*unknown/g, 'data: any');

    // Fix 4: Restore console.log commented out inside blocks if any remain (regex is hard here, trusting manual fixes mostly)

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${filePath}`);
}

filesToFix.forEach(fixFile);
console.log("Repair Complete.");
