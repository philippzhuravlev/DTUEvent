import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FirestoreService } from '../../services/FirestoreService';
import type { Firestore } from 'firebase-admin/firestore';

describe('FirestoreService', () => {
  let service: FirestoreService;
  let mockDb: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document reference - FIX: explicitly type the functions
    mockDoc = {
      set: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // Mock batch operations - FIX: explicitly type these too
    mockBatch = {
      set: jest.fn<() => any>().mockReturnThis(),
      commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // Mock collection
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      get: jest.fn(),
    };

    // Mock Firestore instance
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      batch: jest.fn().mockReturnValue(mockBatch),
    } as unknown as Firestore;

    // Pass mockDb to constructor
    service = new FirestoreService(mockDb);
  });

  describe('addPage', () => {
    it('should add page to Firestore with merge', async () => {
      const pageData = { 
        name: 'S-Huset', 
        pictureUrl: 'https://example.com/pic.jpg',
        tokenRefreshedAt: '2025-12-03T10:00:00.000Z',
      };
      
      await service.addPage('shuset.dk', pageData);

      expect(mockDb.collection).toHaveBeenCalledWith('pages');
      expect(mockCollection.doc).toHaveBeenCalledWith('shuset.dk');
      expect(mockDoc.set).toHaveBeenCalledWith(pageData, { merge: true });
    });
  });

  describe('updatePage', () => {
    it('should update page fields', async () => {
      const updates = { 
        tokenRefreshedAt: '2025-12-03T10:00:00.000Z',
        lastRefreshSuccess: true,
      };
      
      await service.updatePage('shuset.dk', updates);

      expect(mockDb.collection).toHaveBeenCalledWith('pages');
      expect(mockCollection.doc).toHaveBeenCalledWith('shuset.dk');
      expect(mockDoc.update).toHaveBeenCalledWith(updates);
    });
  });

  describe('getPages', () => {
    it('should return all pages', async () => {
      const mockDocs = [
        { 
          id: 'shuset.dk', 
          data: () => ({ 
            name: 'S-Huset',
            pictureUrl: 'https://example.com/shuset.jpg',
            tokenRefreshedAt: '2025-11-20T12:00:00.000Z',
            lastRefreshSuccess: true,
          }) 
        },
        { 
          id: 'DiagonalenDTU', 
          data: () => ({ 
            name: 'Diagonalen',
            pictureUrl: 'https://example.com/diagonalen.jpg',
            tokenRefreshedAt: '2025-11-15T12:00:00.000Z',
            lastRefreshSuccess: true,
          }) 
        },
      ];

      mockCollection.get.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      });

      const result = await service.getPages();

      expect(mockDb.collection).toHaveBeenCalledWith('pages');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ 
        id: 'shuset.dk', 
        name: 'S-Huset',
      });
      expect(result[1]).toMatchObject({ 
        id: 'DiagonalenDTU', 
        name: 'Diagonalen',
      });
    });

    it('should return empty array when no pages', async () => {
      mockCollection.get.mockResolvedValue({ 
        empty: true,
        docs: [],
      });

      const result = await service.getPages();

      expect(result).toEqual([]);
    });
  });

  describe('addEvents', () => {
    it('should batch insert events with normalization', async () => {
      const events = [
        { 
          id: '123', 
          name: 'Friday Bar',
          start_time: '2025-12-06T18:00:00+01:00',
          description: 'Join us!',
        },
        { 
          id: '456', 
          name: 'Quiz Night',
          start_time: '2025-12-10T19:00:00+01:00',
        },
      ];

      const result = await service.addEvents('shuset.dk', events);

      expect(mockDb.collection).toHaveBeenCalledWith('events');
      expect(mockCollection.doc).toHaveBeenCalledTimes(2);
      expect(mockCollection.doc).toHaveBeenCalledWith('123');
      expect(mockCollection.doc).toHaveBeenCalledWith('456');
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
      expect(result.upserted).toBe(2);

      // Verify normalized event structure
      const firstSetCall = (mockBatch.set as any).mock.calls[0];
      const eventData = firstSetCall[1];
      
      expect(eventData).toMatchObject({
        id: '123',
        pageId: 'shuset.dk',
        title: 'Friday Bar',
        startTime: '2025-12-06T18:00:00+01:00',
        eventURL: 'https://facebook.com/events/123',
      });
      expect(eventData.updatedAt).toBeDefined();
    });

    it('should handle empty events array', async () => {
      const result = await service.addEvents('shuset.dk', []);

      expect(mockBatch.set).not.toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result.upserted).toBe(0);
    });

    it('should use custom coverImageUrl when provided', async () => {
      const events = [
        {
          id: '123',
          name: 'Event with Cover',
          start_time: '2025-12-06T18:00:00+01:00',
          coverImageUrl: 'https://storage.googleapis.com/custom-cover.jpg',
        },
      ];

      await service.addEvents('shuset.dk', events);

      const setCall = (mockBatch.set as any).mock.calls[0];
      const eventData = setCall[1];

      expect(eventData.coverImageUrl).toBe('https://storage.googleapis.com/custom-cover.jpg');
    });

    it('should handle events with place information', async () => {
      const events = [
        {
          id: '123',
          name: 'Event at S-Huset',
          start_time: '2025-12-06T18:00:00+01:00',
          place: {
            id: 'place-1',
            name: 'S-Huset, DTU',
            location: { city: 'Lyngby', country: 'DK' },
          },
        },
      ];

      await service.addEvents('shuset.dk', events);

      const setCall = (mockBatch.set as any).mock.calls[0];
      const eventData = setCall[1];

      expect(eventData.place).toMatchObject({
        id: 'place-1',
        name: 'S-Huset, DTU',
        location: { city: 'Lyngby', country: 'DK' },
      });
    });
  });
});