function run(argv) {
    // Atom: browser
    // Description: Controls default browser (Chrome/Safari) via JXA
    // Usage: atom run browser [open|search] [args]

    var appName = "Google Chrome"; // Defaulting to Chrome as per analysis
    var browser = Application(appName);
    var action = argv[0];
    var payload = argv[1];

    if (!browser.running()) {
        browser.activate();
        delay(1);
    }

    if (action === "open") {
        if (!payload) return JSON.stringify({ status: "error", message: "Missing URL" });
        
        if (appName === "Google Chrome") {
             var window = browser.windows[0];
             var tab = browser.Tab({ url: payload });
             window.tabs.push(tab);
        } else {
             browser.openLocation(payload);
        }
        return JSON.stringify({ status: "success", message: "Opened " + payload });
    }
    
    if (action === "search") {
        if (!payload) return JSON.stringify({ status: "error", message: "Missing query" });
        var searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(payload);
        
        if (appName === "Google Chrome") {
             var window = browser.windows[0];
             var tab = browser.Tab({ url: searchUrl });
             window.tabs.push(tab);
        } else {
             browser.openLocation(searchUrl);
        }
        return JSON.stringify({ status: "success", message: "Searched for " + payload });
    }

    return JSON.stringify({ status: "error", message: "Unknown action: " + action });
}
