/**
 * @fileoverview [PRODUCTION ASSET] Global Collapse Manager for Funnelback Search UI
 * 
 * PRODUCTION VERSION - Seattle University search implementation
 * 
 * This class manages all collapsible elements in the Funnelback search interface.
 * It handles initialization, state management, and animations for collapsible
 * components like facets, filters, and tab groups. Uses MutationObserver to
 * handle dynamically added content.
 * 
 * Features:
 * - Manages collapsible facet groups
 * - Handles tab group visibility toggles
 * - Controls show more/less functionality
 * - Supports animated transitions
 * - Maintains ARIA attributes for accessibility
 * - Handles dynamic content updates
 * 
 * Dependencies:
 * - Requires specific DOM elements with data attributes:
 *   - [data-component="facet-group-control"]
 *   - [data-component="collapse-all"]
 *   - [data-component="facet-group-show-more-button"]
 * - Requires specific CSS classes for transitions
 * 
 * @namespace GlobalCollapseManager
 * @author Victor Chimenti
 * @version 5.0.0
 * @productionVersion 1.1.1
 * @environment production
 * @status stable
 * @license MIT
 * @lastModified 2025-03-12
 */

class Collapse {
    /**
     * Initializes the Collapse manager.
     * Sets up initial bindings, state, and observer.
     * 
     * @constructor
     */
    constructor() {
        // Bind methods to ensure correct 'this' context
        this.toggleOpenState = this.toggleOpenState.bind(this);
        this.openElement = this.openElement.bind(this);
        this.closeElement = this.closeElement.bind(this);
        
        // Initialize state
        this.collapseIsOpen = false;
        this.expectedTransitionLengthInt = 450;
        
        // Set up observer for dynamic content
        this.setupObserver();
    }

    /**
     * Sets up MutationObserver to watch for dynamically added content.
     * Initializes existing elements and sets up observers for new ones.
     * 
     * @private
     */
    setupObserver() {
        const targetNode = document.body;
        
        if (!targetNode) {
            console.warn('[Collapse] Document body not found, observer not initialized');
            return;
        }

        // Initialize existing elements
        this.addToggleButtonsToTabGroups();

        // Create and configure observer
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Handle tab groups
                            const tabGroups = node.querySelectorAll('.tabs--center');
                            tabGroups.forEach(tabGroup => {
                                if (!tabGroup.hasAttribute('data-toggle-initialized')) {
                                    this.addToggleButtonToTabGroup(tabGroup);
                                }
                            });

                            // Handle facet buttons
                            const facetButtons = node.querySelectorAll('[data-component="facet-group-control"]');                            
                            facetButtons.forEach(button => {
                                if (!button.hasAttribute('data-collapse-initialized')) {
                                    this.initializeCollapse(button);
                                }
                            });
                            
                            // Handle collapse-all buttons
                            const collapseAllButtons = node.querySelectorAll('[data-component="collapse-all"]');                            
                            collapseAllButtons.forEach(button => {
                                if (!button.hasAttribute('data-collapse-initialized')) {
                                    this.initializeCollapse(button);
                                }
                            });

                            // Handle show more buttons
                            const showMoreButtons = node.querySelectorAll('[data-component="facet-group-show-more-button"]');                           
                            showMoreButtons.forEach(button => {
                                if (!button.hasAttribute('data-collapse-initialized')) {
                                    this.initializeShowMore(button);
                                }
                            });
                        }
                    });
                }
            });
        });

        // Start observing with configuration
        this.observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        
        // Initialize any existing buttons
        this.initializeExistingButtons();
    }
    
    /**
     * Initializes any buttons that exist when the manager is first created.
     * 
     * @private
     */
    initializeExistingButtons() {
        // Initialize facet buttons
        const existingFacetButtons = document.querySelectorAll('[data-component="facet-group-control"]:not([data-collapse-initialized])');   
        existingFacetButtons.forEach(button => {
            this.initializeCollapse(button);
        });
        
        // Initialize collapse-all buttons
        const existingCollapseAllButtons = document.querySelectorAll('[data-component="collapse-all"]:not([data-collapse-initialized])');        
        existingCollapseAllButtons.forEach(button => {
            this.initializeCollapse(button);
        });

        // Initialize show more buttons
        const existingShowMoreButtons = document.querySelectorAll('[data-component="facet-group-show-more-button"]:not([data-collapse-initialized])'); 
        existingShowMoreButtons.forEach(button => {
            this.initializeShowMore(button);
        });
    }

    /**
     * Adds toggle buttons to all tab groups in the document.
     * 
     * @private
     */
    addToggleButtonsToTabGroups() {
        const tabGroups = document.querySelectorAll('.tabs--center');
        tabGroups.forEach(tabGroup => {
            this.addToggleButtonToTabGroup(tabGroup);
        });
    }

    /**
     * Adds a toggle button to a specific tab group.
     * 
     * @private
     * @param {HTMLElement} tabGroup - The tab group element to add the toggle to
     */
    addToggleButtonToTabGroup(tabGroup) {
        if (tabGroup.hasAttribute('data-toggle-initialized')) {
            return;
        }

        // Create toggle button with proper HTML structure
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'tab-group__toggle';
        toggleButton.setAttribute('aria-expanded', 'true');
        
        toggleButton.innerHTML = `
            <svg class="tab-group__icon tab-group__icon--closed">
                <use href="#add"></use>
            </svg>
            <svg class="tab-group__icon tab-group__icon--open">
                <use href="#subtract"></use>
            </svg>
            <span class="tab-group__text tab-group__text--show">Show Filters</span>
            <span class="tab-group__text tab-group__text--hide">Hide Filters</span>
            <span class="sr-only">Toggle filters visibility</span>
        `;

        // Find and verify tab list nav
        const tabListNav = tabGroup.querySelector('[data-tab-group-element="tab-list-nav"]');
        if (!tabListNav) {
            console.warn('[Collapse] No tab list nav found in tab group');
            return;
        }

        // Insert and setup toggle button
        tabListNav.parentNode.insertBefore(toggleButton, tabListNav);
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            toggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
            toggleButton.classList.toggle('tab-group__toggle--collapsed');
            
            if (isExpanded) {
                tabListNav.style.display = 'none';
                tabListNav.setAttribute('aria-hidden', 'true');
            } else {
                tabListNav.style.display = '';
                tabListNav.setAttribute('aria-hidden', 'false');
            }
        });

        tabGroup.setAttribute('data-toggle-initialized', 'true');
    }

    /**
     * Initializes a show more button for facet groups.
     * 
     * @private
     * @param {HTMLElement} button - The show more button to initialize
     */
    initializeShowMore(button) {
        button.setAttribute('data-collapse-initialized', 'true');
        
        const facetGroup = button.closest('.facet-group__list');
        if (!facetGroup) {
            console.warn('[Collapse] No parent facet group found for show more button');
            return;
        }

        button.addEventListener('click', () => {
            const hiddenItems = facetGroup.querySelectorAll('.facet-group__list-item--hidden');
            hiddenItems.forEach(item => {
                item.classList.remove('facet-group__list-item--hidden');
            });
            button.style.display = 'none';
        });
    }

    /**
     * Initializes a collapse button with all necessary properties and event listeners.
     * 
     * @private
     * @param {HTMLElement} button - The button to initialize
     */
    initializeCollapse(button) {
        button.setAttribute('data-collapse-initialized', 'true');
        
        // Find associated content
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
        button.addEventListener('click', button.collapse.toggleOpenState);
        const { collapse } = button;
        
        // Configure collapse properties
        collapse.collapseButton = button;
        collapse.collapseContent = content;
        collapse.buttonActiveClass = 'facet-group__title--open';
        collapse.contentOpenClass = 'facet-group__list--open';
        collapse.contentExpandingClass = 'facet-group__list--expanding';
        collapse.contentCollapsingClass = 'facet-group__list--collapsing';
        collapse.shouldAnimate = true;

        // Initialize state based on default setting
        const openByDefault = button.classList.contains('facet-group__title--open');
        openByDefault ? collapse.openElement() : collapse.closeElement();
    }

    // Getters and Setters

    /**
     * Sets the wrapping element for the collapse.
     * @param {HTMLElement} collapseWrapperElement - The wrapper element
     */
    set collapseWrapper(collapseWrapperElement) {
        this.collapseWrapperElement = collapseWrapperElement;
    }

    /**
     * Gets the wrapping element.
     * @returns {HTMLElement}
     */
    get collapseWrapper() {
        return this.collapseWrapperElement;
    }

    /**
     * Sets the collapse button element.
     * @param {HTMLElement} collapseButtonElement - The button element
     */
    set collapseButton(collapseButtonElement) {
        this.collapseButtonElement = collapseButtonElement;
    }

    /**
     * Gets the collapse button element.
     * @returns {HTMLElement}
     */
    get collapseButton() {
        return this.collapseButtonElement;
    }

    /**
     * Sets the collapse content element.
     * @param {HTMLElement} collapseContentElement - The content element
     */
    set collapseContent(collapseContentElement) {
        this.collapseContentElement = collapseContentElement;
    }

    /**
     * Gets the collapse content element.
     * @returns {HTMLElement}
     */
    get collapseContent() {
        return this.collapseContentElement;
    }

    /**
     * Sets the active class for the button.
     * @param {string} buttonActiveClassString - The class name
     */
    set buttonActiveClass(buttonActiveClassString) {
        this.buttonActiveClassString = buttonActiveClassString;
    }

    /**
     * Sets the open class for the content.
     * @param {string} contentOpenClassString - The class name
     */
    set contentOpenClass(contentOpenClassString) {
        this.contentOpenClassString = contentOpenClassString;
    }

    /**
     * Sets the expanding class for the content.
     * @param {string} contentExpandingClassString - The class name
     */
    set contentExpandingClass(contentExpandingClassString) {
        this.contentExpandingClassString = contentExpandingClassString;
    }

    /**
     * Sets the collapsing class for the content.
     * @param {string} contentCollapsingClassString - The class name
     */
    set contentCollapsingClass(contentCollapsingClassString) {
        this.contentCollapsingClassString = contentCollapsingClassString;
    }

    /**
     * Sets whether the collapse should animate.
     * @param {boolean} collapseShouldAnimate - Whether to animate
     */
    set shouldAnimate(collapseShouldAnimate) {
        this.collapseShouldAnimate = collapseShouldAnimate;
    }

    /**
     * Sets the open state of the collapse.
     * @param {boolean} isOpen - Whether the collapse is open
     */
    set collapseIsOpen(isOpen) {
        this.isOpen = isOpen;
    }

    /**
     * Gets the open state of the collapse.
     * @returns {boolean}
     */
    get collapseIsOpen() {
        return this.isOpen;
    }

    /**
     * Gets whether a transition is currently running.
     * @returns {boolean}
     */
    get isTransitionRunning() {
        return this.transitionRunning;
    }

    /**
     * Sets the expected transition duration.
     * @param {number} expectedTransitionLengthInt - Duration in milliseconds
     */
    set expectedTransitionLength(expectedTransitionLengthInt) {
        this.expectedTransitionLengthInt = expectedTransitionLengthInt;
    }

    /**
     * Toggles the open state of the collapse.
     * Handles both animated and non-animated transitions.
     */
    toggleOpenState() {
        if (!this.isOpen) {
            if (!this.collapseShouldAnimate) {
                this.openElement();
            } else {
                this.transitionItemOpen();
            }
        } else {
            if (!this.collapseShouldAnimate) {
                this.closeElement();
            } else {
                this.transitionItemClosed();
            }
        }
    }

    /**
     * Transitions an item to its open state with animation.
     * 
     * @private
     */
    transitionItemOpen() {
        const content = this.collapseContentElement;
        let called = false;
        this.transitionRunning = true;
        this.isOpen = true;
        content.style.display = 'inherit';

        this.openElement();
        content.classList.add(this.contentExpandingClassString);
        content.style.height = `${content.scrollHeight}px`;

        content.addEventListener(
            'transitionend',
            () => {
                called = true;
                content.classList.remove(this.contentExpandingClassString);
                content.style.height = '';
                this.transitionRunning = false;
            },
            { once: true }
        );

        setTimeout(() => {
            if (!called) {
                content.dispatchEvent(new window.Event('transitionend'));
            }
        }, this.expectedTransitionLengthInt);
    }

    /**
     * Transitions an item to its closed state with animation.
     * 
     * @private
     */
    transitionItemClosed() {
        const content = this.collapseContentElement;
        let called = false;
        this.transitionRunning = true;
        this.isOpen = false;

        content.style.height = `${content.scrollHeight}px`;
        setTimeout(() => {
            content.classList.add(this.contentCollapsingClassString);
        }, 50);

        content.addEventListener(
            'transitionend',
            () => {
                called = true;
                content.classList.remove(this.contentCollapsingClassString);
                this.closeElement();
                content.style.height = '';
                content.style.display = 'none';
                this.transitionRunning = false;
            },
            { once: true }
        );

        setTimeout(() => {
            if (!called) {
                content.dispatchEvent(new window.Event('transitionend'));
            }
        }, this.expectedTransitionLengthInt);
    }

    /**
     * Opens a collapse element, updating classes and ARIA attributes.
     * 
     * @public
     */
    openElement() {
        this.collapseButtonElement.setAttribute('aria-expanded', 'true');
        this.collapseContentElement.setAttribute('aria-hidden', 'false');
        this.collapseButtonElement.classList.add(this.buttonActiveClassString);
        this.collapseContentElement.classList.add(this.contentOpenClassString);
        this.isOpen = true;
        this.collapseContentElement.style.display = 'inherit';

        if (this.collapseWrapperElement) {
            this.collapseWrapperElement.classList.add(this.contentOpenClassString);
        }
    }

    /**
     * Closes a collapse element, updating classes and ARIA attributes.
     * 
     * @public
     */
    closeElement() {
        this.collapseButtonElement.setAttribute('aria-expanded', 'false');
        this.collapseContentElement.setAttribute('aria-hidden', 'true');
        this.collapseButtonElement.classList.remove(this.buttonActiveClassString);
        this.collapseContentElement.classList.remove(this.contentOpenClassString);
        this.isOpen = false;
        this.collapseContentElement.style.display = 'none';

        if (this.collapseWrapperElement) {
            this.collapseWrapperElement.classList.remove(this.contentOpenClassString);
        }
    }
}

// Initialize and export singleton instance
const fbGlobal = new Collapse();
export default fbGlobal;