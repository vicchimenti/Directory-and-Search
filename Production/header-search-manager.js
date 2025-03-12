/**
 * @fileoverview [PRODUCTION ASSET] Header Search Manager for Funnelback Search Integration
 * 
 * PRODUCTION VERSION - Seattle University search implementation
 * 
 * This class manages the header search functionality of the website. It handles
 * the initial search input capture and redirects to the search results page
 * where ResultsSearchManager will execute the actual Funnelback search.
 * 
 * Features:
 * - Captures search input from header search box
 * - Validates search input
 * - Constructs search URL with appropriate parameters
 * - Redirects to search results page
 * - Simple single-column autocomplete suggestions
 * 
 * Dependencies:
 * - Requires DOM elements with specific IDs:
 *   - 'search-button': The search submission button
 *   - 'search-input': The search input field
 *   - 'header-suggestions': Container for autocomplete suggestions
 * - Works in conjunction with ResultsSearchManager class
 * 
 * Related Files:
 * - results-search-manager.js: Handles the actual Funnelback API calls
 * 
 * @namespace HeaderSearchManager
 * @author Victor Chimenti
 * @version 5.0.0
 * @productionVersion 3.0.1
 * @environment production
 * @status stable
 * @license MIT
 * @lastModified 2025-03-12
 */

class HeaderSearchManager {
    /**
     * Initializes the Header Search Manager.
     * Sets up event listeners for the search functionality and autocomplete.
     * 
     * @param {Object} [config={}] - Configuration options
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor(config = {}) {
        // Default configuration
        this.config = {
            collection: 'seattleu~sp-search',
            profile: '_default',
            minLength: 3,
            maxResults: 8,
            suggestEndpoint: 'https://funnelback-proxy-one.vercel.app/proxy/funnelback/suggest',
            ...config
        };

        // DOM elements
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

        // State
        this.debounceTimeout = null;
        this.isLoading = false;
        
        this.#init();
    }

    /**
     * Initializes the search and autocomplete functionality.
     * Sets up event listeners for input, form submission, and UI interactions.
     * 
     * @private
     */
    #init() {
        // Check for required elements
        if (!this.searchButton) {
            console.warn('Search button not found in DOM');
            return;
        }

        if (!this.searchInput) {
            console.warn('Search input not found in DOM');
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
     * Handles the header search button click event.
     * Validates the search input and redirects to the search results page
     * where ResultsSearchManager will handle the actual search execution.
     * 
     * @private
     * @param {Event} event - The click event object
     * @returns {void}
     * 
     * Search URL Parameters:
     * - query: The user's search term
     * - collection: The Funnelback collection to search
     * - profile: The search profile to use
     */
    #handleHeaderSearch = (event) => {
        event.preventDefault();
        const searchQuery = this.searchInput?.value.trim();
        
        // Validate search input
        if (!searchQuery) {
            alert('Please enter a search term');
            return;
        }

        // Construct search URL with parameters for ResultsSearchManager
        const searchParams = new URLSearchParams({
            query: searchQuery,
            collection: this.config.collection,
            profile: this.config.profile
        });

        // Redirect to results page where ResultsSearchManager will handle the search
        const redirectUrl = `/search/?${searchParams.toString()}`;
        window.location.href = redirectUrl;
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
                profile: this.config.profile
            });

            // Fetch suggestions
            const response = await fetch(`${this.config.suggestEndpoint}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Suggestion request failed: ${response.status}`);
            }

            // Parse response
            const suggestions = await response.json();
            
            // Display results (limited to maxResults)
            this.#displaySuggestions(suggestions.slice(0, this.config.maxResults));
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
            this.suggestionsContainer.hidden = true;
        }
    }

    /**
     * Displays autocomplete suggestions in a simple single-column layout.
     * 
     * @private
     * @param {Array} suggestions - Array of suggestion objects
     */
    #displaySuggestions(suggestions) {
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
                this.searchButton.click();
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
                    this.searchButton.click();
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

// Initialize header search singleton instance
const headerSearch = new HeaderSearchManager();
export default headerSearch;