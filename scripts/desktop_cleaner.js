/**
 * Ankara Protocol: Desktop Cleaner
 * --------------------------------
 * "Zero Defect" Organization.
 * Moves "Screenshot..." or "Ekran Resmi..." files to Documents/Screenshots/YYYY-MM.
 */

function run(input, parameters) {
    var Finder = Application('Finder');
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;

    // 1. Setup Destination
    var home = app.pathTo('home folder').toString();
    var docsPath = home + "/Documents";
    var ssRootPath = docsPath + "/Screenshots";
    
    // Generate YYYY-MM folder name
    var now = new Date();
    var year = now.getFullYear();
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var targetFolder = ssRootPath + "/" + year + "-" + month;

    // Create folders if strict "mkdir -p" is needed
    // Using shell for reliability
    app.doShellScript('mkdir -p "' + targetFolder + '"');

    // 2. Scan Desktop
    var desktop = Finder.desktop;
    var files = desktop.files();
    var moveCount = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var name = file.name();

        // 3. Match Criteria (English and Turkish macOS defaults)
        if (name.startsWith("Screen Shot") || name.startsWith("Screenshot") || name.startsWith("Ekran Resmi")) {
            // Move file
            // Finder 'move' command requires explicit object reference
            try {
                // Determine source path
                var sourcePath = file.url(); // file:// path
                
                // Construct shell command for safest move (mv is atomic)
                // Convert file:// to posix path logic is complex in JXA, 
                // easier to stick to Finder move if possible, or shell with posix paths.
                
                // Let's use Finder Move for "Apple Native" way
                Finder.move(file, { to: Path(targetFolder) });
                moveCount++;
            } catch (e) {
                // Log error but continue
                console.log("Failed to move: " + name);
            }
        }
    }

    return "Ankara Cleaner: Moved " + moveCount + " screenshots.";
}
