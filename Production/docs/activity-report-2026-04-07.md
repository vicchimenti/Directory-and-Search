# Activity Report — April 7, 2026

**Author:** Victor Chimenti  
**Repos affected:** `funnelback-proxy`, `funnelback-proxy-dev`, `su-search`, `su-search-dev`  
**Session duration:** ~2.5 hours  

---

## Summary

This session completed three major work items across all four Seattle University search repositories: security vulnerability remediation, a Next.js major version upgrade, and structured axios timeout additions to all Funnelback proxy handlers. All work followed a dev-first approach with tagging, branching, preview verification, and clean merges to main before promoting to production.

---

## Work Completed

### 1. Security Vulnerability Remediation

**Triggered by:** GitHub Dependabot alert — `path-to-regexp` High severity CVE on `funnelback-proxy`

Upon investigation the alert expanded to reveal 6 open vulnerabilities across the proxy repos and 12 across the frontend repos, several of which had been open for 7–9 months due to Dependabot being disabled on three of the four repos.

#### funnelback-proxy-dev / funnelback-proxy

| Package | Severity | Resolution |
|---|---|---|
| `form-data` | Critical | Resolved via `npm audit fix` |
| `axios` (DoS — data size) | High | Resolved via `npm audit fix` |
| `axios` (DoS — mergeConfig) | High | Resolved via `npm audit fix` |
| `path-to-regexp` | High | Resolved via Dependabot PR merge |
| `qs` (bracket notation) | Moderate | Resolved via `npm audit fix` |
| `qs` (comma parsing) | Low | Resolved via `npm audit fix` |

**Result:** 6 → 0 vulnerabilities on both proxy repos ✅

#### su-search-dev / su-search

Ran `npm audit fix` twice on both repos.

**Result:** 12 → 4 vulnerabilities on both frontend repos. The remaining 4 all required `next@16.2.2` — deferred to the Next.js upgrade work item below.

**Additional action:** `node_modules` was removed from git tracking on both proxy repos (`git rm -r --cached node_modules`). The directory had been committed before the `.gitignore` rule was in place. Dependabot was enabled on all four repos.

---

### 2. Next.js 14.2.35 → 16.2.2 Upgrade

**Repos:** `su-search-dev`, `su-search`  
**Motivation:** Clearing the 4 remaining High severity CVEs in `next` (HTTP request smuggling, DoS via Image Optimizer, HTTP deserialization DoS, unbounded disk cache growth)

#### Process (both repos)

1. Confirmed baseline — Next.js 14.2.35, 4 High runtime CVEs
2. Created restore tag: `v14.2.35-pre-next16-upgrade`
3. Created branch: `next-16-upgrade`
4. Ran `npm install next@16.2.2 --legacy-peer-deps`
   - `--legacy-peer-deps` required due to `eslint-config-next@16` requiring ESLint 9+ while the project pins ESLint 8
5. Removed deprecated `swcMinify: true` from `next.config.js` (option removed in Next.js 16, now the default)
6. Next.js auto-updated `tsconfig.json` — `moduleResolution` set to `bundler`, `jsx` set to `react-jsx`
7. Ran `npm run build` — clean build, no warnings, all 8 routes resolved
8. Pushed branch — Vercel preview deployed green
9. Merged to main — Vercel production deployed green

#### Result

| Repo | Before | After | Remaining |
|---|---|---|---|
| `su-search-dev` | 4 High (runtime) | 0 runtime | 3 dev-tooling only |
| `su-search` | 4 High (runtime) | 0 runtime | 3 dev-tooling only |

The 3 remaining vulnerabilities are the `glob` → `@next/eslint-plugin-next` → `eslint-config-next` chain — dev tooling only, no runtime impact. Resolution requires the ESLint 8 → 9 upgrade (see Next Steps).

---

### 3. Structured Axios Timeouts — All Funnelback Handlers

**Repos:** `funnelback-proxy-dev`, `funnelback-proxy`  
**Motivation:** All 7 proxy handlers called `axios.get()` to Funnelback without a timeout configured. A slow or unresponsive Squiz upstream would cause serverless functions to hang until Vercel's hard execution limit, consuming resources and degrading user experience. At ~2,000 req/hr hitting the backend, a slow upstream could cascade quickly.

#### Timeout Strategy

Rather than a flat timeout across all handlers, structured timeouts were applied based on user experience tolerance:

| Endpoint type | Timeout | Justification |
|---|---|---|
| `suggest.js`, `suggestPeople.js`, `suggestPrograms.js` | **3000ms** | Fire on every keystroke — a slow suggestion is worse than no suggestion |
| `server.js`, `search.js`, `tools.js`, `spelling.js` | **5000ms** | Full search results — users tolerate a slightly longer wait |

#### Implementation

Each file received a named constant at the top of the file for clarity and maintainability:

```js
// Suggestion endpoints
const FUNNELBACK_TIMEOUT_MS = 3000;

// Search endpoints
const FUNNELBACK_TIMEOUT_MS = 5000;
```

Applied to each axios call:

```js
const response = await axios.get(funnelbackUrl, {
    params: req.query,
    headers: funnelbackHeaders,
    timeout: FUNNELBACK_TIMEOUT_MS
});
```

When the timeout fires, axios throws `ECONNABORTED` which the existing `catch` blocks in each handler already handle — logging the error and returning a 500. Users receive a fast failure instead of a long hang.

Changes were applied via targeted `sed` commands to avoid manual editing risk across 7 files. All changes verified via `grep` before committing.

#### Result

All 7 handlers updated on both `funnelback-proxy-dev` and `funnelback-proxy`. Vercel preview and production deployments green on both repos ✅

---

## Final Vulnerability Status

| Repo | Start of Day | End of Day | Remaining |
|---|---|---|---|
| `funnelback-proxy` | 6 | **0** | None |
| `funnelback-proxy-dev` | 6 | **0** | None |
| `su-search` | 12 | **3** | Dev tooling only — ESLint upgrade required |
| `su-search-dev` | 12 | **3** | Dev tooling only — ESLint upgrade required |

---

## Tags Created

| Repo | Tag | Purpose |
|---|---|---|
| `su-search-dev` | `v14.2.35-pre-next16-upgrade` | Restore point before Next.js upgrade |
| `su-search` | `v14.2.35-pre-next16-upgrade` | Restore point before Next.js upgrade |
| `funnelback-proxy-dev` | `v1.0.0-pre-axios-timeout` | Restore point before axios timeout additions |
| `funnelback-proxy` | `v1.0.0-pre-axios-timeout` | Restore point before axios timeout additions |

---

## Next Steps

### 1. ESLint 8 → 9 Upgrade — `su-search-dev` and `su-search`

**Priority:** Medium  
**Effort:** Moderate  
**Clears:** 3 remaining High dev-tooling CVEs on both frontend repos

**Justification:** ESLint 9 introduces a breaking change — the `.eslintrc` config format is replaced by a new `eslint.config.js` flat config format. The config file will need to be rewritten, but Next.js 16 provides a compatibility helper to ease the transition. ESLint is dev tooling only and has zero effect on the running application, so the blast radius of a misconfiguration is low. However maintaining a clean `npm audit` posture is important ahead of the Enterprise GitHub migration.

**Approach:**
1. Tag and branch on `su-search-dev`
2. Upgrade ESLint: `npm install eslint@9 eslint-config-next@16.2.2`
3. Migrate `.eslintrc` to `eslint.config.js` flat config format
4. Verify linting works: `npm run lint`
5. Verify build still passes: `npm run build`
6. Merge dev, then mirror to `su-search` prod

---

### 2. Branch Protection on All Four Repos

**Priority:** High  
**Effort:** Low (~10 minutes, admin task)  
**Repos:** All four

**Justification:** Currently all four repos allow direct pushes to `main`. Before the planned Enterprise GitHub migration, branch protection should be enabled to prevent accidental force pushes and create a clean audit trail for all changes. This is standard practice for production repositories and will be required under the Enterprise GitHub organization policies.

**Action:** Enable "Require a pull request before merging" on `main` for all four repos in GitHub repository settings.

---

### 3. Proxy Repos Migration to Next.js

**Priority:** Low (longer term)  
**Effort:** High  
**Repos:** `funnelback-proxy`, `funnelback-proxy-dev`

**Justification:** The proxy repos are currently built on Express with plain Vercel serverless functions. Migrating to Next.js App Router Route Handlers would consolidate the stack, eliminate the `vercel.json` rewrite configuration, and make the `middleware.js` (already written as an Edge Runtime module) fully idiomatic. The `lib/` modules (`commonUtils`, `queryAnalytics`, `schemaHandler`, etc.) require no changes and can be moved over directly.

**Approach:**
1. Scaffold new Next.js app
2. Map existing `vercel.json` routes to `app/proxy/` filesystem routes
3. Port handlers one at a time — spelling and tools first, then search, then suggestion endpoints with Redis, then analytics
4. Validate middleware IP extraction, session propagation, and rate limiting end-to-end
5. Parallel run against a preview URL before cutting over

---

*Generated: April 7, 2026*
