// text_undo_redo.js
document.addEventListener('DOMContentLoaded', () => {
    // This listener uses the "capture" phase to intercept the event early.
    document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        const isTextField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';

        // Check for Ctrl+Z or Ctrl+Y
        if (e.ctrlKey && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
            // If the focus is on a text field, stop the event from propagating further.
            // This allows the browser's native undo/redo to work for the text field,
            // and prevents the app's global undo/redo (for adding/deleting bookmarks) from firing.
            if (isTextField) {
                e.stopPropagation();
            }
        }
    }, true); // The 'true' argument enables the capture phase.
});