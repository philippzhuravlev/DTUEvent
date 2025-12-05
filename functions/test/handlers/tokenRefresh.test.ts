import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRefreshTokens } from '../../src/handlers/tokenRefreshHandler';

describe('handleRefreshTokens', () => {
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

  it('returns early if no pages', async () => {
    deps.firestoreService.getPages.mockResolvedValue([]);
    await handleRefreshTokens(deps);
    expect(deps.firestoreService.getPages).toHaveBeenCalled();
    expect(deps.facebookService.refreshLongLivedToken).not.toHaveBeenCalled();
  });

  it('skips refresh if token refreshed less than 45 days ago', async () => {
    const now = new Date();
    deps.firestoreService.getPages.mockResolvedValue([
      { id: '1', tokenRefreshedAt: now.toISOString() }
    ]);
    await handleRefreshTokens(deps);
    expect(deps.secretManagerService.getPageToken).not.toHaveBeenCalled();
  });

  it('refreshes token if last refresh > 45 days ago', async () => {
    const oldDate = new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString();
    deps.firestoreService.getPages.mockResolvedValue([
      { id: '1', tokenRefreshedAt: oldDate }
    ]);
    deps.secretManagerService.getPageToken.mockResolvedValue('current-token');
    deps.facebookService.refreshLongLivedToken.mockResolvedValue({ accessToken: 'new-token', expiresIn: 1234 });
    deps.facebookService.getPagesFromUser.mockResolvedValue([{ id: '1', accessToken: 'new-token', name: 'Page1' }]);
    await handleRefreshTokens(deps);
    expect(deps.secretManagerService.getPageToken).toHaveBeenCalledWith('1');
    expect(deps.facebookService.refreshLongLivedToken).toHaveBeenCalledWith('current-token');
    expect(deps.secretManagerService.addPageToken).toHaveBeenCalledWith('1', 'new-token', 1234);
    expect(deps.firestoreService.updatePage).toHaveBeenCalledWith('1', expect.objectContaining({ lastRefreshSuccess: true }));
  });

  it('handles errors and updates Firestore with failure', async () => {
    const oldDate = new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString();
    deps.firestoreService.getPages.mockResolvedValue([
      { id: '1', tokenRefreshedAt: oldDate }
    ]);
    deps.secretManagerService.getPageToken.mockResolvedValue('current-token');
    deps.facebookService.refreshLongLivedToken.mockRejectedValue(new Error('fail'));
    await handleRefreshTokens(deps);
    expect(deps.firestoreService.updatePage).toHaveBeenCalledWith('1', expect.objectContaining({ lastRefreshSuccess: false }));
  });
});