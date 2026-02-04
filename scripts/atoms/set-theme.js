// Atom: set-theme
// Created: 2026-01-11
// Description: Sets the system appearance mode idempotently.
// Arguments: [0] = "dark" | "light"

function run(argv) {
    const targetMode = (argv[0] || "").replace(/['"]/g, '').trim().toLowerCase();
    
    if (targetMode !== 'dark' && targetMode !== 'light') {
         return JSON.stringify({ 
             status: "error", 
             error: "Invalid argument. Usage: set-theme <dark|light>. Received: " + JSON.stringify(argv)
         });
    }

    const SystemEvents = Application('System Events');
    const currentDark = SystemEvents.appearancePreferences.darkMode();
    
    const shouldBeDark = (targetMode === 'dark');

    if (currentDark !== shouldBeDark) {
        SystemEvents.appearancePreferences.darkMode = shouldBeDark;
        return JSON.stringify({ 
            status: "changed", 
            atom: "set-theme", 
            mode: shouldBeDark ? "Dark" : "Light" 
        });
    }

    return JSON.stringify({ 
        status: "idempotent", 
        atom: "set-theme", 
        mode: shouldBeDark ? "Dark" : "Light",
        message: "No change needed."
    });
}
