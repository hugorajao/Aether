'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';

interface FooterProps {
  className?: string;
}

const Footer = forwardRef<HTMLElement, FooterProps>(({ className }, ref) => {
  return (
    <motion.footer
      ref={ref}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(
        'border-t border-void-700 bg-void-950',
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <motion.p
          variants={fadeUp}
          className="font-body text-body-sm text-ivory-400"
        >
          Aether &copy; {new Date().getFullYear()}. A digital art experience.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="flex flex-wrap items-center gap-1 font-mono text-mono-sm text-ivory-400"
        >
          <span>Built with</span>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-ivory-200 underline decoration-void-600 underline-offset-4',
              'transition-colors duration-300 ease-glacial',
              'hover:text-ivory-50 hover:decoration-amber',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950 rounded-sm'
            )}
          >
            Next.js
          </a>
          <span>&middot;</span>
          <a
            href="https://p5js.org"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-ivory-200 underline decoration-void-600 underline-offset-4',
              'transition-colors duration-300 ease-glacial',
              'hover:text-ivory-50 hover:decoration-amber',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950 rounded-sm'
            )}
          >
            p5.js
          </a>
          <span>&middot;</span>
          <a
            href="https://anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-ivory-200 underline decoration-void-600 underline-offset-4',
              'transition-colors duration-300 ease-glacial',
              'hover:text-ivory-50 hover:decoration-amber',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950 rounded-sm'
            )}
          >
            Anthropic
          </a>
        </motion.p>
      </div>
    </motion.footer>
  );
});
Footer.displayName = 'Footer';
export default Footer;
