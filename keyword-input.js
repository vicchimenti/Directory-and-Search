document.addEventListener('DOMContentLoaded', function() {
    console.log('Keyword capture script loaded - same page version');
    
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
            // Find the hidden form fields on the same page
            const nameField = document.getElementById('id-name-T4-form-5019');
            const keywordField = document.getElementById('id-keyword-input-T4-form-5019');
            
            if (!nameField || !keywordField) {
                console.warn('Hidden form fields not found on page');
                return;
            }
            
            // Populate the hidden form fields
            nameField.value = 'Program Search';
            keywordField.value = keywords;
            
            console.log('Fields populated with:', keywords);
            
            // Find and click the submit button
            const submitButton = document.querySelector('form .pull-right');
            if (submitButton) {
                submitButton.click();
                console.log('Hidden form submitted successfully');
            } else {
                // Try alternative submit methods
                const hiddenForm = nameField.closest('form');
                if (hiddenForm) {
                    hiddenForm.submit();
                    console.log('Hidden form submitted via form.submit()');
                } else {
                    console.warn('No submit method found');
                }
            }
            
        } catch (err) {
            console.error('Error in autoFillAndSubmit:', err);
        }
    }
    
    // Set up event listeners
    const searchInput = document.getElementById('keywords');
    
    if (searchInput) {
        console.log('Search input found, setting up listeners');
        
        let timeout;
        
        // Capture after user stops typing for 1 second
        searchInput.addEventListener('input', function() {
            console.log('Input detected:', this.value);
            clearTimeout(timeout);
            timeout = setTimeout(autoFillAndSubmit, 1000);
        });
        
        // Capture when user clicks away from search field
        searchInput.addEventListener('blur', function() {
            console.log('Blur event triggered');
            autoFillAndSubmit();
        });
        
        // Capture when main search form is submitted
        const mainForm = searchInput.closest('form');
        if (mainForm) {
            console.log('Main form found, adding submit listener');
            mainForm.addEventListener('submit', function() {
                console.log('Form submit triggered');
                autoFillAndSubmit();
            });
        }
        
    } else {
        console.warn('Search input #keywords not found');
    }
});