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
 * @version 1.1.0
 * @lastModified 2025-02-06
 */

class AutocompleteSearchManager {
    /**
     * Creates an instance of AutocompleteSearchManager
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            inputId: 'autocomplete-concierge-inputField',
            collection: 'seattleu~sp-search',
            profile: '_default',
            maxResults: 10,
            minLength: 3,
            // Separate endpoints for autocomplete and search
            endpoints: {
                suggest: 'https://funnelback-proxy.vercel.app/proxy/funnelback/suggest',
                search: 'https://funnelback-proxy.vercel.app/proxy/funnelback/search'
            },
            ...config
        };

        // Initialize DOM elements
        this.inputField = document.getElementById(this.config.inputId);
        if (!this.inputField) {
            console.error('Search input field not found');
            return;
        }

        this.form = this.inputField.closest('form');
        if (!this.form) {
            console.error('Search form not found');
            return;
        }

        // Get existing elements
        this.clearButton = this.form.querySelector('.clear-search-button');
        this.submitButton = this.form.querySelector('#on-page-search-button');
        this.suggestionsContainer = document.getElementById('autocomplete-suggestions');
        this.resultsContainer = document.getElementById('results');

        this.debounceTimeout = null;
        this.isLoading = false;

        this.#init();
    }

    /**
     * Initialize the manager
     * @private
     */
    #init() {
        // Set up input event listeners
        this.inputField.addEventListener('input', this.#handleInput.bind(this));
        this.inputField.addEventListener('keydown', this.#handleKeydown.bind(this));
        
        // Form submission handling
        this.form.addEventListener('submit', this.#handleFormSubmit.bind(this));
        
        // Clear button functionality
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.#clearSearch();
            });
        }

        // Outside click handling
        document.addEventListener('click', this.#handleClickOutside.bind(this));

        // Initial state
        this.#updateButtonStates();
    }

    /**
     * Clear search and reset state
     * @private
     */
    #clearSearch() {
        this.inputField.value = '';
        this.suggestionsContainer.innerHTML = '';
        this.inputField.focus();
        this.#updateButtonStates();
    }

    /**
     * Update clear and submit button states
     * @private
     */
    #updateButtonStates() {
        const hasValue = this.inputField.value.trim().length > 0;
        
        if (this.clearButton) {
            this.clearButton.classList.toggle('hidden', !hasValue);
        }
        
        if (this.submitButton) {
            this.submitButton.disabled = !hasValue;
        }
    }

    /**
     * Handle form submission
     * @private
     * @param {Event} event 
     */
    async #handleFormSubmit(event) {
        event.preventDefault();
        const query = this.inputField.value.trim();
        
        if (!query) return;

        try {
            this.isLoading = true;
            this.#updateLoadingState(true);
            await this.#performSearch(query);
        } catch (error) {
            console.error('Search failed:', error);
            this.#showError('Search failed. Please try again.');
        } finally {
            this.isLoading = false;
            this.#updateLoadingState(false);
        }
    }

    /**
     * Handle input events with debouncing
     * @private
     * @param {Event} event 
     */
    #handleInput(event) {
        this.#updateButtonStates();
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
     * Fetch suggestions from the suggest endpoint
     * @private
     * @param {string} query 
     */
    async #fetchSuggestions(query) {
        try {
            const params = new URLSearchParams({
                collection: this.config.collection,
                partial_query: query,
                show: this.config.maxResults,
                profile: this.config.profile
            });

            const response = await fetch(`${this.config.endpoints.suggest}?${params}`);
            if (!response.ok) throw new Error(`Suggestions failed: ${response.status}`);

            const suggestions = await response.json();
            this.#displaySuggestions(suggestions);
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Perform search using the search endpoint
     * @private
     * @param {string} query 
     */
    async #performSearch(query) {
        const params = new URLSearchParams({
            query: query,
            collection: this.config.collection,
            profile: this.config.profile,
            form: 'partial'
        });

        const response = await fetch(`${this.config.endpoints.search}?${params}`);
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        
        const text = await response.text();
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `
                <div id="funnelback-search-container-response" class="funnelback-search-container">
                    ${text}
                </div>
            `;
        }
    }

    /**
     * Display suggestions in the dropdown
     * @private
     * @param {Array} suggestions 
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
        this.suggestionsContainer.hidden = false;

        // Add click handlers
        this.suggestionsContainer.querySelectorAll('.suggestion-item')
            .forEach((item, index) => {
                item.addEventListener('click', async () => {
                    const selectedValue = suggestions[index].display ?? suggestions[index];
                    this.inputField.value = selectedValue;
                    this.suggestionsContainer.innerHTML = '';
                    this.#updateButtonStates();
                    await this.#performSearch(selectedValue);
                });
            });
    }

    /**
     * Handle keyboard navigation
     * @private
     * @param {KeyboardEvent} event 
     */
    #handleKeydown(event) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeItem = this.suggestionsContainer.querySelector('.suggestion-item.active');

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
                    this.#updateButtonStates();
                    this.#performSearch(selectedValue);
                }
                break;

            case 'Escape':
                this.suggestionsContainer.innerHTML = '';
                this.inputField.blur();
                break;
        }
    }

    /**
     * Handle clicks outside the component
     * @private
     * @param {MouseEvent} event 
     */
    #handleClickOutside(event) {
        if (!this.inputField.contains(event.target) && 
            !this.suggestionsContainer.contains(event.target)) {
            this.suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Update loading state UI
     * @private
     * @param {boolean} isLoading 
     */
    #updateLoadingState(isLoading) {
        this.submitButton?.classList.toggle('loading', isLoading);
        this.inputField.disabled = isLoading;
        if (this.clearButton) {
            this.clearButton.disabled = isLoading;
        }
    }

    /**
     * Show error message
     * @private
     * @param {string} message 
     */
    #showError(message) {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Initialize autocomplete on all matching elements
     * @static
     */
    static bindToElements() {
        const elements = document.querySelectorAll('[data-autocomplete]');
        elements.forEach(element => {
            const config = {
                inputId: element.id,
                collection: element.dataset.collection || 'seattleu~sp-search',
                profile: element.dataset.profile || '_default',
                maxResults: parseInt(element.dataset.maxResults, 10) || 10,
                minLength: parseInt(element.dataset.minLength, 10) || 3
            };
            new AutocompleteSearchManager(config);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AutocompleteSearchManager.bindToElements();
});

export default AutocompleteSearchManager;
