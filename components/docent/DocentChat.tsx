'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { panelSlide } from '@/lib/motion';
import { useGalleryStore } from '@/stores/gallery';
import DocentMessage from './DocentMessage';
import DocentInput from './DocentInput';

interface DocentChatProps {
  artworkContext?: {
    title: string;
    artistName: string;
    medium?: string;
    artistStatement?: string;
    description?: string;
    tags?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const DocentChat = forwardRef<HTMLDivElement, DocentChatProps>(
  ({ artworkContext, isOpen, onClose, className }, ref) => {
    const {
      docentMessages,
      addDocentMessage,
      clearDocentMessages,
    } = useGalleryStore();

    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
      scrollToBottom();
    }, [docentMessages, scrollToBottom]);

    const handleSend = useCallback(
      async (content: string) => {
        addDocentMessage({ role: 'user', content });

        setIsStreaming(true);
        addDocentMessage({ role: 'assistant', content: '' });

        abortControllerRef.current = new AbortController();

        try {
          const response = await fetch('/api/docent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              history: [...docentMessages, { role: 'user' as const, content }],
              artworkContext: artworkContext ?? undefined,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            throw new Error(`Docent request failed: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream');

          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;

            // Update the last assistant message in the store
            useGalleryStore.setState((state) => {
              const messages = [...state.docentMessages];
              const lastIdx = messages.length - 1;
              if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
                messages[lastIdx] = { role: 'assistant', content: accumulated };
              }
              return { docentMessages: messages };
            });
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          // Update last message with error
          useGalleryStore.setState((state) => {
            const messages = [...state.docentMessages];
            const lastIdx = messages.length - 1;
            if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
              messages[lastIdx] = {
                role: 'assistant',
                content: 'I apologize, but I was unable to respond. Please try again.',
              };
            }
            return { docentMessages: messages };
          });
        } finally {
          setIsStreaming(false);
          abortControllerRef.current = null;
        }
      },
      [docentMessages, artworkContext, addDocentMessage]
    );

    // Abort streaming on unmount or close
    useEffect(() => {
      return () => {
        abortControllerRef.current?.abort();
      };
    }, []);

    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-void-950/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={ref}
              variants={panelSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-label="AI Docent Chat"
              aria-modal="true"
              className={cn(
                'fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-void-900 shadow-2xl sm:w-[400px]',
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-void-700 px-5 py-4">
                <h2 className="font-display text-heading-md text-ivory-50">
                  The Docent
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearDocentMessages}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-ivory-400',
                      'transition-colors duration-200 hover:bg-void-800 hover:text-ivory-100',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber'
                    )}
                    aria-label="Clear conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-ivory-400',
                      'transition-colors duration-200 hover:bg-void-800 hover:text-ivory-100',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber'
                    )}
                    aria-label="Close docent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4"
                aria-live="polite"
                aria-relevant="additions"
              >
                {docentMessages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-dim">
                      <span className="font-display text-display-md text-amber">
                        D
                      </span>
                    </div>
                    <p className="font-display text-heading-md text-ivory-100">
                      Welcome to Aether
                    </p>
                    <p className="mt-2 max-w-[260px] font-body text-body-sm text-ivory-400">
                      {artworkContext
                        ? `Ask me about "${artworkContext.title}" or anything in the collection.`
                        : 'I can discuss any artwork in the collection. What draws your eye?'}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {docentMessages.map((msg, idx) => (
                    <DocentMessage
                      key={idx}
                      message={msg}
                      isStreaming={
                        isStreaming &&
                        idx === docentMessages.length - 1 &&
                        msg.role === 'assistant'
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <DocentInput onSend={handleSend} disabled={isStreaming} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
DocentChat.displayName = 'DocentChat';

export default DocentChat;
