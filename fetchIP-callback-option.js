function fetchPublicIP(callback) {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => callback(null, data.ip))
      .catch(error => callback(error, null));
  }
  
  fetchPublicIP((error, ip) => {
    if (error) {
      console.error('Error retrieving IP address:', error);
    } else {
      console.log('Public IP address retrieved:', ip);
    }
  });