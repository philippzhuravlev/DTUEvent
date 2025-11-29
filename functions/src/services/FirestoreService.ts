import { Firestore } from 'firebase-admin/firestore';
import { normalizeEvent } from '../utils';
import type { FbEventResponse, FirestorePage } from '../types';

export class FirestoreService {
  // firestore instance from firebase admin sdk
  private db: Firestore;
  constructor(db: Firestore) { // dependency injection thru constructor
    this.db = db;
  }

  async addPage(pageId: string, data: any): Promise<void> {
    const pagePointer = this.db.collection('pages').doc(pageId);
    await pagePointer.set(data, { merge: true });
  }

  async updatePage(pageId: string, data: Record<string, any>): Promise<void> {
    const pagePointer = this.db.collection('pages').doc(pageId);
    await pagePointer.update(data);
  }

  async getPages(): Promise<(FirestorePage & { id: string })[]> {
    // gets a "snapshot", i.e. current state of the collection at this moment in time. 
    // this is necessary for when we're reading multiple documents at once
    const collectionInstance = await this.db.collection('pages').get(); 
    if (collectionInstance.empty) { return []; }
    return collectionInstance.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestorePage & { id: string }));
  } // map = iterate thru each document in the collection, get its data and return as array

  async addEvents(pageId: string, events: (FbEventResponse & { coverImageUrl?: string })[]): Promise<{ upserted: number }> {
    // 1. set up time, batch and "reference" (i.e. pointer) to events collection
    const currentTimeInIso = new Date().toISOString();
    const batchOfEvents = this.db.batch(); 
    const eventsCollection = this.db.collection('events'); 

    for (const event of events) {
      // 2. get reference for each event document
      const eventPointer = eventsCollection.doc(event.id);

      // 3. normalize from fb form to firestore form
      const normalizedData = normalizeEvent(pageId, event);

      // 4. map event data 
      const eventData = {
        ...normalizedData,
        coverImageUrl: event.coverImageUrl ?? normalizedData.coverImageUrl,
        updatedAt: currentTimeInIso,
      };

      // 5. if new event, set createdAt
      batchOfEvents.set(eventPointer, eventData, { merge: true });
    }

    // 6. upload/commit batch of events! 
    await batchOfEvents.commit();
    return { upserted: events.length }; // upserted = inserted or updated
  }
}
