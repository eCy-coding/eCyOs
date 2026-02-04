// Atom: system-lock
// Created: 2026-01-11T16:11:17.456Z
// Description: <Add Description>

function run(argv) {
    // Rhythm: Lock Screen
    const SystemEvents = Application('System Events');
    // Key command: Cmd + Ctrl + Q to lock screen
    SystemEvents.keystroke('q', { using: ['command down', 'control down'] });
    return JSON.stringify({ status: "success", atom: "system-lock" });
}
