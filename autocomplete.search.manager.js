/**
 * @fileoverview Autocomplete Search Manager for Funnelback Search Integration
 * 
 * This class manages real-time search suggestions functionality, integrating with
 * Funnelback search services via a proxy server. It provides typeahead suggestions
 * as users type in the search input field and handles suggestion selection with
 * immediate search results display.
 * 
 * Features:
 * - Real-time suggestions as users type
 * - Debounced API calls to prevent request flooding
 * - Keyboard navigation support (up/down arrows, enter, escape)
 * - Click selection support
 * - Accessible ARIA attributes
 * - Configurable parameters (collection, profile, result count, etc.)
 * - Direct integration with Funnelback search API
 * 
 * Dependencies:
 * - Requires proxy endpoint for Funnelback API access
 * - Requires DOM element with specified input ID
 * - Requires results container for search results display
 * 
 * Configuration Options:
 * @typedef {Object} AutocompleteConfig
 * @property {string} [inputId='autocomplete-concierge-inputField'] - ID of input element
 * @property {string} [collection='seattleu~sp-search'] - Funnelback collection ID
 * @property {string} [profile='_default'] - Search profile name
 * @property {number} [maxResults=10] - Maximum number of suggestions to show
 * @property {number} [minLength=3] - Minimum characters before showing suggestions
 * 
 * Related Files:
 * - suggest.js: Proxy server handler for suggestions
 * - vercel.json: Route configuration for proxy endpoints
 * 
 * @example
 * const autocomplete = new AutocompleteSearchManager({
 *   inputId: 'my-search-input',
 *   collection: 'my-collection',
 *   maxResults: 5
 * });
 * 
 * @author Victor Chimenti
 * @version 1.0.0
 * @lastModified 2025-02-06
 */

class AutocompleteSearchManager {
    /**
     * Creates an instance of AutocompleteSearchManager.
     * Initializes configuration and sets up the suggestions container.
     * 
     * @param {AutocompleteConfig} [config={}] - Configuration options
     * @throws {Error} If input field element is not found in DOM
     */
    constructor(config = {}) {
        this.config = {
            inputId: 'autocomplete-concierge-inputField',
            collection: 'seattleu~sp-search',
            profile: '_default',
            maxResults: 10,
            minLength: 3,
            ...config
        };
        
        this.inputField = document.getElementById(this.config.inputId);
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.id = 'autocomplete-suggestions';
        this.suggestionsContainer.className = 'suggestions-container';
        this.debounceTimeout = null;
        this.proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback/suggest';
        
        this.#init();
    }

    /**
     * Initializes the autocomplete functionality.
     * Sets up event listeners and DOM elements.
     * 
     * @private
     * @throws {Error} If input field is not found in DOM
     */
    #init() {
        if (!this.inputField) {
            console.error('Autocomplete input field not found');
            return;
        }

        this.inputField.parentNode.insertBefore(
            this.suggestionsContainer, 
            this.inputField.nextSibling
        );

        this.inputField.addEventListener('input', this.#handleInput.bind(this));
        this.inputField.addEventListener('keydown', this.#handleKeydown.bind(this));
        document.addEventListener('click', this.#handleClickOutside.bind(this));
    }

    /**
     * Handles input events with debouncing.
     * Triggers suggestion fetching after user stops typing.
     * 
     * @private
     * @param {InputEvent} event - The input event object
     */
    #handleInput(event) {
        clearTimeout(this.debounceTimeout);
        const query = event.target.value.trim();

        if (query.length < this.config.minLength) {
            this.suggestionsContainer.innerHTML = '';
            return;
        }

        this.debounceTimeout = setTimeout(() => {
            this.#fetchSuggestions(query);
        }, 300);
    }

    /**
     * Fetches suggestions from the Funnelback API via proxy.
     * 
     * @private
     * @param {string} query - The search query
     * @returns {Promise<void>}
     */
    async #fetchSuggestions(query) {
        try {
            const params = new URLSearchParams({
                collection: this.config.collection,
                partial_query: query,
                show: this.config.maxResults,
                profile: this.config.profile
            });

            const response = await fetch(`${this.proxyUrl}?${params}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const suggestions = await response.json();
            this.#displaySuggestions(suggestions);
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Displays suggestions in the dropdown container.
     * Creates clickable suggestion items with event handlers.
     * 
     * @private
     * @param {Array<Object>} suggestions - Array of suggestion objects
     */
    #displaySuggestions(suggestions) {
        if (!suggestions?.length) {
            this.suggestionsContainer.innerHTML = '';
            return;
        }

        const suggestionsList = suggestions.map(suggestion => `
            <div class="suggestion-item" role="option">
                ${suggestion.display ?? suggestion}
            </div>
        `).join('');

        this.suggestionsContainer.innerHTML = `
            <div class="suggestions-list" role="listbox">
                ${suggestionsList}
            </div>
        `;

        this.suggestionsContainer.querySelectorAll('.suggestion-item')
            .forEach((item, index) => {
                item.addEventListener('click', async () => {
                    const selectedValue = suggestions[index].display ?? suggestions[index];
                    this.inputField.value = selectedValue;
                    this.suggestionsContainer.innerHTML = '';
                    
                    const searchParams = new URLSearchParams({
                        query: selectedValue,
                        collection: this.config.collection,
                        profile: this.config.profile,
                        form: 'partial'
                    });

                    try {
                        const response = await fetch(`https://funnelback-proxy.vercel.app/proxy/funnelback/search?${searchParams}`);
                        if (!response.ok) throw new Error(`Error: ${response.status}`);
                        
                        const text = await response.text();
                        const resultsContainer = document.getElementById('results');
                        if (resultsContainer) {
                            resultsContainer.innerHTML = `
                                <div id="funnelback-search-container-response" class="funnelback-search-container">
                                    ${text}
                                </div>
                            `;
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
                });
            });
    }

    /**
     * Handles keyboard navigation within suggestions.
     * Supports arrow keys, enter, and escape.
     * 
     * @private
     * @param {KeyboardEvent} event - The keyboard event object
     */
    #handleKeydown(event) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeItem = this.suggestionsContainer.querySelector('.suggestion-item.active');
        let newActiveItem;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!activeItem) {
                    items[0]?.classList.add('active');
                } else {
                    const nextItem = activeItem.nextElementSibling;
                    if (nextItem) {
                        activeItem.classList.remove('active');
                        nextItem.classList.add('active');
                    }
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (activeItem) {
                    const prevItem = activeItem.previousElementSibling;
                    if (prevItem) {
                        activeItem.classList.remove('active');
                        prevItem.classList.add('active');
                    }
                }
                break;

            case 'Enter':
                if (activeItem) {
                    event.preventDefault();
                    const selectedValue = activeItem.textContent.trim();
                    this.inputField.value = selectedValue;
                    this.suggestionsContainer.innerHTML = '';
                    
                    const searchParams = new URLSearchParams({
                        query: selectedValue,
                        collection: this.config.collection,
                        profile: this.config.profile,
                        form: 'partial'
                    });

                    (async () => {
                        try {
                            const response = await fetch(`https://funnelback-proxy.vercel.app/proxy/funnelback/search?${searchParams}`);
                            if (!response.ok) throw new Error(`Error: ${response.status}`);
                            
                            const text = await response.text();
                            const resultsContainer = document.getElementById('results');
                            if (resultsContainer) {
                                resultsContainer.innerHTML = `
                                    <div id="funnelback-search-container-response" class="funnelback-search-container">
                                        ${text}
                                    </div>
                                `;
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
                    })();
                }
                break;

            case 'Escape':
                this.suggestionsContainer.innerHTML = '';
                break;
        }
    }

    /**
     * Handles clicks outside the autocomplete component.
     * Closes the suggestions dropdown when clicking elsewhere.
     * 
     * @private
     * @param {MouseEvent} event - The click event object
     */
    #handleClickOutside(event) {
        if (!this.inputField.contains(event.target) && 
            !this.suggestionsContainer.contains(event.target)) {
            this.suggestionsContainer.innerHTML = '';
        }
    }
}

// Export for use in other modules
export default AutocompleteSearchManager;