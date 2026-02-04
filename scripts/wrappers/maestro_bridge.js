// Maestro Bridge: The Native App Conductor
// This file is a TEMPLATE. The 'COMMAND_PLACEHOLDER' will be replaced by the deploy script.

function run(argv) {
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;

    // Hardcoded Command injected by deploy-maestro
    var commandToRun = "COMMAND_PLACEHOLDER";
    
    // Path to the project root (Injected or relative detection)
    // For robustness in compiled apps, we generally use absolute paths or a known environment.
    // We'll inject the full path to the Orchestra CLI wrapper.
    
    try {
        // execute shell script
        // We need to source specific profile or set PATH because doShellScript is bare.
        var result = app.doShellScript("export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin; " + commandToRun);
        
        // Optional: Notify on success if it's a silent task?
        // app.displayNotification("Task Completed", { withTitle: "Antigravity Maestro", subtitle: "Success" });
        return result;
    } catch (e) {
        app.displayAlert("Maestro Error", { message: e.toString() });
        return "Error: " + e.toString();
    }
}
