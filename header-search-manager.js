class HeaderSearchManager {
    constructor() {
        this.setupHeaderSearch();
        this.initializeIP();
    }

    setupHeaderSearch() {
        const searchBar = document.getElementById("search-button");
        if (searchBar) {
            searchBar.addEventListener('click', this.handleHeaderSearch);
        }
    }

    async initializeIP() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            this.userIp = data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.userIp = '';
        }
    }

    handleHeaderSearch = async(event) => {
        event.preventDefault();
        const searchQuery = document.getElementById('search-input')?.value;
        
        if (!searchQuery?.trim()) {
            alert('Please enter a search term');
            return;
        }

        // Add the IP to the request headers
        const headers = new Headers();
        headers.append('X-Forwarded-For', this.userIp);

        const redirectUrl = `/search-test/?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default`;
        window.location.href = redirectUrl;
    }
}

// Initialize header search
const headerSearch = new HeaderSearchManager();