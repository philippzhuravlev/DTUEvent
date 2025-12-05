import { firestore } from 'firebase-admin';
import type { Dependencies } from '../utils';

export async function handleRefreshTokens(deps: Dependencies): Promise<void> {
  const { facebookService, secretManagerService, storageService, firestoreService } = deps;

  // 1. get pages from Firestore
  const pages = await firestoreService.getPages();
  if (!pages || pages.length === 0) {
    return;
  }

  for (const page of pages) {
    try {
      // (skip if refreshed less than 45 days ago)
      // supports tokenRefreshedAt as Timestamp or tokenStoredAt Timestamp | string
      let lastRefreshedDate: Date | null = null;
      if (page.tokenRefreshedAt) {
        lastRefreshedDate = (page.tokenRefreshedAt as any).toDate ? (page.tokenRefreshedAt as any).toDate() : new Date(String(page.tokenRefreshedAt));
      } else if ((page as any).tokenStoredAt) {
        const ts = (page as any).tokenStoredAt;
        lastRefreshedDate = ts?.toDate ? ts.toDate() : new Date(String(ts));
      }
      const daysSinceRefresh = lastRefreshedDate
        ? Math.floor((Date.now() - lastRefreshedDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // if never refreshed, force refresh
      if (daysSinceRefresh < 45) {
        continue;
      }

      // 2. get page token from Secret Manager
      const currentPageToken = await secretManagerService.getPageToken(page.id);
      if (!currentPageToken) {
        throw new Error('No token found in Secret Manager for page');
      }

      // 3. refresh long-lived token (exchange page token for long-lived version)
      try {
        const refreshedToken = await facebookService.refreshPageToken(currentPageToken);

        // 5. store new page token in Secret Manager (update existing secret)
        await secretManagerService.updatePageToken(page.id, refreshedToken.accessToken, refreshedToken.expiresIn || 5184000);

        // 6. update Firestore page "metadata"/info
        await firestoreService.updatePage(page.id, {
          tokenRefreshedAt: firestore.FieldValue.serverTimestamp(),
          lastRefreshSuccess: true,
        });
        // success!
      } catch (apiErr: any) {
        throw apiErr;
      }
    } catch (err: any) {
      // fail...
      const errorMsg = err?.message || String(err);

      try {
        // log error in Firestore page document
        await firestoreService.updatePage(page.id, {
          lastRefreshSuccess: false,
          lastRefreshError: errorMsg,
          lastRefreshAttempt: firestore.FieldValue.serverTimestamp(),
        });
      } catch (dbErr: any) {
        // ignore
      }
    }
  }

  return;
}
