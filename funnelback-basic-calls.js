async function handleFunnelbackRequest(method, queryParams) {
    const funnelbackEndpoint = "https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html?collection=seattleu~sp-search&profile=_default&form=partial"; // Replace with your Funnelback endpoint
  
    let url = funnelbackEndpoint;
    if (method === 'GET') {
      url += '?' + new URLSearchParams(queryParams).toString();
    }

    let ipAddress = '';
    document.addEventListener("DOMContentLoaded", function() {
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
                document.getElementById("ip-address").textContent = 
                      "Unable to retrieve IP address.";
            });
    });
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Forwarded-For:': ipAddress,
        },
        body: method === 'POST' ? new URLSearchParams(queryParams) : null,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
  // Example usage for GET
  const queryParamsGet = {
    profile: '_default',
    collection: 'seattleu~sp-search',
    query: 'search term',
  };
  handleFunnelbackRequest('GET', queryParamsGet)
    .then(data => {
      // Process the returned HTML fragment
      console.log(data);
    });
  
  // Example usage for POST
  const queryParamsPost = {
    profile: '_default',
    collection: 'seattleu~sp-search',
    query: 'search term',
    // Add more parameters as needed
  };
  handleFunnelbackRequest('POST', queryParamsPost)
    .then(data => {
      // Process the returned HTML fragment
      console.log(data);
    });