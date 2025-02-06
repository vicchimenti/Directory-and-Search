/**
 * @fileoverview Autocomplete Search Manager for Funnelback Integration
 * Provides real-time search suggestions as users type
 */

class AutocompleteSearchManager {
    constructor() {
        this.inputField = document.getElementById('autocomplete-concierge-inputField');
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.id = 'autocomplete-suggestions';
        this.suggestionsContainer.className = 'suggestions-container';
        this.debounceTimeout = null;
        this.proxyUrl = 'https://funnelback-proxy.vercel.app/proxy/funnelback/suggest';
        
        this.#init();
    }

    /**
     * Initialize the autocomplete functionality
     * @private
     */
    #init() {
        if (!this.inputField) {
            console.error('Autocomplete input field not found');
            return;
        }

        // Insert suggestions container after input field
        this.inputField.parentNode.insertBefore(
            this.suggestionsContainer, 
            this.inputField.nextSibling
        );

        // Setup event listeners
        this.inputField.addEventListener('input', this.#handleInput.bind(this));
        this.inputField.addEventListener('keydown', this.#handleKeydown.bind(this));
        document.addEventListener('click', this.#handleClickOutside.bind(this));
    }

    /**
     * Handle input events with debouncing
     * @private
     * @param {Event} event 
     */
    #handleInput(event) {
        clearTimeout(this.debounceTimeout);
        const query = event.target.value.trim();

        if (query.length < 2) {
            this.suggestionsContainer.innerHTML = '';
            return;
        }

        this.debounceTimeout = setTimeout(() => {
            this.#fetchSuggestions(query);
        }, 300);
    }

    /**
     * Fetch suggestions from the proxy endpoint
     * @private
     * @param {string} query 
     */
    async #fetchSuggestions(query) {
        try {
            const params = new URLSearchParams({
                collection: 'seattleu~sp-search',
                partial_query: query,
                show: 5
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

        // Add click handlers to suggestions
        this.suggestionsContainer.querySelectorAll('.suggestion-item')
            .forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.inputField.value = suggestions[index].display ?? suggestions[index];
                    this.suggestionsContainer.innerHTML = '';
                    // Trigger search if needed
                    document.getElementById('on-page-search-button')?.click();
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
                    this.inputField.value = activeItem.textContent.trim();
                    this.suggestionsContainer.innerHTML = '';
                    document.getElementById('on-page-search-button')?.click();
                }
                break;

            case 'Escape':
                this.suggestionsContainer.innerHTML = '';
                break;
        }
    }

    /**
     * Handle clicks outside the autocomplete component
     * @private
     * @param {Event} event 
     */
    #handleClickOutside(event) {
        if (!this.inputField.contains(event.target) && 
            !this.suggestionsContainer.contains(event.target)) {
            this.suggestionsContainer.innerHTML = '';
        }
    }
}

// Initialize autocomplete manager
const autocompleteSearch = new AutocompleteSearchManager();
export default autocompleteSearch;