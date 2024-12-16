/***
 * SU Funnelback Partial Script
 * 
 * Handles Tabs, Facets and Tools
 */

// dynamic-results.js
class DynamicResultsManager {
  constructor() {
      if (window.location.pathname.includes('search-test')) {
          this.initializeIP();
          this.setupDynamicListeners();
      }
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
      const resultsContainer = document.getElementById('results');
      if (resultsContainer) {
          resultsContainer.addEventListener('click', this.handleDynamicClick);
      }
  }

  handleDynamicClick = async(e) => {
      const handlers = {
          '.facet-group__list a': this.handleFacetAnchor,
          '.tab-list__nav a': this.handleTab,
          '.search-tools__button-group a': this.handleSearchTools,
          'a.facet-group__clear': this.handleClearFacet
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

  async fetchFunnelbackResults(url, method) {
      const prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
      try {
          const response = await fetch(prodUrl + url);
          if (!response.ok) throw new Error(`Error: ${response.status}`);
          return await response.text();
      } catch (error) {
          console.error(`Error with ${method} request:`, error);
          return `<p>Error fetching results. Please try again later.</p>`;
      }
  }

  // Handler methods
  async handleFacetAnchor(e, element) {
      const href = element.getAttribute('href');
      if (href) {
          const response = await this.fetchFunnelbackResults(href, 'GET');
          document.getElementById('results').innerHTML = `
              <div class="funnelback-search-container">${response}</div>
          `;
      }
  }

  async handleTab(e, element) {
      const href = element.getAttribute('href');
      if (href) {
          const response = await this.fetchFunnelbackResults(href, 'GET');
          document.getElementById('results').innerHTML = `
              <div class="funnelback-search-container">${response}</div>
          `;
      }
  }

  async handleSearchTools(e, element) {
      const href = element.getAttribute('href');
      if (href) {
          const response = await this.fetchFunnelbackResults(href, 'GET');
          document.getElementById('results').innerHTML = `
              <div class="funnelback-search-container">${response}</div>
          `;
      }
  }

  async handleClearFacet(e, element) {
      const href = element.getAttribute('href');
      if (href) {
          const response = await this.fetchFunnelbackResults(href, 'GET');
          document.getElementById('results').innerHTML = `
              <div class="funnelback-search-container">${response}</div>
          `;
      }
  }
}

// Initialize dynamic results
const dynamicResults = new DynamicResultsManager();