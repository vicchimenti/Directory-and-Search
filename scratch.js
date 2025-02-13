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

        // Parse responses
        const suggestions = suggestResponse.ok ? await suggestResponse.json() : [];
        const peopleData = peopleResponse.ok ? await peopleResponse.text() : '';
        const programData = programResponse.ok ? await programResponse.text() : '';

        // Log raw HTML responses before parsing
        console.group('Raw HTML Responses');
        console.log('People HTML Response:', peopleData);
        console.log('Program HTML Response:', programData);
        console.groupEnd();

        // Create a temporary container to parse the HTML responses
        const tempContainer = document.createElement('div');
        
        // Parse people results
        tempContainer.innerHTML = peopleData;
        console.log('People DOM Structure:', {
            container: tempContainer.innerHTML.substring(0, 500),
            resultItems: tempContainer.querySelectorAll('.result-item').length,
            resultTitles: tempContainer.querySelectorAll('.result-title').length,
            resultMetadata: tempContainer.querySelectorAll('.result-metadata').length
        });

        const staffResults = Array.from(tempContainer.querySelectorAll('.result-item')).map(resultItem => {
            const result = {
                title: resultItem.querySelector('.result-title')?.textContent?.trim() || '',
                metadata: resultItem.querySelector('.result-metadata')?.textContent?.trim() || '',
                department: resultItem.querySelector('.result-department')?.textContent?.trim() || ''
            };
            console.log('Processed Staff Item:', result);
            return result;
        }).slice(0, this.config.staffLimit);

        // Parse program results
        tempContainer.innerHTML = programData;
        console.log('Program DOM Structure:', {
            container: tempContainer.innerHTML.substring(0, 500),
            resultItems: tempContainer.querySelectorAll('.result-item').length,
            resultTitles: tempContainer.querySelectorAll('.result-title').length,
            resultDescriptions: tempContainer.querySelectorAll('.result-description').length
        });

        const programResults = Array.from(tempContainer.querySelectorAll('.result-item')).map(resultItem => {
            const result = {
                title: resultItem.querySelector('.result-title')?.textContent?.trim() || '',
                description: resultItem.querySelector('.result-description')?.textContent?.trim() || '',
                department: resultItem.querySelector('.result-department')?.textContent?.trim() || ''
            };
            console.log('Processed Program Item:', result);
            return result;
        }).slice(0, this.config.programLimit);

        console.log('Processed Results:', {
            suggestions: suggestions.length,
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