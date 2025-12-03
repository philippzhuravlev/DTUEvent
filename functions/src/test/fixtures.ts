import type { 
  FbEventResponse, 
  FbPageResponse, 
  FirestoreEvent, 
  FirestorePage,
  FbShortLivedTokenResponse,
  FbLongLivedTokenResponse,
} from '../types';

// Mock Facebook API responses
export const mockFbShortLivedToken: FbShortLivedTokenResponse = {
  access_token: 'short-lived-token-123',
};

export const mockFbLongLivedToken: FbLongLivedTokenResponse = {
  access_token: 'long-lived-token-456',
  expires_in: 5184000, // 60 days in seconds
};

export const mockFbPages: FbPageResponse[] = [
  {
    id: 'shuset.dk',
    name: 'S-Huset',
    access_token: 'page-token-shuset',
  },
  {
    id: 'DiagonalenDTU',
    name: 'Diagonalen',
    access_token: 'page-token-diagonalen',
  },
];

export const mockFbEvents: FbEventResponse[] = [
  {
    id: '123456789',
    name: 'Friday Bar',
    description: 'Join us for drinks!',
    start_time: '2025-12-06T18:00:00+01:00',
    end_time: '2025-12-06T23:00:00+01:00',
    place: {
      id: 'place-1',
      name: 'S-Huset, DTU Lyngby',
      location: {
        city: 'Kongens Lyngby',
        country: 'DK',
        latitude: 55.785,
        longitude: 12.522,
      },
    },
    cover: { source: 'https://example.com/cover.jpg' },
  },
  {
    id: '987654321',
    name: 'Quiz Night',
    description: 'Bring your team!',
    start_time: '2025-12-10T19:00:00+01:00',
    place: {
      name: 'Diagonalen',
    },
  },
];

// Mock Firestore documents
export const mockFirestorePages: (FirestorePage & { id: string })[] = [
  {
    id: 'shuset.dk',
    name: 'S-Huset',
    pictureUrl: 'https://example.com/shuset.jpg',
    tokenRefreshedAt: '2025-11-20T12:00:00.000Z',
    lastRefreshSuccess: true,
  },
  {
    id: 'DiagonalenDTU',
    name: 'Diagonalen',
    pictureUrl: 'https://example.com/diagonalen.jpg',
    tokenRefreshedAt: '2025-11-15T12:00:00.000Z',
    lastRefreshSuccess: true,
  },
];

export const mockFirestoreEvents: FirestoreEvent[] = [
  {
    id: '123456789',
    pageId: 'shuset.dk',
    title: 'Friday Bar',
    description: 'Join us for drinks!',
    startTime: '2025-12-06T18:00:00+01:00',
    endTime: '2025-12-06T23:00:00+01:00',
    place: {
      id: 'place-1',
      name: 'S-Huset, DTU Lyngby',
      location: {
        city: 'Kongens Lyngby',
        country: 'DK',
      },
    },
    coverImageUrl: 'https://storage.googleapis.com/bucket/covers/shuset.dk/123456789.jpg',
    eventURL: 'https://facebook.com/events/123456789',
    createdAt: '2025-11-20T12:00:00.000Z',
    updatedAt: '2025-12-03T10:00:00.000Z',
  },
];