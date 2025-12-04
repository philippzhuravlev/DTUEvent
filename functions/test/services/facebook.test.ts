import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { FacebookService } from '../../src/services/FacebookService';
import type { FbShortLivedTokenResponse, FbLongLivedTokenResponse, FbPageResponse, FbEventResponse } from '../../src/types';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('FacebookService', () => {
  let facebookService: FacebookService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    // Set required environment variables
    process.env.FACEBOOK_APP_ID = 'test-app-id';
    process.env.FACEBOOK_APP_SECRET = 'test-app-secret';
    process.env.FB_REDIRECT_URI = 'https://example.com/callback';

    facebookService = new FacebookService();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FACEBOOK_APP_ID;
    delete process.env.FACEBOOK_APP_SECRET;
    delete process.env.FB_REDIRECT_URI;
  });

  describe('getShortLivedToken', () => {
    it('should exchange code for short-lived token', async () => {
      const mockResponse: FbShortLivedTokenResponse = {
        access_token: 'short-lived-token-123',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await facebookService.getShortLivedToken('auth-code-123');

      expect(result).toBe('short-lived-token-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oauth/access_token', {
        params: {
          client_id: 'test-app-id',
          redirect_uri: 'https://example.com/callback',
          client_secret: 'test-app-secret',
          code: 'auth-code-123',
        },
      });
    });

    it('should throw error when API call fails', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(facebookService.getShortLivedToken('invalid-code'))
        .rejects.toThrow('API Error');
    });
  });

  describe('getLongLivedToken', () => {
    it('should exchange short-lived token for long-lived token', async () => {
      const mockResponse: FbLongLivedTokenResponse = {
        access_token: 'long-lived-token-456',
        expires_in: 5184000, // 60 days in seconds
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await facebookService.getLongLivedToken('short-lived-token-123');

      expect(result.accessToken).toBe('long-lived-token-456');
      expect(result.expiresIn).toBe(5184000);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: 'test-app-id',
          client_secret: 'test-app-secret',
          fb_exchange_token: 'short-lived-token-123',
        },
      });
    });

    it('should handle expired token error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Token expired'));

      await expect(facebookService.getLongLivedToken('expired-token'))
        .rejects.toThrow('Token expired');
    });
  });

  describe('getPagesFromUser', () => {
    it('should fetch user pages with access tokens', async () => {
      const mockPages: FbPageResponse[] = [
        { id: 'page-1', name: 'S-Huset', access_token: 'page-token-1' },
        { id: 'page-2', name: 'Diagonalen', access_token: 'page-token-2' },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ 
        data: { data: mockPages } 
      });

      const result = await facebookService.getPagesFromUser('user-token-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'page-1',
        name: 'S-Huset',
        accessToken: 'page-token-1',
      });
      expect(result[1]).toEqual({
        id: 'page-2',
        name: 'Diagonalen',
        accessToken: 'page-token-2',
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/me/accounts', {
        params: {
          fields: 'id,name,access_token',
          access_token: 'user-token-123',
        },
      });
    });

    it('should return empty array when no pages found', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await facebookService.getPagesFromUser('user-token-123');

      expect(result).toEqual([]);
    });

    it('should handle missing data field', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });

      const result = await facebookService.getPagesFromUser('user-token-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPageEvents', () => {
    it('should fetch upcoming events for a page', async () => {
      const mockEvents: FbEventResponse[] = [
        {
          id: 'event-1',
          name: 'Friday Bar',
          description: 'Classic Friday vibes',
          start_time: '2025-12-19T16:00:00+0100',
          end_time: '2025-12-19T22:00:00+0100',
          place: {
            id: 'place-1',
            name: 'S-Huset, DTU Lyngby',
            location: {
              city: 'Kongens Lyngby',
              country: 'DK',
            },
          },
          cover: { source: 'https://example.com/cover.jpg' },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ 
        data: { data: mockEvents } 
      });

      const result = await facebookService.getPageEvents('page-123', 'page-token-456');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('event-1');
      expect(result[0].name).toBe('Friday Bar');
      expect(result[0].place?.name).toBe('S-Huset, DTU Lyngby');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/page-123/events', {
        params: {
          time_filter: 'upcoming',
          fields: 'id,name,description,start_time,end_time,place,cover{source}',
          access_token: 'page-token-456',
        },
      });
    });

    it('should return empty array when no events found', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await facebookService.getPageEvents('page-123', 'page-token-456');

      expect(result).toEqual([]);
    });

    it('should handle missing data field gracefully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });

      const result = await facebookService.getPageEvents('page-123', 'page-token-456');

      expect(result).toEqual([]);
    });

    it('should handle events without optional fields', async () => {
      const minimalEvent: FbEventResponse = {
        id: 'event-2',
        name: 'Minimal Event',
        start_time: '2025-12-25T19:00:00+0100',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ 
        data: { data: [minimalEvent] } 
      });

      const result = await facebookService.getPageEvents('page-123', 'page-token-456');

      expect(result[0].description).toBeUndefined();
      expect(result[0].end_time).toBeUndefined();
      expect(result[0].place).toBeUndefined();
      expect(result[0].cover).toBeUndefined();
    });
  });

  describe('refreshLongLivedToken', () => {
    it('should refresh an existing long-lived token', async () => {
      const mockResponse: FbLongLivedTokenResponse = {
        access_token: 'refreshed-token-789',
        expires_in: 5184000,
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await facebookService.refreshLongLivedToken('old-token-123');

      expect(result.accessToken).toBe('refreshed-token-789');
      expect(result.expiresIn).toBe(5184000);
    });

    it('should handle refresh failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(facebookService.refreshLongLivedToken('invalid-token'))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('axios instance creation', () => {
    it('should create axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.stringContaining('graph.facebook.com'),
      });
    });
  });
});