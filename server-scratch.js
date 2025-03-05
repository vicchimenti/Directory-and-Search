/**
 * @fileoverview Analytics API Click Endpoint for Funnelback Search Integration
 * 
 * This file contains API handler for tracking various search analytics events
 * including click tracking data.
 * 
 * @author Victor Chimenti
 * @version 1.0.2
 * @lastModified 2025-03-05
 */

// api/analytics/click.js
module.exports = async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.seattleu.edu');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    try {
        const { recordClick } = require('../../lib/queryAnalytics');
        const clickData = req.body;
        
        // Add server-side data
        clickData.userIp = userIp;
        clickData.userAgent = req.headers['user-agent'];
        clickData.referer = req.headers.referer;
        clickData.city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '');
        clickData.region = req.headers['x-vercel-ip-country-region'];
        clickData.country = req.headers['x-vercel-ip-country'];
        
        console.log('Recording click data:', {
            query: clickData.originalQuery,
            url: clickData.clickedUrl,
            position: clickData.clickPosition
        });
        
        // Record click in database
        const result = await recordClick(clickData);
        console.log('Click recorded:', result ? 'Success' : 'Failed');
        
        // Send minimal response for performance
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({ error: error.message });
    }
};





/**
 * @fileoverview Analytics API Endpoints for Funnelback Search Integration
 * 
 * This file contains API handlers for tracking various search analytics events
 * including click tracking and supplementary analytics data.
 * 
 * @author Victor Chimenti
 * @version 1.0.0
 * @lastModified 2025-03-05
 */

// api/analytics/click.js
exports.clickHandler = async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.seattleu.edu');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    try {
        const { recordClick } = require('../../lib/queryAnalytics');
        const clickData = req.body;
        
        // Add server-side data
        clickData.userIp = userIp;
        clickData.userAgent = req.headers['user-agent'];
        clickData.referer = req.headers.referer;
        clickData.city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '');
        clickData.region = req.headers['x-vercel-ip-country-region'];
        clickData.country = req.headers['x-vercel-ip-country'];
        
        console.log('Recording click data:', {
            query: clickData.originalQuery,
            url: clickData.clickedUrl,
            position: clickData.clickPosition
        });
        
        // Record click in database
        const result = await recordClick(clickData);
        console.log('Click recorded:', result ? 'Success' : 'Failed');
        
        // Send minimal response for performance
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({ error: error.message });
    }
};

// api/analytics/clicks-batch.js
exports.clicksBatchHandler = async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.seattleu.edu');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    try {
        const { recordClicks } = require('../../lib/queryAnalytics');
        
        // Get clicks from request body
        const { clicks } = req.body;
        
        if (!Array.isArray(clicks) || clicks.length === 0) {
            return res.status(400).json({ error: 'No clicks provided' });
        }
        
        console.log(`Processing batch of ${clicks.length} clicks`);
        
        // Add server-side data to each click
        const processedClicks = clicks.map(click => ({
            ...click,
            userIp: userIp,
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer,
            city: decodeURIComponent(req.headers['x-vercel-ip-city'] || ''),
            region: req.headers['x-vercel-ip-country-region'],
            country: req.headers['x-vercel-ip-country']
        }));
        
        // Record clicks in database
        const result = await recordClicks(processedClicks);
        
        // Send response
        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing clicks batch:', error);
        res.status(500).json({ error: error.message });
    }
};

// api/analytics/supplement.js
exports.supplementHandler = async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.seattleu.edu');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    try {
        const { Query } = require('mongoose').models;
        const data = req.body;
        
        if (!data.query) {
            return res.status(400).json({ error: 'No query provided' });
        }
        
        console.log('Processing supplementary analytics for query:', data.query);
        
        // Find the most recent query with matching information
        const filters = {
            query: data.query
        };
        
        // Add sessionId to filter if available
        if (data.sessionId) {
            filters.sessionId = data.sessionId;
        } else {
            // Fall back to IP address
            filters.userIp = userIp;
        }
        
        // Prepare update based on provided data
        const update = {};
        
        // Add result count if provided
        if (data.resultCount !== undefined) {
            update.resultCount = data.resultCount;
            update.hasResults = data.resultCount > 0;
        }
        
        // Update the query document
        const result = await Query.findOneAndUpdate(
            filters,
            { $set: update },
            { 
                new: true,
                sort: { timestamp: -1 }
            }
        );
        
        if (!result) {
            console.log('No matching query found for supplementary data');
            return res.status(404).json({ error: 'Query not found' });
        }
        
        console.log('Supplementary data recorded successfully');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error recording supplementary analytics:', error);
        res.status(500).json({ error: error.message });
    }
};