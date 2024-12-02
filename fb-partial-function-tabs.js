// capture search bar
const searchBar = document.getElementById("search-button");
let getResponse = null;


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

  console.log("fetchFunnelbackWithTabs");
  alert("fetchFunnelbackWithTabs");

  let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
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
        // 'X-Forwarded-For': userIP,
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

// handle tab click
async function handleClick(event) {
  preventDefault(event);
  console.log('Button clicked!');
  console.log('Tab clicked:' +  this.id);
  alert("tabElements triggered: " + this.id);
  let userTabIP = await getUserIP(); // Fetch user IP (optional)
  let ipTabString = JSON.stringify(userTabIP);
  // console.log('let tabIp: ' + userTabIP);
  console.log('tabIpString: ' + ipTabString);
  let tabLink = document.getElementById(this.id).getAttribute("href");
  console.log('Logged tab Link: ' + tabLink);
  alert('Tab Link: ' + tabLink);
  let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET', userIP));
  console.log("getTabResponse: " + getTabResponse);

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getTabResponse}</div>
  `;
}



function processTabs () {

  console.log("getResponse true");

  // Gather listeners after results post
  const allResults = document.getElementById("All_Results0");
  const website1 = document.getElementById("Website1");
  const programs2 = document.getElementById("Programs2");
  const people3 = document.getElementById("People3");
  const news4 = document.getElementById("News4");
  const law5 = document.getElementById("Law5");
  const searchTab = document.getElementsByClassName("tab__button");
  const tabElements = document.querySelectorAll('#All_Results0, #Website1, #Programs2, #People3, #News4, #Law5');
  // let tablink = null;

  // Handle tab request
  tabElements.forEach(el => { el.addEventListener('click', handleClick)})};
    
  //   {
  //     event.preventDefault(); // Prevent page reload



  //     let userTabIP = await getUserIP(); // Fetch user IP (optional)
  //     let ipTabString = JSON.stringify(userTabIP);
  //     // console.log('let tabIp: ' + userTabIP);
  //     console.log('tabIpString: ' + ipTabString);


      

  //     let tabLink = document.getElementById(this.id).getAttribute("href");
  //     console.log('Logged tab Link: ' + tabLink);
  //     alert('Tab Link: ' + tabLink);
      

  //     // Define Funnelback URLs
  //     // let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  //     let getTabResponse = await (fetchFunnelbackWithTabs(tabLink, 'GET', userIP));
  //     console.log("getTabResponse: " + getTabResponse);

  //     // Display results
  //     document.getElementById('results').innerHTML = `
  //       <div class="funnelback-search-container">${getTabResponse}</div>
  //     `;
  //   })
  // });


// }

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
  let prodUrl = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';
  getResponse = await (fetchFunnelbackWithQuery(prodUrl, 'GET', userIP, searchQuery));
  console.log("getResponse: " + getResponse);

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getResponse}</div>
  `;

  processTabs();
});
