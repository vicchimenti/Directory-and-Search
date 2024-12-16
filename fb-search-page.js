class SearchResultsManager {
    constructor() {
        this.initializeIP();
        this.setupEventListeners();
        this.handleURLParameters();
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

    setupEventListeners() {
        // Handle on-page search
        const onPageSearch = document.getElementById("on-page-search-button");
        if (onPageSearch) {
            onPageSearch.addEventListener('click', this.handleOnPageSearch.bind(this));
        }

        // Handle dynamic elements using event delegation
        document.addEventListener('click', this.handleDynamicClicks.bind(this));
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

    handleDynamicClicks = async(e) => {
        const handlers = {
            '.facet-group__list a': this.handleFacetAnchor.bind(this),
            '.tab-list__nav a': this.handleTab.bind(this),
            '.search-tools__button-group a': this.handleSearchTools.bind(this),
            'a.facet-group__clear': this.handleClearFacet.bind(this)
        };

        for (const [selector, handler] of Object.entries(handlers)) {
            const matchedElement = e.target.closest(selector);
            if (matchedElement) {
                e.preventDefault();
                await handler(e, matchedElement);
                break;
            }
        }
    }

    async handleOnPageSearch(e) {
        e.preventDefault();
        const searchQuery = document.getElementById('on-page-search-input').value;
        await this.performFunnelbackSearch(searchQuery);
    }

    async performFunnelbackSearch(searchQuery) {
        const prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        try {
            const url = `${prodUrl}?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
            const response = await this.fetchFunnelbackContent(url);
            this.updateResults(response);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Error performing search');
        }
    }

    async fetchFunnelbackContent(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.text();
    }

    updateResults(html) {
        document.querySelector('.funnelback-search__body').innerHTML = html;
    }

    showError(message) {
        document.querySelector('.funnelback-search__body').innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }

    // Handler methods for dynamic elements
    async handleFacetAnchor(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            this.updateResults(response);
        }
    }

    async handleTab(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            this.updateResults(response);
        }
    }

    async handleSearchTools(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            this.updateResults(response);
        }
    }

    async handleClearFacet(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackContent(href);
            this.updateResults(response);
        }
    }
}

// Initialize the manager
document.addEventListener('DOMContentLoaded', () => {
    const searchManager = new SearchResultsManager();
});