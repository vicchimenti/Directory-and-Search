/***
 * SU Funnelback Partial Script
 * 
 * Handles Tabs, Facets and Tools
 */

// dynamic-results.js
// Run immediately without waiting for document ready
console.log("Initializing Funnelback handlers");

// Attach the click handler directly to the document
document.addEventListener('click', async function(e) {
    console.log("Click detected");

    // Check for facet clicks
    const facetAnchor = e.target.closest('.facet-group__list a');
    if (facetAnchor) {
        e.preventDefault();
        console.log("Facet clicked:", facetAnchor.href);
        
        try {
            const response = await fetch(facetAnchor.href);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const html = await response.text();
            document.querySelector('.funnelback-search__body').innerHTML = html;
        } catch (error) {
            console.error("Error fetching facet results:", error);
        }
        return;
    }

    // Check for tab clicks
    const tabElement = e.target.closest('.tab-list__nav a');
    if (tabElement) {
        e.preventDefault();
        console.log("Tab clicked:", tabElement.href);
        
        try {
            const response = await fetch(tabElement.href);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const html = await response.text();
            document.querySelector('.funnelback-search__body').innerHTML = html;
        } catch (error) {
            console.error("Error fetching tab results:", error);
        }
        return;
    }

    // Check for search tools clicks
    const searchTools = e.target.closest('.search-tools__button-group a');
    if (searchTools) {
        e.preventDefault();
        console.log("Search tool clicked:", searchTools.href);
        
        try {
            const response = await fetch(searchTools.href);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const html = await response.text();
            document.querySelector('.funnelback-search__body').innerHTML = html;
        } catch (error) {
            console.error("Error fetching search tools results:", error);
        }
        return;
    }

    // Check for clear facet clicks
    const clearFacets = e.target.closest('a.facet-group__clear');
    if (clearFacets) {
        e.preventDefault();
        console.log("Clear facet clicked:", clearFacets.href);
        
        try {
            const response = await fetch(clearFacets.href);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const html = await response.text();
            document.querySelector('.funnelback-search__body').innerHTML = html;
        } catch (error) {
            console.error("Error fetching clear facet results:", error);
        }
        return;
    }
});
