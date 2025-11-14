// functions/utils/fbConfig.js
// Utility to build Facebook OAuth related dependencies

function buildFbDeps({ req, admin, overrides = {} }) {
  const FB_APP_ID =
    overrides.FB_APP_ID ||
    process.env.FACEBOOK_APP_ID;

  const FB_APP_SECRET =
    overrides.FB_APP_SECRET ||
    process.env.FACEBOOK_APP_SECRET;

  const FB_REDIRECT_URI =
    overrides.FB_REDIRECT_URI ||
    process.env.FB_REDIRECT_URI ||
    `${req.protocol}://${req.get('host')}/fbAuth`;

  const GCP_PROJECT_ID =
    overrides.GCP_PROJECT_ID ||
    process.env.GCP_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT_ID;

  return { FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI, GCP_PROJECT_ID, admin };
}

module.exports = { buildFbDeps };