document.addEventListener('DOMContentLoaded', function() {
    console.log('Form intercept script loaded');
    
    function submitKeywords(keywords) {
        console.log('Submitting keywords via form intercept:', keywords);
        
        try {
            // Create form data for webhook submission
            const formData = new FormData();
            formData.append('id-name-T4-form-5019', 'Program Search - Form Submit');
            formData.append('id-keyword-input-T4-form-5019', keywords);
            
            // Submit to webhook
            fetch('https://www.seattleu.edu/testing123/vic/module-factory/directory/keyword-capture/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Form intercept webhook status:', response.status);
                if (response.ok) {
                    console.log('Form intercept SUCCESS:', keywords);
                } else {
                    console.warn('Form intercept FAILED:', response.status);
                }
            })
            .catch(error => {
                console.error('Form intercept ERROR:', error);
            });
            
        } catch (err) {
            console.error('Error in submitKeywords:', err);
        }
    }
    
    // Find the search form and intercept submissions
    const searchInput = document.getElementById('keywords');
    
    if (searchInput) {
        const form = searchInput.closest('form');
        
        if (form) {
            console.log('Search form found, setting up intercept');
            
            // Intercept form submission using capture phase
            form.addEventListener('submit', function(e) {
                const keywords = searchInput.value.trim();
                console.log('FORM SUBMIT intercepted, keywords:', keywords);
                
                if (keywords) {
                    submitKeywords(keywords);
                } else {
                    console.log('Empty search, not submitting');
                }
                
                // Let the original form submission continue normally
                // (don't preventDefault - we want the search to work)
                
            }, true); // Use capture phase to fire before other scripts
            
            // Also intercept Enter key presses in the search field
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    const keywords = this.value.trim();
                    console.log('ENTER KEY intercepted, keywords:', keywords);
                    
                    if (keywords) {
                        // Small delay to ensure the form submission happens
                        setTimeout(function() {
                            submitKeywords(keywords);
                        }, 100);
                    }
                }
            }, true); // Use capture phase
            
        } else {
            console.warn('No parent form found for search input');
        }
        
    } else {
        console.warn('Search input #keywords not found');
    }
});