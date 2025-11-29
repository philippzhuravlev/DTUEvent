import type { Page } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { MultiSelectFilter } from './MultiSelectFilter';

// render a multi-select dropdown for pages
function PageFilter({ pages, pageIds, setPageIds }: { pages: Page[]; pageIds: string[]; setPageIds: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Organizer</label>
      <MultiSelectFilter
        pages={pages}
        selectedIds={pageIds}
        onSelectionChange={setPageIds}
      />
    </div>
  );
}

// render a search box with event count
function SearchBox({ query, setQuery, count }: { query: string; setQuery: (v: string) => void; count: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="q" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Search</label>
      <div className="flex items-center gap-2">
        <input
          id="q"
          type="text"
          placeholder="Search events..."
          className="flex-1 input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{count}</span>
      </div>
    </div>
  );
}

// two simple date pickers (from / to) 
function DateRangeFilter({ fromDate, setFromDate, toDate, setToDate }: { fromDate: string; setFromDate: (v: string) => void; toDate: string; setToDate: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date Range</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          className="flex-1 input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          title="Start date"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          className="flex-1 input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          title="End date"
        />
      </div>
    </div>
  );
}

export type SortMode = 'upcoming' | 'newest' | 'all';

// upcoming/newest filter 
function SortFilter({ sortMode, setSortMode }: { sortMode: SortMode; setSortMode: (v: SortMode) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="sort" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Sort</label>
      <select
        id="sort"
        className="input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
        value={sortMode}
        onChange={e => setSortMode(e.target.value as SortMode)}
      >
        <option value="all">All</option>
        <option value="upcoming">Upcoming</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}

// main component combining the filters
export function FilterBar(props: {
  pages: Page[]; // pages to show
  pageIds: string[]; // currently selected organizer ids
  setPageIds: (v: string[]) => void;
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
    <div className="space-y-5">
      <ThemeToggle />
      
      {/* Filter container with responsive grid */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        {/* Row 1: Organizer and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1 lg:col-span-1">
            <PageFilter pages={props.pages} pageIds={props.pageIds} setPageIds={props.setPageIds} />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <SearchBox query={props.query} setQuery={props.setQuery} count={props.count} />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <SortFilter sortMode={props.sortMode} setSortMode={props.setSortMode} />
          </div>
        </div>

        {/* Row 2: Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-4">
          <div className="md:col-span-3 lg:col-span-1">
            <DateRangeFilter
              fromDate={props.fromDate}
              setFromDate={props.setFromDate}
              toDate={props.toDate}
              setToDate={props.setToDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



