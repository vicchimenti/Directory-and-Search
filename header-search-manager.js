/**
 * @fileoverview Header Search Manager
 * 
 * This class manages the header search functionality, capturing user input
 * and redirecting to the search results page. It works in conjunction with
 * ResultsSearchManager which handles the actual search execution.
 * 
 * @author [Your Name]
 * @version 1.0.0
 * @lastModified 2025-02-02
 */

class HeaderSearchManager {
    /**
     * Initializes the Header Search Manager and sets up event listeners
     */
    constructor() {
        this.#setupHeaderSearch();
    }

    /**
     * Sets up the event listener for the header search button
     */
    #setupHeaderSearch() {
        const searchBar = document.getElementById("search-button");
        if (searchBar) {
            searchBar.addEventListener('click', this.#handleHeaderSearch);
        }
    }

    /**
     * Handles the header search button click.
     * Validates input and redirects to search results page.
     * 
     * @param {Event} event - The click event object
     */
    #handleHeaderSearch = async(event) => {
        event.preventDefault();
        const searchQuery = document.getElementById('search-input')?.value;
        
        if (!searchQuery?.trim()) {
            alert('Please enter a search term');
            return;
        }

        // Redirect to results page where ResultsSearchManager will handle the actual search
        const redirectUrl = `/search-test/?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default`;
        window.location.href = redirectUrl;
    }
}

// Initialize header search
const headerSearch = new HeaderSearchManager();