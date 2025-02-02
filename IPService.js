/**
 * @fileoverview IP Address Service for Funnelback Search Integration
 * 
 * This service is responsible for obtaining and managing the user's IP address
 * to support Funnelback search functionality. It implements a singleton pattern
 * to ensure consistent IP handling across the application and includes caching
 * to minimize API calls.
 * 
 * Usage:
 * import ipService from './ip-service.js';
 * const headers = await ipService.getFunnelbackHeaders();
 * 
 * Features:
 * - Singleton implementation for consistent IP management
 * - Caches IP address to minimize API calls
 * - Graceful error handling if IP fetch fails
 * - Provides formatted headers ready for Funnelback integration
 * 
 * Dependencies:
 * - Requires access to the ipify.org API for IP detection
 * - Uses modern JavaScript features (async/await, classes)
 * 
 * @author [Your Name]
 * @version 1.0.0
 * @lastModified 2025-02-02
 */

class IPService {
    /**
     * Initialize the IP service.
     * Creates a singleton instance with null initial values.
     */
    constructor() {
        this.ipAddress = null;
        this.fetchPromise = null;
    }

    /**
     * Retrieves the user's IP address.
     * Implements caching to avoid unnecessary API calls.
     * 
     * @returns {Promise<string|null>} The user's IP address or null if fetch fails
     */
    async getIPAddress() {
        // If we already have the IP, return it
        if (this.ipAddress) {
            return this.ipAddress;
        }

        // If we're already fetching, return the existing promise
        if (this.fetchPromise) {
            return this.fetchPromise;
        }

        // Create new fetch promise
        this.fetchPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch IP address');
                }

                const data = await response.json();
                this.ipAddress = data.ip;
                resolve(this.ipAddress);
            } catch (error) {
                console.error('Error fetching IP address:', error);
                // If we can't get the IP, resolve with null rather than rejecting
                resolve(null);
            } finally {
                this.fetchPromise = null;
            }
        });

        return this.fetchPromise;
    }

    /**
     * Returns headers formatted for Funnelback integration.
     * Includes X-Forwarded-For header with user's IP.
     * 
     * @returns {Promise<Object>} Headers object ready for fetch requests
     */
    async getFunnelbackHeaders() {
        const ip = await this.getIPAddress();
        return {
            'X-Forwarded-For': ip || '',
            // Add any other required Funnelback headers here
        };
    }
}

// Create a singleton instance
const ipService = new IPService();

// Export the singleton
export default ipService;