/***
 * SU Funnelback Partial Script
 * 
 * Handles Tabs, Facets and Tools
 */

// capture dynamic assets and global declarations
let partialUserIpAddress = null;
let partialUserIp = null;




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
  partialUserIp = await getUserIP();
  partialUserIpAddress = JSON.stringify(partialUserIp);
});




// Funnelback fetch tabs function
async function fetchFunnelbackResults(url, method) {

    let prodTabUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  
    try {
      if (method === 'GET') {
        prodTabUrl += `${url}`;
      }
  
      let options = {
        method,
        headers: {
          'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
          // 'X-Forwarded-For': partialUserIp,
        },
      };
  
      let response = await fetch(prodTabUrl, options);
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
      return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
    }
  }
  




// Funnelback fetch search tools function
async function fetchFunnelbackTools(url, method) {

    let prodToolsUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
  
    try {
      if (method === 'GET') {
        prodToolsUrl += `${url}`;
      }
  
      let options = {
        method,
        headers: {
          'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
          // 'X-Forwarded-For': partialUserIp,
        },
      };
  
      let response = await fetch(prodToolsUrl, options);
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
      return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
    }
}




// Function to handle anchor clicks
async function handleFacetAnchor(e) {
    e.preventDefault();
  
    const facetAnchor = e.target.closest('.facet-group__list a');
    const facetHref = facetAnchor.getAttribute('href');
    console.log("Relative href:", facetHref);
  
    // Fetch and process data using the relative link
    let getFacetResponse = null;
    if (facetHref) {
      try {
        getFacetResponse = await fetchFunnelbackResults(facetHref, 'GET');
      } catch (error) {
        console.error("Error fetching facet data:", error);
        getFacetResponse = "Error loading facet results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getFacetResponse || "No facet results found."}
      </div>
    `;
}




// handle tab listeners
async function handleTab(e) {
    e.preventDefault();
  
    const fetchTab = e.target.closest('.tab-list__nav a');
    const tabHref = fetchTab.getAttribute('href');
    console.log("Relative href:", tabHref);
  
    // Fetch and process data using the relative link
    let getTabResponse = null;
    if (tabHref) {
      try {
        getTabResponse = await fetchFunnelbackResults(tabHref, 'GET');
      } catch (error) {
        console.error("Error fetching tab data:", error);
        getTabResponse = "Error loading tab results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getTabResponse || "No tab results found."}
      </div>
    `;
}




// handle search tool listeners
async function handleSearchTools(e) {
    e.preventDefault();

    const fetchTools = e.target.closest('.search-tools__button-group a');
    const toolHref = fetchTools.getAttribute('href');
    console.log("Relative href:", toolHref);

    // Fetch and process data using the relative link
    let getToolResponse = null;
    if (toolHref) {
        try {
        getToolResponse = await fetchFunnelbackTools(toolHref, 'GET');
        } catch (error) {
        console.error("Error fetching tab data:", error);
        getToolResponse = "Error loading tool results.";
        }
    }

    document.getElementById('results').innerHTML = `
        <div class="funnelback-search-container">
        ${getToolResponse || "No tool results found."}
        </div>
    `;
}




// handle facet cleaners
async function handleClearFacet(e) {
    e.preventDefault();
  
    const fetchClear = e.target.closest('a.facet-group__clear');
    const clearHref = fetchClear.getAttribute('href');
    console.log("Relative href:", clearHref);
  
    // Fetch and process data using the relative link
    let getClearResponse = null;
    if (clearHref) {
      try {
        getClearResponse = await fetchFunnelbackResults(clearHref, 'GET');
      } catch (error) {
        console.error("Error fetching clear data:", error);
        getClearResponse = "Error loading clear results.";
      }
    }
  
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">
        ${getClearResponse || "No clear results found."}
      </div>
    `;
}




class SearchEventManager {
  constructor() {
      // Always try to set up the header search
      this.setupHeaderSearch();
      
      // Only set up on-page search if we're on the results page
      if (window.location.pathname.includes('search-test')) {
          this.setupOnPageSearch();
      }
  }

  setupHeaderSearch() {
      const searchBar = document.getElementById("search-button");
      if (searchBar) {
          searchBar.addEventListener('click', this.handleInitialSearch);
      }
  }

  setupOnPageSearch() {
      const onPageSearch = document.getElementById("on-page-search-button");
      if (onPageSearch) {
          onPageSearch.addEventListener('click', this.handleOnPageSearch);
          
          // Set up URL parameter handling for initial load
          this.handleURLParameters();
      }
  }

  async handleURLParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearchQuery = urlParams.get('query');

      if (urlSearchQuery) {
          const searchInputField = document.getElementById('on-page-search-input');
          if (searchInputField) {
              searchInputField.value = urlSearchQuery;
          }
          await performFunnelbackSearch(urlSearchQuery);
      }
  }

  handleInitialSearch = async(event) => {
      event.preventDefault();
      const searchQuery = document.getElementById('search-input').value;
      await fetchAndRedirectSearch(searchQuery);
  }

  handleOnPageSearch = async(event) => {
      event.preventDefault();
      const searchQuery = document.getElementById('on-page-search-input').value;
      await performFunnelbackSearch(searchQuery);
  }
}

class DynamicResultsManager {
  constructor() {
      // Only set up if we're on the results page
      if (window.location.pathname.includes('search-test')) {
          this.setupDynamicListeners();
      }
  }

  setupDynamicListeners() {
      const resultsContainer = document.getElementById('results');
      if (resultsContainer) {
          resultsContainer.addEventListener('click', this.handleDynamicClick);
      }
  }

  handleDynamicClick = async(e) => {
      const handlers = {
          '.facet-group__list a': handleFacetAnchor,
          '.tab-list__nav a': handleTab,
          '.search-tools__button-group a': handleSearchTools,
          'a.facet-group__clear': handleClearFacet
      };

      for (const [selector, handler] of Object.entries(handlers)) {
          const matchedElement = e.target.closest(selector);
          if (matchedElement) {
              e.preventDefault();
              await handler(e);
              break;
          }
      }
  }
}

// Initialize both managers regardless of page
// They will self-determine if they should be active
const searchManager = new SearchEventManager();
const resultsManager = new DynamicResultsManager();