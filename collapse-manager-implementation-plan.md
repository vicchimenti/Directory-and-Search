# Global Collapse Manager Implementation Plan

## Overview

This document outlines the comprehensive plan for integrating the Global Collapse Manager into the Seattle University Search API. The collapse manager will enhance the search interface by managing collapsible elements including facet groups, tab groups, and "show more" functionality.

## Project Structure

```
public/
├── js/
│   ├── modules/
│   │   ├── collapse-manager.js      <-- NEW FILE TO CREATE
│   │   ├── core-search-manager.js   <-- MODIFY
│   │   ├── facets-manager.js        <-- CHECK FOR CONFLICTS
│   │   └── tabs-manager.js          <-- CHECK FOR CONFLICTS
│   ├── search-index.js              <-- MODIFY
│   └── SessionService.js            <-- NO CHANGES REQUIRED
├── integration.js                   <-- NO CHANGES REQUIRED
├── search-page-autocomplete.js      <-- NO CHANGES REQUIRED
└── search-bundle.js                 <-- NO CHANGES REQUIRED
```

## Implementation Steps

### 1. Create the Collapse Manager Module

Create a new file at `public/js/modules/collapse-manager.js` that wraps the Global Collapse Manager functionality and integrates with the core search manager:

```javascript
/**
 * @fileoverview Collapse Manager for Search UI
 *
 * This module integrates the Global Collapse Manager functionality
 * to handle collapsible elements in the search interface.
 *
 * Features:
 * - Manages collapsible facet groups
 * - Handles tab group visibility toggles
 * - Controls show more/less functionality
 * 
 * @license MIT
 * @author [Your Name]
 * @version 1.0.0
 * @lastModified [Current Date]
 */

// Import the Global Collapse Manager singleton
import fbGlobal from '../../Global-collapse-manager.js';

class CollapseManager {
  /**
   * Initialize the Collapse Manager.
   * @param {Object} core - Reference to the core search manager
   */
  constructor(core) {
    this.core = core;
    this.resultsContainer = document.getElementById("results");
    
    // Store reference to the global collapse instance
    this.globalCollapse = fbGlobal;
    
    // Initialize and configure the manager
    this.initialize();
  }

  /**
   * Initialize collapse functionality.
   */
  initialize() {
    if (!this.resultsContainer) {
      return;
    }

    // The Global Collapse Manager already initializes itself
    // and sets up its own observers, but we'll ensure it has
    // properly initialized the existing elements in our container
    this.initializeExistingElements();
  }

  /**
   * Initialize any existing elements in the results container
   * that should have collapse functionality.
   */
  initializeExistingElements() {
    if (!this.resultsContainer) return;
    
    // Find all elements in the results container that should have
    // collapse functionality and ensure they're initialized
    
    // Facet group controls
    const facetButtons = this.resultsContainer.querySelectorAll(
      '[data-component="facet-group-control"]:not([data-collapse-initialized])'
    );
    facetButtons.forEach(button => {
      this.globalCollapse.initializeCollapse(button);
    });
    
    // Collapse-all buttons
    const collapseAllButtons = this.resultsContainer.querySelectorAll(
      '[data-component="collapse-all"]:not([data-collapse-initialized])'
    );
    collapseAllButtons.forEach(button => {
      this.globalCollapse.initializeCollapse(button);
    });
    
    // Show more buttons
    const showMoreButtons = this.resultsContainer.querySelectorAll(
      '[data-component="facet-group-show-more-button"]:not([data-collapse-initialized])'
    );
    showMoreButtons.forEach(button => {
      this.globalCollapse.initializeShowMore(button);
    });
    
    // Tab groups
    const tabGroups = this.resultsContainer.querySelectorAll(
      '.tabs--center:not([data-toggle-initialized])'
    );
    tabGroups.forEach(tabGroup => {
      this.globalCollapse.addToggleButtonToTabGroup(tabGroup);
    });
  }

  /**
   * Handles DOM changes by finding and initializing new collapse elements.
   * This method is called by the core search manager when new content is added.
   * @param {NodeList} addedNodes - Nodes added to the DOM
   */
  handleDomChanges(addedNodes) {
    // The Global Collapse Manager has its own observer that should handle this
    // But we'll provide this method to conform to the manager interface
    // and as a backup in case the observer misses something
    
    if (!addedNodes || addedNodes.length === 0) return;
    
    // For each new node, check if it contains elements we need to initialize
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Let the global observer handle it, but we could add additional
        // initialization logic here if needed
      }
    });
  }

  /**
   * Clean up resources and event listeners when this module is destroyed.
   */
  destroy() {
    // The Global Collapse Manager singleton will persist, but we'll
    // disconnect its observer to prevent memory leaks
    if (this.globalCollapse && this.globalCollapse.observer) {
      this.globalCollapse.observer.disconnect();
    }
  }
}

export default CollapseManager;
```

### 2. Modify Core Search Manager Configuration

Update `public/js/search-index.js` to include the new collapse manager in the enabled modules array:

```javascript
// Configure manager with site-specific settings
const config = {
  proxyBaseUrl: 'https://funnelback-proxy-dev.vercel.app/proxy',
  enabledModules: [
    'tabs',       // Tab navigation
    'facets',     // Faceted search
    'pagination', // Page navigation
    'spelling',   // Spelling suggestions
    'analytics',  // Click tracking and analytics
    'collapse'    // NEW: Collapsible elements manager
  ],
  // Other configuration options remain unchanged
};
```

### 3. Import Global Collapse Manager

Copy the `Dev/global-collapse-manager.js` file to your project's public directory. There are two options for this:

**Option A**: Copy to root of public JS directory
```
public/js/Global-collapse-manager.js
```

**Option B**: Create a dedicated directory for vendor scripts
```
public/js/vendor/Global-collapse-manager.js
```

If you choose Option B, adjust the import path in the collapse manager module accordingly.

### 4. Add Required CSS

Ensure that your CSS includes the required classes for the collapse functionality. Create or update your CSS files to include:

```css
/* Collapse Button States */
.facet-group__title--open {
  /* Styling for open state of collapse buttons */
}

/* Collapse Content States */
.facet-group__list--open {
  display: block;
}

/* Animation Classes */
.facet-group__list--expanding {
  transition: height 0.45s ease;
  overflow: hidden;
}

.facet-group__list--collapsing {
  transition: height 0.45s ease;
  height: 0px !important;
  overflow: hidden;
}

/* Tab Group Toggle */
.tab-group__toggle {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.tab-group__icon--closed {
  display: none;
}

.tab-group__icon--open {
  display: inline-block;
}

.tab-group__toggle--collapsed .tab-group__icon--closed {
  display: inline-block;
}

.tab-group__toggle--collapsed .tab-group__icon--open {
  display: none;
}

.tab-group__text--show {
  display: none;
}

.tab-group__text--hide {
  display: inline-block;
}

.tab-group__toggle--collapsed .tab-group__text--show {
  display: inline-block;
}

.tab-group__toggle--collapsed .tab-group__text--hide {
  display: none;
}
```

### 5. Check for Conflicts with Existing Managers

Review the existing `facets-manager.js` and `tabs-manager.js` files to identify potential conflicts with the new collapse manager:

#### Potential Conflict Areas in `facets-manager.js`:

Look for methods that handle collapse functionality, particularly:
- `handleFacetToggle`
- Event listeners on facet group controls
- Initialization of facet group toggle buttons

If conflicts exist, determine which implementation should take precedence:
1. Disable overlapping functionality in FacetsManager
2. Modify CollapseManager to work alongside existing code
3. Update templates to use consistent data attributes

#### Potential Conflict Areas in `tabs-manager.js`:

Look for methods that handle tab group visibility, particularly:
- `addToggleButtonToTabGroup` (or similar methods)
- Event handlers for tab group visibility toggles

If conflicts exist, determine which implementation should take precedence. The TabsManager is more likely to have significant conflicts since both managers manipulate tab groups.

### 6. Update Templates (if needed)

Ensure your search result templates include the necessary data attributes for the collapse manager to work:

- `[data-component="facet-group-control"]` on facet group headers
- `[data-component="collapse-all"]` on collapse-all buttons
- `[data-component="facet-group-show-more-button"]` on show more buttons
- `.tabs--center` on tab group containers
- `[data-tab-group-element="tab-list-nav"]` on tab navigation elements

### 7. Testing Plan

Test the integration thoroughly to ensure proper functionality:

1. **Basic Functionality Testing**:
   - Verify facet groups can be expanded and collapsed
   - Confirm "show more" buttons work correctly
   - Check that tab group toggles show/hide the tab navigation

2. **Interaction Testing**:
   - Test interactions between the collapse manager and other managers
   - Ensure no conflicts with existing tab navigation
   - Verify facet selection still works when using collapse functionality

3. **Dynamic Content Testing**:
   - Test that dynamically added content gets proper collapse functionality
   - Change search queries to generate different facet groups
   - Navigate between tabs to ensure proper initialization of new content

4. **Animation Testing**:
   - Verify smooth animations for expanding/collapsing elements
   - Test different browsers to ensure consistent animation behavior
   - Check that transition fallbacks work if animations fail

5. **Accessibility Testing**:
   - Confirm proper ARIA attributes are set (aria-expanded, aria-hidden)
   - Test keyboard navigation for collapsible elements
   - Verify screen readers properly announce state changes

### 8. Performance Considerations

The Global Collapse Manager uses a MutationObserver to watch for DOM changes, which could impact performance. Consider these optimizations:

1. **Targeted Observation**:
   - Modify the observer to watch only the results container rather than the entire document body
   - This change would require modifying the `setupObserver` method in the original collapse manager

2. **Throttle Observer Callbacks**:
   - If performance issues occur, consider throttling the observer callback
   - Add debouncing for operations that process multiple elements

3. **Lazy Initialization**:
   - Consider initializing the collapse manager only when needed
   - For example, delay initialization until after the initial search results are loaded

### 9. Documentation Updates

Update your project documentation to include:

1. **New Data Attributes**:
   - Document the required data attributes for templates
   - Provide examples of proper markup for collapsible elements

2. **CSS Requirements**:
   - Document the required CSS classes and their purpose
   - Include example styles for collapsible elements

3. **Architecture Diagram**:
   - Update any architecture diagrams to include the collapse manager
   - Show relationships with other managers (especially tabs and facets)

4. **Usage Examples**:
   - Provide examples of how to use collapse functionality in the UI
   - Include code snippets for common use cases

## Conclusion

This implementation plan provides a comprehensive approach to integrating the Global Collapse Manager into your Seattle University Search API. By following these steps, you'll enhance the search UI with collapsible elements while maintaining compatibility with your existing architecture.

Remember to thoroughly test the integration, particularly focusing on interactions with existing components like the tabs and facets managers. With proper implementation, the collapse manager will provide a more streamlined and responsive search experience for users.
