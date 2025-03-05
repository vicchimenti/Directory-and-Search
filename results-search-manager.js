/**
 * @fileoverview Enhanced Results Search Manager with Analytics Integration
 * 
 * This class manages the search results page functionality, handling both
 * URL parameter-based searches and user-initiated searches. It integrates with
 * Funnelback search services via a proxy server and manages the display of search results.
 * 
 * Added analytics features:
 * - Tracks original search queries
 * - Tracks clicked search results
 * - Sends analytics data to proxy server
 * - Maintains session data for query attribution
 * 
 * @author Victor Chimenti
 * @version 3.1.1
 * @lastModified 2025-03-05
 */

class ResultsSearchManager {
    /**
     * Initializes the Results Search Manager with analytics capabilities.
     * Sets up event listeners and handles URL parameters if on search test page.
     * 
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor() {
        // Analytics state
        this.originalQuery = null;
        this.sessionId = this.#getOrCreateSessionId();
        this.analyticsEnabled = true;
        this.proxyBaseUrl = 'https://funnelback-proxy-one.vercel.app/';
        this.analyticsEndpoint = `${this.proxyBaseUrl}/analytics`;
        
        // Initialize search functionality
        if (window.location.pathname.includes('search-test')) {
            console.log('Initializing ResultsSearchManager with analytics');
            this.#setupResultsSearch();
            this.handleURLParameters(); // Public as it's part of the API
            this.#setupResultClickTracking();
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
            // Remove any classes that might hide the icon
            onPageSearch.classList.remove('empty-query');
            
            // Add a visibility class
            onPageSearch.classList.add('icon-visible');
            
            // Add visibility classes to the icon if it exists
            const searchIcon = onPageSearch.querySelector('svg');
            if (searchIcon) {
                searchIcon.classList.remove('hidden');
                searchIcon.classList.add('visible');
            }
            
            // Then add the event listener
            onPageSearch.addEventListener('click', this.#handleResultsSearch);
        } else {
            console.warn('Search button not found in DOM');
        }
    }

    /**
     * Sets up click tracking for search results.
     * Uses event delegation to capture clicks on result links.
     * 
     * @private
     */
    #setupResultClickTracking() {
        console.log('Setting up result click tracking');
        
        // Use event delegation to avoid adding many event listeners
        document.addEventListener('click', this.#handleResultClick);
    }
    
    /**
     * Handles clicks on search result links.
     * Captures click data and sends to analytics endpoint.
     * 
     * @private
     * @param {MouseEvent} event - The click event
     */
    #handleResultClick = (event) => {
        // Check if analytics is enabled
        if (!this.analyticsEnabled || !this.originalQuery) return;
        
        // Only process clicks in the results container
        const resultsContainer = document.getElementById('results');
        if (!resultsContainer || !resultsContainer.contains(event.target)) return;
        
        // Find the closest link element
        const link = event.target.closest('a');
        if (!link || !link.href) return;
        
        // Don't track navigation controls, only actual results
        if (link.classList.contains('pagination-link') || 
            link.classList.contains('sort-option') ||
            link.closest('.pagination') ||
            link.closest('.sort-controls')) {
            return;
        }
        
        console.log(`Result link clicked: ${link.href}`);
        
        // Determine the result position (1-based index)
        let position = -1;
        const resultItem = link.closest('.search-result-item, .fb-result');
        if (resultItem) {
            const allResults = Array.from(
                document.querySelectorAll('.search-result-item, .fb-result')
            );
            position = allResults.indexOf(resultItem) + 1;
        }
        
        // Prepare click data
        const clickData = {
            originalQuery: this.originalQuery,
            clickedUrl: link.href,
            clickedTitle: link.innerText.trim() || link.title || link.href,
            clickPosition: position,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };
        
        console.log('Sending click data:', clickData);
        
        // Send click data without blocking navigation
        this.#sendClickData(clickData);
        
        // Allow the normal navigation to continue
    }
    
    /**
     * Sends click data to the analytics endpoint.
     * Uses sendBeacon for non-blocking operation or falls back to fetch with keepalive.
     * 
     * @private
     * @param {Object} clickData - Data about the clicked result
     * @returns {boolean} Whether the data was successfully queued for sending
     */
    #sendClickData(clickData) {
        const endpoint = `${this.analyticsEndpoint}/click`;
        
        try {
            // Use sendBeacon if available (works during page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(clickData)], {
                    type: 'application/json'
                });
                
                return navigator.sendBeacon(endpoint, blob);
            }
            
            // Fallback to fetch with keepalive
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clickData),
                keepalive: true // This allows the request to outlive the page
            }).catch(error => {
                console.error('Error sending click data:', error);
            });
            
            return true;
        } catch (error) {
            console.error('Failed to send click data:', error);
            return false;
        }
    }
    
    /**
     * Gets or creates a session ID for analytics tracking.
     * Stores the ID in sessionStorage for persistence across page loads.
     * 
     * @private
     * @returns {string} A unique session ID
     */
    #getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('searchSessionId');
        
        if (!sessionId) {
            // Create a new session ID with timestamp and random string
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('searchSessionId', sessionId);
        }
        
        return sessionId;
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
            // Store original query for analytics
            this.originalQuery = urlSearchQuery;
            
            const searchInputField = document.getElementById('autocomplete-concierge-inputField');
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
        const searchInput = document.getElementById('autocomplete-concierge-inputField');
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
        
        // Store original query for analytics tracking
        this.originalQuery = searchQuery;
    
        const proxyUrl = `${this.proxyBaseUrl}/funnelback/search`;
        
        try {
            const searchParams = new URLSearchParams({
                query: searchQuery,
                collection: 'seattleu~sp-search',
                profile: '_default',
                form: 'partial',
                // Add session ID for analytics
                sessionId: this.sessionId
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
                
                // Extract result count for analytics
                this.#extractAndSendResultCount(text);
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
     * Extracts result count from HTML and sends supplementary analytics
     * 
     * @private
     * @param {string} html - The HTML response from Funnelback
     */
    #extractAndSendResultCount(html) {
        try {
            // Extract result count using regex pattern
            const match = html.match(/totalMatching">([0-9,]+)</);
            if (match && match[1]) {
                const resultCount = parseInt(match[1].replace(/,/g, ''), 10);
                console.log(`Found ${resultCount} results`);
                
                // Send supplementary analytics data
                this.#sendSupplementaryAnalytics({
                    resultCount: resultCount
                });
            }
        } catch (error) {
            console.error('Error extracting result count:', error);
        }
    }
    
    /**
     * Sends supplementary analytics data for the current query
     * 
     * @private
     * @param {Object} data - Additional data to send
     */
    #sendSupplementaryAnalytics(data) {
        if (!this.analyticsEnabled || !this.originalQuery) return;
        
        const supplementaryData = {
            query: this.originalQuery,
            sessionId: this.sessionId,
            ...data
        };
        
        try {
            fetch(`${this.analyticsEndpoint}/supplement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplementaryData)
            }).catch(error => {
                console.error('Error sending supplementary analytics:', error);
            });
        } catch (error) {
            console.error('Failed to send supplementary analytics:', error);
        }
    }
}

// Initialize results search singleton instance
const resultsSearch = new ResultsSearchManager();
export default resultsSearch;