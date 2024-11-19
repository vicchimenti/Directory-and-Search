    // Fetch user's IP address
    async function getUserIP() {
        try {
          let response = await fetch('https://api.ipify.org?format=json');
          let data = await response.json();
          console.log("getIP: " + data.ip);
          return data.ip;
        } catch (error) {
          console.error('Error fetching IP address:', error);
          return ''; // Default to empty if error occurs
        }
      }
  
      // Funnelback fetch function
      async function fetchFunnelbackWithQuery(url, method, userIP, searchQuery) {

        console.log("async method: " + method);
        try {
          if (method === 'GET' && searchQuery) {
            url += `?query=${encodeURIComponent(searchQuery)}`;
          }
  
          let options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              'X-Forwarded-For': userIP,
            },
          };
  
          if (method === 'POST' && searchQuery) {
            options.body = `query=${encodeURIComponent(searchQuery)}`;
          }
  
          let response = await fetch(url, options);
          if (!response.ok) throw new Error(`Error: ${response.status}`);
  
          let html = await response.text();
          console.log(`${method} Response:`, html);
          return html; // Return the HTML response
        } catch (error) {
          console.error(`Error with ${method} request:`, error);
          return `<p>Error fetching ${method} request. Please try again later.</p>`;
        }
      }
  
      // Handle form submission
      document.getElementById('search-button').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent page reload
        console.log("get element by id: search-button");
  
        let searchQuery = document.getElementById('search-input').value; // Get search query
        let userIP = await getUserIP(); // Fetch user IP (optional)
        console.log('let ip: ' + userIP);
        console.log("Query: " + searchQuery);
  
        // Define Funnelback URLs
        let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html?collection=seattleu~sp-search&profile=_default&form=partial'; // Replace with your GET URL
        let postUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html?collection=seattleu~sp-search&profile=_default&form=partial'; // Replace with your POST URL
  
        // Trigger GET and POST requests
        let [getResponse, postResponse] = await Promise.all([
          fetchFunnelbackWithQuery(getUrl, 'GET', userIP, searchQuery),
          fetchFunnelbackWithQuery(postUrl, 'POST', userIP, searchQuery),
        ]);

        console.log("getResponse: " + getResponse);
        console.log("postResponse: " + postResponse);

  
        // Display results
        document.getElementById('results').innerHTML = `
          <h3>GET Response:</h3>
          <div>${getResponse}</div>
          <h3>POST Response:</h3>
          <div>${postResponse}</div>
        `;
      });