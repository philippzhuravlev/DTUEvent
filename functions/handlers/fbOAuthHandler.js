// functions/handlers/fbOAuthHandler.js
// Handler for Facebook OAuth flow to obtain Page access tokens
// and store them in Google Secret Manager and Firestore.
const { SecretManagerService } = require('../services/SecretManagerService');
const { createFacebookClient } = require('../services/facebookService');

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

  const code = String(req.query.code || '').trim();
  if (!code) return res.status(400).send('Missing code');

  try {
    const fbClient = createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI });
    const pages = await fbClient.getPagesFromCode(code);

    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(200).send('No pages returned.');
    }

    const secretManager = new SecretManagerService(GCP_PROJECT_ID);
    const db = admin.firestore();

    for (const page of pages) {
      try {
        await secretManager.storePageToken(page.id, page.access_token);
        await db.collection('pages').doc(page.id).set({
          id: page.id,
          name: page.name,
          connectedAt: new Date().toISOString(),
          active: true
        }, { merge: true });
      } catch (e) {
        console.warn('Page store fail', page.id, e.message);
      }
    }

    res.send(`Stored ${pages.length} page token(s).`);
  } catch (err) {
    const msg = err.message || 'Facebook auth failed';
    console.error('fbAuth error', msg);
    if (String(req.query.debug) === '1') {
      return res.status(500).send(msg);
    }
    res.status(500).send('Facebook auth failed');
  }
}

module.exports = { handleFbAuth };