/**
 * @fileoverview Results Search Manager for Funnelback Search Integration
 * 
 * Manages search functionality on results pages, handling both URL parameter-based 
 * and user-initiated searches. Integrates with Funnelback search services via proxy
 * and manages dynamic result display using DOM observation.
 * 
 * Features:
 * - Handles URL parameter searches from HeaderSearchManager redirects
 * - Manages search input and button interactions
 * - Integrates with Funnelback API via Vercel proxy
 * - Observes DOM for dynamic search button updates
 * - Displays search results dynamically
 * 
 * Dependencies:
 * - DOMObserverManager for DOM mutation handling
 * - Vercel proxy endpoint for Funnelback API access
 * - DOM elements with specific IDs:
 *   - 'on-page-search-button': Search button
 *   - 'on-page-search-input': Search input field
 *   - 'results': Results container
 * 
 * Related Files:
 * - dom-observer-manager.js: Handles DOM observation
 * - header-search-manager.js: Handles initial search redirects
 * 
 * @author Victor Chimenti
 * @version 1.3.3
 * @lastModified 2025-02-05
 */

import DOMObserverManager from './dom-observer-manager.js';
class ResultsSearchManager {
    
    /** @private {DOMObserverManager} Instance of DOM observer for managing search button changes */
    #observer;

    /**
     * Initializes the Results Search Manager with observer and event listeners.
     * Sets up page functionality if on search test page.
     * 
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor() {
        if (window.location.pathname.includes('search-test')) {
            this.#setupObserver();
            this.#setupResultsSearch();
            this.handleURLParameters();
        }
    }

    /**
     * Sets up DOM observer for search button changes.
     * Initializes observer with button target and node handling callback.
     * @private
     */
    #setupObserver() {
        this.#observer = new DOMObserverManager({
            targets: '#on-page-search-button',
            callback: this.#handleAddedNodes.bind(this),
            subtree: true
        });
    }

    /**
     * Handles nodes added to observed DOM elements.
     * Attaches click listeners to any new search buttons.
     * @private
     * @param {NodeList} nodes - Newly added DOM nodes
     */
    #handleAddedNodes(nodes) {
        nodes.forEach(node => {
            if (node?.nodeType === Node.ELEMENT_NODE) {
                const searchButton = node.querySelector('#on-page-search-button');
                if (searchButton) {
                    searchButton.addEventListener('click', this.#handleResultsSearch);
                }
            }
        });
    }

    /**
     * Sets up the event listener for the search button on the results page.
     * 
     * @private
     * @throws {Error} If search button element is not found (error will be caught internally)
     */
    #setupResultsSearch() {
        const onPageSearch = document.getElementById("on-page-search-button");
        if (onPageSearch) {
            onPageSearch.addEventListener('click', this.#handleResultsSearch);
        }
    }

    /**
     * Handles search parameters from the URL.
     * If a query parameter exists, it populates the search field and performs the search.
     * This method is public as it's part of the class's public API and may be called
     * from other parts of the application.
     * 
     * @public
     * @returns {Promise<void>}
     */
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

    /**
     * Event handler for search button clicks on the results page.
     * Prevents default form submission and initiates the search process.
     * 
     * @private
     * @param {Event} event - The click event object
     * @returns {Promise<void>}
     */
    #handleResultsSearch = async(event) => {
        console.log("handleResultsSearch");

        event.preventDefault();
        const searchInput = document.getElementById('on-page-search-input');
        if (!searchInput) {
            console.error('Search input field not found');
            return;
        }

        const searchQuery = searchInput.value;
        if (!searchQuery?.trim()) {
            alert('Please enter a search term');
            return;
        }

        await this.performFunnelbackSearch(searchQuery);
    }

    /**
     * Performs a search using the Funnelback API via proxy server.
     * Constructs the search request with required parameters and handles
     * the response display. This method is public as it's part of the
     * class's public API and may be called from other parts of the application.
     * 
     * @public
     * @param {string} searchQuery - The search query to perform
     * @returns {Promise<void>}
     * @throws {Error} If the search request fails or response handling fails
     */
    async performFunnelbackSearch(searchQuery) {
        console.log("performFunnelbackSearch");
    
        const proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback';
        
        try {
            const searchParams = new URLSearchParams({
                query: searchQuery,
                collection: 'seattleu~sp-search',
                profile: '_default',
                form: 'partial'
            });
    
            const url = `${proxyUrl}?${searchParams.toString()}`;
            console.log('Request URL:', url);
    
            const response = await fetch(url);
            console.log('Proxy Response Status:', response.status);
            console.log('Proxy Response OK:', response.ok);
            
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const text = await response.text();
            const resultsContainer = document.getElementById('results');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div id="funnelback-search-container-response" class="funnelback-search-container">
                        ${text}
                    </div>
                `;
            } else {
                console.error('Results container not found');
            }
        } catch (error) {
            console.error('Search error:', error);
            const resultsContainer = document.getElementById('results');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Sorry, we couldn't complete your search. ${error.message}</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Destroys the Results Search Manager instance.
     * Removes event listeners and destroys the DOM observer.
     * 
     * @public
     */
    destroy() {
        this.#observer?.destroy();
        document.getElementById("on-page-search-button")?.removeEventListener('click', this.#handleResultsSearch);
    }
}

// Initialize results search singleton instance
export default new ResultsSearchManager();