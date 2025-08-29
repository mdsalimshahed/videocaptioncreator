document.addEventListener('DOMContentLoaded', () => {
    const resizer = document.getElementById('resizer');
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    const workspace = document.getElementById('workspace');

    if (!resizer || !leftColumn || !rightColumn || !workspace) {
        return;
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        document.body.classList.add('resizing');
        // Attach listeners to the window to capture events globally
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        // Failsafe: If the mouse button is not pressed, stop resizing.
        // This catches cases where the mouseup event is missed.
        if (e.buttons !== 1) {
            handleMouseUp();
            return;
        }

        const workspaceRect = workspace.getBoundingClientRect();
        const newLeftWidth = e.clientX - workspaceRect.left;
        
        // Calculate percentage and apply constraints
        let leftWidthPercent = (newLeftWidth / workspaceRect.width) * 100;
        if (leftWidthPercent < 40) {
            leftWidthPercent = 40;
        }
        if (leftWidthPercent > 70) {
            leftWidthPercent = 70;
        }
        
        const rightWidthPercent = 100 - leftWidthPercent;

        leftColumn.style.flex = `0 1 ${leftWidthPercent}%`;
        rightColumn.style.flex = `0 1 ${rightWidthPercent}%`;
    };

    const handleMouseUp = () => {
        document.body.classList.remove('resizing');
        // Clean up the global listeners from the window
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    resizer.addEventListener('mousedown', handleMouseDown);
});