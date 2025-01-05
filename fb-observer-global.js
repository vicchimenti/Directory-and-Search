/**
 * The default module class for all the things that need to collapse / open
 * @class
 */
class Collapse {
    constructor() {
        console.log('[Collapse] Class instantiated');
        
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
        console.log('[Collapse] Setting up observer...');
        
        // Watch the entire document for facet additions
        const targetNode = document.body;
        
        if (!targetNode) {
            console.warn('[Collapse] Document body not found, observer not initialized');
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for facet group controls
                            const facetButtons = node.querySelectorAll('[data-component="facet-group-control"]');
                            console.log('[Collapse] Found facet buttons:', facetButtons.length);
                            
                            facetButtons.forEach(button => {
                                if (!button.hasAttribute('data-collapse-initialized')) {
                                    this.initializeCollapse(button);
                                }
                            });
                            
                            // Also look for the collapse-all button
                            const collapseAllButtons = node.querySelectorAll('[data-component="collapse-all"]');
                            console.log('[Collapse] Found collapse-all buttons:', collapseAllButtons.length);
                            
                            collapseAllButtons.forEach(button => {
                                if (!button.hasAttribute('data-collapse-initialized')) {
                                    this.initializeCollapse(button);
                                }
                            });
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
        this.observer.observe(targetNode, config);
        console.log('[Collapse] Observer started');
        
        // Check for existing buttons
        this.initializeExistingButtons();
    }
    
    initializeExistingButtons() {
        // Initialize any existing facet buttons
        const existingFacetButtons = document.querySelectorAll('[data-component="facet-group-control"]:not([data-collapse-initialized])');
        console.log('[Collapse] Found existing facet buttons:', existingFacetButtons.length);
        
        existingFacetButtons.forEach(button => {
            this.initializeCollapse(button);
        });
        
        // Initialize any existing collapse-all buttons
        const existingCollapseAllButtons = document.querySelectorAll('[data-component="collapse-all"]:not([data-collapse-initialized])');
        console.log('[Collapse] Found existing collapse-all buttons:', existingCollapseAllButtons.length);
        
        existingCollapseAllButtons.forEach(button => {
            this.initializeCollapse(button);
        });
    }

    initializeCollapse(button) {
        console.log('[Collapse] Initializing button:', button);
        
        // Mark as initialized
        button.setAttribute('data-collapse-initialized', 'true');
        
        // Find the associated content based on data-component
        let content;
        if (button.getAttribute('data-component') === 'collapse-all') {
            content = button.closest('.facet').querySelector('[data-component="facet-group-content"]');
        } else {
            content = button.nextElementSibling;
        }
        
        if (!content) {
            console.warn('[Collapse] No content found for button:', button);
            return;
        }
        
        // Setup collapse instance
        button.collapse = new Collapse();
        
        console.log('[Collapse] Adding click event listener');
        button.addEventListener('click', button.collapse.toggleOpenState);

        const { collapse } = button;
        
        // Check if open by default
        const openByDefault = button.classList.contains('facet-group__title--open');
        
        // Set up the collapse properties
        collapse.collapseButton = button;
        collapse.collapseContent = content;
        collapse.buttonActiveClass = 'facet-group__title--open';
        collapse.contentOpenClass = 'facet-group__list--open';
        collapse.contentExpandingClass = 'facet-group__list--expanding';
        collapse.contentCollapsingClass = 'facet-group__list--collapsing';
        collapse.shouldAnimate = true;

        // Initialize state
        openByDefault ? collapse.openElement() : collapse.closeElement();
    }

    /**
     * Sets the wrapping element (if required)
     * @param {HTMLElement} collapseWrapperElement - The wrapper element for the collapse
     */
    set collapseWrapper(collapseWrapperElement) {
        this.collapseWrapperElement = collapseWrapperElement;
    }

    /**
     * Gets the wrapping element
     * @returns {HTMLElement}
     */
    get collapseWrapper() {
        return this.collapseWrapperElement;
    }

    /**
     * Sets the collapse button element
     * @param {HTMLElement} collapseButtonElement - The element for the collapse button
     */
    set collapseButton(collapseButtonElement) {
        this.collapseButtonElement = collapseButtonElement;
    }

    /**
     * Gets the collapse button element
     * @returns {HTMLElement}
     */
    get collapseButton() {
        return this.collapseButtonElement;
    }

    /**
     * Sets the collapse content element
     * @param {HTMLElement} collapseContentElement - The element for the collapse content
     */
    set collapseContent(collapseContentElement) {
        this.collapseContentElement = collapseContentElement;
    }

    /**
     * Gets the collapse content element
     * @returns {HTMLElement}
     */
    get collapseContent() {
        return this.collapseContentElement;
    }

    /**
     * Sets the class string to be added to the title when the collapse is open
     * @param {string} buttonActiveClassString - The string to be added to the title
     */
    set buttonActiveClass(buttonActiveClassString) {
        this.buttonActiveClassString = buttonActiveClassString;
    }

    /**
     * Sets the class string to be added to the content when open
     * @param {string} contentOpenClassString - The string to be added to the content when open
     */
    set contentOpenClass(contentOpenClassString) {
        this.contentOpenClassString = contentOpenClassString;
    }

    /**
     * Sets the class string for the accordion expanding class
     * @param {string} contentExpandingClassString - The string for the content expanding class
     */
    set contentExpandingClass(contentExpandingClassString) {
        this.contentExpandingClassString = contentExpandingClassString;
    }

    /**
     * Sets the class string for the accordion collapsing class
     * @param {string} contentCollapsingClassString - The string for the content collapsing class
     */
    set contentCollapsingClass(contentCollapsingClassString) {
        this.contentCollapsingClassString = contentCollapsingClassString;
    }

    /**
     * Sets if this collapse component should animate the open / close states
     * @param {bool} collapseShouldAnimate - If this collapse item should animate
     */
    set shouldAnimate(collapseShouldAnimate) {
        this.collapseShouldAnimate = collapseShouldAnimate;
    }

    /**
     * Sets the current state of the collapse (Open or closed)
     * @param {bool} isOpen - If the collapse is currently open
     */
    set collapseIsOpen(isOpen) {
        this.isOpen = isOpen;
    }

    /**
     * Gets the current state of the collapse (Open or Closed)
     */
    get collapseIsOpen() {
        return this.isOpen;
    }

    /**
     * Gets the current transition state
     * @return {bool}
     */
    get isTransitionRunning() {
        return this.transitionRunning;
    }

    /**
     * Sets the expected transition length in ms
     * @param {number} expectedTransitionLengthInt - The expected transition length in ms
     */
    set expectedTransitionLength(expectedTransitionLengthInt) {
        this.expectedTransitionLengthInt = expectedTransitionLengthInt;
    }

    /**
     * Toggle the open state of the collapse
     * @method
     */
    toggleOpenState() {
        console.log('Toggle open state called, current state:', this.isOpen);
        // Check if the modal is closed
        if (!this.isOpen) {
            // If the collapse should not animate between states
            if (!this.collapseShouldAnimate) {
                console.log('Opening without animation');
                // If it is currently closed open it
                this.openElement();
            }

            // If the collapse should animate between states
            if (this.collapseShouldAnimate) {
                console.log('Opening with animation');
                this.transitionItemOpen();
            }
        } else {
            // If the collapse should not animate between states
            if (!this.collapseShouldAnimate) {
                console.log('Closing without animation');
                // If it is currently open, close it
                this.closeElement();
            }

            // If the collapse should animate between states
            if (this.collapseShouldAnimate) {
                console.log('Closing with animation');
                this.transitionItemClosed();
            }
        }
    }

    /**
     * Helper method to transition an accordion item open
     * @method
     */
    transitionItemOpen() {
        const content = this.collapseContentElement;
        let called = false;
        this.transitionRunning = true;
        this.isOpen = true;
        content.style.display = 'inherit';

        // Set the classes on the element as open
        this.openElement();

        // Add class to set the base height to start from (0px)
        content.classList.add(this.contentExpandingClassString);

        // Set the height to the max of the element (but with a fixed px size) so we have a point to transition to
        content.style.height = `${content.scrollHeight}px`;

        // Attach a once off listener to remove the expanding classes leaving it open without height modification
        content.addEventListener(
            'transitionend',
            () => {
                called = true;
                // Reset the element to a collapsed state
                content.classList.remove(this.contentExpandingClassString);
                // fixed height is no longer needed
                content.style.height = '';
                this.transitionRunning = false;
            },
            { once: true }
        );

        // If the transition has failed for any reason force it to end
        setTimeout(() => {
            if (!called) {
                content.dispatchEvent(new window.Event('transitionend'));
            }
        }, this.expectedTransitionLengthInt);
    }

    /**
     * Helper method to transition an accordion item closed/collapsed
     * @method
     */
    transitionItemClosed() {
        const content = this.collapseContentElement;
        let called = false;
        this.transitionRunning = true;
        this.isOpen = false;

        // Start transition by giving it a fixed height
        content.style.height = `${content.scrollHeight}px`;
        // After a minor delay add a class to set the height to 0 to trigger the transition
        setTimeout(() => {
            content.classList.add(this.contentCollapsingClassString);
        }, 50);

        // Attach a once off listener to remove the collapse and hide the content
        content.addEventListener(
            'transitionend',
            () => {
                called = true;
                // Reset the element to a collapsed state
                content.classList.remove(this.contentCollapsingClassString);
                this.closeElement();
                content.style.height = '';
                content.style.display = 'none';
                this.transitionRunning = false;
            },
            { once: true }
        );

        // If the transition has failed for any reason force it to end
        setTimeout(() => {
            if (!called) {
                content.dispatchEvent(new window.Event('transitionend'));
            }
        }, this.expectedTransitionLengthInt);
    }

    /**
     * Adds the classes to the open elements
     * @method
     */
    openElement() {
        // Set the aria tag for the control
        this.collapseButtonElement.setAttribute('aria-expanded', 'true');
        // Sets aria to show when elements are open
        this.collapseContentElement.setAttribute('aria-hidden', 'false');
        // Add the open class to the button
        this.collapseButtonElement.classList.add(this.buttonActiveClassString);
        // Add the open class to the content
        this.collapseContentElement.classList.add(this.contentOpenClassString);
        // Set our open state
        this.isOpen = true;
        // Opens for a11y
        this.collapseContentElement.style.display = 'inherit';

        if (this.collapseWrapperElement) {
            this.collapseWrapperElement.classList.add(this.contentOpenClassString);
        }
    }

    /**
     * Removes the classes from the open elements
     * @method
     */
    closeElement() {
        // Set the aria tag for the control
        this.collapseButtonElement.setAttribute('aria-expanded', 'false');
        // Sets aria to hide on parent element when element collapsed.
        this.collapseContentElement.setAttribute('aria-hidden', 'true');
        // Add the open class to the button
        this.collapseButtonElement.classList.remove(this.buttonActiveClassString);
        // Add the open class to the content
        this.collapseContentElement.classList.remove(this.contentOpenClassString);
        // Sets our open state
        this.isOpen = false;
        // Hides for a11y
        this.collapseContentElement.style.display = 'none';

        if (this.collapseWrapperElement) {
            this.collapseWrapperElement.classList.remove(this.contentOpenClassString);
        }
    }
}

// Initialize
console.log('[Collapse] Creating global instance');
const fbGlobal = new Collapse();