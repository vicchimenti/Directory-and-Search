// Simple keyword capture script for Seattle University program finder
(function() {
    'use strict';
    
    // Wait for the page to load
    function initKeywordCapture() {
        const searchInput = document.getElementById('keywords');
        
        if (!searchInput) {
            console.warn('Search input #keywords not found');
            return;
        }
        
        // Function to capture and submit keywords
        function captureAndSubmit() {
            const keywords = searchInput.value.trim();
            
            if (!keywords) {
                return; // Don't submit empty searches
            }
            
            // Find the hidden form fields
            const nameField = document.getElementById('id-name-T4-form-5019');
            const keywordField = document.getElementById('id-keyword-input-T4-form-5019');
            
            if (!nameField || !keywordField) {
                console.warn('Hidden form fields not found');
                return;
            }
            
            // Populate the hidden fields
            nameField.value = 'Program Search'; // Or whatever identifier you want
            keywordField.value = keywords;
            
            // Find and submit the form
            const hiddenForm = nameField.closest('form');
            if (hiddenForm) {
                hiddenForm.submit();
                console.log('Keywords captured and submitted:', keywords);
            } else {
                console.warn('Hidden form not found');
            }
        }
        
        // Capture keywords when user finishes typing (after they pause)
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(captureAndSubmit, 1000); // Wait 1 second after they stop typing
        });
        
        // Also capture on blur (when they click away from search field)
        searchInput.addEventListener('blur', captureAndSubmit);
        
        // Capture when they submit the main search form
        const mainForm = searchInput.closest('form');
        if (mainForm) {
            mainForm.addEventListener('submit', function() {
                captureAndSubmit();
            });
        }
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKeywordCapture);
    } else {
        initKeywordCapture();
    }
    
})();