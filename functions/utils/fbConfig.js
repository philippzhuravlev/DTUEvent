// functions/utils/fbConfig.js
// Utility to build Facebook OAuth related dependencies

function buildFbDeps({ req, admin, FACEBOOK_APP_SECRET }) {
  const FB_APP_ID = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;

  const FB_APP_SECRET = (FACEBOOK_APP_SECRET && typeof FACEBOOK_APP_SECRET.value === 'function')
    ? FACEBOOK_APP_SECRET.value()
    : (process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET);

  const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/fb/callback`;
  const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID
    || process.env.GCLOUD_PROJECT
    || process.env.GCP_PROJECT
    || process.env.VITE_GCP_PROJECT_ID;

  return {
    FB_APP_ID,
    FB_APP_SECRET,
    FB_REDIRECT_URI,
    GCP_PROJECT_ID,
    admin,
  };
}

// Optional: separate pure config without req/admin
function getStaticFbConfig() {
  return {
    FB_APP_ID: process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID,
    FB_APP_SECRET: process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET,
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID
      || process.env.GCLOUD_PROJECT
      || process.env.GCP_PROJECT
      || process.env.VITE_GCP_PROJECT_ID,
  };
}

module.exports = {
  buildFbDeps,
  getStaticFbConfig,
};