import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Event } from '../types';
import { getEventById } from '../services/dal';
import { formatEventStart } from '../utils/eventUtils';

// EventPage is the detailed view for a single event. Routed via /events/:id
// It is structured as:
// - Header with back button
// - Scrollable content area with:
//   - Image (1/4 of view)
//   - Title, location
//   - Description

export function EventPage() {
  const { id } = useParams<{ id: string }>(); // id for /events/:id
  const navigate = useNavigate(); // surprise tool that will help us later
  const [event, setEvent] = useState<Event | null>(null); // make events stateful

  // () => means "when this happens, do this". Lambda function / arrow function syntax.
  useEffect(() => {
    if (!id) return;

    // fetch event by id from dal.ts
    const getEventFromDal = async () => {
      const fetchedEvent = await getEventById(id);
      setEvent(fetchedEvent);
    };
    getEventFromDal(); // async
  }, [id]);

  const handleBack = () => { // when back button clicked...
    navigate('/'); // ...go back to main events list
  };

  if (!event) return null;

  // Main Rendering of EventPage
  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white border-b">
        
         {/* when back button is clicked */}
        <button
          onClick={handleBack}
          className="p-4 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Back to events"
        >
          <ChevronLeft className="w-6 h-6" /> {/* left arrow icon from lucide-react */}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto"> {/* Scrollable element */}
        <div className="max-w-3xl mx-auto">

          {/* image section, 1/4 of view*/}
          {event.coverImageUrl && (
            <div className="h-screen/4 w-full overflow-hidden bg-gray-100">
              {/* notice the h(eight) of the screen/4 */}
              
              {/* get image from url*/}
              <img
                src={event.coverImageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and location section */}
          <div className="px-4 py-6 border-b">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            {/* h1 = header 1*/}

            {/* && means if event.place exists, then render the following */}
            {event.place && (
              
              // display a bunch of gray text of varying sizes for location info
              <div className="text-gray-600">
                <div className="font-semibold text-gray-900">{event.place.name}</div>
                {event.place.location && (
                  <div className="text-sm mt-2">
                    {event.place.location.street && (
                      <div>{event.place.location.street}</div>
                    )}
                    {(event.place.location.zip || event.place.location.city) && (
                      <div>
                        {event.place.location.zip} {event.place.location.city}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* display start time */}
            <div className="text-sm text-gray-500 mt-4">
              {formatEventStart(event.startTime)}
            </div>
          </div>

          {/* description */}
          <div className="px-4 py-6">
            {event.description ? (
              // prose = nice typography styles from Tailwind CSS Typography plugin
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>

          {/* add a little spacing at the bottom */}
          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
