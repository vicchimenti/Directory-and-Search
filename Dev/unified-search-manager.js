/**
 * @fileoverview Unified Search Manager for Funnelback Search Integration
 * 
 * This class unifies header search and results search functionalities to reduce
 * latency and code duplication while maintaining context-specific behaviors.
 * In header mode, it provides simple autocomplete from suggest.js only.
 * In results mode, it handles the full search execution using Funnelback API.
 * 
 * Features:
 * - Unified approach to search functionality
 * - Context-aware initialization (header or results)
 * - Simple suggestions for header context
 * - Full search execution for results context
 * - Shared state management between contexts
 * - Reduced latency by avoiding unnecessary redirects
 * 
 * Dependencies:
 * - Requires DOM elements with specific IDs based on context
 * - Works with Funnelback proxy endpoints
 * 
 * @author Victor Chimenti
 * @version 1.1.2
 * @namespace UnifiedSearchManager
 * @license MIT
 * @lastModified 2025-03-28
 */

class UnifiedSearchManager {
    /**
     * Initializes the Unified Search Manager.
     * Determines context and sets up appropriate configuration and event listeners.
     * 
     * @param {Object} [config={}] - Configuration options
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor(config = {}) {
        try {
            console.log('Starting UnifiedSearchManager constructor');
            
            // Determine current context based on URL
            const isResultsPage = window.location.pathname.includes('search-test');
            console.log('Current page is results page:', isResultsPage);
            
            // Default configuration with context-specific overrides
            this.config = {
                mode: isResultsPage ? 'results' : 'header',
                collection: 'seattleu~sp-search',
                profile: '_default',
                minLength: 3,
                maxResults: isResultsPage ? 10 : 8,
                suggestEndpoint: 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/suggest',
                searchEndpoint: 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/search',
                ...config
            };

            console.log(`Initializing UnifiedSearchManager in ${this.config.mode} mode`);

            // Initialize session tracking
            this.sessionId = this.#getOrCreateSessionId();
            this.originalQuery = null;

            // Initialize state
            this.debounceTimeout = null;
            this.isLoading = false;

            // Initialize DOM elements based on context
            this.#initializeDOMElements();
            
            // Initialize functionality based on context
            if (this.config.mode === 'header') {
                this.#initializeHeaderMode();
            } else {
                this.#initializeResultsMode();
                
                // Critical: Handle URL parameters immediately
                console.log("Calling handleURLParameters from constructor");
                this.handleURLParameters();
            }
            
            console.log('UnifiedSearchManager constructor completed successfully');
        } catch (error) {
            console.error('Error in UnifiedSearchManager constructor:', error);
        }
    }

    /**
     * Initializes DOM elements based on current context.
     * 
     * @private
     */
    #initializeDOMElements() {
        try {
            if (this.config.mode === 'header') {
                // Header mode DOM elements
                this.searchButton = document.getElementById('search-button');
                this.searchInput = document.getElementById('search-input');
                
                // Create suggestions container if it doesn't exist
                this.suggestionsContainer = document.getElementById('header-suggestions');
                if (!this.suggestionsContainer) {
                    this.suggestionsContainer = document.createElement('div');
                    this.suggestionsContainer.id = 'header-suggestions';
                    this.suggestionsContainer.className = 'header-suggestions-container';
                    this.suggestionsContainer.setAttribute('role', 'listbox');
                    this.suggestionsContainer.hidden = true;
                    
                    // Insert after search input
                    if (this.searchInput) {
                        this.searchInput.parentNode.insertBefore(
                            this.suggestionsContainer,
                            this.searchInput.nextSibling
                        );
                    }
                }
            } else {
                // Results mode DOM elements
                this.searchInput = document.getElementById('autocomplete-concierge-inputField');
                this.form = this.searchInput ? this.searchInput.closest('form') : null;
                this.submitButton = this.form ? this.form.querySelector('#on-page-search-button') : null;
                this.suggestionsContainer = document.getElementById('autocomplete-suggestions');
                this.resultsContainer = document.getElementById('results');
            }

            // Log DOM element initialization status
            console.log('DOM Elements initialized:', {
                mode: this.config.mode,
                searchInput: this.searchInput ? '✓' : '✗',
                searchButton: this.searchButton ? '✓' : '✗',
                submitButton: this.submitButton ? '✓' : '✗',
                suggestionsContainer: this.suggestionsContainer ? '✓' : '✗',
                resultsContainer: this.resultsContainer ? '✓' : '✗'
            });
            
            // Warning if critical elements not found
            if ((this.config.mode === 'header' && (!this.searchInput || !this.searchButton)) || 
                (this.config.mode === 'results' && (!this.searchInput || !this.resultsContainer))) {
                console.warn(`Required DOM elements not found for ${this.config.mode} mode`);
            }
        } catch (error) {
            console.error('Error initializing DOM elements:', error);
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
     * Initializes functionality for header search mode.
     * Sets up event listeners for search button and input for simple autocomplete.
     * 
     * @private
     */
    #initializeHeaderMode() {
        console.log('Initializing header mode');
        
        if (!this.searchButton || !this.searchInput) {
            console.warn('Header search elements not found');
            return;
        }

        // Set up event listeners
        this.searchButton.addEventListener('click', this.#handleHeaderSearch);
        this.searchInput.addEventListener('input', this.#handleInput.bind(this));
        this.searchInput.addEventListener('keydown', this.#handleKeydown.bind(this));
        
        // Close suggestions when clicking outside
        document.addEventListener('click', this.#handleClickOutside.bind(this));
    }

    /**
     * Initializes functionality for results search mode.
     * Sets up event listeners for search form and handles URL parameters.
     * 
     * @private
     */
    #initializeResultsMode() {
        console.log('Initializing results mode');
        
        if (!this.searchInput || !this.resultsContainer) {
            console.warn('Results search elements not found');
            return;
        }

        if (this.form && this.submitButton) {
            this.form.addEventListener('submit', this.#handleResultsSearch);
            
            // Make sure search button is visible
            this.submitButton.classList.remove('empty-query');
        }
    }

    /**
     * Gets the current search query from the appropriate input field.
     * 
     * @private
     * @returns {string} The sanitized search query
     */
    #getSearchQuery() {
        if (!this.searchInput) return '';
        return this.searchInput.value.trim();
    }

    /**
     * Handles search parameters from the URL.
     * If a query parameter exists, it populates the search field and performs the search.
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
                
                // Make sure the search input field exists
                if (this.searchInput) {
                    console.log("Setting search input value to:", urlSearchQuery);
                    // Explicitly set the value using both property and attribute
                    this.searchInput.value = urlSearchQuery;
                    this.searchInput.setAttribute('value', urlSearchQuery);
                    
                    // Force a UI update
                    this.searchInput.dispatchEvent(new Event('change'));
                } else {
                    console.error("Search input field not found!");
                }
                
                // Explicitly perform the search with a slight delay to ensure DOM is ready
                console.log("Triggering search for:", urlSearchQuery);
                setTimeout(() => {
                    this.performFunnelbackSearch(urlSearchQuery);
                }, 300);
            } else {
                console.log("No query parameter found in URL");
            }
        } catch (error) {
            console.error("Error in handleURLParameters:", error);
        }
    }

    /**
     * Handles the header search button click event.
     * Validates input and triggers search.
     * 
     * @private
     * @param {Event} event - The click event object
     */
    #handleHeaderSearch = (event) => {
        event.preventDefault();
        const searchQuery = this.#getSearchQuery();
        
        // Validate search input
        if (!searchQuery) {
            alert('Please enter a search term');
            return;
        }

        // Construct search URL with parameters
        const searchParams = new URLSearchParams({
            query: searchQuery,
            collection: this.config.collection,
            profile: this.config.profile
        });

        // Redirect to results page
        const redirectUrl = `/search-test/?${searchParams.toString()}`;
        window.location.href = redirectUrl;
    }

    /**
     * Handles form submission in results mode.
     * Prevents default submission and executes the search via API.
     * 
     * @private
     * @param {Event} event - The submit event
     */
    #handleResultsSearch = async(event) => {
        console.log("Handling results search form submission");

        event.preventDefault();
        const searchQuery = this.#getSearchQuery();
        
        if (!searchQuery) {
            alert('Please enter a search term');
            return;
        }

        await this.performFunnelbackSearch(searchQuery);
    }

    /**
     * Performs a search using the Funnelback API via proxy server.
     * 
     * @public
     * @param {string} searchQuery - The search query to perform
     * @returns {Promise<void>}
     * @throws {Error} If the search request fails
     */
    async performFunnelbackSearch(searchQuery) {
        console.log("Performing Funnelback search:", searchQuery);
        
        // Store original query for analytics tracking
        this.originalQuery = searchQuery;
    
        try {
            this.isLoading = true;
            this.#updateLoadingState(true);
            
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
            if (this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div id="funnelback-search-container-response" class="funnelback-search-container">
                        ${text}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Search error:', error);
            if (this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Sorry, we couldn't complete your search. ${error.message}</p>
                    </div>
                `;
            }
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
        if (this.config.mode === 'results' && this.submitButton) {
            this.submitButton.classList.toggle('loading', isLoading);
            this.searchInput.disabled = isLoading;
        }
    }

    /**
     * Handles input events with debouncing.
     * Triggers suggestion fetching after user stops typing.
     * 
     * @private
     * @param {InputEvent} event - The input event
     */
    #handleInput(event) {
        const query = event.target.value.trim();
        
        clearTimeout(this.debounceTimeout);
        
        if (query.length < this.config.minLength) {
            this.suggestionsContainer.innerHTML = '';
            this.suggestionsContainer.hidden = true;
            return;
        }
    
        // Debounce for queries
        this.debounceTimeout = setTimeout(() => {
            this.#fetchSuggestions(query);
        }, 200);
    }

    /**
     * Fetches search suggestions from the Funnelback API.
     * 
     * @private
     * @param {string} query - The search query
     */
    async #fetchSuggestions(query) {
        try {
            // Basic validation
            if (!query || query.length < this.config.minLength) {
                this.suggestionsContainer.innerHTML = '';
                this.suggestionsContainer.hidden = true;
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
            // Note: For now, we're using the same display method for both contexts
            // In the future, the results page might use the AutocompleteSearchManager instead
            this.#displayHeaderSuggestions(suggestions.slice(0, this.config.maxResults));
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
            this.suggestionsContainer.hidden = true;
        }
    }

    /**
     * Displays suggestions in header context (simple single-column layout).
     * 
     * @private
     * @param {Array} suggestions - Array of suggestion objects
     */
    #displayHeaderSuggestions(suggestions) {
        if (!this.suggestionsContainer || !suggestions.length) {
            this.suggestionsContainer.innerHTML = '';
            this.suggestionsContainer.hidden = true;
            return;
        }
    
        const suggestionHTML = `
            <div class="header-suggestions-list">
                ${suggestions.map((suggestion, index) => `
                    <div class="header-suggestion-item" role="option" data-index="${index}">
                        <span class="suggestion-text">${suggestion.display || ''}</span>
                    </div>
                `).join('')}
            </div>
        `;
    
        this.suggestionsContainer.innerHTML = suggestionHTML;
        this.suggestionsContainer.hidden = false;
    
        // Add click handlers for suggestion items
        this.suggestionsContainer.querySelectorAll('.header-suggestion-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                const selectedText = item.querySelector('.suggestion-text').textContent;
                this.searchInput.value = selectedText;
                this.suggestionsContainer.innerHTML = '';
                this.suggestionsContainer.hidden = true;
                
                // Trigger search with the selected suggestion
                if (this.config.mode === 'header') {
                    this.searchButton.click();
                } else if (this.submitButton) {
                    this.submitButton.click();
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
     */
    #handleKeydown(event) {
        // Only handle keyboard navigation if suggestions are visible
        if (this.suggestionsContainer.hidden) {
            return;
        }

        const items = this.suggestionsContainer.querySelectorAll('.header-suggestion-item');
        if (!items.length) return;

        const activeItem = this.suggestionsContainer.querySelector('.header-suggestion-item.active');
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
                    this.searchInput.value = selectedText;
                    this.suggestionsContainer.innerHTML = '';
                    this.suggestionsContainer.hidden = true;
                    
                    // Trigger search with the selected suggestion
                    if (this.config.mode === 'header') {
                        this.searchButton.click();
                    } else if (this.submitButton) {
                        this.submitButton.click();
                    }
                }
                break;

            case 'Escape':
                event.preventDefault();
                this.suggestionsContainer.innerHTML = '';
                this.suggestionsContainer.hidden = true;
                this.searchInput.blur();
                break;
        }
    }

    /**
     * Handles clicks outside the autocomplete component.
     * Closes the suggestions dropdown when clicking elsewhere.
     * 
     * @private
     * @param {MouseEvent} event - The click event
     */
    #handleClickOutside(event) {
        if (!this.searchInput?.contains(event.target) && 
            !this.suggestionsContainer?.contains(event.target)) {
            this.suggestionsContainer.innerHTML = '';
            this.suggestionsContainer.hidden = true;
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