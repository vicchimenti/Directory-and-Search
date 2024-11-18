document.addEventListener("DOMContentLoaded", function() {
    // Fetch the IP address from the API
    fetch("https://ipinfo.io/json") 
        .then(response => response.json())
        .then(data => {
            // log the ip
            console.log("my ip: " + data.ip);
            // document.getElementById("ip-address").textContent = 
            //       `IP Address: ${data.ip}`;
        })
        .catch(error => {
            console.error("Error fetching IP address:", error);
            document.getElementById("ip-address").textContent = 
                  "Unable to retrieve IP address.";
        });
});