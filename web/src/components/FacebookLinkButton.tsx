import type { Event } from '../types';
import { getEventUrl } from '../utils/eventUtils';
import { Share2 } from 'lucide-react';
// Wanted to use Facebook icon but itll be deprecated soon
// So using Share2 icon as a generic link/share icon

export function FacebookLinkButton({ event }: { event: Event }) {
  return (
    // a is technically a link element but with React we can style it as a button
    <a
      href={getEventUrl(event.id, event.eventURL)}
      target="_blank"           // opens in new tab
      rel="noopener noreferrer" // opens in new tab (securily this time)
      onClick={(e) => {
        e.stopPropagation();    // opens but prevent card click from triggering just in case
      }}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
    >
      <Share2 className="w-4 h-4" />
      Link to Facebook
    </a>
  );
}
