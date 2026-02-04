// Atom: check-permissions
// Description: Verifies if the runtime has Accessibility (AX) permissions.
// Returns: { status: "success" | "error", allowed: boolean }

function run(argv) {
    try {
        var SystemEvents = Application('System Events');
        // Attempt to access a property that requires permissions
        // UI Elements access usually triggers the check
        var processCount = SystemEvents.processes.length; 
        
        return JSON.stringify({ 
            status: "success", 
            allowed: true, 
            message: "Accessibility permissions granted." 
        });
    } catch (e) {
        return JSON.stringify({ 
            status: "error", 
            allowed: false, 
            error: "Accessibility permissions missing. Error: " + e.message 
        });
    }
}
