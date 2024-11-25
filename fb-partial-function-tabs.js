// capture all listeners
const searchBar = document.getElementById("search-button");
const allResults = document.getElementById("All_Results0");
const website1 = document.getElementById("Website1");
const programs2 = document.getElementById("Programs2");
const people3 = document.getElementById("People3");
const news4 = document.getElementById("News4");
const law5 = document.getElementById("Law5");
const searchTab = document.getElementsByClassName("tab__button");

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
searchTab.addEventListener('click', async (event) => {
  event.preventDefault(); // Prevent page reload
  console.log("get element by class tab__button");

  let tabId = document.getElementsByClassName("tab__button")[0].id;
  console.log("tabId: " +tabId);
  
  let tabName = '';
  switch (tabId) {
    case "Website1": tabName = "&f.Tabs%7Cseattleu%7Eds-web=Website";
    break;
    case "Programs2": tabName = "&f.Tabs%7Cseattleu~ds-programs=Programs";
    break;
    case "People3": tabName = "&f.Tabs%7Cseattleu~ds-staff=People";
    break;
    case "News4": tabName = "&f.Tabs%7Cseattleu~ds-news=News";
    break;
    case "Law5": tabName = "&f.Tabs%7Cseattleu~ds-law=Law";
    break;
    default : tabName = null;
  }

  console.log("tabName: " + tabName);
  let userIP = await getUserIP(); // Fetch user IP
  console.log('let ip: ' + userIP);
  console.log("Query: " + searchQuery);

  // Define Funnelback URLs
  let getUrl = 'https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html';
  // let getResponse = await (fetchFunnelbackWithQuery(getUrl, 'GET', userIP, searchQuery));
  // console.log("getResponse: " + getResponse);

  // Display results
  document.getElementById('results').innerHTML = `
    <div class="funnelback-search-container">${getResponse}</div>
  `;
});