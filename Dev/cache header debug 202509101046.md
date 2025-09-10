# Cache Headers Debug Status - Current Investigation

## Current Problem Statement

**Primary Issue**: Custom cache headers (`X-Cache-Status`, `X-Cache-Type`, `X-Cache-Tab-ID`) are not appearing in HTTP responses despite being set in the API and configured in `next.config.js`.

**Secondary Issue**: Pre-render cache check consistently returns MISS while API cache returns HIT for the same query, indicating cache key mismatch.

## Investigation Status

### What We've Confirmed ✅

1. **Headers ARE being set in the API function**
   - Server logs show headers being set correctly
   - Response state shows `headersSent: false, finished: false`

2. **Duplicate search requests eliminated**
   - Fixed by commenting out initial search processing in `search-page-autocomplete.js`
   - Now only one search execution path per query

3. **Pre-render functions are properly exposed**
   - `window.checkForPreRenderedContent` and `window.displayPreRenderedResults` are available globally
   - Functions execute without errors

4. **API caching is working**
   - Cache HIT responses with ~194ms response time observed
   - Different cache layers show different results

### What's Still Broken ❌

1. **Custom headers not visible in HTTP responses**
   - `fetch('/api/search?query=biology').headers.get('X-Cache-Status')` returns `null`
   - All custom cache headers return `null`

2. **Cache layer inconsistency**
   - Pre-render cache: Consistent MISS
   - API cache: Shows HIT (based on response times)
   - Different cache keys likely causing the mismatch

## Technical Details

### Current next.config.js Configuration
```javascript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "https://www.seattleu.edu" },
        { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, X-Cache-Only" },
        { key: "Access-Control-Expose-Headers", value: "X-Cache-Status, X-Cache-Type, X-Cache-Tab-ID, X-Client-IP-Source" }
      ]
    }
  ];
}
```

### API Function Header Setting (Working)
```typescript
// In pages/api/search.ts - these ARE being set
res.setHeader('X-Cache-Status', 'HIT');
res.setHeader('X-Cache-Type', 'search');
res.setHeader('X-Cache-Tab-ID', tabId);
```

### Cache Key Mismatch Issue
**Pre-render cache check**:
```javascript
const params = new URLSearchParams({
  query: query.trim(),
  collection: 'seattleu~sp-search',
  profile: '_default',
  prerendered: 'true' // ← Different parameter
});
```

**Main search request**:
```javascript
const params = new URLSearchParams({
  query,
  form: 'partial', // ← Different parameter
  collection: config.collection,
  profile: config.profile,
});
```

## Test Results

### Browser Console Tests
```javascript
// Test 1: Pre-render cache check
window.checkForPreRenderedContent('biology').then(result => {
  console.log('Pre-render cache result:', result ? 'HIT' : 'MISS');
});
// Result: MISS

// Test 2: Direct API call
fetch('/api/search?query=biology&form=partial&collection=seattleu%7Esp-search&profile=_default')
  .then(r => {
    console.log('Cache Status:', r.headers.get('X-Cache-Status'));
    return r.text();
  })
  .then(html => console.log('Response length:', html.length));
// Result: Cache Status: null, Response length: 105119
```

### Log Analysis Comparison

**Before optimization (Image 1 - Working cache):**
```
[PRE-RENDER-CHECK] Cache HIT for "biology"
[SMART-PRERENDER] Using pre-rendered content for: "biology"
[PRE-RENDER-DISPLAY] Pre-rendered results displayed for "biology"
```

**After optimization (Image 2 - Broken cache):**
```
[PRE-RENDER-CHECK] Cache MISS for "biology" (status: MISS)
[Integration-INFO] [INTEGRATION-PRERENDER] No pre-rendered content, using standard search
[Integration-INFO] Search response cache status: HIT, response time: 194ms
```

## Root Cause Hypotheses

### Primary Hypothesis: Vercel Edge Server Header Filtering
- **Evidence**: Headers set correctly in API but don't appear in responses
- **Cause**: Vercel edge network filtering custom headers
- **Previous Issue**: Same pattern occurred with UserIP headers in this project

### Secondary Hypothesis: Cache Key Inconsistency  
- **Evidence**: Pre-render MISS but API HIT for same query
- **Cause**: Different URL parameters creating different cache keys
- **Impact**: Pre-render optimization not working despite cache having data

## Immediate Investigation Needed

### Priority 1: Header Visibility Issue
1. **Verify deployment status**: Confirm `next.config.js` changes are deployed
2. **Test locally**: Check if headers appear in local development
3. **Alternative header names**: Try standard header names vs custom `X-` headers
4. **Vercel configuration**: Check for any Vercel-specific header policies

### Priority 2: Cache Key Alignment
1. **Standardize parameters**: Make pre-render check use same parameters as main search
2. **Debug cache key generation**: Add logging to see actual cache keys being used
3. **Test unified cache keys**: Verify both requests hit same cache entry

## Test Scripts for Next Session

### Test 1: Verify Header Configuration
```bash
# Check if deployment is active
curl -I https://su-search-dev.vercel.app/api/search?query=test

# Look for X-Cache-Status, X-Cache-Type headers
```

### Test 2: Local Development Test
```bash
# If running locally
npm run dev
curl -I http://localhost:3000/api/search?query=test
```

### Test 3: Alternative Header Names
```typescript
// Try in API instead of X-Cache-Status
res.setHeader('Cache-Control', 'public, max-age=300, cache-status=HIT');
res.setHeader('Vary', 'cache-type=search');
```

### Test 4: Cache Key Debug
```javascript
// Add to search API for debugging
console.log('Generated cache key:', cacheKey);
console.log('Request params:', req.query);
```

## Files Modified So Far

### ✅ Completed Changes
- **`search-page-autocomplete.js`**: Commented out duplicate global function exposures (kept pre-render functions)
- **`next.config.js`**: Added `Access-Control-Expose-Headers` configuration
- **Search flow**: Eliminated duplicate search execution

### 🔄 Changes Needed Next
- **`search-page-autocomplete.js`**: Align pre-render cache parameters with main search
- **`pages/api/search.ts`**: Add cache key debugging (temporary)
- **`next.config.js`**: Potentially try alternative header configuration

## Success Criteria

### Short Term
- [ ] Custom cache headers visible in HTTP responses
- [ ] Pre-render cache check returns HIT when API cache has data
- [ ] Cache status clearly indicated to debug performance

### Long Term  
- [ ] Pre-render cache optimization working (sub-100ms response times)
- [ ] API cache working (sub-200ms response times)
- [ ] Consistent cache behavior across all search paths

## Current Deployment Status

- **Environment**: `su-search-dev.vercel.app` 
- **Last Modified**: `next.config.js` CORS headers for cache headers
- **Deployment Status**: Uncertain if changes are live
- **Verification Needed**: Check Vercel dashboard for deployment timestamp

## Context for Next Session

This investigation started with successfully eliminating duplicate search requests but revealed that:

1. **Cache headers are not visible** despite being set correctly in the API
2. **Two cache layers exist** (pre-render and API) that are out of sync
3. **Different URL parameters** are creating cache key mismatches
4. **Vercel edge servers** may be filtering custom headers (similar to previous UserIP issue)

The next session should focus on **making cache headers visible** before optimizing cache performance, as we currently cannot see what the cache is actually doing.

---

*Investigation Status: Headers invisible, cache behavior unclear*  
*Priority: Fix header visibility first, then optimize cache keys*  
*Next Action: Verify deployment and test header alternatives*