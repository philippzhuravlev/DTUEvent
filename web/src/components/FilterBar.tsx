import type { Page } from '../types';
import { ThemeToggle } from './ThemeToggle';

// render a select dropdown for pages
function PageFilter({ pages, pageId, setPageId }: { pages: Page[]; pageId: string; setPageId: (v: string) => void }) {
  return (
    <>
      <label htmlFor="page" className="text-sm font-medium text-primary">Organizer</label> {/* label for dropdown */}
      <select
        id="page"
        className="input px-2 py-1 rounded"
        value={pageId}
        onChange={e => setPageId(e.target.value)}
      >
        <option value="">All</option>
        {/* Map the pages array into option elements */}
        {pages.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </>
  );
}

// render a search box with event count
function SearchBox({ query, setQuery, count }: { query: string; setQuery: (v: string) => void; count: number }) {
  {/* Shows how many events match the search and value={query} shows the current text*/ }
  return (
    <>
      <label htmlFor="q" className="text-sm font-medium text-primary">Search</label> {/* label for search box */}
      <input
        id="q"
        type="text"
        placeholder="Search events"
        className="input px-2 py-1 rounded w-56"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {/* Shows how many events match the search */}
      <span className="text-sm text-subtle">{count} event{count === 1 ? '' : 's'}</span>
    </>
  );
}

// two simple date pickers (from / to) 
function DateRangeFilter({ fromDate, setFromDate, toDate, setToDate }: { fromDate: string; setFromDate: (v: string) => void; toDate: string; setToDate: (v: string) => void }) {
  return (
    <>
      <label htmlFor="from" className="text-sm font-medium text-primary">From</label> {/* label for start date */}
      <input
        id="from"
        type="date"
        className="input px-2 py-1 rounded"
        value={fromDate} // shows selected start date
        onChange={e => setFromDate(e.target.value)}
      />
      <label htmlFor="to" className="text-sm font-medium text-primary">To</label>  {/* label for end date */}
      <input
        id="to"
        type="date"
        className="input px-2 py-1 rounded"
        value={toDate} // shows selected end date
        onChange={e => setToDate(e.target.value)} // tell parent when changed
      />
    </>
  );
}

export type SortMode = 'upcoming' | 'newest' | 'all';

// upcoming/newest filter 
function SortFilter({ sortMode, setSortMode }: { sortMode: SortMode; setSortMode: (v: SortMode) => void }) {
  return (
    <>
      <label htmlFor="sort" className="text-sm font-medium text-primary">Sort</label> {/* label for sort dropdown */}
      <select
        id="sort"
        className="input px-2 py-1 rounded"
        value={sortMode} // shows current upcoming or newest selection
        onChange={e => setSortMode(e.target.value as SortMode)} // tell parent when changed
      >
        <option value="all">All</option>
        <option value="upcoming">Upcoming</option> {/* upcoming events first */}
        <option value="newest">Newest</option> {/* newest events first */}
      </select>
    </>
  );
}

// main component combining the filters
export function FilterBar(props: {
  pages: Page[]; // pages to show
  pageId: string; // currently selected page id
  setPageId: (v: string) => void;
  query: string;
  setQuery: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  count: number;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
}) {
  return (
    <>
      <ThemeToggle />
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <PageFilter pages={props.pages} pageId={props.pageId} setPageId={props.setPageId} />  {/* page dropdown */}
        <SearchBox query={props.query} setQuery={props.setQuery} count={props.count} /> {/* search box */}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3"> {/* date range filter */}
        <DateRangeFilter
          fromDate={props.fromDate}
          setFromDate={props.setFromDate}
          toDate={props.toDate}
          setToDate={props.setToDate}
        />
      </div>

      {/* newly added sort filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SortFilter sortMode={props.sortMode} setSortMode={props.setSortMode} />
      </div>
    </>
  );
}



