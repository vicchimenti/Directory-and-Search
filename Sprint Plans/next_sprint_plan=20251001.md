# Next Sprint Plan - Pre-render Investigation & TTL Cleanup

**Date Created**: October 1, 2025  
**Sprint Focus**: Pre-render functionality analysis and remaining TTL hardcode cleanup  
**Deployment Strategy**: Parallel pushes to dev and production (for low-risk changes)

---

## Current Status Summary

### ✅ Completed This Sprint
- **TTL Fix (Major)**: Fixed suggestions API from 300s to 12 hours (43200s)
- **Cache Constants Export**: Made TTL constants reusable across codebase
- **Production Performance**: Maintained excellent performance (254ms cache HIT, 810ms cache MISS)
- **Parallel Deployment**: Successfully deployed TTL fixes to both dev and production

### 🔍 Outstanding Issues Identified

#### 1. **Remaining TTL Hardcode** (Low Priority)
- **Symptom**: `[CACHE-INFO] SET for search:academi:seattleu-sp-search:_default with TTL 300s`
- **Status**: Functional impact minimal (actual caching works, just wrong log message)
- **Location**: Unknown - not in `search.ts`, `suggestions.ts`, or `prefetch.ts`
- **Action**: Investigate during pre-render sprint

#### 2. **Pre-render Functionality** (High Priority)
- **Symptom**: Console shows "Pre-render functions not available" but then gets cache HIT
- **Expected**: Pre-render should work after cache warmer execution
- **Impact**: Performance is still excellent, but pre-render optimization not working as designed

---

## Sprint Objectives

### Primary Goal: Pre-render Investigation & Repair

**Success Criteria:**
- Understand why pre-render shows "not available" in production
- Identify difference between dev and production pre-render behavior
- Restore pre-render functionality if broken, or confirm it's working as intended
- Verify cache warmer is properly populating pre-render data

### Secondary Goal: Complete TTL Cleanup

**Success Criteria:**
- Find and fix remaining 300s TTL hardcode
- Ensure all cache operations use proper TTL constants
- Verify logging consistency across all endpoints

---

## Investigation Plan

### Phase 1: Pre-render System Analysis (60-90 minutes)

#### Step 1: Endpoint Verification (15 minutes)
**Immediate checks:**
- [ ] Test `/api/pre-render` endpoint directly in production
- [ ] Verify endpoint returns data for common queries ("biology", "business", "admissions")
- [ ] Compare dev vs production endpoint responses
- [ ] Check deployment status of pre-render endpoint

**Test URLs:**
```
Production: https://su-search.vercel.app/api/pre-render?query=biology&collection=seattleu~sp-search&profile=_default
Dev: https://su-search-dev.vercel.app/api/pre-render?query=biology&collection=seattleu~sp-search&profile=_default
```

#### Step 2: Cache Warmer Results Analysis (15 minutes)
**Questions to answer:**
- [ ] Did cache warmer actually populate pre-render data?
- [ ] What cache keys were created during warm-up?
- [ ] Are pre-render cache keys different from standard cache keys?
- [ ] Check Redis/cache for pre-render specific entries

**Investigation commands:**
```bash
# Check cache keys (if you have Redis CLI access)
KEYS pre-render:*
KEYS *biology*
TTL pre-render:biology:seattleu~sp-search:_default
```

#### Step 3: Client-Side Pre-render Logic Review (30 minutes)
**Files to examine:**
- [ ] `public/integration.js` - Pre-render detection logic
- [ ] Search flow that determines when to use pre-render vs standard search
- [ ] Compare dev vs production integration.js behavior

**Key questions:**
- What triggers "Pre-render functions not available"?
- Is there a timing issue with pre-render initialization?
- Are there different configurations between dev and production?

#### Step 4: Server-Side Pre-render Implementation (30 minutes)
**Files to examine:**
- [ ] `pages/api/pre-render.ts` - Core pre-render endpoint
- [ ] `lib/pre-render.ts` - Pre-render utilities (if exists)
- [ ] Cache key generation for pre-render vs standard search

**Validation checklist:**
- [ ] Pre-render endpoint properly deployed
- [ ] Pre-render cache keys match what integration.js expects
- [ ] TTL settings appropriate for pre-render data
- [ ] Error handling for pre-render failures

---

### Phase 2: TTL Hardcode Hunt (30 minutes)

#### Systematic Search Strategy
**Files to check thoroughly:**
- [ ] `pages/api/search.ts` - Re-examine for any missed hardcodes
- [ ] `pages/api/pre-render.ts` - Check for TTL hardcodes
- [ ] `pages/api/client-info.ts` - Might have caching
- [ ] `lib/cache.ts` - Look for any default parameter values
- [ ] `lib/pre-render.ts` - If exists, check for hardcoded TTLs
- [ ] `public/integration.js` - Client-side caching configs

**Search patterns to look for:**
```bash
# In your codebase, search for:
grep -r "300" --include="*.ts" --include="*.js"
grep -r "60 \* 5" --include="*.ts" --include="*.js"
grep -r "TTL.*300" --include="*.ts" --include="*.js"
grep -r "ttl.*300" --include="*.ts" --include="*.js"
```

---

## Development Strategy

### Deployment Approach: Parallel Dev + Production

**For this sprint, continue parallel deployment strategy because:**
- ✅ Pre-render issues are investigative (not breaking changes)
- ✅ TTL cleanup is low-risk logging fixes
- ✅ Production performance is excellent and stable
- ✅ Rollback plan is well-established

### Risk Assessment

#### Low Risk Changes (Direct to Production)
- **TTL hardcode fixes**: Simple logging/constant changes
- **Configuration updates**: Environment variable adjustments
- **Documentation updates**: Code comments, logging improvements

#### Medium Risk Changes (Dev First, Then Production)
- **Pre-render logic modifications**: If significant changes needed
- **Cache key format changes**: Could affect existing cached data
- **New endpoint functionality**: If pre-render needs major changes

#### High Risk Changes (Requires Extensive Testing)
- **Core search flow modifications**: Would require dev → staging → production
- **Cache invalidation changes**: Could affect user experience
- **Session management updates**: Would need careful testing

---

## Expected Outcomes

### Pre-render Investigation Results

**Scenario A: Pre-render is working correctly**
- Cache warmer populated data successfully
- "Not available" message is misleading/outdated
- Performance is excellent because cache HITs are working
- **Action**: Update logging to be clearer about pre-render status

**Scenario B: Pre-render endpoint is broken**
- Endpoint not properly deployed or configured
- Cache warmer didn't populate pre-render data
- Falling back to standard search (which works well)
- **Action**: Fix endpoint and re-run cache warmer

**Scenario C: Pre-render logic mismatch**
- Different cache key formats between pre-render and standard search
- Client-side pre-render detection needs updating
- Cache warmer populated data, but integration.js can't find it
- **Action**: Align cache key generation across systems

### TTL Cleanup Results

**Expected**: Find 1-2 remaining hardcoded TTL values
**Action**: Replace with appropriate TTL constants
**Impact**: Consistent logging and cache behavior across all endpoints

---

## Testing Plan

### Pre-render Testing

#### Automated Tests
```bash
# Test pre-render endpoint directly
curl "https://su-search.vercel.app/api/pre-render?query=biology&collection=seattleu~sp-search&profile=_default"

# Test common queries
for query in "biology" "business" "admissions" "graduate"; do
  echo "Testing: $query"
  curl "https://su-search.vercel.app/api/pre-render?query=$query&collection=seattleu~sp-search&profile=_default"
done
```

#### Manual Browser Testing
- [ ] Search for "biology" and observe console logs
- [ ] Check Network tab for pre-render API calls
- [ ] Verify response times match expectations
- [ ] Test multiple queries to confirm behavior consistency

### Performance Validation

**Acceptable Performance Targets** (should maintain current levels):
- Cache HIT: 200-450ms ✅ (currently 254ms)
- Cache MISS: 800-1100ms ✅ (currently 810ms)
- Error rate: <0.1% ✅
- No degradation from current excellent performance

---

## Rollback Plan

### If Pre-render Changes Cause Issues

**Option 1: Revert specific changes**
```bash
git revert [specific-commit-hash]
git push origin main
```

**Option 2: Vercel deployment rollback**
- Use Vercel dashboard to promote previous known-good deployment
- Fastest option (~30 seconds)

**Option 3: Full revert to current state**
```bash
git checkout production-sessionservice-optimized-20250930
git push origin main --force  # Use with caution
```

### Decision Criteria for Rollback
- Error rate >1% for 10+ minutes
- Performance degradation >25% from current baselines
- Search functionality broken for any user segment
- Pre-render changes breaking standard search flow

---

## Success Metrics

### Pre-render Success
- [ ] Pre-render endpoint returns data for test queries
- [ ] Client-side integration properly detects and uses pre-render
- [ ] Console logs show "Pre-render HIT" instead of "not available"
- [ ] No performance degradation from current excellent levels

### TTL Cleanup Success
- [ ] All cache SET operations show consistent TTL values (43200s for search)
- [ ] No more 300s TTL values in production logs
- [ ] All endpoints use proper TTL constants instead of hardcoded values

### Overall Sprint Success
- [ ] Maintain current excellent performance (254ms/810ms)
- [ ] Zero production incidents or rollbacks needed
- [ ] Clear understanding of pre-render system status
- [ ] Clean, consistent cache configuration across all endpoints

---

## Post-Sprint Review

### Questions to Answer
1. **Is pre-render working as designed?** If not, what needs to be fixed?
2. **Are all TTL hardcodes eliminated?** Document any remaining ones.
3. **Should we continue parallel dev+production deployment?** Based on sprint results.
4. **What's the next highest priority optimization?** Based on current performance data.

### Documentation Updates Needed
- Update production deployment summary with pre-render status
- Document any pre-render configuration requirements
- Add TTL configuration best practices to README
- Update monitoring guidelines if pre-render behavior changes

---

## Estimated Time Investment

**Total Sprint Estimate: 2-4 hours**
- Pre-render investigation: 60-90 minutes
- TTL cleanup: 30 minutes
- Testing and validation: 30-60 minutes
- Documentation updates: 15-30 minutes
- Buffer for unexpected issues: 30-45 minutes

**Can be completed in 1-2 focused sessions**

---

**Next Review Date**: After pre-render investigation completion  
**Success Criteria**: Clear understanding of pre-render status + clean TTL configuration  
**Risk Level**: Low (investigative work with stable production performance)