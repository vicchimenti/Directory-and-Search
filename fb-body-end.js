

// capture search bar and globaldeclarations
const searchBar = document.getElementById("search-button");
let userIpAddress = null;
let userIp = null;

// gather user ip method
async function getUserIP() {
    try {
        let response = await fetch('https://api.ipify.org?format=json');
        let data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return ''; // Default to empty if error occurs
    }
}

// Fetch user's IP address
document.addEventListener('DOMContentLoaded', async function() {
    userIp = await getUserIP();
    userIpAddress = JSON.stringify(userIp);
});

// Send Get Request with search bar input query and redirect
async function fetchAndRedirectSearch(searchQuery) {
    // Validate search query
    if (!searchQuery || !searchQuery.trim()) {
        alert('Please enter a search term');
        return;
    }

    // Construct the redirect URL with the search query
    const redirectUrl = `/search-test/?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default`;

    // Redirect to the search results page
    window.location.href = redirectUrl;
}

// Handle search bar submission
searchBar.addEventListener('click', async(event) => {
    event.preventDefault();

    let searchQuery = document.getElementById('search-input').value;

    // Call the redirect function
    await fetchAndRedirectSearch(searchQuery);
});
