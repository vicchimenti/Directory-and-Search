import React, { useState, useEffect, useRef } from 'react';

const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  // Debounce search to prevent too many requests
  const debouncedSearch = (searchQuery) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://dxp-us-search.funnelback.squiz.cloud/s/search.html?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const text = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        
        // Get the Funnelback container content
        const funnelbackContainer = tempDiv.querySelector('#funnelback-search-container-response');
        if (!funnelbackContainer) {
          console.error('Funnelback container not found in response');
          return;
        }

        // Extract search suggestions with metadata
        const items = Array.from(funnelbackContainer.querySelectorAll('article.listing-item'))
          .map(article => {
            const titleElement = article.querySelector('.listing-item_title a');
            const bodyElement = article.querySelector('.listing-item_body');
            const footerElement = article.querySelector('.listing-item_footer');
            
            return {
              title: titleElement ? titleElement.textContent.trim() : '',
              url: titleElement ? titleElement.getAttribute('href') : '',
              body: bodyElement ? bodyElement.textContent.trim() : '',
              footer: footerElement ? footerElement.textContent.trim() : '',
            };
          })
          .filter(item => item.title) // Only include items with titles
          .slice(0, 10); // Limit to 10 suggestions
        
        setSuggestions(items);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.url) {
      window.location.href = suggestion.url;
    }
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl search-container">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          className="w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <h3 className="text-lg font-medium text-blue-600 mb-1">
                {suggestion.title}
              </h3>
              {suggestion.body && (
                <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                  {suggestion.body}
                </p>
              )}
              {suggestion.footer && (
                <p className="text-xs text-gray-500">
                  {suggestion.footer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && suggestions.length === 0 && query.length >= 3 && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;