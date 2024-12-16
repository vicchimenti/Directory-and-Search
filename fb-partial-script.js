/***
 * SU Funnelback Partial Script
 * 
 * Handles Tabs, Facets and Tools
 */

// capture search bar and globaldeclarations
const searchBar = document.getElementById("search-button");
const onPageSearch = document.getElementById("on-page-search-button");
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




// Funnelback fetch tabs function
async function fetchFunnelbackResults(url, method) {

  let prodTabUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';

  try {
    if (method === 'GET') {
      prodTabUrl += `${url}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIp,
      },
    };

    let response = await fetch(prodTabUrl, options);
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
    return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
  }
}




// Funnelback fetch search tools function
async function fetchFunnelbackTools(url, method) {

  let prodToolsUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';

  try {
    if (method === 'GET') {
      prodToolsUrl += `${url}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIp,
      },
    };

    let response = await fetch(prodToolsUrl, options);
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
    return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
  }
}




// Funnelback fetch search tools function
async function fetchFunnelbackSpelling(url, method) {

  let prodSpellingUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/';
  let partial = '&form=partial';
  let query = url +=`${partial}`;

  try {
    if (method === 'GET') {
      prodSpellingUrl += `${query}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIp,
      },
    };

    let response = await fetch(prodSpellingUrl, options);
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
    return `<p>Error fetching ${method} tabbed request. Please try again later.</p>`;
  }
}



// handle tab listeners
async function handleTab(e) {
  e.preventDefault();

  const fetchTab = e.target.closest('.tab-list__nav a');
  const tabHref = fetchTab.getAttribute('href');
  console.log("Relative href:", tabHref);

  // Fetch and process data using the relative link
  let getTabResponse = null;
  if (tabHref) {
    try {
      getTabResponse = await fetchFunnelbackResults(tabHref, 'GET');
    } catch (error) {
      console.error("Error fetching tab data:", error);
      getTabResponse = "Error loading tab results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getTabResponse || "No tab results found."}
    </div>
  `;
}




// Function to handle anchor clicks
async function handleFacetAnchor(e) {
  e.preventDefault();

  const facetAnchor = e.target.closest('.facet-group__list a');
  const facetHref = facetAnchor.getAttribute('href');
  console.log("Relative href:", facetHref);

  // Fetch and process data using the relative link
  let getFacetResponse = null;
  if (facetHref) {
    try {
      getFacetResponse = await fetchFunnelbackResults(facetHref, 'GET');
    } catch (error) {
      console.error("Error fetching facet data:", error);
      getFacetResponse = "Error loading facet results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getFacetResponse || "No facet results found."}
    </div>
  `;
}




// handle search tool listeners
async function handleSearchTools(e) {
  e.preventDefault();

  const fetchTools = e.target.closest('.search-tools__button-group a');
  const toolHref = fetchTools.getAttribute('href');
  console.log("Relative href:", toolHref);

  // Fetch and process data using the relative link
  let getToolResponse = null;
  if (toolHref) {
    try {
      getToolResponse = await fetchFunnelbackTools(toolHref, 'GET');
    } catch (error) {
      console.error("Error fetching tab data:", error);
      getToolResponse = "Error loading tool results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getToolResponse || "No tool results found."}
    </div>
  `;
}




// handle facet cleaners
async function handleClearFacet(e) {
  e.preventDefault();

  const fetchClear = e.target.closest('a.facet-group__clear');
  const clearHref = fetchClear.getAttribute('href');
  console.log("Relative href:", clearHref);

  // Fetch and process data using the relative link
  let getClearResponse = null;
  if (clearHref) {
    try {
      getClearResponse = await fetchFunnelbackResults(clearHref, 'GET');
    } catch (error) {
      console.error("Error fetching clear data:", error);
      getClearResponse = "Error loading clear results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getClearResponse || "No clear results found."}
    </div>
  `;
}




// handle facet cleaners
async function handlePagination(e) {
  e.preventDefault();

  // click could be on either a list item or directly on the anchor
  const pagHref = 
    e.target.getAttribute('href') ||
    e.target.querySelector('a')?.getAttribute('href');

  // Fetch and process data using the relative link
  let getPagResponse = null;
  if (pagHref) {
    try {
      getPagResponse = await fetchFunnelbackResults(pagHref, 'GET');
    } catch (error) {
      console.error("Error fetching clear data:", error);
      getPagResponse = "Error loading pagination results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getPagResponse || "No pagination results found."}
    </div>
  `;
}




// handle spelling click
async function handleSpellingClick(e, href) {
  e.preventDefault();

  // Fetch and process data using the relative link
  let getClickResponse = null;
  if (href) {
    try {
      getClickResponse = await fetchFunnelbackSpelling(href, 'GET');
    } catch (error) {
      console.error("Error fetching clear data:", error);
      getClickResponse = "Error click results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getClickResponse || "No click results found."}
    </div>
  `;
}




// handle click
async function handleClick(e, href) {
  e.preventDefault();

  // Fetch and process data using the relative link
  let getClickResponse = null;
  if (href) {
    try {
      getClickResponse = await fetchFunnelbackResults(href, 'GET');
    } catch (error) {
      console.error("Error fetching clear data:", error);
      getClickResponse = "Error click results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getClickResponse || "No click results found."}
    </div>
  `;
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
