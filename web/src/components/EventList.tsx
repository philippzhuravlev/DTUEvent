import { EventCard } from './EventCard'; // renders individual event cards
import type { Event as EventType } from '../types'; // imports the type for event

// function to returns a list of event cards (list is an array of EventType) 
export function EventList({ list }: { list: EventType[] }) {
  if (list.length === 0) { // check if there are no events in the list
    return <p className="text-sm text-gray-600 mb-4">No events found for this page.</p>;
  }
  return ( // if there is an event in the list it is mapped to an EventCard component
    <div className="space-y-3">
      {list.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
