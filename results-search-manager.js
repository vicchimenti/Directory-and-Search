/**
 * @fileoverview Results Search Manager for Funnelback Search Integration
 * 
 * This class manages the search results page functionality, handling both
 * URL parameter-based searches and user-initiated searches. It integrates with
 * Funnelback search services and manages the display of search results.
 * 
 * Features:
 * - Handles URL-based search parameters from HeaderSearchManager redirects
 * - Manages search input and button interactions on results page
 * - Integrates with Funnelback search API including required IP headers
 * - Displays search results dynamically
 * 
 * Dependencies:
 * - Requires IPService for Funnelback headers
 * - Requires DOM elements with specific IDs:
 *   - 'on-page-search-button': The search button
 *   - 'on-page-search-input': The search input field
 *   - 'results': Container for search results
 * 
 * Related Files:
 * - header-search-manager.js: Handles initial search and redirects
 * - ip-service.js: Provides IP address headers for Funnelback
 * 
 * @author Victor Chimenti
 * @version 1.1.7
 * @lastModified 2025-02-03
 */

import ipService from './IPService.js';

class ResultsSearchManager {
    /**
     * Initializes the Results Search Manager.
     * Sets up event listeners and handles URL parameters if on search test page.
     * 
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor() {
        if (window.location.pathname.includes('search-test')) {
            this.#setupResultsSearch();
            this.handleURLParameters(); // Public as it's part of the API
        }
    }

    /**
     * Sets up the event listener for the search button on the results page.
     * 
     * @private
     * @throws {Error} If search button element is not found (error will be caught internally)
     */
    #setupResultsSearch() {
        console.log("setupResultsSearch");
        const onPageSearch = document.getElementById("on-page-search-button");
        if (onPageSearch) {
            onPageSearch.addEventListener('click', this.#handleResultsSearch);
        } else {
            console.warn('Search button not found in DOM');
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
     * Performs the actual search using Funnelback's API.
     * This method is public as it's part of the class's public API and may be called
     * from other parts of the application.
     * 
     * @public
     * @param {string} searchQuery - The search query to perform
     * @returns {Promise<void>}
     * @throws {Error} If the search request fails
     */
    async performFunnelbackSearch(searchQuery) {
        console.log("performFunnelbackSearch");

        // Current Funnelback URL - will be replaced with T4 wrapper endpoint
        const prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
        
        try {
            // Get headers with IP address for Funnelback
            const headers = await ipService.getFunnelbackHeaders();
            console.log('Funnelback Headers:', headers); // Shows the headers object with IP

            // Construct search URL with parameters
            const searchParams = new URLSearchParams({
                query: searchQuery,
                collection: 'seattleu~sp-search',
                profile: '_default',
                form: 'partial'
            });

            const url = `${prodOnPageSearchUrl}?${searchParams.toString()}`;
            console.log('Request URL:', url); // Shows the full URL being requested

            // Log full request details
            console.log('Making Funnelback request with:', {
                url: url,
                headers: headers,
                method: 'GET'
            });

            const response = await fetch(url, {
                headers: headers
            });

            // Log response details
            console.log('Funnelback Response Status:', response.status);
            console.log('Funnelback Response OK:', response.ok);

            // const response = await fetch(url);
            
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
}

// Initialize results search singleton instance
const resultsSearch = new ResultsSearchManager();
export default resultsSearch;