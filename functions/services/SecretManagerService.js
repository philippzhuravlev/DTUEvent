// functions/services/SecretManagerService.js
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretManagerService {
  constructor(projectId) {
    this.projectId = projectId;
    this.client = new SecretManagerServiceClient();
  }

  /**
   * Store or update a Facebook page token
   */
  async storePageToken(pageId, token) {
    const secretId = `facebook-token-${pageId}`;
    const parent = `projects/${this.projectId}`;
    
    // Create secret if it doesn't exist
    try {
      await this.client.createSecret({
        parent,
        secretId,
        secret: { replication: { automatic: {} } },
      });
    } catch (e) {
      if (!String(e.message || '').includes('Already exists')) throw e;
    }
    
    // Add new version with the token
    await this.client.addSecretVersion({
      parent: `${parent}/secrets/${secretId}`,
      payload: { data: Buffer.from(token, 'utf8') },
    });
  }

  /**
   * Retrieve a Facebook page token
   */
  async getPageToken(pageId) {
    const name = `projects/${this.projectId}/secrets/facebook-token-${pageId}/versions/latest`;
    const [version] = await this.client.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
  }

  /**
   * List all stored page tokens (metadata only, not actual tokens)
   */
  async listPageTokens() {
    const parent = `projects/${this.projectId}`;
    const [secrets] = await this.client.listSecrets({ parent });
    return secrets
      .filter(s => s.name.includes('facebook-token-'))
      .map(s => s.name.split('/').pop().replace('facebook-token-', ''));
  }
}

module.exports = { SecretManagerService };