import { HttpStatusUtil } from '../utils';
import { Request, Response } from 'express';
import type { Dependencies } from '../utils';

// this handler "ingests" i.e. gets Facebook events and stores them in Firestore. 
// the function can be called manually or automatically (scheduled)

export const ingestEvents = async function ingestEvents(deps: Dependencies) {
  // we convert deps into individual consts ("destructuring") for ez access
  const { facebookService, secretManagerService, storageService, firestoreService } = deps;

  // 1. get pages from Firestore
  const pages = await firestoreService.getPages();

  if (!pages || pages.length === 0) {
    return { totalPages: 0 };
  }
  
  for (const page of pages) {
    try {
      // 2. get page token from Secret Manager
      const token = await secretManagerService.getPageToken(page.id);

      if (!token) {
        // no token for this page — skip
        continue;
      }

      // 3. get events from Facebook
      const events = await facebookService.getPageEvents(page.id, token);

      const eventsData: any[] = [];

      for (const event of events) {

        // 4. store event cover image in Firebase Storage
        let coverImageUrl = event.cover?.source;

        if (coverImageUrl) {
          try {
            // store cover image in covers/{pageId}/{eventId} 
            coverImageUrl = await storageService.addImageFromUrl(`covers/${page.id}/${event.id}`, coverImageUrl);
            // success!
          } catch (e: any) {
            // fail; just use original Facebook URL
          }
        }

        // 5. normalize and prepare event data for Firestore
        eventsData.push({
          ...event,
          coverImageUrl,
        });
      }

      // 6. add events to Firestore
      await firestoreService.addEvents(page.id, eventsData);
    } catch (error: any) {
      console.error(`Ingest events for page ${page.id} failed:`, error.message || error);
      continue;
    }
  }

  return { totalPages: pages.length };
}

export async function handleManualIngest(req: Request, res: Response, deps: Dependencies) {
  // currently the manual ingest runs over HTTP, but could be changed to CLI command
  try {
    const result = await ingestEvents(deps);
    HttpStatusUtil.send(res, 200, result);
  } catch (e: any) {
    HttpStatusUtil.send(res, 500, { error: e.message });
  }
}

export async function handleScheduledIngest(event: any, context: any, deps: Dependencies) {
  // this function is triggered by a scheduled Firebase (cloud) function (basically a cron 
  // job) found in functions/index.ts
  try {
    const result = await ingestEvents(deps);
  } catch (error: any) {
    console.error('Scheduled ingest error:', error.message);
  }
}