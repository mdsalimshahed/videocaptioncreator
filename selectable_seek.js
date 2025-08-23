document.addEventListener('DOMContentLoaded', () => {
    if (typeof app === 'undefined') {
        console.error('Error: Main app object not found.');
        return;
    }

    const playbackControls = document.getElementById('playback-controls');
    if (!playbackControls) return;

    const handleSelection = (e) => {
        const target = e.target;
        if (!target.classList.contains('seek-control-btn')) return;

        const seekValue = parseInt(target.dataset.seek, 10);

        // If the clicked button is already selected, deselect it.
        if (target.classList.contains('selected')) {
            target.classList.remove('selected');
            app.selectedSeekInterval = null;
        } else {
            // Deselect any other selected button
            const currentSelected = playbackControls.querySelector('.seek-control-btn.selected');
            if (currentSelected) {
                currentSelected.classList.remove('selected');
            }
            // Select the new button
            target.classList.add('selected');
            app.selectedSeekInterval = seekValue;
        }
    };

    playbackControls.addEventListener('click', handleSelection);
});