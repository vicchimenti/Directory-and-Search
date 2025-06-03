/**
 * Send analytics data to the appropriate endpoint
 * @param {Object} data - The analytics data to send
 */
sendAnalyticsData(data) {
  try {
    // Skip analytics if in failed connection state to avoid errors
    if (this.connectionState === "failed") {
      console.log("[RECONNECT] Skipping analytics in failed connection state");
      return;
    }

    // Skip if data is null or undefined
    if (!data) {
      console.warn("[ANALYTICS] No data provided");
      return;
    }

    // Ensure we have the latest session ID and client IP
    // No await here as we don't want to block analytics
    this.checkAndRefreshIdentifiers().catch(() => {
      // Silent error handling
    });

    // Create a deep copy of the data to modify
    const analyticsData = JSON.parse(JSON.stringify(data));

    // Only include sessionId if available and valid
    const sessionId = this.getSessionId();
    if (sessionId && typeof sessionId === 'string' && sessionId.trim()) {
      analyticsData.sessionId = sessionId;
    }

    // Add client IP if available and enabled
    const clientIp = this.getClientIp();
    if (this.config.enableIpTracking && clientIp && typeof clientIp === 'string') {
      analyticsData.clientIp = clientIp;
    }

    // Add timestamp if missing
    if (!analyticsData.timestamp) {
      analyticsData.timestamp = new Date().toISOString();
    }

    // Determine endpoint and prepare data format based on data type
    let endpoint;
    let formattedData;

    // Extract the type from analyticsData and store it
    const dataType = analyticsData.type;

    // IMPORTANT: Remove the type field from analyticsData as this is only used
    // for routing and is not expected by the backend endpoints
    delete analyticsData.type;

    // Format data according to endpoint requirements
    if (dataType === "click") {
      // Click tracking remains the same...
    } else if (dataType === "batch") {
      // Batch tracking remains the same...
    } else {
      // For all other types (facet, pagination, tab, spelling), use supplement endpoint
      endpoint = `${this.config.proxyBaseUrl}${this.config.analyticsEndpoints.supplement}`;

      // For supplement endpoint, make sure we're using query (not originalQuery)
      // and include enrichmentData as expected by the backend
      if (analyticsData.originalQuery && !analyticsData.query) {
        analyticsData.query = analyticsData.originalQuery;
        delete analyticsData.originalQuery;
      }

      // Ensure we have a valid query - THIS IS THE KEY FIX
      if (!analyticsData.query || typeof analyticsData.query !== 'string') {
        if (this.originalQuery && typeof this.originalQuery === 'string') {
          analyticsData.query = this.originalQuery;
        } else {
          // Skip this analytics event if no valid query can be found
          console.warn("[ANALYTICS] Skipping event due to missing valid query");
          return;
        }
      }

      // Sanitize query
      analyticsData.query = this.sanitizeValue(analyticsData.query);

      // Create a properly formatted object for supplement endpoint
      formattedData = {
        query: analyticsData.query,
      };

      // Only add sessionId if it's a valid string
      if (sessionId && typeof sessionId === 'string' && sessionId.trim()) {
        formattedData.sessionId = sessionId;
      }

      // Only add client IP if it's a valid string
      if (clientIp && typeof clientIp === 'string' && clientIp.trim()) {
        formattedData.clientIp = clientIp;
      }

      // Add resultCount if provided and is a number
      if (analyticsData.resultCount !== undefined && !isNaN(analyticsData.resultCount)) {
        formattedData.resultCount = Number(analyticsData.resultCount);
      }

      // Process enrichmentData if provided
      if (analyticsData.enrichmentData && typeof analyticsData.enrichmentData === 'object') {
        // Create a clean enrichmentData object
        const cleanEnrichmentData = {};

        // Copy actionType only if it's a valid string
        if (analyticsData.enrichmentData.actionType && 
            typeof analyticsData.enrichmentData.actionType === 'string') {
          cleanEnrichmentData.actionType = this.sanitizeValue(
            analyticsData.enrichmentData.actionType
          );
        } else {
          // Skip this analytics event if no valid actionType
          console.warn("[ANALYTICS] Skipping event due to missing valid actionType");
          return;
        }

        // For tab changes
        if (cleanEnrichmentData.actionType === "tab") {
          if (analyticsData.enrichmentData.tabName && 
              typeof analyticsData.enrichmentData.tabName === 'string') {
            cleanEnrichmentData.tabName = this.sanitizeValue(
              analyticsData.enrichmentData.tabName
            );
          } else {
            // Skip this tab event if no valid tabName
            console.warn("[ANALYTICS] Skipping tab event due to missing valid tabName");
            return;
          }
        }

        // For facet selections
        if (cleanEnrichmentData.actionType === "facet") {
          // Similar validation for facet fields...
        }

        // For pagination
        if (cleanEnrichmentData.actionType === "pagination") {
          if (analyticsData.enrichmentData.pageNumber !== undefined) {
            // Ensure pageNumber is a valid number
            const pageNum = parseInt(analyticsData.enrichmentData.pageNumber, 10);
            if (!isNaN(pageNum)) {
              cleanEnrichmentData.pageNumber = pageNum;
            } else {
              // Skip this pagination event if pageNumber is not a valid number
              console.warn("[ANALYTICS] Skipping pagination event due to invalid pageNumber");
              return;
            }
          } else {
            // Skip this pagination event if no pageNumber
            console.warn("[ANALYTICS] Skipping pagination event due to missing pageNumber");
            return;
          }
        }

        // For spelling suggestions
        if (cleanEnrichmentData.actionType === "spelling") {
          // Similar validation for spelling fields...
        }

        // Include timestamp if provided and valid
        if (analyticsData.enrichmentData.timestamp && 
            typeof analyticsData.enrichmentData.timestamp === 'string') {
          cleanEnrichmentData.timestamp = analyticsData.enrichmentData.timestamp;
        }

        // Add the cleaned enrichmentData to formattedData only if it has properties
        if (Object.keys(cleanEnrichmentData).length > 0) {
          formattedData.enrichmentData = cleanEnrichmentData;
        }
      }
    }

    // Log formatted data for debugging (can be removed in production)
    console.debug("[ANALYTICS] Sending data:", endpoint, formattedData);

    // Send the data using sendBeacon if available (works during page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(formattedData)], {
        type: "application/json",
      });

      const success = navigator.sendBeacon(endpoint, blob);
      if (!success) {
        this.sendAnalyticsWithFetch(endpoint, formattedData);
      }
      return;
    }

    // Fallback to fetch with keepalive
    this.sendAnalyticsWithFetch(endpoint, formattedData);
  } catch (error) {
    // Log but still silently handle
    console.error("[ANALYTICS] Error processing analytics data:", error);
  }
}