async #displaySuggestions(suggestions, staffResults, programResults) {
    if (!this.suggestionsContainer) {
        console.warn('Suggestions container not found');
        return;
    }

    console.group('Displaying Suggestions');
    console.log('Suggestion Counts:', {
        general: suggestions.length,
        staff: staffResults.length,
        programs: programResults.length
    });

    const suggestionHTML = `
        <div class="suggestions-list">
            <div class="suggestions-columns">
                <div class="suggestions-column">
                    <div class="column-header">Suggestions</div>
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item" role="option" data-type="suggestion">
                            <span class="suggestion-text">${suggestion.display || ''}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="suggestions-column">
                    <div class="column-header">Faculty & Staff</div>
                    ${staffResults.map(staff => `
                        <div class="suggestion-item staff-item" role="option" data-type="staff" data-url="${staff.url}" title="Click to view profile">
                            <a href="${staff.url}" class="staff-link" ${staff.url && staff.url !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                <div class="staff-suggestion">
                                    ${staff.image ? `
                                        <div class="staff-image">
                                            <img src="${staff.image}" alt="${staff.title}" class="staff-thumbnail" loading="lazy">
                                        </div>
                                    ` : ''}
                                    <div class="staff-info">
                                        <span class="suggestion-text">${staff.title || ''}</span>
                                        ${staff.metadata ? `<span class="staff-role">${staff.metadata}</span>` : ''}
                                        ${staff.department ? `<span class="staff-department suggestion-type">${staff.department}</span>` : ''}
                                    </div>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>

                <div class="suggestions-column">
                    <div class="column-header">Programs</div>
                    ${programResults.map(program => `
                        <div class="suggestion-item program-item" role="option" data-type="program" data-url="${program.url}" title="Click to view program">
                            <a href="${program.url}" class="program-link" ${program.url ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                <div class="program-suggestion">
                                    <span class="suggestion-text">${program.title || ''}</span>
                                    ${program.department ? `<span class="suggestion-type">${program.department}</span>` : ''}
                                    ${program.description ? `
                                        <span class="program-description">${program.description}</span>
                                    ` : ''}
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    this.suggestionsContainer.innerHTML = suggestionHTML;
    this.suggestionsContainer.hidden = false;
    console.log('Suggestions rendered to DOM');

    // Add click handlers for all suggestion items
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item) => {
        item.addEventListener('click', (event) => {
            const selectedText = item.querySelector('.suggestion-text').textContent;
            const type = item.dataset.type;
            const url = item.dataset.url;

            console.log('Suggestion Click:', {
                type: 'mouse click',
                itemType: type,
                text: selectedText,
                url: url || 'none'
            });
        
            this.inputField.value = selectedText;
            this.suggestionsContainer.innerHTML = '';
            this.#updateButtonStates();
            
            // For staff and program items with URLs, let the link handle navigation
            if ((type === 'staff' || type === 'program') && url && event.target.closest('a')) {
                return;
            }
            
            // For all other cases, perform search
            event.preventDefault();
            console.log('Initiating search request');
            this.#performSearch(selectedText);
        });
    });
    
    console.groupEnd();
}