const { onRequest } = require('firebase-functions/v2/https');
//const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ region: 'europe-west1' });

// Secret set via: firebase functions:secrets:set FACEBOOK_APP_SECRET
const FACEBOOK_APP_SECRET = defineSecret('FACEBOOK_APP_SECRET');
const FACEBOOK_APP_ID_PARAM = defineString('FACEBOOK_APP_ID');
const FB_REDIRECT_URI_PARAM = defineString('FB_REDIRECT_URI');
const GCP_PROJECT_ID_PARAM = defineString('GCP_PROJECT_ID');

const { buildFbDeps } = require('./utils/fbConfig');

exports.fbAuth = onRequest({ secrets: [FACEBOOK_APP_SECRET] }, async (req, res) => {
  try {
    // Build dependencies for the handler (pass the secret VALUE under FB_APP_SECRET)
    const deps = buildFbDeps({
      req,
      admin,
      overrides: {
        FB_APP_ID: FACEBOOK_APP_ID_PARAM.value(),
        FB_APP_SECRET: FACEBOOK_APP_SECRET.value(),
        FB_REDIRECT_URI: FB_REDIRECT_URI_PARAM.value(),
        GCP_PROJECT_ID: GCP_PROJECT_ID_PARAM.value()
      }
    });

    // Lazily require the handler so index.js stays light and secrets/env are available
    const { handleFbAuth } = require('./handlers/fbOAuthHandler');

    return handleFbAuth(req, res, deps);
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : 'Unknown error');
  }
});

/*
// Secret set via: firebase functions:secrets:set FB_PAGE_TOKEN
const FB_PAGE_TOKEN = defineSecret('FB_PAGE_TOKEN');

exports.syncFacebook = onRequest({ secrets: [FB_PAGE_TOKEN] }, async (req, res) => {
  try {
    const pageId = String(req.query.pageId || '').trim();
    if (!pageId) {
      res.status(400).send('Missing pageId');
      return;
    }

    const accessToken = FB_PAGE_TOKEN.value();
    if (!accessToken) {
      res.status(500).send('FB_PAGE_TOKEN not set');
      return;
    }

    const url = new URL(`https://graph.facebook.com/v19.0/${pageId}/events`);
    url.searchParams.set('time_filter', 'upcoming');
    url.searchParams.set('fields', 'id,name,description,start_time,end_time,place,cover');
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok) {
      res.status(response.status).json(body);
      return;
    }

    const events = Array.isArray(body.data) ? body.data : [];
    const db = admin.firestore();
    const batch = db.batch();
    const nowIso = new Date().toISOString();

    // Helper to drop undefined values so Firestore accepts the document
    const dropUndefined = (obj) => Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    );

    for (const ev of events) {
      const docRef = db.collection('events').doc(ev.id);
      const normalized = dropUndefined({
        id: ev.id,
        pageId,
        title: ev.name,
        description: ev.description,
        startTime: ev.start_time,
        endTime: ev.end_time,
        place: ev.place,
        coverImageUrl: ev.cover?.source,
        eventURL: `https://facebook.com/events/${ev.id}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch.set(docRef, normalized, { merge: true });
    }

    await batch.commit();
    res.json({ upserted: events.length });
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : 'Unknown error');
  }
});

// Run twice daily to refresh upcoming events for all active pages in Firestore
exports.nightlySyncFacebook = onSchedule({
  schedule: 'every 12 hours',
  timeZone: 'Etc/UTC',
  secrets: [FB_PAGE_TOKEN],
}, async () => {
  const accessToken = FB_PAGE_TOKEN.value();
  if (!accessToken) {
    console.warn('FB_PAGE_TOKEN is not set');
    return;
  }

  const db = admin.firestore();
  const pagesSnap = await db.collection('pages').where('active', '==', true).get();
  if (pagesSnap.empty) {
    console.log('No active pages; nothing to sync');
    return;
  }

  const nowIso = new Date().toISOString();
  const batch = db.batch();

  for (const doc of pagesSnap.docs) {
    const pageId = doc.id;
    try {
      const url = new URL(`https://graph.facebook.com/v19.0/${pageId}/events`);
      url.searchParams.set('time_filter', 'upcoming');
      url.searchParams.set('fields', 'id,name,description,start_time,end_time,place,cover');
      url.searchParams.set('access_token', accessToken);

      const response = await fetch(url);
      const body = await response.json();
      if (!response.ok) {
        console.warn('Graph error for page', pageId, body);
        continue;
      }

      const events = Array.isArray(body.data) ? body.data : [];
      const dropUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

      for (const ev of events) {
        const ref = db.collection('events').doc(ev.id);
        const normalized = dropUndefined({
          id: ev.id,
          pageId,
          title: ev.name,
          description: ev.description,
          startTime: ev.start_time,
          endTime: ev.end_time,
          place: ev.place,
          coverImageUrl: ev.cover?.source,
          eventURL: `https://facebook.com/events/${ev.id}`,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        batch.set(ref, normalized, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to sync page', pageId, err);
    }
  }

  await batch.commit();
}); */

exports.envDebug = onRequest(async (_req, res) => {
  res.json({
    param_FACEBOOK_APP_ID: FACEBOOK_APP_ID_PARAM.value(),
    param_FB_REDIRECT_URI: FB_REDIRECT_URI_PARAM.value()
  });
});


