'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

interface DocentMessageProps {
  message: { role: 'user' | 'assistant'; content: string };
  isStreaming?: boolean;
  className?: string;
}

function splitFirstSentence(text: string): [string, string] {
  const match = text.match(/^(.+?[.!?])\s+([\s\S]*)$/);
  if (match) return [match[1], match[2]];
  return [text, ''];
}

const DocentMessage = forwardRef<HTMLDivElement, DocentMessageProps>(
  ({ message, isStreaming = false, className }, ref) => {
    const isUser = message.role === 'user';

    if (isUser) {
      return (
        <motion.div
          ref={ref}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className={cn('flex justify-end', className)}
        >
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-void-800 px-4 py-3">
            <p className="font-body text-body-md text-ivory-100">
              {message.content}
            </p>
          </div>
        </motion.div>
      );
    }

    const [firstSentence, rest] = splitFirstSentence(message.content);

    return (
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className={cn('flex justify-start gap-3', className)}
      >
        {/* Docent badge */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-dim"
          aria-hidden="true"
        >
          <span className="font-display text-body-sm font-semibold text-amber">
            D
          </span>
        </div>

        <div className="max-w-[85%]">
          <p className="font-body text-body-md text-ivory-100">
            <span className="font-display italic text-ivory-50">
              {firstSentence}
            </span>
            {rest && (
              <>
                {' '}
                {rest}
              </>
            )}
            {isStreaming && (
              <span
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber align-middle"
                aria-label="Generating response"
              />
            )}
          </p>
        </div>
      </motion.div>
    );
  }
);
DocentMessage.displayName = 'DocentMessage';

export default DocentMessage;
