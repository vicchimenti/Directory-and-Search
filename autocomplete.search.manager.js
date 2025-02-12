/**
 * @fileoverview Autocomplete Search Manager for Funnelback Search Integration
 * 
 * This class manages real-time search suggestions functionality, integrating with
 * Funnelback search services via a proxy server. It provides typeahead suggestions
 * as users type in the search input field and handles suggestion selection with
 * immediate search results display.
 * 
 * The manager provides a streamlined, single-column layout for displaying search
 * suggestions optimized for quick selection and a focused user experience.
 * 
 * Features:
 * - Real-time suggestions with smart filtering
 * - Streamlined search integration
 * - Clean, unified suggestions display
 * - Efficient data handling
 * - Debounced API calls to prevent request flooding
 * - Keyboard navigation support (up/down arrows, enter, escape)
 * - Click selection support
 * - Accessible ARIA attributes
 * - Configurable parameters (collection, profile, result count, etc.)
 * - Direct integration with Funnelback search API
 * - Loading states and error handling
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
 * @example
 * const autocomplete = new AutocompleteSearchManager({
 *   inputId: 'my-search-input',
 *   collection: 'my-collection',
 *   maxResults: 5,
 *   minLength: 2
 * });
 * 
 * @author Victor Chimenti
 * @version 1.6.0
 * @lastModified 2025-02-12
 */

class AutocompleteSearchManager {
    /**
     * Creates an instance of AutocompleteSearchManager.
     * Initializes the search interface with default or provided configuration.
     * Sets up DOM elements and event listeners.
     * 
     * @param {AutocompleteConfig} [config={}] - Configuration options
     * @throws {Error} If required DOM elements are not found
     */
    constructor(config = {}) {
        console.group('AutocompleteSearchManager Initialization');
        console.log('Configuration:', config);

        this.config = {
            inputId: 'autocomplete-concierge-inputField',
            collection: 'seattleu~sp-search',
            profile: '_default',
            maxResults: 10,
            minLength: 3,
            staffLimit: 3,
            programLimit: 5,
            endpoints: {
                suggest: 'https://funnelback-proxy.vercel.app/proxy/funnelback/suggest',
                search: 'https://funnelback-proxy.vercel.app/proxy/funnelback/search'
            },
            ...config
        };
        
        // Initialize DOM elements
        this.inputField = document.getElementById(this.config.inputId);
        if (!this.inputField) {
            console.error('🚫 Search input field not found:', this.config.inputId);
            console.groupEnd();
            return;
        }

        this.form = this.inputField.closest('form');
        if (!this.form) {
            console.error('🚫 Search form not found');
            console.groupEnd();
            return;
        }

        // Get existing elements
        this.clearButton = this.form.querySelector('.clear-search-button');
        this.submitButton = this.form.querySelector('#on-page-search-button');
        this.suggestionsContainer = document.getElementById('autocomplete-suggestions');
        this.resultsContainer = document.getElementById('results');

        console.log('DOM Elements:', {
            clearButton: this.clearButton ? '✓' : '✗',
            submitButton: this.submitButton ? '✓' : '✗',
            suggestionsContainer: this.suggestionsContainer ? '✓' : '✗',
            resultsContainer: this.resultsContainer ? '✓' : '✗'
        });

        this.debounceTimeout = null;
        this.isLoading = false;

        this.#init();
        console.groupEnd();
    }

    /**
     * Initializes the autocomplete functionality.
     * Sets up event listeners for input, form submission, and UI interactions.
     * 
     * @private
     */
    #init() {
        console.log('Initializing event listeners');
        
        this.inputField.addEventListener('input', this.#handleInput.bind(this));
        this.inputField.addEventListener('keydown', this.#handleKeydown.bind(this));
        this.form.addEventListener('submit', this.#handleFormSubmit.bind(this));
        
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => this.#clearSearch());
        }

        document.addEventListener('click', this.#handleClickOutside.bind(this));
        this.#updateButtonStates();
    }

    /**
     * Clears the search input and resets the UI state.
     * 
     * @private
     */
    #clearSearch() {
        console.log('Clearing search');
        this.inputField.value = '';
        this.suggestionsContainer.innerHTML = '';
        this.inputField.focus();
        this.#updateButtonStates();
    }

    /**
     * Updates the visibility and state of clear and submit buttons
     * based on input field value.
     * 
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
     * Handles form submission events.
     * Prevents default form submission and triggers search via API.
     * 
     * @private
     * @param {Event} event - The form submit event
     */
    async #handleFormSubmit(event) {
        console.group('Form Submit');
        console.time('totalSubmitTime');
        
        event.preventDefault();
        const query = this.inputField.value.trim();
        
        console.log('Submit Query:', query);
        
        if (!query) {
            console.log('Empty query, submission canceled');
            console.groupEnd();
            return;
        }

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
            console.timeEnd('totalSubmitTime');
            console.groupEnd();
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
        console.group('Input Event');
        const query = event.target.value.trim();
        console.log(`Input Value: "${query}" (length: ${query.length})`);
        
        this.#updateButtonStates();
        clearTimeout(this.debounceTimeout);
        
        if (query.length < this.config.minLength) {
            console.log(`Query too short (${query.length} < ${this.config.minLength}), clearing suggestions`);
            this.suggestionsContainer.innerHTML = '';
            console.groupEnd();
            return;
        }
    
        // Immediate check for exact length match
        if (query.length === this.config.minLength) {
            console.log('Exact minimum length match, fetching immediately');
            this.#fetchSuggestions(query);
            console.groupEnd();
            return;
        }
    
        // Debounce for longer queries
        console.log('Setting debounce timer for query');
        this.debounceTimeout = setTimeout(() => {
            this.#fetchSuggestions(query);
        }, 200);
        
        console.groupEnd();
    }

    /**
     * Fetches search suggestions and results for all columns
     * @private
     * @param {string} query - The search query
     */
    async #fetchSuggestions(query) {
        try {
            // Fetch suggestions
            const suggestParams = new URLSearchParams({
                collection: this.config.collection,
                partial_query: query,
                profile: this.config.profile
            });
            
            // Fetch actual search results for staff and programs
            const searchParams = new URLSearchParams({
                query: query,
                collection: this.config.collection,
                profile: this.config.profile,
                form: 'partial'
            });

            const [suggestResponse, searchResponse] = await Promise.all([
                fetch(`${this.config.endpoints.suggest}?${suggestParams}`),
                fetch(`${this.config.endpoints.search}?${searchParams}`)
            ]);

            const suggestions = await suggestResponse.json();
            const searchResults = await searchResponse.text();

            // Parse the search results HTML to extract staff and program results
            const parser = new DOMParser();
            const doc = parser.parseFromString(searchResults, 'text/html');

            // Extract staff profiles (adjust selectors based on your HTML structure)
            const staffResults = Array.from(doc.querySelectorAll('.staff-profile-result'))
                .slice(0, this.config.staffLimit)
                .map(element => ({
                    title: element.querySelector('.profile-name')?.textContent,
                    role: element.querySelector('.profile-title')?.textContent,
                    url: element.querySelector('a')?.href
                }));

            // Extract program results (adjust selectors based on your HTML structure)
            const programResults = Array.from(doc.querySelectorAll('.program-result'))
                .slice(0, this.config.programLimit)
                .map(element => ({
                    title: element.querySelector('.program-title')?.textContent,
                    description: element.querySelector('.program-description')?.textContent,
                    url: element.querySelector('a')?.href
                }));

            this.#displaySuggestions(suggestions, staffResults, programResults);
        } catch (error) {
            console.error('Fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Performs a search using the Funnelback API.
     * 
     * @private
     * @param {string} query - The search query
     * @throws {Error} If the search request fails
     */
    async #performSearch(query) {
        console.group(`Performing search for: "${query}"`);
        console.time('searchRequest');

        const params = new URLSearchParams({
            query: query,
            collection: this.config.collection,
            profile: this.config.profile,
            form: 'partial'
        });

        try {
            const url = `${this.config.endpoints.search}?${params}`;
            console.log('Search URL:', url);
            console.log('Search Parameters:', Object.fromEntries(params));

            const response = await fetch(url);
            console.log('Search Response Status:', response.status);
            
            if (!response.ok) throw new Error(`Search failed: ${response.status}`);
            
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
            throw error;
        } finally {
            console.timeEnd('searchRequest');
            console.groupEnd();
        }
    }

    /**
     * Displays suggestions in a three-column layout
     * @private
     * @param {Array} suggestions - Array of suggestion objects
     * @param {Array} staffResults - Array of staff profile results
     * @param {Array} programResults - Array of program results
     */
    #displaySuggestions(suggestions, staffResults, programResults) {
        if (!this.suggestionsContainer) {
            return;
        }

        const suggestionHTML = `
            <div class="suggestions-list" role="listbox">
                <div class="suggestions-column">
                    <div class="column-header">Suggestions</div>
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item" role="option" data-type="suggestion">
                            <span class="suggestion-text">${suggestion.display || ''}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="suggestions-column">
                    <div class="column-header">Faculty & Staff</div>
                    ${staffResults.map(staff => `
                        <div class="suggestion-item" role="option" data-type="staff" data-url="${staff.url || ''}">
                            <div class="staff-suggestion">
                                <span class="suggestion-text">${staff.title || ''}</span>
                                ${staff.role ? `<span class="staff-role">${staff.role}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="suggestions-column">
                    <div class="column-header">Programs</div>
                    ${programResults.map(program => `
                        <div class="suggestion-item" role="option" data-type="program" data-url="${program.url || ''}">
                            <div class="program-suggestion">
                                <span class="suggestion-text">${program.title || ''}</span>
                                ${program.description ? `
                                    <span class="program-description">${program.description}</span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.suggestionsContainer.innerHTML = suggestionHTML;
        this.suggestionsContainer.hidden = false;

        // Add click handlers
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item) => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const url = item.dataset.url;
                
                if (type === 'suggestion') {
                    const selectedText = item.querySelector('.suggestion-text').textContent;
                    this.inputField.value = selectedText;
                    this.suggestionsContainer.innerHTML = '';
                    this.#updateButtonStates();
                    this.#performSearch(selectedText);
                } else if (url) {
                    // Navigate to the URL for staff and program results
                    window.location.href = url;
                }
            });
        });
    }


    /**
     * Handles keyboard navigation within suggestions.
     * Supports arrow keys, enter, and escape.
     * Handles navigation across columns.
     * 
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    #handleKeydown(event) {
        const columns = this.suggestionsContainer.querySelectorAll('.suggestions-column');
        const activeItem = this.suggestionsContainer.querySelector('.suggestion-item.active');
        let currentColumn, currentIndex;
    
        if (activeItem) {
            currentColumn = activeItem.closest('.suggestions-column');
            currentIndex = Array.from(currentColumn.querySelectorAll('.suggestion-item'))
                .indexOf(activeItem);
        }
    
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!activeItem) {
                    // Select first item in first column with items
                    for (const column of columns) {
                        const firstItem = column.querySelector('.suggestion-item');
                        if (firstItem) {
                            firstItem.classList.add('active');
                            break;
                        }
                    }
                } else {
                    const columnItems = currentColumn.querySelectorAll('.suggestion-item');
                    if (currentIndex < columnItems.length - 1) {
                        // Move down within column
                        activeItem.classList.remove('active');
                        columnItems[currentIndex + 1].classList.add('active');
                    }
                }
                break;
    
            case 'ArrowUp':
                event.preventDefault();
                if (activeItem) {
                    const columnItems = currentColumn.querySelectorAll('.suggestion-item');
                    if (currentIndex > 0) {
                        // Move up within column
                        activeItem.classList.remove('active');
                        columnItems[currentIndex - 1].classList.add('active');
                    }
                }
                break;
    
            case 'ArrowRight':
                event.preventDefault();
                if (activeItem) {
                    const nextColumn = currentColumn.nextElementSibling;
                    if (nextColumn) {
                        const nextColumnItems = nextColumn.querySelectorAll('.suggestion-item');
                        if (nextColumnItems.length > 0) {
                            // Move to next column, try to maintain similar position
                            activeItem.classList.remove('active');
                            const nextIndex = Math.min(currentIndex, nextColumnItems.length - 1);
                            nextColumnItems[nextIndex].classList.add('active');
                        }
                    }
                }
                break;
    
            case 'ArrowLeft':
                event.preventDefault();
                if (activeItem) {
                    const prevColumn = currentColumn.previousElementSibling;
                    if (prevColumn) {
                        const prevColumnItems = prevColumn.querySelectorAll('.suggestion-item');
                        if (prevColumnItems.length > 0) {
                            // Move to previous column, try to maintain similar position
                            activeItem.classList.remove('active');
                            const prevIndex = Math.min(currentIndex, prevColumnItems.length - 1);
                            prevColumnItems[prevIndex].classList.add('active');
                        }
                    }
                }
                break;
    
            case 'Enter':
                if (activeItem) {
                    event.preventDefault();
                    const selectedText = activeItem.querySelector('.suggestion-text').textContent;
                    this.inputField.value = selectedText;
                    this.suggestionsContainer.innerHTML = '';
                    this.#updateButtonStates();
                    this.#performSearch(selectedText);
                }
                break;
    
            case 'Escape':
                this.suggestionsContainer.innerHTML = '';
                this.inputField.blur();
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
        if (!this.inputField.contains(event.target) && 
            !this.suggestionsContainer.contains(event.target)) {
            this.suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Updates the UI to reflect loading state.
     * Disables input and buttons during loading.
     * 
     * @private
     * @param {boolean} isLoading - Whether the component is in a loading state
     */
    #updateLoadingState(isLoading) {
        this.submitButton?.classList.toggle('loading', isLoading);
        this.inputField.disabled = isLoading;
        if (this.clearButton) {
            this.clearButton.disabled = isLoading;
        }
    }

    /**
     * Displays an error message in the results container.
     * 
     * @private
     * @param {string} message - The error message to display
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
     * Initializes autocomplete functionality on all matching elements.
     * Looks for elements with the data-autocomplete attribute and applies
     * configuration from data attributes.
     * 
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

// Export the class
export default AutocompleteSearchManager;