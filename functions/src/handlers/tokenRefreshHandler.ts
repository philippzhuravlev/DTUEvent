import { firestore } from 'firebase-admin';
import type { Dependencies } from '../utils';

export async function handleRefreshTokens(deps: Dependencies): Promise<void> {
  const { facebookService, secretManagerService, storageService, firestoreService } = deps;

  const startTime = Date.now();
  console.log('[REFRESH] Token refresh started at', new Date(startTime).toISOString());

  // 1. get pages from Firestore
  console.log('[REFRESH] Step 1: Fetching pages from Firestore');
  const pages = await firestoreService.getPages();
  console.log('[REFRESH] Pages fetched:', pages ? pages.length : 0, 'page(s)');
  
  if (!pages || pages.length === 0) {
    console.warn('[REFRESH] WARNING: No pages found in Firestore - aborting token refresh');
    const duration = Date.now() - startTime;
    console.log('[REFRESH] Token refresh completed with no pages. Duration:', duration, 'ms');
    return;
  }
  console.log('[REFRESH] Processing', pages.length, 'page(s) for token refresh');

  let tokensRefreshed = 0;
  let tokensFailed = 0;

  for (const page of pages) {
    console.log('[REFRESH] Processing page:', page.id, '(' + page.name + ')');
    try {
      console.log('[REFRESH] Step 2: Retrieving current token from Secret Manager for page', page.id);
      // 2. get page token from Secret Manager
      const currentPageToken = await secretManagerService.getPageToken(page.id);
      if (!currentPageToken) {
        console.error('[REFRESH] ERROR: No token found in Secret Manager for page', page.id);
        throw new Error('No token found in Secret Manager for page');
      }
      console.log('[REFRESH] Current token retrieved for page', page.id);

      console.log('[REFRESH] Step 3: Refreshing token with Facebook for page', page.id);
      // 3. refresh long-lived token
      const refreshedToken = await facebookService.refreshPageToken(currentPageToken);
      console.log('[REFRESH] Token refreshed successfully for page', page.id);
      console.log('[REFRESH] New token expires in:', refreshedToken.expiresIn || 5184000, 'seconds');

      console.log('[REFRESH] Step 4: Updating token in Secret Manager for page', page.id);
      // 4. store new page token in Secret Manager
      await secretManagerService.updatePageToken(page.id, refreshedToken.accessToken, refreshedToken.expiresIn || 5184000);
      console.log('[REFRESH] Token updated in Secret Manager for page', page.id);

      console.log('[REFRESH] Step 5: Updating Firestore metadata for page', page.id);
      // 5. update Firestore page metadata
      await firestoreService.updatePage(page.id, {
        tokenRefreshedAt: firestore.FieldValue.serverTimestamp(),
        lastRefreshSuccess: true,
        lastRefreshError: null,
      });
      console.log('[REFRESH] Firestore metadata updated successfully for page', page.id);
      tokensRefreshed++;
      console.log('[REFRESH] SUCCESS: Token refresh completed for page', page.id, '- Total refreshed:', tokensRefreshed);
    } catch (err: any) {
      tokensFailed++;
      const errorMsg = err?.message || String(err);
      console.error('[REFRESH] ERROR: Token refresh failed for page', page.id, ':', errorMsg);
      console.error('[REFRESH] Error stack:', err?.stack);
      console.log('[REFRESH] Total failed:', tokensFailed);

      try {
        console.log('[REFRESH] Updating Firestore with error metadata for page', page.id);
        await firestoreService.updatePage(page.id, {
          lastRefreshSuccess: false,
          lastRefreshError: errorMsg,
          lastRefreshAttempt: firestore.FieldValue.serverTimestamp(),
        });
        console.log('[REFRESH] Error metadata stored in Firestore for page', page.id);
      } catch (dbErr: any) {
        console.error('[REFRESH] ERROR: Failed to update error metadata in Firestore for page', page.id, ':', dbErr?.message);
        // silently fail
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log('[REFRESH] Token refresh completed');
  console.log('[REFRESH] Summary - Total pages processed:', pages.length, '| Tokens refreshed:', tokensRefreshed, '| Tokens failed:', tokensFailed);
  console.log('[REFRESH] Total duration:', totalDuration, 'ms');

  return;
}
