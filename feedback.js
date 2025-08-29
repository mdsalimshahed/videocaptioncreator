document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const modal = document.getElementById('feedback-modal');
    const openBtn = document.getElementById('feedback-btn'); // This might be null now, and that's okay.
    const floatingOpenBtn = document.getElementById('floating-feedback-btn');
    const closeBtn = document.querySelector('.modal-close-btn');
    const form = document.getElementById('feedback-form');
    const statusDiv = document.getElementById('feedback-status');
    const submitBtn = document.getElementById('feedback-submit-btn');
    const messageTextarea = document.getElementById('feedback-message');

    // --- Modal Handling ---
    const openModal = (e) => {
        e.preventDefault(); // Prevent default link behavior
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        statusDiv.textContent = '';
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
    };

    // --- THE FIX: Check if buttons exist before adding listeners ---
    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }
    if (floatingOpenBtn) {
        floatingOpenBtn.addEventListener('click', openModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }


    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- Main Form Submission Handler (to Web3Forms) ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            statusDiv.textContent = '';

            const formData = new FormData(form);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    statusDiv.textContent = 'Thank you! Your feedback has been sent.';
                    statusDiv.style.color = 'var(--secondary-accent)';
                    setTimeout(closeModal, 3000);
                } else {
                    console.error('Error from server:', result);
                    statusDiv.textContent = 'An error occurred. Please try again.';
                    statusDiv.style.color = 'var(--danger-color)';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Feedback';
                }
            } catch (error) {
                console.error('Submission error:', error);
                statusDiv.textContent = 'A network error occurred. Please check your connection.';
                statusDiv.style.color = 'var(--danger-color)';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Feedback';
            }
        });
    }
});