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
      const lastRefreshed = page.tokenRefreshedAt?.toDate();
      const daysSinceRefresh = lastRefreshed
        ? Math.floor((Date.now() - lastRefreshed.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // if never refreshed, force refresh
      if (daysSinceRefresh < 45) {
        continue;
      }

      // 2. get page token from Secret Manager
      const currentToken = await secretManagerService.getPageToken(page.id);
      if (!currentToken) {
        throw new Error('No token found in Secret Manager for page');
      }

      // 3. refresh long-lived token
      const newToken = await facebookService.refreshLongLivedToken(currentToken);

      // 4. get user's pages to find the page and its new access token
      const userPages = await facebookService.getPagesFromUser(newToken.accessToken);
      const targetPage = userPages.find(page => page.id === page.id); // find this page among user's pages
      // => means the page must still be connected to the user, === means we found it
      if (!targetPage) {
        throw new Error(`Page ${page.id} not found in user's pages after refresh`);
      }

      // 5. store new page token in Secret Manager
      await secretManagerService.addPageToken(page.id, targetPage.accessToken, newToken.expiresIn);

      // 6. update Firestore page "metadata"/info
      await firestoreService.updatePage(page.id, {
        tokenRefreshedAt: firestore.FieldValue.serverTimestamp(),
        lastRefreshSuccess: true,
      });
      // success!
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
