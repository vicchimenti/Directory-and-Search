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





// handle tab listeners
async function handleTab(e) {
  e.preventDefault(); // Prevent default navigation
  const fetchTab = e.target.closest('.tab-list__nav a'); // Get the clicked tab
  const tabHref = fetchTab.getAttribute('href'); // Get relative link
  console.log("Relative href:", tabHref);

  // Fetch and process data using the relative link
  let getTabResponse = null;
  if (tabHref) {
    try {
      getTabResponse = await fetchFunnelbackWithTabs(tabHref, 'GET');
    } catch (error) {
      console.error("Error fetching tab data:", error);
      getTabResponse = "Error loading tab results.";
    }
  }

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">
      ${getTabResponse || "No results found."}
    </div>
  `;
}
// async function handleTab(e) {
//   e.preventDefault();
//   if (e.target.matches('a')) {

//     let tabLink = e.target.getAttribute("href");
//     let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET'));

//     document.getElementById('results').innerHTML = `
//       <div class="funnelback-search-container">${getTabResponse}</div>
//     `;
//   }
//   processTabs();
// }





// Function to handle anchor clicks
async function handleFacetAnchor(e) {
  e.preventDefault(); // Prevent default navigation
  const facetAnchor = e.target.closest('.facet-group__list a'); // Get the clicked anchor
  const relativeHref = facetAnchor.getAttribute('href'); // Get relative link
  console.log("Relative href:", relativeHref);

  // Fetch and process data using the relative link
  let getFacetResponse = null;
  if (relativeHref) {
    try {
      getFacetResponse = await fetchFunnelbackWithTabs(relativeHref, 'GET');
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






// establish body listener
document.body.addEventListener('click', (e) => {
  console.log("Clicked element:", e.target);

  const anchor = e.target.closest('.facet-group__list a');
  if (anchor) {
    console.log("Anchor found:", anchor);
    handleFacetAnchor(e);
  } else {
    console.log("Click was not on an anchor.");
  }

  const tabElement = e.target.closest('.tab-list__nav a');
  if (tabElement) {
    console.log("tab found:", tabElement);
    handleTab(e);
  } else {
    console.log("Click was not on a tab.");
  }
});





// Create tab group listener
// async function processTabs() {

//   let tabElements = document.querySelector('.tab-list__nav');
//   tabElements.addEventListener('click', handleClick, false);
  
// }




// Handle search bar submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchQuery = document.getElementById('search-input').value;
  let prodSearchBarUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  let getSearchBarResponse = await (fetchFunnelbackWithQuery(prodSearchBarUrl, 'GET', searchQuery));


  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getSearchBarResponse}</div>
  `;

  // processTabs();
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

  // processTabs();
});
