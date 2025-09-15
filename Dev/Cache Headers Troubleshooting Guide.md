# Cache Headers Troubleshooting Guide

## Problem Summary

**Issue**: Custom cache headers (`X-Cache-Status`, `X-Cache-Type`, `X-Cache-Tab-ID`) are being set successfully in the API function but are not appearing in the actual HTTP response headers that reach the client.

**Current Status**: 
- ✅ Headers are being set in the function (confirmed via logs)
- ✅ Response state is valid when headers are set (`headersSent: false`, `finished: false`)
- ❌ Headers are not appearing in the actual HTTP response

## Root Cause Analysis

The issue is that headers are being cleared/overwritten somewhere between when we set them and when the response is sent. The solution is to set headers **immediately before** calling `res.status().send()` or `res.status().json()`.

## Files to Modify

### Primary File: `pages/api/search.ts`

This is the main file that needs to be updated with header fixes.

## Complete Implementation

### 1. Remove the `addCacheHeaders` Function

Since the function approach isn't working, remove this function entirely and replace with direct header setting.

**Remove this entire function:**
```typescript
function addCacheHeaders(
  res: NextApiResponse,
  status: 'HIT' | 'MISS',
  type: 'search' | 'tab',
  metadata: any = {}
): void {
  // ... entire function should be removed
}
```

### 2. Tab Cache Hit Section

**Find this section:**
```typescript
if (cachedTabContent) {
  console.log(`[SEARCH-API] Cache HIT for tab '${tabId}'`);

  // Add cache status headers - non-intrusive enhancement
  addCacheHeaders(res, 'HIT', 'tab', {
    tabId,
    popular: isPopularTab
  });

  // Handle cache-check-only requests
  if (cacheCheckOnly) {
    return res.status(200).json({ cacheStatus: 'HIT', tabId });
  }

  // Return cached tab content as-is to preserve the exact HTML structure
  return res.status(200).send(cachedTabContent);
}
```

**Replace with:**
```typescript
if (cachedTabContent) {
  console.log(`[SEARCH-API] Cache HIT for tab '${tabId}'`);

  // Handle cache-check-only requests
  if (cacheCheckOnly) {
    res.setHeader('X-Cache-Status', 'HIT');
    res.setHeader('X-Cache-Type', 'tab');
    if (tabId) res.setHeader('X-Cache-Tab-ID', tabId);
    return res.status(200).json({ cacheStatus: 'HIT', tabId });
  }

  // Set headers immediately before sending response
  res.setHeader('X-Cache-Status', 'HIT');
  res.setHeader('X-Cache-Type', 'tab');
  if (tabId) res.setHeader('X-Cache-Tab-ID', tabId);
  
  // Return cached tab content as-is to preserve the exact HTML structure
  return res.status(200).send(cachedTabContent);
}
```

### 3. Tab Cache Miss Section

**Find this section:**
```typescript
console.log(`[SEARCH-API] Cache MISS for tab '${tabId}'`);

// Add cache status headers - non-intrusive enhancement
addCacheHeaders(res, 'MISS', 'tab', { tabId });

// Handle cache-check-only requests
if (cacheCheckOnly) {
  return res.status(404).json({ cacheStatus: 'MISS', tabId });
}
```

**Replace with:**
```typescript
console.log(`[SEARCH-API] Cache MISS for tab '${tabId}'`);

// Handle cache-check-only requests
if (cacheCheckOnly) {
  res.setHeader('X-Cache-Status', 'MISS');
  res.setHeader('X-Cache-Type', 'tab');
  if (tabId) res.setHeader('X-Cache-Tab-ID', tabId);
  return res.status(404).json({ cacheStatus: 'MISS', tabId });
}

// Set miss headers (will be sent with final response)
res.setHeader('X-Cache-Status', 'MISS');
res.setHeader('X-Cache-Type', 'tab');
if (tabId) res.setHeader('X-Cache-Tab-ID', tabId);
```

### 4. General Search Cache Hit Section

**Find this section:**
```typescript
if (cachedResult) {
  console.log(`[SEARCH-API] Cache HIT for search: ${query}`);

  // Add cache status headers - non-intrusive enhancement
  addCacheHeaders(res, 'HIT', 'search');

  // Handle cache-check-only requests
  if (cacheCheckOnly) {
    return res.status(200).json({ cacheStatus: 'HIT' });
  }

  // Return cached search results as-is to preserve the exact HTML structure
  return res.status(200).send(cachedResult);
}
```

**Replace with:**
```typescript
if (cachedResult) {
  console.log(`[SEARCH-API] Cache HIT for search: ${query}`);

  // Handle cache-check-only requests
  if (cacheCheckOnly) {
    res.setHeader('X-Cache-Status', 'HIT');
    res.setHeader('X-Cache-Type', 'search');
    return res.status(200).json({ cacheStatus: 'HIT' });
  }

  // Set headers immediately before sending response
  res.setHeader('X-Cache-Status', 'HIT');
  res.setHeader('X-Cache-Type', 'search');
  
  // Return cached search results as-is to preserve the exact HTML structure
  return res.status(200).send(cachedResult);
}
```

### 5. General Search Cache Miss Section

**Find this section:**
```typescript
console.log(`[SEARCH-API] Cache MISS for search: ${query}`);

// Add cache status headers - non-intrusive enhancement
addCacheHeaders(res, 'MISS', 'search');

// Handle cache-check-only requests
if (cacheCheckOnly) {
  return res.status(404).json({ cacheStatus: 'MISS' });
}
```

**Replace with:**
```typescript
console.log(`[SEARCH-API] Cache MISS for search: ${query}`);

// Handle cache-check-only requests
if (cacheCheckOnly) {
  res.setHeader('X-Cache-Status', 'MISS');
  res.setHeader('X-Cache-Type', 'search');
  return res.status(404).json({ cacheStatus: 'MISS' });
}

// Set miss headers (will be sent with final response)
res.setHeader('X-Cache-Status', 'MISS');
res.setHeader('X-Cache-Type', 'search');
```

### 6. Final Response Section (After Backend Fetch)

**Find the final response section at the end:**
```typescript
// Return the result as-is to preserve the exact HTML structure
res.status(200).send(result.data);
```

**Replace with:**
```typescript
// Return the result as-is to preserve the exact HTML structure
// Ensure cache headers are set if they weren't already
if (!res.getHeader('X-Cache-Status')) {
  res.setHeader('X-Cache-Status', 'MISS');
}
if (!res.getHeader('X-Cache-Type')) {
  res.setHeader('X-Cache-Type', tabRequestDetected ? 'tab' : 'search');
}
if (tabRequestDetected && tabId && !res.getHeader('X-Cache-Tab-ID')) {
  res.setHeader('X-Cache-Tab-ID', tabId);
}

res.status(200).send(result.data);
```

## Testing

### Chrome Console Test Script

After implementing the fixes, use this script to test:

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

// Run the test
testCacheHeaders();
```

### Alternative Test with curl

```bash
curl -I "https://su-search-dev.vercel.app/api/search?query=biology&form=partial" \
  -H "Origin: https://www.seattleu.edu" \
  -H "Accept: */*"
```

Look for these headers in the response:
- `X-Cache-Status: HIT` or `X-Cache-Status: MISS`
- `X-Cache-Type: search` or `X-Cache-Type: tab`
- `X-Cache-Tab-ID: Results` (for tab requests)

## Expected Results

After implementing these fixes, you should see:

**For a cached request:**
```
X-Cache-Status: HIT
X-Cache-Type: tab
X-Cache-Tab-ID: Results
```

**For a non-cached request:**
```
X-Cache-Status: MISS
X-Cache-Type: search
```

## Debugging

If headers still don't appear after these changes:

1. **Check Vercel logs** to ensure no errors during deployment
2. **Verify the fixes were applied to all sections** mentioned above
3. **Test with different query parameters** to trigger different cache paths
4. **Check if any middleware is interfering** with custom headers

## Key Points

- **Remove the `addCacheHeaders` function entirely**
- **Set headers immediately before `res.status().send()`**
- **Apply changes to ALL cache hit/miss locations**
- **Ensure headers are set for both cache-check-only and regular responses**
- **Test thoroughly after deployment**

## Files Modified

- `pages/api/search.ts` - Main API file with cache header fixes

## Next Steps

1. Apply all the header setting fixes listed above
2. Remove the `addCacheHeaders` function
3. Deploy to Vercel
4. Run the test script to verify headers appear
5. Document the working solution for future reference