import { SecretManagerService } from './SecretManagerService';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

jest.mock('@google-cloud/secret-manager');

describe('SecretManagerService', () => {
  let service: SecretManagerService;
  let mockClient: jest.Mocked<SecretManagerServiceClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    process.env.GCP_PROJECT_ID = 'test-project';
    
    mockClient = {
      createSecret: jest.fn(),
      addSecretVersion: jest.fn(),
      accessSecretVersion: jest.fn(),
      deleteSecret: jest.fn(),
    } as any;

    (SecretManagerServiceClient as jest.Mock).mockImplementation(() => mockClient);
    
    service = new SecretManagerService();
  });

  describe('addPageToken', () => {
    it('should create secret and store token', async () => {
      mockClient.createSecret.mockResolvedValue([{}] as any);
      mockClient.addSecretVersion.mockResolvedValue([{}] as any);

      await service.addPageToken('shuset.dk', 'test-token', 5184000);

      expect(mockClient.createSecret).toHaveBeenCalledWith({
        parent: 'projects/test-project',
        secretId: 'facebook-token-shuset.dk',
        secret: { replication: { automatic: {} } },
      });

      expect(mockClient.addSecretVersion).toHaveBeenCalled();
    });

    it('should handle existing secret gracefully', async () => {
      const error = new Error('Already exists');
      mockClient.createSecret.mockRejectedValue(error);
      mockClient.addSecretVersion.mockResolvedValue([{}] as any);

      await service.addPageToken('shuset.dk', 'new-token', 5184000);

      expect(mockClient.addSecretVersion).toHaveBeenCalled();
    });
  });

  describe('getPageToken', () => {
    it('should retrieve valid token', async () => {
      const futureDate = new Date(Date.now() + 1000000).toISOString();
      const payload = { token: 'retrieved-token', expiresAt: futureDate };

      mockClient.accessSecretVersion.mockResolvedValue([{
        payload: { data: Buffer.from(JSON.stringify(payload), 'utf8') },
      }] as any);

      const result = await service.getPageToken('shuset.dk');

      expect(result).toBe('retrieved-token');
    });

    it('should return null for expired token', async () => {
      const pastDate = new Date(Date.now() - 1000000).toISOString();
      const payload = { token: 'expired-token', expiresAt: pastDate };

      mockClient.accessSecretVersion.mockResolvedValue([{
        payload: { data: Buffer.from(JSON.stringify(payload), 'utf8') },
      }] as any);

      const result = await service.getPageToken('shuset.dk');

      expect(result).toBeNull();
    });

    it('should return null when secret not found', async () => {
      const error: any = new Error('Not found');
      error.code = 5;
      mockClient.accessSecretVersion.mockRejectedValue(error);

      const result = await service.getPageToken('nonexistent');

      expect(result).toBeNull();
    });
  });
});