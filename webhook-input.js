document.addEventListener('DOMContentLoaded', function() {
    console.log('Keyword capture script loaded');
    
    function getKeywords() {
        const searchInput = document.getElementById('keywords');
        const value = searchInput ? searchInput.value.trim() : '';
        console.log('getKeywords() returning:', value);
        return value;
    }
    
    function submitToWebhook() {
        console.log('submitToWebhook() called');
        
        const keywords = getKeywords();
        console.log('Keywords captured:', keywords);
        
        if (!keywords) {
            console.log('No keywords to submit, exiting');
            return;
        }
        
        try {
            console.log('Creating FormData...');
            const formData = new FormData();
            formData.append('id-name-T4-form-5019', 'Program Search');
            formData.append('id-keyword-input-T4-form-5019', keywords);
            
            console.log('FormData created, sending to webhook...');
            
            fetch('https://www.seattleu.edu/testing123/vic/module-factory/directory/keyword-capture/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Webhook response received, status:', response.status);
                if (response.ok) {
                    console.log('SUCCESS: Keywords submitted:', keywords);
                } else {
                    console.warn('WARNING: Webhook failed with status:', response.status);
                }
                return response.text();
            })
            .then(data => {
                console.log('Webhook response data received');
            })
            .catch(error => {
                console.error('ERROR in fetch:', error);
            });
            
        } catch (err) {
            console.error('ERROR in submitToWebhook:', err);
        }
    }
    
    const searchInput = document.getElementById('keywords');
    
    if (searchInput) {
        console.log('Search input found, setting up event listeners');
        
        let timeout;
        
        searchInput.addEventListener('input', function() {
            console.log('INPUT event triggered, current value:', this.value);
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                console.log('Timeout fired, calling submitToWebhook');
                submitToWebhook();
            }, 1000);
        });
        
        searchInput.addEventListener('blur', function() {
            console.log('BLUR event triggered');
            submitToWebhook();
        });
        
        const mainForm = searchInput.closest('form');
        if (mainForm) {
            console.log('Main form found, adding submit listener');
            mainForm.addEventListener('submit', function() {
                console.log('FORM SUBMIT event triggered');
                submitToWebhook();
            });
        } else {
            console.log('No main form found around search input');
        }
        
    } else {
        console.error('ERROR: Search input #keywords not found');
    }
});