const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();
const GCP_PROJECT_ID = process.env.VITE_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID;

async function getTokenForPage(pageId) {
  if (!GCP_PROJECT_ID) {
    throw new Error('Missing GCP project id (VITE_GCP_PROJECT_ID or GCP_PROJECT_ID)');
  }
  const secretId = `facebook-token-${pageId}`;
  const name = `projects/${GCP_PROJECT_ID}/secrets/${secretId}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const token = version.payload?.data?.toString('utf8')?.trim();
    if (!token) throw new Error('secret payload empty');
    console.log(`Using Secret Manager token for page ${pageId}`);
    return token;
  } catch (e) {
    throw new Error(`No token found for page ${pageId} in Secret Manager: ${e.message}`);
  }
}

module.exports = { getTokenForPage };