// dynamic results manager
class DynamicResultsManager {
    constructor() {
        this.observerConfig = {
            childList: true,
            subtree: true
        };
        
        if (window.location.pathname.includes('search-test')) {
            this.initializeIP();
            this.initializeObserver();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupDynamicListeners();
                    this.startObserving();
                });
            } else {
                this.setupDynamicListeners();
                this.startObserving();
            }
        }
    }

    initializeObserver() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Re-attach event listeners to new content
                    this.attachEventListenersToNewContent(mutation.addedNodes);
                }
            });
        });
    }

    startObserving() {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            this.observer.observe(resultsContainer, this.observerConfig);
            console.log('Observer started watching results container');
        } else {
            console.warn('Results container not found, waiting for it to appear');
            this.waitForResultsContainer();
        }
    }

    waitForResultsContainer() {
        const bodyObserver = new MutationObserver((mutations, obs) => {
            const resultsContainer = document.getElementById('results');
            if (resultsContainer) {
                obs.disconnect();
                this.observer.observe(resultsContainer, this.observerConfig);
                console.log('Results container found and observer started');
            }
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    attachEventListenersToNewContent(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Add specific selectors that need event handling
                const elements = node.querySelectorAll(
                    '.facet-group__list a, .tab-list__nav a, .search-tools__button-group a, a.facet-group__clear, .facet-breadcrumb__link, .facet-breadcrumb__item'
                );
                elements.forEach(element => {
                    // Remove existing listener to prevent duplicates
                    element.removeEventListener('click', this.handleDynamicClick);
                    element.addEventListener('click', this.handleDynamicClick);
                });
            }
        });
    }

    async initializeIP() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            this.userIp = data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.userIp = '';
        }
    }

    setupDynamicListeners() {
        console.log("DynamicResultsManager: setupDynamicListeners");
        // Use document as the listener since content is dynamic
        document.removeEventListener('click', this.handleDynamicClick);
        document.addEventListener('click', this.handleDynamicClick);
    }

    handleDynamicClick = async(e) => {
        console.log("DynamicResultsManager: handleDynamicClick");
        const handlers = {
            '.facet-group__list a': this.handleFacetAnchor,
            '.tab-list__nav a': this.handleTab,
            '.search-tools__button-group a': this.handleSearchTools,
            'a.facet-group__clear': this.handleClearFacet,
            '.facet-breadcrumb__link' : this.handleClearFacet,
            '.facet-breadcrumb__item' : this.handleClearFacet
        };

        for (const [selector, handler] of Object.entries(handlers)) {
            const matchedElement = e.target.closest(selector);
            if (matchedElement) {
                e.preventDefault();
                await handler.call(this, e, matchedElement);
                break;
            }
        }
    }


    // result fetchers
    async fetchFunnelbackResults(url, method) {

        let prodTabUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
      
        try {
          if (method === 'GET') {
            prodTabUrl += `${url}`;
          }
      
          let options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              // 'X-Forwarded-For': userIp,
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

    async fetchFunnelbackTools(url, method) {

        let prodToolsUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
    
        try {
        if (method === 'GET') {
            prodToolsUrl += `${url}`;
        }
    
        let options = {
            method,
            headers: {
            'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
            // 'X-Forwarded-For': userIp,
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
        return `<p>Error fetching ${method} tools request. Please try again later.</p>`;
        }
    }


    // click handlers
    async handleClick(e, element) {
        console.log("DynamicResultsManager: handleClick");

        const anchorTarget = e.target.closest(element);
        const relativeHref = anchorTarget.getAttribute('href') || e.target.querySelector('a')?.getAttribute('href');
        console.log("Relative href:", relativeHref);

        const href = element.getAttribute('href');
        console.log("direct href:", href);

        if (relativeHref) {
            const response = await this.fetchFunnelbackResults(relativeHref, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }

    async handleFacetAnchor(e, element) {
        const facetAnchor = e.target.closest('.facet-group__list a');
        const facetHref = facetAnchor.getAttribute('href');
        console.log("Relative facetHref:", facetHref);
        if (facetHref) {
            const response = await this.fetchFunnelbackResults(facetHref, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }
    
    async handleTab(e, element) {
        console.log("DynamicResultsManager: handleTab");
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }
    
    async handleSearchTools(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackTools(href, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }
    
    async handleClearFacet(e, element) {
        const href = element.getAttribute('href');
        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        document.removeEventListener('click', this.handleDynamicClick);
    }
}

// Initialize
const dynamicResults = new DynamicResultsManager();
