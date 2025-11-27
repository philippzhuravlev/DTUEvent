const admin = require('firebase-admin');
const { getAllPageIds } = require('../repositories/pagesRepository');
const { createEventsRepository } = require('../repositories/eventsRepository');
const { upsertEventNormalized } = createEventsRepository(admin);
const { SecretManagerService } = require('../services/SecretManagerService'); // CHANGED: was PageTokenService
const { createFacebookClient } = require('../services/facebook/client');
const { rehostCoverOrValidate } = require('../services/ingestStorage');

async function ingestFacebookEvents({ timeFilter = 'upcoming' } = {}) {
  const db = admin.firestore();
  const storage = admin.storage();
  const bucket = storage.bucket();

  const pageIds = await getAllPageIds(db);
  if (!pageIds || pageIds.length === 0) {
    console.error('No pages configured for processing.');
    return { totalEvents: 0, successfulPages: 0, failedPages: 0, totalPages: 0 };
  }

  console.log(`Processing ${pageIds.length} page(s): ${pageIds.join(', ')}`);

  const fbClient = createFacebookClient({
    FB_APP_ID: process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID,
    FB_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    FB_REDIRECT_URI: process.env.FB_REDIRECT_URI || 'https://europe-west1-dtuevent-8105b.cloudfunctions.net/fbAuth',
  });

  // CHANGED: Initialize SecretManagerService instead of using getTokenForPage
  const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.VITE_GCP_PROJECT_ID;
  const secretManager = new SecretManagerService(GCP_PROJECT_ID);

  let totalEvents = 0;
  let successfulPages = 0;
  let failedPages = 0;

  for (const pageId of pageIds) {
    try {
      console.log(`\nProcessing page ${pageId}...`);
      
      // CHANGED: Use secretManager.getPageToken() instead of getTokenForPage()
      const token = await secretManager.getPageToken(pageId);

      const events = await fbClient.getUpcomingEvents(pageId, token, { timeFilter });
      console.log(`Found ${events.length} events for page ${pageId}`);

      let count = 0;
      for (const ev of events) {
        const docId = ev.id;

        // Prefer rehosting; fallback to verified FB URL; else undefined
        const coverUrl = await rehostCoverOrValidate({
          bucket,
          docId,
          coverSource: ev?.cover?.source,
        });

        await upsertEventNormalized(db, admin.firestore.Timestamp, docId, {
          id: ev.id,
          pageId,
          title: ev.name,
          description: ev.description || '',
          startTime: ev.start_time,
          endTime: ev.end_time,
          place: ev.place,
          coverImageUrl: coverUrl ?? null, // ensure no undefined
          eventURL: `https://www.facebook.com/events/${ev.id}`,
          raw: ev,
        });

        count++;
      }

      console.log(`Synced ${count} events from page ${pageId}`);
      totalEvents += count;
      successfulPages++;
    } catch (e) {
      failedPages++;
      console.error(`Error processing page ${pageId}:`, e?.message || e);
    }
  }

  return { totalEvents, successfulPages, failedPages, totalPages: pageIds.length };
}

module.exports = { ingestFacebookEvents };