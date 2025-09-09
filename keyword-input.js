// Program Finder Keyword Capture Script for Terminalfour
// This script captures search keywords and stores them in a hidden form field

(function() {
    'use strict';
    
    // Configuration - Update these selectors to match your actual form elements
    const CONFIG = {
        searchInputSelector: 'input[placeholder*="Search All Programs"]', // Main search input
        hiddenInputSelector: 'input[name="captured_keywords"]', // Hidden form field
        formSelector: 'form', // Parent form containing the hidden input
        debounceDelay: 500 // Delay in ms before capturing (to avoid capturing every keystroke)
    };
    
    // Debounce function to limit how often we capture keywords
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Function to capture and store keywords
    function captureKeywords() {
        const searchInput = document.querySelector(CONFIG.searchInputSelector);
        const hiddenInput = document.querySelector(CONFIG.hiddenInputSelector);
        
        if (!searchInput || !hiddenInput) {
            console.warn('Program Finder: Search input or hidden field not found');
            return;
        }
        
        const keywords = searchInput.value.trim();
        
        if (keywords) {
            // Store the current search terms
            hiddenInput.value = keywords;
            
            // Optional: Add timestamp for analytics
            const timestampField = document.querySelector('input[name="search_timestamp"]');
            if (timestampField) {
                timestampField.value = new Date().toISOString();
            }
            
            console.log('Keywords captured:', keywords);
        }
    }
    
    // Function to initialize the keyword capture
    function initKeywordCapture() {
        const searchInput = document.querySelector(CONFIG.searchInputSelector);
        
        if (!searchInput) {
            console.warn('Program Finder: Search input not found, retrying in 1 second...');
            setTimeout(initKeywordCapture, 1000);
            return;
        }
        
        // Create debounced version of capture function
        const debouncedCapture = debounce(captureKeywords, CONFIG.debounceDelay);
        
        // Capture keywords on various events
        searchInput.addEventListener('input', debouncedCapture);
        searchInput.addEventListener('change', captureKeywords);
        searchInput.addEventListener('blur', captureKeywords);
        
        // Also capture when form is submitted
        const form = searchInput.closest('form') || document.querySelector(CONFIG.formSelector);
        if (form) {
            form.addEventListener('submit', function(e) {
                captureKeywords(); // Immediate capture on submit
            });
        }
        
        console.log('Program Finder: Keyword capture initialized');
    }
    
    // Function to create hidden inputs if they don't exist
    function ensureHiddenInputs() {
        const form = document.querySelector(CONFIG.formSelector);
        if (!form) return;
        
        // Create main keywords field if it doesn't exist
        if (!document.querySelector(CONFIG.hiddenInputSelector)) {
            const keywordInput = document.createElement('input');
            keywordInput.type = 'hidden';
            keywordInput.name = 'captured_keywords';
            keywordInput.value = '';
            form.appendChild(keywordInput);
        }
        
        // Optional: Create timestamp field
        if (!document.querySelector('input[name="search_timestamp"]')) {
            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'search_timestamp';
            timestampInput.value = '';
            form.appendChild(timestampInput);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ensureHiddenInputs();
            initKeywordCapture();
        });
    } else {
        ensureHiddenInputs();
        initKeywordCapture();
    }
    
    // Also handle dynamic content loading (if your site uses AJAX)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if search input was added
                const hasSearchInput = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && 
                    (node.matches && node.matches(CONFIG.searchInputSelector) || 
                     node.querySelector && node.querySelector(CONFIG.searchInputSelector))
                );
                
                if (hasSearchInput) {
                    setTimeout(() => {
                        ensureHiddenInputs();
                        initKeywordCapture();
                    }, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();