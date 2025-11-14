// functions/services/facebookService.js
// Service functions for Facebook OAuth flow and token management

// Minimal Facebook Graph client
const axios = require('axios');

function createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI }) {
  const base = 'https://graph.facebook.com/v23.0';

  const wrap = (err, label) => {
    const msg =
      err?.response?.data?.error?.message ||
      err?.response?.data ||
      err?.message ||
      String(err);
    return new Error(`${label}: ${msg}`);
  };

  // Exchange authorization code for short-lived user token
  async function exchangeCodeForShortLivedToken(code) {
    try {
      const res = await axios.get(`${base}/oauth/access_token`, {
        params: {
          client_id: FB_APP_ID,
          redirect_uri: FB_REDIRECT_URI,
          client_secret: FB_APP_SECRET,
          code,
        },
      });
      return res.data.access_token;
    } catch (e) {
      throw wrap(e, 'code->short-lived');
    }
  }

  // Exchange short-lived user token for long-lived user token
  async function exchangeForLongLivedToken(shortToken) {
    try {
      const res = await axios.get(`${base}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: shortToken,
        },
      });
      return res.data.access_token;
    } catch (e) {
      throw wrap(e, 'short->long-lived');
    }
  }

  // Get pages for user using long-lived user token
  async function getPagesForUser(longToken) {
    try {
      const res = await axios.get(`${base}/me/accounts`, {
        params: {
          fields: 'id,name,access_token',
          access_token: longToken,
        },
      });
      return res.data?.data || [];
    } catch (e) {
      throw wrap(e, 'fetch-pages');
    }
  }

  // Get pages directly from authorization code
  async function getPagesFromCode(code) {
    const short = await exchangeCodeForShortLivedToken(code);
    const long = await exchangeForLongLivedToken(short);
    return getPagesForUser(long);
  }

  return { getPagesFromCode };
}

module.exports = { createFacebookClient };