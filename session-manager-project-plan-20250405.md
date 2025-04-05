# Session ID Duplication Issue in Seattle University Search API

## Problem Description

Our search API integration is currently generating errors due to multiple session IDs being added to request parameters. The issue occurs in the communication flow between the frontend search components and the backend proxy server.

## Current Behavior

1. A session ID is generated on the client side and stored in sessionStorage
2. This session ID is added to the initial query parameters when making requests
3. Another session ID is being added at a different point in the request pipeline
4. As a result, requests contain duplicate sessionId parameters with different values:
   ```
   https://funnelback-proxy-dev.vercel.app/proxy/funnelback/search?sessionId%5=sophy&collection=seattleu%7Esp-search&sessionId=sess_1743862043460_2kr3s9b
   ```

## Impact

1. The analytics backend is receiving conflicting session information
2. This causes tracking errors and potentially corrupts user journey data
3. Server logs show session ID conflicts and sanitization attempts
4. User interactions may not be properly tracked across their search session

## Root Causes

The duplication appears to be happening because:

1. Session IDs are generated and attached in multiple components:
   - The core search manager 
   - The integration.js script
   - Potentially in page-specific implementations

2. The request pipeline doesn't check for existing session IDs before appending new ones

3. The backend proxy is attempting to sanitize and normalize the session IDs but receiving conflicting information

## Proposed Solutions

1. **Centralized Session ID Management**:
   - Move all session ID generation to a single utility function
   - Ensure all components reference this shared function
   - Implement a session ID provider pattern

2. **Request Parameter Validation**:
   - Check for existing session ID parameters before adding new ones
   - Implement parameter normalization in the request building logic

3. **Backend Validation Improvements**:
   - Enhance the backend parameter handling to identify and resolve duplicates
   - Implement clear logging for parameter conflicts to aid debugging

## Next Steps

1. Map the complete session ID flow through all components
2. Create a centralized session ID service
3. Refactor the API request builders to use this service
4. Implement validation to prevent duplicate parameters
5. Update analytics tracking to use the canonical session ID

## Implementation Checklist

- [ ] Create centralized session utility
- [ ] Audit all components that generate or use session IDs
- [ ] Refactor parameter building functions
- [ ] Add session ID validation
- [ ] Update backend handling
- [ ] Add monitoring for session ID conflicts
- [ ] Test with all integration points
