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
        <div class="suggestions-list grid grid-cols-3 gap-4 w-full p-4" role="listbox">
            <div class="suggestions-column border-r border-gray-200 pr-4">
                <div class="column-header font-semibold text-lg mb-3">Suggestions</div>
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item hover:bg-gray-100 p-2 rounded cursor-pointer" role="option" data-type="suggestion">
                        <span class="suggestion-text">${suggestion.display || ''}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="suggestions-column border-r border-gray-200 px-4">
                <div class="column-header font-semibold text-lg mb-3">Faculty & Staff</div>
                ${staffResults.map(staff => `
                    <div class="suggestion-item hover:bg-gray-100 p-2 rounded cursor-pointer" role="option" data-type="staff" data-url="${staff.url || ''}">
                        <div class="staff-suggestion flex items-start gap-3">
                            ${staff.image ? `
                                <div class="staff-image w-12 h-12 flex-shrink-0">
                                    <img src="${staff.image}" alt="${staff.title}" class="staff-thumbnail rounded-full w-full h-full object-cover">
                                </div>
                            ` : ''}
                            <div class="staff-info flex-grow">
                                <span class="suggestion-text font-medium block">${staff.title || ''}</span>
                                <span class="staff-role text-sm text-gray-600 block">${staff.metadata || staff.role || ''}</span>
                                ${staff.department ? `<span class="staff-department text-sm text-gray-500 block">${staff.department}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="suggestions-column pl-4">
                <div class="column-header font-semibold text-lg mb-3">Programs</div>
                ${programResults.map(program => `
                    <div class="suggestion-item hover:bg-gray-100 p-2 rounded cursor-pointer" role="option" data-type="program" data-url="${program.url || ''}">
                        <div class="program-suggestion">
                            <span class="suggestion-text font-medium block">${program.title || ''}</span>
                            ${program.department ? `<span class="program-department text-sm text-gray-600 block">${program.department}</span>` : ''}
                            ${program.description ? `
                                <span class="program-description text-sm text-gray-500 mt-1 block">${program.description}</span>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
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
            
            // Always perform the search first
            console.log('Initiating proxy search request');
            this.#performSearch(selectedText);
            
            // If there's a URL, open it in a new tab as a fallback
            if (url) {
                console.log('Opening direct URL as fallback');
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });
    });
}