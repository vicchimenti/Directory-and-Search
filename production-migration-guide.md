# Production Migration Guide - SessionService Optimizations

**Project**: Migrate SessionService optimizations from `su-search-dev` to `su-search` production
**Date Created**: September 12, 2025
**Current Status**: Ready to begin migration
**Snapshot Tag**: `snapshot-dev-sessionservice-optimized-20250912`

## Overview

This guide outlines the process to migrate the completed SessionService optimizations from the development environment to production using a migration branch strategy.

### Performance Improvements to Migrate
- **Cache HIT improvement**: 754ms → 424ms (44% faster)
- **Cache MISS improvement**: 1436ms → 1070ms (25% faster)
- **Architecture**: Optimized 2-tier search flow with eliminated redundancy
- **SessionService**: Clean integration with single initialization pattern

## Environment Architecture

### Development Stack (Source)
- **Frontend**: `su-search-dev` (GitHub repo) → `su-search-dev.vercel.app`
- **Backend**: `funnelback-proxy-dev` (GitHub repo) → `funnelback-proxy-dev.vercel.app`
- **Search Path**: `/search-test/`
- **Cache**: Development Redis instance

### Production Stack (Target)
- **Frontend**: `su-search` (GitHub repo) → `su-search.vercel.app`
- **Backend**: `funnelback-proxy` (GitHub repo) → `funnelback-proxy.vercel.app`
- **Search Path**: `/search/`
- **Cache**: Production Redis instance

### Key Constraint
- **Frontend only changes**: No modifications made to proxy backends
- **Scope**: Only `su-search-dev` → `su-search` migration required

## Pre-Migration Phase

### Step 1: File Audit ⏳ IN PROGRESS
**Objective**: Identify all files modified during SessionService optimization project

**Method**: Manual review of GitHub repo file dates and commit history

**Look for**:
- Files modified since last production deployment
- Files with recent modification dates
- Git commit history since last stable tag

**Create list of**:
- ✅ **Modified files** - Files that need endpoint updates
- ✅ **New files** - Files that need to be copied to production
- ✅ **Deleted files** - Files that need to be removed from production

**Output**: Complete file inventory for migration

### Step 2: Endpoint Change Mapping
**Objective**: Document all endpoint changes needed for each file

**URL Changes Required**:
```
Development → Production
/search-test/ → /search/
su-search-dev.vercel.app → su-search.vercel.app
funnelback-proxy-dev.vercel.app → funnelback-proxy.vercel.app
```

**File Types to Check**:
- JavaScript files (`.js`)
- TypeScript files (`.ts`, `.tsx`)
- Configuration files
- README/documentation files
- Any hardcoded URLs in comments

**Notes**: 
- Endpoint declarations vary across different APIs
- Manual review required for each file
- Some files may have multiple endpoint references

## Migration Phase

### Step 3: Create Migration Branch
**Location**: Work directly in `su-search` repository

```bash
# Clone/navigate to su-search repo
cd path/to/su-search

# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create migration branch
git checkout -b migration-sessionservice-optimizations

# Verify branch
git branch
```

### Step 4: File-by-File Migration
**Process**: For each file in the audit list:

1. **Copy file content** from `su-search-dev` to `su-search` migration branch
2. **Update endpoints** manually in each file:
   - Change `/search-test/` → `/search/`
   - Change `su-search-dev.vercel.app` → `su-search.vercel.app`
   - Change `funnelback-proxy-dev.vercel.app` → `funnelback-proxy.vercel.app`
3. **Verify changes** - Double-check each endpoint update
4. **Save file** in migration branch

**Checklist Template**:
```
□ File: [filename]
  □ Copied from su-search-dev
  □ Updated /search-test/ → /search/
  □ Updated su-search-dev.vercel.app → su-search.vercel.app  
  □ Updated funnelback-proxy-dev.vercel.app → funnelback-proxy.vercel.app
  □ Verified all changes
  □ Saved to migration branch
```

### Step 5: Handle Deleted Files
For any files that were deleted in development:
```bash
# Remove from production migration branch
git rm path/to/deleted-file.js
git commit -m "remove: delete obsolete file per dev optimization"
```

## Testing Phase

### Step 6: Local Testing
```bash
# On migration branch
npm install
npm run dev

# Test locally with production endpoints
# Verify functionality works correctly
```

### Step 7: Preview Deployment Testing
```bash
# Push migration branch to trigger Vercel preview
git add .
git commit -m "feat(migration): apply SessionService optimizations for production"
git push origin migration-sessionservice-optimizations
```

**Vercel will create preview URL**: `migration-sessionservice-optimizations-su-search.vercel.app`

**Test Thoroughly**:
- ✅ **Search functionality** - Test various search queries
- ✅ **Performance** - Verify optimization improvements
- ✅ **Analytics tracking** - Confirm SessionService integration
- ✅ **Tab navigation** - Test all search result tabs
- ✅ **Suggestions** - Verify autocomplete functionality
- ✅ **Caching** - Check cache hit/miss performance
- ✅ **Error handling** - Test edge cases and failures

**Key Validation Points**:
- Search responses come from `funnelback-proxy.vercel.app` (not dev)
- URLs use `/search/` path (not `/search-test/`)
- Session management works correctly
- Performance metrics match development testing

## Production Deployment Phase

### Step 8: Production Merge and Deploy
**Only proceed after thorough preview testing**

```bash
# Switch to main branch
git checkout main

# Ensure up to date
git pull origin main

# Merge migration branch
git merge migration-sessionservice-optimizations

# Push to trigger production deployment
git push origin main
```

### Step 9: Post-Deployment Validation
**Immediately after deployment**:

- ✅ **Basic functionality** - Verify search works on live site
- ✅ **Performance monitoring** - Check response times match expectations
- ✅ **Error monitoring** - Watch for any new errors in logs
- ✅ **Analytics verification** - Confirm tracking data flows correctly
- ✅ **Cache performance** - Monitor cache hit rates

**Performance Targets**:
- Cache HIT searches: ~400-450ms
- Cache MISS searches: ~1000-1100ms
- No degradation in other functionality

### Step 10: Cleanup
```bash
# Delete migration branch after successful deployment
git branch -d migration-sessionservice-optimizations
git push origin --delete migration-sessionservice-optimizations

# Create production tag
git tag production-sessionservice-optimized-$(date +%Y%m%d)
git push origin production-sessionservice-optimized-$(date +%Y%m%d)
```

## Rollback Plan

### If Issues Arise
1. **Immediate**: Revert to previous deployment in Vercel dashboard
2. **Git rollback**: 
   ```bash
   git checkout main
   git revert [merge-commit-hash]
   git push origin main
   ```
3. **Communicate**: Notify team of rollback and investigation plan

### Investigation Steps
1. **Compare logs**: Development vs production error logs
2. **Environment differences**: Verify all endpoint changes were correct
3. **Configuration check**: Confirm environment variables are correct
4. **Performance analysis**: Check if performance degraded or improved

## Success Criteria

### Performance Targets Met
- [ ] Cache HIT performance: <450ms (from 754ms baseline)
- [ ] Cache MISS performance: <1100ms (from 1436ms baseline)
- [ ] No regression in other search functionality

### Functionality Verified
- [ ] Search results load correctly
- [ ] Autocomplete suggestions work
- [ ] Tab navigation functions properly
- [ ] Analytics tracking operational
- [ ] Session management working
- [ ] Error handling intact

### Production Stability
- [ ] No new errors in logs
- [ ] Cache hit rates maintained or improved
- [ ] User experience improved or unchanged
- [ ] All integrations functioning

## Communication Plan

### Before Migration
- [ ] Notify team of migration timeline
- [ ] Schedule migration during low-traffic period
- [ ] Prepare rollback communication

### During Migration
- [ ] Status updates at key phases
- [ ] Issue escalation path defined
- [ ] Monitoring responsibilities assigned

### After Migration
- [ ] Success confirmation to team
- [ ] Performance improvement metrics shared
- [ ] Documentation updated

## Reference Information

### Repository Information
- **Development Repo**: `vicchimenti/su-search-dev`
- **Production Repo**: `vicchimenti/su-search`
- **Snapshot Tag**: `snapshot-dev-sessionservice-optimized-20250912`

### Key Files to Monitor
*(To be populated from file audit)*
- `public/integration.js` - Major optimization changes
- `README.md` - Updated documentation
- `public/js/SessionService.js` - Session management
- *[Additional files from audit]*

### Performance Baselines
**Development (Optimized)**:
- Cache HIT: 424ms
- Cache MISS: 1070ms

**Production (Pre-optimization)**:
- Cache HIT: ~754ms equivalent
- Cache MISS: ~1436ms equivalent

### Environment Variables to Verify
- Backend API endpoints point to production proxy
- Redis configuration uses production cache
- Any dev-specific debug flags disabled

## Next Steps After This Migration

### Future Optimization (Step 3)
**Pre-render Performance Enhancement**:
- Current pre-render cache check: 402ms
- Target: <300ms
- Expected additional improvement: 150-200ms

### Long-term Roadmap
- Advanced analytics dashboard
- Enhanced mobile experience
- Security enhancements
- Machine learning integration

---

## Usage Notes

**For Next Chat Session**:
1. Share this document to quickly bring Claude up to speed
2. Provide file audit results to populate the file list
3. Reference any specific issues or questions that arise
4. Update progress status as you complete each phase

**Document Status**: ⏳ Ready for file audit phase
**Next Action**: Complete Step 1 - File Audit
**Estimated Timeline**: 2-4 hours for complete migration process