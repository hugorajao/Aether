'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TagListProps {
  tags: string[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  className?: string;
}

const TagList = forwardRef<HTMLDivElement, TagListProps>(
  ({ tags, activeTag, onTagClick, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-2 overflow-x-auto scrollbar-none pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className
        )}
        role="list"
        aria-label="Filter by tag"
      >
        {tags.map((tag) => {
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              role="listitem"
              onClick={() => onTagClick(isActive ? null : tag)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex flex-shrink-0 items-center rounded-full border px-3 py-1 font-body text-caption font-medium transition-colors duration-300 ease-glacial',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
                isActive
                  ? 'border-transparent bg-amber text-void-950'
                  : 'border-void-700 text-ivory-400 hover:border-ivory-400 hover:text-ivory-200'
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    );
  }
);
TagList.displayName = 'TagList';

export default TagList;
