/**
 * @fileoverview Header Search Manager for Funnelback Search Integration
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
 * 
 * Dependencies:
 * - Requires DOM elements with specific IDs:
 *   - 'search-button': The search submission button
 *   - 'search-input': The search input field
 * - Works in conjunction with ResultsSearchManager class
 * 
 * Related Files:
 * - results-search-manager.js: Handles the actual Funnelback API calls
 * 
 * @author Victor Chimenti
 * @version 1.1.2
 * @lastModified 2025-02-02
 */

class HeaderSearchManager {
    /**
     * Initializes the Header Search Manager.
     * Sets up event listeners for the search functionality.
     * 
     * @throws {Error} If required DOM elements are not found (error will be caught internally)
     */
    constructor() {
        this.#setupHeaderSearch();
    }

    /**
     * Sets up the event listener for the header search button.
     * This is a private method as it's only used internally during initialization.
     * 
     * @private
     * @throws {Error} If search button element is not found (error will be caught internally)
     */
    #setupHeaderSearch() {
        const searchBar = document.getElementById("search-button");
        if (searchBar) {
            searchBar.addEventListener('click', this.#handleHeaderSearch);
        } else {
            console.warn('Search button not found in DOM');
        }
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
    #handleHeaderSearch = async(event) => {
        event.preventDefault();
        const searchQuery = document.getElementById('search-input')?.value;
        
        // Validate search input
        if (!searchQuery?.trim()) {
            alert('Please enter a search term');
            return;
        }

        // Construct search URL with parameters for ResultsSearchManager
        const searchParams = new URLSearchParams({
            query: searchQuery,
            collection: 'seattleu~sp-search',
            profile: '_default'
        });

        // Redirect to results page where ResultsSearchManager will handle the search
        const redirectUrl = `/search-test/?${searchParams.toString()}`;
        window.location.href = redirectUrl;
    }
}

// Initialize header search singleton instance
const headerSearch = new HeaderSearchManager();