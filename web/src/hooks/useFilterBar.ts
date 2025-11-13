import { useEffect, useState } from 'react';
import { parseDateOnly, startOfDayMs, endOfDayMs } from '../utils/dateUtils';
import type { Event as EventType } from '../types';

export function useFilterBar(events: EventType[]) {
  // page filter
  const [pageId, setPageId] = useState<string>('');

  // text search
  // debounce = wait for user to stop typing
  // () => is shorthand for making a quick new function w/ void return
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  // date range
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // apply filters
  const filteredByPage = pageId ? events.filter(e => e.pageId === pageId) : events;

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

  return {
    pageId,
    setPageId,
    query,
    setQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    list,
    count: list.length,
    invalidRange,
  };
}
