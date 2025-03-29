/**
 * @fileoverview Unified Search Manager for Funnelback Search Integration
 * 
 * This class provides a universal search experience across the entire site.
 * Rather than separating into "header" and "results" modes, it detects
 * and manages all available search components wherever they appear.
 * 
 * Features:
 * - Single manager handles all search functionality sitewide
 * - Adapts to available search elements on any page
 * - Enables searching from any input point 
 * - Supports both redirect flows and direct API searches
 * - Preloads search results for faster experience
 * - Shared state management between all search components
 * 
 * Dependencies:
 * - Works with any search inputs and results containers on the page
 * - Compatible with Funnelback proxy endpoints
 * 
 * @author Victor Chimenti
 * @version 2.3.0
 * @namespace UnifiedSearchManager
 * @license MIT
 * @lastModified 2025-03-29
 */

class UnifiedSearchManager {
    /**
     * Initializes the Unified Search Manager.
     * Finds and initializes all search components on the page.
     * 
     * @param {Object} [config={}] - Configuration options
     */
    constructor(config = {}) {
        try {
            console.log('Starting UnifiedSearchManager constructor');
            
            // Determine if we're on the search results page
            const isResultsPage = window.location.pathname.includes('search-test');
            console.log('Current page is results page:', isResultsPage);
            
            // Default configuration
            this.config = {
                collection: 'seattleu~sp-search',
                profile: '_default',
                minLength: 3,
                maxResults: 8,
                suggestEndpoint: 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/suggest',
                searchEndpoint: 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/search',
                isResultsPage: isResultsPage,
                ...config
            };

            // Initialize session tracking
            this.sessionId = this.#getOrCreateSessionId();
            this.originalQuery = null;

            // Initialize state
            this.debounceTimeout = null;
            this.isLoading = false;
            
            // Initialize component references
            this.searchComponents = {};
            
            // Find and initialize all search components on the page
            this.#findAndInitializeSearchComponents();
            
            // If on results page, handle URL parameters and search
            if (isResultsPage) {
                // Handle URL parameters to execute the search
                this.handleURLParameters();
            }
            
            console.log('UnifiedSearchManager constructor completed successfully');
        } catch (error) {
            console.error('Error in UnifiedSearchManager constructor:', error);
        }
    }

    /**
     * Finds all search components on the page and initializes them.
     * This includes global header search and results page search.
     * 
     * @private
     */
    #findAndInitializeSearchComponents() {
        // Find header search components (may exist on any page)
        const headerSearchInput = document.getElementById('search-input');
        const headerSearchButton = document.getElementById('search-button');
        
        if (headerSearchInput && headerSearchButton) {
            console.log('Found header search components');
            
            // Store references
            this.searchComponents.header = {
                input: headerSearchInput,
                button: headerSearchButton,
                container: null
            };
            
            // Find or create suggestions container
            let suggestionsContainer = document.getElementById('header-suggestions');
            if (!suggestionsContainer) {
                suggestionsContainer = document.createElement('div');
                suggestionsContainer.id = 'header-suggestions';
                suggestionsContainer.className = 'header-suggestions-container';
                suggestionsContainer.setAttribute('role', 'listbox');
                suggestionsContainer.hidden = true;
                
                // Insert after search input
                headerSearchInput.parentNode.insertBefore(
                    suggestionsContainer,
                    headerSearchInput.nextSibling
                );
            }
            
            this.searchComponents.header.suggestionsContainer = suggestionsContainer;
            
            // Set up event listeners for header search
            headerSearchInput.addEventListener('input', (event) => this.#handleInput(event, 'header'));
            headerSearchInput.addEventListener('keydown', (event) => this.#handleKeydown(event, 'header'));
            headerSearchButton.addEventListener('click', (event) => this.#handleSearchAction(event, 'header'));
        }
        
        // Find results page components (only on search page)
        if (this.config.isResultsPage) {
            const resultsSearchInput = document.getElementById('autocomplete-concierge-inputField');
            const resultsForm = resultsSearchInput?.closest('form');
            const resultsSubmitButton = resultsForm?.querySelector('#on-page-search-button');
            const resultsContainer = document.getElementById('results');
            
            if (resultsSearchInput && resultsContainer) {
                console.log('Found results page search components');
                
                // Store references
                this.searchComponents.results = {
                    input: resultsSearchInput,
                    form: resultsForm,
                    button: resultsSubmitButton,
                    resultsContainer: resultsContainer
                };
                
                // Only set up form submission handler for results page
                if (resultsForm) {
                    resultsForm.addEventListener('submit', (event) => this.#handleSearchAction(event, 'results'));
                }
                
                // Make sure search button is visible if it exists
                if (resultsSubmitButton) {
                    resultsSubmitButton.classList.remove('empty-query');
                }
            }
        }
        
        // Set up document click listener for handling clicks outside search components
        document.addEventListener('click', this.#handleClickOutside.bind(this));
        
        // Log component initialization status
        console.log('Search components initialized:', {
            header: !!this.searchComponents.header,
            results: !!this.searchComponents.results
        });
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
     * Gets the search query from the specified component's input field.
     * 
     * @private
     * @param {string} componentType - The type of component ('header' or 'results')
     * @returns {string} The sanitized search query
     */
    #getSearchQuery(componentType) {
        const component = this.searchComponents[componentType];
        if (!component || !component.input) return '';
        return component.input.value.trim();
    }

    /**
     * Handles search parameters from the URL.
     * If a query parameter exists, it populates search fields and performs the search.
     * Optimized to prioritize search execution before UI updates.
     * 
     * @public
     * @returns {Promise<void>}
     */
    async handleURLParameters() {
        try {
            console.log("Handling URL parameters");

            const urlParams = new URLSearchParams(window.location.search);
            const urlSearchQuery = urlParams.get('query');

            console.log("URL search query:", urlSearchQuery);

            if (urlSearchQuery) {
                // Store original query for analytics
                this.originalQuery = urlSearchQuery;
                
                // First check local cache
                const cachedResults = this.#getFromRecentSearchCache(urlSearchQuery);
                if (cachedResults) {
                    console.log("Using cached search results");
                    if (this.searchComponents.results?.resultsContainer) {
                        this.searchComponents.results.resultsContainer.innerHTML = cachedResults;
                        
                        // Update input field non-critically after displaying results
                        setTimeout(() => {
                            this.#setAllSearchInputs(urlSearchQuery);
                        }, 0);
                        
                        return;
                    }
                }
                
                // Then check for preloaded results
                const pendingSearchQuery = sessionStorage.getItem('pendingSearchQuery');
                const preloadedResults = sessionStorage.getItem('preloadedSearchResults');
                const preloadedTimestamp = sessionStorage.getItem('preloadedSearchTimestamp');
                
                // Only use preloaded results if they exist, match the current query, and are recent (within 30 seconds)
                const areResultsRecent = preloadedTimestamp && 
                    (Date.now() - parseInt(preloadedTimestamp)) < 30000;
                    
                if (preloadedResults && pendingSearchQuery === urlSearchQuery && areResultsRecent) {
                    console.log("Using preloaded search results");
                    
                    // Clear the preloaded data to prevent stale reuse
                    sessionStorage.removeItem('pendingSearchQuery');
                    sessionStorage.removeItem('preloadedSearchResults');
                    sessionStorage.removeItem('preloadedSearchTimestamp');
                    
                    // Display the preloaded results
                    if (this.searchComponents.results?.resultsContainer) {
                        const resultHTML = `
                            <div id="funnelback-search-container-response" class="funnelback-search-container">
                                ${preloadedResults}
                            </div>
                        `;
                        
                        // Store in cache for future use
                        this.#storeInRecentSearchCache(urlSearchQuery, resultHTML);
                        
                        this.searchComponents.results.resultsContainer.innerHTML = resultHTML;
                        
                        // Update input field non-critically after displaying results
                        setTimeout(() => {
                            this.#setAllSearchInputs(urlSearchQuery);
                        }, 0);
                    }
                } else {
                    // No cached or preloaded results, perform the search immediately
                    console.log("No cached or preloaded results available, performing search");
                    
                    // Start search request immediately without waiting to update input
                    const searchPromise = this.performFunnelbackSearch(urlSearchQuery);
                    
                    // Update input field in parallel (doesn't block the search)
                    setTimeout(() => {
                        this.#setAllSearchInputs(urlSearchQuery);
                    }, 0);
                    
                    // Wait for search to complete
                    await searchPromise;
                }
            } else {
                console.log("No query parameter found in URL");
            }
        } catch (error) {
            console.error("Error in handleURLParameters:", error);
        }
    }

    /**
     * Sets search input fields to the given value.
     * Only populates inputs on the results page, not the header input.
     * 
     * @private
     * @param {string} query - The search query
     */
    #setAllSearchInputs(query) {
        if (this.config.isResultsPage && this.searchComponents.results?.input) {
            console.log(`Setting results page input value to: ${query}`);
            this.searchComponents.results.input.value = query;
            this.searchComponents.results.input.setAttribute('value', query);
            this.searchComponents.results.input.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Handles search actions from any search component.
     * Header search initiates preloading and redirects.
     * Results page search performs API search directly.
     * 
     * @private
     * @param {Event} event - The initiating event
     * @param {string} componentType - The type of component ('header' or 'results')
     */
    #handleSearchAction = async (event) => {
        event.preventDefault();
        const componentType = event.currentTarget.closest('form')?.id === 'on-page-search-form' ? 'results' : 'header';
        console.log(`Handling search action from ${componentType}`);
        
        const searchQuery = this.#getSearchQuery(componentType);
        
        // Validate search input
        if (!searchQuery) {
            alert('Please enter a search term');
            return;
        }

        // If on results page, just perform the search
        if (componentType === 'results' || this.config.isResultsPage) {
            console.log('Performing direct search on results page');
            await this.performFunnelbackSearch(searchQuery);
            return;
        }
        
        // If from header on non-results page, preload and redirect
        console.log('Preloading search results and redirecting');
        
        // Start the search request immediately
        this.#preloadSearchResults(searchQuery);

        // Construct search URL with parameters
        const searchParams = new URLSearchParams({
            query: searchQuery,
            collection: this.config.collection,
            profile: this.config.profile
        });

        // Redirect to results page with hash to indicate preloaded results
        const redirectUrl = `/search-test/?${searchParams.toString()}#preloaded`;
        window.location.href = redirectUrl;
    }

    /**
     * Preloads search results by initiating a search request and storing the result
     * in sessionStorage. The results page will check for and use these results.
     * 
     * @private
     * @param {string} searchQuery - The search query to preload
     */
    async #preloadSearchResults(searchQuery) {
        try {
            console.log('Starting search preloading for query:', searchQuery);
            
            // Store the query immediately
            sessionStorage.setItem('pendingSearchQuery', searchQuery);
            sessionStorage.setItem('preloadTimestamp', Date.now().toString());
            
            // Create the search parameters
            const searchParams = new URLSearchParams({
                query: searchQuery,
                collection: this.config.collection,
                profile: this.config.profile,
                form: 'partial',
                sessionId: this.sessionId
            });

            const url = `${this.config.searchEndpoint}?${searchParams.toString()}`;
            console.log('Preloading URL:', url);
            
            // Use fetch with a timeout to ensure we don't block navigation too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout
            
            try {
                const response = await fetch(url, { 
                    signal: controller.signal,
                    credentials: 'same-origin'
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const text = await response.text();
                    console.log('Preloaded results size:', text.length);
                    
                    // Store with timestamp
                    sessionStorage.setItem('preloadedSearchResults', text);
                    sessionStorage.setItem('preloadedSearchTimestamp', Date.now().toString());
                    console.log('Search results preloaded successfully');
                } else {
                    console.warn('Preload fetch failed with status:', response.status);
                }
            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    console.log('Preload fetch aborted due to timeout');
                } else {
                    console.error('Preload fetch error:', fetchError);
                }
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error('Error in preloadSearchResults:', error);
        }
    }

    /**
     * Performs a search using the Funnelback API via proxy server.
     * Checks local cache first and stores results in cache after fetching.
     * Return value is now used by handleURLParameters for promise chaining.
     * 
     * @public
     * @param {string} searchQuery - The search query to perform
     * @returns {Promise<boolean>} Success indicator for promise chaining
     * @throws {Error} If the search request fails
     */
    async performFunnelbackSearch(searchQuery) {
        console.log("Performing Funnelback search:", searchQuery);
        
        // Store original query for analytics tracking
        this.originalQuery = searchQuery;
        
        // Make sure we have a results container to show results in
        const resultsContainer = this.searchComponents.results?.resultsContainer;
        if (!resultsContainer) {
            console.error('Results container not found, cannot display search results');
            return false;
        }

        try {
            this.isLoading = true;
            this.#updateLoadingState(true);
            
            // Check cache first
            const cachedResults = this.#getFromRecentSearchCache(searchQuery);
            if (cachedResults) {
                console.log('Using cached search results');
                resultsContainer.innerHTML = cachedResults;
                this.isLoading = false;
                this.#updateLoadingState(false);
                return true;
            }
            
            const searchParams = new URLSearchParams({
                query: searchQuery,
                collection: this.config.collection,
                profile: this.config.profile,
                form: 'partial',
                sessionId: this.sessionId
            });

            const url = `${this.config.searchEndpoint}?${searchParams.toString()}`;
            console.log('Request URL:', url);

            const response = await fetch(url);
            console.log('Proxy Response Status:', response.status);
            
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const text = await response.text();
            const resultHTML = `
                <div id="funnelback-search-container-response" class="funnelback-search-container">
                    ${text}
                </div>
            `;
            
            // Store in cache
            this.#storeInRecentSearchCache(searchQuery, resultHTML);
            
            resultsContainer.innerHTML = resultHTML;
            return true;
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't complete your search. ${error.message}</p>
                </div>
            `;
            return false;
        } finally {
            this.isLoading = false;
            this.#updateLoadingState(false);
        }
    }

    /**
     * Updates the UI to reflect loading state.
     * 
     * @private
     * @param {boolean} isLoading - Whether the component is in a loading state
     */
    #updateLoadingState(isLoading) {
        // Update loading state for all buttons
        Object.keys(this.searchComponents).forEach(componentType => {
            const button = this.searchComponents[componentType]?.button;
            const input = this.searchComponents[componentType]?.input;
            
            if (button) {
                button.classList.toggle('loading', isLoading);
            }
            
            if (input) {
                input.disabled = isLoading;
            }
        });
    }

    /**
     * Handles input events with debouncing.
     * Triggers suggestion fetching after user stops typing.
     * 
     * @private
     * @param {InputEvent} event - The input event
     * @param {string} componentType - The type of component ('header' or 'results')
     */
    #handleInput(event, componentType) {
        if (componentType === 'results') {
            return;
        }
        
        const query = event.target.value.trim();
        const component = this.searchComponents[componentType];
        
        if (!component || !component.suggestionsContainer) return;
        
        clearTimeout(this.debounceTimeout);
        
        if (query.length < this.config.minLength) {
            component.suggestionsContainer.innerHTML = '';
            component.suggestionsContainer.hidden = true;
            return;
        }

        // Debounce for queries
        this.debounceTimeout = setTimeout(() => {
            this.#fetchSuggestions(query, componentType);
        }, 200);
    }

    /**
     * Fetches search suggestions from the Funnelback API.
     * 
     * @private
     * @param {string} query - The search query
     * @param {string} componentType - The type of component ('header' or 'results')
     */
    async #fetchSuggestions(query, componentType) {
        const component = this.searchComponents[componentType];
        if (!component || !component.suggestionsContainer) return;
        
        try {
            // Basic validation
            if (!query || query.length < this.config.minLength) {
                component.suggestionsContainer.innerHTML = '';
                component.suggestionsContainer.hidden = true;
                return;
            }

            // Prepare parameters
            const params = new URLSearchParams({
                partial_query: query,
                collection: this.config.collection,
                profile: this.config.profile,
                sessionId: this.sessionId
            });

            // Fetch suggestions
            const response = await fetch(`${this.config.suggestEndpoint}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Suggestion request failed: ${response.status}`);
            }

            // Parse response
            const suggestions = await response.json();
            
            // Display results (limited to maxResults)
            this.#displaySuggestions(suggestions.slice(0, this.config.maxResults), componentType);
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            component.suggestionsContainer.innerHTML = '';
            component.suggestionsContainer.hidden = true;
        }
    }

    /**
     * Displays suggestions for a specific component.
     * 
     * @private
     * @param {Array} suggestions - Array of suggestion objects
     * @param {string} componentType - The type of component ('header' or 'results')
     */
    #displaySuggestions(suggestions, componentType) {
        // Skip displaying suggestions for results page input - leave that to AutocompleteSearchManager
        if (componentType === 'results') {
            return;
        }
        
        const component = this.searchComponents[componentType];
        if (!component || !component.suggestionsContainer || !suggestions.length) {
            if (component?.suggestionsContainer) {
                component.suggestionsContainer.innerHTML = '';
                component.suggestionsContainer.hidden = true;
            }
            return;
        }

        const suggestionHTML = `
            <div class="header-suggestions-list">
                ${suggestions.map((suggestion, index) => `
                    <div class="header-suggestion-item" role="option" data-index="${index}" data-component="${componentType}">
                        <span class="suggestion-text">${suggestion.display || ''}</span>
                    </div>
                `).join('')}
            </div>
        `;

        component.suggestionsContainer.innerHTML = suggestionHTML;
        component.suggestionsContainer.hidden = false;

        // Add click handlers for suggestion items
        component.suggestionsContainer.querySelectorAll('.header-suggestion-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                const selectedText = item.querySelector('.suggestion-text').textContent;
                component.input.value = selectedText;
                component.suggestionsContainer.innerHTML = '';
                component.suggestionsContainer.hidden = true;
                
                if (componentType === 'header') {
                    // If we're in the header, trigger the redirect
                    if (component.button) {
                        component.button.click();
                    } else {
                        // In case button isn't available, handle search directly
                        this.#handleSearchAction(new Event('click', {cancelable: true}), 'header');
                    }
                }
            });
        });
    }

    /**
     * Handles keyboard navigation within suggestions.
     * Supports arrow keys, enter, and escape.
     * 
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     * @param {string} componentType - The type of component ('header' or 'results')
     */
    #handleKeydown(event, componentType) {
        if (componentType === 'results') {
            return;
        }
        
        const component = this.searchComponents[componentType];
        if (!component || !component.suggestionsContainer || component.suggestionsContainer.hidden) {
            return;
        }

        const items = component.suggestionsContainer.querySelectorAll('.header-suggestion-item');
        if (!items.length) return;

        const activeItem = component.suggestionsContainer.querySelector('.header-suggestion-item.active');
        let activeIndex = -1;

        if (activeItem) {
            activeIndex = parseInt(activeItem.dataset.index, 10);
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                
                if (activeIndex < items.length - 1) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[activeIndex + 1].classList.add('active');
                } else if (activeIndex === -1) {
                    // No active item yet, select first one
                    items[0].classList.add('active');
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                
                if (activeIndex > 0) {
                    activeItem.classList.remove('active');
                    items[activeIndex - 1].classList.add('active');
                }
                break;

            case 'Enter':
                if (activeItem) {
                    event.preventDefault();
                    const selectedText = activeItem.querySelector('.suggestion-text').textContent;
                    component.input.value = selectedText;
                    component.suggestionsContainer.innerHTML = '';
                    component.suggestionsContainer.hidden = true;
                    
                    // Trigger search with the selected suggestion
                    this.#handleSearchAction(new Event('click', {cancelable: true}), componentType);
                }
                break;

            case 'Escape':
                event.preventDefault();
                component.suggestionsContainer.innerHTML = '';
                component.suggestionsContainer.hidden = true;
                component.input.blur();
                break;
        }
    }

    /**
     * Handles clicks outside search components.
     * Closes suggestion dropdowns when clicking elsewhere.
     * 
     * @private
     * @param {MouseEvent} event - The click event
     */
    #handleClickOutside(event) {
        // For each component type, check if click was outside and hide suggestions if so
        Object.keys(this.searchComponents).forEach(componentType => {
            const component = this.searchComponents[componentType];
            if (!component || !component.suggestionsContainer) return;
            
            if (!component.input?.contains(event.target) && 
                !component.suggestionsContainer?.contains(event.target)) {
                component.suggestionsContainer.innerHTML = '';
                component.suggestionsContainer.hidden = true;
            }
        });
    }

    /**
     * Add simple localStorage-based caching for recent searches
     * 
     * @private
     * @param {string} query - The search query to check in cache
     * @returns {string|null} The cached results or null if not found
     */
    #getFromRecentSearchCache(query) {
        try {
            const cacheData = localStorage.getItem(`search_cache_${query}`);
            if (!cacheData) return null;
            
            const { results, timestamp } = JSON.parse(cacheData);
            
            // Check if cache is still valid (10 minutes)
            if (Date.now() - timestamp > 10 * 60 * 1000) {
                localStorage.removeItem(`search_cache_${query}`);
                return null;
            }
            
            return results;
        } catch (error) {
            console.error('Error retrieving from cache:', error);
            return null;
        }
    }

    /**
     * Stores search results in the recent searches cache
     * 
     * @private
     * @param {string} query - The search query
     * @param {string} results - The HTML results to cache
     */
    #storeInRecentSearchCache(query, results) {
        try {
            console.log(`Attempting to store in cache: query=${query}, size=${results.length}`);
            
            // Try storing a small test value first
            localStorage.setItem('test_storage', 'test');
            console.log('Test storage successful');
            
            const cacheData = JSON.stringify({
                results,
                timestamp: Date.now()
            });
            
            localStorage.setItem(`search_cache_${query}`, cacheData);
            console.log(`Successfully stored in cache: query=${query}`);
            
            // Clean up old cache entries
            this.#cleanupOldCacheEntries();
        } catch (error) {
            console.error('Error storing in cache:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
    }

    /**
     * Cleans up old cache entries to prevent localStorage from filling up
     * Keeps only the 10 most recent searches
     * 
     * @private
     */
    #cleanupOldCacheEntries() {
        try {
            const cacheKeys = [];
            
            // Collect all search cache entries
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('search_cache_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        cacheKeys.push({ key, timestamp: data.timestamp });
                    } catch (e) {
                        // Remove invalid entries
                        localStorage.removeItem(key);
                    }
                }
            }
            
            // Sort by timestamp (newest first)
            cacheKeys.sort((a, b) => b.timestamp - a.timestamp);
            
            // Keep only the 10 most recent
            if (cacheKeys.length > 10) {
                cacheKeys.slice(10).forEach(item => {
                    localStorage.removeItem(item.key);
                });
            }
        } catch (error) {
            console.error('Error cleaning cache:', error);
        }
    }
}

// Make sure this script runs as soon as possible
console.log('UnifiedSearchManager script loaded');

// Simple initialization function
function initUnifiedSearch() {
    console.log('Initializing UnifiedSearchManager');
    try {
        // Create a global instance for debugging
        window.unifiedSearchManager = new UnifiedSearchManager();
        console.log('UnifiedSearchManager initialized successfully');
    } catch (error) {
        console.error('Error initializing UnifiedSearchManager:', error);
        console.error(error.stack); // Log the full stack trace
    }
}

// Initialize immediately if document is ready, otherwise wait
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already ready, initializing immediately');
    initUnifiedSearch();
} else {
    console.log('Document not ready, waiting for load event');
    window.addEventListener('load', initUnifiedSearch);
}

// Also maintain the DOMContentLoaded listener for backward compatibility
document.addEventListener('DOMContentLoaded', () => {
    if (!window.unifiedSearchManager) {
        console.log('Initializing from DOMContentLoaded event');
        initUnifiedSearch();
    }
});

export default UnifiedSearchManager;