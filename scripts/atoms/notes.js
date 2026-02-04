function run(argv) {
    // Atom: notes
    // Description: Interact with Apple Notes
    // Usage: atom run notes [new|list|show] [title] [body]

    var Notes = Application('Notes');
    var action = argv[0];

    if (action === "new") {
        var title = argv[1] || "New Note";
        var body = argv[2] || "";
        
        var note = Notes.Note({ name: title, body: body });
        Notes.accounts[0].notes.push(note);
        
        return JSON.stringify({ status: "success", message: "Created note: " + title });
    }

    if (action === "list") {
        // Get recent 5 notes
        var notes = Notes.accounts[0].notes.slice(0, 5);
        var result = [];
        for (var i = 0; i < notes.length; i++) {
            result.push(notes[i].name());
        }
        return JSON.stringify({ status: "success", notes: result });
    }

    if (action === "show") {
        var search = argv[1];
        if (!search) return JSON.stringify({ status: "error", message: "Title required" });
        
        var found = Notes.accounts[0].notes.whose({ name: search });
        if (found.length > 0) {
            found[0].show();
            return JSON.stringify({ status: "success", message: "Opened note: " + search });
        } else {
            return JSON.stringify({ status: "error", message: "Note not found: " + search });
        }
    }

    return JSON.stringify({ status: "error", message: "Unknown action: " + action });
}
