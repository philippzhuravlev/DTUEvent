import { EventCard } from './EventCard'; // renders individual event cards
import type { Event as EventType } from '../types'; // imports the type for event

// function to returns a list of event cards (list is an array of EventType) 
export function EventList({ list }: { list: EventType[] }) {
  if (list.length === 0) {
    return <p className="text-sm text-gray-600 mb-4">No events found for this page.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
