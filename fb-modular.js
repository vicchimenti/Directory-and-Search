class DynamicResultsManager {
    constructor() {
        if (window.location.pathname.includes('search-test')) {
            this.initializeIP();
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupDynamicListeners());
            } else {
                this.setupDynamicListeners();
            }
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

    setupDynamicListeners() {
        console.log("DynamicResultsManager: setupDynamicListeners");
        // Use document as the listener since content is dynamic
        document.addEventListener('click', this.handleDynamicClick);
    }

    handleDynamicClick = async(e) => {
        console.log("DynamicResultsManager: handleDynamicClick");
        const handlers = {
            '.facet-group__list a': this.handleFacetAnchor,
            '.tab-list__nav a': this.handleTab,
            '.search-tools__button-group a': this.handleSearchTools,
            'a.facet-group__clear': this.handleClearFacet
        };

        for (const [selector, handler] of Object.entries(handlers)) {
            const matchedElement = e.target.closest(selector);
            if (matchedElement) {
                e.preventDefault();
                await handler.call(this, e, matchedElement);
                break;
            }
        }
    }

    async fetchFunnelbackResults(url, method) {
        console.log("DynamicResultsManager: fetchFunnelbackResults");
        const prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        const passedUrl = (url) ? url : "empty-value";
        console.log("passedUrl: " + passedUrl);
        const requestUrl = prodUrl + passedUrl;

        let options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              // 'X-Forwarded-For': userIp,
            },
        };

        try {
            const response = await fetch(requestUrl, options);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Error with ${method} request:`, error);
            return `<p>Error fetching results. Please try again later.</p>`;
        }
    }


    
    async fetchFunnelbackTools(url, method) {
        console.log("DynamicResultsManager: fetchFunnelbackTools");
        const prodToolUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
        const passedToolUrl = (url) ? url : "empty-value";
        console.log("passedUrl: " + passedToolUrl);
        const requestToolUrl = prodToolUrl + passedToolUrl;

        let options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              // 'X-Forwarded-For': userIp,
            },
        };

        try {
            const response = await fetch(requestToolUrl, options);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Error with ${method} request:`, error);
            return `<p>Error fetching results. Please try again later.</p>`;
        }
    }

    // Handler methods
    async handleFacetAnchor(e, element) {
        const facetAnchor = e.target.closest('.facet-group__list a');
        const facetHref = facetAnchor.getAttribute('href');
        console.log("Relative facetHref:", facetHref);
        const href = element.getAttribute('href');
        console.log("Relative href:", facetHref);
        if (facetHref) {
            const response = await this.fetchFunnelbackResults(facetHref, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">${response}</div>
            `;
        }
    }

    async handleTab(e, element) {
        console.log("DynamicResultsManager: handleTab");
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">${response}</div>
            `;
        }
    }

    async handleSearchTools(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">${response}</div>
            `;
        }
    }

    async handleClearFacet(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">${response}</div>
            `;
        }
    }
}

// Initialize
const dynamicResults = new DynamicResultsManager();
