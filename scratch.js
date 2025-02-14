case 'Enter':
    if (activeItem) {
        event.preventDefault();
        const selectedText = activeItem.querySelector('.suggestion-text').textContent;
        const type = activeItem.dataset.type;
        const url = activeItem.dataset.url;

        console.log('Suggestion Keyboard:', {
            type: 'keyboard enter',
            itemType: type,
            text: selectedText,
            url: url || 'none'
        });
        
        this.inputField.value = selectedText;
        this.suggestionsContainer.innerHTML = '';
        this.#updateButtonStates();
        
        // For staff and program items with URLs, open in new tab
        if ((type === 'staff' || type === 'program') && url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // For all other cases, perform search
            console.log('Initiating search request');
            this.#performSearch(selectedText);
        }
    }
    break;