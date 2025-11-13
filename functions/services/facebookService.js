// functions/Services/facebookService.js
// Service functions for Facebook OAuth flow and token management

const axios = require('axios');

// Step 1: Use access token to get short-lived user token
async function exchangeCodeForShortLivedToken({ code, FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI }) {
    const tokenRes = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
        params: {
            client_id: FB_APP_ID,
            redirect_uri: FB_REDIRECT_URI,
            client_secret: FB_APP_SECRET,
            code,
        },
    });
    return tokenRes.data.access_token;
}

// Step 2: Exchange short-lived for long-lived user token
async function exchangeForLongLivedToken({ shortLivedToken, FB_APP_ID, FB_APP_SECRET }) {
    const longTokenRes = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
        params: {
            grant_type: 'fb_exchange_token',
            client_id: FB_APP_ID,
            client_secret: FB_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        },
    });
    return longTokenRes.data.access_token;
}

// Step 3: Get Pages for user using long-lived token
async function getPagesForUser({ longLivedToken }) {
    const pagesRes = await axios.get('https://graph.facebook.com/v23.0/me/accounts', {
        params: {
            fields: 'id,name,access_token',
            access_token: longLivedToken,
        },
    });
    return pagesRes.data.data || [];
}

module.exports = {
    exchangeCodeForShortLivedToken,
    exchangeForLongLivedToken,
    getPagesForUser,
};