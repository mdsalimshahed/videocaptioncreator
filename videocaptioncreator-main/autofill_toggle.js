// This file handles the logic for the new global autofill toggle switch.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app === 'undefined') {
        console.error('Error: Main app object not found.');
        return;
    }

    const toggleContainer = document.getElementById('autofill-toggle-btn');
    const checkbox = document.getElementById('global-autofill-toggle');
    
    // Failsafe check to ensure elements exist
    if (toggleContainer && checkbox) {
        toggleContainer.addEventListener('click', () => {
            // Toggle the 'active' class on the visual container
            toggleContainer.classList.toggle('active');
            
            // Check the new state by seeing if the 'active' class is present
            const isActive = toggleContainer.classList.contains('active');
            
            // Manually sync the hidden checkbox's 'checked' property with the new state
            checkbox.checked = isActive;
            
            // Update the global state in the main app object
            app.isGlobalAutofillEnabled = isActive;
        });
    }
});