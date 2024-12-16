class SearchResultsManager {
    constructor() {
        console.log('Initializing SearchResultsManager');
        this.resultsContainer = document.querySelector('.results');
        this.searchInput = document.getElementById('on-page-search-input');
        this.searchButton = document.getElementById('on-page-search-button');
        
        // Log what we found
        console.log('Results container found:', !!this.resultsContainer);
        console.log('Search input found:', !!this.searchInput);
        console.log('Search button found:', !!this.searchButton);

        if (!this.resultsContainer) {
            console.error('Results container not found');
            return;
        }

        this.initializeIP();
        this.setupEventListeners();
        this.handleURLParameters();
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        // Handle on-page search
        if (this.searchButton) {
            this.searchButton.addEventListener('click', this.handleOnPageSearch.bind(this));
            console.log('Search button listener attached');
        }

        // Handle form submission
        const form = this.searchInput?.closest('form');
        if (form) {
            form.addEventListener('submit', this.handleOnPageSearch.bind(this));
            console.log('Form submit listener attached');
        }

        // Handle dynamic elements
        document.addEventListener('click', this.handleDynamicClicks.bind(this));
        console.log('Dynamic clicks listener attached');
    }

    async handleOnPageSearch(e) {
        e.preventDefault();
        console.log('Search triggered');

        if (!this.searchInput) {
            console.error('Search input element not found');
            return;
        }

        const searchQuery = this.searchInput.value;
        console.log('Search query:', searchQuery);

        if (searchQuery?.trim()) {
            await this.performFunnelbackSearch(searchQuery);
        } else {
            console.error('Empty search query');
        }
    }

    async performFunnelbackSearch(searchQuery) {
        const prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        try {
            const url = `${prodUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            console.log('Fetching URL:', url);
            
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            console.log('Response received, length:', html.length);
            
            if (this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="funnelback-search-container">
                        ${html}
                    </div>
                `;
                console.log('Results updated');
            } else {
                console.error('Results container not found when updating');
            }

        } catch (error) {
            console.error('Search error:', error);
            if (this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Error performing search. Please try again.</p>
                    </div>
                `;
            }
        }
    }

    // Handler methods for dynamic elements
    async handleFacetAnchor(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            if (response && this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="funnelback-search-container">
                        ${response}
                    </div>
                `;
            }
        }
    }

    async handleTab(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            if (response && this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="funnelback-search-container">
                        ${response}
                    </div>
                `;
            }
        }
    }

    async handleSearchTools(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            if (response && this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="funnelback-search-container">
                        ${response}
                    </div>
                `;
            }
        }
    }

    async handleClearFacet(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            if (response && this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="funnelback-search-container">
                        ${response}
                    </div>
                `;
            }
        }
    }

    async fetchFunnelbackContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
}

// Initialize with logging
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, creating SearchResultsManager');
    window.searchManager = new SearchResultsManager();
});