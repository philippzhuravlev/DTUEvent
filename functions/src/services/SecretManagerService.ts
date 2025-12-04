import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { config } from '../utils';
import type { PageToken } from '../types';

export class SecretManagerService {
  // set up Google Secret Manager client (technically just an object that talks to Secret Manager API)
  private client: SecretManagerServiceClient;
  constructor() {
    this.client = new SecretManagerServiceClient();
  }

  
  private getSecretId(pageId: string): string {
    return `facebook-token-${pageId}`;
  }

  async addPageToken(pageId: string, token: string, expiresIn: number): Promise<void> {
    // 1. prepares name and location of secret
    const secretId = this.getSecretId(pageId);
    const projectId = config.gcloud.projectId || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) throw new Error('GCP project ID not configured (set GCP_PROJECT_ID/GOOGLE_CLOUD_PROJECT or config.gcloud.projectId)');
    const project = `projects/${projectId}`;
    const secretPath = `${project}/secrets/${secretId}`;

    // 2. calculate expiry date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    // 3. prepare "payload", i.e. token to be stored
    const payload: PageToken = {
      token,
      expiresAt: expiresAt.toISOString(),
    };

    try {
      // 4. create secret if it doesn't exist
      await this.client.createSecret({
        parent: project,
        secretId,
        secret: { replication: { automatic: {} } },
      });
    } catch (e: any) {
      if (!e.message?.includes('Already exists')) {
        throw e;
      }
    }

    // 5. add new secret version with new token "payload"
    await this.client.addSecretVersion({
      parent: secretPath,
      payload: { data: Buffer.from(JSON.stringify(payload), 'utf8') },
    });
  }

  async getPageToken(pageId: string): Promise<string | null> {
    // again, prepares name and location of secret
    const secretId = this.getSecretId(pageId);
    const projectId = config.gcloud.projectId || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) throw new Error('GCP project ID not configured (set GCP_PROJECT_ID/GOOGLE_CLOUD_PROJECT or config.gcloud.projectId)');
    const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;

    try {
      // gets latest version of secret, an automatic value stored in Secret Manager
      const [version] = await this.client.accessSecretVersion({ name });
      const payloadString = version.payload?.data 
        ? (typeof version.payload.data === 'string' 
          ? version.payload.data 
          : Buffer.from(version.payload.data).toString('utf8'))
        : null;
      
      return payloadString; // ...else: return token
    } catch (error: any) {
      if (error.code === 5) { // code 5 = not found in gcloud secret manager 
        return null;
      }
      throw error;
    }
  }

  async checkTokenExpiry(pageId: string): Promise<boolean> {
    // again again prepares name and location of secret
    const secretId = this.getSecretId(pageId);
    const projectId = config.gcloud.projectId || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) throw new Error('GCP project ID not configured (set GCP_PROJECT_ID/GOOGLE_CLOUD_PROJECT or config.gcloud.projectId)');
    const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;

    try {
      // again gets latest version of secret
      const [version] = await this.client.accessSecretVersion({ name });
      const payload = JSON.parse( // parses payload from secret version
        version.payload?.data ? Buffer.from(version.payload.data).toString('utf8') : '{}'
      ) as PageToken;

      return new Date(payload.expiresAt) < new Date(); // true if expired
    } catch (error: any) {
      if (error.code === 5) {  // if not found in gcloud secret manager, treat as expired
        return true; 
      }
      throw error;
    }
  }

  async markTokenExpired(pageId: string): Promise<void> {
    const secretId = this.getSecretId(pageId);
    const projectId = config.gcloud.projectId || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) throw new Error('GCP project ID not configured (set GCP_PROJECT_ID/GOOGLE_CLOUD_PROJECT or config.gcloud.projectId)');
    const name = `projects/${projectId}/secrets/${secretId}`;
    await this.client.deleteSecret({ name }); 
    // actually deletes the secret which we treat as marking it as expired
  }
}
