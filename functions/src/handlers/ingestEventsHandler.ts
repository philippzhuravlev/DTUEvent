import { HttpStatusUtil } from '../utils';
import { Request, Response } from 'express';
import type { Dependencies } from '../utils';

// this handler "ingests" i.e. gets Facebook events and stores them in Firestore. 
// the function can be called manually or automatically (scheduled)

export async function ingestEvents(deps: Dependencies) {
  // we convert deps into individual consts ("destructuring") for ez access
  const { facebookService, secretManagerService, storageService, firestoreService } = deps;

  const startTime = Date.now();
  console.log('[INGEST] Events ingestion started at', new Date(startTime).toISOString());

  // 1. get pages from Firestore
  console.log('[INGEST] Step 1: Fetching pages from Firestore');
  const pages = await firestoreService.getPages();
  console.log('[INGEST] Pages fetched:', pages ? pages.length : 0, 'page(s)');

  if (!pages || pages.length === 0) {
    console.warn('[INGEST] WARNING: No pages found in Firestore');
    const duration = Date.now() - startTime;
    console.log('[INGEST] Ingest completed with no pages. Duration:', duration, 'ms');
    return { totalPages: 0, totalEvents: 0, duration };
  }
  console.log('[INGEST] Processing', pages.length, 'page(s)');
  
  let totalEventsProcessed = 0;
  let totalEventsFailed = 0;
  const pageResults: any[] = [];

  for (const page of pages) {
    const pageStartTime = Date.now();
    console.log('[INGEST] Processing page:', page.id, '(' + page.name + ')');
    
    try {
      console.log('[INGEST] Step 2: Retrieving token from Secret Manager for page', page.id);
      // 2. get page token from Secret Manager
      const token = await secretManagerService.getPageToken(page.id);
      console.log('[INGEST] Token retrieved for page', page.id, '- Valid:', !!token);

      if (!token) {
        console.warn('[INGEST] WARNING: No token found for page', page.id, '- skipping');
        pageResults.push({
          pageId: page.id,
          pageName: page.name,
          status: 'skipped',
          reason: 'no_token',
          duration: Date.now() - pageStartTime,
        });
        continue;
      }

      console.log('[INGEST] Step 3: Fetching events from Facebook for page', page.id);
      // 3. get events from Facebook
      const events = await facebookService.getPageEvents(page.id, token);
      console.log('[INGEST] Events retrieved for page', page.id, '- Count:', events ? events.length : 0);

      if (!events || events.length === 0) {
        console.log('[INGEST] No events found for page', page.id);
        pageResults.push({
          pageId: page.id,
          pageName: page.name,
          status: 'success',
          eventsProcessed: 0,
          eventsFailed: 0,
          duration: Date.now() - pageStartTime,
        });
        continue;
      }
      console.log('[INGEST] Processing', events.length, 'event(s) for page', page.id);

      const eventsData: any[] = [];
      let pageEventsFailed = 0;

      for (const event of events) {
        try {
          console.log('[INGEST] Step 4: Processing event', event.id, 'for page', page.id);
          // 4. store event cover image in Firebase Storage
          let coverImageUrl = event.cover?.source;
          console.log('[INGEST] Event', event.id, 'has cover image:', !!coverImageUrl);

          if (coverImageUrl) {
            try {
              console.log('[INGEST] Uploading cover image for event', event.id, 'to Storage');
              // store cover image in covers/{pageId}/{eventId}
              coverImageUrl = await storageService.addImageFromUrl(`covers/${page.id}/${event.id}`, coverImageUrl);
              console.log('[INGEST] Cover image uploaded successfully for event', event.id);
              // success!
            } catch (e: any) {
              console.warn('[INGEST] WARNING: Failed to upload cover image for event', event.id, ':', e.message);
              // fail; just use original Facebook URL
            }
          }

          // 5. normalize and prepare event data for Firestore
          console.log('[INGEST] Step 5: Preparing event data for Firestore - event', event.id);
          eventsData.push({
            ...event,
            coverImageUrl,
          });
          console.log('[INGEST] Event data prepared:', event.id);
        } catch (error: any) {
          console.error('[INGEST] ERROR: Failed to process event', event.id, ':', error.message);
          console.error('[INGEST] Error stack:', error.stack);
          pageEventsFailed++;
          totalEventsFailed++;
        }
      }

      console.log('[INGEST] Step 6: Adding', eventsData.length, 'events to Firestore for page', page.id);
      // 6. add events to Firestore
      await firestoreService.addEvents(page.id, eventsData);
      console.log('[INGEST] Events added to Firestore successfully for page', page.id);

      totalEventsProcessed += eventsData.length;
      const pageDuration = Date.now() - pageStartTime;
      console.log('[INGEST] Page', page.id, 'completed - Processed:', eventsData.length, 'Events - Failed:', pageEventsFailed, '- Duration:', pageDuration, 'ms');
      pageResults.push({
        pageId: page.id,
        pageName: page.name,
        status: 'success',
        eventsProcessed: eventsData.length,
        eventsFailed: pageEventsFailed,
        duration: pageDuration,
      });

    } catch (error: any) {
      const pageDuration = Date.now() - pageStartTime;
      console.error('[INGEST] ERROR: Page', page.id, 'processing failed:', error.message);
      console.error('[INGEST] Error stack:', error.stack);
      console.log('[INGEST] Page', page.id, 'failed - Duration:', pageDuration, 'ms');
      pageResults.push({
        pageId: page.id,
        pageName: page.name,
        status: 'failed',
        error: error.message || String(error),
        duration: pageDuration,
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log('[INGEST] Events ingestion completed');
  console.log('[INGEST] Total duration:', totalDuration, 'ms');
  console.log('[INGEST] Summary - Pages:', pages.length, '| Events Processed:', totalEventsProcessed, '| Events Failed:', totalEventsFailed);
  
  const result = {
    totalPages: pages.length,
    totalEvents: totalEventsProcessed,
    totalEventsFailed,
    duration: totalDuration,
    pageResults,
  };
  console.log('[INGEST] Result object:', JSON.stringify(result, null, 2));

  return result;
}

export async function handleManualIngest(req: Request, res: Response, deps: Dependencies) {
  // currently the manual ingest runs over HTTP, but could be changed to CLI command
  console.log('[INGEST-MANUAL] Manual ingest HTTP request received');
  console.log('[INGEST-MANUAL] Request URL:', req.url);
  console.log('[INGEST-MANUAL] Request IP:', req.ip);
  try {
    console.log('[INGEST-MANUAL] Starting ingest operation');
    const result = await ingestEvents(deps);
    console.log('[INGEST-MANUAL] Ingest operation completed successfully');
    console.log('[INGEST-MANUAL] Sending response with status 200');
    HttpStatusUtil.send(res, 200, result);
  } catch (e: any) {
    console.error('[INGEST-MANUAL] ERROR: Ingest operation failed:', e.message);
    console.error('[INGEST-MANUAL] Error stack:', e.stack);
    HttpStatusUtil.send(res, 500, { error: e.message });
  }
}

export async function handleScheduledIngest(event: any, context: any, deps: Dependencies) {
  // this function is triggered by a scheduled Firebase (cloud) function (basically a cron 
  // job) found in functions/index.ts
  console.log('[INGEST-SCHEDULED] Scheduled ingest triggered');
  console.log('[INGEST-SCHEDULED] Event:', JSON.stringify(event, null, 2));
  console.log('[INGEST-SCHEDULED] Context:', JSON.stringify(context, null, 2));
  try {
    console.log('[INGEST-SCHEDULED] Starting scheduled ingest operation');
    const result = await ingestEvents(deps);
    console.log('[INGEST-SCHEDULED] Scheduled ingest completed successfully');
    console.log('[INGEST-SCHEDULED] Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('[INGEST-SCHEDULED] ERROR: Scheduled ingest failed:', error.message);
    console.error('[INGEST-SCHEDULED] Error stack:', error.stack);
    console.error('[INGEST-SCHEDULED] Full error:', JSON.stringify(error, null, 2));
    // silently fail
  }
}