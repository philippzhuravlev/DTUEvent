import type { Page } from '../types';

function PageFilter({ pages, pageId, setPageId }: { pages: Page[]; pageId: string; setPageId: (v: string) => void }) {
  return (
    <>
      <label htmlFor="page" className="text-sm font-medium">Page</label>
      <select
        id="page"
        className="border rounded px-2 py-1"
        value={pageId}
        onChange={e => setPageId(e.target.value)}
      >
        <option value="">All</option>
        {pages.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </>
  );
}

function SearchBox({ query, setQuery, count }: { query: string; setQuery: (v: string) => void; count: number }) {
  return (
    <>
      <label htmlFor="q" className="text-sm font-medium">Search</label>
      <input
        id="q"
        type="text"
        placeholder="Search events"
        className="border rounded px-2 py-1 w-56"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <span className="text-sm text-gray-600">{count} event{count === 1 ? '' : 's'}</span>
    </>
  );
}

function DateRangeFilter({ fromDate, setFromDate, toDate, setToDate }: { fromDate: string; setFromDate: (v: string) => void; toDate: string; setToDate: (v: string) => void }) {
  return (
    <>
      <label htmlFor="from" className="text-sm font-medium">From</label>
      <input
        id="from"
        type="date"
        className="border rounded px-2 py-1"
        value={fromDate}
        onChange={e => setFromDate(e.target.value)}
      />
      <label htmlFor="to" className="text-sm font-medium">To</label>
      <input
        id="to"
        type="date"
        className="border rounded px-2 py-1"
        value={toDate}
        onChange={e => setToDate(e.target.value)}
      />
    </>
  );
}

export function FilterBar(props: {
  pages: Page[];
  pageId: string;
  setPageId: (v: string) => void;
  query: string;
  setQuery: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  count: number;
}) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <PageFilter pages={props.pages} pageId={props.pageId} setPageId={props.setPageId} />
        <SearchBox query={props.query} setQuery={props.setQuery} count={props.count} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DateRangeFilter
          fromDate={props.fromDate}
          setFromDate={props.setFromDate}
          toDate={props.toDate}
          setToDate={props.setToDate}
        />
      </div>
    </>
  );
}
