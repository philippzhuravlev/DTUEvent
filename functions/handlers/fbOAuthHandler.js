// functions/handlers/fbOAuthHandler.js
// Handler for Facebook OAuth flow to obtain Page access tokens
// and store them in Google Secret Manager and Firestore.
const { SecretManagerService } = require('../services/SecretManagerService');
const { createFacebookClient } = require('../Services/facebookService');

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

    const secretManager = new SecretManagerService(GCP_PROJECT_ID);
    const db = admin.firestore();

    // Create Facebook client
    const fbClient = createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI });

    // Use Facebook client to get pages from access code
    const pages = await fbClient.getPagesFromCode(code);

    // Store tokens and metadata
    for (const page of pages) {
      try {
        // Use SecretManagerService instead of inline logic
        await secretManager.storePageToken(page.id, page.access_token);

        // Store metadata in Firestore (NOT the token!)
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

    const successCount = pages.length;
    console.log(`Successfully stored ${successCount} page token(s)`);
    res.send(`Page tokens stored (${successCount} pages). You can close this window.`);
  } catch (err) {
    console.error('Facebook auth error:', err.response?.data || err.message || err);
    res.status(500).send('Facebook auth failed');
  }
}

module.exports = { handleFbAuth };