    // Fetch user's IP address (optional)
    async function getUserIP() {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          return data.ip;
        } catch (error) {
          console.error('Error fetching IP address:', error);
          return ''; // Default to empty if error occurs
        }
      }
  
      // Funnelback fetch function
      async function fetchFunnelbackWithQuery(url, method, userIP, searchQuery) {
        try {
          if (method === 'GET' && searchQuery) {
            url += `?query=${encodeURIComponent(searchQuery)}`;
          }
  
          const options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              'X-Forwarded-For': userIP,
            },
          };
  
          if (method === 'POST' && searchQuery) {
            options.body = `query=${encodeURIComponent(searchQuery)}`;
          }
  
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`Error: ${response.status}`);
  
          const html = await response.text();
          console.log(`${method} Response:`, html);
          return html; // Return the HTML response
        } catch (error) {
          console.error(`Error with ${method} request:`, error);
          return `<p>Error fetching ${method} request. Please try again later.</p>`;
        }
      }
  
      // Handle form submission
      document.getElementById('search-button').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent page reload
  
        const searchQuery = document.getElementById('search-input').value; // Get search query
        const userIP = await getUserIP(); // Fetch user IP (optional)
  
        // Define Funnelback URLs
        const getUrl = 'https://example.com/funnelback/api'; // Replace with your GET URL
        const postUrl = 'https://example.com/funnelback/api'; // Replace with your POST URL
  
        // Trigger GET and POST requests
        const [getResponse, postResponse] = await Promise.all([
          fetchFunnelbackWithQuery(getUrl, 'GET', userIP, searchQuery),
          fetchFunnelbackWithQuery(postUrl, 'POST', userIP, searchQuery),
        ]);
  
        // Display results
        document.getElementById('results').innerHTML = `
          <h3>GET Response:</h3>
          <div>${getResponse}</div>
          <h3>POST Response:</h3>
          <div>${postResponse}</div>
        `;
      });