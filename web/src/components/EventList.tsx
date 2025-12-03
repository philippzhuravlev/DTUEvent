import { EventCard } from './EventCard'; // renders individual event cards
import type { Event as EventType } from '../types'; // imports the type for event
import { useRef } from "react";
import { useRunawayCard } from "../hooks/useRunaway";

// function to returns a list of event cards (list is an array of EventType) 
export function EventList({ list }: { list: EventType[] }) {
  if (list.length === 0) { // check if there are no events in the list
    return <p className="text-sm text-[var(--text-subtle)] mb-4 text-center py-8">No events found for this page.</p>;
  }
  return (
    <div className="page">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {list.map(event => {
          const ref = useRef<HTMLDivElement>(null);
          useRunawayCard(ref); // attach runaway behavior

          return (
            <div
              key={event.id}
              ref={ref}
              className="relative transition-transform"
              style={{ willChange: "transform" }}
            >
              <EventCard event={event} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
