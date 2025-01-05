/**
 * The default module class for all the things that need to collapse / open
 * @class
 */
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
        // Check if the modal is closed
        if (!this.isOpen) {
            // If the collapse should not animate between states
            if (!this.collapseShouldAnimate) {
                // If it is currently closed open it
                this.openElement();
            }

            // If the collapse should animate between states
            if (this.collapseShouldAnimate) {
                this.transitionItemOpen();
            }
        } else {
            // If the collapse should not animate between states
            if (!this.collapseShouldAnimate) {
                // If it is currently open, close it
                this.closeElement();
            }

            // If the collapse should animate between states
            if (this.collapseShouldAnimate) {
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
const fbGlobal = new Collapse();