// capture all listeners
const searchBar = document.getElementById("search-button");
const allResults = document.getElementById("All_Results0");
const website1 = document.getElementById("Website1");
const programs2 = document.getElementById("Programs2");
const people3 = document.getElementById("People3");
const news4 = document.getElementById("News4");
const law5 = document.getElementById("Law5");
const searchTab = document.getElementsByClassName("tab__button");
const tabElements = document.querySelectorAll('#All_Results0, #Website1, #Programs2, #People3, #News4, #Law5');

// Fetch user's IP address
async function getUserIP() {
  try {
    let response = await fetch('https://api.ipify.org?format=json');
    let data = await response.json();
    console.log("getIP: " + data.ip);
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return ''; // Default to empty if error occurs
  }
}

// Funnelback fetch function
async function fetchFunnelbackWithQuery(url, method, userIP, searchQuery) {

  console.log("async method: " + method);
  try {
    if (method === 'GET' && searchQuery) {
      url += `?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIP,
      },
    };

    let response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    console.log("response status: " + response.status);
    console.log("response type: " + response.type);


    let stream = response.body.pipeThrough(new TextDecoderStream());
    let reader = stream.getReader();
    let text = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        console.log("initial value: " + value);

        if (done) {
          console.log("Stream reading complete.");
          break;
        }
        text += value;

        console.log("text value:", + text); // Process each chunk of data
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
async function fetchFunnelbackWithTabs(url, method, userIP) {

  let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';

  console.log("async method: " + method);
  try {
    if (method === 'GET') {
      getUrl += `${url}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIP,
      },
    };

    let response = await fetch(getUrl, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    console.log("response status: " + response.status);
    console.log("response type: " + response.type);


    let stream = response.body.pipeThrough(new TextDecoderStream());
    let reader = stream.getReader();
    let text = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        console.log("initial value: " + value);

        if (done) {
          console.log("Stream reading complete.");
          break;
        }
        text += value;

        console.log("text value:", + text); // Process each chunk of data
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

// Handle form submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault(); // Prevent page reload
  console.log("get element by id: search-button");

  let searchQuery = document.getElementById('search-input').value; // Get search query
  let userIP = await getUserIP(); // Fetch user IP (optional)
  let ipString = JSON.stringify(userIP);

  console.log('let ip: ' + userIP);
  console.log('ipString: ' + ipString);
  console.log("Query: " + searchQuery);

  // Define Funnelback URLs
  let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  let getResponse = await (fetchFunnelbackWithQuery(getUrl, 'GET', userIP, searchQuery));
  console.log("getResponse: " + getResponse);

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getResponse}</div>
  `;
});

// Handle tab request
tabElements.forEach(el => {
  el.addEventListener('click', async function() {
    alert("tabElements triggered");
    console.log('Tab clicked:', this.id);
    let tabLink = document.getElementById(this.id).getAttribute("href");
    alert('Tab Link:', tabLink);
    
    let userTabIP = await getUserIP(); // Fetch user IP (optional)
    let ipTabString = JSON.stringify(userTabIP);
    console.log('let tabIp: ' + userTabIP);
    console.log('tabIpString: ' + ipTabString);

    // Define Funnelback URLs
    // let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
    let getResponse = await (fetchFunnelbackWithQuery(tabLink, 'GET', userIP));
    console.log("getResponse: " + getResponse);

    // Display results
    document.getElementById('results').innerHTML = `
      <div class="funnelback-search-container">${getResponse}</div>
    `;
})





  let userIP = getUserIP(); // Fetch user IP
  console.log('let ip: ' + userIP);
  console.log("Query: " + searchQuery);

  // Define Funnelback URLs
  let getTabUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  let getTabResponse = await (fetchFunnelbackWithTabs(getTabUrl, 'GET', userIP, searchQuery, tabName));
  console.log("getTabResponse: " + getTabResponse);

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getTabResponse}</div>
  `;
});