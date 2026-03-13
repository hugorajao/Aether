'use client';

import { forwardRef, useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocentInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

const DocentInput = forwardRef<HTMLDivElement, DocentInputProps>(
  ({ onSend, disabled = false, className }, ref) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = 'auto';
      const lineHeight = 24;
      const maxHeight = lineHeight * 4;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }, []);

    const handleSend = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, [value, disabled, onSend]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-end gap-2 border-t border-void-700 bg-void-900 px-4 py-3',
          className
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask the docent about this piece..."
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent font-body text-body-md text-ivory-100',
            'placeholder:text-ivory-400 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label="Message the docent"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            'bg-amber text-void-950 transition-colors duration-300 ease-glacial',
            'hover:bg-amber-light',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
            'disabled:cursor-not-allowed disabled:opacity-40'
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
DocentInput.displayName = 'DocentInput';

export default DocentInput;
