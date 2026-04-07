# Seattle University Search System — Roadmap

**Author:** Victor Chimenti  
**Date:** April 7, 2026  
**Current Stack:** Vercel (Next.js + Express) → Squiz/Funnelback  
**Version:** 2.0

---

## Phase 1 — Stabilize Current System (In Progress)

**Goal:** Clean, secure, well-documented system ready for Enterprise GitHub migration.

- [x] Resolve all npm audit vulnerabilities across all four repos
- [x] Remove `node_modules` from git tracking
- [x] Enable Dependabot alerts on all four repos
- [ ] Upgrade Next.js 14 → 16 (`su-search-dev` first, then prod)
- [ ] Add axios timeout to all proxy handlers
- [ ] Enable branch protection on all four repos
- [ ] Migrate all four repos into SU Enterprise GitHub

---

## Phase 2 — Enterprise Vercel + AWS Onboarding

**Goal:** Operate within SU IT infrastructure, establish AWS presence.

- [ ] Migrate Vercel apps to SU Enterprise account
- [ ] Understand SU IT operational requirements and compliance standards
- [ ] Gain AWS access — S3 buckets and data warehouse
- [ ] Build Cornish website (AWS learning ground)
- [ ] Build Law website (AWS learning ground)
- [ ] Build new staff directory system backed by S3/data warehouse
  - Direct data ownership replaces Squiz dependency for people data
  - Informs future `suggestPeople` redesign

---

## Phase 3 — Greenfield Search System on AWS

**Goal:** Rebuild search from scratch with full data ownership and AWS-native architecture.

### What changes:
- **Analytics first or not at all** — design dashboard before building infrastructure
- **AWS Lambda** replaces Vercel serverless proxy functions
- **API Gateway** replaces `vercel.json` routing
- **ElastiCache** replaces Upstash Redis
- **CloudFront** replaces Vercel edge network
- **S3 / data warehouse** as direct data source for people and programs
- **Rate limiting** at API Gateway level, not application middleware
- **Timeout handling** on all upstream calls from day one
- **Query-based rate limiting** built in given ~2,000 req/hr load

### The Squiz/Funnelback decision:
Squiz/Funnelback is a web team decision — no IT dependency or contract entanglement. On the rebuild this becomes a straightforward evaluation:

| Option | Pros | Cons |
|---|---|---|
| **Renew Funnelback** | Proven, already integrated, minimal rebuild risk | Ongoing licensing cost, external vendor dependency, limited index control |
| **AWS OpenSearch** | Native to stack, full index ownership, no licensing, FERPA-friendly | Build and tuning effort, web team owns maintenance |

The rebuild is the natural moment to make this call — evaluate on merit and budget alone.

### What to leave behind:
- Half-built analytics infrastructure (build it or don't)
- `node_modules` in git
- Dormant MongoDB collections
- Middleware-level rate limiting as primary defense

---

## Key Principles for the Rebuild

1. **Greenfield means lean** — only build what will be used at launch
2. **Data ownership** — own the index, don't depend on a vendor's data model
3. **AWS-native** — leverage existing SU infrastructure and agreements
4. **FERPA-aware** — all faculty/staff data handling under one cloud umbrella
5. **Web team owns it** — no IT dependencies on search infrastructure decisions
6. **Dev-first always** — A/B dev/prod mirror pattern has proven its value, keep it

---

*Current system is solid — this roadmap is evolution, not emergency.*
