import { useState, useRef, useEffect } from 'react';
import type { Page } from '../types';

export function MultiSelectFilter({
  pages,
  selectedIds,
  onSelectionChange,
}: {
  pages: Page[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (pageId: string) => {
    const updated = selectedIds.includes(pageId)
      ? selectedIds.filter(id => id !== pageId)
      : [...selectedIds, pageId];
    onSelectionChange(updated);
  };

  const handleRemoveTag = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggle(pageId);
  };

  const selectedPages = pages.filter(p => selectedIds.includes(p.id));

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input/Display Area */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center flex-wrap gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 min-h-[44px] hover:border-gray-300 dark:hover:border-gray-600 transition"
      >
        {selectedPages.length > 0 ? (
          selectedPages.map(page => (
            <span
              key={page.id}
              className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
            >
              {page.name}
              <button
                type="button"
                onClick={e => handleRemoveTag(page.id, e)}
                className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 font-bold"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm">Select organizers...</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {pages.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">No organizers available</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {pages.map(page => (
                <label
                  key={page.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition text-primary"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(page.id)}
                    onChange={() => handleToggle(page.id)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="flex-1 text-sm">{page.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
