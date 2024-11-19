// Get the search query from the input field
document.addEventListener("DOMContentLoaded", function() {

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');


function performPostSearch(query) {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('collection', 'seattleu~sp-search');
    formData.append('profile', '_default');


    let ipAddress = '';
    // document.addEventListener("DOMContentLoaded", function() {
        // Fetch the IP address from the API
        fetch("https://ipinfo.io/json") 
            .then(response => response.json())
            .then(data => {
                // log the ip
                console.log("X-Forwarded-For: " + data.ip);
                ipAddress = data.ip;

            })
            .catch(error => {
                console.error("Error fetching IP address:", error);
                // document.getElementById("ip-address").textContent = 
                //       "Unable to retrieve IP address.";
            });
        // });
    

    fetch('https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html', {
        method: 'POST',
        body: formData,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-For:': ipAddress,
        },
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
        // Process the search results
        console.log(data);
        })
        .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        });
}




function performSearch(query) {
    const searchUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html?collection=seattleu~sp-search&profile=_default&query=' + encodeURIComponent(query);

    fetch(searchUrl)
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
        // Process the search results
        console.log(data);
        performPostSearch(query);
        })
        .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        });
}



searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    console.log("search input" + query)
    performSearch(query);
});

});