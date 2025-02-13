async #fetchSuggestions(query) {
    console.group('Fetch Suggestions');
    console.time('fetchSuggestions');
    
    try {
        // Basic validation
        if (!query || query.length < this.config.minLength) {
            console.log('Query too short, skipping fetch');
            this.suggestionsContainer.innerHTML = '';
            return;
        }

        // Prepare parameters for each request type
        const generalParams = new URLSearchParams({
            partial_query: query,
            collection: this.config.collections.general,
            profile: this.config.profile
        });

        const peopleParams = new URLSearchParams({
            query: query,
            collection: this.config.collections.staff,
            profile: this.config.profile,
            form: 'partial'
        });

        const programParams = new URLSearchParams({
            query: query,
            collection: this.config.collections.programs,
            profile: this.config.profile,
            form: 'partial'
        });

        console.log('Request Parameters:', {
            general: Object.fromEntries(generalParams),
            people: Object.fromEntries(peopleParams),
            program: Object.fromEntries(programParams)
        });

        // Fetch all results concurrently
        const [suggestResponse, peopleResponse, programResponse] = await Promise.all([
            fetch(`${this.config.endpoints.suggest}?${generalParams}`),
            fetch(`${this.config.endpoints.suggestPeople}?${peopleParams}`),
            fetch(`${this.config.endpoints.suggestPrograms}?${programParams}`)
        ]);

        // Add error checking
        if (!suggestResponse.ok) console.warn(`Suggest request failed: ${suggestResponse.status}`);
        if (!peopleResponse.ok) console.warn(`People search request failed: ${peopleResponse.status}`);
        if (!programResponse.ok) console.warn(`Program search request failed: ${programResponse.status}`);

        // Parse JSON response for general suggestions
        const suggestions = suggestResponse.ok ? await suggestResponse.json() : [];
        
        // Parse HTML responses for people and programs
        const peopleData = peopleResponse.ok ? await peopleResponse.text() : '';
        const programData = programResponse.ok ? await programResponse.text() : '';
        
        console.log('Raw Response Data:', {
            suggestions: suggestions || [],
            peopleHtml: peopleData?.length || 0,
            programHtml: programData?.length || 0
        });

        // Create a temporary container to parse the HTML responses
        const tempContainer = document.createElement('div');
        
        // Parse people results
        tempContainer.innerHTML = peopleData;
        const staffResults = Array.from(tempContainer.querySelectorAll('.result-title')).map(result => {
            const resultItem = result.closest('.result-item');
            return {
                title: result.textContent?.trim() || '',
                metadata: resultItem?.querySelector('.metadata')?.textContent?.trim() || '',
                url: resultItem?.querySelector('a')?.href || '',
                image: resultItem?.querySelector('img')?.src || '',
                department: resultItem?.querySelector('.department')?.textContent?.trim() || '',
                role: resultItem?.querySelector('.role')?.textContent?.trim() || ''
            };
        }).slice(0, this.config.staffLimit);

        // Parse program results
        tempContainer.innerHTML = programData;
        const programResults = Array.from(tempContainer.querySelectorAll('.result-title')).map(result => {
            const resultItem = result.closest('.result-item');
            return {
                title: result.textContent?.trim() || '',
                description: resultItem?.querySelector('.description')?.textContent?.trim() || '',
                url: resultItem?.querySelector('a')?.href || '',
                department: resultItem?.querySelector('.department')?.textContent?.trim() || ''
            };
        }).slice(0, this.config.programLimit);

        console.log('Processed Results:', {
            staff: staffResults.length,
            programs: programResults.length
        });

        // Display the results
        this.#displaySuggestions(suggestions || [], staffResults, programResults);
    } catch (error) {
        console.error('Fetch error:', error);
        this.suggestionsContainer.innerHTML = '';
    } finally {
        console.timeEnd('fetchSuggestions');
        console.groupEnd();
    }
}

async #displaySuggestions(suggestions, staffResults, programResults) {
    if (!this.suggestionsContainer) {
        return;
    }

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
                        <div class="suggestion-item staff-item" role="option" data-type="staff">
                            <div class="staff-suggestion">
                                ${staff.image ? `
                                    <div class="staff-image">
                                        <img src="${staff.image}" alt="${staff.title}" class="staff-thumbnail">
                                    </div>
                                ` : ''}
                                <div class="staff-info">
                                    <span class="suggestion-text">${staff.title || ''}</span>
                                    <span class="staff-role">${staff.metadata || staff.role || ''}</span>
                                    ${staff.department ? `<span class="staff-department suggestion-type">${staff.department}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="suggestions-column">
                    <div class="column-header">Programs</div>
                    ${programResults.map(program => `
                        <div class="suggestion-item program-item" role="option" data-type="program">
                            <div class="program-suggestion">
                                <span class="suggestion-text">${program.title || ''}</span>
                                ${program.department ? `<span class="suggestion-type">${program.department}</span>` : ''}
                                ${program.description ? `
                                    <span class="program-description">${program.description}</span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    this.suggestionsContainer.innerHTML = suggestionHTML;
    this.suggestionsContainer.hidden = false;

    // Add click handlers for all suggestion items
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item) => {
        item.addEventListener('click', () => {
            const selectedText = item.querySelector('.suggestion-text').textContent;
            const type = item.dataset.type;

            console.log('Suggestion Click:', {
                type: 'mouse click',
                itemType: type,
                text: selectedText
            });
        
            this.inputField.value = selectedText;
            this.suggestionsContainer.innerHTML = '';
            this.#updateButtonStates();
            
            // Perform the search
            console.log('Initiating search request');
            this.#performSearch(selectedText);
        });
    });
}