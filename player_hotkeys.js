document.addEventListener('DOMContentLoaded', () => {
    // This script relies on the global 'app' object.
    if (typeof app === 'undefined') {
        console.error('Error: Main app object not found. Make sure player_hotkeys.js is loaded after app.js');
        return;
    }

    const handlePlayerHotkeys = (e) => {
        // Check if the mouse is hovering over the player and the player is ready
        if (app.isHoveringPlayer && app.player && typeof app.player.seekTo === 'function') {
            
            // Determine the seek interval
            const DEFAULT_SEEK_INTERVAL = 5;
            let seekInterval = app.selectedSeekInterval ? Math.abs(app.selectedSeekInterval) : DEFAULT_SEEK_INTERVAL;
            
            let seekDirection = 0;

            if (e.key === 'ArrowLeft') {
                seekDirection = -1;
            } else if (e.key === 'ArrowRight') {
                seekDirection = 1;
            }

            if (seekDirection !== 0) {
                e.preventDefault(); // Prevent default browser action (like scrolling)
                const seekAmount = seekInterval * seekDirection;
                const currentTime = app.player.getCurrentTime();
                app.player.seekTo(currentTime + seekAmount, true);
            }
        }
    };

    document.addEventListener('keydown', handlePlayerHotkeys);
});