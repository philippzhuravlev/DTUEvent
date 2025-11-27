import { EventCard } from './EventCard'; // renders individual event cards
import type { Event as EventType } from '../types'; // imports the type for event

// function to returns a list of event cards (list is an array of EventType) 
export function EventList({ list }: { list: EventType[] }) {
  if (list.length === 0) { // check if there are no events in the list
    return <p className="text-sm text-gray-600 mb-4">No events found for this page.</p>;
  }
  return (
    <div className="page">
      <div className="panel flex flex-col gap-4">
        {list.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  );
}
