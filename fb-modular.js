{/* <script> */}
(function() {
    function initializeFunnelbackHandlers() {
        console.log("Initializing Funnelback handlers");
        
        // Helper function to update content
        async function updateContent(url, targetElement) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const html = await response.text();
                targetElement.innerHTML = html;
            } catch (error) {
                console.error("Error fetching results:", error);
                targetElement.innerHTML = '<p>Error loading results. Please try again.</p>';
            }
        }

        // Main click handler
        function handleClicks(e) {
            console.log("Click detected", e.target);
            
            const resultContainer = document.querySelector('.funnelback-search__body');
            if (!resultContainer) {
                console.error("Results container not found");
                return;
            }

            const handlers = {
                '.facet-group__list a': true,
                '.tab-list__nav a': true,
                '.search-tools__button-group a': true,
                'a.facet-group__clear': true
            };

            for (const selector in handlers) {
                const element = e.target.closest(selector);
                if (element) {
                    e.preventDefault();
                    console.log(`${selector} clicked:`, element.href);
                    updateContent(element.href, resultContainer);
                    break;
                }
            }
        }

        // Attach event listener
        document.addEventListener('click', handleClicks);
        console.log("Event listener attached");
    }

    // Try multiple ways to ensure initialization
    if (document.readyState === 'complete') {
        console.log("Document already complete");
        initializeFunnelbackHandlers();
    } else {
        console.log("Waiting for document to be ready");
        document.addEventListener('DOMContentLoaded', initializeFunnelbackHandlers);
        window.addEventListener('load', initializeFunnelbackHandlers);
    }

    // Also try with jQuery since it's available
    $(document).ready(initializeFunnelbackHandlers);
})();
{/* </script> */}