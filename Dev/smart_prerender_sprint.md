# Smart Pre-Rendering Enhancement Sprint

## Project Overview

This sprint implements smart pre-rendering to achieve near-instantaneous search redirects while preserving all existing search functionality and optimizations.

### Current Performance
- **Existing System**: 200-700ms redirect with cache optimization
- **Target Goal**: <50ms apparent redirect time (instantaneous user experience)
- **Fallback**: Maintains current performance when pre-rendering unavailable

## Problem Statement

Currently, search redirects from header forms to search results pages take 200-700ms even with optimization. Other institutions achieve apparently instantaneous redirects through server-side pre-rendering. Our previous attempt with `search.tsx` added 2-8 seconds of overhead and conflicted with existing optimizations.

## Solution Architecture

### Smart Pre-Rendering Approach
1. **Preserve existing client-side system** - All current optimizations remain intact
2. **Add non-blocking pre-render trigger** - Fire-and-forget request during form submission
3. **Graceful enhancement** - Pre-rendered results appear instantly when available, fall back to current system when not
4. **Use established SessionService** - Maintain session continuity and analytics integrity

### Key Benefits
- **Zero risk to existing functionality** - All current code paths remain as fallbacks
- **Additive enhancement** - Only improves performance, never degrades it  
- **Minimal code changes** - Three small files affected
- **Production ready** - Non-blocking implementation won't cause failures
- **Session continuity** - Uses established SessionService ID for analytics consistency

## Technical Implementation

### Files to Modify

#### 1. `public/integration.js` (Main Change)

**Location**: In `setupHeaderSearch()` function  
**Change**: Add pre-render trigger before existing redirect

```javascript
// In setupHeaderSearch function - existing form handler
headerSearchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  
  const query = headerSearchInput.value.trim();
  if (!query) return;
  
  const normalizedQuery = normalizeQuery(query);
  
  // Get established session ID from SessionService
  const sessionId = window.SessionService ? window.SessionService.getSessionId() : null;
  
  // NEW: Pre-render trigger (non-blocking, fire-and-forget)
  fetch(`/api/pre-render`, { 
    method: 'POST', 
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query: normalizedQuery,
      sessionId: sessionId  // Use established session ID for continuity
    })
  }).catch(() => {}); // Silent failure - never blocks redirect
  
  // EXISTING: All current redirect logic remains unchanged
  if (window.SessionService && window.SessionService.prepareForSearchRedirect) {
    window.SessionService.prepareForSearchRedirect(normalizedQuery);
  }
  
  window.location.href = `/search-test/?query=${encodeURIComponent(normalizedQuery)}`;
});
```

#### 2. `pages/api/pre-render.ts` (New File)

**Purpose**: Handle pre-render requests in background using established session context  
**Behavior**: Fetches and caches results for instant delivery with session continuity

```typescript
/**
 * @fileoverview Pre-render API for instant search results
 * 
 * This endpoint pre-renders search results in the background to enable
 * near-instantaneous search redirects. Uses existing SessionService for
 * session continuity and analytics integrity.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiClient } from '../../lib/api-client';
import { setCachedSearchResults } from '../../lib/cache';
import { getClientInfo } from '../../lib/ip-service';

interface PreRenderRequest {
  query: string;
  sessionId?: string;
}

interface PreRenderResponse {
  status: string;
  cached?: boolean;
  message?: string;
  sessionId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PreRenderResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const { query, sessionId }: PreRenderRequest = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid query' });
    }

    // Get client info for accurate backend request
    const clientInfo = await getClientInfo(req.headers);
    
    // Create API client with IP forwarding
    const apiClient = createApiClient(req.headers);
    
    // Use established session ID or create fallback
    const useSessionId = sessionId || `prerender_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Prepare search parameters matching existing API
    const params = {
      query: query.trim(),
      collection: 'seattleu~sp-search',
      profile: '_default',
      form: 'partial',
      sessionId: useSessionId  // Use established session ID for analytics continuity
    };

    // Add client IP if available
    if (clientInfo?.ip) {
      params.clientIp = clientInfo.ip;
    }

    console.log(`[PRE-RENDER] Initiating for query: "${query}" with session: ${useSessionId}`);

    // Fire-and-forget: Fetch results and cache them
    apiClient.get('/funnelback/search', { params })
      .then(response => {
        if (response.status === 200) {
          // Cache with extended TTL for pre-rendered content (30 minutes)
          setCachedSearchResults(query, params.collection, params.profile, response.data, 1800);
          console.log(`[PRE-RENDER] Successfully cached results for: "${query}"`);
        } else {
          console.log(`[PRE-RENDER] Backend returned status ${response.status} for: "${query}"`);
        }
      })
      .catch(error => {
        console.log(`[PRE-RENDER] Failed for "${query}":`, error.message);
        // Silent failure - pre-rendering is best effort
      });

    // Return immediately - don't wait for backend
    return res.status(202).json({ 
      status: 'accepted', 
      message: 'Pre-render request initiated',
      sessionId: useSessionId
    });

  } catch (error) {
    console.error('[PRE-RENDER] Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Pre-render failed' 
    });
  }
}
```

#### 3. Search Results Page (Minor Enhancement)

**Location**: Your search results page (likely in search-page-autocomplete.js or similar)  
**Change**: Check for pre-rendered content first, fall back to existing logic

```javascript
// Add to existing search results page initialization
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  
  if (query) {
    // Get session ID from SessionService for consistency
    const sessionId = window.SessionService ? window.SessionService.getSessionId() : null;
    
    // NEW: Check for pre-rendered content first
    checkForPreRenderedResults(query, sessionId)
      .then(preRenderedContent => {
        if (preRenderedContent) {
          console.log(`[PRE-RENDER] Using cached results for: "${query}"`);
          // Use pre-rendered results immediately
          displayResults(preRenderedContent);
        } else {
          console.log(`[PRE-RENDER] No cached results, using standard flow for: "${query}"`);
          // EXISTING: Fall back to current search logic
          performExistingSearch(query);
        }
      })
      .catch(error => {
        console.log(`[PRE-RENDER] Error checking cache, using standard flow:`, error);
        // EXISTING: Always fall back to current logic on any error
        performExistingSearch(query);
      });
  }
});

async function checkForPreRenderedResults(query, sessionId) {
  try {
    // Check cache first with session context
    const params = new URLSearchParams({
      query: query,
      collection: 'seattleu~sp-search',
      profile: '_default',
      prerendered: 'true'
    });
    
    if (sessionId) {
      params.append('sessionId', sessionId);
    }
    
    const response = await fetch(`/api/search?${params}`);
    if (response.ok && response.headers.get('X-Cache-Status') === 'HIT') {
      const html = await response.text();
      return html;
    }
  } catch (error) {
    console.log('[PRE-RENDER] Cache check failed:', error);
  }
  return null;
}

function displayResults(html) {
  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div id="funnelback-search-container-response" class="funnelback-search-container">
        ${html}
      </div>
    `;
    
    // IMPORTANT: Attach existing click handlers and analytics
    if (typeof attachResultClickHandlers === 'function') {
      attachResultClickHandlers(resultsContainer, query);
    }
    
    // Initialize any other existing functionality
    if (window.SearchManager) {
      // Notify SearchManager about new content
      window.SearchManager.updateResults(html);
    }
  }
}

function performExistingSearch(query) {
  // EXISTING: Your current performSearch logic remains unchanged
  if (window.performSearch) {
    window.performSearch(query, 'results');
  } else if (typeof performSearch === 'function') {
    performSearch(query, document.getElementById('results'));
  }
}
```

## SessionService Integration Benefits

### Analytics Continuity
- **Consistent Session Tracking**: Pre-render requests use same session ID as eventual search results
- **Accurate User Journey**: Complete user flow tracked under single session
- **IP Resolution Consistency**: SessionService IP tracking preserved in pre-render requests

### Cache Optimization  
- **Session-Aware Caching**: Results cached with proper session context
- **Personalization Support**: Future personalization features will work correctly
- **Debug Traceability**: Easier to trace complete user journey through logs

## User Experience Flow

### Pre-Render Success Scenario (Target: <50ms)
1. User types in header search form
2. User clicks submit
3. **Pre-render trigger fires** with established session ID (non-blocking, 0ms delay to user)
4. Browser redirects to search results page (immediate)
5. **Pre-rendered results display instantly** using cached content (0-50ms)
6. User sees results with no apparent loading time
7. **Analytics track complete session journey** from form to results

### Pre-Render Miss Scenario (Current: 200-700ms)  
1. User types in header search form
2. User clicks submit with established session ID
3. Pre-render trigger fires but results not yet cached
4. Browser redirects to search results page (immediate)
5. **Existing search logic executes** with same session ID (200-700ms)
6. User sees results with current performance
7. **Session continuity maintained** throughout process

### Failure Scenario (Fallback: 200-700ms)
1. Pre-render API fails completely
2. **All existing functionality works normally** with established session
3. No user-facing impact whatsoever
4. **Analytics and session tracking unaffected**

## Development Workflow

### Phase 1: Core Implementation
1. Create `/api/pre-render.ts` endpoint with SessionService integration
2. Add pre-render trigger to `integration.js` using established session ID
3. Test pre-render functionality with existing cache system and session tracking

### Phase 2: Results Page Enhancement  
1. Add pre-rendered content check to search results page with session context
2. Ensure proper fallback to existing `performSearch()` logic
3. Test both pre-render hit and miss scenarios with session continuity
4. Verify analytics tracking works correctly in all scenarios

### Phase 3: Production Preparation
1. Update header search forms to point to correct results URL
2. Test SessionService integration across different page types
3. Monitor cache hit rates and session tracking accuracy
4. Adjust TTL and session handling if needed

## Testing Strategy

### Unit Tests
- Pre-render API endpoint responds correctly with session context
- Integration.js trigger fires with established session ID without blocking redirect
- Search results page properly falls back to existing logic with session continuity

### Integration Tests  
- Full redirect flow with pre-render success using established session
- Full redirect flow with pre-render failure maintaining session continuity
- SessionService integration works correctly across all scenarios
- Analytics tracking accuracy maintained in all code paths

### Performance Tests
- Measure redirect time with pre-render hits (<50ms target)
- Measure redirect time with pre-render misses (current performance)
- Verify no performance degradation in failure scenarios
- Confirm session tracking doesn't add latency

## Risk Mitigation

### Technical Risks
- **Pre-render API failure**: Silent failure, no impact on user experience
- **SessionService unavailable**: Falls back to temporary session ID
- **Cache corruption**: Falls back to existing search logic
- **Network issues**: Non-blocking implementation prevents hangs

### Session Management Risks  
- **Session ID mismatch**: Fallback to temporary ID ensures functionality
- **Analytics discontinuity**: Established session ID prevents tracking gaps
- **Performance regression**: Session integration adds <5ms overhead maximum

### Implementation Risks  
- **Breaking existing functionality**: All existing code paths preserved as primary fallbacks
- **Session conflicts**: SessionService integration maintains existing behavior
- **Complex deployment**: Minimal file changes, low deployment risk

## Success Metrics

### Primary Goals
- **Redirect time <50ms** when pre-rendering successful
- **Zero degradation** of existing 200-700ms performance
- **Zero breaking changes** to current functionality
- **100% session continuity** maintained across all scenarios

### Secondary Goals
- **Pre-render cache hit rate >60%** for common queries
- **Analytics accuracy >99%** with session tracking
- **Reduced perceived loading time** in user testing
- **Maintained SearchManager integration** with all existing modules

## HTML Form Requirements

### Current Dev Environment
```html
<form id="searchForm" action="https://su-search-dev.vercel.app/search-test" method="GET">
```

### Generic Production Forms
```html
<div data-resultsUrl="/search/">
    <form id="searchForm">
```

**Go-Live Requirement**: Update `data-resultsUrl` to point to search results page or add `action` attribute to forms.

## SessionService Configuration

### Required SessionService Methods
- `getSessionId()` - Used for pre-render session continuity
- `prepareForSearchRedirect()` - Existing optimization preserved
- `getSessionIp()` - IP tracking maintained (if enabled)

### Optional Enhancements
- Consider adding `logPreRenderEvent()` method to SessionService for enhanced tracking
- Potential for `getPreRenderMetrics()` for performance monitoring

## Future Enhancements

### Phase 2 Possibilities
- **Predictive pre-rendering** based on user typing patterns with session context
- **Popular query pre-caching** for frequently searched terms by session history
- **Personalized pre-rendering** using SessionService user behavior tracking

### Performance Monitoring
- **Cache hit rate tracking** for pre-rendered content by session
- **Session journey analysis** from form to results
- **User experience metrics** for perceived loading time with session correlation
- **A/B testing framework** for comparing redirect approaches with session consistency

### SessionService Integration Expansion
- **Pre-render success tracking** in SessionService metrics
- **User behavior prediction** based on session history
- **Cross-session optimization** for returning users

## Conclusion

This smart pre-rendering approach with SessionService integration provides the instantaneous search experience seen at other institutions while maintaining the robustness, functionality, and analytics integrity of the existing system. The implementation is low-risk, high-reward, and preserves all current optimizations as reliable fallbacks while ensuring complete session continuity for accurate analytics and future personalization capabilities.
