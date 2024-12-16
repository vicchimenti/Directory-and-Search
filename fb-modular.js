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
            handler: () => handleClearFacet(e)        }

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

