import { EventCard } from './EventCard';
import type { Event as EventType } from '../types';

export function EventList({ list }: { list: EventType[] }) {
  if (list.length === 0) {
    return <p className="text-sm text-gray-600 mb-4">No events found for this page.</p>;
  }
  return (
    <div className="space-y-3">
      {list.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
