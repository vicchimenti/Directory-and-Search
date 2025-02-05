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
* @version 1.3.0
* @lastModified 2025-02-05
*/
import DOMObserverManager from './dom-observer-manager.js';
class DynamicResultsManager {
    /** @private {DOMObserverManager} Instance of DOM observer for managing dynamic content */
    #observer;
    /**
     * Initializes the Dynamic Results Manager.
     * Sets up mutation observer and event listeners if on search test page.
     */
    constructor() {
        this.observerConfig = {
            childList: true,
            subtree: true
        };
        
        if (window.location.pathname.includes('search-test')) {
            this.#initializeObserver();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.#setupDynamicListeners();
                    this.#startObserving();
                });
            } else {
                this.#setupDynamicListeners();
                this.#startObserving();
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
                if (mutation.type === 'childList') {
                    this.#attachEventListenersToNewContent(mutation.addedNodes);
                }
            });
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
        const proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback/search';
        try {
            const queryString = url.includes('?') ? url.split('?')[1] : '';
            const fullUrl = `${proxyUrl}?${queryString}`;
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return await response.text();
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
        const proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback/tools';
        try {
            const queryString = new URLSearchParams({
                path: url.split('/s/')[1]
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
        const proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback/spelling';
        try {
            const queryString = url.includes('?') ? url.split('?')[1] : '';
            const fullUrl = `${proxyUrl}?${queryString}`;
            console.log('Making spelling proxy request to:', fullUrl);
            
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
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
        document.removeEventListener('click', this.#handleDynamicClick);
    }
 }
 
 // Initialize singleton instance
 const dynamicResults = new DynamicResultsManager();
 export default dynamicResults;