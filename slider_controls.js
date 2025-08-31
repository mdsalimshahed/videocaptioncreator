document.addEventListener('DOMContentLoaded', () => {
    if (typeof app === 'undefined') return;

    const initializeSlider = (sliderId, thumbId, labelId, anchorValues) => {
        const slider = document.getElementById(sliderId);
        const thumb = document.getElementById(thumbId);
        const label = document.getElementById(labelId);
        if (!slider || !thumb || !label) return;

        const anchors = slider.querySelector('.slider-anchors');
        const numAnchors = anchorValues.length;

        const updateThumbPosition = (percent) => {
            thumb.style.left = `${percent}%`;
            const anchorIndex = Math.round(percent / (100 / (numAnchors - 1)));
            const value = anchorValues[anchorIndex];
            thumb.textContent = value.text;
            
            if (sliderId === 'speed-slider') {
                app.player.setPlaybackRate(value.value);
                document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll(`.speed-btn[data-speed="${value.value}"]`).forEach(btn => btn.classList.add('active'));
            } else if (sliderId === 'seek-slider') {
                app.selectedSeekInterval = value.value;
            }
        };

        const snapToNearestAnchor = (currentPercent) => {
            const step = 100 / (numAnchors - 1);
            const nearestAnchorIndex = Math.round(currentPercent / step);
            const snappedPercent = nearestAnchorIndex * step;
            updateThumbPosition(snappedPercent);
        };
        
        const handleMouseMove = (e) => {
            const rect = slider.getBoundingClientRect();
            let x = (e.clientX || e.touches[0].clientX) - rect.left;
            let percent = (x / rect.width) * 100;
            percent = Math.max(0, Math.min(100, percent));
            updateThumbPosition(percent);
        };

        const handleMouseUp = () => {
            const currentPercent = parseFloat(thumb.style.left);
            snapToNearestAnchor(currentPercent);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };

        const handleMouseDown = (e) => {
            e.preventDefault();
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchend', handleMouseUp);
        };

        thumb.addEventListener('mousedown', handleMouseDown);
        thumb.addEventListener('touchstart', handleMouseDown);
        
        // Initial setup
        snapToNearestAnchor(50); // Default to the middle anchor
    };

    const speedValues = [
        { text: '0.5x', value: 0.5 },
        { text: '1x', value: 1 },
        { text: '1.5x', value: 1.5 },
        { text: '2x', value: 2 }
    ];

    const seekValues = [
        { text: '1s', value: 1 },
        { text: '5s', value: 5 },
        { text: '10s', value: 10 },
        { text: '30s', value: 30 }
    ];

    initializeSlider('speed-slider', 'speed-thumb', 'speed-label', speedValues);
    initializeSlider('seek-slider', 'seek-thumb', 'seek-label', seekValues);
});