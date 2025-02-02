import ipService from './ip-service.js';

class ResultsSearchManager {
    constructor() {
        if (window.location.pathname.includes('search-test')) {
            this.setupResultsSearch();
            this.handleURLParameters();
        }
    }

    setupResultsSearch() {
        console.log("setupResultsSearch");
        const onPageSearch = document.getElementById("on-page-search-button");
        if (onPageSearch) {
            onPageSearch.addEventListener('click', this.handleResultsSearch);
        }
    }

    async handleURLParameters() {
        console.log("handleURLParameters");

        const urlParams = new URLSearchParams(window.location.search);
        const urlSearchQuery = urlParams.get('query');

        if (urlSearchQuery) {
            const searchInputField = document.getElementById('on-page-search-input');
            if (searchInputField) {
                searchInputField.value = urlSearchQuery;
            }
            await this.performFunnelbackSearch(urlSearchQuery);
        }
    }

    handleResultsSearch = async(event) => {
        console.log("handleResultsSearch");

        event.preventDefault();
        const searchQuery = document.getElementById('on-page-search-input').value;
        await this.performFunnelbackSearch(searchQuery);
    }

    async performFunnelbackSearch(searchQuery) {
        console.log("performFunnelbackSearch");

        // Current Funnelback URL - will be replaced with T4 wrapper endpoint
        const prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        
        // Future T4 wrapper endpoint - uncomment when available
        // const wrapperUrl = '/searchwrapper'; // Update with actual T4 API Gateway URL
        
        try {
            // Current URL construction - will be replaced with T4 wrapper
            const url = `${prodOnPageSearchUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            
            // Future T4 wrapper URL construction - uncomment when available
            // const url = `${wrapperUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const text = await response.text();
            document.getElementById('results').innerHTML = `
                <div id="funnelback-search-container-response" class="funnelback-search-container">${text}</div>
            `;
        } catch (error) {
            console.error('Search error:', error);
            document.getElementById('results').innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't complete your search. ${error.message}</p>
                </div>
            `;
        }
    }
}

// Initialize results search
const resultsSearch = new ResultsSearchManager();