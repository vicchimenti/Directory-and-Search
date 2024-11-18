async function handleFunnelbackRequest(method, queryParams) {
    const funnelbackEndpoint = "YOUR_FUNNELBACK_ENDPOINT"; // Replace with your Funnelback endpoint
  
    let url = funnelbackEndpoint;
    if (method === 'GET') {
      url += '?' + new URLSearchParams(queryParams).toString();
    }
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
    collection: 'mycollection',
    query: 'search term',
  };
  handleFunnelbackRequest('GET', queryParamsGet)
    .then(data => {
      // Process the returned HTML fragment
      console.log(data);
    });
  
  // Example usage for POST
  const queryParamsPost = {
    collection: 'mycollection',
    query: 'search term',
    // Add more parameters as needed
  };
  handleFunnelbackRequest('POST', queryParamsPost)
    .then(data => {
      // Process the returned HTML fragment
      console.log(data);
    });