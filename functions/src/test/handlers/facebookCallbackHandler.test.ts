import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { handleCallback } from '../../handlers/facebookCallbackHandler';
import { createMockDependencies } from '../mock';
import { mockFbPages, mockFbShortLivedToken, mockFbLongLivedToken } from '../fixtures';
import type { Request, Response } from 'express';

describe('facebookCallbackHandler', () => {
  let mockDeps: ReturnType<typeof createMockDependencies>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockDeps = createMockDependencies();
    
    mockReq = {
      query: { code: 'auth-code-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      send: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
  });

  describe('handleCallback', () => {
    it('should handle successful OAuth callback', async () => {
      // Setup mocks - use 'as any' to access mock methods
      (mockDeps.facebookService.getShortLivedToken as any).mockResolvedValue(
        mockFbShortLivedToken.access_token
      );
      (mockDeps.facebookService.getLongLivedToken as any).mockResolvedValue({
        accessToken: mockFbLongLivedToken.access_token,
        expiresIn: mockFbLongLivedToken.expires_in,
      });
      (mockDeps.facebookService.getPagesFromUser as any).mockResolvedValue(
        mockFbPages.map(p => ({
          id: p.id,
          name: p.name,
          accessToken: p.access_token,
        }))
      );
      (mockDeps.secretManagerService.addPageToken as any).mockResolvedValue(undefined);
      (mockDeps.firestoreService.addPage as any).mockResolvedValue(undefined);

      await handleCallback(mockDeps, mockReq as Request, mockRes as Response);

      // Verify token exchange
      expect(mockDeps.facebookService.getShortLivedToken).toHaveBeenCalledWith('auth-code-123');
      expect(mockDeps.facebookService.getLongLivedToken).toHaveBeenCalled();

      // Verify pages retrieved
      expect(mockDeps.facebookService.getPagesFromUser).toHaveBeenCalled();

      // Verify tokens stored (2 pages)
      expect(mockDeps.secretManagerService.addPageToken).toHaveBeenCalledTimes(2);
      expect(mockDeps.secretManagerService.addPageToken).toHaveBeenCalledWith(
        'shuset.dk',
        'page-token-shuset',
        5184000
      );

      // Verify pages stored in Firestore
      expect(mockDeps.firestoreService.addPage).toHaveBeenCalledTimes(2);

      // Verify success response
      expect(mockRes.send).toHaveBeenCalledWith('Stored 2 page token(s).');
    });

    it('should return 400 when code is missing', async () => {
      mockReq.query = {};

      await handleCallback(mockDeps, mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Missing code');
    });

    it('should handle Facebook API errors gracefully', async () => {
      (mockDeps.facebookService.getShortLivedToken as any).mockRejectedValue(
        new Error('Invalid authorization code')
      );

      await handleCallback(mockDeps, mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Invalid authorization code'));
    });
  });
});