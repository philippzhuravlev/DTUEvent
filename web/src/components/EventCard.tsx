import type { Event } from '../types';
import { formatEventStart } from '../utils/eventUtils';
import { useEventCard } from '../hooks/useEventCard';
import { FacebookLinkButton } from './FacebookLinkButton';
import { ChevronDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// small presentational card. Receives one event and renders a link + metadata.
export function EventCard({ event }: { event: Event }) {
  const { isExpanded, toggleExpanded, handleCardClick } = useEventCard();
  // eventCard can now expand and collapse. Controlled via isExpanded and toggleExpanded.
  // functionality is in useEventCard hook.

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [hasMoreDescription, setHasMoreDescription] = useState(false);

  // check if description has more content than shown in collapsed state (exceeds 3 lines)
  useEffect(() => {
    if (!descriptionRef.current || !event.description) {
      setHasMoreDescription(false);
      return;
    }
    // check if the content height exceeds the collapsed height (approximately 3 lines * line-height)
    // line-clamp-3 typically results in ~4.5rem height for text-sm
    const element = descriptionRef.current;
    setHasMoreDescription(element.scrollHeight > element.clientHeight);
  }, [event.description]);

  // detect "new" events:
  const isNew = (() => {
    // avoid `any` by widening the event type to include optional extra fields
    const e = event as Event & Partial<{ isNew: boolean; publishedAt: string; addedAt: string }>;
    if (typeof e.isNew === 'boolean') return e.isNew;
    const createdAt = e.createdAt ?? e.publishedAt ?? e.addedAt;
    if (createdAt) {
      const created = new Date(createdAt).getTime();
      return Number.isFinite(created) && (Date.now() - created) < 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    return false;
  })();

  return (
    // <div> = regular container. Removed <a> to prevent opening facebook link
    <div
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded cursor-pointer"

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

        {/* description section - preview when collapsed, full when expanded */}
        {/* if expanded and has description, show it with size h 32 (about 8 lines). Otherwise show 3 lines */}
        {event.description && (
          <div className="mt-4">
            <div 
              ref={descriptionRef}
              className={`text-sm text-subtle overflow-hidden ${
                isExpanded ? 'max-h-32 line-clamp-6' : 'line-clamp-3'
              }`}
            >
              {event.description}
            </div>
          </div>
        )}

        {/* bottom section: link button and chevron */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <FacebookLinkButton event={event} />
          
          {/* chevron button in bottom right - only show if description can be expanded */}
          {/* chevron means an arrow minus the stick so just the arrowhead */}
          {hasMoreDescription && (
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
          )}
        </div>
      </div>
    </div>
  );
}


