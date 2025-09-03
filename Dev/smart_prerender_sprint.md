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

### Key Benefits
- **Zero risk to existing functionality** - All current code paths remain as fallbacks
- **Additive enhancement** - Only improves performance, never degrades it  
- **Minimal code changes** - Three small files affected
- **Production ready** - Non-blocking implementation won't cause failures

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
  
  // NEW: Pre-render trigger (non-blocking, fire-and-forget)
  fetch(`/api/pre-render?query=${encodeURIComponent(normalizedQuery)}`, { 
    method: 'POST', 
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: normalizedQuery })
  }).catch(() => {}); // Silent failure - never blocks redirect
  
  // EXISTING: All current redirect logic remains unchanged
  if (window.SessionService && window.SessionService.prepareForSearchRedirect) {
    window.SessionService.prepareForSearchRedirect(normalizedQuery);
  }
  
  window.location.href = `/search-test/?query=${encodeURIComponent(normalizedQuery)}`;
});
```

#### 2. `pages/api/pre-render.ts` (New File)

**Purpose**: Handle pre-render requests in background  
**Behavior**: Fetches and caches results for instant delivery

```typescript
/**
 * @fileoverview Pre-render API for instant search results
 * 
 * This endpoint pre-renders search results in the background to enable
 * near-instantaneous search redirects. Uses existing backend infrastructure.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiClient } from '../../lib/api-client';
import { setCachedSearchResults } from '../../lib/cache';
import { getClientInfo } from '../../lib/ip-service';

interface PreRenderRequest {
  query: string;
}

interface PreRenderResponse {
  status: string;
  cached?: boolean;
  message?: string;
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
    const { query }: PreRenderRequest = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid query' });
    }

    // Get client info for accurate backend request
    const clientInfo = await getClientInfo(req.headers);
    
    // Create API client with IP forwarding
    const apiClient = createApiClient(req.headers);
    
    // Generate session ID for this pre-render request
    const tempSessionId = `prerender_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Prepare search parameters matching existing API
    const params = {
      query: query.trim(),
      collection: 'seattleu~sp-search',
      profile: '_default',
      form: 'partial',
      sessionId: tempSessionId
    };

    // Fire-and-forget: Fetch results and cache them
    apiClient.get('/funnelback/search', { params })
      .then(response => {
        if (response.status === 200) {
          // Cache with extended TTL for pre-rendered content
          setCachedSearchResults(query, params.collection, params.profile, response.data, 1800); // 30 minutes
        }
      })
      .catch(() => {
        // Silent failure - pre-rendering is best effort
      });

    // Return immediately - don't wait for backend
    return res.status(202).json({ 
      status: 'accepted', 
      message: 'Pre-render request initiated' 
    });

  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Pre-render failed' 
    });
  }
}
```

#### 3. Search Results Page (Minor Enhancement)

**Location**: Your search results page (likely `pages/search-test/index.tsx` or similar)  
**Change**: Check for pre-rendered content first, fall back to existing logic

```javascript
// Add to existing search results page initialization
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  
  if (query) {
    // NEW: Check for pre-rendered content first
    checkForPreRenderedResults(query)
      .then(preRenderedContent => {
        if (preRenderedContent) {
          // Use pre-rendered results immediately
          displayResults(preRenderedContent);
        } else {
          // EXISTING: Fall back to current search logic
          performExistingSearch(query);
        }
      })
      .catch(() => {
        // EXISTING: Always fall back to current logic on any error
        performExistingSearch(query);
      });
  }
});

async function checkForPreRenderedResults(query) {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&prerendered=true`);
    if (response.ok) {
      const html = await response.text();
      return html;
    }
  } catch (error) {
    // Silent failure
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
    // Attach existing click handlers, etc.
    attachExistingHandlers();
  }
}

function performExistingSearch(query) {
  // EXISTING: Your current performSearch logic remains unchanged
  if (window.performSearch) {
    window.performSearch(query, 'results');
  }
}
```

## User Experience Flow

### Pre-Render Success Scenario (Target: <50ms)
1. User types in header search form
2. User clicks submit
3. **Pre-render trigger fires** (non-blocking, 0ms delay to user)
4. Browser redirects to search results page (immediate)
5. **Pre-rendered results display instantly** (0-50ms)
6. User sees results with no apparent loading time

### Pre-Render Miss Scenario (Current: 200-700ms)  
1. User types in header search form
2. User clicks submit  
3. Pre-render trigger fires but results not cached
4. Browser redirects to search results page (immediate)
5. **Existing search logic executes** (200-700ms)
6. User sees results with current performance

### Failure Scenario (Fallback: 200-700ms)
1. Pre-render API fails completely
2. **All existing functionality works normally**
3. No user-facing impact whatsoever

## Development Workflow

### Phase 1: Core Implementation
1. Create `/api/pre-render.ts` endpoint
2. Add pre-render trigger to `integration.js`
3. Test pre-render functionality with existing cache system

### Phase 2: Results Page Enhancement  
1. Add pre-rendered content check to search results page
2. Ensure proper fallback to existing `performSearch()` logic
3. Test both pre-render hit and miss scenarios

### Phase 3: Production Preparation
1. Update header search forms to point to correct results URL
2. Test across different page types (dev vs. production forms)
3. Monitor cache hit rates and adjust TTL if needed

## Testing Strategy

### Unit Tests
- Pre-render API endpoint responds correctly
- Integration.js trigger fires without blocking redirect
- Search results page properly falls back to existing logic

### Integration Tests  
- Full redirect flow with pre-render success
- Full redirect flow with pre-render failure
- Existing functionality unchanged when pre-render disabled

### Performance Tests
- Measure redirect time with pre-render hits (<50ms target)
- Measure redirect time with pre-render misses (current performance)
- Verify no performance degradation in failure scenarios

## Risk Mitigation

### Technical Risks
- **Pre-render API failure**: Silent failure, no impact on user experience
- **Cache corruption**: Falls back to existing search logic
- **Network issues**: Non-blocking implementation prevents hangs

### Implementation Risks  
- **Breaking existing functionality**: All existing code paths preserved as primary fallbacks
- **Performance regression**: Additive enhancement only improves performance
- **Complex deployment**: Minimal file changes, low deployment risk

## Success Metrics

### Primary Goals
- **Redirect time <50ms** when pre-rendering successful
- **Zero degradation** of existing 200-700ms performance
- **Zero breaking changes** to current functionality

### Secondary Goals
- **Pre-render cache hit rate >60%** for common queries
- **Reduced perceived loading time** in user testing
- **Maintained analytics accuracy** through existing tracking

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

## Future Enhancements

### Phase 2 Possibilities
- **Predictive pre-rendering** based on user typing patterns
- **Popular query pre-caching** for frequently searched terms  
- **Geographic pre-rendering** for location-specific queries

### Performance Monitoring
- **Cache hit rate tracking** for pre-rendered content
- **User experience metrics** for perceived loading time
- **A/B testing framework** for comparing redirect approaches

## Conclusion

This smart pre-rendering approach provides the instantaneous search experience seen at other institutions while maintaining the robustness and functionality of the existing system. The implementation is low-risk, high-reward, and preserves all current optimizations as reliable fallbacks.