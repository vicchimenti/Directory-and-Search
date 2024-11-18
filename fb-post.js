function performPostSearch(query) {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('collection', 'seattleu~sp-search');
    formData.append('profile', '=_default');
  
    fetch('https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html', {
      method: 'POST',
      body: formData,
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