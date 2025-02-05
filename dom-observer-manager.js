/**
 * @fileoverview DOM Observer Manager for Search Components
 */

class DOMObserverManager {
    #observer;
    #observerConfig;
    #targetElements;
    #callback;

    /**
     * @param {Object} config - Observer configuration
     * @param {string|string[]} config.targets - CSS selectors or element IDs to observe
     * @param {Function} config.callback - Callback function for DOM changes
     * @param {boolean} [config.subtree=true] - Whether to observe descendants
     */
    constructor({ targets, callback, subtree = true }) {
        this.#targetElements = Array.isArray(targets) ? targets : [targets];
        this.#callback = callback;
        this.#observerConfig = {
            childList: true,
            subtree
        };
        
        if (window.location.pathname.includes('search-test')) {
            this.#initializeObserver();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.startObserving.bind(this));
            } else {
                this.startObserving();
            }
        }
    }

    #initializeObserver() {
        this.#observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.#callback(mutation.addedNodes);
                }
            });
        });
    }

    startObserving() {
        this.#targetElements.forEach(selector => {
            const elements = selector.startsWith('#') 
                ? [document.getElementById(selector.slice(1))]
                : Array.from(document.querySelectorAll(selector));

            elements.forEach(element => {
                if (element) {
                    this.#observer.observe(element, this.#observerConfig);
                    console.log(`Observer started watching ${selector}`);
                } else {
                    console.warn(`${selector} not found, waiting for it to appear`);
                    this.#waitForTarget(selector);
                }
            });
        });
    }

    #waitForTarget(selector) {
        const bodyObserver = new MutationObserver((mutations, obs) => {
            const elements = selector.startsWith('#')
                ? [document.getElementById(selector.slice(1))]
                : Array.from(document.querySelectorAll(selector));

            if (elements.some(el => el)) {
                obs.disconnect();
                elements.forEach(element => {
                    if (element) {
                        this.#observer.observe(element, this.#observerConfig);
                        console.log(`${selector} found and observer started`);
                    }
                });
            }
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    destroy() {
        if (this.#observer) {
            this.#observer.disconnect();
        }
    }
}

export default DOMObserverManager;