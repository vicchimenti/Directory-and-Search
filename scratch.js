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
        const searchResults = tempContainer.querySelector('#search-results');
        const staffResults = Array.from(searchResults?.querySelectorAll('li[data-fb-result]') || [])
            .map(resultItem => {
                const anchor = resultItem.querySelector('a[href]');
                const titleText = anchor?.getAttribute('title') || anchor?.textContent || '';
                const namePart = titleText.split('|')[0].trim();

                return {
                    title: namePart,
                    metadata: 'Faculty/Staff',
                    department: ''
                };
            })
            .slice(0, this.config.staffLimit);
            
        console.log('Processed Staff Results:', staffResults);

        // For now, return empty array for programs until we handle those
        const programResults = [];

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