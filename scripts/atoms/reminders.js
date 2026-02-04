function run(argv) {
    // Atom: reminders
    // Description: Interact with Apple Reminders
    // Usage: atom run reminders [add|list] [title]

    var Reminders = Application('Reminders');
    var action = argv[0];

    if (action === "add") {
        var title = argv[1];
        if (!title) return JSON.stringify({ status: "error", message: "Title required" });
        
        var task = Reminders.Reminder({ name: title });
        // Add to default list
        Reminders.defaultList().reminders.push(task);
        
        return JSON.stringify({ status: "success", message: "Added reminder: " + title });
    }

    if (action === "list") {
        // Switch to native JS array to avoid object specifier issues with slice
        var taskNames = [];
        var tasks = Reminders.defaultList().reminders();
        // Limit to 10 for performance
        var limit = Math.min(tasks.length, 10);
        
        for (var i = 0; i < limit; i++) {
            if (!tasks[i].completed()) {
                 taskNames.push(tasks[i].name());
            }
        }
        return JSON.stringify({ status: "success", reminders: taskNames });
    }

    return JSON.stringify({ status: "error", message: "Unknown action: " + action });
}
