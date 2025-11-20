const admin = require('firebase-admin');
const { getAllPageIds, getPageMetadata } = require('../repositories/pagesRepository');
const { SecretManagerService } = require('../services/SecretManagerService');
const { createFacebookClient } = require('../services/facebook/client');

/**
 * Refresh all page tokens that are about to expire
 * Facebook tokens last 59 days, so we refresh every 45 days to be safe
 */
async function refreshPageTokens() {
  const db = admin.firestore();
  const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.VITE_GCP_PROJECT_ID;
  const secretManager = new SecretManagerService(GCP_PROJECT_ID);

  const fbClient = createFacebookClient({
    FB_APP_ID: process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID,
    FB_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    FB_REDIRECT_URI: process.env.FB_REDIRECT_URI,
  });

  const pageIds = await getAllPageIds(db);
  if (!pageIds || pageIds.length === 0) {
    console.log('No pages to refresh');
    return { refreshed: [], failed: [], skipped: [], totalPages: 0 };
  }

  console.log(`Checking ${pageIds.length} page token(s) for refresh...`);

  const report = {
    refreshed: [],
    failed: [],
    skipped: [],
    totalPages: pageIds.length,
    refreshedAt: new Date().toISOString(),
  };

  for (const pageId of pageIds) {
    try {
      // Get current page token
      const currentToken = await secretManager.getPageToken(pageId);

      // Get page metadata to check last refresh
      const pageData = await getPageMetadata(db, pageId);
      const lastRefreshed = pageData?.tokenRefreshedAt?.toDate();
      const daysSinceRefresh = lastRefreshed 
        ? Math.floor((Date.now() - lastRefreshed.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // If never refreshed, force refresh

      // Only refresh if > 50 days old (tokens last 60 days)
      if (daysSinceRefresh < 45) {
        console.log(`⏭ Skipping ${pageId} (refreshed ${daysSinceRefresh} days ago)`);
        report.skipped.push({ pageId, daysSinceRefresh });
        continue;
      }

      console.log(`🔄 Refreshing token for ${pageId} (${daysSinceRefresh} days old)...`);

      // Step 1: Exchange current page token for new long-lived USER token
      // This is the trick: use the page token as if it were a short-lived token
      const newLongToken = await fbClient.exchangeForLongLivedToken(currentToken);

      // Step 2: Get fresh page tokens using the new long-lived token
      const pages = await fbClient.getPagesForUser(newLongToken);
      const targetPage = pages.find(p => p.id === pageId);

      if (!targetPage) {
        throw new Error(`Page ${pageId} not found in user's pages after refresh`);
      }

      // Step 3: Store new page token
      await secretManager.storePageToken(pageId, targetPage.access_token);

      // Step 4: Update refresh timestamp in Firestore
      // Updates existing document with new fields
      await db.collection('pages').doc(pageId).update({
        tokenRefreshedAt: admin.firestore.FieldValue.serverTimestamp(), // ← Updates this
        lastRefreshSuccess: true, // ← Updates this
      });

      report.refreshed.push({
        pageId,
        daysSinceRefresh,
        status: 'success',
      });

      console.log(`✓ Refreshed token for ${pageId}`);
    } catch (err) {
      const errorMsg = err?.message || String(err);
      report.failed.push({
        pageId,
        error: errorMsg,
        status: 'failed',
      });

      // Mark refresh failure in Firestore
      try {
        await db.collection('pages').doc(pageId).update({
          lastRefreshSuccess: false,
          lastRefreshError: errorMsg,
          lastRefreshAttempt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (dbErr) {
        console.error(`Could not update Firestore for ${pageId}:`, dbErr);
      }

      console.error(`✗ Failed to refresh ${pageId}: ${errorMsg}`);
    }
  }

  // Log summary
  console.log('\n=== Token Refresh Report ===');
  console.log(`✓ Refreshed: ${report.refreshed.length}`);
  console.log(`⏭ Skipped: ${report.skipped.length}`);
  console.log(`✗ Failed: ${report.failed.length}`);

  return report;
}

module.exports = { refreshPageTokens };