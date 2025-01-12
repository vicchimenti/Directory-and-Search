// funnelback-search-wrapper.js
const https = require('https');

const FUNNELBACK_URL = 'https://dxp-us-search.funnelback.squiz.cloud/s/search.html';

exports.handler = async (event, context) => {
    try {
        // Get client IP from API Gateway event
        const clientIP = event.requestContext.identity.sourceIp;
        
        // Get query parameters from the event
        const queryParams = event.queryStringParameters || {};
        
        // Convert query parameters to URL search params
        const searchParams = new URLSearchParams(queryParams);
        const queryString = searchParams.toString();
        
        // Make request to Funnelback
        const response = await new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'X-Forwarded-For': clientIP
                }
            };
            
            https.get(`${FUNNELBACK_URL}?${queryString}`, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        body: data,
                        headers: res.headers
                    });
                });
            }).on('error', reject);
        });
        
        // Return the response
        return {
            statusCode: response.statusCode,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': 'https://www.seattleu.edu',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: response.body
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://www.seattleu.edu'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};