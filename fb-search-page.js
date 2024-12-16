// results-search.js
class ResultsSearchManager {
    constructor() {
        if (window.location.pathname.includes('search-test')) {
            this.initializeIP();
            this.setupResultsSearch();
            this.handleURLParameters();
        }
    }

    async initializeIP() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            this.userIp = data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.userIp = '';
        }
    }

    setupResultsSearch() {
        const onPageSearch = document.getElementById("on-page-search-button");
        if (onPageSearch) {
            onPageSearch.addEventListener('click', this.handleResultsSearch);
        }
    }

    async handleURLParameters() {
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
        event.preventDefault();
        const searchQuery = document.getElementById('on-page-search-input').value;
        await this.performFunnelbackSearch(searchQuery);
    }

    async performFunnelbackSearch(searchQuery) {
        console.log("ResultsSearchManager: performFunnelbackSearch");
        const prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        
        try {
            const url = `${prodOnPageSearchUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const text = await response.text();
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">${text}</div>
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