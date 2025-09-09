document.addEventListener('DOMContentLoaded', function() {
    console.log('Keyword capture script loaded');
    
    function getKeywords() {
        const searchInput = document.getElementById('keywords');
        return searchInput ? searchInput.value.trim() : '';
    }
    
    function submitToWebhook() {
        const keywords = getKeywords();
        console.log('Attempting to capture keywords:', keywords);
        
        if (!keywords) {
            console.log('No keywords to capture');
            return;
        }
        
        try {
            // Create form data to match your T4 form fields
            const formData = new FormData();
            formData.append('id-name-T4-form-5019', 'Program Search');
            formData.append('id-keyword-input-T4-form-5019', keywords);
            
            console.log('Sending to webhook:', keywords);
            
            // Send directly to your webhook
            fetch('https://www.seattleu.edu/testing123/vic/module-factory/directory/keyword-capture/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Webhook response status:', response.status);
                if (response.ok) {
                    console.log('Keywords successfully submitted to webhook:', keywords);
                } else {
                    console.warn('Webhook submission failed with status:', response.status);
                }
                return response.text();
            })
            .then(data => {
                console.log('Webhook response:', data);
            })
            .catch(error => {
                console.error('Webhook submission error:', error);
            });
            
        } catch (err) {
            console.error('Error in submitToWebhook:', err);
        }
    }
    
    // Set up event listeners for keyword capture
    const searchInput = document.getElementById('keywords');
    
    if (searchInput) {
        console.log('Search input found, setting up listeners');
        
        let timeout;
        
        // Capture after user stops typing for 1 second
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(submitToWebhook, 1000);
        });
        
        // Capture when user clicks away from search field
        searchInput.addEventListener('blur', submitToWebhook);
        
        // Capture when main search form is submitted
        const mainForm = searchInput.closest('form');
        if (mainForm) {
            mainForm.addEventListener('submit', submitToWebhook);
        }
        
    } else {
        console.warn('Search input #keywords not found');
    }
});