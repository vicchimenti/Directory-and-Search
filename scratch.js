class AutocompleteSearchManager {
    // ... other class methods ...

    /**
     * Helper function to clean text of HTML tags and extra whitespace
     * @private
     */
    #cleanTextContent(text) {
        const temp = document.createElement('div');
        temp.innerHTML = text;
        return temp.textContent.trim();
    }

    /**
     * Extracts clean title from pipe-separated string
     * @private
     */
    #extractCleanTitle(titleText) {
        // First clean any HTML tags from the entire text
        const cleanText = this.#cleanTextContent(titleText);
        // Then split by pipe and take first part
        const firstPart = cleanText.split('|')[0];
        return firstPart.trim();
    }

    /**
     * Fetches and processes suggestions from all sources
     * @private
     */
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

            // Fetch all results concurrently
            const [suggestResponse, peopleResponse, programResponse] = await Promise.all([
                fetch(`${this.config.endpoints.suggest}?${generalParams}`),
                fetch(`${this.config.endpoints.suggestPeople}?${peopleParams}`),
                fetch(`${this.config.endpoints.suggestPrograms}?${programParams}`)
            ]);

            if (!suggestResponse.ok) console.warn(`Suggest request failed: ${suggestResponse.status}`);
            if (!peopleResponse.ok) console.warn(`People search request failed: ${peopleResponse.status}`);
            if (!programResponse.ok) console.warn(`Program search request failed: ${programResponse.status}`);

            // Parse responses
            const suggestions = suggestResponse.ok ? await suggestResponse.json() : [];
            const peopleData = peopleResponse.ok ? await peopleResponse.text() : '';
            const programData = programResponse.ok ? await programResponse.text() : '';

            const tempContainer = document.createElement('div');
            
            // Parse people results
            tempContainer.innerHTML = peopleData;
            const peopleSearchResults = tempContainer.querySelector('#search-results');
            const staffResults = Array.from(peopleSearchResults?.querySelectorAll('li[data-fb-result]') || [])
                .map(resultItem => {
                    const anchor = resultItem.querySelector('a');
                    if (!anchor) return null;
                    
                    const titleText = anchor.textContent || '';
                    console.log('Processing staff item:', { 
                        originalText: titleText,
                        afterHTMLClean: this.#cleanTextContent(titleText),
                        finalTitle: this.#extractCleanTitle(titleText)
                    });

                    return {
                        title: this.#extractCleanTitle(titleText),
                        metadata: 'Faculty/Staff',
                        department: ''
                    };
                })
                .filter(Boolean)
                .slice(0, this.config.staffLimit);

            // Parse program results
            tempContainer.innerHTML = programData;
            const programSearchResults = tempContainer.querySelector('#search-results');
            const programResults = Array.from(programSearchResults?.querySelectorAll('li[data-fb-result]') || [])
                .map(resultItem => {
                    const anchor = resultItem.querySelector('a');
                    if (!anchor) return null;
                    
                    const titleText = anchor.textContent || '';
                    console.log('Processing program item:', { 
                        originalText: titleText,
                        afterHTMLClean: this.#cleanTextContent(titleText),
                        finalTitle: this.#extractCleanTitle(titleText)
                    });

                    return {
                        title: this.#extractCleanTitle(titleText),
                        metadata: 'Program',
                        department: ''
                    };
                })
                .filter(Boolean)
                .slice(0, this.config.programLimit);

            // Display results
            this.#displaySuggestions(suggestions || [], staffResults, programResults);
        } catch (error) {
            console.error('Fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
        } finally {
            console.timeEnd('fetchSuggestions');
            console.groupEnd();
        }
    }
}