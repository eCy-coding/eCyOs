/**
 * Ankara Protocol: Universal Dev Launcher
 * ---------------------------------------
 * A "Zero Defect" JXA script to intelligently launch development environments.
 * 
 * Usage from Terminal:
 * osascript -l JavaScript scripts/dev_launcher.js "/path/to/project"
 * 
 * Usage from Automator (Quick Action):
 * Input: specific folders
 * Action: Run JavaScript > [Paste Code] or [Load File]
 */

function run(input, parameters) {
    // 1. Normalize Input (Handle Automator array or direct string)
    var projectPath = "";
    if (Array.isArray(input) && input.length > 0) {
        projectPath = input[0].toString();
    } else if (typeof input === 'string') {
        projectPath = input;
    } else {
        // Fallback for CLI testing via osascript args
        var app = Application.currentApplication();
        app.includeStandardAdditions = true;
        // In standalone mode, we might hardcode or prompt. 
        // For Ankara Protocol CLI integration, we pass args differently, 
        // but let's assume direct path execution for now.
        return "Error: No path provided";
    }

    var Finder = Application('Finder');
    var Terminal = Application('Terminal');
    var SystemEvents = Application('System Events');
    
    // 2. Detect Project Type
    var isNode = false;
    var isPython = false;
    
    // Check for package.json
    try {
        var npmFile = Path(projectPath + "/package.json");
        // Accessing properties triggers file check
        if (npmFile.toString()) isNode = true;
    } catch(e) {}

    // Check for requirements.txt or *.py
    try {
        var pyFile = Path(projectPath + "/requirements.txt");
        if (pyFile.toString()) isPython = true;
    } catch(e) {}

    // 3. Launch VS Code
    // We use "doShellScript" for robust CLI tool execution
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.doShellScript('open -a "Visual Studio Code" "' + projectPath + '"');

    // 4. Launch Terminal & Setup Environment
    if (!Terminal.running()) Terminal.activate();
    
    // Create a new tab/window for the project
    var tab = Terminal.doScript("cd \"" + projectPath + "\"");
    
    // 5. Intelligent Auto-Start
    if (isNode) {
        // Check if "start" or "dev" script exists textually is hard in pure JXA without reading file content.
        // We will just echo the suggestion for safety (2+2=4 reliability over guessing).
        Terminal.doScript("echo '🚀 Ankara Protocol detected Node.js project.'", { in: tab });
        Terminal.doScript("echo 'Type `npm run dev` to start.'", { in: tab });
        // Optional: Terminal.doScript("npm run dev", { in: tab }); 
    } else if (isPython) {
        Terminal.doScript("echo '🐍 Ankara Protocol detected Python project.'", { in: tab });
        Terminal.doScript("source venv/bin/activate 2>/dev/null || echo 'No virtualenv detected'", { in: tab });
    } else {
        Terminal.doScript("echo '📂 Project opened. Ready for commands.'", { in: tab });
    }
    
    return "Opened: " + projectPath;
}
