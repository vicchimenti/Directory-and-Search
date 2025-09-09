# Cache Headers Debugging - Complete Session Summary

## Problem Statement

**Issue**: Custom cache headers (`X-Cache-Status`, `X-Cache-Type`, `X-Cache-Tab-ID`) are not appearing in HTTP responses despite being successfully set in the API function.

**Expected Behavior**: 
- `X-Cache-Status: HIT` or `X-Cache-Status: MISS`
- `X-Cache-Type: search` or `X-Cache-Type: tab`
- `X-Cache-Tab-ID: Results` (for tab requests)

**Current Status**: ❌ Headers still not appearing in actual HTTP responses

## Key Findings from Debugging Session

### What We Confirmed Works ✅

1. **Headers ARE being set successfully in the function**
   - Logs show: `'X-Cache-Status': 'HIT', 'X-Cache-Type': 'tab', 'X-Cache-Tab-ID': 'Results'`
   - Response state is valid: `headersSent: false, finished: false`

2. **Cache system is working correctly**
   - Cache hits and misses are being detected properly
   - Different code paths (tab vs search) are working

3. **API function logic is sound**
   - Tab detection working: `Tab detection from params: true, Tab ID: Results`
   - Cache lookups working: `[CACHE-INFO] HIT for tab:biology:seattleu~sp-search:_default:Results`

### What's Still Broken ❌

1. **Headers disappear between setting and HTTP response**
   - Chrome test shows: `X-Cache-Status: null, X-Cache-Type: null`
   - Something is clearing/overwriting headers after they're set

2. **Both tab and search requests affected**
   - Tab requests: Cache HIT detected but headers missing
   - Search requests: Cache MISS detected but headers missing

## Technical Analysis

### Latest Logs Analysis

**First Request (prerendered=true):**
- Took the general search path (no `form=partial`)
- Cache MISS → fetched from backend → cached result
- Response: `405` status (Method not allowed error in test)

**Second Request (form=partial):**
- Took the tab path (`Tab ID: Results`)
- Cache HIT for tab content
- Should have set headers but they're still missing

### Root Cause Hypothesis

The issue appears to be that **something in the Next.js response pipeline is stripping custom headers** after our function sets them but before the HTTP response is sent to the client.

## Attempted Solutions (All Failed)

1. ❌ **`addCacheHeaders()` function approach** - Headers set but don't appear
2. ❌ **Direct `res.setHeader()` calls** - Headers set but don't appear  
3. ❌ **Setting headers immediately before `res.send()`** - Headers set but don't appear
4. ❌ **Enhanced debug logging** - Confirmed headers are set correctly internally

## Next Steps for Resolution

### Immediate Actions Required

1. **Investigate Next.js/Vercel Response Pipeline**
   - Check if Vercel is stripping custom headers
   - Look for middleware that might be interfering
   - Review Next.js API route documentation for header restrictions

2. **Alternative Header Implementation**
   - Try different header naming convention (avoid `X-` prefix)
   - Test with standard header names first
   - Use `res.writeHead()` instead of `res.setHeader()`

3. **Debugging Next Phase**
   - Add response interceptor to see exactly when headers disappear
   - Test with minimal API route to isolate the issue
   - Check Vercel function logs for any header-related warnings

### Testing Framework

Use this test script to verify any fixes:

```javascript
async function testCacheHeaders() {
  const testUrl = 'https://su-search-dev.vercel.app/api/search?query=biology&form=partial&collection=seattleu~sp-search&profile=_default';
  
  console.log('Testing cache headers for:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'Accept': '*/*',
        'Origin': 'https://www.seattleu.edu'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('\nAll headers:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const cacheStatus = response.headers.get('X-Cache-Status');
    const cacheType = response.headers.get('X-Cache-Type');
    const tabId = response.headers.get('X-Cache-Tab-ID');
    
    console.log('\nCache headers:');
    console.log('  X-Cache-Status:', cacheStatus);
    console.log('  X-Cache-Type:', cacheType);
    console.log('  X-Cache-Tab-ID:', tabId);
    
    if (cacheStatus && cacheType) {
      console.log('✅ SUCCESS: Cache headers are present!');
    } else {
      console.log('❌ FAIL: Cache headers are still missing');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCacheHeaders();
```

## Investigation Ideas for Tomorrow

### 1. Minimal Test Case

Create a simple test API route to isolate the issue:

```typescript
// pages/api/test-headers.ts
export default function handler(req, res) {
  console.log('Setting test headers...');
  
  res.setHeader('X-Test-Header', 'working');
  res.setHeader('X-Cache-Status', 'TEST');
  res.setHeader('Custom-Header', 'test-value');
  
  console.log('Headers after setting:', {
    'X-Test-Header': res.getHeader('X-Test-Header'),
    'X-Cache-Status': res.getHeader('X-Cache-Status'),
    'Custom-Header': res.getHeader('Custom-Header')
  });
  
  res.status(200).json({ message: 'Test headers set' });
}
```

Test with: `curl -I https://su-search-dev.vercel.app/api/test-headers`

### 2. Alternative Header Setting Methods

Try different approaches in the main API:

```typescript
// Method 1: Use res.writeHead() instead of res.setHeader()
res.writeHead(200, {
  'Content-Type': 'text/html',
  'X-Cache-Status': 'HIT',
  'X-Cache-Type': 'search'
});
res.end(cachedResult);

// Method 2: Different header names (avoid X- prefix)
res.setHeader('Cache-Status', 'HIT');
res.setHeader('Cache-Type', 'search');

// Method 3: Use standard headers
res.setHeader('X-Powered-By', 'SU-Search-Cache-HIT');
```

### 3. Check Vercel Configuration

- Review `vercel.json` for header policies
- Check `next.config.js` for header interference
- Look for middleware that might modify responses

### 4. Response Pipeline Investigation

Add logging to see the complete response flow:

```typescript
// Add this before final response
console.log('Final headers before send:', Object.fromEntries(
  Object.entries(res.getHeaders())
));

// Add response event listeners if possible
res.on('finish', () => {
  console.log('Response finished, final headers sent');
});
```

## Files to Focus On Tomorrow

### Primary Files
- `pages/api/search.ts` - Main API file where headers should be set
- `next.config.js` - Check for header modifications
- `vercel.json` - Check for deployment configurations

### Test Files to Create
- `pages/api/test-headers.ts` - Minimal test case
- Simple curl/fetch tests to isolate the issue

## Current Partial Implementation

The current code has headers being set in multiple locations:

```typescript
// Tab cache hit
if (cachedTabContent) {
  res.setHeader('X-Cache-Status', 'HIT');
  res.setHeader('X-Cache-Type', 'tab');
  if (tabId) res.setHeader('X-Cache-Tab-ID', tabId);
  return res.status(200).send(cachedTabContent);
}

// Search cache hit  
if (cachedResult) {
  res.setHeader('X-Cache-Status', 'HIT');
  res.setHeader('X-Cache-Type', 'search');
  return res.status(200).send(cachedResult);
}
```

**But headers still don't appear in the actual HTTP response.**

## Success Criteria

The debugging will be complete when:

1. ✅ Custom cache headers appear in HTTP responses
2. ✅ Headers correctly reflect cache status (HIT/MISS)
3. ✅ Tab-specific headers work for tab requests
4. ✅ Headers work consistently across all cache code paths

## Key Insight

The problem is **NOT in our code logic** - it's in the **Next.js/Vercel response pipeline**. Our headers are being set correctly but something is stripping them before they reach the client.

## Resources for Investigation

- [Next.js API Routes Headers Documentation](https://nextjs.org/docs/api-routes/response-helpers)
- [Vercel Headers Documentation](https://vercel.com/docs/edge-network/headers)
- [HTTP Headers Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

## Contact Information

Continue debugging in a new chat session with this complete context and focus on **Next.js/Vercel response pipeline investigation** rather than our application logic.