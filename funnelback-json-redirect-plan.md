# Development Plan: Inline Redirect Simulation with Funnelback JSON

## Overview
The current search experience redirects users from any page to the search results page. 
While fast (~400 ms), the redirect creates a noticeable "flash" that users perceive as slower than some peer universities (e.g., Gonzaga).

This plan outlines how to transition to a JSON-powered, inline search rendering system that simulates a redirect while avoiding a full page reload.

---

## Goals
- Eliminate the visible "flash" during search redirects.
- Update the URL to reflect the search results page (so bookmarking and sharing still work).
- Fetch results via Funnelback’s `.json` endpoint instead of `.html`.
- Render results dynamically in the front-end.
- Provide a fallback to the current `.html` system for non-JavaScript users or SEO.

---

## Step 1: Maintain Current Baseline
- Keep the existing `.html` results page using Funnelback stencils (`Partial.ftl`).
- Ensure that if JavaScript is disabled, the current redirect and stencil system still functions.

---

## Step 2: Intercept Search Form Submission
- Prevent the default form submission behavior.
- Capture the query string.
- Update the browser’s URL using the History API.

```js
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const query = searchInput.value;
  const newUrl = `/search/?query=${encodeURIComponent(query)}`;
  history.pushState({}, "", newUrl);
  runSearch(query);
});
```

---

## Step 3: Fetch JSON Results
- Use Funnelback’s `.json` endpoint:
  - Example: `/s/search.json?collection=seattleu~sp-search&query=<term>`
- Replace HTML stencils with parsed JSON.

```js
async function runSearch(query) {
  const res = await fetch(`/s/search.json?collection=seattleu~sp-search&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  renderResults(data.response.resultPacket.results);
}
```

---

## Step 4: Render Results Inline
- Map JSON results into HTML elements dynamically.
- Apply existing CSS classes for consistent styling.

```js
function renderResults(results) {
  resultsContainer.innerHTML = results.map(r => `
    <div class="search-result">
      <h3><a href="${r.liveUrl}">${r.title}</a></h3>
      <p>${r.summary}</p>
    </div>
  `).join("");
}
```

---

## Step 5: Handle Browser Navigation
- Ensure the Back/Forward buttons trigger a new search.
- Read query params from `location.search`.

```js
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  const query = params.get("query");
  if (query) runSearch(query);
});
```

---

## Step 6: Progressive Enhancement
- On first page load, default to `.html` stencils for SEO and no-JS users.
- When JavaScript loads, detect presence of results container and override with JSON-rendered results.

---

## Step 7: Testing and Metrics
- Test redirect simulation across major browsers (Chrome, Firefox, Safari, Edge).
- Validate accessibility (ARIA roles for live regions).
- Benchmark perceived speed with user testing.
- Track performance metrics (First Contentful Paint, Time to Interactive).

---

## Benefits
- Perceived "instant redirect" without backend infrastructure changes.
- Retains SEO-friendly, shareable URLs.
- Smaller payloads via JSON (faster over network).
- Flexible for future enhancements (filters, faceting, infinite scroll).

---

## Next Steps
- Prototype the inline redirect simulation on a dev branch.
- Compare user-perceived performance with current `.html` approach.
- Roll out gradually, starting with logged-in or beta users.

---

**Author:** Victor Chimenti  
**Date:** September 2025  
