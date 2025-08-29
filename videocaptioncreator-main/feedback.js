document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const modal = document.getElementById('feedback-modal');
    const openBtn = document.getElementById('feedback-btn');
    const closeBtn = document.querySelector('.modal-close-btn');
    const form = document.getElementById('feedback-form');
    const statusDiv = document.getElementById('feedback-status');
    const submitBtn = document.getElementById('feedback-submit-btn');
    
    // Elements for the file upload functionality
    const attachmentInput = document.getElementById('attachment-input');
    const uploadStatusDiv = document.getElementById('upload-status');
    const messageTextarea = document.getElementById('feedback-message'); 

    // --- Modal Handling ---
    const openModal = () => {
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        statusDiv.textContent = '';
        if(uploadStatusDiv) {
           uploadStatusDiv.textContent = ''; 
        }
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- File Upload Handler (via Python Backend) ---
    if (attachmentInput) {
        attachmentInput.addEventListener('change', async () => {
            if (attachmentInput.files.length === 0) {
                return;
            }

            const file = attachmentInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            uploadStatusDiv.textContent = 'Uploading file...';
            uploadStatusDiv.style.color = 'inherit';

            try {
                // =================================================================
                // IMPORTANT: REPLACE THIS URL WITH YOUR LIVE RENDER BACKEND URL
                const backendUrl = 'https://videocaptioncreator-feedback-api.onrender.com/upload'; 
                // =================================================================

                const response = await fetch(backendUrl, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    const fileLink = result.link;
                    messageTextarea.value += `\n\nAttachment: ${fileLink}`;
                    uploadStatusDiv.textContent = '✅ File uploaded and link added!';
                    uploadStatusDiv.style.color = 'var(--secondary-accent)';
                } else {
                    console.error('API Error:', result.error);
                    uploadStatusDiv.textContent = '❌ File upload failed. Please try again.';
                    uploadStatusDiv.style.color = 'var(--danger-color)';
                }
            } catch (error) {
                console.error('Upload network error:', error);
                uploadStatusDiv.textContent = '❌ Could not connect to the upload server.';
                uploadStatusDiv.style.color = 'var(--danger-color)';
            }
        });
    }


    // --- Main Form Submission Handler (to Web3Forms) ---
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
});
