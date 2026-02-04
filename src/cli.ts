import { spawnSync } from 'child_process';
import * as path from 'path';
import { getAnswer } from './answer_engine';
import { runJxa } from './automator_bridge';

/**
 * Ankara Protocol CLI
 * Adheres to "Universal Perfection" standards for deterministic execution.
 */

const VERSION = '1.0.0';

interface CommandResult {
  stdout: string;
  stderr: string;
  code: number;
}

interface ParsedArgs {
  flags: {
    json: boolean;
    help: boolean;
    version: boolean;
  };
  command: string;
}

function safeJsonPrint(data: CommandResult) {
  // Always output a strict JSON object with stdout, stderr, and code fields
  try {
    console.log(JSON.stringify(data));
  } catch (e) {
    // Fallback in the unlikely case JSON.stringify fails
    console.log('{"stdout":"","stderr":"JSON Serialization Failed","code":1}');
  }
}


function printUsage() {
  // console.log('Usage: cli [options] <command>');
  // console.log('\nOptions:');
  // console.log('  --json       Output result in strictly valid JSON format');
  // console.log('  --help       Show this help message');
  // console.log('  --version    Show version');
  // console.log('\nCommands:');
  // console.log('  ask <question>      Ask the Answer Engine');
  // console.log('  automate <code>     Execute JXA/AppleScript code');
  // console.log('  <shell_cmd>         Execute generic shell command');
}

function parseArgs(args: string[]): ParsedArgs {
  const flags = {
    json: false,
    help: false,
    version: false,
  };
  const commandParts: string[] = [];

  for (const arg of args) {
    if (arg === '--json') flags.json = true;
    else if (arg === '--help') flags.help = true;
    else if (arg === '--version') flags.version = true;
    else commandParts.push(arg);
  }

  return { flags, command: commandParts.join(' ') };
}

async function main() {
  // Wrap everything in a try-catch to ensure we can always honor --json if it crashed
  let flags = { json: false, help: false, version: false }; 
  
  try {
    const args = parseArgs(process.argv.slice(2));
    flags = args.flags;
    const { command } = args;

    // 1. Handle Meta Flags
    if (flags.help) {
      if (flags.json) {
        safeJsonPrint({ stdout: "Usage: ...", stderr: "", code: 0 });
      } else {
        printUsage();
      }
      process.exit(0);
    }

    if (flags.version) {
      if (flags.json) {
        safeJsonPrint({ stdout: `v${VERSION}`, stderr: "", code: 0 });
      } else {
        // console.log(`v${VERSION}`);
      }
      process.exit(0);
    }

    if (!command) {
      const err = "Error: No command provided.";
      if (flags.json) {
        safeJsonPrint({ stdout: "", stderr: err, code: 1 });
      } else {
        console.error(err);
        printUsage();
      }
      process.exit(1);
    }

    // 2. Handle Answer Engine (Internal Virtual Module)
    if (command.startsWith('ask ')) {
      const question = command.slice(4).trim();
      const answer = getAnswer(question);
      
      if (flags.json) {
        safeJsonPrint({ stdout: answer, stderr: "", code: 0 });
      } else {
        console.log(answer);
      }
      process.exit(0);
    }

    // 3.5 Handle Orchestra Protocol (Phase 6)
    if (command.startsWith('orchestra ')) {
        // Simple manual parsing to avoid modifying parseArgs heavily for now
        // "orchestra check system" -> "check system"
        // command is "orchestra check system"
        const subCommand = command.slice(10).trim();
        if (!subCommand) {
             const err = { error: "No orchestra command provided", usage: "orchestra [check system|set volume...]" };
             if (flags.json) safeJsonPrint({ stdout: "", stderr: JSON.stringify(err), code: 1 });
             else console.error(err);
             process.exit(1);
        }

        // Lazy load Conductor to avoid circular dep issues during init if any
        const { Conductor } = require('./orchestra/conductor');
        Conductor.conduct(subCommand).then((result: unknown) => {
             // Result is already a JSON object from Conductor
             if (flags.json) {
                 // wrap in standard CommandResult structure for consistency
                 // or just print the raw object if that's the contract.
                 // Ankara standard: always stdout/stderr/code.
                 // But Conductor returns domain object.
                 // Let's wrap it in stdout.
                 safeJsonPrint({ stdout: JSON.stringify(result), stderr: "", code: 0 });
             } else {
                 // console.log(JSON.stringify(result, null, 2));
             }
             process.exit(0);
        }).catch((err: any) => {
             const errorObj = { stdout: "", stderr: err.message, code: 1 };
             if (flags.json) safeJsonPrint(errorObj);
             else console.error(err);
             process.exit(1);
        });
        return; // Async handling means we don't fall through, but process.exit handles it.
    }

    // 3.6 Handle Atom Direct Commands (Shortcut)
    if (command.startsWith('atom ')) {
        const { Conductor } = require('./orchestra/conductor');
        Conductor.conduct(command).then((result: unknown) => {
             if (flags.json) {
                 safeJsonPrint({ stdout: JSON.stringify(result), stderr: "", code: 0 });
             } else {
                 // console.log(JSON.stringify(result, null, 2));
             }
             process.exit(0);
        }).catch((err: any) => {
             const errorObj = { stdout: "", stderr: err.message, code: 1 };
             if (flags.json) safeJsonPrint(errorObj);
             else console.error(err);
             process.exit(1);
        });
        return; 
    }

    // 3. Handle Automator Engine (Phase 25)
    if (command.startsWith('automate ')) {
        const prompt = command.slice(9).trim();
        
        try {
            // Lazy load Automator to avoid initializing Brain unnecessarily
            const { Automator } = require('./orchestra/automator');
            const agent = new Automator();
            
            // [FIX] Method name is 'automator', not 'perform'
            const resultMsg = await agent.automator(prompt);

            if (flags.json) {
                safeJsonPrint({ stdout: resultMsg, stderr: "", code: 0 });
            } else {
                 console.log(resultMsg);
            }
            process.exit(0);

        } catch (e: any) {
             const errorObj = { stdout: "", stderr: `Automator Failed: ${e.message}`, code: 1 };
             if (flags.json) safeJsonPrint(errorObj);
             else console.error(errorObj.stderr);
             process.exit(1);
        }
    }

    // 3.5 Handle Admin Console (Phase 26)
    if (command === 'admin') {
      console.log('[CLI] Launching Admin Console...');
      try {
        const adminScript = path.join(__dirname, 'admin', 'index.js');
        // Spawn a new Node process for the Admin Console (ESM)
        const child = spawnSync('node', [adminScript], { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        if (child.error) throw child.error;
        process.exit(child.status ?? 0);
      } catch (e: any) {
         const errorObj = { stdout: "", stderr: `Admin Console Failed: ${e.message}`, code: 1 };
         if (flags.json) safeJsonPrint(errorObj);
         else console.error(errorObj.stderr);
         process.exit(1);
      }
    }

    // 4. Handle External Commands (via Ankara Protocol Script)
    const scriptPath = path.resolve(__dirname, '../scripts/run_command.sh');
    
    // We use spawnSync to avoid shell injection vulnerabilities in the node layer.
    // The scriptPath itself creates the isolated shell environment.
    const child = spawnSync(scriptPath, [command], { encoding: 'utf-8' });

    if (child.error) {
      const errObj = { stdout: "", stderr: `Spawn Failed: ${child.error.message}`, code: 1 };
      if (flags.json) safeJsonPrint(errObj);
      else console.error(errObj.stderr);
      process.exit(1);
    }

    // The script is GUARANTEED to return JSON by the Ankara Protocol.
    if (!child.stdout) {
      const err = "Critical: No output from execution wrapper.";
      if (flags.json) safeJsonPrint({ stdout: "", stderr: err, code: 1 });
      else console.error(err);
      process.exit(1);
    }

    try {
      const result: CommandResult = JSON.parse(child.stdout);
      
      if (flags.json) {
        safeJsonPrint(result);
      } else {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
      }
      process.exit(result.code);
    } catch (e) {
      const err = `Protocol Violation: Invalid JSON output from script.\nRaw: ${child.stdout}`;
      if (flags.json) safeJsonPrint({ stdout: "", stderr: err, code: 1 });
      else console.error(err);
      process.exit(1);
    }

  } catch (e: any) {
    // Ultimate safety net
    const err = `Unexpected CLI Crash: ${e.message}`;
    if (flags.json) {
       // console.log(JSON.stringify({ stdout: "", stderr: err, code: 1 }));
    } else {
       console.error(err);
    }
    process.exit(1);
  }
}

main();
