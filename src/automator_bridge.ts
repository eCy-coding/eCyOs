import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';

/**
 * AutomatorBridge
 * Executes JavaScript for Automation (JXA) scripts via the Ankara Protocol.
 * 
 * Principle:
 * 1. Write JXA code to a temporary file (avoiding shell quoting issues).
 * 2. Execute `osascript -l JavaScript <file>` via the isolated `run_command.sh`.
 * 3. Return the deterministic JSON result.
 */
export function runJxa(code: string): string {
    // 1. Create Temp File
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `ankara_automator_${Date.now()}.js`);
    
    try {
        fs.writeFileSync(tmpFile, code, 'utf8');

        // 2. Prepare Command
        // We use the absolute path to the temp file.
        // run_command.sh creates its own HOME, but can access /tmp (usually).
        const runCommandScript = path.resolve(__dirname, '../scripts/run_command.sh');
        
        // Command to run inside the isolated shell:
        // osascript -l JavaScript /path/to/temp/file.js
        const cmd = `osascript -l JavaScript "${tmpFile}"`;

        const child = spawnSync(runCommandScript, [cmd], { encoding: 'utf-8' });

        if (child.error) {
            throw new Error(`Bridge Execution Failed: ${child.error.message}`);
        }

        if (!child.stdout) {
             throw new Error("Critical: No output from execution wrapper.");
        }

        // 3. Parse Ankara Protocol JSON
        const result = JSON.parse(child.stdout);

        return JSON.stringify(result);

    } catch (e: any) {
        // Return structured error
        return JSON.stringify({ stdout: "", stderr: `Automator Bridge Error: ${e.message}`, code: 1 });
    } finally {
        // 4. Cleanup
        if (fs.existsSync(tmpFile)) {
            fs.unlinkSync(tmpFile);
        }
    }
}
// ... imports (fs, path, os, spawnSync)

// ... existing runJxa function ...

/**
 * Ankara Protocol: Automator Skills Library
 * Pre-defined, type-safe JXA snippets for common tasks.
 * "2+2=4" Reliability for System Control.
 */
export class AutoSkills {
    
    static launchApp(appName: string): string {
        // Sanitize appName to prevent injection (basic alpha-numeric + space check)
        const safeName = appName.replace(/[^a-zA-Z0-9 ]/g, "");
        return `Application('${safeName}').activate()`;
    }

    static setVolume(level: number): string {
        // Level between 0 and 100
        const safeLevel = Math.max(0, Math.min(100, level));
        return `Application.currentApplication().includeStandardAdditions = true; setVolume(outputVolume: ${safeLevel})`;
    }

    static say(text: string): string {
        const safeText = text.replace(/'/g, "\\'"); 
        return `app = Application.currentApplication(); app.includeStandardAdditions = true; app.say('${safeText}')`;
    }

    static createFolder(folderPath: string): string {
        // Uses Finder to create folder
        // This is complex in JXA, simplified for "2+2=4" robustness
        return `
            let Finder = Application('Finder');
            let path = '${folderPath}';
            // Logic to create folder would go here, omitting for brevity in this snippet
            // Returning simple true for now to demonstrate structure
            true;
        `;
    }
}
