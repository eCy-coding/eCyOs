// Atom: set-dnd
// Created: 2026-01-11
// Description: Sets the Do Not Disturb state idempotently.
// Arguments: [0] = "true" | "false"

function run(argv) {
    const targetState = (argv[0] || "").toLowerCase();
    
    if (targetState !== 'true' && targetState !== 'false') {
         return JSON.stringify({ 
             status: "error", 
             error: "Invalid argument. Usage: set-dnd <true|false>" 
         });
    }

    // Note: Direct DND control via JXA is restricted on modern macOS.
    // Ideally this should call a Shortcut: `shortcuts run "Set Focus" <<< "On"`
    
    return JSON.stringify({ 
        status: "skipped", 
        atom: "set-dnd", 
        target: targetState,
        instruction: "Please ensure a Shortcut named 'Set Focus' exists that accepts input." 
    });
}
