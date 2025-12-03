import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FacebookService } from '../../services/FacebookService';
import axios from 'axios';
import { mockFbPages, mockFbEvents, mockFbShortLivedToken, mockFbLongLivedToken } from '../fixtures';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FacebookService', () => {
  let service: FacebookService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Set required env vars
    process.env.FACEBOOK_APP_ID = 'test-app-id';
    process.env.FACEBOOK_APP_SECRET = 'test-secret';
    process.env.FB_REDIRECT_URI = 'http://localhost/callback';
    
    service = new FacebookService();
  });

  describe('getShortLivedToken', () => {
    it('should exchange code for short-lived token', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockFbShortLivedToken });

      const result = await service.getShortLivedToken('auth-code-123');

      expect(result).toBe('short-lived-token-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oauth/access_token', {
        params: {
          client_id: 'test-app-id',
          redirect_uri: 'http://localhost/callback',
          client_secret: 'test-secret',
          code: 'auth-code-123',
        },
      });
    });

    it('should throw error on invalid code', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { data: { error: { message: 'Invalid authorization code' } } },
      });

      await expect(service.getShortLivedToken('bad-code')).rejects.toThrow(
        'get-short-lived-token: Invalid authorization code'
      );
    });
  });

  describe('getLongLivedToken', () => {
    it('should exchange short-lived token for long-lived token', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockFbLongLivedToken });

      const result = await service.getLongLivedToken('short-token');

      expect(result.accessToken).toBe('long-lived-token-456');
      expect(result.expiresIn).toBe(5184000);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: 'test-app-id',
          client_secret: 'test-secret',
          fb_exchange_token: 'short-token',
        },
      });
    });
  });

  describe('getPagesFromUser', () => {
    it('should fetch user pages with access tokens', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { data: mockFbPages } });

      const result = await service.getPagesFromUser('user-token');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'shuset.dk',
        name: 'S-Huset',
        accessToken: 'page-token-shuset',
      });
    });

    it('should return empty array when no pages', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });

      const result = await service.getPagesFromUser('user-token');

      expect(result).toEqual([]);
    });

    it('should throw error when API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { data: { error: { message: 'Invalid token' } } },
      });

      await expect(service.getPagesFromUser('bad-token')).rejects.toThrow(
        'get-pages: Invalid token'
      );
    });
  });

  describe('getPageEvents', () => {
    it('should fetch upcoming events for a page', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { data: mockFbEvents } });

      const result = await service.getPageEvents('shuset.dk', 'page-token');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Friday Bar');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shuset.dk/events', {
        params: {
          time_filter: 'upcoming',
          fields: 'id,name,description,start_time,end_time,place,cover{source}',
          access_token: 'page-token',
        },
      });
    });

    it('should return empty array when no events', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });

      const result = await service.getPageEvents('shuset.dk', 'page-token');

      expect(result).toEqual([]);
    });
  });

  describe('refreshLongLivedToken', () => {
    it('should refresh an existing long-lived token', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockFbLongLivedToken });

      const result = await service.refreshLongLivedToken('old-token');

      expect(result.accessToken).toBe('long-lived-token-456');
      expect(result.expiresIn).toBe(5184000);
    });
  });
});