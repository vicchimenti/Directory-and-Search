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




class EventManager {
    constructor(rootElement = document) {
      this.rootElement = rootElement;
      this.setupListeners();
    }
  
    setupListeners() {
      this.rootElement.addEventListener('click', this.handleClick.bind(this));
    }
  
    handleClick(e) {
      const target = e.target;
  
      const handlers = [
        { 
            selector: '.facet-group__list a', 
            handler: () => handleFacetAnchor(e) 
        },
        { 
            selector: '.tab-list__nav a', 
            handler: () => handleTab(e) 
        },
        {
            selector: '.search-tools__button-group a',
            handler: () => handleSearchTools(e)
        },
        {
            selector: 'a.facet-group__clear',
            handler: () => handleClearFacet(e)        
        }

        // Add other handlers...
      ];
  
      for (const { selector, handler } of handlers) {
        const matchedElement = target.closest(selector);
        if (matchedElement) {
          handler();
          break;
        }
      }
    }
  }
  
  // Usage
  const eventManager = new EventManager();

