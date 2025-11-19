import { useEffect, useState } from 'react'; // React imports
import { FilterBar } from '../components/FilterBar';
import { EventList } from '../components/EventList';
import { getEvents, getPages } from '../services/dal';
import { buildFacebookLoginUrl } from '../services/facebook';
import { parseDateOnly, startOfDayMs, endOfDayMs } from '../utils/dateUtils';
import type { Event as EventType, Page } from '../types';

export function MainPage() { // function for main page (can be used in other files bc of export)
  const [pages, setPages] = useState([] as Page[]); // a variable that holds an array of pages
  const [events, setEvents] = useState([] as EventType[]); // a variable that holds an array of events
  const [loading, setLoading] = useState(true); // loading is by defualt true until data is loaded
  const [error, setError] = useState<string>(''); // errors are empty by default until an error occurs

  // runs when component is first rendered
  useEffect(() => {
    let cancelled = false; // to avoid setting state on unmounted component
    (async () => { // function that runs straight away
      try {
        setLoading(true); // loading is set to true when data fetching starts
        const [page, event] = await Promise.all([getPages(), getEvents()]); // fetch pages and events in parallel
        if (cancelled) return;
        setPages(page);
        setEvents(event);
      } catch (err) { // error handling
        if (cancelled) return;
        const message = (err instanceof Error && err.message) ? err.message : 'Failed to load data';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false); // loading is false when data fetching ends
      }
    })();
    return () => { cancelled = true };
  }, []); // [] at the end means it only runs once when component is mounted

  const [pageId, setPageId] = useState<string>('');
  const filteredByPage = pageId ? events.filter(e => e.pageId === pageId) : events;

  const [query, setQuery] = useState<string>(''); // react variable with default empty string
  const [debouncedQuery, setDebouncedQuery] = useState<string>(''); // only update after user stops typing for 250ms
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase()); // makes query lowercase and removes whitespace
    }, 250); // 250ms delay
    return () => clearTimeout(id);
  }, [query]); // runs whenever query changes

  const textFiltered = debouncedQuery // variable created if debouncedQuery is not empty
    ? filteredByPage.filter(event => {
      const haystack = (
        (event.title || '') + ' ' +
        (event.description || '') + ' ' +
        (event.place?.name || '')
      ).toLowerCase();
      return haystack.includes(debouncedQuery); // if haystack includes the debouncedQuery then include it in the result
    })
    : filteredByPage; // if there is no debouncedQuery then return all events from filteredByPage

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fromObj = parseDateOnly(fromDate); // turn fromDate string into date object
  const toObj = parseDateOnly(toDate); // turn toDate string into date object
  const invalidRange = !!(fromObj && toObj && toObj < fromObj); // check if range is invalid
  const effectiveToObj = invalidRange ? undefined : toObj; // if invalid then ignore toDate

  const dateFiltered = textFiltered.filter(event => {
    const eventMs = new Date(event.startTime).getTime(); // get timestamp of event start time
    if (fromObj && eventMs < startOfDayMs(fromObj)) return false; // if fromdate is after event start then exclude
    if (effectiveToObj && eventMs > endOfDayMs(effectiveToObj)) return false; // if todate is before event start then exclude
    return true;
  });

  const list = [...dateFiltered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const count = list.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">DTU Events</h1>
      </header>

      {/* this is where filterbar component receives data and functions */}
      <FilterBar // renders the filter bar component 
        pages={pages}
        pageId={pageId}
        setPageId={setPageId}
        query={query}
        setQuery={setQuery}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        count={count}
      />

      // conditional rendering
      {loading && <p className="text-sm text-gray-600 mb-2">Loading…</p>}  {/*if loading is true then show loading text*/}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>} {/* if there is an error then show error message */}
      {invalidRange && (
        <p className="text-xs text-red-600 mb-2">End date is before start date. Showing results up to any end date.</p>
      )} {/* if date range is invalid then show warning message */}

      <EventList list={list} /> {/* the final list of events shown after all filters have been applied */}

      <div className="mb-4">
        <a
          href={buildFacebookLoginUrl()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Connect Facebook Page
        </a>
      </div>
    </div>
  );
}
