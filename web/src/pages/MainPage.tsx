import { useEffect, useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { EventList } from '../components/EventList';
import { getEvents, getPages } from '../services/dal';
import { buildFacebookLoginUrl } from '../services/facebook';
import { parseDateOnly, startOfDayMs, endOfDayMs } from '../utils/dateUtils';
import type { Event as EventType, Page } from '../types';

export function MainPage() {
  const [pages, setPages] = useState([] as Page[]);
  const [events, setEvents] = useState([] as EventType[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [page, event] = await Promise.all([getPages(), getEvents()]);
        if (cancelled) return;
        setPages(page);
        setEvents(event);
      } catch (err) {
        if (cancelled) return;
        const message = (err instanceof Error && err.message) ? err.message : 'Failed to load data';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const [pageId, setPageId] = useState<string>('');
  const filteredByPage = pageId ? events.filter(e => e.pageId === pageId) : events;

  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const textFiltered = debouncedQuery
    ? filteredByPage.filter(event => {
        const haystack = (
          (event.title || '') + ' ' +
          (event.description || '') + ' ' +
          (event.place?.name || '')
        ).toLowerCase();
        return haystack.includes(debouncedQuery);
      })
    : filteredByPage;

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fromObj = parseDateOnly(fromDate);
  const toObj = parseDateOnly(toDate);
  const invalidRange = !!(fromObj && toObj && toObj < fromObj);
  const effectiveToObj = invalidRange ? undefined : toObj;

  const dateFiltered = textFiltered.filter(event => {
    const eventMs = new Date(event.startTime).getTime();
    if (fromObj && eventMs < startOfDayMs(fromObj)) return false;
    if (effectiveToObj && eventMs > endOfDayMs(effectiveToObj)) return false;
    return true;
  });

  const list = [...dateFiltered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const count = list.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">DTU Events</h1>
      </header>

      <FilterBar
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

      {loading && <p className="text-sm text-gray-600 mb-2">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {invalidRange && (
        <p className="text-xs text-red-600 mb-2">End date is before start date. Showing results up to any end date.</p>
      )}

      <EventList list={list} />

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
