class IPService {
    constructor() {
        this.ipAddress = null;
        this.fetchPromise = null;
    }

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