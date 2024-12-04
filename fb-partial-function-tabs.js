// capture search bar and globaldeclarations
const searchBar = document.getElementById("search-button");
const onPageSearch = document.getElementById("on-page-search-button");
let userIpAddress = null;
let userIp = null;
// let tabElements = null;
// let facetElements = null;
let eventListeners = [];
let processTabsBool = false;




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
async function fetchFunnelbackWithTabs(url, method) {

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




// Store listeners
function saveListeners() {
  if (tabElements) {
    localStorage.setItem('eventListeners', JSON.stringify(eventListeners));

  }
} 




// handle tab listeners
async function handleClick(e) {
  processTabsBool = false;
  e.preventDefault();
  if (e.target.matches('a')) {

    let tabLink = e.target.getAttribute("href");
    let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET'));

    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">${getTabResponse}</div>
    `;
    processTabsBool = true;
  }
  processTabs();
}




// handle facet listeners
// async function handleFacet(e) {
//   e.preventDefault();
//   alert("handle facet click");
//   console.log("target: " + e.target);

//   let facetButton = e.target;
//   let facetAnchor = facetButton.parentElement.querySelector('.facet-group__list a');

//   let facetLink = (facetAnchor) ? facetAnchor.href : null;
//   console.log("facet link: " + facetLink);
//   let getFacetResponse = (facetLink) ? await (fetchFunnelbackWithTabs(facetLink, 'GET')) : null;


//   document.getElementById('results').innerHTML = `
//     <div class="funnelback-search-container">${getFacetResponse}</div>
//   `;

//   processFacets();
// }

async function handleFacet(e) {
  e.preventDefault();
  console.log("HandleFacet triggered:", e.target);

  let facetButton = e.target; // The button clicked
  let facetAnchor = facetButton.parentElement.querySelector('.facet-group__list a');
  let facetLink = facetAnchor ? facetAnchor.href : null;
  console.log("Facet link:", facetLink);

  let getFacetResponse = null;
  if (facetLink) {
    try {
      getFacetResponse = await fetchFunnelbackWithTabs(facetLink, 'GET');
    } catch (error) {
      console.error("Error fetching facet data:", error);
      getFacetResponse = "Error loading facet results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getFacetResponse || "No results found."}
    </div>
  `;
}




// Create facet group listener
async function processFacets() {
  console.log("process facets");

  let facetElements = document.querySelectorAll('button.facet-group__title');
  facetElements.forEach(facet => {
    facet.removeEventListener('click', handleFacet);
    facet.addEventListener('click', handleFacet, false)
  });

  console.log("facet listener added");

  facetElements.forEach(facet => {
    eventListeners.push({ element: facet, event: 'click', listener: handleFacet });
  });

  console.log("facet listener pushed");
}




// Create tab group listener
async function processTabs() {

  let tabElements = document.querySelector('.tab-list__nav');
  tabElements.addEventListener('click', handleClick, false);

  eventListeners.push({ element: tabElements, event: 'click', listener: handleClick }); 
  
}




// Handle search bar submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchQuery = document.getElementById('search-input').value;
  let prodSearchBarUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  let getSearchBarResponse = await (fetchFunnelbackWithQuery(prodSearchBarUrl, 'GET', searchQuery));


  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getSearchBarResponse}</div>
  `;

  processTabs();
  processFacets();
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

  processTabs();
  processFacets();
});
