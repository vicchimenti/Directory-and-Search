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

