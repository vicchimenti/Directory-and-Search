// Make a GET request to Funnelback
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
  
  // Get the search query from the input field
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    performSearch(query);
  });