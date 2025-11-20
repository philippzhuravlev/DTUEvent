import type { Event } from '../types';
import { formatEventStart, getEventUrl } from '../utils/eventUtils';

// Small presentational card. Receives one event and renders a link + metadata.
export function EventCard({ event }: { event: Event }) {
  return (
    <a
      href={getEventUrl(event.id, event.eventURL)}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
    >
<<<<<<< Updated upstream
      {/* card */}
      <div className="border rounded p-4 hover:bg-gray-50 transition">
        {/* layout: optional image */}
        <div className="flex items-start gap-4">
          {event.coverImageUrl && (
            <img src={event.coverImageUrl} alt={event.title} className="w-28 h-16 object-cover rounded" />
=======
      {/* card itself */}
      <div className="border rounded p-4 hover:shadow-lg hover:bg-gray-50 transition h-full flex flex-col">
        {/* optional image */}
        <div className="flex flex-col gap-3">
          {event.coverImageUrl && (
            <img src={event.coverImageUrl} alt={event.title} className="w-full h-40 object-cover rounded" /> // if there is a cover image then show it
>>>>>>> Stashed changes
          )}
          {/* text column */}
          <div className="flex-1">
            <div className="font-semibold line-clamp-2">{event.title}</div>
            <div className="text-sm text-gray-600 mt-2">{formatEventStart(event.startTime)}</div>
            <div className="text-sm mt-1">{event.place?.name ?? 'Location TBA'}</div>
          </div>
        </div>
      </div>
    </a>
  );
}


