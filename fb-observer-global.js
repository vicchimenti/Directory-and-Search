class Collapse {
    constructor() {
        // Existing constructor bindings
        this.toggleOpenState = this.toggleOpenState.bind(this);
        this.openElement = this.openElement.bind(this);
        this.closeElement = this.closeElement.bind(this);
        
        // Set the collapse to expect to be closed when initialized
        this.collapseIsOpen = false;
        
        // Set a default for the expected transition length
        this.expectedTransitionLengthInt = 450;
        
        // Initialize the observer
        this.setupObserver();
    }

    setupObserver() {
        const resultsElement = document.getElementById('results');
        
        if (!resultsElement) {
            console.warn('Results element not found, observer not initialized');
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Look for new collapse buttons that haven't been initialized
                    const newCollapseButtons = document.querySelectorAll('.collapse__button:not([data-collapse-initialized])');
                    
                    newCollapseButtons.forEach(button => {
                        if (!button.collapse) {
                            button.setAttribute('data-collapse-initialized', 'true');
                            this.initializeCollapse(button);
                        }
                    });
                }
            });
        });

        // Configuration for the observer
        const config = {
            childList: true,
            subtree: true
        };

        // Start observing
        this.observer.observe(resultsElement, config);
    }

    initializeCollapse(collapseButton) {
        const collapseContent = collapseButton.nextElementSibling;
        
        if (!collapseContent || !collapseContent.classList.contains('collapse__content')) {
            return;
        }

        // Setup collapse instance
        collapseButton.collapse = new Collapse();
        
        // Add the event listener to the button
        collapseButton.addEventListener('click', collapseButton.collapse.toggleOpenState);

        const { collapse } = collapseButton;
        
        // Flag to check if we are opening on page load
        const openByDefault = collapseContent.classList.contains('collapse__content--open');

        // Set the collapse button
        collapse.collapseButton = collapseButton;

        // Set the collapse content
        collapse.collapseContent = collapseContent;

        // Set the collapse button open class
        collapse.buttonActiveClass = 'collapse__button--open';

        // Set the collapse content open class
        collapse.contentOpenClass = 'collapse__content--open';

        // Set the collapse expanding class string
        collapse.contentExpandingClass = 'collapse__content--expanding';

        // Set the collapse collapsing class string
        collapse.contentCollapsingClass = 'collapse__content--collapsing';

        // Set if the item should transition or just toggle state
        collapse.shouldAnimate = true;

        // Initialize state
        openByDefault ? collapse.openElement() : collapse.closeElement();
    }

    // Rest of your existing Collapse class methods...
    // (All your existing methods remain unchanged)
}

// Initialize
const fbGlobal = new Collapse();