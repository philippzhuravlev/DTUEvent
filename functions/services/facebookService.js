// functions/Services/facebookService.js
// Service functions for Facebook OAuth flow and token management

const axios = require('axios');

function createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI }) {
  // Exchange authorization code for short-lived user token
  async function exchangeCodeForShortLivedToken(code) {
    const res = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
      params: {
        client_id: FB_APP_ID,
        redirect_uri: FB_REDIRECT_URI,
        client_secret: FB_APP_SECRET,
        code,
      },
    });
    return res.data.access_token;
  }

  // Exchange short-lived user token for long-lived user token
  async function exchangeForLongLivedToken(shortLivedToken) {
    const res = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });
    return res.data.access_token;
  }

  // Get pages for user using long-lived user token
  async function getPagesForUser(longLivedToken) {
    const res = await axios.get('https://graph.facebook.com/v23.0/me/accounts', {
      params: {
        fields: 'id,name,access_token',
        access_token: longLivedToken,
      },
    });
    return res.data.data || [];
  }

  // Get pages directly from authorization code
  async function getPagesFromCode(code) {
    const short = await exchangeCodeForShortLivedToken(code);
    const long = await exchangeForLongLivedToken(short);
    return getPagesForUser(long);
  }

  return {
    getPagesFromCode,
    exchangeCodeForShortLivedToken,
    exchangeForLongLivedToken,
    getPagesForUser,
  };
}

module.exports = { createFacebookClient };