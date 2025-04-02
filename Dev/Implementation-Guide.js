/**
 * # Seattle University Search System - Implementation Guide
 * 
 * This guide provides instructions for implementing and configuring the 
 * Seattle University Search System.
 * 
 * ## Table of Contents
 * 
 * 1. System Overview
 * 2. Directory Structure
 * 3. Installation
 * 4. Basic Configuration
 * 5. HTML Integration
 * 6. Advanced Configuration
 * 7. Custom Styling
 * 8. Analytics Integration
 * 9. Troubleshooting
 * 10. Performance Optimization
 * 
 * ## 1. System Overview
 * 
 * The Seattle University Search System is a modern JavaScript application for integrating
 * with Funnelback search services. It provides a complete search experience with:
 * 
 * - Real-time suggestions
 * - Three-column suggestion layout
 * - Advanced search results
 * - Faceted filtering
 * - Click tracking and analytics
 * - Performance optimization
 * 
 * The system is built with a modular, event-driven architecture that includes:
 * 
 * - Core modules for state management
 * - UI components for display and interaction
 * - Service modules for API communication and caching
 * - Utility modules for common functionality
 * 
 * ## 2. Directory Structure
 * 
 * ```
 * search/
 * ├── core/
 * │   ├── ConfigManager.js
 * │   ├── EventBus.js
 * │   └── SearchCore.js
 * ├── components/
 * │   ├── SearchInput.js
 * │   ├── SuggestionPanel.js
 * │   ├── ResultsManager.js
 * │   └── FacetManager.js
 * ├── services/
 * │   ├── ApiService.js
 * │   ├── CacheService.js
 * │   ├── AnalyticsService.js
 * │   └── SessionManager.js
 * ├── utils/
 * │   ├── DomUtils.js
 * │   ├── DebounceUtils.js
 * │   ├── QueryUtils.js
 * │   └── AccessibilityUtils.js
 * ├── styles/
 * │   ├── search.css
 * │   ├── suggestions.css
 * │   ├── results.css
 * │   └── facets.css
 * └── search-system.js
 * ```
 * 
 * ## 3. Installation
 * 
 * ### Via Script Tag
 * 
 * ```html
 * <!-- Add the CSS -->
 * <link rel="stylesheet" href="/path/to/search/styles/search.css">
 * 
 * <!-- Add the JavaScript (with module type) -->
 * <script type="module">
 *   import SearchSystem from '/path/to/search/search-system.js';
 *   
 *   // The system initializes automatically
 *   // You can reference it for custom integrations
 *   window.searchSystem = SearchSystem;
 * </script>
 * ```
 * 
 * ### Via NPM (if building with a bundler)
 * 
 * ```bash
 * npm install @seattleu/search-system
 * ```
 * 
 * ```javascript
 * import SearchSystem from '@seattleu/search-system';
 * 
 * // The system initializes automatically
 * // You can reference it for custom integrations
 * window.searchSystem = SearchSystem;
 * ```
 * 
 * ## 4. Basic Configuration
 * 
 * The system works with sensible defaults, but you can customize it:
 * 
 * ```javascript
 * import { SearchSystem } from '/path/to/search/search-system.js';
 * 
 * // Create a custom instance with configuration
 * const search = new SearchSystem({
 *   // API endpoints
 *   endpoints: {
 *     baseUrl: 'https://funnelback-proxy-dev.vercel.app/proxy',
 *     // Other endpoints are derived from baseUrl by default
 *   },
 *   
 *   // Search parameters
 *   defaultCollection: 'seattleu~sp-search',
 *   defaultProfile: '_default',
 *   
 *   // UI settings
 *   scrollToResults: true,
 *   mobileBreakpoint: 768,
 *   animations: true,
 *   
 *   // Component selectors
 *   components: {
 *     input: {
 *       selector: '#search-form',
 *       // Component-specific configuration
 *     },
 *     suggestions: {
 *       selector: '#search-suggestions',
 *       // Component-specific configuration
 *     },
 *     results: {
 *       selector: '#results',
 *       // Component-specific configuration
 *     },
 *     facets: {
 *       selector: '#facets',
 *       // Component-specific configuration
 *     }
 *   },
 *   
 *   // Debug settings
 *   debug: false,
 *   logApiCalls: false
 * });
 * 
 * // Make the instance globally available
 * window.searchSystem = search;
 * ```
 * 
 * ## 5. HTML Integration
 * 
 * Add the necessary HTML structure to your pages:
 * 
 * ### Search Input (can be used in header or elsewhere)
 * 
 * ```html
 * <form id="search-form" role="search" action="/search-test/" method="get">
 *   <div class="search-input-container">
 *     <input type="text" id="search-input" name="query" placeholder="Search Seattle University" aria-label="Search query">
 *     <button type="submit" id="search-button" aria-label="Submit search">
 *       <svg class="search-icon" aria-hidden="true">
 *         <use href="#search"></use>
 *       </svg>
 *     </button>
 *   </div>
 *   <div id="search-suggestions" role="listbox" aria-label="Search suggestions" hidden></div>
 * </form>
 * ```
 * 
 * ### Search Results Page
 * 
 * ```html
 * <div class="search-page">
 *   <!-- Search form for the results page -->
 *   <form id="on-page-search-form" role="search" action="/search-test/" method="get">
 *     <div class="search-input-container">
 *       <input type="text" id="autocomplete-concierge-inputField" name="query" placeholder="Search Seattle University" aria-label="Search query">
 *       <button type="submit" id="on-page-search-button" aria-label="Submit search">
 *         <svg class="search-icon" aria-hidden="true">
 *           <use href="#search"></use>
 *         </svg>
 *       </button>
 *     </div>
 *     <div id="autocomplete-suggestions" role="listbox" aria-label="Search suggestions" hidden></div>
 *   </form>
 *   
 *   <!-- Results container -->
 *   <div id="results">
 *     <!-- Results will be loaded here -->
 *   </div>
 * </div>
 * ```
 * 
 * ## 6. Advanced Configuration
 * 
 * ### Custom Event Handling
 * 
 * You can subscribe to events for custom integrations:
 * 
 * ```javascript
 * import EventBus from '/path/to/search/core/EventBus.js';
 * 
 * // Listen for search events
 * EventBus.on('search:loading', (isLoading) => {
 *   // Update custom UI elements based on loading state
 *   document.getElementById('custom-loading').hidden = !isLoading;
 * });
 * 
 * // Listen for result clicks
 * EventBus.on('result:click', (data) => {
 *   // Custom click handling
 *   console.log('Clicked result:', data.title, 'at position', data.position);
 * });
 * 
 * // Listen for all events (for debugging)
 * EventBus.on('*', (eventName, data) => {
 *   console.log(`Event: ${eventName}`, data);
 * });
 * ```
 * 
 * ### Programmatic Search
 * 
 * ```javascript
 * // Get the search system instance
 * const search = window.searchSystem;
 * 
 * // Perform a search programmatically
 * search.search('computer science').then(results => {
 *   console.log('Search completed with', results.resultCount, 'results');
 * });
 * ```
 * 
 * ## 7. Custom Styling
 * 
 * The system provides base CSS files that you can customize:
 * 
 * ```css
 *  Override search input styles 
 * .search-input-container {
 *   border-radius: 8px;
 *   border: 2px solid var(--su-crimson);
 * }
 * 
 *  Customize suggestion panel 
 * .suggestions-columns {
 *   column-gap: 1.5rem;
 * }
 * 
 * Style the staff suggestions 
 * .staff-item {
 *   background-color: var(--su-light-gray);
 * }
 * 
 *  Add custom styling to results 
 * .search-result-item {
 *   padding: 1.5rem;
 *   border-bottom: 1px solid var(--su-light-gray);
 * }
 * ```
 * 
 * ## 8. Analytics Integration
 * 
 * The system includes built-in analytics tracking. This works with the existing
 * Funnelback proxy analytics endpoints.
 * 
 * For additional analytics tools:
 * 
 * ```javascript
 * import EventBus from '/path/to/search/core/EventBus.js';
 * 
 *   import EventBus from '/path/to/search/core/EventBus.js';
 *
 *   // Track searches in Google Analytics
 *  EventBus.on('query:submit', (query) => {
 *   if (window.gtag) {
 *       gtag('event', 'search', {
 *       search_term: query
 *      });
 *   }
 *   });
 *
 *   // Track result clicks in Google Analytics
 *  EventBus.on('result:click', (data) => {
 *   if (window.gtag) {
 *       gtag('event', 'search_results',
 *       event_action: 'click',
 *       event_label: data.title,
 *       position: data.position,
 *       query: data.query
 *       });
 *   }
 *   });
 *
 **/