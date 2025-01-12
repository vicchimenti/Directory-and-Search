class HeaderSearchManager {
    constructor() {
        this.setupHeaderSearch();
    }

    setupHeaderSearch() {
        const searchBar = document.getElementById("search-button");
        if (searchBar) {
            searchBar.addEventListener('click', this.handleHeaderSearch);
        }
    }

    handleHeaderSearch = async(event) => {
        event.preventDefault();
        const searchQuery = document.getElementById('search-input')?.value;
        
        if (!searchQuery?.trim()) {
            alert('Please enter a search term');
            return;
        }

        const redirectUrl = `/search-test/?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default`;
        window.location.href = redirectUrl;
    }
}

// Initialize header search
const headerSearch = new HeaderSearchManager();