// Create a debounce function helper
function debounce(func, wait) {
  let timeout;
  return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Main initialization function
function initializeAutocomplete() {
  const searchInput = $('#input.on-page-sq-search');
  const searchContainer = $('<div class="relative search-container"></div>');
  const suggestionsContainer = $('<div class="suggestions-dropdown absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" style="display: none;"></div>');
  
  // Wrap input in container
  searchInput.wrap(searchContainer);
  searchInput.after(suggestionsContainer);
  
  // Loading indicator
  const loadingIndicator = $('<div class="absolute right-3 top-3" style="display: none;"><div class="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div></div>');
  searchInput.after(loadingIndicator);

  // Perform search with debounce
  const performSearch = debounce(async (query) => {
      if (query.length < 3) {
          suggestionsContainer.hide();
          return;
      }

      loadingIndicator.show();
      
      try {
          const url = `https://dxp-us-search.funnelback.squiz.cloud/s/search.html?query=${encodeURIComponent(query)}&collection=seattleu~sp-search&profile=_default&form=partial`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Error: ${response.status}`);
          
          const text = await response.text();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = text;
          
          const funnelbackContainer = tempDiv.querySelector('#funnelback-search-container-response');
          if (!funnelbackContainer) {
              console.error('Funnelback container not found in response');
              return;
          }

          // Extract search suggestions
          const items = Array.from(funnelbackContainer.querySelectorAll('article.listing-item'))
              .map(article => {
                  const titleElement = article.querySelector('.listing-item_title a');
                  const bodyElement = article.querySelector('.listing-item_body');
                  const footerElement = article.querySelector('.listing-item_footer');
                  
                  return {
                      title: titleElement ? titleElement.textContent.trim() : '',
                      url: titleElement ? titleElement.getAttribute('href') : '',
                      body: bodyElement ? bodyElement.textContent.trim() : '',
                      footer: footerElement ? footerElement.textContent.trim() : ''
                  };
              })
              .filter(item => item.title)
              .slice(0, 10);

          // Update suggestions UI
          if (items.length > 0) {
              const suggestionHtml = items.map(item => `
                  <div class="suggestion-item p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                      <h3 class="text-lg font-medium text-blue-600 mb-1">${item.title}</h3>
                      ${item.body ? `<p class="text-sm text-gray-600 mb-1 line-clamp-2">${item.body}</p>` : ''}
                      ${item.footer ? `<p class="text-xs text-gray-500">${item.footer}</p>` : ''}
                  </div>
              `).join('');
              
              suggestionsContainer.html(suggestionHtml).show();
          } else {
              suggestionsContainer.html('<div class="p-4 text-center text-gray-500">No results found</div>').show();
          }
      } catch (error) {
          console.error('Search error:', error);
          suggestionsContainer.html('<div class="p-4 text-center text-red-500">Error performing search</div>').show();
      } finally {
          loadingIndicator.hide();
      }
  }, 300);

  // Event handlers
  searchInput.on('input', function() {
      performSearch(this.value);
  });

  searchInput.on('focus', function() {
      if (this.value.length >= 3) {
          suggestionsContainer.show();
      }
  });

  // Handle clicking on suggestions
  suggestionsContainer.on('click', '.suggestion-item', function() {
      const title = $(this).find('h3').text();
      const url = $(this).find('a').attr('href');
      if (url) {
          window.location.href = url;
      }
  });

  // Close suggestions when clicking outside
  $(document).on('mousedown', function(event) {
      if (!$(event.target).closest('.search-container').length) {
          suggestionsContainer.hide();
      }
  });
}

// Initialize when document is ready
$(document).ready(function() {
  initializeAutocomplete();
});