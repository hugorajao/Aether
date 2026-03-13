'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glacialEase } from '@/lib/motion';
import { Button } from '@/components/ui/button';

interface FilterToolbarProps {
  filter: string;
  onFilterChange: (f: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  className?: string;
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'generative', label: 'Permanent Collection' },
  { value: 'community', label: 'Community' },
] as const;

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A\u2013Z' },
] as const;

const FilterToolbar = forwardRef<HTMLDivElement, FilterToolbarProps>(
  ({ filter, onFilterChange, sortBy, onSortChange, searchQuery, onSearchChange, className }, ref) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Focus search input when opened
    useEffect(() => {
      if (searchOpen) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
    }, [searchOpen]);

    // Close sort dropdown on outside click
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
          setSortOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const currentSort = sortOptions.find((s) => s.value === sortBy) || sortOptions[0];

    return (
      <div
        ref={ref}
        className={cn(
          'sticky top-16 z-30 border-b border-void-700/50 bg-void-950/80 backdrop-blur-xl',
          className
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          {/* Filter pills */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Filter artworks">
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 font-body text-body-sm transition-colors duration-300 ease-glacial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
                  filter === f.value
                    ? 'bg-amber text-void-950 font-medium'
                    : 'text-ivory-400 hover:bg-void-800 hover:text-ivory-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div ref={sortRef} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-ivory-400 hover:text-ivory-200"
                onClick={() => setSortOpen(!sortOpen)}
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
                aria-label={`Sort by: ${currentSort.label}`}
              >
                {currentSort.label}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-300 ease-glacial',
                    sortOpen && 'rotate-180'
                  )}
                />
              </Button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.2,
                      ease: glacialEase,
                    }}
                    className="absolute right-0 top-full mt-1 min-w-[140px] overflow-hidden rounded-md border border-void-700 bg-void-850 shadow-xl"
                    role="listbox"
                    aria-label="Sort options"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        role="option"
                        aria-selected={sortBy === option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center px-3 py-2 text-left font-body text-body-sm transition-colors duration-200',
                          sortBy === option.value
                            ? 'bg-amber-dim text-amber'
                            : 'text-ivory-300 hover:bg-void-800 hover:text-ivory-100'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expandable search */}
            <div className="flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: glacialEase,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search artworks..."
                        className="h-9 w-full rounded-md border border-void-700 bg-void-900 px-3 pr-8 font-body text-body-sm text-ivory-50 placeholder:text-ivory-400 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
                        aria-label="Search artworks"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => onSearchChange('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-ivory-400 hover:text-ivory-200"
                          aria-label="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-ivory-400 hover:text-ivory-200"
                onClick={() => {
                  if (searchOpen && !searchQuery) {
                    setSearchOpen(false);
                  } else if (!searchOpen) {
                    setSearchOpen(true);
                  }
                }}
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
FilterToolbar.displayName = 'FilterToolbar';

export default FilterToolbar;
