/**
* @fileoverview Dynamic Results Manager for Funnelback Search Integration
* 
* This class manages dynamic content updates for search results, handling various
* user interactions like facet selection, tab changes, and pagination. It uses
* a MutationObserver to maintain functionality as content updates dynamically.
* 
* Features:
* - Manages dynamic content updates via MutationObserver
* - Handles multiple types of search result interactions
* - Maintains event listeners across dynamic content changes
* - Tracks search result link clicks for analytics
* - Captures data-live-url attributes for accurate destination tracking
* - Integrates with Funnelback search API via Vercel proxy
* 
* Dependencies:
* - Requires DOM element with ID 'results'
* - Requires Vercel proxy endpoint for Funnelback API access
* - Requires various interactive elements with specific classes:
*   - .facet-group__list
*   - .tab-list__nav
*   - .search-tools__button-group
*   - .facet-group__clear
*   - .facet-breadcrumb__link
*   - .pagination__link
*   etc.
* 
* Related Files:
* - results-search-manager.js: Handles main search functionality
* - header-search-manager.js: Handles initial search and redirects
* 
* @author Victor Chimenti
* @version 3.1.1
* @lastModified 2025-03-06
*/

class DynamicResultsManager {
    /**
     * Initializes the Dynamic Results Manager.
     * Sets up mutation observer and event listeners if on search test page.
     */
    constructor() {
        this.observerConfig = {
            childList: true,
            subtree: true
        };
        
        // Analytics configuration
        this.analyticsEndpoint = 'https://funnelback-proxy-one.vercel.app/proxy/analytics/click';
        this.sessionId = this.#getOrCreateSessionId();
        this.originalQuery = null;
        
        if (window.location.pathname.includes('search-test')) {
            this.#initializeObserver();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.#setupDynamicListeners();
                    this.#startObserving();
                    this.#ensureSearchButtonIconVisibility();
                    this.#extractOriginalQuery();
                });
            } else {
                this.#setupDynamicListeners();
                this.#startObserving();
                this.#ensureSearchButtonIconVisibility();
                this.#extractOriginalQuery();
            }
        }
    }

    /**
     * Extracts the original search query from the URL or search input
     * @private
     */
    #extractOriginalQuery() {
        // Try to get query from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlQuery = urlParams.get('query');
        
        if (urlQuery) {
            this.originalQuery = urlQuery;
            return;
        }
        
        // Try to get query from search input field
        const searchInput = document.getElementById('autocomplete-concierge-inputField');
        if (searchInput && searchInput.value) {
            this.originalQuery = searchInput.value;
        }
    }
    
    /**
     * Gets or creates a session ID for analytics tracking
     * @private
     * @returns {string} Session ID
     */
    #getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('searchSessionId');
        
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('searchSessionId', sessionId);
        }
        
        return sessionId;
    }

    /**
     * Ensures search button icon remains visible.
     * Uses only class manipulation for better accessibility.
     * @private
     */
    #ensureSearchButtonIconVisibility() {
        const searchButton = document.getElementById('on-page-search-button');
        if (searchButton) {
            // Remove any classes that might hide the icon
            searchButton.classList.remove('empty-query');
            
            // Add a class to ensure visibility
            searchButton.classList.add('icon-visible');
            
            const searchIcon = searchButton.querySelector('svg');
            if (searchIcon) {
                // Remove any classes that might hide the icon
                searchIcon.classList.remove('hidden');
                
                // Add a class to ensure visibility
                searchIcon.classList.add('visible');
            }
        }
    }

    /**
     * Initializes the MutationObserver to watch for DOM changes.
     * 
     * @private
     */
    #initializeObserver() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Skip mutations that might affect the search button
                if (mutation.target && 
                    (mutation.target.id === 'on-page-search-button' || 
                     mutation.target.closest('#on-page-search-button'))) {
                    return;
                }
                
                if (mutation.type === 'childList') {
                    this.#attachEventListenersToNewContent(mutation.addedNodes);
                }
            });
            
            // After processing mutations, ensure search button icon remains visible
            this.#ensureSearchButtonIconVisibility();
        });
    }
 
    /**
     * Starts observing the results container for changes.
     * 
     * @private
     */
    #startObserving() {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            this.observer.observe(resultsContainer, this.observerConfig);
            console.log('Observer started watching results container');
            
            // Add periodic check for search button visibility
            this.iconCheckInterval = setInterval(() => {
                this.#ensureSearchButtonIconVisibility();
            }, 1000); // Check every second
        } else {
            console.warn('Results container not found, waiting for it to appear');
            this.#waitForResultsContainer();
        }
    }
 
    /**
     * Waits for the results container to appear in the DOM.
     * 
     * @private
     */
    #waitForResultsContainer() {
        const bodyObserver = new MutationObserver((mutations, obs) => {
            const resultsContainer = document.getElementById('results');
            if (resultsContainer) {
                obs.disconnect();
                this.observer.observe(resultsContainer, this.observerConfig);
                console.log('Results container found and observer started');
            }
        });
 
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
 
    /**
     * Attaches event listeners to newly added content.
     * 
     * @private
     * @param {NodeList} nodes - The newly added DOM nodes
     */
    #attachEventListenersToNewContent(nodes) {
        if (!nodes?.length) return;
    
        nodes.forEach(node => {
            if (node?.nodeType === Node.ELEMENT_NODE) {
                // Selectors for interactive elements
                const elements = node.querySelectorAll([
                    '.facet-group__list a',
                    '.tab-list__nav a', 
                    '.search-tools__button-group a',
                    'a.facet-group__clear',
                    '.facet-breadcrumb__link',
                    '.facet-breadcrumb__item',
                    'a.related-links__link',
                    '.query-blending__highlight',
                    '.search-spelling-suggestions__link',
                    'a.pagination__link'
                ].join(', '));
    
                elements.forEach(element => {
                    if (element) {
                        element.removeEventListener('click', this.#handleDynamicClick);
                        element.addEventListener('click', this.#handleDynamicClick);
                    }
                });
                
                // Specifically add listeners to search result links (h3 links)
                const resultLinks = node.querySelectorAll('.fb-result h3 a, .search-result-item h3 a, .listing-item__title a');
                resultLinks.forEach(link => {
                    if (link) {
                        link.removeEventListener('click', this.#handleResultLinkClick);
                        link.addEventListener('click', this.#handleResultLinkClick);
                    }
                });
            }
        });
    }
 
    /**
     * Sets up event listeners for dynamic content.
     * 
     * @private
     */
    #setupDynamicListeners() {
        console.log("DynamicResultsManager: setupDynamicListeners");
        document.removeEventListener('click', this.#handleDynamicClick);
        document.addEventListener('click', this.#handleDynamicClick);
        
        // Set up delegation for result link clicks
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.removeEventListener('click', this.#handleResultLinkDelegation);
            resultsContainer.addEventListener('click', this.#handleResultLinkDelegation);
        }
    }
    
    /**
     * Handles delegated click events for search result links.
     * This approach ensures we catch all result links, even those added dynamically.
     * 
     * @private
     * @param {Event} e - The click event
     */
    #handleResultLinkDelegation = (e) => {
        // Check if click was on a search result link
        const resultLink = e.target.closest('.fb-result h3 a, .search-result-item h3 a, .listing-item__title a');
        if (resultLink) {
            this.#handleResultLinkClick(e, resultLink);
        }
    }
    
    /**
     * Specifically handles clicks on search result links for analytics tracking.
     * Captures data-live-url attribute for accurate destination tracking.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} link - The clicked result link element
     */
    #handleResultLinkClick = (e, link) => {
        // Don't prevent default navigation - let the user go to the result
        
        // Only proceed if we have a query and link
        if (!this.originalQuery || !link) return;
        
        try {
            // Get link details
            const href = link.getAttribute('href') || '';
            const dataLiveUrl = link.getAttribute('data-live-url') || href;
            const title = link.innerText.trim() || '';
            
            // Get position information if possible
            let position = -1;
            const resultItem = link.closest('.fb-result, .search-result-item, .listing-item');
            if (resultItem) {
                const allResults = Array.from(document.querySelectorAll('.fb-result, .search-result-item, .listing-item'));
                position = allResults.indexOf(resultItem) + 1;
            }
            
            console.log(`Result link clicked: "${title}" - ${dataLiveUrl} (position ${position})`);
            
            // Prepare analytics data
            const clickData = {
                originalQuery: this.originalQuery,
                clickedUrl: dataLiveUrl, // Using data-live-url for accurate destination
                clickedTitle: title,
                clickPosition: position,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            
            // Send analytics data (non-blocking)
            this.#sendClickData(clickData);
            
        } catch (error) {
            console.error('Error tracking result link click:', error);
            // Don't block navigation even if tracking fails
        }
    }
    
    /**
     * Sends click data to the analytics endpoint.
     * Uses sendBeacon for non-blocking operation to avoid delaying navigation.
     * 
     * @private
     * @param {Object} clickData - Data about the clicked result
     */
    #sendClickData(clickData) {
        try {
            // Use sendBeacon if available (works during page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(clickData)], {
                    type: 'application/json'
                });
                
                navigator.sendBeacon(this.analyticsEndpoint, blob);
                return;
            }
            
            // Fallback to fetch with keepalive
            fetch(this.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clickData),
                keepalive: true // This allows the request to outlive the page
            }).catch(error => {
                console.error('Error sending click data:', error);
            });
        } catch (error) {
            console.error('Failed to send click data:', error);
        }
    }
 
    /**
     * Main click handler for all dynamic content interactions.
     * Routes clicks to appropriate handlers based on element clicked.
     * 
     * @private
     * @param {Event} e - The click event object
     */
    #handleDynamicClick = async(e) => {
        try {
            const handlers = {
                '.facet-group__list a': this.#handleFacetAnchor,
                '.tab-list__nav a': this.#handleTab,
                '.search-tools__button-group a': this.#handleSearchTools,
                'a.facet-group__clear': this.#handleClearFacet,
                '.facet-breadcrumb__link': this.#handleClearFacet,
                '.facet-breadcrumb__item': this.#handleClearFacet,
                'a.related-links__link': this.#handleClick,
                '.query-blending__highlight': this.#handleClick,
                '.search-spelling-suggestions__link': this.#handleSpellingClick,
                'a.pagination__link': this.#handleClick
            };
 
            for (const [selector, handler] of Object.entries(handlers)) {
                const matchedElement = e.target.closest(selector);
                if (matchedElement) {
                    e.preventDefault();
                    console.log("DynamicResultsManager: handleDynamicClick");
                    console.log("element", matchedElement);
                    await handler.call(this, e, matchedElement);
                    break;
                }
            }
        } catch (error) {
            console.warn('Error in handleDynamicClick:', error);
        }
    }
 
    /**
     * Fetches results from Funnelback API via proxy.
     * Maps the original Funnelback URL parameters to the proxy endpoint.
     * 
     * @private
     * @param {string} url - The original Funnelback URL to fetch from
     * @param {string} method - The HTTP method to use
     * @returns {Promise<string>} The HTML response text
     */
    async #fetchFunnelbackResults(url, method) {
        const proxyUrl = 'https://funnelback-proxy-one.vercel.app/proxy/funnelback/search';
        
        try {
            const queryString = url.includes('?') ? url.split('?')[1] : '';
            const fullUrl = `${proxyUrl}?${queryString}&sessionId=${this.sessionId}`; // Add session ID for tracking
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const newContent = await response.text();
            
            // Update the original query if needed
            const urlParams = new URLSearchParams(queryString);
            const newQuery = urlParams.get('query');
            if (newQuery) {
                this.originalQuery = newQuery;
                console.log(`Updated original query to: ${this.originalQuery}`);
            }
            
            return newContent;
        } catch (error) {
            console.error(`Error with ${method} request:`, error);
            return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
        }
    }
 
    /**
     * Fetches tool-specific results from Funnelback API via proxy.
     * Handles specialized tool endpoints through the proxy service.
     * 
     * @private
     * @param {string} url - The original Funnelback tools URL
     * @param {string} method - The HTTP method to use
     * @returns {Promise<string>} The HTML response text
     */
    async #fetchFunnelbackTools(url, method) {
        const proxyUrl = 'https://https://funnelback-proxy-one.vercel.app/proxy/funnelback/tools';
        try {
            const queryString = new URLSearchParams({
                path: url.split('/s/')[1],
                sessionId: this.sessionId
            });
            const fullUrl = `${proxyUrl}?${queryString}`;
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Error with ${method} request:`, error);
            return `<p>Error fetching ${method} tools request. Please try again later.</p>`;
        }
    }
 
    /**
     * Fetches spelling suggestions from Funnelback API via proxy.
     * Uses a dedicated spelling endpoint that ensures proper parameter handling.
     * 
     * @private
     * @param {string} url - The original Funnelback spelling URL
     * @param {string} method - The HTTP method to use
     * @returns {Promise<string>} The HTML response text
     */
    async #fetchFunnelbackSpelling(url, method) {
        const proxyUrl = 'https://funnelback-proxy-one.vercel.app/proxy/funnelback/spelling';
        
        try {
            let queryString = url.includes('?') ? url.split('?')[1] : '';
            
            // Add session ID if not already present
            const params = new URLSearchParams(queryString);
            if (!params.has('sessionId')) {
                params.append('sessionId', this.sessionId);
                queryString = params.toString();
            }
            
            const fullUrl = `${proxyUrl}?${queryString}`;
            console.log('Making spelling proxy request to:', fullUrl);
            
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            // Update query if needed
            const newQuery = params.get('query');
            if (newQuery) {
                this.originalQuery = newQuery;
            }
            
            return await response.text();
        } catch (error) {
            console.error(`Error with ${method} request:`, error);
            return `<p>Error fetching ${method} spelling request. Please try again later.</p>`;
        }
    }
 
    /**
     * Handles generic click events.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleClick(e, element) {
        console.log("DynamicResultsManager: handleClick");
        
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.#fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No results found."}
                </div>
            `;
 
            document.getElementById('on-page-search-input')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
 
    /**
     * Handles spelling suggestion clicks.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleSpellingClick(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.#fetchFunnelbackSpelling(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No spelling results found."}
                </div>
            `;
        }
    }
 
    /**
     * Handles facet anchor clicks.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleFacetAnchor(e, element) {
        const facetAnchor = e.target.closest('.facet-group__list a');
        const facetHref = facetAnchor.getAttribute('href');
        if (facetHref) {
            const response = await this.#fetchFunnelbackResults(facetHref, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No facet results found."}
                </div>
            `;
        }
    }
 
    /**
     * Handles tab clicks.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleTab(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.#fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No tab results found."}
                </div>
            `;
        }
    }
 
    /**
     * Handles search tools clicks.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleSearchTools(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.#fetchFunnelbackTools(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No tool results found."}
                </div>
            `;
        }
    }
 
    /**
     * Handles clear facet clicks.
     * 
     * @private
     * @param {Event} e - The click event
     * @param {Element} element - The clicked element
     */
    async #handleClearFacet(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.#fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
                <div class="funnelback-search-container">
                    ${response || "No results found."}
                </div>
            `;
        }
    }
 
    /**
     * Cleans up event listeners and observers.
     * Should be called when the component is being removed.
     * 
     * @public
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.iconCheckInterval) {
            clearInterval(this.iconCheckInterval);
        }
        document.removeEventListener('click', this.#handleDynamicClick);
        
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.removeEventListener('click', this.#handleResultLinkDelegation);
        }
    }
 }
 
 // Initialize singleton instance
 const dynamicResults = new DynamicResultsManager();
 export default dynamicResults;