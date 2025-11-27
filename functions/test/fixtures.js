/**
 * Mock Facebook events
 */
const mockFacebookEvents = [
  {
    id: '123456789',
    name: 'Friday Bar at S-Huset',
    description: 'Join us for drinks!',
    start_time: '2025-11-29T18:00:00+01:00',
    end_time: '2025-11-29T23:00:00+01:00',
    place: { name: 'S-Huset', location: { city: 'Lyngby' } },
    cover: { source: 'https://example.com/cover.jpg' },
  },
  {
    id: '987654321',
    name: 'Board Game Night',
    description: 'Casual gaming',
    start_time: '2025-12-01T19:00:00+01:00',
    end_time: '2025-12-01T22:00:00+01:00',
    place: { name: 'Diagonalen' },
  },
];

/**
 * Mock Facebook pages
 */
const mockFacebookPages = [
  { id: 'shuset.dk', name: 'S-Huset', access_token: 'mock-page-token-1' },
  { id: 'DiagonalenDTU', name: 'Diagonalen', access_token: 'mock-page-token-2' },
];

/**
 * Mock normalized events (Firestore format)
 */
const mockNormalizedEvents = [
  {
    id: '123456789',
    pageId: 'shuset.dk',
    title: 'Friday Bar at S-Huset',
    description: 'Join us for drinks!',
    startTime: '2025-11-29T18:00:00+01:00',
    endTime: '2025-11-29T23:00:00+01:00',
    place: { name: 'S-Huset', location: { city: 'Lyngby' } },
    coverImageUrl: 'https://example.com/cover.jpg',
    eventURL: 'https://www.facebook.com/events/123456789',
  },
];

module.exports = {
  mockFacebookEvents,
  mockFacebookPages,
  mockNormalizedEvents,
};