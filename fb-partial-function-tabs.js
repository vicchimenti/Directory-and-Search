// capture search bar and global declarations
const searchBar = document.getElementById("search-button");
const onPageButton= document.getElementById("on-page-search-button");
let prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
let userIpAddress = null;
let userIp = null;
let tabElements = null;
let eventListeners = [];




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




// save tab listeners
function saveListeners() {
  if (tabElements) {
    localStorage.setItem('eventListeners', JSON.stringify(eventListeners));

  }
} 




// Funnelback fetch function
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




// Funnelback fetch function
async function fetchFunnelbackWithTabs(url, method) {

  try {
    if (method === 'GET') {
      prodUrl += `${url}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIp,
      },
    };

    let response = await fetch(prodUrl, options);
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
async function handleClick(e) {
  e.preventDefault();
  if (e.target.matches('a')) {

    let tabLink = e.target.getAttribute("href");
    let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET'));

    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">${getTabResponse}</div>
    `;
  }
  processTabs();
}



// add listeners to tabs
async function processTabs() {

  tabElements = document.querySelector('.tab-list__nav');
  tabElements.addEventListener('click', handleClick, false);

  eventListeners.push({ element: tabElements, event: 'click', listener: handleClick });
  saveListeners();  
}




// Handle form submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchBarQuery = document.getElementById('search-input').value;
  let getResponse = await (fetchFunnelbackWithQuery(prodUrl, 'GET', searchBarQuery));

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getResponse}</div>
  `;

  processTabs();
});




// handle search page input
onPageButton.addEventListener('click', async (event) => {
  event.preventDefault();

  let searchQuery = document.getElementById('on-page-search-input').value;
  let getOnPageResponse = await (fetchFunnelbackWithQuery(prodUrl, 'GET', searchQuery));

  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getOnPageResponse}</div>
  `;

  processTabs();
});
