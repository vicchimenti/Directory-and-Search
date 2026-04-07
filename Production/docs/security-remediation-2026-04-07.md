# Security Remediation — April 7, 2026

**Author:** Victor Chimenti  
**Repos affected:** `funnelback-proxy`, `funnelback-proxy-dev`, `su-search`, `su-search-dev`  
**Triggered by:** GitHub Dependabot alert — path-to-regexp High severity CVE

---

## Background

A GitHub Dependabot alert flagged a High severity vulnerability in `path-to-regexp` on the `funnelback-proxy` production repo. Upon investigation, the alert expanded to reveal 6 open vulnerabilities across the proxy repos and 12 across the frontend repos — some of which had been open for 7–9 months undetected due to Dependabot being disabled on three of the four repos.

### System Architecture

The Seattle University search system consists of four mirrored Vercel applications:

| App | Role | Traffic |
|---|---|---|
| `su-search` | Frontend (Next.js) — production | ~2,950 req/hr (pre-render + cache) |
| `su-search-dev` | Frontend (Next.js) — development/backup | Mirror of prod |
| `funnelback-proxy` | Backend proxy (Express) — production | ~50 req/hr live to Squiz |
| `funnelback-proxy-dev` | Backend proxy (Express) — development/backup | Mirror of prod |

The proxy backend relays live search queries to Squiz/Funnelback, with Redis caching and MongoDB logging. Rate limiting is handled at the Vercel edge via `middleware.js`.

---

## Vulnerabilities Found

### funnelback-proxy / funnelback-proxy-dev (Express stack)

| Package | Severity | CVE | Description |
|---|---|---|---|
| `form-data` | **Critical** | GHSA-fjxv-7rqg-78g4 | Unsafe random function for boundary selection |
| `axios` | **High** | GHSA-4hjh-wcwx-xvwj | DoS via lack of data size check |
| `axios` | **High** | GHSA-43fc-jf86-j433 | DoS via `__proto__` key in mergeConfig |
| `path-to-regexp` | **High** | GHSA-37ch-88jc-xwx2 | ReDoS via multiple route parameters |
| `qs` | **Moderate** | GHSA-w7fw-mjwx-w883 | arrayLimit bypass via bracket notation |
| `qs` | **Low** | GHSA-6rw7-vpxm-498p | arrayLimit bypass via comma parsing |

### su-search / su-search-dev (Next.js stack)

| Package | Severity | CVE | Description |
|---|---|---|---|
| `form-data` | **Critical** | GHSA-fjxv-7rqg-78g4 | Unsafe random function for boundary selection |
| `next` | **High** | GHSA-ggv3-7p47-pfv8 | HTTP request smuggling in rewrites |
| `next` | **High** | GHSA-h25m-26qc-wcjf | HTTP request deserialization DoS |
| `next` | **High** | GHSA-9g9p-9gw9-jx7f | DoS via Image Optimizer remotePatterns |
| `next` | **High** | GHSA-3x4c-7xq6-9pq8 | Unbounded next/image disk cache growth |
| `flatted` | **High** | GHSA-25h7-pfq9-p65f | Unbounded recursion DoS in parse() |
| `flatted` | **High** | GHSA-rf6f-7fwh-wjgh | Prototype pollution via parse() |
| `axios` | **High** | GHSA-4hjh-wcwx-xvwj | DoS via lack of data size check |
| `axios` | **High** | GHSA-43fc-jf86-j433 | DoS via `__proto__` key in mergeConfig |
| `minimatch` | **High** | Multiple | ReDoS via repeated wildcards / GLOBSTAR / extglobs |
| `picomatch` | **High** | Multiple | Method injection in POSIX character classes / ReDoS |
| `glob` | **High** | GHSA-5j98-mcp5-4vw2 | CLI command injection via `--cmd` flag |
| `ajv` | **Moderate** | GHSA-2g4f-4pwh-qvx6 | ReDoS when using `$data` option |
| `js-yaml` | **Moderate** | GHSA-mh29-5h37-fv8m | Prototype pollution in merge |
| `brace-expansion` | **Moderate** | Multiple | ReDoS vulnerabilities |

---

## Actual Risk Assessment

Despite the severity ratings, the immediate exposure was low due to existing mitigations:

- **Vercel firewall** — blocks malicious traffic at the network edge
- **Edge rate limiting** — `middleware.js` enforces per-endpoint request limits (60 req/min) keyed by IP, running before any serverless function is invoked
- **CORS locked to `https://www.seattleu.edu`** — no arbitrary origin requests accepted
- **`path-to-regexp` routes are static** — no multi-parameter segments like `/:a-:b` in `vercel.json`, eliminating the primary ReDoS attack vector
- **Proxy load** — ~2,000 req/hr reach the Squiz/Funnelback backend, making the axios and rate limiter fixes higher priority than initially assessed
  
The vulnerabilities were still remediated immediately as best practice and to maintain a clean security posture ahead of the planned Enterprise GitHub migration.

---

## Remediation Actions Taken

### Order of operations

All fixes followed the **dev-first** approach: fix and verify on the dev instance before applying to production.

### funnelback-proxy-dev

1. Merged Dependabot PR #1 on `funnelback-proxy` (prod) — bumped `path-to-regexp` to `0.1.13`
2. Ran `npm update path-to-regexp` on dev to mirror the fix
3. Ran `npm audit fix` — resolved all 6 vulnerabilities
4. Removed `node_modules` from git tracking (was historically committed before `.gitignore` rule was in place):
   ```bash
   git rm -r --cached node_modules
   ```
5. Committed and pushed — verified 0 vulnerabilities

**Commit:** `chore: untrack node_modules and fix all npm audit vulnerabilities`

### funnelback-proxy (production)

1. Confirmed Dependabot PR preview deployment was green in Vercel
2. Reviewed PR diff — only `package-lock.json` changed, versions correct
3. Merged Dependabot PR
4. Ran `npm audit fix` — resolved remaining 5 vulnerabilities
5. Removed `node_modules` from git tracking
6. Committed and pushed — verified Vercel production deployment green

**Commit:** `chore: untrack node_modules and fix all npm audit vulnerabilities`

### su-search-dev

1. Ran `npm audit fix` twice (second pass clears `brace-expansion`)
2. Result: 12 → 4 vulnerabilities
3. Remaining 4 all require `next@16.2.2` — deferred (see below)
4. Committed and pushed — verified Vercel preview deployment green

**Commit:** `build(deps): fix 8 of 12 npm audit vulnerabilities via npm audit fix`

### su-search (production)

1. Ran `npm audit fix` twice
2. Result: 12 → 4 vulnerabilities — identical to dev as expected
3. Committed and pushed — verified Vercel production deployment green in 27s

**Commit:** `build(deps): fix 8 of 12 npm audit vulnerabilities via npm audit fix`

---

## node_modules in Git — Root Cause

Both proxy repos had `node_modules` committed to git history. The `.gitignore` rule existed but was added after the initial commit, so git continued tracking the directory. This was resolved with `git rm -r --cached node_modules` on both repos. The frontend repos did not have this issue.

---

## Deferred Items

### 1. Next.js 15 → 16 Major Version Upgrade

**Affects:** `su-search`, `su-search-dev`  
**Severity:** 4 High vulnerabilities remaining  
**Why deferred:** `npm audit fix --force` would install `next@16.2.2`, a major version with breaking changes. This requires:
- Reviewing the Next.js 16 migration guide
- Auditing all Next.js API usage (App Router, middleware, image optimization, rewrites)
- Full regression testing of all search functionality
- Dedicated planned session — not a quick fix

**Packages affected:**
- `next` — HTTP request smuggling, DoS vulnerabilities
- `glob` / `eslint-config-next` — dev tooling only, not a runtime concern

### 2. Axios Timeout Enhancement

**Affects:** `funnelback-proxy`, `funnelback-proxy-dev`  
**Issue:** Handlers (`suggest.js`, `tools.js`, `suggestPrograms.js`, etc.) use `axios.get()` without a timeout configured. A slow Squiz upstream response could hang a serverless function until Vercel's hard execution limit.  
**Fix:** Add `timeout: 5000` to all axios calls — a minor addition using axios's built-in timeout option.

### 3. Branch Protection

**Affects:** All four repos  
**Recommendation:** Enable "Require a pull request before merging" on `main` for all repos before the Enterprise GitHub migration. This prevents accidental force pushes and creates a clean audit trail for security fixes.

### 4. Dependabot Alerts

Enabled on all four repos during this session. Prior to today, only `funnelback-proxy` had Dependabot enabled, which is why several vulnerabilities went undetected for 7–9 months.

---

## Final Vulnerability Status

| Repo | Before | After | Remaining |
|---|---|---|---|
| `funnelback-proxy` | 6 | **0** | None |
| `funnelback-proxy-dev` | 6 | **0** | None |
| `su-search` | 12 | **4** | Next.js 16 upgrade required |
| `su-search-dev` | 12 | **4** | Next.js 16 upgrade required |

---

## Next Session Checklist

- [ ] Review Next.js 16 migration guide
- [ ] Upgrade Next.js on `su-search-dev` first, test thoroughly
- [ ] Upgrade Next.js on `su-search` (prod) after dev verification
- [ ] Add `timeout: 5000` to all axios calls in proxy handlers
- [ ] Enable branch protection on all four repos
- [ ] Consider adding query-based rate limiting to `middleware.js`

---

*Generated: April 7, 2026*
