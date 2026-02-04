function run(argv) {
    // Atom: spotify
    // Description: Controls Spotify playback
    // Usage: atom run spotify [play|pause|next|prev|info]

    var spotify = Application('Spotify');
    var action = argv[0];

    // Check if running
    if (!spotify.running()) {
        return JSON.stringify({ status: "error", message: "Spotify is not running." });
    }

    try {
        if (action === "play") {
            spotify.play();
            return JSON.stringify({ status: "success", message: "Spotify Playing" });
        }
        if (action === "pause") {
            spotify.pause();
            return JSON.stringify({ status: "success", message: "Spotify Paused" });
        }
        if (action === "next") {
            spotify.nextTrack();
            return JSON.stringify({ status: "success", message: "Skipped to next track" });
        }
        if (action === "prev") {
            spotify.previousTrack();
            return JSON.stringify({ status: "success", message: "Skipped to previous track" });
        }
        if (action === "info") {
            var track = spotify.currentTrack;
            return JSON.stringify({ 
                status: "success", 
                artist: track.artist(), 
                track: track.name(), 
                album: track.album(),
                state: spotify.playerState()
            });
        }
    } catch (e) {
        return JSON.stringify({ status: "error", message: e.message });
    }

    return JSON.stringify({ status: "error", message: "Unknown action: " + action });
}
