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
        this.toggleSelector = '[data-toggle="collapse"]';
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
        if (!nodes?.length) return;
    
        nodes.forEach(node => {
            if (node?.nodeType === Node.ELEMENT_NODE) {
                // Initialize toggle state if present
                const toggleButton = node.querySelector(this.toggleSelector);
                if (toggleButton) {
                    this.initializeToggleState(toggleButton);
                }
    
                // Only attach listeners to non-toggle elements
                const elements = node.querySelectorAll([
                    '.facet-group__list a',
                    '.tab-list__nav a', 
                    '.search-tools__button-group a',
                    'a.facet-group__clear',
                    '.facet-breadcrumb__link',
                    '.facet-breadcrumb__item',
                    'a.related-links__link',
                    '.query-blending__highlight',
                    '.search-spelling-suggestions__link',
                    'a.pagination__link'
                ].join(', '));
    
                elements.forEach(element => {
                    if (element) {
                        element.removeEventListener('click', this.handleDynamicClick);
                        element.addEventListener('click', this.handleDynamicClick);
                    }
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

    initializeToggleState(toggleButton) {
        if (!toggleButton) return;

        const targetSelector = toggleButton.getAttribute('data-target');
        if (!targetSelector) return;

        const collapsibleElements = document.querySelectorAll(targetSelector);
        if (!collapsibleElements.length) return;

        const initialState = collapsibleElements[0].classList.contains('show');
        toggleButton.setAttribute('aria-expanded', String(initialState));
        toggleButton.textContent = initialState ? 'Hide Filters' : 'Show Filters';
    }

    handleDynamicClick = async(e) => {
        try {
            const handlers = {
                '.facet-group__list a': this.handleFacetAnchor,
                '.tab-list__nav a': this.handleTab,
                '.search-tools__button-group a': this.handleSearchTools,
                'a.facet-group__clear': this.handleClearFacet,
                '.facet-breadcrumb__link': this.handleClearFacet,
                '.facet-breadcrumb__item': this.handleClearFacet,
                'a.related-links__link': this.handleClick,
                '.query-blending__highlight': this.handleClick,
                '.search-spelling-suggestions__link': this.handleSpellingClick,
                'a.pagination__link': this.handleClick,
                [this.toggleSelector]: this.handleToggle
            };

            for (const [selector, handler] of Object.entries(handlers)) {
                const matchedElement = e.target.closest(selector);
                if (matchedElement) {
                    e.preventDefault();
                    console.log("DynamicResultsManager: handleDynamicClick");
                    console.log("element", matchedElement);
                    console.log("e", e);
                    await handler.call(this, e, matchedElement);
                    break;
                }
            }
        } catch (error) {
            console.warn('Error in handleDynamicClick:', error);
        }
    }

    handleToggle = (() => {
        let isProcessing = false;
    
        return (e, element) => {
            try {
                console.log('Toggle handler activated', element);
    
                if (isProcessing) return;
                isProcessing = true;
    
                if (!element) return;
                
                const targetSelector = element.getAttribute('data-target');
                console.log('Target selector:', targetSelector);
    
                const collapsibleElements = document.querySelectorAll(targetSelector);
                console.log('Collapsible elements found:', collapsibleElements.length, collapsibleElements);
    
                if (!collapsibleElements.length) return;
    
                const isExpanded = element.getAttribute('aria-expanded') === 'true';
                console.log('Current expanded state:', isExpanded);
    
                const newState = !isExpanded;
                element.setAttribute('aria-expanded', String(newState));
                element.textContent = newState ? 'Hide Filters' : 'Show Filters';
    
                collapsibleElements.forEach(target => {
                    console.log('Before toggle - Element classes:', target.classList.toString());
                    if (target?.classList) {
                        if (!newState) {
                            target.classList.remove('show');
                        } else {
                            target.classList.add('show');
                        }
                    }
                    console.log('After toggle - Element classes:', target.classList.toString());
                });
    
                setTimeout(() => {
                    isProcessing = false;
                }, 100);
    
            } catch (error) {
                console.warn('Error in handleToggle:', error);
                isProcessing = false;
            }
        };
    })();



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

    async fetchFunnelbackSpelling(url, method) {

        let prodSpellingUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
        let partial = '&form=partial';
        let query = url +=`${partial}`;
      
        try {
          if (method === 'GET') {
            prodSpellingUrl += `${query}`;
          }
      
          let options = {
            method,
            headers: {
              'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
              // 'X-Forwarded-For': userIp,
            },
          };
      
          let response = await fetch(prodSpellingUrl, options);
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
      


    // click handlers
    
    async handleClick(e, element) {
        console.log("DynamicResultsManager: handleClick");
        console.log("element", element);
        console.log("e", e);

        const href = element.getAttribute('href');
        console.log("handleClick href:", href);

        if (href) {
            const response = await this.fetchFunnelbackResults(href, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No tab results found."}
            </div>
          `;
        }
    }

    async handleSpellingClick(e, element) {

        const href = element.getAttribute('href');

        if (href) {
            const response = await this.fetchFunnelbackSpelling(href, 'GET');
            document.getElementById('results').innerHTML = `
            <div class="funnelback-search-container">
              ${response || "No spelling results found."}
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
        console.log("element", element);
        console.log("e", e);

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
