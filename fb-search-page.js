// capture search bar and globaldeclarations
const onPageSearch = document.getElementById("on-page-search-button");
let onPageUserIpAddress = null;
let onPageUserIp = null;
console.log("onpageSearch: " + onPageSearch);

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
    onPageUserIp = await getUserIP();
    onPageUserIpAddress = JSON.stringify(onPageUserIp);
    console.log("onpage userIpAddress: " + onPageUserIpAddress);

    // Check for URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearchQuery = urlParams.get('query');

    // If there's a URL query, perform the search
    if (urlSearchQuery) {
        // Populate search input field
        const searchInputField = document.getElementById('on-page-search-input');
        if (searchInputField) {
            searchInputField.value = urlSearchQuery;
        }

        // Trigger search
        await performFunnelbackSearch(urlSearchQuery);
    }
});

// Funnelback fetch search page input function
async function fetchFunnelbackSearchPageQuery(url, method, searchQuery) {
    console.log("fetchFunnelbackSearchPageQuery");

    try {
        if (method === 'GET' && searchQuery) {
            url += `?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
        }

        let options = {
            method,
            headers: {
                'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
            },
        };

        let response = await fetch(url, options);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        let stream = response.body.pipeThrough(new TextDecoderStream());
        let reader = stream.getReader();
        let text = "";

        try {
            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }
                text += value;
            }

        } catch (error) {
            console.error("Error reading stream:", error);
        } finally {
            reader.releaseLock();
        }

        return text;

    } catch (error) {
        console.error(`Error with ${method} request:`, error);
        return `<p>Error fetching ${method} request. Please try again later.</p>`;
    }
}

// Centralized search function
async function performFunnelbackSearch(searchQuery) {
    console.log("onpage searchQuery: " + searchQuery);
    let prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';

    // Show loading indicator
    // document.getElementById('results').innerHTML = '<div class="loading">Searching...</div>';

    try {
        let getOnPageResponse = await fetchFunnelbackSearchPageQuery(prodOnPageSearchUrl, 'GET', searchQuery);

        document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">${getOnPageResponse}</div>
    `;
    } catch (error) {
        document.getElementById('results').innerHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't complete your search. ${error.message}</p>
      </div>
    `;
    }
}

// Handle on page search bar submission
onPageSearch.addEventListener('click', async(event) => {
    event.preventDefault();

    let searchQuery = document.getElementById('on-page-search-input').value;
    await performFunnelbackSearch(searchQuery);
});