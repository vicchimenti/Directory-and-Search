class ResultsSearchManager {
    constructor() {
        this.userIp = null;
        if (window.location.pathname.includes('search-test')) {
            this.initializeIP().then(() => {
                this.setupResultsSearch();
                this.handleURLParameters();
            });
        }
    }

    async initializeIP() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            this.userIp = data.ip;
            console.log("userip: " + this.userIp);
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.userIp = '';
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

        const prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        
        try {
            const url = `${prodOnPageSearchUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            
            // Add Funnelback-specific headers and standard request headers
            const headers = {
                'X-Forwarded-For': this.userIp || '',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Origin': 'https://www.seattleu.edu',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch(url, {
                headers: headers
            });

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