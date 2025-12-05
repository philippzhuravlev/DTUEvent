import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreService } from '../../src/services/FirestoreService';

describe('FirestoreService', () => {
  let firestoreService: FirestoreService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      collection: vi.fn().mockReturnThis(),
      doc: vi.fn().mockReturnThis(),
      set: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ empty: false, docs: [{ id: '1', data: () => ({ name: 'TestPage' }) }] }),
      batch: vi.fn().mockReturnValue({
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      }),
    };
    firestoreService = new FirestoreService(mockDb);
  });

  it('adds a page', async () => {
    await firestoreService.addPage('1', { name: 'TestPage' });
    expect(mockDb.collection).toHaveBeenCalledWith('pages');
    expect(mockDb.doc).toHaveBeenCalledWith('1');
    expect(mockDb.set).toHaveBeenCalledWith({ name: 'TestPage' }, { merge: true });
  });

  it('updates a page', async () => {
    await firestoreService.updatePage('1', { name: 'UpdatedPage' });
    expect(mockDb.collection).toHaveBeenCalledWith('pages');
    expect(mockDb.doc).toHaveBeenCalledWith('1');
    expect(mockDb.update).toHaveBeenCalledWith({ name: 'UpdatedPage' });
  });

  it('gets pages', async () => {
    const pages = await firestoreService.getPages();
    expect(mockDb.collection).toHaveBeenCalledWith('pages');
    expect(mockDb.get).toHaveBeenCalled();
    expect(pages).toEqual([{ id: '1', name: 'TestPage' }]);
  });

  it('adds events', async () => {
    const events = [{ id: 'e1', name: 'Event1' }];
    const batch = mockDb.batch();
    await firestoreService.addEvents('1', events as any);
    expect(mockDb.collection).toHaveBeenCalledWith('events');
    expect(batch.set).toHaveBeenCalled();
    expect(batch.commit).toHaveBeenCalled();
  });
});