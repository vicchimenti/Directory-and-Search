/**
 * @fileoverview Enhanced Autocomplete Search Manager for Funnelback Search Integration
 * 
 * This class manages real-time search suggestions functionality, integrating with
 * Funnelback search services via a proxy server. It provides a unified search experience
 * with three distinct suggestion types:
 * 1. General search suggestions
 * 2. Staff/Faculty profiles (limited to top 3 results)
 * 3. Academic programs
 * 
 * The manager implements a three-column layout optimized for quick selection and
 * focused user experience. Staff suggestions feature direct profile linking while
 * maintaining search functionality for other suggestion types.
 * 
 * Features:
 * - Real-time suggestions with smart filtering
 * - Three-column suggestion layout:
 *   - General suggestions
 *   - Staff/Faculty profiles (with direct linking)
 *   - Academic programs
 * - Keyboard navigation support (arrows, enter, escape)
 * - Click selection support
 * - Accessible ARIA attributes
 * - Smart debouncing of API calls
 * - Direct profile links for staff (opens in new tab)
 * - Fallback search functionality
 * - Loading states and error handling
 * 
 * Server Integration:
 * - Defers to server-side parameters for staff/faculty search
 * - Supports JSON endpoints for improved performance
 * - Handles rich metadata for staff profiles
 * 
 * Dependencies:
 * - Requires proxy endpoint for Funnelback API access
 * - Requires DOM element with specified input ID
 * - Requires results container for search results display
 * 
 * Configuration Options:
 * @typedef {Object} AutocompleteConfig
 * @property {string} [inputId='autocomplete-concierge-inputField'] - ID of input element
 * @property {string} [collection='seattleu~sp-search'] - Funnelback collection ID for general search
 * @property {string} [profile='_default'] - Search profile name
 * @property {number} [maxResults=10] - Maximum number of suggestions to show
 * @property {number} [minLength=3] - Minimum characters before showing suggestions
 * @property {number} [programLimit=5] - Maximum number of program suggestions to show
 * Note: Staff suggestions are fixed at 3 items
 * 
 * @author Victor Chimenti
 * @version 2.1.0
 * @lastModified 2025-02-14
 */

class AutocompleteSearchManager {
    /**
     * Creates an instance of AutocompleteSearchManager.
     * Initializes the search interface with default or provided configuration.
     * Sets up DOM elements and event listeners.
     * 
     * @param {AutocompleteConfig} [config={}] - Configuration options
     * @throws {Error} If required DOM elements are not found
     */
    constructor(config = {}) {
        console.group('AutocompleteSearchManager Initialization');
        console.log('Configuration:', config);

        this.config = {
            inputId: 'autocomplete-concierge-inputField',
            collections: {
                general: 'seattleu~sp-search',
                staff: 'seattleu~ds-staff',
                programs: 'seattleu~ds-programs'
            },
            profile: '_default',
            maxResults: 10,
            minLength: 3,
            programLimit: 5,
            endpoints: {
                suggest: 'https://funnelback-proxy.vercel.app/proxy/funnelback/suggest',
                search: 'https://funnelback-proxy.vercel.app/proxy/funnelback/search',
                suggestPeople: 'https://funnelback-proxy.vercel.app/proxy/suggestPeople',
                suggestPrograms: 'https://funnelback-proxy.vercel.app/proxy/suggestPrograms'
            },
            ...config
        };
        
        // Initialize DOM elements
        this.inputField = document.getElementById(this.config.inputId);
        if (!this.inputField) {
            console.error('🚫 Search input field not found:', this.config.inputId);
            console.groupEnd();
            return;
        }

        this.form = this.inputField.closest('form');
        if (!this.form) {
            console.error('🚫 Search form not found');
            console.groupEnd();
            return;
        }

        // Get existing elements
        this.clearButton = this.form.querySelector('.clear-search-button');
        this.submitButton = this.form.querySelector('#on-page-search-button');
        this.suggestionsContainer = document.getElementById('autocomplete-suggestions');
        this.resultsContainer = document.getElementById('results');

        console.log('DOM Elements:', {
            clearButton: this.clearButton ? '✓' : '✗',
            submitButton: this.submitButton ? '✓' : '✗',
            suggestionsContainer: this.suggestionsContainer ? '✓' : '✗',
            resultsContainer: this.resultsContainer ? '✓' : '✗'
        });

        this.debounceTimeout = null;
        this.isLoading = false;

        this.#init();
        console.groupEnd();
    }

    /**
     * Initializes the autocomplete functionality.
     * Sets up event listeners for input, form submission, and UI interactions.
     * 
     * @private
     */
    #init() {
        console.log('Initializing event listeners');
        
        this.inputField.addEventListener('input', this.#handleInput.bind(this));
        this.inputField.addEventListener('keydown', this.#handleKeydown.bind(this));
        this.form.addEventListener('submit', this.#handleFormSubmit.bind(this));
        
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => this.#clearSearch());
        }

        document.addEventListener('click', this.#handleClickOutside.bind(this));
        this.#updateButtonStates();
    }

    /**
     * Clears the search input and resets the UI state.
     * 
     * @private
     */
    #clearSearch() {
        console.log('Clearing search');
        this.inputField.value = '';
        this.suggestionsContainer.innerHTML = '';
        this.inputField.focus();
        this.#updateButtonStates();
    }

    /**
     * Updates the visibility and state of clear and submit buttons
     * based on input field value.
     * 
     * @private
     */
    #updateButtonStates() {
        const hasValue = this.inputField.value.trim().length > 0;
        
        if (this.clearButton) {
            this.clearButton.classList.toggle('hidden', !hasValue);
        }
        
        if (this.submitButton) {
            this.submitButton.disabled = !hasValue;
        }
    }

    /**
     * Handles form submission events.
     * Prevents default form submission and triggers search via API.
     * 
     * @private
     * @param {Event} event - The form submit event
     */
    async #handleFormSubmit(event) {
        console.group('Form Submit');
        console.time('totalSubmitTime');
        
        event.preventDefault();
        const query = this.inputField.value.trim();
        
        console.log('Submit Query:', query);
        
        if (!query) {
            console.log('Empty query, submission canceled');
            console.groupEnd();
            return;
        }

        try {
            this.isLoading = true;
            this.#updateLoadingState(true);
            await this.#performSearch(query);
        } catch (error) {
            console.error('Search failed:', error);
            this.#showError('Search failed. Please try again.');
        } finally {
            this.isLoading = false;
            this.#updateLoadingState(false);
            console.timeEnd('totalSubmitTime');
            console.groupEnd();
        }
    }

    /**
     * Handles input events with debouncing.
     * Triggers suggestion fetching after user stops typing.
     * 
     * @private
     * @param {InputEvent} event - The input event
     */
    async #handleInput(event) {
        console.group('Input Event');
        const query = event.target.value.trim();
        console.log(`Input Value: "${query}" (length: ${query.length})`);
        
        this.#updateButtonStates();
        clearTimeout(this.debounceTimeout);
        
        if (query.length < this.config.minLength) {
            console.log(`Query too short (${query.length} < ${this.config.minLength}), clearing suggestions`);
            this.suggestionsContainer.innerHTML = '';
            console.groupEnd();
            return;
        }
    
        // Immediate check for exact length match
        if (query.length === this.config.minLength) {
            console.log('Exact minimum length match, fetching immediately');
            await this.#fetchSuggestions(query);
            console.groupEnd();
            return;
        }
    
        // Debounce for longer queries
        console.log('Setting debounce timer for query');
        this.debounceTimeout = setTimeout(async () => {
            await this.#fetchSuggestions(query);
            console.groupEnd();
        }, 200);
    }

    /**
     * Fetches search suggestions and results for all columns.
     * Staff results are limited to 3 items in frontend display.
     * 
     * @private
     * @param {string} query - The search query
     */
    async #fetchSuggestions(query) {
        console.group('Fetch Suggestions');
        console.time('fetchSuggestions');
        
        try {
            // Basic validation
            if (!query || query.length < this.config.minLength) {
                console.log('Query too short, skipping fetch');
                this.suggestionsContainer.innerHTML = '';
                return;
            }

            // Prepare parameters for each request type
            const generalParams = new URLSearchParams({
                partial_query: query,
                collection: this.config.collections.general,
                profile: this.config.profile
            });

            // Staff query only sends search term - server handles other params
            const peopleParams = new URLSearchParams({
                query: query
            });

            const programParams = new URLSearchParams({
                query: query,
                collection: this.config.collections.programs,
                profile: this.config.profile
            });

            console.log('Request Parameters:', {
                general: Object.fromEntries(generalParams),
                people: Object.fromEntries(peopleParams),
                programs: Object.fromEntries(programParams)
            });

            // Fetch all results concurrently
            const [suggestResponse, peopleResponse, programResponse] = await Promise.all([
                fetch(`${this.config.endpoints.suggest}?${generalParams}`),
                fetch(`${this.config.endpoints.suggestPeople}?${peopleParams}`),
                fetch(`${this.config.endpoints.suggestPrograms}?${programParams}`)
            ]);

            // Log response statuses
            console.log('Response Status:', {
                general: suggestResponse.status,
                people: peopleResponse.status,
                programs: programResponse.status
            });

            if (!suggestResponse.ok) console.warn(`Suggest request failed: ${suggestResponse.status}`);
            if (!peopleResponse.ok) console.warn(`People search request failed: ${peopleResponse.status}`);
            if (!programResponse.ok) console.warn(`Program search request failed: ${programResponse.status}`);

            // Parse responses
            const suggestions = suggestResponse.ok ? await suggestResponse.json() : [];
            const peopleData = peopleResponse.ok ? await peopleResponse.json() : [];
            const programData = programResponse.ok ? await programResponse.json() : { metadata: {}, programs: [] };

            // Process staff results from JSON response - limit to 3 items
            const staffResults = (peopleData || [])
                .map(person => ({
                    title: person.title || '',
                    metadata: person.affiliation || person.position || 'Faculty/Staff',
                    department: person.department || person.college || '',
                    url: person.profileUrl || '',
                    image: person.image || null
                }))
                .filter(staff => staff.title)
                .slice(0, 3); // Hard limit to 3 suggestions regardless of server response

            console.log('Processed Results Count:', {
                suggestions: suggestions.length,
                staff: staffResults.length,
                programs: programData.programs?.length || 0
            });

            const programResults = (programData.programs || [])
                .map(program => ({
                    title: program.title,
                    metadata: program.details?.type || 'Program',
                    department: program.details?.school || '',
                    url: program.url || null,
                    description: program.description || null
                }))
                .slice(0, this.config.programLimit);

            // Display results
            this.#displaySuggestions(suggestions || [], staffResults, programResults);
        } catch (error) {
            console.error('Fetch error:', error);
            this.suggestionsContainer.innerHTML = '';
        } finally {
            console.timeEnd('fetchSuggestions');
            console.groupEnd();
        }
    }

    /**
     * Performs a search using the Funnelback API.
     * 
     * @private
     * @param {string} query - The search query
     * @throws {Error} If the search request fails
     */
    async #performSearch(query) {
        console.group(`Performing search for: "${query}"`);
        console.time('searchRequest');

        const params = new URLSearchParams({
            query: query,
            collection: this.config.collections.general,
            profile: this.config.profile,
            form: 'partial'
        });

        try {
            const url = `${this.config.endpoints.search}?${params}`;
            console.log('Search URL:', url);
            console.log('Search Parameters:', Object.fromEntries(params));

            const response = await fetch(url);
            console.log('Search Response Status:', response.status);
            
            if (!response.ok) throw new Error(`Search failed: ${response.status}`);
            
            const text = await response.text();
            if (this.resultsContainer) {
                this.resultsContainer.innerHTML = `
                    <div id="funnelback-search-container-response" class="funnelback-search-container">
                        ${text}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        } finally {
            console.timeEnd('searchRequest');
            console.groupEnd();
        }
    }

    /**
     * Displays suggestions in a three-column layout.
     * Staff profiles include direct linking capability.
     * 
     * @private
     * @param {Array} suggestions - Array of suggestion objects
     * @param {Array} staffResults - Array of staff profile results
     * @param {Array} programResults - Array of program results
     */
    async #displaySuggestions(suggestions, staffResults, programResults) {
        if (!this.suggestionsContainer) {
            console.warn('Suggestions container not found');
            return;
        }
    
        console.group('Displaying Suggestions');
        console.log('Suggestion Counts:', {
            general: suggestions.length,