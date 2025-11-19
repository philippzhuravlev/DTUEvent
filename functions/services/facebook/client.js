const axios = require('axios');

function createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI }) {
  const http = axios.create({ baseURL: 'https://graph.facebook.com/v23.0' });

  const wrap = (err, label) => {
    const msg = err?.response?.data?.error?.message || err?.message || String(err);
    return new Error(`${label}: ${msg}`);
  };

  const exchangeCodeForShortLivedToken = async (code) => {
    try {
      const { data } = await http.get('/oauth/access_token', {
        params: { 
            client_id: FB_APP_ID,
            redirect_uri: FB_REDIRECT_URI, 
            client_secret: FB_APP_SECRET, 
            code 
        }
      });
      return data.access_token;
    } catch (e) { throw wrap(e, 'code->short'); }
  };

  const exchangeForLongLivedToken = async (shortToken) => {
    try {
      const { data } = await http.get('/oauth/access_token', {
        params: { 
            grant_type: 'fb_exchange_token', 
            client_id: FB_APP_ID, 
            client_secret: FB_APP_SECRET, 
            fb_exchange_token: shortToken 
        }
      });
      return data.access_token;
    } catch (e) { throw wrap(e, 'short->long'); }
  };

  const getPagesForUser = async (longToken) => {
    try {
      const { data } = await http.get('/me/accounts', {
        params: { 
            fields: 'id,name,access_token', 
            access_token: longToken 
        }
      });
      return data?.data || [];
    } catch (e) { throw wrap(e, 'fetch-pages'); }
  };

  const getUpcomingEvents = async (pageId, pageAccessToken) => {
    try {
      const { data } = await http.get(`/${pageId}/events`, {
        params: {
          time_filter: 'upcoming',
          fields: 'id,name,description,start_time,end_time,place,cover',
          access_token: pageAccessToken
        }
      });
      return Array.isArray(data?.data) ? data.data : [];
    } catch (e) { throw wrap(e, 'fetch-events'); }
  };

  return { exchangeCodeForShortLivedToken, exchangeForLongLivedToken, getPagesForUser, getUpcomingEvents };
}

module.exports = { createFacebookClient };