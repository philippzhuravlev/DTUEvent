const express = require('express');
const path = require('path');

// load root .env first so project-level secrets (FACEBOOK_APP_SECRET etc.) are available,
// then load web/.env to provide VITE_* values used by the frontend
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'web', '.env') });

const { buildFbDeps } = require('../functions/utils/fbConfig');
const { handleFbAuth } = require('../functions/handlers/fbOAuthHandler');
const admin = require('firebase-admin');

// Initialize admin (will use GOOGLE_APPLICATION_CREDENTIALS if set)
try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized in another process/context
}

const app = express();

// health
app.get('/', (req, res) => res.send('Local test server — /fb/callback for Facebook OAuth'));

// FB redirect callback used by front-end (match this URL in FB app settings)
app.get('/fb/callback', (req, res) => {
  const deps = buildFbDeps({ req, admin });
  return handleFbAuth(req, res, deps);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT} — FB callback at /fb/callback`);
});