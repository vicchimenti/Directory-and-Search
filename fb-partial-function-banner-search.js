// capture search bar and globaldeclarations
const searchBar = document.getElementById("search-button");
// const onPageSearch = document.getElementById("on-page-search-button");
let userIpAddress = null;
let userIp = null;




// gather user ip method
async function getUserIP() {
  try {
    let response = await fetch('https://api.ipify.org?format=json');
    let data = await response.json();
    return data.ip;
  } catch (error) {
      console.error('Error fetching IP address:', error);
      return ''; // Default to empty if error occurs
  }
}




// Fetch user's IP address
document.addEventListener('DOMContentLoaded', async function() {
  userIp = await getUserIP();
  userIpAddress = JSON.stringify(userIp);
});




// Funnelback fetch search input function
async function fetchFunnelbackWithQuery(url, method, searchQuery) {

   try {
    if (method === 'GET' && searchQuery) {
      url += `?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIp,
      },
    };

    let response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);


    let stream = response.body.pipeThrough(new TextDecoderStream());
    let reader = stream.getReader();
    let text = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }
        text += value;
      }

    } catch (error) {
      console.error("Error reading stream:", error);
    } finally {
      reader.releaseLock();
    }
  
    return text;

  } catch (error) {
    console.error(`Error with ${method} request:`, error);
    return `<p>Error fetching ${method} request. Please try again later.</p>`;
  }
}








// establish body listener
document.body.addEventListener('click', (e) => {
  console.log("Clicked element:", e.target);

  const anchor = e.target.closest('.facet-group__list a');
  if (anchor) {
    handleFacetAnchor(e);
  }

  const tabElement = e.target.closest('.tab-list__nav a');
  if (tabElement) {
    handleTab(e);
  }

  const searchTools = e.target.closest('.search-tools__button-group a');
  if (searchTools) {
    handleSearchTools(e);
  }

  const clearFacets = e.target.closest('a.facet-group__clear');
  if (clearFacets) {
    handleClearFacet(e);
  }

  const facetBreadcrumbLink = e.target.closest('.facet-breadcrumb__link');
  const facetBreadcrumbs = e.target.closest('.facet-breadcrumb__item');
  const targetFacetBc = facetBreadcrumbLink || facetBreadcrumbs;
  if (targetFacetBc) {
    const fbcHref = targetFacetBc.getAttribute('href') ||
      targetFacetBc.querySelector('a')?.getAttribute('href');
    handleClick(e, fbcHref);
  }

  const relatedItem = e.target.closest('.related-links__item');
  const relatedLink = e.target.closest('.related-links__link');
  const relatedTarget = relatedItem || relatedLink;
  if (relatedTarget) {
    const relatedHref = relatedTarget.getAttribute('href') ||
      relatedTarget.querySelector('a')?.getAttribute('href');
    handleClick(e, relatedHref);
  }

  const paginationLink = e.target.closest('.pagination__item');
  const paginationAnchor = e.target.closest('.pagination__link');
  const targetPagination = paginationLink || paginationAnchor;
  if (targetPagination) {
    handlePagination(e);
  }

  const spellingSuggestions = e.target.closest('.search-spelling-suggestions__link');
  if (spellingSuggestions) {
    const spellingHref = spellingSuggestions.getAttribute('href');
    handleSpellingClick(e, spellingHref);
  }

  const queryBlend = e.target.closest('.query-blending__highlight');
  if (queryBlend) {
    const blendHref = queryBlend.getAttribute('href');
    handleClick(e, blendHref);
  }
});




// Handle search bar submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchQuery = document.getElementById('search-input').value;
  let prodSearchBarUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  let getSearchBarResponse = await (fetchFunnelbackWithQuery(prodSearchBarUrl, 'GET', searchQuery));


  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getSearchBarResponse}</div>
  `;
});




// Handle on page search bar submission
onPageSearch.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchQuery = document.getElementById('on-page-search-input').value;
  let prodOnPageSearchUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  let getOnPageResponse = await (fetchFunnelbackWithQuery(prodOnPageSearchUrl, 'GET', searchQuery));


  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getOnPageResponse}</div>
  `;
});
