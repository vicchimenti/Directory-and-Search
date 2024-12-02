// capture search bar
const searchBar = document.getElementById("search-button");
let getResponse = null;
let userIpAddress = null;

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

// Fetch user's IP address
document.addEventListener('DOMContentLoaded', async function() {
  let userIp = await getUserIP();
  userIpAddress = JSON.stringify(userIp);
});

// Funnelback fetch function
async function fetchFunnelbackWithQuery(url, method, searchQuery) {

  // console.log("async method: " + method);
  try {
    if (method === 'GET' && searchQuery) {
      url += `?query=${encodeURIComponent(searchQuery)}&collection=seattleu~sp-search&profile=_default&form=partial`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIpAddress,
      },
    };

    let response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    // console.log("response status: " + response.status);
    // console.log("response type: " + response.type);


    let stream = response.body.pipeThrough(new TextDecoderStream());
    let reader = stream.getReader();
    let text = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        // console.log("initial value: " + value);

        if (done) {
          console.log("Stream reading complete.");
          break;
        }
        text += value;

        // console.log("text value:", + text); // Process each chunk of data
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

  console.log("fetchFunnelbackWithTabs");
  // alert("fetchFunnelbackWithTabs");

  // let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  let prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';

  console.log("async method: " + method);
  try {
    if (method === 'GET') {
      prodUrl += `${url}`;
    }

    let options = {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'text/plain' : 'application/json',
        // 'X-Forwarded-For': userIpAddress,
      },
    };

    let response = await fetch(prodUrl, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    console.log("response status: " + response.status);
    console.log("response type: " + response.type);


    let stream = response.body.pipeThrough(new TextDecoderStream());
    let reader = stream.getReader();
    let text = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        // console.log("initial value: " + value);

        if (done) {
          console.log("Stream reading complete.");
          break;
        }
        text += value;

        // console.log("text value:", + text); // Process each chunk of data
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





async function processTabs () {

  console.log("getResponse true");
  console.log("userTabIp true " + userIpAddress);

  const tabElements = document.querySelectorAll('#All_Results0, #Website1, #Programs2, #People3, #News4, #Law5');


  // Handle tab request
  tabElements.forEach(el => {
    el.addEventListener('click', async function(event) {
      event.preventDefault(); // Prevent page reload

      console.log('Tab clicked:' +  this.id);
      // alert("tabElements triggered: " + this.id);

      let tabLink = document.getElementById(this.id).getAttribute("href");
      console.log('Logged tab Link: ' + tabLink);
      // alert('Tab Link: ' + tabLink);
      

      // Define Funnelback URLs
      // let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
      let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET'));
      console.log("getTabResponse: ready");

      // Display results
      document.getElementById('results').innerHTML = `
        <div class="funnelback-search-container">${getTabResponse}</div>
      `;
    })
  });
  
}

// Handle form submission
searchBar.addEventListener('click', async (event) => {
  event.preventDefault(); // Prevent page reload
  console.log("get element by id: search-button");

  let searchQuery = document.getElementById('search-input').value; // Get search query
  // let userIP = await getUserIP(); // Fetch user IP (optional)
  // let ipString = JSON.stringify(userIP);

  console.log('let ip: ' + userIpAddress);
  // console.log('ipString: ' + ipString);
  console.log("Query: " + searchQuery);

  // Define Funnelback URLs
  // let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  let prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  getResponse = await (fetchFunnelbackWithQuery(prodUrl, 'GET', searchQuery));
  console.log("getResponse: ready");

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getResponse}</div>
  `;

  processTabs();
});
