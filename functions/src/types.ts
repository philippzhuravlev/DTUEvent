import type { Timestamp } from 'firebase-admin/firestore'; // firebase has their own Timestamp type

// FACEBOOK GRAPH API TYPES
// i.e. how the data looks when we get it from Facebook Graph API
export interface FbLocation {
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface FbPlace {
  id?: string;
  name?: string;
  location?: FbLocation;
}

export interface FbEventResponse {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  place?: FbPlace | null;
  cover?: { source: string } | null;
}

export interface FbPageResponse {
  id: string;
  name: string;
  access_token: string;
}

export interface FbShortLivedTokenResponse {
  access_token: string;
}

export interface FbLongLivedTokenResponse {
  access_token: string;
  expires_in: number;
}


// FIRESTORE TYPES
// i.e. how data is stored in Firestore
export interface FirestoreEvent {
  id: string;
  pageId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  place?: FbPlace;
  coverImageUrl?: string;
  eventURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FirestorePage {
  id: string;
  name: string;
  pictureUrl: string;
  instagramId?: string;
  tokenRefreshedAt?: Timestamp; 
  lastRefreshSuccess?: boolean;
  lastRefreshError?: string;
  lastRefreshAttempt?: Timestamp;
}


// SERVICE TYPES
// interfaces used by our services but not in DB
export interface PageToken {
  token: string;
  expiresAt: string; // ISO string
}

export interface LongLivedToken {
  accessToken: string;
  expiresIn: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
}
