// Handlers/fbOAuthHandler.js
// Handler for Facebook OAuth flow to obtain Page access tokens
// and store them in Google Secret Manager and Firestore.
const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function handleFbAuth(req, res, deps = {}) {
  const {
    FB_APP_ID,
    FB_APP_SECRET,
    FB_REDIRECT_URI,
    GCP_PROJECT_ID,
    admin,
  } = deps;

  if (!FB_APP_ID) return res.status(500).send('FACEBOOK_APP_ID not set');
  if (!FB_APP_SECRET) return res.status(500).send('FACEBOOK_APP_SECRET not set');

  try {
    const code = String(req.query.code || '').trim();
    if (!code) return res.status(400).send('Missing code');

    const secretClient = new SecretManagerServiceClient();
    const db = admin.firestore();

    // Step 1: Exchange code -> short-lived user token
    const tokenRes = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
      params: {
        client_id: FB_APP_ID,
        redirect_uri: FB_REDIRECT_URI,
        client_secret: FB_APP_SECRET,
        code,
      },
    });
    const shortLivedToken = tokenRes.data.access_token;

    // Step 2: Exchange for long-lived user token
    const longTokenRes = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });
    const longLivedToken = longTokenRes.data.access_token;

    // Step 3: Get Page tokens
    const pagesRes = await axios.get('https://graph.facebook.com/v23.0/me/accounts', {
      params: {
        fields: 'id,name,access_token',
        access_token: longLivedToken,
      },
    });

    // Helper to store a page token in Secret Manager
    const pages = pagesRes.data.data || [];

    async function storePageTokenInSecretManager(pageId, token) {
      if (!GCP_PROJECT_ID) throw new Error('GCP project ID is required to store secrets');
      const secretId = `facebook-token-${pageId}`;
      const parent = `projects/${GCP_PROJECT_ID}`;
      try {
        await secretClient.createSecret({
          parent,
          secretId,
          secret: { replication: { automatic: {} } },
        });
      } catch (e) {
        if (!String(e.message || '').includes('Already exists')) throw e;
      }
      await secretClient.addSecretVersion({
        parent: `${parent}/secrets/${secretId}`,
        payload: { data: Buffer.from(token, 'utf8') },
      });
    }

    // Step 4: Store each page token in Secret Manager, and metadata in Firestore
    for (const page of pages) {
      try {
        // Store token
        await storePageTokenInSecretManager(page.id, page.access_token);
        // Store metadata
        await db.collection('pages').doc(page.id).set({
          id: page.id,
          name: page.name,
          connectedAt: new Date().toISOString(),
          active: true,
        }, { merge: true });
        console.log(`Stored token and metadata for page ${page.id}`);
      } catch (e) {
        console.warn('Failed to store token for page', page.id, e.message || e);
      }
    }

    res.send('Page tokens stored. You can close this window.');
  } catch (err) {
    console.error('Facebook auth error:', err.response?.data || err.message || err);
    res.status(500).send('Facebook auth failed');
  }
}

module.exports = { handleFbAuth };