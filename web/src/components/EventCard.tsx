import type { Event } from '../types';
import { formatEventStart, getEventUrl } from '../utils/eventUtils';
import { useEventCard } from '../hooks/useEventCard';
import { ChevronDown } from 'lucide-react';

// Small presentational card. Receives one event and renders a link + metadata.
export function EventCard({ event }: { event: Event }) {
  const { isExpanded, toggleExpanded, handleCardClick } = useEventCard();
  // EventCard can now expand and collapse. Controlled via isExpanded and toggleExpanded.
  // functionality is in useEventCard hook.

  // Detect "new" events:
  const isNew = (() => {
    const anyEvent = event as any;
    if (typeof anyEvent.isNew === 'boolean') return anyEvent.isNew;
    const createdAt = anyEvent.createdAt ?? anyEvent.publishedAt ?? anyEvent.addedAt;
    if (createdAt) {
      const created = new Date(createdAt).getTime();
      return Number.isFinite(created) && (Date.now() - created) < 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    return false;
  })();

  return (
    // <a> = link. Classic HTML element that stands for "anchor".
    <a
      href={getEventUrl(event.id, event.eventURL)} // link to real event 
      target="_blank"// open in new tab 
      rel="noopener noreferrer" // security for new tab
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      
      // split chevron and card clicks
      onClick={() => { // () = > means when clicking the card
        if (!isExpanded) { // if not expanded, navigate to detail page
          handleCardClick(event.id); // in useEventCard hook
        }
      }}
    >
      {/* card */}
      <div className="relative bubble flex flex-col">
        {/* NEW badge */}
        {isNew && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="rounded-full bg-green-600/90 text-white text-xs font-medium px-2.5 py-1 shadow-sm">
              New event
            </span>
          </div>
        )}

        {/* layout: image + text column */}
        <div className="flex items-start gap-4 flex-1"> 
          {/* gets the optional image or just prints the event title */}
          {event.coverImageUrl && ( 
            <img src={event.coverImageUrl} alt={event.title} className="w-28 h-16 object-cover rounded" />
          )}
          {/* text column */}
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate text-primary">{event.title}</div>
            <div className="text-sm text-subtle">{formatEventStart(event.startTime)}</div>
            <div className="text-sm text-subtle">{event.place?.name ?? 'Location TBA'}</div>
            {/* ? = optional, ?? = if null/undefined then use 'Location TBA' */}
          </div>
        </div>

        {/* expanded description section */}
        {/* if expanded and has description, show it with size h 32 (about 8 lines. Hides overflow*/}
        {isExpanded && event.description && (
          <div className="mt-4">
            <div className="text-sm text-subtle max-h-32 overflow-hidden line-clamp-6">
              {event.description}
            </div>
          </div>
        )}

        {/* chevron button in bottom right */}
        {/* chevron means an arrow minus the stick so just the arrowhead */}
        <div className="flex justify-end mt-3">
          <button
            onClick={(e) => { // when clicking the chevron button...
              e.preventDefault();  // ...prevent the default link behavior
              e.stopPropagation(); // ...stop the click from setting off the card click
              toggleExpanded();    // ...do the actual expand/collapse
            }}
            className="bubble-button flex items-center gap-1 text-sm"
            aria-label={isExpanded ? 'Collapse event details' : 'Expand event details'}
          >
            <ChevronDown           // ...and rotate on expand
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              // ? : = "conditional operator": if isExpanded true then 'rotate-180' else nothing
            />
          </button>
        </div>
      </div>
    </a>
  );
}


