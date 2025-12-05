import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRefreshTokens } from '../../src/handlers/tokenRefreshHandler';

describe('handleRefreshTokens (basic)', () => {
  let deps: any;

  beforeEach(() => {
    deps = {
      facebookService: {
        refreshLongLivedToken: vi.fn(),
        getPagesFromUser: vi.fn(),
      },
      secretManagerService: { getPageToken: vi.fn(), addPageToken: vi.fn() },
      firestoreService: {
        getPages: vi.fn(),
        updatePage: vi.fn(),
      },
      storageService: {},
    };
  });

  it('does nothing if no pages', async () => {
    deps.firestoreService.getPages.mockResolvedValue([]);
    await handleRefreshTokens(deps);
    expect(deps.facebookService.refreshLongLivedToken).not.toHaveBeenCalled();
    expect(deps.firestoreService.updatePage).not.toHaveBeenCalled();
  });

  it('calls updatePage with failure on error', async () => {
    const oldDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString();
    deps.firestoreService.getPages.mockResolvedValue([
      { id: 'page1', tokenRefreshedAt: oldDate }
    ]);
    deps.secretManagerService.getPageToken.mockResolvedValue('token');
    deps.facebookService.refreshLongLivedToken.mockRejectedValue(new Error('fail'));
    await handleRefreshTokens(deps);
    expect(deps.firestoreService.updatePage).toHaveBeenCalledWith('page1', expect.objectContaining({ lastRefreshSuccess: false }));
  });
});