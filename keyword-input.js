document.addEventListener('DOMContentLoaded', function() {
    console.log('Keyword capture script loaded');
    
    function getKeywords() {
        const searchInput = document.getElementById('keywords');
        return searchInput ? searchInput.value.trim() : '';
    }
    
    function autoFillAndSubmit() {
        const keywords = getKeywords();
        console.log('Attempting to capture keywords:', keywords);
        
        if (!keywords) {
            console.log('No keywords to capture');
            return;
        }
        
        try {
            // Populate the hidden form fields
            const nameField = document.getElementById('id-name-T4-form-5019');
            const keywordField = document.getElementById('id-keyword-input-T4-form-5019');
            
            if (!nameField || !keywordField) {
                console.warn('Hidden form fields not found');
                return;
            }
            
            nameField.value = 'Program Search';
            keywordField.value = keywords;
            
            console.log('Fields populated with:', keywords);
            
            // Find and submit the form
            const submitButton = document.querySelector('#t4-form-5019 .pull-right');
            if (submitButton) {
                submitButton.click();
                console.log('Form submitted successfully');
            } else {
                console.warn('Submit button not found');
            }
            
        } catch (err) {
            console.error('Error in autoFillAndSubmit:', err);
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
            timeout = setTimeout(autoFillAndSubmit, 1000);
        });
        
        // Capture when user clicks away from search field
        searchInput.addEventListener('blur', autoFillAndSubmit);
        
        // Capture when main search form is submitted
        const mainForm = searchInput.closest('form');
        if (mainForm) {
            mainForm.addEventListener('submit', autoFillAndSubmit);
        }
        
    } else {
        console.warn('Search input #keywords not found');
    }
});