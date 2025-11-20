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
      <div className="border rounded p-4 hover:shadow-lg hover:bg-gray-50 transition h-full flex flex-col">
        {event.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-40 object-cover rounded mb-3"
          />
        )}

        <div className="flex-1">
          <div className="font-semibold line-clamp-2">{event.title}</div>
          <div className="text-sm text-gray-600 mt-2">{formatEventStart(event.startTime)}</div>
          <div className="text-sm mt-1">{event.place?.name ?? 'Location TBA'}</div>
        </div>
      </div>
    </a>
  );
}


